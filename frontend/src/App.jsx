import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from '@/store/authStore';

import Layout        from '@/components/layout/Layout';
import HomePage      from '@/pages/HomePage';
import PinPage       from '@/pages/PinPage';
import ProfilePage   from '@/pages/ProfilePage';
import BoardsPage    from '@/pages/BoardsPage';
import BoardPage     from '@/pages/BoardPage';
import SavedPage     from '@/pages/SavedPage';
import SettingsPage  from '@/pages/SettingsPage';
import NotFoundPage  from '@/pages/NotFoundPage';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function App() {
  const fetchMe = useAuthStore(s => s.fetchMe);
  const logout  = useAuthStore(s => s.logout);

  // Bootstrap: rehydrate user from stored token
  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  // Global 401 handler
  useEffect(() => {
    const handler = () => logout();
    window.addEventListener('pv:unauthorized', handler);
    return () => window.removeEventListener('pv:unauthorized', handler);
  }, [logout]);

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index             element={<HomePage />} />
        <Route path="pin/:id"    element={<PinPage />} />
        <Route path="user/:username" element={<ProfilePage />} />
        <Route path="boards"     element={<ProtectedRoute><BoardsPage /></ProtectedRoute>} />
        <Route path="boards/:id" element={<BoardPage />} />
        <Route path="saved"      element={<ProtectedRoute><SavedPage /></ProtectedRoute>} />
        <Route path="settings"   element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="404"        element={<NotFoundPage />} />
        <Route path="*"          element={<Navigate to="/404" replace />} />
      </Route>
    </Routes>
  );
}
