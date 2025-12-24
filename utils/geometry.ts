import * as THREE from 'three';

// Generate particles for a cone (Christmas Tree)
export const generateTreePositions = (count: number, radius: number, height: number) => {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const colorObj = new THREE.Color();

  for (let i = 0; i < count; i++) {
    // Height normalized 0 to 1
    const h = Math.random();
    // Angle
    const theta = Math.random() * Math.PI * 2;
    // Radius at this height (cone tapers to top)
    const r = (1 - h) * radius * Math.sqrt(Math.random()); 

    const x = r * Math.cos(theta);
    const y = h * height - height / 2;
    const z = r * Math.sin(theta);

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    // Green shades
    colorObj.setHSL(0.3 + Math.random() * 0.1, 0.8, 0.2 + Math.random() * 0.4);
    colors[i * 3] = colorObj.r;
    colors[i * 3 + 1] = colorObj.g;
    colors[i * 3 + 2] = colorObj.b;
  }
  return { positions, colors };
};

// Generate particles for a ring/nebula
export const generateNebulaPositions = (count: number, radius: number) => {
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    // Spread in ring thickness
    const r = radius + (Math.random() - 0.5) * 5; 
    
    const x = r * Math.cos(angle);
    // Vertical spread
    const y = (Math.random() - 0.5) * 4; 
    const z = r * Math.sin(angle);

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
  }
  return positions;
};

// Ornament positions on the tree (Spiral)
export const generateOrnamentPositions = (count: number, radius: number, height: number) => {
  const positions: [number, number, number][] = [];
  
  for (let i = 0; i < count; i++) {
    const t = i / count;
    const h = t * height - height / 2;
    const angle = t * Math.PI * 2 * 6; // 6 full turns
    const r = (1 - t) * radius;

    const x = r * Math.cos(angle);
    const z = r * Math.sin(angle);
    positions.push([x, h, z]);
  }
  return positions;
};

export const ORNAMENT_COLORS = [
  '#FFD700', // Gold
  '#8B0000', // Wine Red
  '#778899', // Grey Blue
  '#FFC0CB', // Rose Pink
  '#F7E7CE', // Champagne
];
