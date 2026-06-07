"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import { useEffect } from "react";
import { Lights } from "./Lights";
import { Book } from "../Book/Book";

// Simple static camera initializer (runs once on mount)
function CameraSetup() {
  const { camera } = useThree();
  
  useEffect(() => {
    // Set fixed camera position and look target
    camera.position.set(0, 0.15, 1.95);
    camera.lookAt(0, 0, 0);
  }, [camera]);
  
  return null;
}

export function Scene() {
  return (
    <div className="w-full h-full relative select-none">
      <Canvas
        shadows
        camera={{ fov: 45, near: 0.1, far: 20 }}
        className="w-full h-full"
      >
        {/* Lights */}
        <Lights />

        {/* Static Camera Setup */}
        <CameraSetup />

        {/* The 3D Book */}
        <Book />

        {/* Soft ground showroom shadows */}
        <ContactShadows
          position={[0, -1.05, 0]}
          opacity={0.65}
          scale={7}
          blur={1.8}
          far={2.0}
        />
      </Canvas>
    </div>
  );
}
