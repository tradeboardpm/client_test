// src/lib/auth.ts
import Cookies from 'js-cookie';
import { toast } from 'sonner';
import { usePointsStore } from '@/stores/points-store';

export const logoutAndClearAll = async (router) => {
  const token = Cookies.get('token');

  // 1. Fire-and-forget logout
  if (token) {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }).catch(() => {});
  }

  // 2. Properly reset points store (this is now safe!)
  usePointsStore.getState().reset(); // This does set(INITIAL_STATE) + clearStorage()

  // 3. Reset theme
  const savedTheme = localStorage.getItem('theme') || 'light';
  localStorage.clear();
  localStorage.setItem('theme', savedTheme);
  document.documentElement.classList.toggle('dark', savedTheme === 'dark');

  // 4. Clear cookies
  Object.keys(Cookies.get()).forEach((name) => Cookies.remove(name));

  // 5. Done
  toast.success('Logged out successfully');
  router.push('/login');
};