'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/utils/axios';

const ProfileStats = () => {
  const [user, setUser] = useState<any>(null);
  const [postCount, setPostCount] = useState(0);
  const [favCount, setFavCount] = useState(0);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return;
    const u = JSON.parse(userStr);
    setUser(u);

    const uid = u.UserId || u.userId || u.Id || u.id;
    if (!uid) {
        console.warn("ProfileStats: No User ID found in storage");
        return;
    }

    api.get(`/Post/user/${uid}/count`)
      .then(r => {
        if (r.data.success || r.data.Success) {
          setPostCount(r.data.postCount || r.data.PostCount || 0);
        }
      })
      .catch(() => {});

    api.get(`/Favourite/user/${uid}/detailed`)
      .then(r => {
        if (r.data.success || r.data.Success) {
          setFavCount(r.data.totalFavourites || r.data.TotalFavourites || 0);
        }
      })
      .catch(() => {});
  }, []);

  const initials = user
    ? `${(user.FirstName || user.firstName || '?').charAt(0)}${(user.LastName || user.lastName || '').charAt(0)}`
    : '?';

  return (
    <>
      <aside className="hidden md:block md:col-span-3 space-y-6">
        <div className="bg-surface-container-lowest rounded-lg p-8 shadow-editorial-shadow sticky top-32">
          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full overflow-hidden mb-4 p-1 bg-gradient-to-tr from-secondary-fixed to-primary flex items-center justify-center text-3xl font-black text-white">
              {initials}
            </div>
            <h2 className="font-headline font-extrabold text-xl text-primary">
              {user ? `${user.FirstName || user.firstName} ${user.LastName || user.lastName}` : 'Guest'}
            </h2>
            <p className="text-sm text-on-surface-variant mb-6">
              {user?.Role || user?.role || 'Community Member'}
            </p>
            <div className="w-full space-y-4 text-left border-t border-surface-container pt-6">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">My Posts</span>
                <span className="font-bold text-primary">{postCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Favourites</span>
                <span className="font-bold text-primary">{favCount}</span>
              </div>
            </div>
            <Link
              href="/Profile"
              className="mt-8 w-full py-3 bg-primary text-on-primary rounded-xl font-bold tracking-tight text-center block scale-95 active:opacity-80 transition-all hover:bg-primary-container"
            >
              My Profile
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
};

export default ProfileStats;