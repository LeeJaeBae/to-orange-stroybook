'use client';

import { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrthographicCamera, Html, OrbitControls } from '@react-three/drei';
import { useRouter } from 'next/navigation';
import * as THREE from 'three';
import type { OrangeTree } from '@/hooks/useOrangeTrees';

interface ForestCanvasProps {
    trees: OrangeTree[];
}

function TreeModel({
    tree,
    position,
    onClick,
}: {
    tree: OrangeTree;
    position: [number, number, number];
    onClick: () => void;
}) {
    const activity = tree.leaf_count + tree.orange_count;
    // Scale: minimum 0.6, grows logarithmically
    const scale = Math.max(0.6, Math.log2(activity + 2) * 0.3);
    const canopyRadius = 0.5 * scale;
    const trunkHeight = 0.8 * scale;

    // Generate orange positions on canopy
    const orangePositions = useMemo(() => {
        const count = Math.min(tree.orange_count, 12);
        return Array.from({ length: count }, (_, i) => {
            const phi = Math.acos(1 - 2 * (i + 0.5) / Math.max(count, 1));
            const theta = Math.PI * (1 + Math.sqrt(5)) * i;
            return [
                canopyRadius * 0.8 * Math.sin(phi) * Math.cos(theta),
                canopyRadius * 0.8 * Math.cos(phi) + trunkHeight + canopyRadius,
                canopyRadius * 0.8 * Math.sin(phi) * Math.sin(theta),
            ] as [number, number, number];
        });
    }, [tree.orange_count, canopyRadius, trunkHeight]);

    // Canopy color: more leaves = deeper green
    const greenIntensity = Math.min(0.7, 0.3 + Math.log2(tree.leaf_count + 2) * 0.08);

    return (
        <group position={position} onClick={(e) => { e.stopPropagation(); onClick(); }}>
            {/* Trunk */}
            <mesh position={[0, trunkHeight / 2, 0]}>
                <cylinderGeometry args={[0.08 * scale, 0.12 * scale, trunkHeight, 8]} />
                <meshStandardMaterial color="#8B6914" />
            </mesh>

            {/* Canopy */}
            <mesh position={[0, trunkHeight + canopyRadius * 0.8, 0]}>
                <sphereGeometry args={[canopyRadius, 16, 16]} />
                <meshStandardMaterial color={new THREE.Color(0.2, greenIntensity, 0.15)} />
            </mesh>

            {/* Oranges */}
            {orangePositions.map((pos, i) => (
                <mesh key={i} position={pos}>
                    <sphereGeometry args={[0.06, 8, 8]} />
                    <meshStandardMaterial color="#FF8C00" />
                </mesh>
            ))}

            {/* Name label */}
            <Html
                position={[0, -0.3, 0]}
                center
                distanceFactor={10}
                style={{ pointerEvents: 'none' }}
            >
                <div className="bg-amber-800/80 text-white text-xs px-2 py-0.5 rounded whitespace-nowrap font-medium">
                    {tree.nickname || tree.receiverName}
                </div>
            </Html>
        </group>
    );
}

function calculateGridPositions(count: number): [number, number, number][] {
    const spacing = 3;
    const cols = Math.max(2, Math.ceil(Math.sqrt(count)));
    return Array.from({ length: count }, (_, i) => {
        const row = Math.floor(i / cols);
        const col = i % cols;
        // Isometric offset: odd rows shifted
        const xOffset = row % 2 === 1 ? spacing / 2 : 0;
        return [
            col * spacing + xOffset - (cols * spacing) / 2,
            0,
            row * spacing * 0.8 - (Math.ceil(count / cols) * spacing * 0.8) / 2,
        ] as [number, number, number];
    });
}

export function ForestCanvas({ trees }: ForestCanvasProps) {
    const router = useRouter();
    const positions = useMemo(() => calculateGridPositions(trees.length), [trees.length]);

    return (
        <Canvas
            style={{ width: '100%', height: '100%' }}
            gl={{ antialias: true, alpha: true }}
        >
            <OrthographicCamera
                makeDefault
                position={[10, 12, 10]}
                zoom={35}
                near={0.1}
                far={100}
            />
            <OrbitControls
                enableRotate={false}
                enableZoom={true}
                enablePan={true}
                minZoom={20}
                maxZoom={80}
                mouseButtons={{ LEFT: THREE.MOUSE.PAN, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN }}
                touches={{ ONE: THREE.TOUCH.PAN, TWO: THREE.TOUCH.DOLLY_PAN }}
            />

            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 10, 5]} intensity={0.8} castShadow />

            {/* Ground */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
                <planeGeometry args={[40, 40]} />
                <meshStandardMaterial color="#7CB342" />
            </mesh>

            {/* Trees */}
            {trees.map((tree, i) => (
                <TreeModel
                    key={tree.id}
                    tree={tree}
                    position={positions[i]}
                    onClick={() => router.push(`/letter/orangetree/${tree.id}`)}
                />
            ))}
        </Canvas>
    );
}
