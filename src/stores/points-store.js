// src/stores/points-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

export const usePointsStore = create()(
  persist(
    (set, get) => ({
      points: 0,
      currentLevel: 'Pearl',
      nextLevel: 'Aquamarine',
      pointsToNextLevel: 250,

      // ---- NEW: reset everything (used on logout) ----
      reset: () => set({
        points: 0,
        currentLevel: 'Pearl',
        nextLevel: 'Aquamarine',
        pointsToNextLevel: 250,
      }),

      setPoints: (newPoints) => {
        const currentLevelObj = LEVELS.reduce((prev, cur) =>
          newPoints >= cur.threshold ? cur : prev,
        LEVELS[0]);

        const nextIdx = LEVELS.findIndex(l => l.name === currentLevelObj.name) + 1;
        const nextLevel = nextIdx < LEVELS.length ? LEVELS[nextIdx].name : null;
        const pointsToNextLevel = nextLevel
          ? LEVELS.find(l => l.name === nextLevel).threshold - newPoints
          : 0;

        set({
          points: newPoints,
          currentLevel: currentLevelObj.name,
          nextLevel,
          pointsToNextLevel,
        });
      },

      addPoints: (pts) => {
        const newPts = get().points + pts;
        get().setPoints(newPts);
      },
    }),
    {
      name: 'points-storage',               // <-- key in localStorage
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          return str ? JSON.parse(str) : null;
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          localStorage.removeItem(name);
        },
      },
    }
  )
);

/* -------------------------------------------------------------
   Sync with backend – unchanged, just exported for convenience
   ------------------------------------------------------------- */
export const syncPointsFromBackend = async (api) => {
  try {
    const { data } = await api.get('/user/settings');
    usePointsStore.getState().setPoints(data.points ?? 0);
  } catch (err) {
    console.error('Error syncing points:', err);
  }
};