"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

export interface PageState {
  rotationY: number;
  bend: number;
}

interface PageMeshProps {
  width: number;
  height: number;
  thickness: number;
  materials: THREE.Material[];
  stateRef: React.RefObject<PageState>;
}

export function PageMesh({
  width,
  height,
  thickness,
  materials,
  stateRef,
}: PageMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  // 1. Create a subdivided BoxGeometry (so it can bend smoothly along the width)
  const geometry = useMemo(() => {
    // 32 segments along width, 2 along height, 1 along thickness
    const geo = new THREE.BoxGeometry(width, height, thickness, 32, 2, 1);
    
    // Shift the geometry X position by width/2.
    // This places the origin (spine) at x = 0 instead of the center.
    // As a result, rotation around the Y-axis will act as a hinge on the left edge.
    geo.translate(width / 2, 0, 0);
    return geo;
  }, [width, height, thickness]);

  // 2. Clone the original position attribute array to read static, undeformed coordinates
  const originalPositions = useMemo(() => {
    return geometry.attributes.position.array.slice();
  }, [geometry]);

  // Track previous state to avoid redundant geometry updates when resting
  const prevRotationRef = useRef<number>(-999);
  const prevBendRef = useRef<number>(-999);

  // 3. Deform vertices in the frame loop based on GSAP-driven stateRef
  useFrame(() => {
    if (!meshRef.current || !stateRef.current) return;

    const { rotationY, bend } = stateRef.current;

    // Check if the page is completely flat and resting on either side
    const isResting = (rotationY === 0 || rotationY === -Math.PI) && bend === 0;

    // Performance Optimization: Skip calculation if state hasn't changed and page is resting
    if (isResting && prevRotationRef.current === rotationY && prevBendRef.current === bend) {
      return;
    }

    const positionAttr = geometry.attributes.position;
    const count = positionAttr.count;

    for (let i = 0; i < count; i++) {
      // Original local coordinates
      const x0 = originalPositions[i * 3];
      const y0 = originalPositions[i * 3 + 1];
      const z0 = originalPositions[i * 3 + 2];

      const progressX = x0 / width; // 0 at spine, 1 at outer edge
      const verticalFactor = 1 + 0.15 * Math.abs(y0 / (height / 2)); // Corners bend more
      
      // Maximum page lag in radians (~22 degrees)
      const maxLag = 0.38;

      // Calculate the specific rotation angle for this vertex column.
      // Vertices further from the spine (x=0) lag behind the main rotation,
      // creating the realistic paper bending/curving look during flip.
      const theta = rotationY + bend * maxLag * Math.pow(progressX, 2) * verticalFactor;

      // Apply standard 3D rotation around Y-axis for (x0, z0)
      const xNew = x0 * Math.cos(theta) + z0 * Math.sin(theta);
      const yNew = y0;
      const zNew = -x0 * Math.sin(theta) + z0 * Math.cos(theta);

      positionAttr.setXYZ(i, xNew, yNew, zNew);
    }

    positionAttr.needsUpdate = true;
    geometry.computeVertexNormals(); // Recompute lighting normals for correct shadows

    // Keep track of last frame's values
    prevRotationRef.current = rotationY;
    prevBendRef.current = bend;
  });

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={materials}
      castShadow
      receiveShadow
    />
  );
}
