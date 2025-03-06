"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { BitcoinCoin } from "./CoinCanvas";
import { Suspense, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

function RotatingGroup() {
    const groupRef = useRef<THREE.Group>(null);

    useFrame((state, delta) => {
        if (groupRef.current) {
            groupRef.current.rotation.y += delta * 2;
        }
    });

    return (
        <group ref={groupRef}>
            <BitcoinCoin />
        </group>
    );
}

export default function Scene() {
    return (
        <Canvas
            camera={{ position: [0, 0, 6], fov: 45 }}
            style={{ width: "500px", height: "500px" }}
        >
            {/*<color attach="background" args={["#f3035f"]} />*/}
            {/*<fog attach="fog" args={["#000817", 5, 15]} />*/}

            <Suspense fallback={null}>
                <Environment preset="apartment" />

                <ambientLight intensity={0.5} />
                <spotLight
                    position={[10, 10, 10]}
                    angle={0.15}
                    penumbra={1}
                    intensity={1}
                    castShadow
                />
                <pointLight position={[-10, -10, -10]} intensity={0.5} />

                <RotatingGroup />

                <OrbitControls
                    enableZoom={false}
                    enablePan={false}
                    minPolarAngle={Math.PI / 3}
                    maxPolarAngle={Math.PI * 2/3}
                />
            </Suspense>
        </Canvas>
    );
}