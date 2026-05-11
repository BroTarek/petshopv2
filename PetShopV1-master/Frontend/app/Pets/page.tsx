'use client';

import React, { useEffect, useState } from 'react';
import HeroSection from './(Components)/HeroSection';
import Pagination from './(Components)/Pagination';
import PetCard from './(Components)/PetCard';
import PetGrid from './(Components)/PetGrid';
import SidebarFilters from './(Components)/SidebarFilters';
import api from '@/utils/axios';

const PetsPage = () => {
    const [pets, setPets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPets = async () => {
            try {
                // Fetching all pets for now. 
                const response = await api.get('/Pet/available');
                if (response.data && response.data.Success) {
                    setPets(response.data.Pets);
                }
            } catch (err) {
                console.error("Failed to fetch pets", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPets();
    }, []);

    // Transform backend DTO to match PetCard expectations
    const mappedPets = pets.map(backendPet => ({
        id: backendPet.petId,
        name: backendPet.name,
        image: {
            alt: backendPet.name,
            url: backendPet.primaryImage || "https://placehold.co/600x400/e2e8f0/64748b?text=No+Photo"
        },
        tag: backendPet.breed || backendPet.type,
        age: backendPet.age,
        gender: "Unknown", // Add if backend supports it in available DTO
        size: "Medium", // Add if backend supports it
        status: backendPet.status,
        description: `Located in ${backendPet.location}. Owned by ${backendPet.ownerName}`
    }));

    return (
        <main className="pt-32 pb-20 max-w-screen-2xl mx-auto px-6 md:px-12 bg-black min-h-screen">
            <HeroSection />
            <div className="flex flex-col lg:flex-row gap-12 mt-12">
                <SidebarFilters />
                <PetGrid>
                    <div className="flex justify-between items-center mb-8">
                        <p className="text-sm text-slate-500 font-medium">
                            Showing <span className="text-blue-600 font-bold">{mappedPets.length} companions</span> nearby
                        </p>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold uppercase text-slate-500">Sort by:</span>
                            <select className="bg-transparent border border-slate-200 rounded px-2 py-1 text-sm font-bold focus:ring-blue-500 focus:border-blue-500 cursor-pointer text-slate-700">
                                <option>Newest Arrivals</option>
                                <option>Distance</option>
                                <option>Personality</option>
                            </select>
                        </div>
                    </div>
                    
                    {loading ? (
                        <div className="flex justify-center items-center py-20 text-slate-400">
                            Loading companions...
                        </div>
                    ) : mappedPets.length === 0 ? (
                        <div className="flex justify-center items-center py-20 text-slate-400">
                            No companions found.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                            {mappedPets.map((pet) => (
                                <PetCard key={pet.id} Props={pet} />
                            ))}
                        </div>
                    )}
                    
                    {!loading && mappedPets.length > 0 && <Pagination />}
                </PetGrid>
            </div>
        </main>
    );
}

export default PetsPage;