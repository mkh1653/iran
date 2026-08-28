"use client";

import React, { useEffect, useRef, useState } from "react";
import { CELEBRITIES_DATA } from "@/utils/preloader";
import gsap from "gsap";

interface TimelineUIProps {
  currentIndex: number;
  mapToBustMorph: number;
  isVisible: boolean;
}

const IRAN_INFO = {
  name: "ایران",
  title: "سرزمین فرهنگ، دانش و تمدن",
  description:
    "ایران سرزمینی با تاریخی هزاران ساله است؛ زادگاه اندیشه‌ها، دانشمندان و هنرمندانی که فرهنگ جهان را غنی کرده‌اند.",
  birth: "پیشینه: بیش از هفت هزار سال",
  death: "تمدن زنده و ماندگار",
};

export const TimelineUI: React.FC<TimelineUIProps> = ({
  currentIndex,
  mapToBustMorph,
  isVisible,
}) => {
  const currentCeleb = CELEBRITIES_DATA[currentIndex];
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const isIran = mapToBustMorph < 0.55;
  const desiredContentKey = isIran ? "iran" : currentCeleb?.id;
  const [displayedContentKey, setDisplayedContentKey] = useState("iran");
  const displayedCeleb = CELEBRITIES_DATA.find(
    (celebrity) => celebrity.id === displayedContentKey,
  );
  const content = displayedContentKey === "iran" ? IRAN_INFO : displayedCeleb;

  useEffect(() => {
    if (!containerRef.current || !isVisible) return;

    gsap.fromTo(
      containerRef.current,
      { autoAlpha: 0, y: 28 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 1.4,
        ease: "power3.out",
      },
    );
  }, [isVisible]);

  useEffect(() => {
    if (!contentRef.current || !isVisible || !desiredContentKey) return;

    const timeline = gsap.timeline();
    timeline.to(contentRef.current, {
      autoAlpha: 0,
      y: 12,
      duration: 0.85,
      ease: "power1.inOut",
      overwrite: "auto",
      onComplete: () => setDisplayedContentKey(desiredContentKey),
    });

    return () => {
      timeline.kill();
    };
  }, [desiredContentKey, isVisible]);

  useEffect(() => {
    if (!contentRef.current || !isVisible) return;

    const timeline = gsap.fromTo(
      contentRef.current,
      { autoAlpha: 0, y: -12 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 1.25,
        ease: "power2.inOut",
        overwrite: "auto",
      },
    );

    return () => {
      timeline.kill();
    };
  }, [displayedContentKey, isVisible]);

  if (!content) return null;

  return (
    <div
      ref={containerRef}
      className='fixed top-0 right-0 h-dvh w-dvw p-10 z-10 flex flex-col justify-between'
      style={{
        opacity: 0,
        visibility: isVisible ? "visible" : "hidden",
        background:
          "linear-gradient(to left, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0.65) 37%, rgba(0, 0, 0, 0.38) 58%, rgba(0, 0, 0, 0.16) 68%, rgba(0, 0, 0, 0) 100%)",
      }}>
      <header className='flex items-center justify-between'>
        <div className='flex items-center gap-3 font-semibold'>
          <span className='h-1.5 w-1.5 rounded-full bg-secondary animate-pulse'></span>
          <span className='text-xs tracking-[0.35em] text-primary-100'>
            IRAN · 3D
          </span>
        </div>
      </header>
      <div ref={contentRef} className='max-w-xl md: mr-2'>
        <h1 className='text-8xl leading-tight font-black'>{content.name}</h1>
        <h2 className='text-primary-100 text-xl font-semibold mt-6'>
          {content.title}
        </h2>
        <p className='mt-6 leading-8'>{content.description}</p>
        <div className='divider'></div>
        <div className='flex items-center justify-between mt-4'>
          <div className='flex flex-col gap-2'>
            <span className='text-secondary text-sm font-medium'>تولد:</span>
            <span className='text-sm font-medium mr-2'>{content.birth}</span>
          </div>
          <div className='flex flex-col gap-2'>
            <span className='text-secondary text-sm font-medium'>وفات:</span>
            <span className='text-sm font-medium mr-2'>{content.death}</span>
          </div>
        </div>
        <button className='group flex items-center gap-1.5 mt-12 rounded-full border border-primary-200 text-primary-200 text-sm font-medium px-6 py-2 cursor-pointer'>
          <svg xmlns='http://www.w3.org/2000/svg' className='w-3 h-3 fill-green-400 transition-all duration-300 group-hover:translate-x-0.5' viewBox='0 0 640 640'>
            <path d='M598.6 342.6C611.1 330.1 611.1 309.8 598.6 297.3L470.6 169.3C458.1 156.8 437.8 156.8 425.3 169.3C412.8 181.8 412.8 202.1 425.3 214.6L498.7 288L64 288C46.3 288 32 302.3 32 320C32 337.7 46.3 352 64 352L498.7 352L425.3 425.4C412.8 437.9 412.8 458.2 425.3 470.7C437.8 483.2 458.1 483.2 470.6 470.7L598.6 342.7z' />
          </svg>
          <span>اطلاعات بیشتر</span>
        </button>
      </div>
      <footer className='text-primary-100 text-sm font-medium'>
        <div
          className='flex items-center justify-between text-xs font-medium text-white/50'
          dir='ltr'>
          <span>© 2024 Iran 3D</span>
          <span>All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
};
