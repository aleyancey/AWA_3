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
}

const NeonCanvas: React.FC<NeonCanvasProps> = ({ color, penWidth }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<Point[]>([]);
  const [strokes, setStrokes] = useState<Stroke[]>([]);

  // Drawing handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const pressure = (e as any).pressure || 1;
    setCurrentStroke([{ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY, t: Date.now(), pressure }]);
    setIsDrawing(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const pressure = (e as any).pressure || 1;
    setCurrentStroke((prev) => [...prev, { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY, t: Date.now(), pressure }]);
  };

  const handlePointerUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
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
      neonPurple: '/sounds/creek-test.wav', // creek test
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
