"use client";

import React from "react";
import { CELEBRITIES_DATA } from "@/utils/preloader";

interface TimelineUIProps {
  currentIndex: number;
  mapToBustMorph: number;
}

export const TimelineUI: React.FC<TimelineUIProps> = ({
  currentIndex,
  mapToBustMorph,
}) => {
  const currentCeleb = CELEBRITIES_DATA[currentIndex];

  if (!currentCeleb) return null;

  return (
    <div
      className='fixed bottom-12 right-8 z-10 max-w-md text-white transition-opacity duration-500 dir-rtl font-serif'
      style={{ opacity: mapToBustMorph }}>
      <div className='border-r-2 border-emerald-500 pr-4 space-y-2 bg-black/40 backdrop-blur-md p-6 rounded-l-2xl border-y border-l border-emerald-900/30'>
        <span className='text-xs text-emerald-400 font-mono tracking-wider block'>
          {currentCeleb.era}
        </span>
        <h1 className='text-3xl font-bold text-emerald-100'>
          {currentCeleb.name}
        </h1>
        <p className='text-sm text-emerald-200/80 leading-relaxed'>
          {currentCeleb.title}
        </p>
      </div>
    </div>
  );
};
