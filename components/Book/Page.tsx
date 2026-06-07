"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { PageMesh, PageState } from "./PageMesh";
import { useBookStore } from "@/store/useBookStore";
import { albumData } from "@/data/album";
import { generateCoverTexture, generatePageTexture } from "@/lib/textureGenerator";

interface PageProps {
  index: number;
  width: number;
  height: number;
  thickness: number;
  isCover: boolean;
}

export function Page({
  index,
  width,
  height,
  thickness,
  isCover,
}: PageProps) {
  const currentPage = useBookStore((state) => state.currentPage);
  const totalPages = useBookStore((state) => state.totalPages);
  const setAnimating = useBookStore((state) => state.setAnimating);

  const [frontTexture, setFrontTexture] = useState<THREE.Texture | null>(null);
  const [backTexture, setBackTexture] = useState<THREE.Texture | null>(null);

  // Initialize page rotation: pages left of current page are flipped (-PI), others are right (0)
  const isInitiallyFlipped = index < currentPage;
  const stateRef = useRef<PageState>({
    rotationY: isInitiallyFlipped ? -Math.PI : 0,
    bend: 0,
  });

  // Track the target rotation to detect changes
  const targetRotation = isInitiallyFlipped ? -Math.PI : 0;
  const prevTargetRotation = useRef<number>(targetRotation);

  // Performance optimization: only load textures if the page is near the current viewport (preloading/lazy-loading)
  const isNearCurrentPage = useMemo(() => {
    // Front cover (0) and back cover (totalPages) are always loaded for fast opening/closing
    if (index === 0 || index === totalPages) return true;
    return Math.abs(index - currentPage) <= 1;
  }, [index, currentPage, totalPages]);

  // Load front and back textures when page is nearby
  useEffect(() => {
    if (!isNearCurrentPage) return;

    let active = true;

    async function loadTextures() {
      if (isCover) {
        if (index === 0) {
          // Front Cover
          const front = generateCoverTexture(true);
          const back = await generatePageTexture(true, 0, albumData[0]);
          if (active) {
            setFrontTexture(front);
            setBackTexture(back);
          }
        } else {
          // Back Cover
          const front = await generatePageTexture(false, albumData.length - 1, albumData[albumData.length - 1]);
          const back = generateCoverTexture(false);
          if (active) {
            setFrontTexture(front);
            setBackTexture(back);
          }
        }
      } else {
        // Inside Pages
        // Front side shows the right page of the previous spread
        const front = await generatePageTexture(false, index - 1, albumData[index - 1]);
        // Back side shows the left page of the current spread
        const back = await generatePageTexture(true, index, albumData[index]);
        if (active) {
          setFrontTexture(front);
          setBackTexture(back);
        }
      }
    }

    loadTextures();

    return () => {
      active = false;
    };
  }, [isNearCurrentPage, index, isCover]);

  // 1. Procedural paper/leather bump textures for tactile feel
  const paperBumpTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 128, 128);
    // Subtle noise
    const imgData = ctx.getImageData(0, 0, 128, 128);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const val = (Math.random() - 0.5) * 5;
      data[i] += val;
      data[i + 1] += val;
      data[i + 2] += val;
    }
    ctx.putImageData(imgData, 0, 0);
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(8, 8);
    return tex;
  }, []);

  // 2. Setup materials for the 6 faces of the BoxGeometry
  const materials = useMemo(() => {
    // Edge color: leather color for covers, soft warm paper color for pages
    const edgeColor = isCover ? "#140e0c" : "#eae4d2";
    const sideMaterial = new THREE.MeshStandardMaterial({
      color: edgeColor,
      roughness: 0.9,
      metalness: 0.05,
    });

    // Front/Back base paper materials (fallback before textures load)
    const basePaperMaterial = new THREE.MeshPhysicalMaterial({
      color: "#eae4d2",
      roughness: 0.95,
      metalness: 0,
      bumpMap: paperBumpTexture || undefined,
      bumpScale: 0.002,
    });

    // Materials array: [posX, negX, posY, negY, posZ (Front), negZ (Back)]
    const mats = [
      sideMaterial, // posX (outer edge)
      sideMaterial, // negX (hinge/spine)
      sideMaterial, // posY (top edge)
      sideMaterial, // negY (bottom edge)
      basePaperMaterial.clone(), // posZ (Front)
      basePaperMaterial.clone(), // negZ (Back)
    ];

    return mats;
  }, [isCover, paperBumpTexture]);

  // Update materials when textures load
  useEffect(() => {
    if (frontTexture && materials[4]) {
      const mat = materials[4] as THREE.MeshPhysicalMaterial;
      mat.map = frontTexture;
      mat.color.set("#ffffff"); // Reset to white so texture displays correctly
      if (!isCover) {
        mat.clearcoat = 0.12; // Premium glossy photograph look
        mat.clearcoatRoughness = 0.25;
      }
      mat.needsUpdate = true;
    }
  }, [frontTexture, materials, isCover]);

  useEffect(() => {
    if (backTexture && materials[5]) {
      const mat = materials[5] as THREE.MeshPhysicalMaterial;
      mat.map = backTexture;
      mat.color.set("#ffffff"); // Reset to white so texture displays correctly
      if (!isCover) {
        mat.clearcoat = 0.12; // Premium glossy photograph look
        mat.clearcoatRoughness = 0.25;
      }
      mat.needsUpdate = true;
    }
  }, [backTexture, materials, isCover]);

  // 3. Page Flip GSAP Animation
  useEffect(() => {
    if (targetRotation === prevTargetRotation.current) return;

    // Reset previous target tracker immediately
    prevTargetRotation.current = targetRotation;

    // Trigger state animating lock
    setAnimating(true);

    const isFlippingForward = targetRotation === -Math.PI;

    // Kill any active page animations on this page to prevent glitches
    gsap.killTweensOf(stateRef.current);

    // Create the dual-axis page turn timeline
    const tl = gsap.timeline({
      onComplete: () => {
        stateRef.current.bend = 0;
        setAnimating(false);
      },
    });

    // Axis 1: Y-axis rotation (0 -> -PI or -PI -> 0)
    tl.to(
      stateRef.current,
      {
        rotationY: targetRotation,
        duration: 0.8,
        ease: "power3.inOut",
      },
      0
    );

    // Axis 2: Bend deformation factor (0 -> 1 -> 0 or 0 -> -1 -> 0)
    // Starts flat, peaks at vertical midpoint (0.4s), flattens on landing
    tl.to(
      stateRef.current,
      {
        bend: isFlippingForward ? 1.0 : -1.0,
        duration: 0.4,
        ease: "power2.out",
      },
      0
    );

    tl.to(
      stateRef.current,
      {
        bend: 0,
        duration: 0.4,
        ease: "power2.in",
      },
      0.4
    );

    return () => {
      tl.kill();
    };
  }, [targetRotation, setAnimating]);

  return (
    <PageMesh
      width={width}
      height={height}
      thickness={thickness}
      materials={materials}
      stateRef={stateRef}
    />
  );
}
