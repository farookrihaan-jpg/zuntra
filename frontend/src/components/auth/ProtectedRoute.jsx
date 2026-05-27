import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '@/store/authStore';
import AuthModal from './AuthModal';

export default function ProtectedRoute({ children }) {
  const { user, token } = useAuthStore();
  const [showAuth, setShowAuth] = useState(false);

  // Has token but user not yet loaded — show nothing briefly
  if (token && !user) return null;

  if (!user) {
    return (
      <>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <p className="text-text-2 text-lg">Sign in to view this page</p>
          <button className="btn btn-primary" onClick={() => setShowAuth(true)}>Sign in</button>
        </div>
        {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      </>
    );
  }

  return children;
}
