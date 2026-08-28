"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { gsap } from "gsap";
import { MapPointData, BustPointData } from "@/utils/imageProcessor";
import { preloadNextBust } from "@/utils/preloader";

import vertexShader from "@/shaders/vertexShader.glsl";
import fragmentShader from "@/shaders/fragmentShader.glsl";

interface MapPointsProps {
  mapData: MapPointData;
  initialBustData: BustPointData;
  mapToBustMorph: number;
  currentIndex: number;
  nextIndex: number;
  morphProgress: number;
}

export const MapPoints: React.FC<MapPointsProps> = ({
  mapData,
  initialBustData,
  mapToBustMorph,
  currentIndex,
  nextIndex,
  morphProgress,
}) => {
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const morphStateRef = useRef({ value: 0 });
  const currentBustRef = useRef<BustPointData>(initialBustData);
  const nextBustRef = useRef<BustPointData | null>(null);
  const loadedIndexRef = useRef<number>(0);

  const geometry = useMemo(() => {
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

    return geometry;
  }, [mapData, initialBustData]);

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uSize: { value: 1.9 },
        uMorph: { value: 0 },
        uR: { value: 0 },
      },
      transparent: true,
      depthWrite: false,
    });
  }, []);

  useEffect(() => {
    materialRef.current = material;

    const revealTween = gsap.to(material.uniforms.uR, {
      value: 1,
      duration: 8,
      ease: "power3.out",
    });

    return () => {
      revealTween.kill();
      materialRef.current = null;
    };
  }, [material]);

  useFrame((_, delta) => {
    material.uniforms.uTime.value += delta;
  });

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  useEffect(() => {
    if (materialRef.current) {
      const morphTween = gsap.to(morphStateRef.current, {
        value: mapToBustMorph,
        duration: 0.8,
        ease: "power2.out",
        overwrite: true,
        onUpdate: () => {
          materialRef.current!.uniforms.uMorph.value =
            morphStateRef.current.value;
        },
      });

      return () => morphTween.kill();
    }
  }, [mapToBustMorph]);

  useEffect(() => {
    if (currentIndex !== loadedIndexRef.current) {
      loadedIndexRef.current = currentIndex;
      preloadNextBust(nextIndex, mapData.count).then((nextData) => {
        if (nextData) nextBustRef.current = nextData;
      });
    }

    if (nextBustRef.current && morphProgress > 0) {
      const targetAttr = geometry.attributes.aTB as THREE.BufferAttribute;
      const currentTargets = currentBustRef.current.targets;
      const nextTargets = nextBustRef.current.targets;

      for (let i = 0; i < currentTargets.length; i++) {
        targetAttr.array[i] =
          currentTargets[i] +
          (nextTargets[i] - currentTargets[i]) * morphProgress;
      }
      targetAttr.needsUpdate = true;
    }
  }, [currentIndex, nextIndex, morphProgress, mapData.count, geometry]);

  return <points geometry={geometry} material={material} />;
};
