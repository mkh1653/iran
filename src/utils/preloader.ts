import { Celebrity } from "@/types";
import {
  loadImageWithProgress,
  generateMapPoints,
  generateBustPoints,
  MapPointData,
  BustPointData,
} from "./imageProcessor";

export const CELEBRITIES_DATA: Celebrity[] = [
  {
    id: "avicenna",
    name: "ابوعلی سینا",
    title: "پزشک، فیلسوف و دانشمند",
    era: "۳۷۰ - ۴۲۸ هجری قمری",
    imageUrl: "/bust-avicenna.png",
  },
  // {
  //   id: "khayyam",
  //   name: "حکیم عمر خیام",
  //   title: "ریاضیدان، منجم و شاعر",
  //   era: "۴۳۹ - ۵۱۷ هجری قمری",
  //   imageUrl: "/bust-khayyam.jpg",
  // },
  // {
  //   id: "ferdowsi",
  //   name: "ابوالقاسم فردوسی",
  //   title: "حماسه‌سرای بزرگ ایران",
  //   era: "۳۲۹ - ۴۱۱ هجری قمری",
  //   imageUrl: "/bust-ferdowsi.jpg",
  // },
];

// cache for processed bust points to avoid reprocessing
const processedBustsCache = new Map<string, BustPointData>();

/**
 * first load DEM and first bust image, then process them to generate map points and bust points
 * @param demUrl URL of the DEM image
 * @param firstBustUrl URL of the first bust image
 */
export async function loadInitialAssets(
  demUrl: string,
  firstBustUrl: string,
  isMobile: boolean,
  onProgress: (percent: number) => void,
): Promise<{ mapData: MapPointData; firstBustData: BustPointData }> {
  let demProgress = 0;
  let bustProgress = 0;

  const updateOverallProgress = () => {
    const total = Math.round((demProgress + bustProgress) / 2);
    onProgress(total);
  };

  // first load the DEM and first bust image with actual progress percentages
  const [demImg, bustImg] = await Promise.all([
    loadImageWithProgress(demUrl, (p) => {
      demProgress = p;
      updateOverallProgress();
    }),
    loadImageWithProgress(firstBustUrl, (p) => {
      bustProgress = p;
      updateOverallProgress();
    }),
  ]);

  // process the algorithms
  const mapData = generateMapPoints(demImg, isMobile);
  const firstBustData = generateBustPoints(bustImg, mapData.count);

  return { mapData, firstBustData };
}

/**
 * smart preloader: only preloads the next bust when the user gets close to bust N
 */
export async function preloadNextBust(
  celebrityIndex: number,
  pointCount: number,
): Promise<BustPointData | null> {
  if (celebrityIndex >= CELEBRITIES_DATA.length) return null;

  const celeb = CELEBRITIES_DATA[celebrityIndex];

  // check if the bust data is already cached
  if (processedBustsCache.has(celeb.id)) {
    return processedBustsCache.get(celeb.id)!;
  }

  try {
    const img = await loadImageWithProgress(celeb.imageUrl);
    const bustData = generateBustPoints(img, pointCount);

    // save in cache
    processedBustsCache.set(celeb.id, bustData);
    return bustData;
  } catch (error) {
    console.error(`Error preloading bust for ${celeb.name}:`, error);
    return null;
  }
}
