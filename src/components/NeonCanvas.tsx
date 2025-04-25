import React, { useRef, useEffect, useState } from 'react';

// Point now includes pressure for pressure-sensitive drawing
interface Point {
  x: number;
  y: number;
  t: number;
  pressure: number; // 0 (light) to 1 (full)
}

interface NeonCanvasProps {
  color: string;
  penWidth: number;
  brush?: 'color' | 'delay'; // 'delay' if the delay brush is active (hold D)
}

const COLOR_MAP: Record<string, string> = {
  neonBlue: '#00eaff',
  neonGreen: '#39ff14',
  neonPurple: '#a259ff',
  neonYellow: '#fff700',
  neonPink: '#FF2079', // Updated from neonTurquoise (#1fffd7) to neonPink (#FF2079)
};

interface Stroke {
  points: Point[];
  color: string;
  startTime: number;
  duration: number;
  fadeProgress: number;
  delayedSegments?: boolean[]; // true for segments that were smeared with delay brush
}

const NeonCanvas: React.FC<NeonCanvasProps> = ({ color, penWidth, brush = 'color' }) => {
  // brush: 'color' (normal) or 'delay' (delay brush active via shortcut)

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<Point[]>([]);
  const [strokes, setStrokes] = useState<Stroke[]>([]);

  // --- Real-time pressure-sensitive sound brush ---
  // Web Audio API nodes for live brush sound (now layering grains)
  const brushAudioCtx = useRef<AudioContext | null>(null);
  // Each grain: {src: AudioBufferSourceNode, gain: GainNode}
  const brushGrains = useRef<{src: AudioBufferSourceNode, gain: GainNode}[]>([]);
  const brushStartTime = useRef<number>(0);
  const brushLastXY = useRef<{x:number,y:number} | null>(null);
  const puddleTimer = useRef<NodeJS.Timeout | null>(null);
  const puddleIntensity = useRef<number>(0); // 0..1

  // Preload buffer for brush sound (short loop)
  const brushBuffer = useRef<AudioBuffer | null>(null);
  useEffect(() => {
    // Pick a default sound for brush (can be mapped to color if desired)
    fetch('/sounds/gentle-creek.wav')
      .then(r => r.arrayBuffer())
      .then(buf => {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        ctx.decodeAudioData(buf, decoded => {
          brushBuffer.current = decoded;
          ctx.close();
        });
      });
  }, []);

  // Helper: add a new sound grain
  function addBrushGrain(ctx: AudioContext, offset: number = 0) {
    if (!brushBuffer.current) return;
    const src = ctx.createBufferSource();
    src.buffer = brushBuffer.current;
    src.loop = true;
    // Add a small random detune for thickness
    src.playbackRate.value = 0.98 + Math.random() * 0.04;
    const gain = ctx.createGain();
    gain.gain.value = 0.11; // Start low, will be modulated
    src.connect(gain).connect(ctx.destination);
    src.start(ctx.currentTime + offset);
    brushGrains.current.push({src, gain});
  }

  // Helper: set gain for all grains (for pressure/puddle modulation)
  function setAllGrainGains(target: number) {
    brushGrains.current.forEach(({gain}) => {
      gain.gain.value = target;
    });
  }

  // Helper: fade out and stop all grains
  function stopAllGrains(ctx: AudioContext) {
    brushGrains.current.forEach(({src, gain}) => {
      try {
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.25);
        setTimeout(() => {
          src.stop();
          src.disconnect();
          gain.disconnect();
        }, 300);
      } catch {}
    });
    brushGrains.current = [];
  }

  // Drawing handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const pressure = (e as any).pressure || 1;
    setCurrentStroke([{ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY, t: Date.now(), pressure }]);
    setIsDrawing(true);

    // --- Start live brush sound with grains ---
    if (brushAudioCtx.current) brushAudioCtx.current.close();
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    brushAudioCtx.current = ctx;
    brushGrains.current = [];
    // Start with 1 grain
    addBrushGrain(ctx);
    brushStartTime.current = Date.now();
    brushLastXY.current = { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY };
    puddleIntensity.current = 0;
    // Start puddle timer (increases intensity if held in place)
    if (puddleTimer.current) clearInterval(puddleTimer.current);
    puddleTimer.current = setInterval(() => {
      if (!isDrawing) return;
      // If pointer hasn't moved much, increase puddle
      const last = brushLastXY.current;
      if (!last) return;
      const curr = currentStroke[currentStroke.length-1];
      if (!curr) return;
      const dx = curr.x - last.x;
      const dy = curr.y - last.y;
      if (Math.sqrt(dx*dx+dy*dy) < 4) {
        puddleIntensity.current = Math.min(1, puddleIntensity.current + 0.02);
      } else {
        puddleIntensity.current = Math.max(0, puddleIntensity.current - 0.03);
        brushLastXY.current = { x: curr.x, y: curr.y };
      }
      // --- Add more grains as puddle grows ---
      // Map puddleIntensity (0..1) to number of grains (1..max)
      const maxGrains = 6;
      const targetGrains = 1 + Math.floor(puddleIntensity.current * (maxGrains - 1));
      while (brushGrains.current.length < targetGrains) {
        // Add with a slight offset for organic sound
        addBrushGrain(ctx, Math.random() * 0.05);
      }
      while (brushGrains.current.length > targetGrains) {
        // Remove excess grains
        const grain = brushGrains.current.pop();
        if (grain) {
          try {
            grain.gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.15);
            setTimeout(() => {
              grain.src.stop();
              grain.src.disconnect();
              grain.gain.disconnect();
            }, 200);
          } catch {}
        }
      }
      // Set all grain gains based on pressure and puddle
      const puddleCurve = Math.pow(puddleIntensity.current, 2);
      const gain = Math.max(0.01, Math.min(0.5, (curr.pressure * 0.2) + (puddleCurve * 0.5)));
      setAllGrainGains(gain);
    }, 40);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const pressure = (e as any).pressure || 1;
    setCurrentStroke((prev) => [...prev, { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY, t: Date.now(), pressure }]);
    // Live update gain to match pressure (applies to all grains)
    const puddleCurve = Math.pow(puddleIntensity.current, 2);
    const gain = Math.max(0.01, Math.min(0.5, pressure * 0.2 + puddleCurve * 0.5));
    setAllGrainGains(gain);
    // Track last XY for puddle detection
    brushLastXY.current = { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY };

    // --- Delay brush logic: smear/blur lines if active ---
    if (brush === 'delay') {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const pointer = { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY };
      // Find the nearest segment in any stroke within a threshold
      setStrokes((prevStrokes) => {
        return prevStrokes.map((stroke) => {
          if (stroke.points.length < 2) return stroke;
          // Find nearest segment
          let minDist = 9999;
          let minIdx = -1;
          for (let i = 0; i < stroke.points.length - 1; i++) {
            const pt1 = stroke.points[i];
            const pt2 = stroke.points[i + 1];
            // Distance from pointer to segment (pt1-pt2)
            const dist = pointToSegmentDist(pointer, pt1, pt2);
            if (dist < minDist) {
              minDist = dist;
              minIdx = i;
            }
          }
          const THRESH = 18; // px, how close you must be to affect
          if (minDist < THRESH) {
            // Smear: move the segment slightly in brush direction
            const dx = pointer.x - stroke.points[minIdx].x;
            const dy = pointer.y - stroke.points[minIdx].y;
            // Only affect if direction is not too wild (avoid jumps)
            if (Math.abs(dx) < 40 && Math.abs(dy) < 40) {
              const newPoints = stroke.points.map((pt, idx) => {
                if (idx === minIdx || idx === minIdx + 1) {
                  // Move toward pointer, but not all the way
                  return {
                    ...pt,
                    x: pt.x + dx * 0.3,
                    y: pt.y + dy * 0.3,
                  };
                }
                return pt;
              });
              // Mark segment as delayed
              let delayedSegments = stroke.delayedSegments ? [...stroke.delayedSegments] : new Array(stroke.points.length - 1).fill(false);
              delayedSegments[minIdx] = true;
              return { ...stroke, points: newPoints, delayedSegments };
            }
          }
          return stroke;
        });
      });
    }
  };

  // Helper: distance from point to segment
  function pointToSegmentDist(p: {x:number,y:number}, a: Point, b: Point) {
    const l2 = (a.x-b.x)**2 + (a.y-b.y)**2;
    if (l2 === 0) return Math.hypot(p.x-a.x, p.y-a.y);
    let t = ((p.x-a.x)*(b.x-a.x)+(p.y-a.y)*(b.y-a.y))/l2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(p.x-(a.x+t*(b.x-a.x)), p.y-(a.y+t*(b.y-a.y)));
  }

  const handlePointerUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (puddleTimer.current) clearInterval(puddleTimer.current);
    // Fade out and stop all grains
    if (brushAudioCtx.current) {
      stopAllGrains(brushAudioCtx.current);
      setTimeout(() => {
        brushAudioCtx.current?.close();
        brushAudioCtx.current = null;
      }, 350);
    }
    if (currentStroke.length > 1) {
      // Duration: 2s per 100px of line length, min 10s, max 30s
      let len = 0;
      for (let i = 1; i < currentStroke.length; i++) {
        const dx = currentStroke[i].x - currentStroke[i - 1].x;
        const dy = currentStroke[i].y - currentStroke[i - 1].y;
        len += Math.sqrt(dx * dx + dy * dy);
      }
      const dur = Math.max(10, Math.min(30, Math.floor(len / 50)));
      // Add new stroke
      setStrokes((prev) => [
        ...prev.slice(-2), // keep only last 2 so new makes 3 max
        {
          points: currentStroke,
          color,
          startTime: Date.now(),
          duration: dur,
          fadeProgress: 0,
        },
      ]);
      playLayeredSound(color, dur);
    }
    setCurrentStroke([]);
    puddleIntensity.current = 0;
  };

  // Animate line fade for all strokes
  useEffect(() => {
    if (strokes.length === 0) return;
    let running = true;
    const animate = () => {
      setStrokes((prevStrokes) =>
        prevStrokes
          .map((stroke) => {
            const elapsed = (Date.now() - stroke.startTime) / 1000;
            const fadeProgress = Math.min(1, elapsed / stroke.duration);
            return { ...stroke, fadeProgress };
          })
          .filter((stroke) => stroke.fadeProgress < 1)
      );
      if (running && strokes.length > 0) {
        requestAnimationFrame(animate);
      }
    };
    animate();
    return () => {
      running = false;
    };
  }, [strokes.length]);

  // Draw all neon lines
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Draw finished strokes as smooth, pressure-sensitive lines
    strokes.forEach((stroke) => {
      if (stroke.points.length < 2) return;
      const neon = COLOR_MAP[stroke.color] || '#fff';
      const N = stroke.points.length;
      const fadedIdx = Math.floor(N * stroke.fadeProgress);
      ctx.save();
      ctx.shadowColor = neon;
      ctx.shadowBlur = 16;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.beginPath();
      for (let i = fadedIdx; i < N - 1; i++) {
        const pt = stroke.points[i];
        const nextPt = stroke.points[i + 1];
        ctx.moveTo(pt.x, pt.y);
        ctx.lineTo(nextPt.x, nextPt.y);
      }
      // Use pressure for thickness (average of segment)
      for (let i = fadedIdx; i < N - 1; i++) {
        const pt = stroke.points[i];
        const nextPt = stroke.points[i + 1];
        ctx.save();
        // If segment is delayed, render with extra glow and brightness
        if (stroke.delayedSegments && stroke.delayedSegments[i]) {
          ctx.shadowColor = '#fff'; // white for max glow
          ctx.shadowBlur = 32;
          ctx.strokeStyle = neon;
          ctx.globalAlpha = 0.95;
          ctx.lineWidth = penWidth * 1.25 * ((pt.pressure + nextPt.pressure) / 2);
          ctx.beginPath();
          ctx.moveTo(pt.x, pt.y);
          ctx.lineTo(nextPt.x, nextPt.y);
          ctx.stroke();
        }
        // Normal segment
        ctx.shadowColor = neon;
        ctx.shadowBlur = 16;
        ctx.strokeStyle = neon;
        ctx.globalAlpha = 1 - stroke.fadeProgress * ((i - fadedIdx) / (N - fadedIdx));
        ctx.lineWidth = penWidth * ((pt.pressure + nextPt.pressure) / 2);
        ctx.beginPath();
        ctx.moveTo(pt.x, pt.y);
        ctx.lineTo(nextPt.x, nextPt.y);
        ctx.stroke();
        ctx.restore();
      }
      ctx.restore();
    });
    // Draw current stroke in progress (pressure-sensitive)
    if (isDrawing && currentStroke.length > 1) {
      const neon = COLOR_MAP[color] || '#fff';
      ctx.save();
      ctx.shadowColor = neon;
      ctx.shadowBlur = 16;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      for (let i = 0; i < currentStroke.length - 1; i++) {
        const pt = currentStroke[i];
        const nextPt = currentStroke[i + 1];
        ctx.strokeStyle = neon;
        ctx.lineWidth = penWidth * ((pt.pressure + nextPt.pressure) / 2);
        ctx.beginPath();
        ctx.moveTo(pt.x, pt.y);
        ctx.lineTo(nextPt.x, nextPt.y);
        ctx.stroke();
      }
      ctx.restore();
    }
  }, [strokes, isDrawing, currentStroke, color]);

  // Responsive canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  // --- Audio Layering Logic ---
  // Use up to 3 concurrent sounds
  const audioLayers = useRef<{ audio: HTMLAudioElement; timeout: number }[]>([]);

  function playLayeredSound(color: string, dur: number) {
    // Map color to sound file
    const colorSoundMap: Record<string, string> = {
      neonBlue: '/sounds/creek-neon-blue.mp3', // voice memo creek
      neonGreen: '/sounds/gentle-creek.wav', // creek in rain forest
      // Updated: neonPurple now uses trimmed thunderstorm
      neonPurple: '/sounds/240871__timkahn__thunderstorm-trimmed.wav',
      neonYellow: '/sounds/singing_bowl.wav', // singing bowl (was rain on leaves)
      neonPink: '/sounds/wind_chimes_trimmed.wav', // wind chimes (trimmed, starts at 8s)
    };

    const soundUrl = colorSoundMap[color] || '/sounds/gentle-rain.wav';

    // --- Web Audio API approach for normalization ---
    // This loads the audio, analyzes RMS, and adjusts gain so all sounds play at a consistent loudness
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    let source: AudioBufferSourceNode;
    let gainNode: GainNode;
    let fadeTimeout: number;
    let cleanupTimeout: number;

    fetch(soundUrl)
      .then(res => res.arrayBuffer())
      .then(arrayBuffer => audioCtx.decodeAudioData(arrayBuffer))
      .then(buffer => {
        // Calculate RMS (root mean square) for normalization
        let sum = 0;
        const channelData = buffer.getChannelData(0);
        for (let i = 0; i < channelData.length; i++) {
          sum += channelData[i] ** 2;
        }
        const rms = Math.sqrt(sum / channelData.length);
        // Target RMS (empirically chosen, tweak as needed)
        const targetRMS = 0.1;
        const gainValue = rms > 0 ? targetRMS / rms : 1;

        source = audioCtx.createBufferSource();
        source.buffer = buffer;
        gainNode = audioCtx.createGain();
        gainNode.gain.value = Math.min(gainValue, 2); // Prevent excessive gain
        source.connect(gainNode).connect(audioCtx.destination);
        source.start();

        // Fade-out logic (same as before, but with gain node)
        const fadeOutDuration = 0.5; // seconds
        fadeTimeout = window.setTimeout(() => {
          const fadeSteps = 20;
          const fadeStepTime = (fadeOutDuration * 1000) / fadeSteps;
          let step = 0;
          const startGain = gainNode.gain.value;
          const fadeStep = startGain / fadeSteps;
          const fade = setInterval(() => {
            if (step < fadeSteps) {
              gainNode.gain.value = Math.max(0, gainNode.gain.value - fadeStep);
              step++;
            } else {
              clearInterval(fade);
              source.stop();
              gainNode.disconnect();
              audioCtx.close();
            }
          }, fadeStepTime);
        }, dur * 1000 - fadeOutDuration * 1000);

        // Cleanup in case component unmounts
        cleanupTimeout = window.setTimeout(() => {
          source.stop();
          gainNode.disconnect();
          audioCtx.close();
        }, dur * 1000 + 2000);
      });
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      audioLayers.current.forEach(({ audio, timeout }) => {
        audio.pause();
        clearTimeout(timeout);
      });
      audioLayers.current = [];
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-10 touch-none cursor-crosshair"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      style={{ background: 'rgba(0,0,0,0.96)' }}
    />
  );
};

export default NeonCanvas;
