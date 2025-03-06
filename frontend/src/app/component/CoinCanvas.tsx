"use client";

import { useRef } from "react";
import { Cylinder, useTexture } from "@react-three/drei";
import * as THREE from "three";

export function BitcoinCoin() {
    const meshRef = useRef<THREE.Mesh>(null);

    // Load bitcoin textures
    const texture = useTexture("moduloCoin.jpg");
    const bumpMap = useTexture("moduloCoin.jpg");

    // Rotate the texture by 90 degrees
    texture.rotation = Math.PI / 2;
    texture.center.set(0.5, 0.5);

    return (
        <Cylinder
            ref={meshRef}
            args={[2, 2, 0.2, 64]} // Increased segments for smoother edges
            rotation={[Math.PI / 2, 0, 0]} // Rotated 90 degrees around X-axis to show edge
        >
            <meshPhysicalMaterial
                color="#f7931a"
                metalness={0.9}
                roughness={0.1}
                map={texture}
                bumpMap={bumpMap}
                bumpScale={0.02}
                clearcoat={1}
                clearcoatRoughness={0.1}
                reflectivity={1}
            />
        </Cylinder>
    );
}