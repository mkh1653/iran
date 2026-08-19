"use client";

import React from "react";

export const LightingHalo: React.FC = () => {
  return (
    <div className='fixed inset-0 pointer-events-none z-0 overflow-hidden'>
      <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[140px] pointer-events-none' />

      <div className='absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-emerald-400/5 rounded-full blur-[90px] pointer-events-none' />
    </div>
  );
};
