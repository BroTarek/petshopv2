'use client';

import Link from 'next/link';
import React from 'react';
import { usePathname } from 'next/navigation';

const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Pets', href: '/Pets' },
    { label: 'Shop', href: '/Dashboard' },
    { label: 'Services', href: '/Posts' },
    { label: 'About Us', href: '/Favourites' },
    { label: 'Login', href: '/Login' },
    { label: 'Register', href: '/Register' },
];

const TopNavBar = () => {
  const pathname = usePathname();

  return (
      <nav className="fixed top-0 w-full z-50 bg-surface/80 dark:bg-primary-container/80 backdrop-blur-md">
        <div className="flex justify-between items-center px-6 md:px-12 py-6 w-full max-w-screen-2xl mx-auto">
            <div className="text-2xl font-black tracking-tighter text-on-surface dark:text-surface font-headline">
                The Curated Companion
            </div>
            <div className="hidden md:flex gap-8 items-center">
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
            <div className="flex items-center gap-6">
                <button className="scale-95 active:duration-150 text-on-surface dark:text-surface">
                    <span className="material-symbols-outlined" data-icon="shopping_cart">shopping_cart</span>
                </button>
                <button className="md:hidden text-on-surface dark:text-surface">
                    <span className="material-symbols-outlined" data-icon="menu">menu</span>
                </button>
            </div>
        </div>
    </nav>
  )
}

export default TopNavBar;