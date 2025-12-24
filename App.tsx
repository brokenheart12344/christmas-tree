import React from 'react';
import Scene from './components/Scene';
import UI from './components/UI';
import HandTracker from './components/HandTracker';

const App: React.FC = () => {
  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* 3D Scene Background */}
      <div className="absolute inset-0 z-0">
        <Scene />
      </div>

      {/* Logic Layers */}
      <HandTracker />

      {/* UI Overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none">
         {/* UI passes pointer events only where needed */}
        <UI />
      </div>
    </div>
  );
};

export default App;
