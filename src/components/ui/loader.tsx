"use client";
import React from "react";

interface LoaderProps {
  progress: number;
  isLoaded: boolean;
}

export const Loader: React.FC<LoaderProps> = ({ progress, isLoaded }) => {
  if (isLoaded) return null;

  return (
    <div className='fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050b08] text-white transition-opacity duration-700 dir-rtl'>
      <div className='w-64 max-w-[80vw] space-y-4 text-center'>
        <h2 className='text-xl font-bold tracking-widest text-emerald-400 font-serif'>
          میراث مشاهیر ایران
        </h2>

        <div className='relative h-1.5 w-full overflow-hidden rounded-full bg-emerald-950/60 border border-emerald-800/40'>
          <div
            className='h-full bg-gradient-to-r from-emerald-600 via-emerald-400 to-white transition-all duration-300 ease-out shadow-[0_0_12px_rgba(52,211,153,0.5)]'
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className='flex justify-between text-xs text-emerald-300/70 font-mono'>
          <span>در حال پردازش نقشه و ذرات...</span>
          <span>{progress}%</span>
        </div>
      </div>
    </div>
  );
};
