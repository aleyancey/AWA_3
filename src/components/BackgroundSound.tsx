import React, { useEffect, useRef } from 'react';

interface BackgroundSoundProps {
  sounds: string[];
  playing: boolean;
  volume: number;
}

// key→URL map
const soundMap: Record<string, string> = {
  rain: '/sounds/gentle-rain.wav',
  bowl: '/sounds/521549__buddhassoundofsilence__singing-bowl-deep-sound.wav',
  stream: '/sounds/creek-test.wav',
  ocean: '/sounds/550915__profispiesser__bgsasc-water-beach-ocean-waves-constant-splashing-rocks-many-small-waves-greece-16.wav',
  ambient: '/sounds/796138__ilariio__relaxing-ambient-soundscape-2.mp3',
};

const BackgroundSound: React.FC<BackgroundSoundProps> = ({ sounds, playing, volume }) => {
  const ctxRef = useRef<AudioContext>();
  const bufferRef = useRef<Record<string, AudioBuffer>>({});
  const sourceRef = useRef<Record<string, AudioBufferSourceNode>>({});
  const gainRef = useRef<Record<string, GainNode>>({});

  // Init AudioContext & preload buffers
  useEffect(() => {
    const ctx = new AudioContext();
    ctxRef.current = ctx;
    Object.entries(soundMap).forEach(async ([key, url]) => {
      const data = await fetch(url).then(r => r.arrayBuffer());
      bufferRef.current[key] = await ctx.decodeAudioData(data);
    });
    return () => {
      Object.values(sourceRef.current).forEach(src => src.stop());
      ctx.close();
    };
  }, []);

  // Play/stop on sounds & playing changes
  useEffect(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;

    if (!playing) {
      // stop all
      Object.values(sourceRef.current).forEach(src => src.stop());
      sourceRef.current = {};
      gainRef.current = {};
      return;
    }

    // Start new
    sounds.forEach(key => {
      if (!sourceRef.current[key] && bufferRef.current[key]) {
        const src = ctx.createBufferSource();
        src.buffer = bufferRef.current[key];
        src.loop = true;
        const gainNode = ctx.createGain();
        gainNode.gain.value = volume;
        src.connect(gainNode).connect(ctx.destination);
        src.start(0);
        sourceRef.current[key] = src;
        gainRef.current[key] = gainNode;
      }
    });

    // Stop removed
    Object.keys(sourceRef.current).forEach(key => {
      if (!sounds.includes(key)) {
        sourceRef.current[key].stop();
        delete sourceRef.current[key];
        delete gainRef.current[key];
      }
    });
  }, [sounds, playing]);

  // Volume updates
  useEffect(() => {
    Object.values(gainRef.current).forEach(g => (g.gain.value = volume));
  }, [volume]);

  return null;
};

export default BackgroundSound;
