import * as THREE from "three";
import { MapPointData } from "@/utils/imageProcessor";

const TERRAIN_HEIGHT_SCALE = 14;
const PATH_SAMPLE_COUNT = 160;

export interface TerrainPathSample {
  point: THREE.Vector3;
  tangent: THREE.Vector3;
}

export function createTerrainPath(mapData: MapPointData): TerrainPathSample[] {
  const waypoints = [
    [-42, 8],
    [-24, -14],
    [4, -4],
    [34, 12],
    [20, 28],
    [0, 0],
  ];

  const points = waypoints.map(([x, z]) => {
    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    for (let index = 0; index < mapData.count; index += 1) {
      const pointX = mapData.positions[index * 3]!;
      const pointZ = mapData.positions[index * 3 + 2]!;
      const distance = (pointX - x) ** 2 + (pointZ - z) ** 2;

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    }

    return new THREE.Vector3(
      mapData.positions[closestIndex * 3]!,
      mapData.heights[closestIndex]! * TERRAIN_HEIGHT_SCALE + 0.05,
      mapData.positions[closestIndex * 3 + 2]!,
    );
  });

  const curve = new THREE.CatmullRomCurve3(points, false, "centripetal", 0.5);

  return Array.from({ length: PATH_SAMPLE_COUNT }, (_, index) => {
    const progress = index / (PATH_SAMPLE_COUNT - 1);
    return {
      point: curve.getPointAt(progress),
      tangent: curve.getTangentAt(progress).normalize(),
    };
  });
}
