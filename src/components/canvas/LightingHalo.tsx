"use client";

import React from "react";

export const LightingHalo: React.FC = () => {
  return (
    <>
      
      <div
        aria-hidden='true'
        className='fixed inset-0 pointer-events-none'
        style={{
          background:
            "radial-gradient(ellipse 72% 78% at 0% 0%, rgba(91, 214, 145, 0.1) 0%, rgba(62, 164, 105, 0.065) 24%, rgba(35, 103, 68, 0.03) 48%, rgba(5, 11, 8, 0) 82%)",
          mixBlendMode: "screen",
          zIndex: 100,
        }}
      />
    </>
  );
};
