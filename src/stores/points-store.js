import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Define the levels and their point thresholds
const LEVELS = [
  { name: 'Pearl', threshold: 250 },
  { name: 'Aquamarine', threshold: 500 },
  { name: 'Topaz', threshold: 750 },
  { name: 'Opal', threshold: 1000 },
  { name: 'Sapphire', threshold: 1250 },
  { name: 'Emerald', threshold: 1500 },
  { name: 'Ruby', threshold: 1750 },
  { name: 'Diamond', threshold: 2000 }
];


export const usePointsStore = create()(
  persist(
    (set, get) => ({
      points: 0,
      currentLevel: 'Pearl',
      nextLevel: 'Aquamarine',
      pointsToNextLevel: 250,

      // Set points directly
      setPoints: (newPoints) => {
        const currentLevelObj = LEVELS.reduce((prev, current) => 
          newPoints >= current.threshold ? current : prev
        , LEVELS[0]);

        const nextLevelIndex = LEVELS.findIndex(l => l.name === currentLevelObj.name) + 1;
        const nextLevel = nextLevelIndex < LEVELS.length ? LEVELS[nextLevelIndex].name : null;
        const pointsToNextLevel = nextLevel 
          ? LEVELS.find(l => l.name === nextLevel).threshold 
          : 0;

        set({
          points: newPoints,
          currentLevel: currentLevelObj.name,
          nextLevel,
          pointsToNextLevel: pointsToNextLevel - newPoints
        });
      },

      // Add points to the current total
      addPoints: (pointsToAdd) => {
        const newPoints = get().points + pointsToAdd;
        get().setPoints(newPoints);
      }
    }),
    {
      name: 'points-storage', // unique name
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

// // Optional: Helper function to sync points from backend
// export const syncPointsFromBackend = async (api) => {
//   try {
//     const response = await api.get("/user/settings");
//     const points = response.data.points || 0;
//     usePointsStore.getState().setPoints(points);
//   } catch (error) {
//     console.error("Error syncing points:", error);
//   }
// };
