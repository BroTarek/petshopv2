'use client';

import React from 'react';

type Props = {
  selectedStage: string;
  onChange: (stage: string) => void;
};

// Maps life stage label → [minAge, maxAge] in years
const STAGES: { label: string; min: number; max: number }[] = [
  { label: 'Puppy/Kitten', min: 0, max: 1 },
  { label: 'Young Adult', min: 1, max: 3 },
  { label: 'Mature', min: 3, max: 8 },
  { label: 'Senior', min: 8, max: 30 },
];

const AgeRange = ({ selectedStage, onChange }: Props) => {
  return (
    <section>
      <h4 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4">Life Stage</h4>
      <div className="grid grid-cols-2 gap-2">
        {STAGES.map((s) => (
          <button
            key={s.label}
            onClick={() => onChange(selectedStage === s.label ? '' : s.label)}
            className={`py-2 px-3 text-xs font-bold border rounded-lg transition-all ${
              selectedStage === s.label
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-outline-variant/30 hover:border-primary'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
    </section>
  );
};

export { STAGES };
export default AgeRange;