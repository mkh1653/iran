"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import { MapPointData } from "@/utils/imageProcessor";
import { createCameraIntroAnimation } from "./camera/cameraAnimation";
import { createTerrainPath, TerrainPathSample } from "./camera/terrainPath";
import { usePointerController } from "./camera/usePointerController";

export interface CameraRigProps {
  mapToBustMorph: number;
  mapData: MapPointData;
  onIntroComplete: () => void;
}

export const CameraRig: React.FC<CameraRigProps> = ({
  mapToBustMorph,
  mapData,
  onIntroComplete,
}) => {
  const { camera } = useThree();
  const animationRef = useRef({ pathProgress: 0, settleProgress: 0 });
  const currentPosition = useRef(new THREE.Vector3());
  const currentTarget = useRef(new THREE.Vector3());
  const targetQuaternion = useRef(new THREE.Quaternion());
  const onIntroCompleteRef = useRef(onIntroComplete);
  const cameraOffsetRef = useRef(new THREE.Vector3());
  const pointerOrbitRef = useRef(new THREE.Spherical());
  const surfacePointRef = useRef(new THREE.Vector3());
  const tangentRef = useRef(new THREE.Vector3());
  const terrainPositionRef = useRef(new THREE.Vector3());
  const terrainTargetRef = useRef(new THREE.Vector3());
  const mapPositionRef = useRef(new THREE.Vector3());
  const mapTargetRef = useRef(new THREE.Vector3());
  const targetPositionRef = useRef(new THREE.Vector3());
  const targetLookAtRef = useRef(new THREE.Vector3());
  const lookDirectionRef = useRef(new THREE.Vector3());
  const forwardRef = useRef(new THREE.Vector3(0, 0, -1));
  const verticalOffsetRef = useRef(new THREE.Vector3());
  const finalPositionRef = useRef(new THREE.Vector3(0, 112, 72));
  const finalTargetRef = useRef(new THREE.Vector3());
  const bustPositionRef = useRef(new THREE.Vector3(0, 4, 120));
  const bustTargetRef = useRef(new THREE.Vector3(0, 4, 0));
  const targetOffsetRef = useRef(new THREE.Vector3(0, 1.5, 0));
  const idlePositionOffsetRef = useRef(new THREE.Vector3());
  const idleTargetOffsetRef = useRef(new THREE.Vector3());
  const idleTimeRef = useRef(0);
  const initializedRef = useRef(false);
  const { pointerRef, smoothPointerRef } = usePointerController();
  const terrainPath = useMemo(() => createTerrainPath(mapData), [mapData]);

  onIntroCompleteRef.current = onIntroComplete;

  useEffect(() => {
    const animation = animationRef.current;
    animation.pathProgress = 0;
    animation.settleProgress = 0;

    const timeline = createCameraIntroAnimation(animation, () => {
      onIntroCompleteRef.current();
    });

    return () => {
      timeline.kill();
    };
  }, [terrainPath]);

  const getTerrainSample = (progress: number) => {
    const samples = terrainPath as TerrainPathSample[];
    const scaledIndex = THREE.MathUtils.clamp(
      progress * (samples.length - 1),
      0,
      samples.length - 1,
    );
    const lowerIndex = Math.floor(scaledIndex);
    const upperIndex = Math.min(lowerIndex + 1, samples.length - 1);
    const amount = scaledIndex - lowerIndex;
    const lower = samples[lowerIndex]!;
    const upper = samples[upperIndex]!;

    surfacePointRef.current.lerpVectors(lower.point, upper.point, amount);
    tangentRef.current
      .lerpVectors(lower.tangent, upper.tangent, amount)
      .normalize();
  };

  useFrame((_, delta) => {
    idleTimeRef.current += delta;
    const morph = THREE.MathUtils.clamp(mapToBustMorph, 0, 1);
    const easedMorph = morph * morph * (3 - 2 * morph);
    const { pathProgress, settleProgress } = animationRef.current;

    getTerrainSample(pathProgress);
    const surfacePoint = surfacePointRef.current;
    const tangent = tangentRef.current;
    const elevation = surfacePoint.y;
    const terrainDistance = 14 + elevation * 0.45;
    const terrainClearance = 18 + elevation * 0.55;
    const terrainPosition = terrainPositionRef.current
      .copy(surfacePoint)
      .addScaledVector(tangent, -terrainDistance)
      .add(verticalOffsetRef.current.set(0, terrainClearance, 0));
    const terrainTarget = terrainTargetRef.current
      .copy(surfacePoint)
      .add(targetOffsetRef.current);
    const mapPosition = mapPositionRef.current
      .copy(terrainPosition)
      .lerp(finalPositionRef.current, settleProgress);
    const mapTarget = mapTargetRef.current
      .copy(terrainTarget)
      .lerp(finalTargetRef.current, settleProgress);

    const targetPosition = targetPositionRef.current.lerpVectors(
      mapPosition,
      bustPositionRef.current,
      easedMorph,
    );
    const targetLookAt = targetLookAtRef.current.lerpVectors(
      mapTarget,
      bustTargetRef.current,
      easedMorph,
    );

    const pointerActivation = THREE.MathUtils.smoothstep(
      settleProgress,
      0.35,
      1,
    );
    const pointerSmoothing = 1 - Math.exp(-delta * 3.5);
    smoothPointerRef.current.x = THREE.MathUtils.lerp(
      smoothPointerRef.current.x,
      pointerRef.current.x,
      pointerSmoothing,
    );
    smoothPointerRef.current.y = THREE.MathUtils.lerp(
      smoothPointerRef.current.y,
      pointerRef.current.y,
      pointerSmoothing,
    );

    const pointerX = smoothPointerRef.current.x * pointerActivation;
    const pointerY = smoothPointerRef.current.y * pointerActivation;
    const orbit = pointerOrbitRef.current;
    cameraOffsetRef.current.copy(targetPosition).sub(targetLookAt);
    orbit.setFromVector3(cameraOffsetRef.current);
    orbit.theta += pointerX * 0.14;
    orbit.phi = THREE.MathUtils.clamp(
      orbit.phi + pointerY * 0.09,
      THREE.MathUtils.degToRad(28),
      THREE.MathUtils.degToRad(78),
    );
    orbit.radius *= 1 + pointerY * 0.025;
    cameraOffsetRef.current.setFromSpherical(orbit);
    targetPosition.copy(targetLookAt).add(cameraOffsetRef.current);
    targetLookAt.y += pointerY * 0.35;

    const idleActivation = THREE.MathUtils.smoothstep(morph, 0.9, 1);
    const idleTime = idleTimeRef.current;
    idlePositionOffsetRef.current.set(
      Math.sin(idleTime * 0.18) * 1.4 * idleActivation,
      Math.sin(idleTime * 0.24) * 0.55 * idleActivation,
      Math.cos(idleTime * 0.18) * 0.9 * idleActivation,
    );
    idleTargetOffsetRef.current.set(
      Math.sin(idleTime * 0.18) * 0.16 * idleActivation,
      Math.cos(idleTime * 0.24) * 0.12 * idleActivation,
      0,
    );
    targetPosition.add(idlePositionOffsetRef.current);
    targetLookAt.add(idleTargetOffsetRef.current);

    if (!initializedRef.current) {
      getTerrainSample(0);
      const startSurface = surfacePointRef.current;
      const startTangent = tangentRef.current;
      currentPosition.current
        .copy(startSurface)
        .addScaledVector(startTangent, -(14 + startSurface.y * 0.45));
      currentPosition.current.y += 18 + startSurface.y * 0.55;
      currentTarget.current
        .copy(startSurface)
        .add(new THREE.Vector3(0, 1.5, 0));
      initializedRef.current = true;
    }

    currentPosition.current.lerp(targetPosition, 1 - Math.exp(-delta * 4));
    currentTarget.current.lerp(targetLookAt, 1 - Math.exp(-delta * 5));
    camera.position.copy(currentPosition.current);
    const lookDirection = lookDirectionRef.current
      .copy(currentTarget.current)
      .sub(camera.position);
    targetQuaternion.current.setFromUnitVectors(
      forwardRef.current,
      lookDirection.normalize(),
    );
    camera.quaternion.slerp(
      targetQuaternion.current,
      1 - Math.exp(-delta * 2.4),
    );
  });

  return null;
};
