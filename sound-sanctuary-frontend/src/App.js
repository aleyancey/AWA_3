import './App.css';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import backgroundImage from './green-abstract.jpg';

const MOOD_SUGGESTIONS = [
  'anxious', 'peaceful', 'serenity', 'awaken', 'calm', 'focus', 
  'love', 'energy', 'anger relief', 'inspiration', 'comfort', 
  'uplifting', 'grounded', 'dreamy', 'serene', 'rain', 'nature', 
  'clarity', 'soothe', 'gentle', 'cozy', 'meditate', 'fresh'
];

const SUGGESTION_INTERVAL = 5000; // Time between suggestions
const FADE_DURATION = 1500; // Fade transition duration
const TYPING_PAUSE = 1500; // Time to wait after user stops typing
const INITIAL_DELAY = 2000; // Initial delay before suggestions start

function WaterBackground() {
  return (
    <>
      <div className="water-background" style={{ backgroundImage: `url(${backgroundImage})` }} />
      <div className="water-overlay" />
    </>
  );
}

function App() {
  const [mood, setMood] = useState("");
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentSuggestion, setCurrentSuggestion] = useState("");
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  const suggestionIntervalRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const lastSuggestionIndexRef = useRef(0);
  const inputRef = useRef(null);

  const getNextSuggestion = useCallback(() => {
    lastSuggestionIndexRef.current = (lastSuggestionIndexRef.current + 1) % MOOD_SUGGESTIONS.length;
    return MOOD_SUGGESTIONS[lastSuggestionIndexRef.current];
  }, []);

  const startSuggestions = useCallback(() => {
    if (suggestionIntervalRef.current) {
      clearInterval(suggestionIntervalRef.current);
    }

    const showNextSuggestion = () => {
      if (!isTyping && !mood) {
        // Start fading out current suggestion
        setIsFadingOut(true);
        
        // After fade out completes, update to next suggestion
        setTimeout(() => {
          const next = getNextSuggestion();
          setCurrentSuggestion(next);
          // Small delay before starting fade in
          setTimeout(() => {
            setIsFadingOut(false);
          }, 50);
        }, FADE_DURATION);
      }
    };

    // Start with first suggestion
    const initialSuggestion = getNextSuggestion();
    setCurrentSuggestion(initialSuggestion);
    setIsFadingOut(false);
    setIsPaused(false);

    // Start the interval for cycling suggestions
    suggestionIntervalRef.current = setInterval(showNextSuggestion, SUGGESTION_INTERVAL);
  }, [isTyping, mood, getNextSuggestion]);

  const stopSuggestions = useCallback(() => {
    if (suggestionIntervalRef.current) {
      clearInterval(suggestionIntervalRef.current);
      suggestionIntervalRef.current = null;
    }
    setIsPaused(true);
    setCurrentSuggestion("");
    setIsFadingOut(false);
  }, []);

  useEffect(() => {
    const initialTimer = setTimeout(() => {
      startSuggestions();
    }, INITIAL_DELAY);

    return () => {
      clearTimeout(initialTimer);
      if (suggestionIntervalRef.current) {
        clearInterval(suggestionIntervalRef.current);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [startSuggestions]);

  useEffect(() => {
    if (!isTyping && !mood) {
      startSuggestions();
    } else {
      stopSuggestions();
    }
  }, [isTyping, mood, startSuggestions, stopSuggestions]);

  const handleInput = e => {
    const value = e.target.value;
    setMood(value);
    
    setIsTyping(true);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Remove the forced text alignment to allow natural cursor behavior
    if (inputRef.current) {
      inputRef.current.style.textAlign = 'left';
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      if (!value) {
        startSuggestions();
      }
    }, TYPING_PAUSE);
  };

  const handleSuggestionClick = () => {
    if (!currentSuggestion) return;
    
    setMood(currentSuggestion);
    stopSuggestions();
    
    // Focus input and allow natural cursor behavior
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.style.textAlign = 'left';
      inputRef.current.setSelectionRange(currentSuggestion.length, currentSuggestion.length);
    }
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'Escape') {
      // Clear input on Escape
      setMood('');
      if (inputRef.current) {
        inputRef.current.style.textAlign = 'left';
      }
      startSuggestions();
    } else if (e.key === 'Home' || e.key === 'End') {
      // Allow Home/End keys to work normally
      return;
    }
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
    } catch (err) {
      setError("Could not fetch themes. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <WaterBackground />
      <div className="main-content">
        <h1 className="prompt">
          Type a feeling or intent to begin...
        </h1>
        
        <div className="input-container">
          <input
            ref={inputRef}
            className="mood-input"
            type="text"
            value={mood}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            aria-label="Mood input"
            placeholder=""
            autoFocus
          />
          {!mood && currentSuggestion && (
            <div 
              className={`suggestion-placeholder ${isFadingOut ? 'next' : 'current'} ${isPaused ? 'paused' : ''}`}
              onClick={handleSuggestionClick}
            >
              {currentSuggestion}
            </div>
          )}
        </div>

        {loading && (
          <div style={{ 
            color: 'rgba(255,255,255,0.8)', 
            textShadow: '0 0 10px rgba(255,255,255,0.4)',
            marginTop: '1rem',
            animation: 'float 2s ease-in-out infinite'
          }}>
            Finding your perfect sound theme...
          </div>
        )}

        {error && (
          <div style={{ 
            color: 'rgba(255,82,82,0.8)', 
            textShadow: '0 0 10px rgba(255,82,82,0.4)',
            marginTop: '1rem' 
          }}>
            {error}
          </div>
        )}

        <div className="themes">
          {themes.map(theme => (
            <div className="theme-card" key={theme.id}>
              <h3>{theme.name}</h3>
              <p>{theme.description}</p>
              <div className="theme-tags">
                {theme.mood_tags?.map(tag => (
                  <span key={tag} className="theme-tag">{tag}</span>
                ))}
              </div>
              {theme.visual_palette?.length > 0 && (
                <div className="theme-palette">
                  {theme.visual_palette.map((color, i) => (
                    <span
                      key={color + i}
                      style={{ 
                        background: color,
                        width: '2rem',
                        height: '2rem',
                        borderRadius: '50%',
                        display: 'inline-block',
                        margin: '0 0.5rem'
                      }}
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
