'use client';

import React from 'react';

type Props = {
  selectedType: string;
  onChange: (type: string) => void;
};

import { PET_TYPES } from '@/utils/constants';

const CategoryChips = ({ selectedType, onChange }: Props) => {
  return (
    <section>
      <h4 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4">Pet Type</h4>
      <div className="flex flex-wrap gap-2">
        {PET_TYPES.map((t) => (
          <button
            key={t}
            onClick={() => onChange(t)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              selectedType === t
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container-high text-on-surface-variant hover:bg-secondary-fixed'
            }`}
          >
            {t}
          </button>
        ))}
      </div>
    </section>
  );
};

export default CategoryChips;