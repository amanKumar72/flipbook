"use client";

import { useEffect, useState } from "react";
import { useBookStore } from "@/store/useBookStore";

interface PageFlipProps {
  width: number;
  height: number;
}

export function PageFlip({ width, height }: PageFlipProps) {
  const nextPage = useBookStore((state) => state.nextPage);
  const prevPage = useBookStore((state) => state.prevPage);
  const isAnimating = useBookStore((state) => state.isAnimating);
  const currentPage = useBookStore((state) => state.currentPage);
  const totalPages = useBookStore((state) => state.totalPages);

  const [hoverLeft, setHoverLeft] = useState(false);
  const [hoverRight, setHoverRight] = useState(false);

  // Only enable interaction if not currently animating
  const canFlipLeft = !isAnimating && currentPage > 0;
  const canFlipRight = !isAnimating && currentPage < totalPages;

  // Sync the cursor style with mouse hover state
  useEffect(() => {
    const isHovering = (hoverLeft && canFlipLeft) || (hoverRight && canFlipRight);
    document.body.style.cursor = isHovering ? "pointer" : "default";

    return () => {
      document.body.style.cursor = "default";
    };
  }, [hoverLeft, hoverRight, canFlipLeft, canFlipRight]);

  return (
    <group>
      {/* Left side click hitbox (active only if pages exist on the left) */}
      {currentPage > 0 && (
        <mesh
          position={[-width / 2, 0, 0.05]}
          onClick={(e) => {
            e.stopPropagation();
            if (canFlipLeft) {
              prevPage();
            }
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHoverLeft(true);
          }}
          onPointerOut={() => setHoverLeft(false)}
        >
          <planeGeometry args={[width, height]} />
          {/* Completely transparent mesh for raycasting */}
          <meshBasicMaterial transparent opacity={0.0} depthWrite={false} />
        </mesh>
      )}

      {/* Right side click hitbox (active only if pages exist on the right) */}
      {currentPage < totalPages && (
        <mesh
          position={[width / 2, 0, 0.05]}
          onClick={(e) => {
            e.stopPropagation();
            if (canFlipRight) {
              nextPage();
            }
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHoverRight(true);
          }}
          onPointerOut={() => setHoverRight(false)}
        >
          <planeGeometry args={[width, height]} />
          {/* Completely transparent mesh for raycasting */}
          <meshBasicMaterial transparent opacity={0.0} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}
