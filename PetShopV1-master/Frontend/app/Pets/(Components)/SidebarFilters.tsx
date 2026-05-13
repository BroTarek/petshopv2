'use client';

import React from 'react';
import AgeRange, { STAGES } from './AgeRange';
import CategoryChips from './CategoryChips';
import { GENDERS, HEALTH_STATUSES, COMMON_BREEDS, LOCATIONS } from '@/utils/constants';

type Props = {
  selectedType: string;
  selectedStage: string;
  selectedBreed: string;
  selectedGender: string;
  selectedLocation: string;
  selectedHealth: string;
  onTypeChange: (t: string) => void;
  onStageChange: (s: string) => void;
  onBreedChange: (b: string) => void;
  onGenderChange: (g: string) => void;
  onLocationChange: (l: string) => void;
  onHealthChange: (h: string) => void;
  onClear: () => void;
};

const SidebarFilters = ({ 
  selectedType, selectedStage, selectedBreed, selectedGender, selectedLocation, selectedHealth,
  onTypeChange, onStageChange, onBreedChange, onGenderChange, onLocationChange, onHealthChange, onClear 
}: Props) => {
  const hasFilters = selectedType !== 'All' || selectedStage || selectedBreed || selectedGender || selectedLocation || selectedHealth;

  return (
    <aside className="w-full lg:w-72 flex-shrink-0">
      <div className="sticky top-32 space-y-8 bg-slate-50 p-6 rounded-3xl border border-slate-100">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-lg flex items-center gap-2 text-slate-800">
            <span className="material-symbols-outlined text-blue-500">tune</span> Filters
          </h3>
          {hasFilters && (
            <button
              onClick={onClear}
              className="text-xs font-bold text-blue-600 hover:text-red-500 transition-colors"
            >
              Reset
            </button>
          )}
        </div>

        <div className="space-y-6">
          {/* Pet Type */}
          <CategoryChips selectedType={selectedType} onChange={onTypeChange} />

          {/* Breed */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Breed</label>
            <div className="relative">
              <input 
                list="sidebar-breeds" 
                value={selectedBreed} 
                onChange={e => onBreedChange(e.target.value)}
                placeholder="Search breed..."
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-slate-700 shadow-sm"
              />
              <datalist id="sidebar-breeds">
                {COMMON_BREEDS.map(b => <option key={b} value={b} />)}
              </datalist>
            </div>
          </div>

          {/* Age Range */}
          <AgeRange selectedStage={selectedStage} onChange={onStageChange} />

          {/* Gender */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Gender</label>
            <div className="grid grid-cols-3 gap-2">
              {GENDERS.map(g => (
                <button
                  key={g.value}
                  onClick={() => onGenderChange(selectedGender === g.value ? '' : g.value)}
                  className={`py-2 px-1 rounded-xl text-[10px] font-bold uppercase tracking-tighter transition-all border ${
                    selectedGender === g.value 
                      ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                      : 'bg-white border-slate-200 text-slate-500 hover:border-blue-300'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Location</label>
            <select 
              value={selectedLocation} 
              onChange={e => onLocationChange(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-slate-700 shadow-sm"
            >
              <option value="">Any Location</option>
              {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          {/* Health Status */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Health Status</label>
            <select 
              value={selectedHealth} 
              onChange={e => onHealthChange(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-slate-700 shadow-sm"
            >
              <option value="">Any Status</option>
              {HEALTH_STATUSES.map(h => <option key={h.value} value={h.value}>{h.label}</option>)}
            </select>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default SidebarFilters;