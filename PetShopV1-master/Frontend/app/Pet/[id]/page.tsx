'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/utils/axios';
import ImageCarousel from '../(Components)/ImageCarousel';
import ProfileSummary from '../(Components)/ProfileSummary';
import AdoptionRequestsBox from '../(Components)/AdoptionRequestsBox';
import RelatedPetsGrid from '../(Components)/RelatedPetsGrid';
import EditorialDetailsSection from '../(Components)/EditorialDetailsSection';

const PetDetailPage = () => {
    const params = useParams();
    const router = useRouter();
    const [pet, setPet] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [adoptionSent, setAdoptionSent] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);

    useEffect(() => {
        if (!params.id) return;
        
        const userStr = localStorage.getItem('user');
        if (userStr) setCurrentUser(JSON.parse(userStr));
        
        const fetchPet = async () => {
            try {
                const response = await api.get(`/Pet/${params.id}`);
                const ok = response.data.Success || response.data.success;
                const petData = response.data.Pet || response.data.pet;
                if (response.data && ok && petData) {
                    // Normalize pet data
                    const normalizedPet = {
                        ...petData,
                        petId: petData.petId || petData.PetId || petData.id || petData.Id,
                        name: petData.name || petData.Name,
                        type: petData.type || petData.Type,
                        breed: petData.breed || petData.Breed,
                        age: petData.age || petData.Age,
                        gender: petData.gender || petData.Gender,
                        location: petData.location || petData.Location,
                        healthStatus: petData.healthStatus || petData.HealthStatus,
                        description: petData.description || petData.Description,
                        status: petData.status || petData.Status,
                        ownerId: petData.ownerId || petData.OwnerId,
                        ownerName: petData.ownerName || petData.OwnerName,
                        images: petData.images || petData.Images || []
                    };
                    setPet(normalizedPet);

                    // Check if already requested
                    const userStr = localStorage.getItem('user');
                    if (userStr) {
                        const user = JSON.parse(userStr);
                        const uid = user.userId || user.UserId || user.Id || user.id;
                        api.get(`/Adoption/user/${uid}/initiated`).then(res => {
                            if (Array.isArray(res.data)) {
                                const hasReq = res.data.some((r: any) => 
                                    (r.petId === normalizedPet.petId || r.PetId === normalizedPet.petId) && 
                                    (r.status === 'Pending' || r.Status === 'Pending')
                                );
                                if (hasReq) setAdoptionSent(true);
                            }
                        }).catch(() => {});
                    }
                } else {
                    setError('Pet not found');
                }
            } catch (err: any) {
                setError(err.response?.data?.Error || 'Error fetching pet details');
            } finally {
                setLoading(false);
            }
        };
        fetchPet();
    }, [params.id]);

    const handleAdopt = async () => {
        try {
            const userStr = localStorage.getItem('user');
            if (!userStr) {
                alert("Please login first to adopt.");
                router.push("/Login");
                return;
            }
            const user = JSON.parse(userStr);
            const uid = user.userId || user.UserId || user.Id || user.id;

            const res = await api.post('/Adoption/initiate', {
                PetId: pet.petId || pet.id,
                InitiatorUserId: uid,
                ReceiverUserId: pet.ownerId
            });

            const ok = res.status === 200 || res.status === 201 || res.data.RequestId || res.data.requestId;
            if (ok) {
                setAdoptionSent(true);
                alert("Adoption request sent successfully!");
            } else {
                alert(res.data.Error || res.data.error || "Failed to send request.");
            }
        } catch (err: any) {
            alert(err.response?.data?.Error || "Failed to initiate adoption.");
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading pet profile...</div>;
    if (error || !pet) return <div className="min-h-screen flex items-center justify-center text-red-500">{error || 'Unknown error'}</div>;

    return (
        <main className="pt-32 pb-20 max-w-screen-2xl mx-auto px-6 md:px-12 bg-white min-h-screen text-slate-800">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 mb-20">
                <ImageCarousel images={pet.images} />
                <ProfileSummary pet={pet} onAdopt={handleAdopt} requested={adoptionSent} />
            </div>

            <EditorialDetailsSection pet={pet} />

            <section className="mb-32">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                    <div className="lg:col-span-8 flex flex-col justify-center">
                        <h2 className="text-4xl font-extrabold tracking-tighter mb-4 font-headline">Join {pet.name}'s World</h2>
                        <p className="text-on-surface-variant text-lg max-w-xl text-slate-600">
                            We carefully vet every applicant to ensure {pet.name} finds the perfect forever home. Check the current interest levels below.
                        </p>
                        {adoptionSent && (
                            <div className="mt-6 bg-green-50 text-green-700 p-4 rounded-xl border border-green-200">
                                Your adoption request has been sent! Check your Dashboard for real-time updates.
                            </div>
                        )}
                    </div>
                    {currentUser && (currentUser.userId === pet.ownerId || currentUser.UserId === pet.ownerId || currentUser.Id === pet.ownerId || currentUser.id === pet.ownerId) && (
                        <AdoptionRequestsBox petOwnerId={pet.ownerId} />
                    )}
                </div>
            </section>

            <RelatedPetsGrid currentPetType={pet.type} currentPetId={pet.petId} />
        </main>
    );
};

export default PetDetailPage;