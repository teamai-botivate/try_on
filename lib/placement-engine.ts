import type { FaceLandmarks, HandLandmarks, PoseLandmarks, JewelleryProduct } from "@/types";

export interface PlacementResult {
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
}

export function calculateRingPlacement(
  product: JewelleryProduct,
  handLandmarks: HandLandmarks[] | null
): PlacementResult {
  const defaultPlacement: PlacementResult = {
    position: product.position,
    rotation: product.rotation,
    scale: product.scale,
  };

  if (!handLandmarks || handLandmarks.length === 0) {
    return defaultPlacement;
  }

  // Find right hand for ring
  const rightHand = handLandmarks.find((h) => h.hand === "right");
  if (!rightHand) {
    return defaultPlacement;
  }

  // Ring finger is landmark 12
  const ringFinger = rightHand.landmarks[12];
  // Middle finger is landmark 9
  const middleFinger = rightHand.landmarks[9];

  if (!ringFinger || !middleFinger) {
    return defaultPlacement;
  }

  // Calculate finger width for scaling
  const fingerWidth = Math.hypot(
    ringFinger.x - middleFinger.x,
    ringFinger.y - middleFinger.y
  );

  // Position at ring finger
  const position = {
    x: ringFinger.x,
    y: ringFinger.y,
    z: ringFinger.z,
  };

  // Calculate rotation based on finger orientation
  const rotation = {
    x: 0,
    y: Math.atan2(ringFinger.y - middleFinger.y, ringFinger.x - middleFinger.x),
    z: 0,
  };

  // Scale based on finger width
  const scale = {
    x: fingerWidth / 100,
    y: fingerWidth / 100,
    z: fingerWidth / 100,
  };

  return { position, rotation, scale };
}

export function calculateBraceletPlacement(
  product: JewelleryProduct,
  handLandmarks: HandLandmarks[] | null
): PlacementResult {
  const defaultPlacement: PlacementResult = {
    position: product.position,
    rotation: product.rotation,
    scale: product.scale,
  };

  if (!handLandmarks || handLandmarks.length === 0) {
    return defaultPlacement;
  }

  // Find left hand for bracelet (typically)
  const leftHand = handLandmarks.find((h) => h.hand === "left");
  if (!leftHand) {
    return defaultPlacement;
  }

  // Wrist is landmark 0
  const wrist = leftHand.landmarks[0];
  // Middle finger MCP for scaling
  const middleMCP = leftHand.landmarks[9];

  if (!wrist || !middleMCP) {
    return defaultPlacement;
  }

  // Calculate wrist circumference estimate
  const wristWidth = Math.hypot(
    wrist.x - middleMCP.x,
    wrist.y - middleMCP.y
  );

  const position = {
    x: wrist.x,
    y: wrist.y,
    z: wrist.z,
  };

  const rotation = {
    x: 0,
    y: 0,
    z: Math.atan2(middleMCP.y - wrist.y, middleMCP.x - wrist.x),
  };

  const scale = {
    x: wristWidth / 50,
    y: 1,
    z: wristWidth / 50,
  };

  return { position, rotation, scale };
}

export function calculateBanglePlacement(
  product: JewelleryProduct,
  handLandmarks: HandLandmarks[] | null
): PlacementResult {
  return calculateBraceletPlacement(product, handLandmarks);
}

export function calculateNecklacePlacement(
  product: JewelleryProduct,
  faceLandmarks: FaceLandmarks | null,
  poseLandmarks: PoseLandmarks | null
): PlacementResult {
  const defaultPlacement: PlacementResult = {
    position: product.position,
    rotation: product.rotation,
    scale: product.scale,
  };

  if (!faceLandmarks || !poseLandmarks) {
    return defaultPlacement;
  }

  // Neck position - average of shoulder and chin landmarks
  const leftShoulder = poseLandmarks.landmarks[11];
  const rightShoulder = poseLandmarks.landmarks[12];
  const chin = faceLandmarks.landmarks[152];

  if (!leftShoulder || !rightShoulder || !chin) {
    return defaultPlacement;
  }

  const neckCenterX = (leftShoulder.x + rightShoulder.x) / 2;
  const neckCenterY = chin.y + (chin.y - (leftShoulder.y + rightShoulder.y) / 2) * 0.3;

  const shoulderWidth = Math.hypot(
    rightShoulder.x - leftShoulder.x,
    rightShoulder.y - leftShoulder.y
  );

  const position = {
    x: neckCenterX,
    y: neckCenterY,
    z: 0,
  };

  const rotation = {
    x: 0,
    y: 0,
    z: 0,
  };

  const scale = {
    x: shoulderWidth / 100,
    y: 1,
    z: 1,
  };

  return { position, rotation, scale };
}

export function calculateEarringPlacement(
  product: JewelleryProduct,
  faceLandmarks: FaceLandmarks | null,
  handIndex?: 0 | 1
): PlacementResult {
  const defaultPlacement: PlacementResult = {
    position: product.position,
    rotation: product.rotation,
    scale: product.scale,
  };

  if (!faceLandmarks) {
    return defaultPlacement;
  }

  // Left ear is landmark 234, right ear is landmark 454
  const earLandmark = handIndex === 1 ? faceLandmarks.landmarks[454] : faceLandmarks.landmarks[234];

  if (!earLandmark) {
    return defaultPlacement;
  }

  // Use face width for scaling
  const faceScale = faceLandmarks.width / 200;

  const position = {
    x: earLandmark.x,
    y: earLandmark.y,
    z: earLandmark.z,
  };

  const rotation = {
    x: 0,
    y: 0,
    z: 0,
  };

  const scale = {
    x: faceScale,
    y: faceScale,
    z: faceScale,
  };

  return { position, rotation, scale };
}

export function calculatePendantPlacement(
  product: JewelleryProduct,
  poseLandmarks: PoseLandmarks | null
): PlacementResult {
  const defaultPlacement: PlacementResult = {
    position: product.position,
    rotation: product.rotation,
    scale: product.scale,
  };

  if (!poseLandmarks) {
    return defaultPlacement;
  }

  // Chest center - average of shoulders
  const leftShoulder = poseLandmarks.landmarks[11];
  const rightShoulder = poseLandmarks.landmarks[12];

  if (!leftShoulder || !rightShoulder) {
    return defaultPlacement;
  }

  const chestX = (leftShoulder.x + rightShoulder.x) / 2;
  const chestY = (leftShoulder.y + rightShoulder.y) / 2 + 50;

  const shoulderWidth = Math.hypot(
    rightShoulder.x - leftShoulder.x,
    rightShoulder.y - leftShoulder.y
  );

  const position = {
    x: chestX,
    y: chestY,
    z: 0,
  };

  const rotation = {
    x: 0,
    y: 0,
    z: 0,
  };

  const scale = {
    x: shoulderWidth / 300,
    y: shoulderWidth / 300,
    z: shoulderWidth / 300,
  };

  return { position, rotation, scale };
}

export function calculateWatchPlacement(
  product: JewelleryProduct,
  handLandmarks: HandLandmarks[] | null
): PlacementResult {
  const defaultPlacement: PlacementResult = {
    position: product.position,
    rotation: product.rotation,
    scale: product.scale,
  };

  if (!handLandmarks || handLandmarks.length === 0) {
    return defaultPlacement;
  }

  // Wrist on left hand
  const leftHand = handLandmarks.find((h) => h.hand === "left");
  if (!leftHand) {
    return defaultPlacement;
  }

  const wrist = leftHand.landmarks[0];
  const middleBase = leftHand.landmarks[9];

  if (!wrist || !middleBase) {
    return defaultPlacement;
  }

  const armWidth = Math.hypot(
    wrist.x - middleBase.x,
    wrist.y - middleBase.y
  );

  const position = {
    x: wrist.x,
    y: wrist.y,
    z: wrist.z,
  };

  const rotation = {
    x: 0,
    y: 0,
    z: Math.atan2(middleBase.y - wrist.y, middleBase.x - wrist.x),
  };

  const scale = {
    x: armWidth / 80,
    y: armWidth / 100,
    z: armWidth / 80,
  };

  return { position, rotation, scale };
}

export function calculateChainPlacement(
  product: JewelleryProduct,
  faceLandmarks: FaceLandmarks | null
): PlacementResult {
  return calculateNecklacePlacement(product, faceLandmarks, null);
}

export function calculateNoseRingPlacement(
  product: JewelleryProduct,
  faceLandmarks: FaceLandmarks | null
): PlacementResult {
  const defaultPlacement: PlacementResult = {
    position: product.position,
    rotation: product.rotation,
    scale: product.scale,
  };

  if (!faceLandmarks) {
    return defaultPlacement;
  }

  // Nose tip is landmark 1, left nostril is landmark 360
  const noseLeft = faceLandmarks.landmarks[360];
  const noseTip = faceLandmarks.landmarks[1];

  if (!noseLeft || !noseTip) {
    return defaultPlacement;
  }

  const position = {
    x: noseLeft.x,
    y: noseLeft.y,
    z: noseLeft.z,
  };

  const rotation = {
    x: 0,
    y: 0,
    z: 0,
  };

  const faceScale = faceLandmarks.width / 500;

  const scale = {
    x: faceScale,
    y: faceScale,
    z: faceScale,
  };

  return { position, rotation, scale };
}

export function calculateMangalsutraPlacement(
  product: JewelleryProduct,
  faceLandmarks: FaceLandmarks | null,
  poseLandmarks: PoseLandmarks | null
): PlacementResult {
  return calculateNecklacePlacement(product, faceLandmarks, poseLandmarks);
}

export function calculatePlacement(
  product: JewelleryProduct,
  faceLandmarks: FaceLandmarks | null,
  handLandmarks: HandLandmarks[] | null,
  poseLandmarks: PoseLandmarks | null
): PlacementResult {
  switch (product.placementArea) {
    case "ring":
      return calculateRingPlacement(product, handLandmarks);
    case "bracelet":
      return calculateBraceletPlacement(product, handLandmarks);
    case "bangle":
      return calculateBanglePlacement(product, handLandmarks);
    case "necklace":
      return calculateNecklacePlacement(product, faceLandmarks, poseLandmarks);
    case "earrings":
      return calculateEarringPlacement(product, faceLandmarks);
    case "pendant":
      return calculatePendantPlacement(product, poseLandmarks);
    case "watch":
      return calculateWatchPlacement(product, handLandmarks);
    case "chain":
      return calculateChainPlacement(product, faceLandmarks);
    case "nose_ring":
      return calculateNoseRingPlacement(product, faceLandmarks);
    case "mangalsutra":
      return calculateMangalsutraPlacement(product, faceLandmarks, poseLandmarks);
    default:
      return {
        position: product.position,
        rotation: product.rotation,
        scale: product.scale,
      };
  }
}
