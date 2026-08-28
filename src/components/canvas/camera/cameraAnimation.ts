import gsap from "gsap";

export interface CameraAnimationState {
  pathProgress: number;
  settleProgress: number;
}

export function createCameraIntroAnimation(
  animation: CameraAnimationState,
  onComplete?: () => void,
): gsap.core.Timeline {
  animation.pathProgress = 0;
  animation.settleProgress = 0;

  return gsap
    .timeline({ defaults: { ease: "power2.inOut" } })
    .to(animation, {
      pathProgress: 1,
      duration: 18,
      ease: "sine.inOut",
    })
    .to(animation, {
      settleProgress: 1,
      duration: 8,
      ease: "power3.inOut",
      onComplete,
    });
}
