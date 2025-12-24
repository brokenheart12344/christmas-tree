import React, { useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { useStore } from '../store';

const HandTracker: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [landmarker, setLandmarker] = useState<HandLandmarker | null>(null);
  const [loaded, setLoaded] = useState(false);
  
  const { cameraActive, setCameraActive, setGesture, setNebulaRotation, nebulaRotation } = useStore();
  
  const requestRef = useRef<number>(0);
  const lastXRef = useRef<number>(0);

  // Initialize MediaPipe
  useEffect(() => {
    const init = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
        );
        const handLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 1
        });
        setLandmarker(handLandmarker);
        setLoaded(true);
      } catch (error) {
        console.error("Error initializing HandLandmarker:", error);
      }
    };
    init();
  }, []);

  // Camera handling
  useEffect(() => {
    if (!cameraActive || !loaded || !videoRef.current) return;

    const startCamera = async () => {
      try {
        // Mobile Optimization: Request front camera ('user') and lower resolution for performance
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'user',
            width: { ideal: 640 },
            height: { ideal: 480 }
          } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.addEventListener('loadeddata', predictWebcam);
        }
      } catch (err) {
        console.error("Error accessing webcam:", err);
        setCameraActive(false);
        alert("无法访问摄像头。请确保您允许了摄像头权限，并且通过HTTPS访问网站。");
      }
    };

    startCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraActive, loaded]);

  const predictWebcam = () => {
    if (!landmarker || !videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (video.videoWidth > 0 && video.videoHeight > 0) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const startTimeMs = performance.now();
      const results = landmarker.detectForVideo(video, startTimeMs);

      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      let detectedGesture = 'None';

      if (results.landmarks.length > 0) {
        const landmarks = results.landmarks[0];
        
        // Simple Gesture Logic
        const fingerTips = [8, 12, 16, 20]; 
        const fingerDips = [6, 10, 14, 18]; 
        
        let extendedCount = 0;
        fingerTips.forEach((tipIdx, i) => {
          if (landmarks[tipIdx].y < landmarks[fingerDips[i]].y) {
            extendedCount++;
          }
        });

        // Thumb check (approximate)
        const dist = Math.hypot(landmarks[4].x - landmarks[2].x, landmarks[4].y - landmarks[2].y);
        if (dist > 0.05) extendedCount++;

        if (extendedCount >= 4) detectedGesture = 'Open_Palm';
        else if (extendedCount <= 1) detectedGesture = 'Closed_Fist';
        
        // Draw landmarks
        if (ctx) {
          ctx.fillStyle = detectedGesture === 'Open_Palm' ? '#00FF00' : '#FF0000';
          for (const lm of landmarks) {
            ctx.beginPath();
            ctx.arc(lm.x * canvas.width, lm.y * canvas.height, 5, 0, 2 * Math.PI);
            ctx.fill();
          }
        }

        // Swipe Logic for Nebula
        if (detectedGesture === 'Open_Palm') {
          const palmCenterX = landmarks[9].x;
          const delta = palmCenterX - lastXRef.current;
          
          if (Math.abs(delta) > 0.005) {
             setNebulaRotation(nebulaRotation + delta * 5); 
          }
          lastXRef.current = palmCenterX;
        } else {
          lastXRef.current = landmarks[9].x;
        }
      }

      setGesture(detectedGesture as any);
    }

    requestRef.current = requestAnimationFrame(predictWebcam);
  };

  if (!loaded) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 transition-opacity duration-300 ${cameraActive ? 'opacity-100' : 'opacity-80'}`}>
      <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden shadow-2xl w-32 h-24 md:w-48 md:h-36">
        {!cameraActive ? (
          <div className="flex flex-col items-center justify-center h-full text-white/70 space-y-2">
            <span className="text-[10px] md:text-xs uppercase tracking-widest text-center">Camera Off</span>
            <button 
              onClick={() => setCameraActive(true)}
              className="px-2 py-1 bg-green-500/20 hover:bg-green-500/40 border border-green-500/50 rounded-full text-[10px] md:text-xs transition-colors"
            >
              Start
            </button>
          </div>
        ) : (
          <>
             <video 
              ref={videoRef} 
              className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]" 
              autoPlay 
              playsInline 
              muted 
            />
            <canvas 
              ref={canvasRef} 
              className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]" 
            />
            <button 
              onClick={() => setCameraActive(false)}
              className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-red-500/50 hover:bg-red-500/70 text-white text-[8px] md:text-[10px] rounded"
            >
              Stop
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default HandTracker;