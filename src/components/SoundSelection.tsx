import React from 'react';

const SOUNDS = [
  { name: 'Rain', key: 'rain' },
  { name: 'Tibetan Bowl', key: 'bowl' },
  { name: 'Forest Stream', key: 'stream' },
  { name: 'Coastal Ocean', key: 'ocean' },
  { name: 'Ambient', key: 'ambient' },
];

interface SoundSelectionProps {
  onSelect: (sound: string) => void;
  selectedSounds: string[];
}

const SoundSelection: React.FC<SoundSelectionProps> = ({ onSelect, selectedSounds }) => (
  <div className="flex flex-col items-start gap-4 animate-fade-in-left">
    {SOUNDS.map((sound, idx) => {
      const isActive = selectedSounds.includes(sound.key);
      return (
        <button
          key={sound.key}
          className="flex items-center group transition-transform hover:scale-105"
          onClick={() => onSelect(sound.key)}
        >
          <span className={`w-12 h-12 rounded-full mr-4 flex items-center justify-center text-lg text-white transition ${
            isActive
              ? 'bg-transparent border-2 border-green-500'
              : 'bg-white/10 border border-white group-hover:bg-white/20'
          }`}>
            {idx + 1}
          </span>
          <span className="text-xl font-medium">{sound.name}</span>
        </button>
      );
    })}
  </div>
);

export default SoundSelection;
