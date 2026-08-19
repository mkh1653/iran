// src/hooks/useTimelineScroll.ts
"use client";

import { useEffect, useState } from "react";

export interface TimelineState {
  currentIndex: number;
  nextIndex: number;
  morphProgress: number;
  mapToBustMorph: number;
}

export function useTimelineScroll(totalCelebrities: number) {
  const [state, setState] = useState<TimelineState>({
    currentIndex: 0,
    nextIndex: 1,
    morphProgress: 0,
    mapToBustMorph: 0,
  });

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowH = window.innerHeight;

      // map to bust morph progress
      const mapMorph = Math.min(1, Math.max(0, scrollY / windowH));

      // celebrity sections timeline
      const timelineScroll = Math.max(0, scrollY - windowH);
      const sectionHeight = windowH * 1.5; // length of each celebrity section in the timeline scroll

      const rawIndex = timelineScroll / sectionHeight;
      const currentIndex = Math.min(totalCelebrities - 1, Math.floor(rawIndex));
      const nextIndex = Math.min(totalCelebrities - 1, currentIndex + 1);
      const morphProgress = rawIndex - Math.floor(rawIndex);

      setState({
        currentIndex,
        nextIndex,
        morphProgress:
          currentIndex === totalCelebrities - 1 ? 0 : morphProgress,
        mapToBustMorph: mapMorph,
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [totalCelebrities]);

  return state;
}
