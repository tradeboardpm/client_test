// src/lib/auth.ts
import Cookies from 'js-cookie';
import { toast } from 'sonner';
import { usePointsStore } from '@/stores/points-store';

export const logoutAndClearAll = (router) => {
  // 1. Fire-and-forget logout request
  const token = Cookies.get('token');
  if (token) {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }).catch(() => {});
  }

  // 2. Fully destroy and reset the points store
  usePointsStore.persist.clearStorage(); // ← THIS IS THE KEY LINE
  usePointsStore.setState({
    points: 0,
    currentLevel: 'Pearl',
    nextLevel: 'Aquamarine',
    pointsToNextLevel: 250,
  });

  // 3. Reset theme
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.classList.remove('dark');
  localStorage.clear();
  localStorage.setItem('theme', savedTheme);
  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark');
  }

  // 4. Clear all cookies
  Object.keys(Cookies.get()).forEach((name) => Cookies.remove(name));

  // 5. Show toast & redirect
  toast.success('Logged out successfully');
  router.push('/login');
};