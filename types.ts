export type Phase = 'tree' | 'blooming' | 'nebula' | 'collapsing';

export type Gesture = 'None' | 'Open_Palm' | 'Closed_Fist';

export interface TreeStore {
  phase: Phase;
  gesture: Gesture;
  cameraActive: boolean;
  nebulaRotation: number;
  focusedPhotoIndex: number | null;
  
  setPhase: (phase: Phase) => void;
  setGesture: (gesture: Gesture) => void;
  setCameraActive: (active: boolean) => void;
  setNebulaRotation: (rotation: number) => void;
  setFocusedPhotoIndex: (index: number | null) => void;
}

export interface ParticleData {
  position: [number, number, number];
  color: string;
}
