import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const Snow: React.FC = () => {
  const mesh = useRef<THREE.Points>(null);
  const count = 2000;

  // Generate initial positions, velocities, and sway phases
  const { positions, velocities, phases } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count);
    const phases = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 60; // x spread
      positions[i * 3 + 1] = Math.random() * 40 - 10; // y spread
      positions[i * 3 + 2] = (Math.random() - 0.5) * 60; // z spread

      velocities[i] = 0.05 + Math.random() * 0.15; // Falling speed
      phases[i] = Math.random() * Math.PI * 2; // Random starting phase for sway
    }
    return { positions, velocities, phases };
  }, []);

  // Create a soft circle texture programmatically
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 32, 32);
    }
    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  }, []);

  useFrame((state) => {
    if (!mesh.current) return;
    
    const positionAttribute = mesh.current.geometry.getAttribute('position') as THREE.BufferAttribute;
    const posArray = positionAttribute.array as Float32Array;
    const time = state.clock.getElapsedTime();

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      
      // Falling movement
      posArray[idx + 1] -= velocities[i];

      // Wind/Sway effect (sine wave based on time + phase)
      posArray[idx] += Math.sin(time + phases[i]) * 0.01;
      posArray[idx + 2] += Math.cos(time * 0.8 + phases[i]) * 0.01;

      // Reset when below floor
      if (posArray[idx + 1] < -15) {
        posArray[idx + 1] = 25; // Reset height to top
        posArray[idx] = (Math.random() - 0.5) * 60; // Randomize X
        posArray[idx + 2] = (Math.random() - 0.5) * 60; // Randomize Z
      }
    }
    
    positionAttribute.needsUpdate = true;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        map={texture}
        size={0.3}
        sizeAttenuation={true}
        transparent={true}
        opacity={0.8}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        color="#ffffff"
      />
    </points>
  );
};

export default Snow;