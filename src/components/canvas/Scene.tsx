"use client";

import React from "react";
import { Canvas } from "@react-three/fiber";
import { MapPointData } from "@/utils/imageProcessor";
import { CameraRig } from "./CameraRig";

interface SceneProps {
  mapToBustMorph: number;
  mapData: MapPointData;
  onIntroComplete: () => void;
  children: React.ReactNode;
}

export const Scene: React.FC<SceneProps> = ({
  mapToBustMorph,
  mapData,
  onIntroComplete,
  children,
}) => {
  return (
    <div className='fixed inset-0 z-0 pointer-events-none bg-[#050b08]'>
      <Canvas
        className='pointer-events-none'
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
        }}
        camera={{
          position: [0, 160, 0],
          fov: 42,
          near: 0.1,
          far: 400,
        }}
        dpr={[1, 2]}
        gl={{ alpha: false, antialias: true }}
        onCreated={({ gl }) => gl.setClearColor("#050b08", 1)}>
        <CameraRig
          mapToBustMorph={mapToBustMorph}
          mapData={mapData}
          onIntroComplete={onIntroComplete}
        />
        <group>{children}</group>
      </Canvas>
    </div>
  );
};
