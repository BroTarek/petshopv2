import React from 'react';

type PetProfileProps = {
    pet: any;
    onAdopt: () => void;
    requested?: boolean;
};

const ProfileSummary = ({ pet, onAdopt, requested }: PetProfileProps) => {
    return (
        <div className="md:col-span-5 lg:col-span-4 flex flex-col gap-6">
            <div className="bg-surface-container-low rounded-lg p-8 md:p-10 flex-grow flex flex-col justify-between shadow-sm">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="bg-secondary-fixed text-on-secondary-fixed text-xs font-bold px-4 py-1.5 rounded-full font-headline uppercase tracking-widest">
                            {pet.status || 'Available'}
                        </span>
                        <span className="text-on-surface-variant text-sm font-medium">Ref: {pet.petId?.substring(0, 8).toUpperCase()}</span>
                    </div>
                    <h1 className="text-6xl font-extrabold tracking-tighter text-primary mb-4 font-headline leading-[0.9]">
                        {pet.name}.
                    </h1>
                    <p className="text-on-surface-variant text-lg leading-relaxed font-light mb-8">
                        {pet.description || "A very friendly companion looking for a loving home."}
                    </p>
                    <div className="text-sm text-slate-500 mb-4 font-medium uppercase tracking-wider">
                        Owner: {pet.ownerName}
                    </div>
                </div>
                <div className="flex flex-col gap-4">
                    <button
                        onClick={onAdopt}
                        disabled={requested}
                        className={`rounded-xl py-5 px-8 flex items-center justify-center gap-3 transition-all duration-300 font-bold group shadow-md ${
                            requested 
                            ? 'bg-slate-200 text-slate-500 cursor-not-allowed' 
                            : 'bg-amber-600 text-white hover:bg-amber-700 hover:shadow-lg active:scale-95'
                        }`}
                    >
                        <span className="font-headline tracking-tight uppercase text-sm">
                            {requested ? 'Application Pending' : 'Begin Adoption Journey'}
                        </span>
                        {!requested && <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>}
                    </button>
                </div>
            </div>
            {/* <!-- Adoption Stats --> */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface-container-lowest rounded-lg p-6 border border-outline-variant/10 text-center shadow-sm">
                    <span className="block text-2xl font-black text-primary font-headline">{pet.age} Years</span>
                    <span className="text-xs text-on-surface-variant font-medium uppercase tracking-widest">Age</span>
                </div>
                <div className="bg-surface-container-lowest rounded-lg p-6 border border-outline-variant/10 text-center shadow-sm">
                    <span className="block text-2xl font-black text-primary font-headline">{pet.gender || 'Unknown'}</span>
                    <span className="text-xs text-on-surface-variant font-medium uppercase tracking-widest">Gender</span>
                </div>
                <div className="bg-surface-container-lowest rounded-lg p-6 border border-outline-variant/10 text-center shadow-sm">
                    <span className="block w-full text-lg truncate font-black text-primary font-headline" title={pet.breed}>{pet.breed}</span>
                    <span className="text-xs text-on-surface-variant font-medium uppercase tracking-widest">Breed</span>
                </div>
                <div className="bg-surface-container-lowest rounded-lg p-6 border border-outline-variant/10 text-center shadow-sm">
                    <span className="block w-full text-lg truncate font-black text-primary font-headline" title={pet.location}>{pet.location}</span>
                    <span className="text-xs text-on-surface-variant font-medium uppercase tracking-widest">Location</span>
                </div>
            </div>
        </div>
    );
};

export default ProfileSummary;