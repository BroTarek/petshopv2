'use client';

import React, { useEffect, useState } from 'react';
import api from '@/utils/axios';
import Link from 'next/link';

export default function FavouritesTab({ userId }: { userId: string }) {
  const [favourites, setFavourites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!userId) return;
    try {
      const response = await api.get(`/Favourite/user/${userId}/detailed`);
      const data = response.data.favourites || response.data.Favourites || [];
      setFavourites(data);
    } catch (err) {
      console.error("Failed to fetch favourites", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [userId]);

  const handleRemove = async (favouriteId: string) => {
    try {
      await api.delete(`/Favourite/remove/${favouriteId}?userId=${userId}`);
      setFavourites(prev => prev.filter(f => (f.favouriteId || f.FavouriteId) !== favouriteId));
    } catch (err) {
      alert("Could not remove favourite.");
    }
  };

  if (loading) return <div className="py-20 text-center text-on-surface-variant">Loading loved companions...</div>;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-black text-primary font-headline tracking-tight">Loved Companions</h2>
        <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest">{favourites.length} Saved</span>
      </div>

      {favourites.length === 0 ? (
        <div className="py-20 text-center border-2 border-dashed border-surface-variant rounded-2xl">
          <span className="material-symbols-outlined text-4xl text-outline-variant mb-2">favorite_border</span>
          <p className="text-on-surface-variant mb-4">You haven't saved any pets yet.</p>
          <Link href="/Pets" className="text-primary font-bold hover:underline">Explore Pets</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {favourites.map(fav => {
            const fid = fav.favouriteId || fav.FavouriteId;
            const pname = fav.petName || fav.PetName;
            const pimg = fav.petImageUrl || fav.PetImageUrl;
            const imageUrl = pimg 
              ? (pimg.startsWith('http') ? pimg : `http://localhost:5000/${pimg}`)
              : 'https://placehold.co/400x300/e2e8f0/64748b?text=No+Photo';

            return (
              <div key={fid} className="group bg-surface-container-lowest rounded-2xl border border-surface-container overflow-hidden hover:shadow-editorial-hover transition-all duration-300">
                <div className="h-40 relative">
                  <img src={imageUrl} alt={pname} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <button onClick={() => handleRemove(fid)} className="absolute top-3 right-3 bg-white/90 backdrop-blur p-2 rounded-full text-error shadow-sm hover:bg-error-container transition-colors">
                    <span className="material-symbols-outlined text-[18px]">favorite</span>
                  </button>
                </div>
                <div className="p-4 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-primary">{pname}</h4>
                    <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">{fav.petBreed || fav.PetBreed}</p>
                  </div>
                  <Link href={`/Pet/${fav.petId || fav.PetId}`} className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors">
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
