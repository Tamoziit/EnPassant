import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const Particles = () => {
    const ref = useRef<THREE.Points>(null);
    const count = 100;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 20;
        positions[i + 1] = Math.random() * 10;
        positions[i + 2] = (Math.random() - 0.5) * 20;

        const shade = Math.random() * 0.5 + 0.3;
        colors[i] = shade * 0.2;
        colors[i + 1] = shade * 0.5;
        colors[i + 2] = shade;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: 0.05,
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
    });

    useFrame(({ clock }) => {
        const t = clock.getElapsedTime();
        if (ref.current) {
            const pos = ref.current.geometry.attributes.position.array as Float32Array;
            for (let i = 0; i < pos.length; i += 3) {
                pos[i + 1] += 0.01;
                if (pos[i + 1] > 10) pos[i + 1] = 0;
            }
            ref.current.geometry.attributes.position.needsUpdate = true;
            ref.current.rotation.y = t * 0.1;
        }
    });

    return <points geometry={geometry} material={material} ref={ref} />;
};

export default Particles;