"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { gsap } from "gsap";

interface SceneProps {
  children: (scene: THREE.Scene) => React.ReactNode;
}

export const Scene: React.FC<SceneProps> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sceneState, setSceneState] = useState<THREE.Scene | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    camera.position.set(0, 35, 75);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    setSceneState(scene);

    // smooth camera animation to new position
    gsap.to(camera.position, {
      y: 28,
      z: 65,
      duration: 2.5,
      ease: "power2.inOut",
    });

    // animate the scene with a slow rotation
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      scene.rotation.y = Math.sin(clock.getElapsedTime() * 0.15) * 0.05;
      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      if (containerRef.current) containerRef.current.innerHTML = "";
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className='fixed inset-0 z-0 pointer-events-none bg-[#050b08]'>
      {sceneState && children(sceneState)}
    </div>
  );
};
