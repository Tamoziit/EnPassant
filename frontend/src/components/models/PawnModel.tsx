import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

const PawnModel = () => {
    const ref = useRef<THREE.Group>(null);
    const { scene } = useGLTF('/pawnModel/scene.gltf');

    // Applying custom blue material to all meshes
    scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.material = new THREE.MeshPhysicalMaterial({
                color: 0x2563ef,
                metalness: 0.3,
                roughness: 0.2,
                clearcoat: 0.8,
                clearcoatRoughness: 0.1,
            });
            mesh.castShadow = true;
            mesh.receiveShadow = true;
        }
    });

    // Setting scale and center
    const box = new THREE.Box3().setFromObject(scene);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxSize = Math.max(size.x, size.y, size.z);
    const scale = 2 / maxSize;

    scene.scale.setScalar(scale);
    scene.position.sub(center.multiplyScalar(scale));

    // Positioning the pawn so its bottom sits on the ground (y = -2)
    // Adding half the scaled height to lift the bottom to ground level
    const groundLevel = -2;
    scene.position.y = groundLevel + (size.y * scale) / 2;

    useFrame(({ clock }) => {
        const t = clock.getElapsedTime();
        if (ref.current) {
            ref.current.rotation.y = t * 0.5;
            ref.current.position.y = -0.5 + Math.sin(t * 2) * 0.1;
        }
    });

    return <primitive object={scene} ref={ref} />;
};

export default PawnModel;