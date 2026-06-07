"use client";

import { useThree } from "@react-three/fiber";
import { useEffect, useMemo, useState } from "react";
import { Cover } from "./Cover";
import { Page } from "./Page";
import { PageFlip } from "./PageFlip";
import { useBookStore } from "@/store/useBookStore";

export function Book() {
  const currentPage = useBookStore((state) => state.currentPage);
  const totalPages = useBookStore((state) => state.totalPages);
  const viewport = useThree((state) => state.viewport);

  // Dimensions of pages and covers (covers are slightly larger for overhanging look)
  const pageW = 1.3;
  const pageH = 1.8;
  const pageThickness = 0.005; // Thin paper

  const coverW = 1.33;
  const coverH = 1.84;

  // Track if we are on a narrow/mobile screen
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 1. Calculate responsive scale: fit book width in the 3D viewport
  const scale = useMemo(() => {
    const bookWidth = pageW * 2; // Open book width
    const padding = isMobile ? 1.05 : 1.25; // Margin to screen edges
    const factor = viewport.width / (bookWidth * padding);
    
    // Cap scale at 1.0 for desktops, scale down proportionally on smaller screens
    const s = Math.min(1.0, factor);
    return [s, s, s] as [number, number, number];
  }, [viewport.width, isMobile]);

  // 2. Mobile Single-Page Mode: Shift the book slightly left (-X) when open
  // so the active right-side page is centered on the portrait screen.
  const bookPosX = useMemo(() => {
    if (!isMobile) return 0;
    if (currentPage === 0) return 0.2; // Shift slightly right when closed front cover
    if (currentPage === totalPages) return -0.2; // Shift slightly left when closed back cover
    return -0.4; // Shift left when open to center the right page
  }, [isMobile, currentPage, totalPages]);

  // 3. Stacking depth configuration
  const depthSpacing = 0.006; // Spacing in Z-space between pages

  return (
    <group position={[bookPosX, 0, 0]} scale={scale}>
      {/* 3D Raycast Hitboxes for clicking left/right pages to flip */}
      <PageFlip width={pageW} height={pageH} />

      {/* RENDER PAGES AND COVERS */}
      {Array.from({ length: totalPages + 1 }).map((_, i) => {
        const isFirst = i === 0;
        const isLast = i === totalPages;
        
        // Z offset for stacking: page i is placed at local z = -i * depthSpacing.
        // As a page rotates around the Y axis by -PI, its world z automatically
        // flips to +i * depthSpacing, stacking it correctly on the left side.
        const zOffset = -i * depthSpacing;

        return (
          <group key={i} position={[0, 0, zOffset]}>
            {isFirst ? (
              // Front Cover
              <Cover index={0} width={coverW} height={coverH} />
            ) : isLast ? (
              // Back Cover
              <Cover index={totalPages} width={coverW} height={coverH} />
            ) : (
              // Regular Pages
              <Page
                index={i}
                width={pageW}
                height={pageH}
                thickness={pageThickness}
                isCover={false}
              />
            )}
          </group>
        );
      })}
    </group>
  );
}
