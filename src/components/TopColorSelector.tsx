import React from 'react';

export interface ColorOption {
  id: string; // Unique identifier for the color (e.g., 'neonBlue' or a hex string '#RRGGBB')
  name: string; // Display name (e.g., 'Blue' or the hex string)
  displayBackground: string; // CSS value for background (e.g., 'var(--tw-color-neonBlue)' or a hex string)
  borderColor: string; // CSS value for border color (hex string)
}

interface TopColorSelectorProps {
  colorOptions: ColorOption[];
  selectedColor: string; // This will be the 'id' of the selected ColorOption
  onSelect: (colorId: string) => void;
  brush?: 'color' | 'delay'; // for future extensibility
}

const TopColorSelector: React.FC<TopColorSelectorProps> = ({ colorOptions, selectedColor, onSelect, brush }) => (
  <div className="flex gap-6">
    {colorOptions.map((color) => (
      <button
        key={color.id}
        className={`w-10 h-10 rounded-full border-4 transition-all ${selectedColor === color.id && (!brush || brush === 'color') ? 'scale-110 shadow-lg' : ''}`}
        style={{
          background: color.displayBackground,
          borderColor: color.borderColor,
          boxShadow: selectedColor === color.id && (!brush || brush === 'color') ? `0 0 12px 4px ${color.borderColor}` : undefined
        }}
        onClick={() => onSelect(color.id)}
        aria-label={color.name}
      />
    ))}
  </div>
);

export default TopColorSelector;
