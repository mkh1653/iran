"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { gsap } from "gsap";
import { MapPointData, BustPointData } from "@/utils/imageProcessor";
import { preloadNextBust } from "@/utils/preloader";

// @ts-ignore
import { vertexShader } from "@/shaders/vertexShader.glsl";
// @ts-ignore
import { fragmentShader } from "@/shaders/fragmentShader.glsl";

interface MapPointsProps {
  scene: THREE.Scene;
  mapData: MapPointData;
  initialBustData: BustPointData;
  mapToBustMorph: number;
  currentIndex: number;
  nextIndex: number;
  morphProgress: number;
}

export const MapPoints: React.FC<MapPointsProps> = ({
  scene,
  mapData,
  initialBustData,
  mapToBustMorph,
  currentIndex,
  nextIndex,
  morphProgress,
}) => {
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const geometryRef = useRef<THREE.BufferGeometry | null>(null);
  const currentBustRef = useRef<BustPointData>(initialBustData);
  const nextBustRef = useRef<BustPointData | null>(null);
  const loadedIndexRef = useRef<number>(0);

  useEffect(() => {
    // create geometry and material for points
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(mapData.positions, 3),
    );
    geometry.setAttribute("aH", new THREE.BufferAttribute(mapData.heights, 1));
    geometry.setAttribute("aSeed", new THREE.BufferAttribute(mapData.seeds, 1));

    geometry.setAttribute(
      "aTB",
      new THREE.BufferAttribute(initialBustData.targets, 3),
    );
    geometry.setAttribute(
      "aB",
      new THREE.BufferAttribute(initialBustData.brightness, 1),
    );

    geometryRef.current = geometry;

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uSize: { value: 2.6 },
        uMorph: { value: 0 },
        uR: { value: 0 },
      },
      transparent: true,
      depthWrite: false,
    });

    materialRef.current = material;
    const pointsMesh = new THREE.Points(geometry, material);
    scene.add(pointsMesh);

    // start animation
    gsap.to(material.uniforms.uR, {
      value: 1,
      duration: 2.2,
      ease: "power3.out",
    });

    return () => {
      scene.remove(pointsMesh);
      geometry.dispose();
      material.dispose();
    };
  }, [scene, mapData, initialBustData]);

  // update uMorph
  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uMorph.value = mapToBustMorph;
    }
  }, [mapToBustMorph]);

  // preload next bust data and animate morphing between current and next bust
  useEffect(() => {
    if (!geometryRef.current) return;

    if (currentIndex !== loadedIndexRef.current) {
      loadedIndexRef.current = currentIndex;
      preloadNextBust(nextIndex, mapData.count).then((nextData) => {
        if (nextData) nextBustRef.current = nextData;
      });
    }

    if (nextBustRef.current && morphProgress > 0) {
      const targetAttr = geometryRef.current.attributes
        .aTB as THREE.BufferAttribute;
      const currentTargets = currentBustRef.current.targets;
      const nextTargets = nextBustRef.current.targets;

      for (let i = 0; i < currentTargets.length; i++) {
        targetAttr.array[i] =
          currentTargets[i] +
          (nextTargets[i] - currentTargets[i]) * morphProgress;
      }
      targetAttr.needsUpdate = true;
    }
  }, [currentIndex, nextIndex, morphProgress, mapData.count]);

  return null;
};
