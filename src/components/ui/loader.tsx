"use client";
import React from "react";
import { toPersianDigits } from "@/utils/helpers";
interface LoaderProps {
  progress: number;
  isLoaded: boolean;
}

export const Loader: React.FC<LoaderProps> = ({ progress, isLoaded }) => {
  if (isLoaded) return null;

  return (
    <div className='loader transition-opacity duration-700'>
      <div className='w-80 max-w-[80vw] space-y-4 text-center'>
        <h2 className='text-sm tracking-widest text-primary'>
          لطفا چند لحظه صبر کنید.
        </h2>

        <div
          className='relative h-1 w-full overflow-hidden rounded-full mb-3'
          dir='ltr'>
          <div className='absolute left-0 top-0 right-0 bottom-0 bg-primary opacity-35'></div>
          <div
            className='h-full transition-all duration-300 ease-out bg-primary'
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className='flex justify-center text-xs text-primary fill-green-400'>
          <div className="flex flex-row-reverse gap-1 items-center">
            <span className="font-black">{toPersianDigits(progress)}</span>
            <svg className="w-2.5 h-2.5" xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 640'>
              <path d='M288 192C288 139 245 96 192 96C139 96 96 139 96 192C96 245 139 288 192 288C245 288 288 245 288 192zM544 448C544 395 501 352 448 352C395 352 352 395 352 448C352 501 395 544 448 544C501 544 544 501 544 448zM534.6 150.6C547.1 138.1 547.1 117.8 534.6 105.3C522.1 92.8 501.8 92.8 489.3 105.3L105.3 489.3C92.8 501.8 92.8 522.1 105.3 534.6C117.8 547.1 138.1 547.1 150.6 534.6L534.6 150.6z' />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
