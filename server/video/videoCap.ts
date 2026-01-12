/**
 * Video Cap Enforcement for ICE Maker
 * 
 * LOCKED DECISION: Standard ICE includes ≤4 bundled video scenes
 * Full Cinematic upgrade required for 12 video scenes
 */

export const BUNDLED_VIDEO_SCENES = 4;
export const MAX_SCENES_PER_ICE = 12;

export type VideoQualityTier = 'budget' | 'standard' | 'premium';

export interface FullCinematicTier {
  id: VideoQualityTier;
  name: string;
  model: string;
  credits: number;
  price: string;
  costPerScene: number;
}

export const FULL_CINEMATIC_TIERS: Record<VideoQualityTier, FullCinematicTier> = {
  budget: {
    id: 'budget',
    name: 'Budget Cinematic',
    model: 'haiper-video-2',
    credits: 4,
    price: '£32',
    costPerScene: 0.30,
  },
  standard: {
    id: 'standard',
    name: 'Standard Cinematic',
    model: 'minimax-video',
    credits: 6,
    price: '£48',
    costPerScene: 0.80,
  },
  premium: {
    id: 'premium',
    name: 'Premium Cinematic',
    model: 'kling-v1.6-standard',
    credits: 8,
    price: '£64',
    costPerScene: 1.10,
  },
};

export interface VideoCapResult {
  allowed: boolean;
  currentCount: number;
  maxAllowed: number;
  isFullCinematic: boolean;
  upgradeAvailable: boolean;
  message?: string;
}

export function checkVideoCap(
  currentVideoCount: number,
  isFullCinematic: boolean = false
): VideoCapResult {
  const maxAllowed = isFullCinematic ? MAX_SCENES_PER_ICE : BUNDLED_VIDEO_SCENES;
  
  if (currentVideoCount >= maxAllowed) {
    return {
      allowed: false,
      currentCount: currentVideoCount,
      maxAllowed,
      isFullCinematic,
      upgradeAvailable: !isFullCinematic,
      message: isFullCinematic 
        ? `Maximum ${MAX_SCENES_PER_ICE} video scenes reached`
        : `Standard ICE includes ${BUNDLED_VIDEO_SCENES} video scenes. Upgrade to Full Cinematic for all ${MAX_SCENES_PER_ICE} scenes.`,
    };
  }
  
  return {
    allowed: true,
    currentCount: currentVideoCount,
    maxAllowed,
    isFullCinematic,
    upgradeAvailable: !isFullCinematic && currentVideoCount >= BUNDLED_VIDEO_SCENES - 1,
  };
}

export function getFullCinematicOptions() {
  return Object.values(FULL_CINEMATIC_TIERS);
}

export function getModelForTier(tier: VideoQualityTier): string {
  return FULL_CINEMATIC_TIERS[tier].model;
}

export function getCreditsForTier(tier: VideoQualityTier): number {
  return FULL_CINEMATIC_TIERS[tier].credits;
}

export function selectBundledScenes(sceneCount: number): number[] {
  if (sceneCount <= BUNDLED_VIDEO_SCENES) {
    return Array.from({ length: sceneCount }, (_, i) => i);
  }
  
  const selectedIndices: number[] = [];
  
  selectedIndices.push(0);
  
  const endIndex = sceneCount - 1;
  if (!selectedIndices.includes(endIndex)) {
    selectedIndices.push(endIndex);
  }
  
  const remaining = BUNDLED_VIDEO_SCENES - selectedIndices.length;
  const middleStart = 1;
  const middleEnd = sceneCount - 2;
  
  if (remaining > 0 && middleEnd >= middleStart) {
    const step = Math.floor((middleEnd - middleStart + 1) / (remaining + 1));
    for (let i = 0; i < remaining; i++) {
      const index = middleStart + (i + 1) * step;
      if (index <= middleEnd && !selectedIndices.includes(index)) {
        selectedIndices.push(index);
      }
    }
  }
  
  while (selectedIndices.length < BUNDLED_VIDEO_SCENES) {
    for (let i = 0; i < sceneCount; i++) {
      if (!selectedIndices.includes(i)) {
        selectedIndices.push(i);
        break;
      }
    }
  }
  
  return selectedIndices.sort((a, b) => a - b);
}

export function estimateVideoCost(
  sceneCount: number,
  tier: VideoQualityTier = 'budget'
): { cost: number; credits: number } {
  const tierConfig = FULL_CINEMATIC_TIERS[tier];
  
  if (sceneCount <= BUNDLED_VIDEO_SCENES) {
    return {
      cost: sceneCount * 0.30,
      credits: 1,
    };
  }
  
  return {
    cost: sceneCount * tierConfig.costPerScene,
    credits: tierConfig.credits,
  };
}
