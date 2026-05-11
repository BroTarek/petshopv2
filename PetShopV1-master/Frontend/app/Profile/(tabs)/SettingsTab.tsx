'use client';
import React, { useState } from 'react';
import api from '@/utils/axios';

export default function SettingsTab({ userId }: { userId: string }) {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(''); setErr('');
    if (form.newPassword !== form.confirmPassword) return setErr('Passwords do not match.');
    if (form.newPassword.length < 6) return setErr('Password must be at least 6 characters.');
    setLoading(true);
    try {
      await api.put(`/Auth/${userId}/change-password`, {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setMsg('Password changed successfully!');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (e: any) {
      setErr(e.response?.data?.Error || 'Failed to change password.');
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-md">
      <h2 className="text-xl font-bold text-slate-800 mb-6">Change Password</h2>
      {msg && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-xl border border-green-200 text-sm">{msg}</div>}
      {err && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl border border-red-200 text-sm">{err}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        {[['currentPassword', 'Current Password'], ['newPassword', 'New Password'], ['confirmPassword', 'Confirm New Password']].map(([key, label]) => (
          <div key={key}>
            <label className="block text-sm font-bold text-slate-700 mb-1">{label}</label>
            <div className="relative">
              <input
                type={showPasswords[key] ? 'text' : 'password'}
                value={(form as any)[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                required
                className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 text-sm text-black"
              />
              <button
                type="button"
                onClick={() => setShowPasswords(prev => ({ ...prev, [key]: !prev[key] }))}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {showPasswords[key] ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>
        ))}
        <button type="submit" disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50">
          {loading ? 'Saving...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
}
