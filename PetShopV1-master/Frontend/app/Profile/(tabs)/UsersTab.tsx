'use client';

import React, { useEffect, useState } from 'react';
import api from '@/utils/axios';

interface User {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  accountStatus: string;
  createdAt: string;
}

export default function UsersTab() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [subTab, setSubTab] = useState<'pending' | 'all'>('pending');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const endpoint = subTab === 'pending' ? '/User/pending' : '/User/all';
      const r = await api.get(endpoint);
      const data = r.data.users || r.data.Users || [];
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [subTab]);

  const handleAction = async (userId: string, action: 'activate' | 'deactivate') => {
    setActionLoading(`${userId}-${action}`);
    try {
      await api.put(`/User/${userId}/${action}`);
      // Optimistic update
      if (subTab === 'pending' && action === 'activate') {
        setUsers(prev => prev.filter(u => u.userId !== userId));
      } else {
        loadUsers();
      }
    } catch (err: any) {
      alert(err.response?.data?.Error || `Failed to ${action} user.`);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading && users.length === 0) {
    return <div className="py-20 text-center text-on-surface-variant font-medium">Fetching member directory...</div>;
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-black text-primary font-headline tracking-tight">Member Management</h2>
        <div className="flex bg-surface-container p-1 rounded-xl">
          <button 
            onClick={() => setSubTab('pending')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${subTab === 'pending' ? 'bg-surface-container-lowest shadow-sm text-primary' : 'text-on-surface-variant'}`}
          >
            Pending
          </button>
          <button 
            onClick={() => setSubTab('all')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${subTab === 'all' ? 'bg-surface-container-lowest shadow-sm text-primary' : 'text-on-surface-variant'}`}
          >
            All Members
          </button>
        </div>
      </div>

      {users.length === 0 ? (
        <div className="py-20 text-center border-2 border-dashed border-surface-variant rounded-2xl">
          <span className="material-symbols-outlined text-4xl text-outline-variant mb-2">person_off</span>
          <p className="text-on-surface-variant">No {subTab} members found.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {users.map(u => (
            <div key={u.userId} className="group bg-surface-container-low rounded-2xl p-5 border border-transparent hover:border-outline-variant transition-all flex flex-col md:flex-row items-start md:items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black ${u.accountStatus === 'Approved' ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-variant text-on-surface-variant'}`}>
                  {u.firstName[0]}{u.lastName[0]}
                </div>
                <div>
                  <h4 className="font-bold text-primary flex items-center gap-2">
                    {u.firstName} {u.lastName}
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter ${u.accountStatus === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {u.accountStatus}
                    </span>
                  </h4>
                  <p className="text-xs text-on-surface-variant">{u.email} · <span className="font-bold uppercase text-[9px] tracking-widest">{u.role}</span></p>
                </div>
              </div>

              <div className="flex gap-2 mt-4 md:mt-0 w-full md:w-auto">
                {u.accountStatus !== 'Approved' ? (
                  <button 
                    onClick={() => handleAction(u.userId, 'activate')}
                    disabled={actionLoading === `${u.userId}-activate`}
                    className="flex-1 md:flex-none bg-primary text-on-primary px-6 py-2.5 rounded-xl text-xs font-bold hover:opacity-90 transition disabled:opacity-50"
                  >
                    {actionLoading === `${u.userId}-activate` ? '...' : 'Approve'}
                  </button>
                ) : (
                  <button 
                    onClick={() => handleAction(u.userId, 'deactivate')}
                    disabled={actionLoading === `${u.userId}-deactivate`}
                    className="flex-1 md:flex-none border border-outline text-on-surface px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-surface-container-high transition disabled:opacity-50"
                  >
                    {actionLoading === `${u.userId}-deactivate` ? '...' : 'Deactivate'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
