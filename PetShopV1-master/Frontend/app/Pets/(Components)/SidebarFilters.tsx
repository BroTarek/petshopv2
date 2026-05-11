'use client';

import React from 'react';
import AgeRange, { STAGES } from './AgeRange';
import CategoryChips from './CategoryChips';

type Props = {
  selectedType: string;
  selectedStage: string;
  onTypeChange: (t: string) => void;
  onStageChange: (s: string) => void;
  onClear: () => void;
};

const SidebarFilters = ({ selectedType, selectedStage, onTypeChange, onStageChange, onClear }: Props) => {
  return (
    <>
      <aside className="w-full lg:w-72 flex-shrink-0">
        <div className="sticky top-32 space-y-10">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">tune</span> Filters
              </h3>
              {(selectedType !== 'All' || selectedStage) && (
                <button
                  onClick={onClear}
                  className="text-xs font-bold text-slate-500 hover:text-red-500 transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>
            <div className="space-y-8">
              <CategoryChips selectedType={selectedType} onChange={onTypeChange} />
              <AgeRange selectedStage={selectedStage} onChange={onStageChange} />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default SidebarFilters;