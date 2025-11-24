// src/stores/points-store.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const LEVELS = [
  { name: 'Pearl',      threshold: 0 },     // default
  { name: 'Aquamarine', threshold: 250 },
  { name: 'Topaz',      threshold: 500 },
  { name: 'Opal',       threshold: 750 },
  { name: 'Sapphire',   threshold: 1000 },
  { name: 'Emerald',    threshold: 1250 },
  { name: 'Ruby',       threshold: 1500 },
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

        // Find the highest level the user has reached
        let currentLevelObj = LEVELS[0];
        let nextLevelObj = LEVELS[1];

        for (let i = LEVELS.length - 1; i >= 0; i--) {
          if (points >= LEVELS[i].threshold) {
            currentLevelObj = LEVELS[i];
            nextLevelObj = LEVELS[i + 1] || null;
            break;
          }
        }

        // Fallback for points < 250
        if (points < LEVELS[0].threshold) {
          currentLevelObj = LEVELS[0];
          nextLevelObj = LEVELS[1];
        }

        const currentThreshold = currentLevelObj.threshold;
        const nextThreshold = nextLevelObj?.threshold || currentThreshold;

        // Points needed within current tier
        const pointsNeededForCurrent =
          currentThreshold -
          (LEVELS[LEVELS.indexOf(currentLevelObj) - 1]?.threshold || 0);
        const pointsInCurrentTier =
          points - (currentThreshold - pointsNeededForCurrent);

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
      // Optional: migrate old data if needed
      version: 1,
    }
  )
);
