'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const TopNavBar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const load = () => {
      const s = localStorage.getItem('user');
      setUser(s ? JSON.parse(s) : null);
    };
    load();
    window.addEventListener('storage', load);
    return () => window.removeEventListener('storage', load);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/Login');
  };

  const guestNav = [
    { label: 'Home', href: '/' },
    { label: 'Pets', href: '/Pets' },
    { label: 'Posts', href: '/Posts' },
    { label: 'Login', href: '/Login' },
    { label: 'Register', href: '/Register' },
  ];

  const userNav = [
    { label: 'Home', href: '/' },
    { label: 'Pets', href: '/Pets' },
    { label: 'Posts', href: '/Posts' },
    { label: 'Dashboard', href: '/Dashboard' },
    { label: 'Favourites', href: '/Favourites' },
    { label: 'Profile', href: '/Profile' },
    ...(user?.Role === 'Admin' || user?.role === 'Admin'
      ? [{ label: '⚙ Admin', href: '/Dashboard?tab=admin' }]
      : []),
  ];

  const navItems = user ? userNav : guestNav;

  return (
    <nav className="fixed top-0 w-full z-50 bg-surface/80 dark:bg-primary-container/80 backdrop-blur-md">
      <div className="flex justify-between items-center px-6 md:px-12 py-5 w-full max-w-screen-2xl mx-auto">
        <div className="text-2xl font-black tracking-tighter text-on-surface dark:text-surface font-headline">
          The Curated Companion
        </div>
        <div className="hidden md:flex gap-6 items-center">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`font-headline font-bold tracking-tight text-sm pb-1 hover:text-on-surface transition-colors ${
                  isActive
                    ? 'text-on-surface dark:text-surface border-b-2 border-secondary-fixed'
                    : 'text-on-surface-variant dark:text-outline-variant border-b-2 border-transparent'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="hidden md:block text-sm font-bold text-on-surface-variant">
                {user.FirstName || user.firstName} 👋
              </span>
              <button
                onClick={handleLogout}
                className="text-xs font-bold text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-full transition-colors"
              >
                Logout
              </button>
            </div>
          ) : null}
          <button className="md:hidden text-on-surface dark:text-surface">
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default TopNavBar;