'use client';

// src/components/BottomNavBar.tsx (نسخه باز طراحی شده)

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, Home, User, Settings } from 'lucide-react';
import { useI18n } from './i18n';

const NavItem: React.FC<{
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}> = ({ href, icon, label, isActive }) => {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center justify-center gap-1 rounded-2xl px-4 py-2 text-[13px] font-semibold transition-all ${
        isActive
          ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/20'
          : 'text-gray-600 hover:text-gray-900'
      }`}
      aria-label={label}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
};

const BottomNavBar: React.FC = () => {
  const pathname = usePathname();
  const t = useI18n();

  const items = [
    { href: '/settings', icon: <Settings size={22} />, label: t.settings },
    { href: '/explore', icon: <Compass size={22} />, label: t.explore },
    { href: '/', icon: <Home size={24} />, label: t.home },
    { href: '/profile', icon: <User size={22} />, label: t.profile },
  ];

  return (
    <nav
      className="fixed bottom-4 right-0 left-0 z-30 px-4"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.5rem)' }}
    >
      <div className="mx-auto flex w-full max-w-lg items-end justify-between rounded-[28px] border border-white/60 bg-white/90 md:bg-white/80 px-4 py-3 md:backdrop-blur-2xl shadow-2xl">
        {items.map((item) => (
          <NavItem key={item.href} {...item} isActive={pathname === item.href} />
        ))}
      </div>
    </nav>
  );
};

export default BottomNavBar;
