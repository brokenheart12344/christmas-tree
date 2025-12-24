import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../store';
import { generateTreePositions, generateNebulaPositions, generateOrnamentPositions, ORNAMENT_COLORS } from '../utils/geometry';
import gsap from 'gsap';
import { Float } from '@react-three/drei';

const PARTICLE_COUNT = 5000;
const TREE_HEIGHT = 15;
const TREE_RADIUS = 6;
const NEBULA_RADIUS = 20;

const ChristmasTree: React.FC = () => {
  const { phase, setPhase, gesture, nebulaRotation, focusedPhotoIndex, setFocusedPhotoIndex } = useStore();
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const { camera, mouse, raycaster } = useThree();

  // Generate Positions
  const { positions: treePositions, colors: particleColors } = useMemo(() => generateTreePositions(PARTICLE_COUNT, TREE_RADIUS, TREE_HEIGHT), []);
  const nebulaPositions = useMemo(() => generateNebulaPositions(PARTICLE_COUNT, NEBULA_RADIUS), []);
  const ornamentPositions = useMemo(() => generateOrnamentPositions(80, TREE_RADIUS * 0.85, TREE_HEIGHT * 0.9), []); // Increased count for lights
  
  // State for animation
  const progress = useRef(0); // 0 = Tree, 1 = Nebula
  const explodeProgress = useRef(0); // For blooming
  
  // Phase Management Side Effects
  useEffect(() => {
    if (phase === 'blooming') {
      gsap.to(progress, {
        current: 1,
        duration: 2.5,
        ease: 'power3.out',
        onComplete: () => setPhase('nebula'),
      });
      gsap.to(explodeProgress, {
        current: 1,
        duration: 1,
        yoyo: true,
        repeat: 1
      });
    } else if (phase === 'collapsing') {
      gsap.to(progress, {
        current: 0,
        duration: 2,
        ease: 'power2.inOut',
        onComplete: () => setPhase('tree'),
      });
    }
  }, [phase, setPhase]);

  // Gesture Reactions
  useEffect(() => {
    if (phase === 'tree' && gesture === 'Open_Palm') {
      setPhase('blooming');
    }
    if (phase === 'nebula' && gesture === 'Closed_Fist') {
      setPhase('collapsing');
    }
  }, [gesture, phase, setPhase]);

  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.getElapsedTime();
    const isTree = progress.current < 0.1;

    // Camera movement in Nebula phase
    if (phase === 'nebula' && focusedPhotoIndex === null) {
        // Smooth rotate based on hand or auto
        const targetRot = nebulaRotation * 0.05 + time * 0.05;
        camera.position.x = Math.sin(targetRot) * 30;
        camera.position.z = Math.cos(targetRot) * 30;
        camera.lookAt(0, 0, 0);
    } else if (phase === 'tree') {
        // Subtle drift
        camera.position.lerp(new THREE.Vector3(0, 5, 25), 0.05);
        camera.lookAt(0, 5, 0);
    }

    // Raycaster for "Water Ripple" effect in Tree phase
    let hoverPoint: THREE.Vector3 | null = null;
    if (isTree) {
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(meshRef.current);
      if (intersects.length > 0) {
        hoverPoint = intersects[0].point;
      }
    }

    // Update Particles
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const idx = i * 3;
      
      // Interpolate between Tree and Nebula positions
      const tx = THREE.MathUtils.lerp(treePositions[idx], nebulaPositions[idx], progress.current);
      const ty = THREE.MathUtils.lerp(treePositions[idx + 1], nebulaPositions[idx + 1], progress.current);
      const tz = THREE.MathUtils.lerp(treePositions[idx + 2], nebulaPositions[idx + 2], progress.current);

      let x = tx;
      let y = ty;
      let z = tz;

      // Explosion effect during bloom
      if (phase === 'blooming') {
         const explosionStrength = explodeProgress.current * 10;
         const dir = new THREE.Vector3(x, y, z).normalize().multiplyScalar(explosionStrength);
         x += dir.x;
         y += dir.y;
         z += dir.z;
      }

      // Ripple Repulsion (Mouse Interaction in Tree Phase)
      if (hoverPoint && isTree) {
        const dx = x - hoverPoint.x;
        const dy = y - hoverPoint.y;
        const dz = z - hoverPoint.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        const repelRadius = 3.0;

        if (dist < repelRadius) {
          const force = (repelRadius - dist) / repelRadius;
          const repulsion = 1.5 * force;
          x += (dx / dist) * repulsion;
          y += (dy / dist) * repulsion;
          z += (dz / dist) * repulsion;
        }
      }

      // Sparkle/Wiggle
      const wiggle = Math.sin(time * 2 + i) * 0.05;
      
      dummy.position.set(x + wiggle, y + wiggle, z + wiggle);
      
      // Rotate particles slightly
      dummy.rotation.set(time * 0.1, time * 0.1, 0);
      
      const scale = progress.current > 0.5 ? 0.08 : 0.05; // Larger in nebula
      dummy.scale.setScalar(scale);
      
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      {/* The 5000 Particles */}
      <instancedMesh ref={meshRef} args={[undefined, undefined, PARTICLE_COUNT]}>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial 
            color="#2f8f2f" 
            emissive="#1a5c1a" 
            emissiveIntensity={0.5} 
            roughness={0.4} 
            metalness={0.6}
            toneMapped={false}
        />
      </instancedMesh>

      {/* Lights - Only visible close to tree phase */}
      <group visible={phase !== 'nebula'}>
         {ornamentPositions.map((pos, i) => (
             <TreeLight key={i} position={pos} color={ORNAMENT_COLORS[i % ORNAMENT_COLORS.length]} progress={progress.current} index={i} />
         ))}
      </group>

      {/* Top Star */}
      <group visible={phase !== 'nebula'}>
         <TopStar progress={progress.current} />
      </group>

      {/* Nebula Hearts Ring */}
      <group visible={phase !== 'tree'}>
         <HeartRing visible={phase === 'nebula' || phase === 'blooming'} opacity={progress.current} />
      </group>
    </group>
  );
};

// --- Sub-Components ---

// 1. Glowing Blinking Lights
interface TreeLightProps {
    position: number[];
    color: string;
    progress: number;
    index: number;
}
const TreeLight: React.FC<TreeLightProps> = ({ position, color, progress, index }) => {
    const ref = useRef<THREE.Mesh>(null);
    // Random offset for blinking so they don't blink in unison
    const randomPhase = useMemo(() => Math.random() * Math.PI * 2, []);

    useFrame((state) => {
        if(ref.current) {
            const time = state.clock.getElapsedTime();
            
            // Explode outwards based on progress (transition to nebula)
            const [x, y, z] = position;
            const exp = 1 + progress * 8; // Fly out further
            ref.current.position.set(x * exp, y * exp, z * exp);
            
            // Shrink as they fly out
            ref.current.scale.setScalar((1 - progress) * 0.15); 

            // Blink logic
            const blink = Math.sin(time * 3 + randomPhase) * 0.5 + 0.5; // 0 to 1
            const material = ref.current.material as THREE.MeshStandardMaterial;
            material.emissiveIntensity = 2 + blink * 3; // Base glow + blink
        }
    });

    return (
        <mesh ref={ref} position={[position[0], position[1], position[2]]}>
            <sphereGeometry args={[1, 16, 16]} />
            <meshStandardMaterial 
                color={color} 
                emissive={color} 
                toneMapped={false}
            />
        </mesh>
    )
}

// 2. Custom Top Star
const TopStar: React.FC<{ progress: number }> = ({ progress }) => {
    const starShape = useMemo(() => {
        const shape = new THREE.Shape();
        const outerRadius = 1.2;
        const innerRadius = 0.5;
        const points = 5;
        
        for (let i = 0; i < points * 2; i++) {
            const r = (i % 2 === 0) ? outerRadius : innerRadius;
            const a = (i / (points * 2)) * Math.PI * 2;
            const x = Math.cos(a + Math.PI / 2) * r; // Rotate to point up
            const y = Math.sin(a + Math.PI / 2) * r;
            if (i === 0) shape.moveTo(x, y);
            else shape.lineTo(x, y);
        }
        shape.closePath();
        return shape;
    }, []);

    const extrudeSettings = { depth: 0.4, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 0.1, bevelThickness: 0.1 };
    const ref = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (ref.current) {
            const t = state.clock.getElapsedTime();
            ref.current.rotation.y = t * 0.5; // Slow spin
            ref.current.position.y = (TREE_HEIGHT / 2 + 1) + Math.sin(t) * 0.1 + progress * 20; // Float & Fly away
            ref.current.scale.setScalar(1 - progress); // Shrink on exit
        }
    });

    return (
        <group ref={ref} position={[0, TREE_HEIGHT / 2 + 1, 0]}>
            <mesh>
                <extrudeGeometry args={[starShape, extrudeSettings]} />
                <meshStandardMaterial 
                    color="#FFD700" 
                    emissive="#FFD700" 
                    emissiveIntensity={2} 
                    toneMapped={false} 
                    metalness={0.8} 
                    roughness={0.2} 
                />
            </mesh>
            <pointLight intensity={3} color="#FFD700" distance={15} decay={2} />
        </group>
    );
};

// 3. Heart Ring (Replaces Photos)
interface HeartRingProps {
    visible: boolean;
    opacity: number;
}
const HeartRing: React.FC<HeartRingProps> = ({ visible, opacity }) => {
    const count = 20;
    const radius = 15;
    
    // Heart Shape Geometry
    const heartShape = useMemo(() => {
        const x = 0, y = 0;
        const shape = new THREE.Shape();
        // Standard heart curve
        shape.moveTo(x + 2.5, y + 2.5);
        shape.bezierCurveTo(x + 2.5, y + 2.5, x + 2.0, y, x, y);
        shape.bezierCurveTo(x - 3.0, y, x - 3.0, y + 3.5, x - 3.0, y + 3.5);
        shape.bezierCurveTo(x - 3.0, y + 5.5, x - 1.0, y + 7.7, x + 2.5, y + 9.5);
        shape.bezierCurveTo(x + 6.0, y + 7.7, x + 8.0, y + 5.5, x + 8.0, y + 3.5);
        shape.bezierCurveTo(x + 8.0, y + 3.5, x + 8.0, y, x + 5.0, y);
        shape.bezierCurveTo(x + 3.5, y, x + 2.5, y + 2.5, x + 2.5, y + 2.5);
        return shape;
    }, []);

    const extrudeSettings = { depth: 1, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 0.2, bevelThickness: 0.2 };

    const hearts = useMemo(() => new Array(count).fill(0).map((_, i) => ({
        id: i,
        rotation: (i / count) * Math.PI * 2,
        pos: [
             Math.sin((i / count) * Math.PI * 2) * radius,
             0,
             Math.cos((i / count) * Math.PI * 2) * radius
        ] as [number, number, number],
        color: i % 2 === 0 ? '#ff0055' : '#ff66aa' // Red and Pink
    })), []);

    if (!visible) return null;

    return (
        <group>
            {hearts.map((heart, i) => (
                 <Float key={i} speed={2} rotationIntensity={0.5} floatIntensity={1}>
                    <group 
                        position={heart.pos} 
                        rotation={[0, heart.rotation + Math.PI, 0]}
                    >
                        <mesh rotation={[Math.PI, 0, 0]} scale={0.2} position={[0, 1, 0]}>
                            <extrudeGeometry args={[heartShape, extrudeSettings]} />
                            <meshStandardMaterial 
                                color={heart.color} 
                                emissive={heart.color}
                                emissiveIntensity={1.5}
                                metalness={0.5}
                                roughness={0.2}
                                transparent
                                opacity={opacity}
                                toneMapped={false}
                            />
                        </mesh>
                    </group>
                 </Float>
            ))}
        </group>
    )
}

export default ChristmasTree;