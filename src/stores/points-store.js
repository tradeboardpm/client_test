// src/stores/points-store.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const LEVELS = [
  { name: 'Pearl',      threshold: 250 },   // First achievable level
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
  currentLevel: null, // null when below Pearl (250)
  nextLevel: LEVELS[0].name, // Pearl
  pointsToNextLevel: LEVELS[0].threshold, // 250
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

        // Below Pearl level (< 250)
        if (points < LEVELS[0].threshold) {
          const progressToNextLevel = Math.round(
            (points / LEVELS[0].threshold) * 100
          );

          set({
            points,
            currentLevel: null, // No current level yet
            nextLevel: LEVELS[0].name, // Pearl
            pointsToNextLevel: LEVELS[0].threshold - points,
            progressToNextLevel,
          });
          return;
        }

        // Find the current level (>= 250)
        let currentLevelObj = LEVELS[0];
        let nextLevelObj = LEVELS[1];

        for (let i = LEVELS.length - 1; i >= 0; i--) {
          if (points >= LEVELS[i].threshold) {
            currentLevelObj = LEVELS[i];
            nextLevelObj = LEVELS[i + 1] || null;
            break;
          }
        }

        const currentThreshold = currentLevelObj.threshold;
        const nextThreshold = nextLevelObj?.threshold || currentThreshold;

        // Calculate progress to next level
        const pointsInCurrentTier = points - currentThreshold;
        const tierSize = nextThreshold - currentThreshold;
        
        const progressToNextLevel = nextLevelObj
          ? Math.min(100, Math.round((pointsInCurrentTier / tierSize) * 100))
          : 100;

        set({
          points,
          currentLevel: currentLevelObj.name,
          nextLevel: nextLevelObj?.name || null,
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
      name: "points-storage",
      storage: createJSONStorage(() => localStorage),
      version: 2, // Increment version for the change
    }
  )
);