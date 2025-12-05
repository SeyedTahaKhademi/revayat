// تمامی حقوق این فایل متعلق به تیم شهید بابایی است.
// src/components/Layout.tsx

import React from 'react';
import Header from './Header';
import BottomNavBar from './BottomNavBar';
import SavedModal from './SavedModal';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="app-shell min-h-screen w-full flex flex-col items-center px-3 sm:px-4">
      <Header />

      {/* محتوای اصلی در کانتینر گلس شیک */}
      <main
        className="flex-grow w-full max-w-5xl pt-20 pb-32 md:pt-24 md:pb-16 transition-all"
        style={{ paddingBottom: 'calc(9rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <div className="glass-panel rounded-[24px] md:rounded-[32px] p-4 md:p-10 border border-white/40">
          {children}
        </div>
      </main>

      <BottomNavBar />
      <SavedModal />
    </div>
  );
};

export default Layout;
