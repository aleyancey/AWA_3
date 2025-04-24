import React from 'react';

const COLORS = [
  { name: 'Blue', value: 'neonBlue', border: '#00eaff' },
  { name: 'Green', value: 'neonGreen', border: '#39ff14' },
  { name: 'Purple', value: 'neonPurple', border: '#a259ff' },
  { name: 'Yellow', value: 'neonYellow', border: '#fff700' },
  { name: 'Neon Pink', value: 'neonPink', border: '#FF2079' },
];

interface TopColorSelectorProps {
  selectedColor: string;
  onSelect: (color: string) => void;
}

const TopColorSelector: React.FC<TopColorSelectorProps> = ({ selectedColor, onSelect }) => (
  <div className="flex gap-6">
    {COLORS.map((color) => (
      <button
        key={color.value}
        className={`w-10 h-10 rounded-full border-4 transition-all ${selectedColor === color.value ? 'scale-110 shadow-lg' : ''}`}
        style={{
          background: `var(--tw-color-${color.value})`,
          borderColor: color.border,
          boxShadow: selectedColor === color.value ? `0 0 12px 4px ${color.border}` : undefined
        }}
        onClick={() => onSelect(color.value)}
        aria-label={color.name}
      />
    ))}
  </div>
);

export default TopColorSelector;
