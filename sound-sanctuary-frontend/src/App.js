import './App.css';
import React, { useState, useEffect } from 'react';

const TAG_SUGGESTIONS = [
  'calm', 'focus', 'love', 'energy', 'peaceful', 'anger relief', 'inspiration', 'comfort', 'uplifting', 'grounded', 'dreamy', 'serene', 'rain', 'nature', 'clarity', 'soothe', 'gentle', 'cozy', 'meditate', 'fresh'
];

function GeometricBG() {
  // SVG inspired by the provided image
  return (
    <svg id="geometric-bg" viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="fade" cx="50%" cy="50%" r="80%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.1"/>
          <stop offset="100%" stopColor="#fff" stopOpacity="0"/>
        </radialGradient>
      </defs>
      <g stroke="#fff" strokeWidth="1.1" opacity="0.6">
        {[...Array(40)].map((_, i) => (
          <line key={i} x1="400" y1="400" x2={400 + 390 * Math.cos((2 * Math.PI * i) / 40)} y2={400 + 390 * Math.sin((2 * Math.PI * i) / 40)} />
        ))}
        {[...Array(21)].map((_, j) => (
          <ellipse key={100+j} cx="400" cy="400" rx={20 + j * 18} ry={20 + j * 18} fill="none" />
        ))}
        <circle cx="400" cy="400" r="32" fill="#111" stroke="#fff" strokeWidth="2.5"/>
      </g>
      <rect width="800" height="800" fill="url(#fade)"/>
    </svg>
  );
}

function App() {
  const [mood, setMood] = useState("");
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [flickerIdx, setFlickerIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFlickerIdx(i => (i + 1) % TAG_SUGGESTIONS.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const handleInput = e => setMood(e.target.value);

  const handleSuggestion = tag => {
    setMood(tag);
    handleSubmit(tag);
  };

  const handleSubmit = async (query) => {
    setError("");
    setLoading(true);
    setThemes([]);
    try {
      const resp = await fetch("/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query || mood, top_k: 5 })
      });
      if (!resp.ok) throw new Error("Server error");
      const data = await resp.json();
      setThemes(data);
      window.location.href = 'palette.html';
    } catch (err) {
      setError("Could not fetch themes. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <GeometricBG />
      <div className="main-content">
        <div className="prompt">What is your mood or feeling?</div>
        <input
          className="mood-input"
          type="text"
          placeholder="Describe your mood..."
          value={mood}
          onChange={handleInput}
          onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }}
          aria-label="Mood input"
        />
        <div className="suggestions">
          {TAG_SUGGESTIONS.map((tag, idx) => (
            <span
              key={tag}
              className="suggestion"
              style={{
                opacity: flickerIdx === idx ? 1 : 0.5,
                filter: flickerIdx === idx ? 'drop-shadow(0 0 8px #fff)' : 'none',
                transition: 'opacity 0.3s, filter 0.3s'
              }}
              onClick={() => handleSuggestion(tag)}
            >
              {tag}
            </span>
          ))}
        </div>
        <button
          style={{
            background: '#fff', color: '#111', border: 'none', borderRadius: '1.5rem',
            padding: '0.7rem 2rem', fontWeight: 700, fontSize: '1.1rem', cursor: 'pointer', marginBottom: 24
          }}
          onClick={() => handleSubmit()}
          disabled={loading || !mood.trim()}
        >
          {loading ? 'Searching...' : 'Find My Sound Theme'}
        </button>
        {error && <div style={{ color: '#ffb4b4', marginTop: 10 }}>{error}</div>}
        <div className="themes">
          {themes.map(theme => (
            <div className="theme-card" key={theme.id}>
              <div className="theme-title">{theme.name}</div>
              <div className="theme-desc">{theme.description}</div>
              <div className="theme-tags">
                {theme.mood_tags && theme.mood_tags.map(tag => (
                  <span className="theme-tag" key={tag}>{tag}</span>
                ))}
              </div>
              {theme.visual_palette && theme.visual_palette.length > 0 && (
                <div className="theme-palette">
                  {theme.visual_palette.map((color, i) => (
                    <span
                      className="palette-color"
                      key={color + i}
                      style={{ background: color }}
                      title={color}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default App;
