"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { MapPointData } from "@/utils/imageProcessor";
import { createCameraIntroAnimation } from "./camera/cameraAnimation";
import { createTerrainPath } from "./camera/terrainPath";
import { CameraLogic } from "./camera/cameraLogic";
import { usePointerController } from "@/hooks/usePointerController";

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
  const lookDirectionRef = useRef(new THREE.Vector3());
  const forwardRef = useRef(new THREE.Vector3(0, 0, -1));

  const cameraOffsetRef = useRef(new THREE.Vector3());
  const pointerOrbitRef = useRef(new THREE.Spherical());

  const terrainPositionRef = useRef(new THREE.Vector3());
  const terrainTargetRef = useRef(new THREE.Vector3());

  const targetPositionRef = useRef(new THREE.Vector3());
  const targetLookAtRef = useRef(new THREE.Vector3());

  const onIntroCompleteRef = useRef(onIntroComplete);

  const idlePositionOffsetRef = useRef(new THREE.Vector3());
  const idleTargetOffsetRef = useRef(new THREE.Vector3());

  const idleTimeRef = useRef(0);

  const { pointerRef, smoothPointerRef } = usePointerController();

  const terrainPath = useMemo(() => createTerrainPath(mapData), [mapData]);
  const cameraLogic = useMemo(
    () => new CameraLogic(terrainPath),
    [terrainPath],
  );

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

  useFrame((_, delta) => {
    cameraLogic.initialize();

    idleTimeRef.current += delta;

    const morph = THREE.MathUtils.clamp(mapToBustMorph, 0, 1);

    const { pathProgress, settleProgress } = animationRef.current;

    cameraLogic.calculateTargetPose(
      pathProgress,
      settleProgress,
      morph,
      targetPositionRef.current,
      targetLookAtRef.current,
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

    cameraLogic.applyPointerEffect(
      smoothPointerRef.current.x,
      smoothPointerRef.current.y,
      settleProgress,
      targetPositionRef.current,
      targetLookAtRef.current,
    );

    cameraLogic.calculateIdleOffsets(
      idleTimeRef.current,
      morph,
      idlePositionOffsetRef.current,
      idleTargetOffsetRef.current,
    );

    targetPositionRef.current.add(idlePositionOffsetRef.current);
    targetLookAtRef.current.add(idleTargetOffsetRef.current);

    const targetPosition = targetPositionRef.current;
    const targetLookAt = targetLookAtRef.current;

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
