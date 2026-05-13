'use client';
import React, { useEffect, useState } from 'react';
import api from '@/utils/axios';
import PetCard from '../../Pets/(Components)/PetCard';
import Link from 'next/link';

interface RelatedPetsGridProps {
    currentPetType?: string;
    currentPetId?: string;
}

const RelatedPetsGrid = ({ currentPetType, currentPetId }: RelatedPetsGridProps) => {
    const [pets, setPets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRelated = async () => {
            try {
                const res = await api.get('/Pet/available');
                const pts = res.data.Pets || res.data.pets || [];
                // Filter out current pet and try to match type if provided
                let filtered = pts.filter((p: any) => (p.PetId || p.id) !== currentPetId);
                if (currentPetType) {
                    const byType = filtered.filter((p: any) => (p.Type || p.type) === currentPetType);
                    if (byType.length > 0) filtered = byType;
                }
                setPets(filtered.slice(0, 3));
            } catch (e) {
                console.error('Failed to fetch related pets', e);
            } finally {
                setLoading(false);
            }
        };
        fetchRelated();
    }, [currentPetType, currentPetId]);

    const mapPet = (p: any) => ({
        id: p.PetId || p.petId || p.Id || p.id,
        name: p.Name || p.name,
        image: { url: p.PrimaryImage || p.primaryImage || (p.Images && p.Images[0]) || '' },
        tag: p.Breed || p.Type,
        age: p.Age,
        status: p.Status,
        description: p.Description
    });

    return (
        <section className="mt-20">
            <div className="flex justify-between items-end mb-12">
                <div>
                    <h2 className="text-4xl font-extrabold tracking-tighter mb-2 font-headline">Similar Companions</h2>
                    <p className="text-on-surface-variant">Meet other curated souls waiting for their homes.</p>
                </div>
                <Link href="/Pets" className="text-primary font-bold underline underline-offset-8 decoration-secondary transition-all hover:decoration-4">
                    View All Pets
                </Link>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[1, 2, 3].map(i => <div key={i} className="h-80 bg-slate-100 animate-pulse rounded-xl" />)}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {pets.map((p, idx) => {
                        const mapped = mapPet(p);
                        return <PetCard key={mapped.id || `related-${idx}`} Props={mapped} />;
                    })}
                    {pets.length === 0 && (
                        <div className="col-span-full py-10 text-center text-slate-400">
                            No other companions found at the moment.
                        </div>
                    )}
                </div>
            )}
        </section>
    );
};

export default RelatedPetsGrid;