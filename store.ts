import { create } from 'zustand';
import { TreeStore } from './types';

export const useStore = create<TreeStore>((set) => ({
  phase: 'tree',
  gesture: 'None',
  cameraActive: false,
  nebulaRotation: 0,
  focusedPhotoIndex: null,

  setPhase: (phase) => set({ phase }),
  setGesture: (gesture) => set({ gesture }),
  setCameraActive: (cameraActive) => set({ cameraActive }),
  setNebulaRotation: (rotation) => set({ nebulaRotation: rotation }),
  setFocusedPhotoIndex: (index) => set({ focusedPhotoIndex: index }),
}));