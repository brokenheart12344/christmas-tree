import React, { useRef, useState } from 'react';
import { useStore } from '../store';
import { Phase, Gesture } from '../types';

// Icons
const MusicIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
  </svg>
);

const UI: React.FC = () => {
  const { phase, gesture } = useStore();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const getInstructions = (phase: Phase) => {
    switch (phase) {
      case 'tree':
        return "Show 'Open Palm' ✋ to start the Magic.";
      case 'blooming':
        return "Exploding...";
      case 'nebula':
        return "Swipe ✋ or Drag to rotate. Click Photos. 'Fist' ✊ to reset.";
      case 'collapsing':
        return "Restoring...";
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6">
      
      {/* Header / Title */}
      <div className="w-full flex justify-center mt-10">
        <h1 className="text-6xl md:text-8xl font-['Great_Vibes'] text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-200 drop-shadow-[0_0_15px_rgba(255,215,0,0.6)] animate-pulse">
          Merry Christmas
        </h1>
      </div>

      {/* Top Left Status */}
      <div className="absolute top-6 left-6 pointer-events-auto">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl text-white shadow-xl max-w-xs">
          <h2 className="text-xs font-bold uppercase tracking-widest text-yellow-300 mb-2">Status</h2>
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-gray-300 text-sm">Phase:</span>
            <span className="font-mono text-green-400 uppercase">{phase}</span>
          </div>
          <div className="flex items-center space-x-2 mb-4">
             <span className="text-gray-300 text-sm">Gesture:</span>
             <span className={`font-mono uppercase transition-colors duration-300 ${gesture !== 'None' ? 'text-blue-400 font-bold' : 'text-gray-500'}`}>
                {gesture.replace('_', ' ')}
             </span>
          </div>
          <p className="text-sm italic text-white/80 border-t border-white/10 pt-2">
             {getInstructions(phase)}
          </p>
        </div>
      </div>

      {/* Bottom Music Player */}
      <div className="w-full flex justify-center pointer-events-auto mb-6">
         <div 
           className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 flex items-center space-x-4 shadow-2xl hover:bg-black/40 transition-all cursor-pointer group"
           onClick={toggleMusic}
         >
            <div className={`p-2 rounded-full bg-white/10 ${isPlaying ? 'animate-spin' : ''}`} style={{animationDuration: '3s'}}>
               {/* Snow/Ice Icon representation */}
               <div className="w-8 h-8 flex items-center justify-center text-blue-200">
                  ❄️
               </div>
            </div>
            
            <div className="flex flex-col w-48 overflow-hidden">
                <span className="text-xs text-gray-400 uppercase tracking-widest">Now Playing</span>
                <div className="relative w-full h-5 overflow-hidden">
                    <span className={`absolute whitespace-nowrap text-sm text-white ${isPlaying ? 'animate-marquee' : ''}`}>
                       Ryuichi Sakamoto - Merry Christmas Mr. Lawrence
                    </span>
                </div>
            </div>

            <button className="text-white/80 hover:text-white transition-colors">
               <MusicIcon />
            </button>

            {/* Hidden Audio */}
            {/* Using a direct MP3 link example. In production use local asset or reliable stream */}
            <audio ref={audioRef} loop crossOrigin="anonymous">
                <source src="https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c4/Ryuichi_Sakamoto_-_Merry_Christmas_Mr_Lawrence.ogg/Ryuichi_Sakamoto_-_Merry_Christmas_Mr_Lawrence.ogg.mp3" type="audio/mpeg" />
            </audio>
         </div>
      </div>

      {/* Marquee Animation Style */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 10s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default UI;