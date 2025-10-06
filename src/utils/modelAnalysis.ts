import * as THREE from 'three';

export interface ModelAnalysis {
  dimensions: {
    x: number;
    y: number;
    z: number;
  };
  volume: number;
  surfaceArea: number;
  optimalPrintDirection?: THREE.Vector3;
}

export function analyzeGeometry(geometry: THREE.BufferGeometry | THREE.Group): ModelAnalysis {
  let bbox: THREE.Box3;
  
  if (geometry instanceof THREE.BufferGeometry) {
    geometry.computeBoundingBox();
    bbox = geometry.boundingBox!;
  } else {
    bbox = new THREE.Box3().setFromObject(geometry);
  }
  
  const dimensions = new THREE.Vector3();
  bbox.getSize(dimensions);
  
  // Calculate approximate volume (this is a rough approximation)
  const volume = dimensions.x * dimensions.y * dimensions.z;
  
  // Calculate approximate surface area (this is a rough approximation)
  const surfaceArea = 2 * (dimensions.x * dimensions.y + 
                           dimensions.x * dimensions.z + 
                           dimensions.y * dimensions.z);
  
  return {
    dimensions: {
      x: dimensions.x,
      y: dimensions.y,
      z: dimensions.z
    },
    volume,
    surfaceArea,
    optimalPrintDirection: calculateOptimalPrintDirection(geometry)
  };
}

// Calculate the optimal direction for 3D printing (usually minimizing support structures)
function calculateOptimalPrintDirection(geometry: THREE.BufferGeometry | THREE.Group): THREE.Vector3 {
  // This is a simplified implementation
  // In a real scenario, this would analyze geometry to find the orientation
  // that minimizes overhangs requiring support structures
  
  // For now, we'll just return a direction that aligns the model's largest face with the build plate
  if (geometry instanceof THREE.BufferGeometry) {
    if (!geometry.boundingBox) geometry.computeBoundingBox();
    const size = new THREE.Vector3();
    geometry.boundingBox!.getSize(size);
    
    // Find which dimension is the smallest
    if (size.y <= size.x && size.y <= size.z) {
      return new THREE.Vector3(0, 1, 0); // Y is smallest, print along Y axis
    } else if (size.x <= size.y && size.x <= size.z) {
      return new THREE.Vector3(1, 0, 0); // X is smallest, print along X axis
    } else {
      return new THREE.Vector3(0, 0, 1); // Z is smallest, print along Z axis
    }
  } else {
    const bbox = new THREE.Box3().setFromObject(geometry);
    const size = new THREE.Vector3();
    bbox.getSize(size);
    
    // Use same logic as above
    if (size.y <= size.x && size.y <= size.z) {
      return new THREE.Vector3(0, 1, 0);
    } else if (size.x <= size.y && size.x <= size.z) {
      return new THREE.Vector3(1, 0, 0);
    } else {
      return new THREE.Vector3(0, 0, 1);
    }
  }
} 