'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import PetCard from '../Pets/(Components)/PetCard';
import api from '@/utils/axios';

const FeaturedPetsSection = () => {
  const [pets, setPets] = useState<any[]>([]);

  useEffect(() => {
    api.get('/Pet/available')
      .then(r => {
        console.log(r)
        const ok = r.data.Success || r.data.success;
        const pts = r.data.Pets || r.data.pets;
        if (ok) setPets(pts || []);
      })
      .catch(() => {});
  }, []);

  const mapPet = (p: any) => {
    const rawImage = p.PrimaryImage || p.primaryImage || '';
    const imageUrl = rawImage 
      ? (rawImage.startsWith('http') ? rawImage : `http://localhost:5000/${rawImage}`)
      : 'https://placehold.co/600x400/e2e8f0/64748b?text=No+Photo';

    return {
      id: p.PetId || p.petId || p.Id || p.id,
      name: p.Name || p.name,
      image: { url: imageUrl },
      tag: p.Breed || p.Type || 'Companion',
      age: p.Age || 0,
      status: p.Status || 'Available',
      description: p.Description || "A wonderful companion waiting for a home."
    };
  };
  return (
     <section className="bg-surface-container-low rounded-t-lg px-6 md:px-12 py-32">
            <div className="max-w-screen-2xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
                    <div className="max-w-2xl">
                        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-primary mb-6">Meet the
                            Companions</h2>
                        <p className="text-lg text-on-surface-variant">Every pet has a story. We help you find the one that
                            perfectly aligns with your lifestyle and home.</p>
                    </div>
                    <Link href="/Pets"
                        className="flex items-center gap-2 font-bold text-primary border-b-2 border-secondary-fixed hover:bg-secondary-fixed/20 px-4 py-2 transition-all">
                        View All Pets <span className="material-symbols-outlined"
                            data-icon="keyboard_arrow_right">keyboard_arrow_right</span>
                    </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {pets.map(p => (
                      <PetCard key={p.PetId || p.petId || p.Id} Props={mapPet(p)} />
                    ))}
                    {pets.length === 0 && [1,2,3].map(i => (
                      <div key={i} className="h-80 bg-slate-100 animate-pulse rounded-xl" />
                    ))}
                </div>
            </div>
        </section>
  )
}

export default FeaturedPetsSection