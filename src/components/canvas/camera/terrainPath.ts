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
    [27, -21], // شمال شرق
    [20, -20], // شرق البرز
    [12, -19], // البرز
    [4, -18], // البرز مرکزی
    [-6, -16], // غرب البرز
    [-16, -13], // ورود به زاگرس
    [-25, -9], // زاگرس غربی
    [-23, -2], // زاگرس مرکزی
    [-18, 5], // زاگرس جنوبی
    [-10, 13], // جنوب غربی
    [2, 21], // جنوب
    [11, 28], // بندرعباس
    [0, 0], // مرکز
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
