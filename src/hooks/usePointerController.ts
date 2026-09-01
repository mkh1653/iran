import { useEffect, useRef } from "react";

export interface PointerPosition {
  x: number;
  y: number;
}

export function usePointerController() {
  const pointerRef = useRef<PointerPosition>({ x: 0, y: 0 });
  const smoothPointerRef = useRef<PointerPosition>({ x: 0, y: 0 });

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      pointerRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointerRef.current.y = (event.clientY / window.innerHeight) * 2 - 1;
    };

    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, []);

  return { pointerRef, smoothPointerRef };
}
