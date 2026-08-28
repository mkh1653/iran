"use client";

import { useEffect, useState } from "react";
import { Loader } from "@/components/ui/Loader";
import { TimelineUI } from "@/components/ui/TimelineUI";
import { Scene } from "@/components/canvas/Scene";
import { MapPoints } from "@/components/canvas/MapPoints";
import { LightingHalo } from "@/components/canvas/LightingHalo";
import { useTimelineScroll } from "@/hooks/useTimelineScroll";
import { usePointData } from "@/hooks/usePointData";
import { CELEBRITIES_DATA } from "@/utils/preloader";

export default function HomePage() {
  const [introComplete, setIntroComplete] = useState(false);
  const { progress, isLoaded, mapData, initialBust } = usePointData();
  const { currentIndex, nextIndex, morphProgress, mapToBustMorph } =
    useTimelineScroll(CELEBRITIES_DATA.length, introComplete);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [isLoaded]);

  useEffect(() => {
    if (!isLoaded || introComplete) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isLoaded, introComplete]);

  return (
    <main className='relative min-h-[500vh]'>
      <Loader progress={progress} isLoaded={isLoaded} />
      <LightingHalo />

      {isLoaded && mapData && initialBust && (
        <Scene
          mapToBustMorph={mapToBustMorph}
          mapData={mapData}
          onIntroComplete={() => setIntroComplete(true)}>
          <MapPoints
            mapData={mapData}
            initialBustData={initialBust}
            mapToBustMorph={mapToBustMorph}
            currentIndex={currentIndex}
            nextIndex={nextIndex}
            morphProgress={morphProgress}
          />
        </Scene>
      )}

      <TimelineUI
        currentIndex={currentIndex}
        mapToBustMorph={mapToBustMorph}
        isVisible={introComplete}
      />
    </main>
  );
}
