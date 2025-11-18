// src/stores/points-store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';


const LEVELS = [
  { name: 'Pearl',      threshold: 250 },
  { name: 'Aquamarine', threshold: 500 },
  { name: 'Topaz',      threshold: 750 },
  { name: 'Opal',       threshold: 1000 },
  { name: 'Sapphire',   threshold: 1250 },
  { name: 'Emerald',    threshold: 1500 },
  { name: 'Ruby',       threshold: 1750 },
  { name: 'Diamond',    threshold: 2000 },
];

const INITIAL_STATE = {
  points: 0,
  currentLevel: LEVELS[0].name,
  nextLevel: LEVELS[1].name,
  pointsToNextLevel: LEVELS[1].threshold,
  progressToNextLevel: 0,
  totalLevels: LEVELS.length,
};

export const usePointsStore = create()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,

      reset: () => set(INITIAL_STATE),

      setPoints: (newPoints) => {
        const points = Math.max(0, newPoints);

        // Find current level
        let currentLevelObj = LEVELS[0];
        let nextLevelObj = null;

        for (const level of LEVELS) {
          if (points >= level.threshold) {
            currentLevelObj = level;
          } else {
            nextLevelObj = level;
            break;
          }
        }

        // If max level reached
        if (!nextLevelObj) {
          nextLevelObj = null;
        }

        const currentThreshold = currentLevelObj.threshold;
        const nextThreshold = nextLevelObj?.threshold ?? currentThreshold;
        const pointsInCurrentTier = points - (currentThreshold - (currentLevelObj === LEVELS[0] ? 0 : LEVELS[LEVELS.indexOf(currentLevelObj) - 1]?.threshold || 0));
        const tierSize = nextThreshold - currentThreshold;

        const progressToNextLevel = nextLevelObj
          ? Math.min(100, Math.round((pointsInCurrentTier / tierSize) * 100))
          : 100;

        set({
          points,
          currentLevel: currentLevelObj.name,
          nextLevel: nextLevelObj?.name ?? null,
          pointsToNextLevel: nextLevelObj ? nextThreshold - points : 0,
          progressToNextLevel,
        });
      },

      addPoints: (amount) => {
        const newTotal = get().points + amount;
        get().setPoints(newTotal);
      },
    }),
    {
      name: 'points-storage',
      storage: createJSONStorage(() => localStorage),
      // Optional: migrate old data if needed
      version: 1,
    }
  )
);