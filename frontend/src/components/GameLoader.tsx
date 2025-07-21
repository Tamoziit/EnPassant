import { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import PawnModel from './models/PawnModel';
import Particles from './models/Particles';

const Scene = () => {
	const checkerTexture = useMemo(() => {
		const size = 512;
		const squares = 8;
		const squareSize = size / squares;

		const canvas = document.createElement('canvas');
		canvas.width = canvas.height = size;
		const ctx = canvas.getContext('2d')!;

		for (let y = 0; y < squares; y++) {
			for (let x = 0; x < squares; x++) {
				ctx.fillStyle = (x + y) % 2 === 0 ? '#1e293b' : '#3b82f6'; // dark-slate & blue
				ctx.fillRect(x * squareSize, y * squareSize, squareSize, squareSize);
			}
		}

		const texture = new THREE.CanvasTexture(canvas);
		texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
		texture.anisotropy = 16;
		texture.needsUpdate = true;

		return texture;
	}, []);

	return (
		<>
			<ambientLight intensity={0.4} color={0x3b82f6} />
			<directionalLight
				position={[10, 10, 5]}
				intensity={1.5}
				castShadow
				shadow-mapSize-width={2048}
				shadow-mapSize-height={2048}
				color={0x60a5fa}
			/>
			<pointLight position={[-5, 5, 5]} intensity={0.8} color={0x93c5fd} />

			<Particles />
			<PawnModel />

			{/* Ground as Checkered Chessboard */}
			<mesh rotation-x={-Math.PI / 2} position={[0, -5, 0]} receiveShadow>
				<planeGeometry args={[20, 20]} />
				<meshStandardMaterial
					map={checkerTexture}
					metalness={0.3}
					roughness={0.6}
				/>
			</mesh>

			<OrbitControls enableZoom={false} />
		</>
	);
};

const GameLoader = () => {
	return (
		<div className="w-full h-[550px] lg:h-[800px] mx-auto relative bg-gradient-to-br from-slate-900 to-blue-900 rounded-2xl overflow-hidden shadow-2xl border border-blue-800/30">
			<Canvas
				shadows
				camera={{ position: [0, 2, 8], fov: 50 }}
				className="absolute inset-0 w-full h-full"
			>
				<Scene />
			</Canvas>

			{/* Overlay UI */}
			<div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-t from-slate-900/20 to-transparent pointer-events-none">
				<div className="text-center space-y-2">
					<h2 className="text-3xl font-bold text-blue-100 tracking-wide">
						Loading your Game
					</h2>
					<p className="text-blue-300/80 text-base">Preparing your battle of 64 Squares...</p>
				</div>
				<div className="absolute top-8 right-8 flex space-x-2">
					<div className="w-3 h-3 bg-blue-400 rounded-sm animate-pulse" />
					<div
						className="w-3 h-3 bg-blue-500 rounded-sm animate-pulse"
						style={{ animationDelay: '0.2s' }}
					/>
					<div
						className="w-3 h-3 bg-blue-600 rounded-sm animate-pulse"
						style={{ animationDelay: '0.4s' }}
					/>
				</div>
				<div className="absolute bottom-4 left-4 text-blue-400/80 text-xs font-mono">
					EN PASSANT • CHESS ENGINE
				</div>
			</div>

			{/* Blue Glow */}
			<div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 via-transparent to-blue-800/10 pointer-events-none" />
		</div>
	);
};

export default GameLoader;