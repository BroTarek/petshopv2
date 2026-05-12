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
                const uid = user.UserId || user.userId || user.Id || user.id;
                if (!uid) return;
                const response = await api.get(`/Favourite/user/${uid}/detailed`);
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

            const uid = user.UserId || user.userId || user.Id || user.id;
            if (!uid) return;

            const res = await api.delete(`/Favourite/remove/${favouriteId}?userId=${uid}`);
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
                    <h1 className="text-5xl font-black text-primary font-headline tracking-tighter">Your Loved Companions</h1>
                    <p className="text-on-surface-variant mt-2 font-medium">All the furry friends you've saved along the way.</p>
                </div>
                <div className="bg-secondary-fixed text-on-secondary-fixed px-5 py-2.5 rounded-full font-black uppercase tracking-widest text-xs flex items-center gap-2 shadow-sm">
                    <span className="material-symbols-outlined text-[18px]">favorite</span>
                    {favourites.length} Saved
                </div>
            </div>

            {loading ? (
                <div className="text-center py-20 text-slate-400">Loading your loved pets...</div>
            ) : favourites.length === 0 ? (
                <div className="bg-slate-50 rounded-2xl p-16 text-center border border-slate-100 flex flex-col items-center justify-center">
                    <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">heart_broken</span>
                    <h3 className="text-2xl font-bold text-slate-700 mb-2">No loved companions yet</h3>
                    <p className="text-slate-500 mb-6">Explore the pets looking for homes and save the ones that catch your eye!</p>
                    <Link href="/Pets" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition">
                        Explore Companions
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {favourites.map(fav => {
                        const fid = fav.favouriteId || fav.FavouriteId;
                        const petid = fav.petId || fav.PetId;
                        const pimg = fav.petImageUrl || fav.PetImageUrl;
                        const pname = fav.petName || fav.PetName;
                        const ptype = fav.petType || fav.PetType;
                        const pbreed = fav.petBreed || fav.PetBreed;

                        const imageUrl = pimg 
                            ? (pimg.startsWith('http') ? pimg : `http://localhost:5000/${pimg}`)
                            : 'https://placehold.co/600x400/e2e8f0/64748b?text=No+Photo';

                        return (
                            <div key={fid} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition">
                                <div className="h-48 bg-slate-100 relative group">
                                    <img 
                                        src={imageUrl} 
                                        alt={pname} 
                                        className="w-full h-full object-cover" 
                                    />
                                    <div className="absolute top-4 right-4">
                                        <button 
                                            onClick={() => handleRemoveFavourite(fid)}
                                            className="bg-white/90 backdrop-blur text-red-500 p-2 rounded-full shadow hover:bg-red-50 transition-all"
                                            title="Remove favourite"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">delete</span>
                                        </button>
                                    </div>
                                    <div className="absolute top-4 left-4">
                                        <span className="px-2 py-1 bg-white/90 backdrop-blur text-[10px] font-black uppercase rounded shadow-sm">
                                            {ptype}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-6 flex flex-col flex-1">
                                    <h3 className="text-xl font-bold text-slate-800 mb-1">{pname}</h3>
                                    <p className="text-slate-500 text-sm mb-6">{pbreed}</p>
                                    <Link href={`/Pet/${petid}`} className="w-full text-center bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition">
                                        View Profile
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