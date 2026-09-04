"use client";

import { useEffect, useState } from "react";

export interface TimelineState {
  currentIndex: number;
  nextIndex: number;
  morphProgress: number;
  mapToBustMorph: number;
}

export function useTimelineScroll(totalCelebrities: number, enabled = true) {
  const [state, setState] = useState<TimelineState>({
    currentIndex: 0,
    nextIndex: 1,
    morphProgress: 0,
    mapToBustMorph: 0,
  });

  useEffect(() => {
    if (!enabled) return;

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

      const sectionProgress = rawIndex - Math.floor(rawIndex);
      const morphStart = 0.25;
      const morphEnd = 0.65;

      let morphProgress = 0;

      if (sectionProgress < morphStart) {
        morphProgress = 0;
      } else if (sectionProgress < morphEnd) {
        morphProgress =
          (sectionProgress - morphStart) / (morphEnd - morphStart);
      } else {
        morphProgress = 1;
      }

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
  }, [enabled, totalCelebrities]);

  return state;
}
