import * as THREE from "three";
import { TerrainPathSample } from "./terrainPath";

export class CameraLogic {
  private readonly terrainPath: TerrainPathSample[];
  private initialized = false;

  private readonly finalPosition = new THREE.Vector3(0, 112, 72);
  private readonly finalTarget = new THREE.Vector3();

  private readonly bustPosition = new THREE.Vector3(0, 4, 120);
  private readonly bustTarget = new THREE.Vector3(0, 4, 0);

  private readonly targetOffset = new THREE.Vector3(0, 1.5, 0);

  // Reusable calculation buffers
  private readonly surfacePoint = new THREE.Vector3();
  private readonly tangent = new THREE.Vector3();

  private readonly terrainPosition = new THREE.Vector3();
  private readonly terrainTarget = new THREE.Vector3();

  private readonly settledPosition = new THREE.Vector3();
  private readonly settledTarget = new THREE.Vector3();

  private readonly cameraOffset = new THREE.Vector3();
  private readonly pointerOrbit = new THREE.Spherical();

  constructor(terrainPath: TerrainPathSample[]) {
    this.terrainPath = terrainPath;
  }

  initialize(): void {
    if (this.initialized) return;

    this.calculateTerrainCameraPose(0);
    this.initialized = true;
  }

  calculateTargetPose(
    pathProgress: number,
    settleProgress: number,
    morph: number,
    position: THREE.Vector3,
    target: THREE.Vector3,
  ): void {
    this.calculateTerrainCameraPose(pathProgress);

    this.calculateTransition(settleProgress, morph, position, target);
  }

  calculateTerrainCameraPose(progress: number): void {
    const scaledIndex = THREE.MathUtils.clamp(
      progress * (this.terrainPath.length - 1),
      0,
      this.terrainPath.length - 1,
    );

    const lowerIndex = Math.floor(scaledIndex);
    const upperIndex = Math.min(lowerIndex + 1, this.terrainPath.length - 1);
    const amount = scaledIndex - lowerIndex;

    const lower = this.terrainPath[lowerIndex]!;
    const upper = this.terrainPath[upperIndex]!;

    this.surfacePoint.lerpVectors(lower.point, upper.point, amount);

    this.tangent.lerpVectors(lower.tangent, upper.tangent, amount).normalize();

    const elevation = this.surfacePoint.y;
    const terrainDistance = 14 + elevation * 0.45;
    const terrainClearance = 18 + elevation * 0.55;

    this.terrainPosition
      .copy(this.surfacePoint)
      .addScaledVector(this.tangent, -terrainDistance);

    this.terrainPosition.y += terrainClearance;

    this.terrainTarget.copy(this.surfacePoint).add(this.targetOffset);
  }

  calculateTransition(
    settleProgress: number,
    morph: number,
    position: THREE.Vector3,
    target: THREE.Vector3,
  ): void {
    const easedMorph = morph * morph * (3 - 2 * morph);

    this.settledPosition
      .copy(this.terrainPosition)
      .lerp(this.finalPosition, settleProgress);

    this.settledTarget
      .copy(this.terrainTarget)
      .lerp(this.finalTarget, settleProgress);

    position.lerpVectors(this.settledPosition, this.bustPosition, easedMorph);

    target.lerpVectors(this.settledTarget, this.bustTarget, easedMorph);
  }

  applyPointerEffect(
    pointerX: number,
    pointerY: number,
    settleProgress: number,
    position: THREE.Vector3,
    target: THREE.Vector3,
  ): void {
    const pointerActivation = THREE.MathUtils.smoothstep(
      settleProgress,
      0.35,
      1,
    );

    const activatedX = pointerX * pointerActivation;

    const activatedY = pointerY * pointerActivation;

    this.cameraOffset.copy(position).sub(target);

    this.pointerOrbit.setFromVector3(this.cameraOffset);

    this.pointerOrbit.theta += activatedX * 0.14;

    this.pointerOrbit.phi = THREE.MathUtils.clamp(
      this.pointerOrbit.phi + activatedY * 0.09,
      THREE.MathUtils.degToRad(28),
      THREE.MathUtils.degToRad(78),
    );

    this.pointerOrbit.radius *= 1 + activatedY * 0.025;

    this.cameraOffset.setFromSpherical(this.pointerOrbit);

    position.copy(target).add(this.cameraOffset);

    target.y += activatedY * 0.35;
  }

  calculateIdleOffsets(
    time: number,
    morph: number,
    positionOffset: THREE.Vector3,
    targetOffset: THREE.Vector3,
  ): void {
    const activation = THREE.MathUtils.smoothstep(morph, 0.9, 1);

    positionOffset.set(
      Math.sin(time * 0.18) * 1.4 * activation,
      Math.sin(time * 0.24) * 0.55 * activation,
      Math.cos(time * 0.18) * 0.9 * activation,
    );

    targetOffset.set(
      Math.sin(time * 0.18) * 0.16 * activation,
      Math.cos(time * 0.24) * 0.12 * activation,
      0,
    );
  }
}
