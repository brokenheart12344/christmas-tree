import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars, Environment } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import ChristmasTree from './ChristmasTree';
import Snow from './Snow';
import { useStore } from '../store';

const Scene: React.FC = () => {
  const { phase } = useStore();

  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ antialias: false, toneMapping: 3 }} // ACESFilmic
      camera={{ position: [0, 5, 25], fov: 45 }}
      shadows
    >
      <color attach="background" args={['#050505']} />
      
      {/* Environment & Lighting */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      {/* Falling Snow Effect */}
      <Snow />

      <ambientLight intensity={0.2} />
      
      {/* Warm Main Light */}
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#ffaa00" castShadow />
      
      {/* Cool Fill Light */}
      <pointLight position={[-10, 0, -10]} intensity={0.5} color="#0055ff" />
      
      {/* Top Spotlight for Divinity */}
      <spotLight 
        position={[0, 20, 0]} 
        angle={0.5} 
        penumbra={1} 
        intensity={2} 
        color="#ffffff" 
        castShadow 
      />

      <Environment preset="city" blur={0.8} />

      <Suspense fallback={null}>
        <ChristmasTree />
      </Suspense>

      {/* Post Processing */}
      <EffectComposer disableNormalPass>
        <Bloom 
          luminanceThreshold={1.2} 
          mipmapBlur 
          intensity={1.5} 
          radius={0.4}
        />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>
    </Canvas>
  );
};

export default Scene;