import { usePointsStore } from '@/stores/points-store';
import Cookies from 'js-cookie';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

// -------------------------------------------------------------
// Re-usable logout that clears EVERYTHING (cookies + points)
// -------------------------------------------------------------
export const logoutAndClearAll = (router) => {
  // 1. API logout (optional – fire-and-forget)
  fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${Cookies.get('token')}` },
  }).catch(() => {});

  // 2. Reset theme
  document.documentElement.classList.remove('dark');
  localStorage.setItem('theme', 'light');

  // 3. Clear ALL cookies
  Object.keys(Cookies.get()).forEach(name => Cookies.remove(name));

  // 4. **CRITICAL** – clear the persisted points store
  usePointsStore.getState().reset();               // reset in-memory
  localStorage.removeItem('points-storage');       // delete persisted entry

  // 5. Restore theme after full wipe
  const savedTheme = localStorage.getItem('theme') || 'light';
  localStorage.clear();
  localStorage.setItem('theme', savedTheme);
  if (savedTheme === 'dark') document.documentElement.classList.add('dark');

  // 6. Go to login
  toast.success('Logged out successfully');
  router.push('/login');
};