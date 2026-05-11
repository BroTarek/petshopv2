'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/axios';

export default function CreatePostPage() {
    const router = useRouter();
    const [userId, setUserId] = useState('');
    const [formData, setFormData] = useState({
        petId: '',
        title: '',
        description: '',
        content: ''
    });
    const [image, setImage] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [myPets, setMyPets] = useState<any[]>([]);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            router.push('/Login');
            return;
        }
        const user = JSON.parse(userStr);
        const uid = user.userId || user.UserId || user.Id || user.id;
        setUserId(uid);

        // Fetch user's pets to populate the Pet Select dropdown
        const fetchMyPets = async () => {
            try {
                const res = await api.get(`/Pet/owner/${uid}`);
                const ok = res.data.Success || res.data.success;
                const pts = res.data.Pets || res.data.pets;
                if (ok) {
                    setMyPets(pts || []);
                }
            } catch (err) {
                console.error("Failed to fetch user pets", err);
            }
        };
        fetchMyPets();
    }, [router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const fd = new FormData();
            fd.append('UserId', userId);
            fd.append('PetId', formData.petId);
            fd.append('Title', formData.title);
            fd.append('Description', formData.description);
            fd.append('Content', formData.content);
            if (image) fd.append('image', image);

            const response = await api.post('/Post/create', fd);
            
            const ok = response.data.Success || response.data.success;
            if (ok) {
                router.push('/Posts');
            } else {
                setError(response.data.Error || 'Failed to create post');
            }
        } catch (err: any) {
            setError(err.response?.data?.Error || err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="pt-24 pb-12 max-w-3xl mx-auto px-6 min-h-screen">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-8 border-b border-slate-100 bg-slate-50">
                    <h1 className="text-3xl font-extrabold text-slate-800">Create a New Post</h1>
                    <p className="text-slate-500 mt-2">Share an update, a story, or a milestone with the community.</p>
                </div>
                
                <div className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Title</label>
                            <input 
                                type="text" 
                                name="title"
                                required
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="E.g., Beau's first day at the park!"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-slate-800"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Link to Pet (Optional)</label>
                            <select 
                                name="petId"
                                value={formData.petId}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white cursor-pointer text-slate-800"
                            >
                                <option value="">No specific pet</option>
                                {myPets.map(pet => (
                                    <option key={pet.petId} value={pet.petId}>{pet.name} ({pet.breed})</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Post Photo (Optional)</label>
                            <div className="relative group">
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={e => setImage(e.target.files ? e.target.files[0] : null)} 
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                                />
                                <div className={`border-2 border-dashed rounded-2xl p-8 transition-all duration-300 flex flex-col items-center justify-center gap-3 ${image ? 'border-blue-400 bg-blue-50/30' : 'border-slate-200 bg-slate-50 group-hover:border-blue-400 group-hover:bg-blue-50/50'}`}>
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${image ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                                        <span className="material-symbols-outlined">{image ? 'check_circle' : 'add_photo_alternate'}</span>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-bold text-slate-700">
                                            {image ? image.name : 'Click or Drag to Upload'}
                                        </p>
                                        <p className="text-xs text-slate-500 mt-1">PNG, JPG up to 10MB</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Short Description</label>
                            <input 
                                type="text" 
                                name="description"
                                required
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="A brief summary of your post"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-slate-800"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Content</label>
                            <textarea 
                                name="content"
                                rows={6}
                                required
                                value={formData.content}
                                onChange={handleChange}
                                placeholder="Write your full story here..."
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-y text-slate-800"
                            ></textarea>
                        </div>

                        <div className="pt-4 flex justify-end gap-4 border-t border-slate-100">
                            <button 
                                type="button"
                                onClick={() => router.back()}
                                className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit"
                                disabled={loading}
                                className={`px-8 py-3 rounded-xl font-bold text-white transition ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                            >
                                {loading ? 'Publishing...' : 'Publish Post'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    );
}