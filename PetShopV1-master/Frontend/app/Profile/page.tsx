'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/axios';

export default function ProfilePage() {
    const router = useRouter();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({ firstName: '', lastName: '' });
    const [message, setMessage] = useState('');

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            router.push('/Login');
            return;
        }

        const fetchProfile = async () => {
            const user = JSON.parse(userStr);
            try {
                const response = await api.get(`/User/${user.Id}/profile`);
                if (response.data && response.data.Success) {
                    setProfile(response.data.Profile);
                    setFormData({
                        firstName: response.data.Profile.firstName,
                        lastName: response.data.Profile.lastName
                    });
                }
            } catch (err) {
                console.error("Failed to fetch profile", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [router]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');

        try {
            const userStr = localStorage.getItem('user');
            if (!userStr) return;
            const user = JSON.parse(userStr);

            const response = await api.put(`/User/${user.Id}/profile`, formData);
            if (response.data.Success) {
                setProfile({ ...profile, ...formData });
                setEditing(false);
                setMessage('Profile updated successfully!');
            }
        } catch (err) {
            setMessage('Failed to update profile.');
            console.error(err);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/Login');
    };

    if (loading) return <div className="min-h-screen pt-32 pb-20 text-center">Loading profile...</div>;

    if (!profile) return <div className="min-h-screen pt-32 pb-20 text-center text-red-500">Failed to load profile.</div>;

    return (
        <main className="pt-32 pb-20 max-w-3xl mx-auto px-6 min-h-screen">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
                <div className="px-8 pb-8 relative">
                    <div className="absolute -top-16 border-4 border-white w-32 h-32 bg-slate-200 rounded-full flex items-center justify-center text-4xl text-slate-500 font-bold shadow-sm">
                        {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
                    </div>
                    
                    <div className="mt-20 flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-extrabold text-slate-800">{profile.firstName} {profile.lastName}</h1>
                            <p className="text-slate-500">{profile.email}</p>
                            <span className="mt-2 inline-block bg-blue-50 text-blue-700 font-bold text-xs px-3 py-1 rounded-full uppercase tracking-widest">
                                {profile.role}
                            </span>
                        </div>
                        <button 
                            onClick={handleLogout}
                            className="text-red-500 hover:text-red-600 font-bold flex items-center gap-2 border border-red-100 hover:bg-red-50 px-4 py-2 rounded-xl transition"
                        >
                            <span className="material-symbols-outlined text-sm">logout</span>
                            Logout
                        </button>
                    </div>

                    <div className="mt-12 pt-8 border-t border-slate-100">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-slate-800">Personal Information</h2>
                            {!editing && (
                                <button 
                                    onClick={() => setEditing(true)}
                                    className="text-blue-600 hover:text-blue-700 font-bold text-sm bg-blue-50 px-4 py-2 rounded-lg"
                                >
                                    Edit Profile
                                </button>
                            )}
                        </div>

                        {message && (
                            <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl border border-green-100 text-sm">
                                {message}
                            </div>
                        )}

                        {editing ? (
                            <form onSubmit={handleUpdate} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">First Name</label>
                                        <input 
                                            type="text" 
                                            value={formData.firstName}
                                            onChange={e => setFormData({...formData, firstName: e.target.value})}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Last Name</label>
                                        <input 
                                            type="text" 
                                            value={formData.lastName}
                                            onChange={e => setFormData({...formData, lastName: e.target.value})}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <button type="submit" className="bg-blue-600 text-white font-bold py-2 px-6 rounded-xl hover:bg-blue-700 transition">
                                        Save Changes
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => { setEditing(false); setFormData({ firstName: profile.firstName, lastName: profile.lastName }) }}
                                        className="text-slate-600 font-bold py-2 px-6 rounded-xl border border-slate-200 hover:bg-slate-50 transition"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <span className="block text-sm text-slate-500 font-medium mb-1">First Name</span>
                                    <span className="block text-slate-800 font-bold">{profile.firstName}</span>
                                </div>
                                <div>
                                    <span className="block text-sm text-slate-500 font-medium mb-1">Last Name</span>
                                    <span className="block text-slate-800 font-bold">{profile.lastName}</span>
                                </div>
                                <div>
                                    <span className="block text-sm text-slate-500 font-medium mb-1">Email Address</span>
                                    <span className="block text-slate-800 font-bold">{profile.email}</span>
                                </div>
                                <div>
                                    <span className="block text-sm text-slate-500 font-medium mb-1">Status</span>
                                    <span className="block text-slate-800 font-bold">{profile.isActive ? 'Active' : 'Inactive'}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
