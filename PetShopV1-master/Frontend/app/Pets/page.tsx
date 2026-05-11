'use client';

import React, { useEffect, useState, useCallback } from 'react';
import HeroSection from './(Components)/HeroSection';
import Pagination from './(Components)/Pagination';
import PetCard from './(Components)/PetCard';
import PetGrid from './(Components)/PetGrid';
import SidebarFilters from './(Components)/SidebarFilters';
import { STAGES } from './(Components)/AgeRange';
import api from '@/utils/axios';

const mapPet = (backendPet: any) => {
  const rawImage = backendPet.PrimaryImage || backendPet.primaryImage || '';
  const imageUrl = rawImage 
    ? (rawImage.startsWith('http') ? rawImage : `http://localhost:5000/${rawImage}`)
    : 'https://placehold.co/600x400/e2e8f0/64748b?text=No+Photo';

  return {
    id: backendPet.PetId || backendPet.petId || backendPet.Id || backendPet.id,
    name: backendPet.Name || backendPet.name,
    image: {
      alt: backendPet.Name || backendPet.name,
      url: imageUrl,
    },
    tag: backendPet.Breed || backendPet.breed || backendPet.Type || backendPet.type,
    age: backendPet.Age || backendPet.age,
    gender: backendPet.Gender || 'Unknown',
    size: 'Medium',
    status: backendPet.Status || backendPet.status,
    description: `Located in ${backendPet.Location || backendPet.location}. Owned by ${backendPet.OwnerName || backendPet.ownerName}`,
  };
};

const PetsPage = () => {
  const [pets, setPets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('All');
  const [selectedStage, setSelectedStage] = useState('');

  const fetchPets = useCallback(async (type: string, stage: string) => {
    setLoading(true);
    try {
      const hasType = type && type !== 'All';
      const stageObj = STAGES.find(s => s.label === stage);

      if (!hasType && !stageObj) {
        // No filters — fetch available pets
        const res = await api.get('/Pet/available');
        const ok = res.data.Success || res.data.success;
        const pts = res.data.Pets || res.data.pets;
        if (ok) setPets(pts || []);
      } else {
        // Build search request
        const body: any = {};
        if (hasType) body.type = type;
        if (stageObj) {
          body.minAge = stageObj.min;
          body.maxAge = stageObj.max;
        }
        const res = await api.post('/Pet/search', body);
        const ok = res.data.Success || res.data.success;
        const pts = res.data.Pets || res.data.pets;
        if (ok) setPets(pts || []);
      }
    } catch (err) {
      console.error('Failed to fetch pets', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPets(selectedType, selectedStage);
  }, [selectedType, selectedStage, fetchPets]);

  const handleTypeChange = (type: string) => setSelectedType(type);
  const handleStageChange = (stage: string) => setSelectedStage(stage);
  const handleClear = () => {
    setSelectedType('All');
    setSelectedStage('');
  };

  const mappedPets = pets.map(mapPet);

  return (
    <main className="pt-32 pb-20 max-w-screen-2xl mx-auto px-6 md:px-12 bg-white min-h-screen text-slate-800">
      <HeroSection />
      <div className="flex flex-col lg:flex-row gap-12 mt-12">
        <SidebarFilters
          selectedType={selectedType}
          selectedStage={selectedStage}
          onTypeChange={handleTypeChange}
          onStageChange={handleStageChange}
          onClear={handleClear}
        />
        <PetGrid>
          <div className="flex justify-between items-center mb-8">
            <p className="text-sm text-slate-500 font-medium">
              {loading
                ? 'Searching...'
                : <>Showing <span className="text-blue-600 font-bold">{mappedPets.length} companions</span>{selectedType !== 'All' ? ` · ${selectedType}` : ''}{selectedStage ? ` · ${selectedStage}` : ''}</>
              }
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20 text-slate-400">
              Loading companions...
            </div>
          ) : mappedPets.length === 0 ? (
            <div className="flex flex-col justify-center items-center py-20 text-slate-400 gap-3">
              <span className="material-symbols-outlined text-5xl">search_off</span>
              <p>No companions found for these filters.</p>
              <button onClick={handleClear} className="text-blue-500 text-sm font-bold hover:underline">Clear filters</button>
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
};

export default PetsPage;