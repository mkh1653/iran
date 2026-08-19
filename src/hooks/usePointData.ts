"use client";

import { useState, useEffect } from "react";
import { MapPointData, BustPointData } from "@/utils/imageProcessor";
import { loadInitialAssets, CELEBRITIES_DATA } from "@/utils/preloader";

export function usePointData() {
  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [mapData, setMapData] = useState<MapPointData | null>(null);
  const [initialBust, setInitialBust] = useState<BustPointData | null>(null);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;

    loadInitialAssets("/dem.jpg", CELEBRITIES_DATA[0].imageUrl, isMobile, (p) =>
      setProgress(p),
    ).then(({ mapData, firstBustData }) => {
      setMapData(mapData);
      setInitialBust(firstBustData);
      setIsLoaded(true);
    });
  }, []);

  return { progress, isLoaded, mapData, initialBust };
}
