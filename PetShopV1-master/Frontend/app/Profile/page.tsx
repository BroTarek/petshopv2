'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/axios';
import MyPostsTab from './(tabs)/MyPostsTab';
import MyPetsTab from './(tabs)/MyPetsTab';
import AdoptionsTab from './(tabs)/AdoptionsTab';
import ReviewsTab from './(tabs)/ReviewsTab';
import SettingsTab from './(tabs)/SettingsTab';
import UsersTab from './(tabs)/UsersTab';
import FavouritesTab from './(tabs)/FavouritesTab';

type Tab = 'overview' | 'pets' | 'posts' | 'favourites' | 'adoptions' | 'reviews' | 'users' | 'settings';

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ firstName: '', lastName: '' });
  const [message, setMessage] = useState('');
  const [userId, setUserId] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) { router.push('/Login'); return; }
    const u = JSON.parse(userStr);
    const uid = u.userId || u.UserId || u.Id || u.id;
    setUserId(uid);
    setIsAdmin(u.role === 'Admin' || u.Role === 'Admin');

    api.get(`/User/${uid}/profile`)
      .then(r => {
        const ok = r.data.Success || r.data.success;
        const prof = r.data.Profile || r.data.profile;
        if (ok && prof) {
          setProfile(prof);
          setFormData({ firstName: prof.firstName, lastName: prof.lastName });
        }
      })
      .catch(() => {
        // If profile fetch fails, user might be deleted or token expired
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        router.push('/Login');
      })
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
        setMessage('Profile successfully updated.');
        
        // Update local storage user name
        const u = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({ ...u, firstName: formData.firstName, lastName: formData.lastName }));
        window.dispatchEvent(new Event('storage'));
      }
    } catch { setMessage('Update failed. Please try again.'); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
  
  if (!profile) return null;

  const initials = `${(profile.firstName || '?').charAt(0)}${(profile.lastName || '').charAt(0)}`;

  const tabs: { key: Tab; label: string; icon: string; adminOnly?: boolean }[] = [
    { key: 'overview',   label: 'Overview',   icon: 'person' },
    { key: 'pets',       label: 'My Pets',    icon: 'pets' },
    { key: 'posts',      label: 'My Posts',   icon: 'article' },
    { key: 'favourites', label: 'Loved',      icon: 'favorite' },
    { key: 'adoptions',  label: 'Adoptions',  icon: 'handshake' },
    { key: 'reviews',    label: 'Reviews',    icon: 'star' },
    { key: 'users',      label: 'Members',    icon: 'admin_panel_settings', adminOnly: true },
    { key: 'settings',   label: 'Settings',   icon: 'settings' },
  ];

  const visibleTabs = tabs.filter(t => !t.adminOnly || isAdmin);

  return (
    <main className="pt-32 pb-24 bg-background min-h-screen">
      <div className="max-w-6xl mx-auto px-6 lg:px-12">
        {/* Profile Hero */}
        <div className="bg-surface-container-lowest rounded-3xl border border-surface-container overflow-hidden shadow-editorial-shadow mb-10">
          <div className="h-40 bg-gradient-to-br from-primary via-slate-800 to-primary-container relative">
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
          </div>
          <div className="px-10 pb-10 relative">
            <div className="absolute -top-14 left-10 w-32 h-32 rounded-3xl bg-surface-container-lowest p-1 shadow-xl">
               <div className="w-full h-full bg-gradient-to-tr from-secondary-fixed to-primary rounded-[2rem] flex items-center justify-center text-4xl font-black text-white">
                {initials}
              </div>
            </div>
            
            <div className="pt-20 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div>
                <h1 className="text-4xl font-black text-primary font-headline tracking-tighter leading-none mb-2">
                  {profile.firstName} {profile.lastName}
                </h1>
                <p className="text-on-surface-variant font-medium flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">mail</span> {profile.email}
                </p>
              </div>
              <div className="flex gap-3">
                <div className="px-5 py-2 bg-secondary-fixed text-on-secondary-fixed rounded-full text-xs font-black uppercase tracking-widest">
                  {profile.role}
                </div>
                <div className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest ${profile.accountStatus === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {profile.accountStatus}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Sidebar Navigation */}
          <aside className="lg:col-span-3 space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant mb-4 px-4">Account Navigator</p>
            {visibleTabs.map(t => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold text-sm transition-all duration-300 ${
                  activeTab === t.key 
                  ? 'bg-primary text-on-primary shadow-editorial-shadow translate-x-1' 
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-primary'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{t.icon}</span>
                {t.label}
              </button>
            ))}
          </aside>

          {/* Main Content Area */}
          <section className="lg:col-span-9 bg-surface-container-lowest rounded-3xl border border-surface-container p-10 shadow-editorial-shadow min-h-[600px]">
            {activeTab === 'overview' && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex justify-between items-center mb-10 pb-6 border-b border-surface-container">
                  <h2 className="text-2xl font-black text-primary font-headline tracking-tight">Identity Details</h2>
                  {!editing && (
                    <button 
                      onClick={() => setEditing(true)} 
                      className="flex items-center gap-2 bg-surface-container hover:bg-surface-container-high px-6 py-2.5 rounded-xl text-sm font-bold transition-all"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit_note</span>
                      Edit Identity
                    </button>
                  )}
                </div>

                {message && (
                  <div className="mb-8 p-4 bg-secondary-fixed/30 text-on-secondary-fixed-variant rounded-2xl border border-secondary-fixed font-bold text-sm flex items-center gap-3">
                    <span className="material-symbols-outlined">verified</span>
                    {message}
                  </div>
                )}

                {editing ? (
                  <form onSubmit={handleUpdate} className="space-y-8 max-w-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[
                        { id: 'firstName', label: 'First Name' },
                        { id: 'lastName', label: 'Last Name' }
                      ].map(field => (
                        <div key={field.id}>
                          <label className="block text-xs font-black text-on-surface-variant uppercase tracking-widest mb-3">{field.label}</label>
                          <input 
                            value={(formData as any)[field.id]} 
                            onChange={e => setFormData(f => ({ ...f, [field.id]: e.target.value }))}
                            className="w-full bg-surface-container-low border-2 border-transparent focus:border-primary rounded-2xl px-6 py-4 text-sm font-bold transition-all outline-none"
                            required
                          />
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-4 pt-4">
                      <button type="submit" className="flex-1 bg-primary text-on-primary py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:opacity-90 transition-all">
                        Update Identity
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setEditing(false)} 
                        className="flex-1 border-2 border-surface-container py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-surface-container-low transition-all"
                      >
                        Discard
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {[
                      { label: 'Official First Name', val: profile.firstName },
                      { label: 'Official Last Name', val: profile.lastName },
                      { label: 'Registered Email', val: profile.email },
                      { label: 'Global Role', val: profile.role },
                      { label: 'Account Authority', val: profile.accountStatus },
                      { label: 'Member Since', val: new Date(profile.createdAt).toLocaleDateString() }
                    ].map(item => (
                      <div key={item.label} className="group">
                        <span className="block text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-2">{item.label}</span>
                        <span className="block text-lg font-extrabold text-primary group-hover:translate-x-1 transition-transform">{item.val}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'pets'      && <MyPetsTab      userId={userId} />}
            {activeTab === 'posts'     && <MyPostsTab     userId={userId} />}
            {activeTab === 'favourites' && <FavouritesTab userId={userId} />}
            {activeTab === 'adoptions' && <AdoptionsTab  userId={userId} />}
            {activeTab === 'reviews'   && <ReviewsTab     userId={userId} />}
            {activeTab === 'users'     && <UsersTab />}
            {activeTab === 'settings'  && <SettingsTab   userId={userId} />}
          </section>
        </div>
      </div>
    </main>
  );
}
