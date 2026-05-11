'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/axios';
import MyPostsTab from './(tabs)/MyPostsTab';
import MyPetsTab from './(tabs)/MyPetsTab';
import AdoptionsTab from './(tabs)/AdoptionsTab';
import ReviewsTab from './(tabs)/ReviewsTab';
import SettingsTab from './(tabs)/SettingsTab';

type Tab = 'overview' | 'pets' | 'posts' | 'adoptions' | 'reviews' | 'settings';

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'overview',   label: 'Overview',   icon: 'person' },
  { key: 'pets',       label: 'My Pets',    icon: 'pets' },
  { key: 'posts',      label: 'My Posts',   icon: 'article' },
  { key: 'adoptions',  label: 'Adoptions',  icon: 'handshake' },
  { key: 'reviews',    label: 'Reviews',    icon: 'star' },
  { key: 'settings',  label: 'Settings',   icon: 'settings' },
];

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ firstName: '', lastName: '' });
  const [message, setMessage] = useState('');
  const [userId, setUserId] = useState('');

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) { router.push('/Login'); return; }
    const u = JSON.parse(userStr);
    const uid = u.userId || u.UserId || u.Id || u.id;
    setUserId(uid);

    api.get(`/User/${uid}/profile`)
      .then(r => {
        const ok = r.data.Success || r.data.success;
        const prof = r.data.Profile || r.data.profile;
        if (ok && prof) {
          setProfile(prof);
          setFormData({ firstName: prof.firstName, lastName: prof.lastName });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    try {
      const r = await api.put(`/User/${userId}/profile`, formData);
      const ok = r.data.Success || r.data.success;
      if (ok) {
        setProfile((p: any) => ({ ...p, ...formData }));
        setEditing(false);
        setMessage('Profile updated!');
      }
    } catch { setMessage('Failed to update.'); }
  };

  if (loading) return <div className="min-h-screen pt-32 text-center text-slate-400">Loading profile...</div>;
  if (!profile) return <div className="min-h-screen pt-32 text-center text-red-500">Failed to load profile.</div>;

  const initials = `${(profile.firstName || '?').charAt(0)}${(profile.lastName || '').charAt(0)}`;

  return (
    <main className="pt-28 pb-20 max-w-5xl mx-auto px-6 min-h-screen">
      {/* Hero banner */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6">
        <div className="h-28 bg-gradient-to-r from-blue-600 to-indigo-600" />
        <div className="px-8 pb-6 relative">
          <div className="absolute -top-10 w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-2xl font-black text-white border-4 border-white shadow">
            {initials}
          </div>
          <div className="pt-12 flex justify-between items-end flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-800">{profile.firstName} {profile.lastName}</h1>
              <p className="text-slate-500 text-sm">{profile.email}</p>
              <span className="mt-1 inline-block bg-blue-50 text-blue-700 font-bold text-xs px-3 py-0.5 rounded-full uppercase tracking-widest">{profile.role}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-6 overflow-x-auto">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === t.key ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}>
            <span className="material-symbols-outlined text-[16px]">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        {activeTab === 'overview' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">Personal Information</h2>
              {!editing && (
                <button onClick={() => setEditing(true)} className="text-blue-600 text-sm font-bold bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition">Edit</button>
              )}
            </div>
            {message && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-xl border border-green-200 text-sm">{message}</div>}
            {editing ? (
              <form onSubmit={handleUpdate} className="space-y-4 max-w-md">
                <div className="grid grid-cols-2 gap-4">
                  {[['firstName', 'First Name'], ['lastName', 'Last Name']].map(([k, label]) => (
                    <div key={k}>
                      <label className="block text-sm font-bold text-slate-700 mb-1">{label}</label>
                      <input value={(formData as any)[k]} onChange={e => setFormData(f => ({ ...f, [k]: e.target.value }))}
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 text-sm" />
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button type="submit" className="bg-blue-600 text-white font-bold py-2 px-6 rounded-xl hover:bg-blue-700 transition">Save</button>
                  <button type="button" onClick={() => setEditing(false)} className="border border-slate-200 font-bold py-2 px-6 rounded-xl hover:bg-slate-50">Cancel</button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-2 gap-6 max-w-md">
                {[['First Name', profile.firstName], ['Last Name', profile.lastName], ['Email', profile.email], ['Status', profile.accountStatus]].map(([label, val]) => (
                  <div key={label}>
                    <span className="block text-xs text-slate-500 font-medium mb-1">{label}</span>
                    <span className="block text-slate-800 font-bold">{val}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {activeTab === 'pets'      && <MyPetsTab    userId={userId} />}
        {activeTab === 'posts'     && <MyPostsTab   userId={userId} />}
        {activeTab === 'adoptions' && <AdoptionsTab userId={userId} />}
        {activeTab === 'reviews'   && <ReviewsTab   userId={userId} />}
        {activeTab === 'settings'  && <SettingsTab  userId={userId} />}
      </div>
    </main>
  );
}
