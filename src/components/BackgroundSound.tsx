import React, { useEffect, useRef } from 'react';

interface BackgroundSoundProps {
  sounds: string[];
  playing: boolean;
  volume: number;
}

const soundMap: Record<string, string> = {
  rain: '/sounds/gentle-rain.wav',
  bowl: '/sounds/521549__buddhassoundofsilence__singing-bowl-deep-sound.wav',
  stream: '/sounds/creek-test.wav',
  ocean: '/sounds/550915__profispiesser__bgsasc-water-beach-ocean-waves-constant-splashing-rocks-many-small-waves-greece-16.wav',
  ambient: '/sounds/796138__ilariio__relaxing-ambient-soundscape-2.mp3',
};

const BackgroundSound: React.FC<BackgroundSoundProps> = ({ sounds, playing, volume }) => {
  const audioMap = useRef<Record<string, HTMLAudioElement>>({});

  useEffect(() => {
    if (!playing) {
      Object.values(audioMap.current).forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
      });
      audioMap.current = {};
      return;
    }
    // play newly selected sounds
    sounds.forEach(key => {
      if (!audioMap.current[key]) {
        const url = soundMap[key] || soundMap['rain'];
        const audio = new window.Audio(url);
        audio.loop = true;
        audio.volume = volume;
        audio.play();
        audioMap.current[key] = audio;
      }
    });
    // stop deselected sounds
    Object.keys(audioMap.current).forEach(key => {
      if (!sounds.includes(key)) {
        audioMap.current[key].pause();
        audioMap.current[key].currentTime = 0;
        delete audioMap.current[key];
      }
    });
  }, [sounds, playing]);

  useEffect(() => {
    Object.values(audioMap.current).forEach(audio => {
      audio.volume = volume;
    });
  }, [volume]);

  // cleanup on unmount
  useEffect(() => {
    return () => {
      Object.values(audioMap.current).forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
      });
      audioMap.current = {};
    };
  }, []);

  return null;
};

export default BackgroundSound;
