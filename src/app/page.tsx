"use client";

import { Loader } from "@/components/ui/Loader";
import { TimelineUI } from "@/components/ui/TimelineUI";
import { Scene } from "@/components/canvas/Scene";
import { MapPoints } from "@/components/canvas/MapPoints";
import { LightingHalo } from "@/components/canvas/LightingHalo";
import { useTimelineScroll } from "@/hooks/useTimelineScroll";
import { usePointData } from "@/hooks/usePointData";
import { CELEBRITIES_DATA } from "@/utils/preloader";

export default function HomePage() {
  const { progress, isLoaded, mapData, initialBust } = usePointData();
  const { currentIndex, nextIndex, morphProgress, mapToBustMorph } =
    useTimelineScroll(CELEBRITIES_DATA.length);

  return (
    <main className="relative min-h-[500vh] bg-[#050b08]">
      
      <Loader progress={progress} isLoaded={isLoaded} />
      
      <LightingHalo />
     
      {isLoaded && mapData && initialBust && (
        <Scene>
          {(scene) => (
            <MapPoints
              scene={scene}
              mapData={mapData}
              initialBustData={initialBust}
              mapToBustMorph={mapToBustMorph}
              currentIndex={currentIndex}
              nextIndex={nextIndex}
              morphProgress={morphProgress}
            />
          )}
        </Scene>
      )}

      <TimelineUI
        currentIndex={currentIndex}
        mapToBustMorph={mapToBustMorph}
      />
    </main>
  );
}
