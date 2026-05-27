import { useState, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar   from './Navbar';
import Sidebar  from './Sidebar';
import AuthModal   from '@/components/auth/AuthModal';
import UploadModal from '@/components/pins/UploadModal';

export default function Layout() {
  const [authOpen,   setAuthOpen]   = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);

  const openAuth   = useCallback(() => setAuthOpen(true),   []);
  const openUpload = useCallback(() => setUploadOpen(true), []);

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar onAuthRequired={openAuth} />

      <div className="flex-1 flex flex-col min-w-0 ml-0 md:ml-[220px]">
        <Navbar onAuthRequired={openAuth} onUpload={openUpload} />
        <main className="flex-1 pt-[60px] px-4 md:px-7 pb-12">
          <Outlet context={{ openAuth, openUpload }} />
        </main>
      </div>

      {authOpen   && <AuthModal   onClose={() => setAuthOpen(false)} />}
      {uploadOpen && <UploadModal onClose={() => setUploadOpen(false)} />}
    </div>
  );
}
