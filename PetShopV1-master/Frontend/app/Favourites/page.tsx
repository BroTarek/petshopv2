'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/axios';
import Link from 'next/link';

export default function FavouritesPage() {
    const router = useRouter();
    const [favourites, setFavourites] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            router.push('/Login');
            return;
        }

        const user = JSON.parse(userStr);

        const fetchFavourites = async () => {
            try {
                const response = await api.get(`/Favourite/user/${user.Id || user.id}/detailed`);
                if (response.data && (response.data.success || response.data.Success)) {
                    setFavourites(response.data.favourites || response.data.Favourites || []);
                }
            } catch (err: any) {
                console.error("Failed to fetch favourites", err);
            } finally {
                setLoading(false);
            }
        };

        fetchFavourites();
    }, [router]);

    const handleRemoveFavourite = async (favouriteId: string) => {
        try {
            const userStr = localStorage.getItem('user');
            if (!userStr) return;
            const user = JSON.parse(userStr);

            const res = await api.delete(`/Favourite/remove/${favouriteId}?userId=${user.Id || user.id}`);
            if (res.data.success || res.data.Success) {
                setFavourites(prev => prev.filter(f => (f.favouriteId || f.FavouriteId) !== favouriteId));
            }
        } catch (err) {
            console.error("Failed to remove favourite", err);
            alert("Could not remove favourite.");
        }
    };

    return (
        <main className="pt-32 pb-20 max-w-screen-xl mx-auto px-6 min-h-screen">
            <div className="flex items-center justify-between mb-12">
                <div>
                    <h1 className="text-4xl font-extrabold text-slate-800 font-headline tracking-tighter">Your Loved Posts</h1>
                    <p className="text-slate-500 mt-2">All the community stories you've saved along the way.</p>
                </div>
                <div className="bg-rose-50 text-rose-600 px-4 py-2 rounded-full font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined">favorite</span>
                    {favourites.length} Loved
                </div>
            </div>

            {loading ? (
                <div className="text-center py-20 text-slate-400">Loading your loved posts...</div>
            ) : favourites.length === 0 ? (
                <div className="bg-slate-50 rounded-2xl p-16 text-center border border-slate-100 flex flex-col items-center justify-center">
                    <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">heart_broken</span>
                    <h3 className="text-2xl font-bold text-slate-700 mb-2">No loved posts yet</h3>
                    <p className="text-slate-500 mb-6">Explore the community feed and save the stories that warm your heart!</p>
                    <Link href="/Posts" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition">
                        Explore Community
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {favourites.map(fav => {
                        const fid = fav.favouriteId || fav.FavouriteId;
                        const postid = fav.postId || fav.PostId;
                        const pimg = fav.postImageUrl || fav.PostImageUrl;
                        const ptitle = fav.postTitle || fav.PostTitle;
                        const pdesc = fav.postDescription || fav.PostDescription;
                        const pname = fav.petName || fav.PetName;

                        return (
                            <div key={fid} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition">
                                <div className="h-48 bg-slate-100 relative group">
                                    {pimg ? (
                                        <img 
                                            src={pimg.startsWith('http') ? pimg : `http://localhost:5000/${pimg}`} 
                                            alt={ptitle} 
                                            className="w-full h-full object-cover" 
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-400">No Image</div>
                                    )}
                                    <div className="absolute top-4 right-4">
                                        <button 
                                            onClick={() => handleRemoveFavourite(fid)}
                                            className="bg-white/90 backdrop-blur text-red-500 p-2 rounded-full shadow hover:bg-red-50 transition-all"
                                            title="Remove favourite"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">delete</span>
                                        </button>
                                    </div>
                                </div>
                                <div className="p-6 flex flex-col flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded">
                                            Post
                                        </span>
                                        <span className="text-xs font-bold text-slate-400">{pname ? `Re: ${pname}` : 'General'}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800 mb-2 line-clamp-1">{ptitle}</h3>
                                    <p className="text-slate-500 text-sm mb-6 line-clamp-2">{pdesc}</p>
                                    <Link href="/Posts" className="w-full text-center bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition">
                                        View Feed
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </main>
    );
}