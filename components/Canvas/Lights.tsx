import { useRef } from "react";
import * as THREE from "three";

export function Lights() {
  const dirLightRef = useRef<THREE.DirectionalLight>(null);

  return (
    <>
      {/* Warm soft ambient lighting */}
      <ambientLight color="#fffaf0" intensity={0.7} />

      {/* Main key light with shadows */}
      <directionalLight
        ref={dirLightRef}
        color="#ffffff"
        intensity={1.5}
        position={[4, 8, 4]}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0002}
      >
        <orthographicCamera
          attach="shadow-camera"
          args={[-5, 5, 5, -5, 0.5, 15]}
        />
      </directionalLight>

      {/* Golden soft fill light simulating warm candlelight / interior lighting */}
      <pointLight position={[-4, 3, -2]} color="#ffaa44" intensity={1.2} decay={1.5} />
      
      {/* Rim light to make the book spine and edges stand out */}
      <directionalLight position={[0, -2, -5]} color="#ffffff" intensity={0.5} />
    </>
  );
}
