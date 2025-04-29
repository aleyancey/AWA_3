# Sound Sanctuary

Sound Sanctuary is an immersive web application that helps users explore and regulate their mood through AI-powered soundscapes. Users describe their current mood or desired feeling, and the app guides them to a curated palette of sound themes—each with unique moods, tags, and visual palettes—using semantic search and an intuitive, minimalist interface.

## Key Features

- **AI Mood/Theme Guide:** Enter a mood or feeling in your own words and discover matching sound themes, powered by semantic search.
- **Minimalist, Animated UI:** Dark, organic design with animated geometric backgrounds and flickering mood/tag suggestions for inspiration.
- **Sound Theme Palette:** 15 curated themes, each with a collection of natural and atmospheric sounds, mood tags, descriptions, and a visual color palette.
- **Live Search Integration:** React frontend communicates with a FastAPI backend for real-time theme matching.
- **(Planned) Interactive Canvas:** Future releases will feature a pressure-sensitive inky brush, mapping pressure and hold duration to sound density/intensity, with visual and audio feedback.

## User Workflow

1. **Describe your mood:** On the homepage, enter a word or phrase describing your current feeling or the vibe you want to experience.
2. **Get inspired:** Browse flickering tag suggestions or type your own.
3. **Discover sound themes:** The app presents a palette of matching sound themes, each with mood tags, description, and visual colors.
4. **(Future) Interact:** Use the inky brush to draw on the canvas, with your pressure and hold influencing the soundscape.

## Tech Stack

- **Frontend:** React (Create React App), HTML5, CSS (Lato font, custom/organic styles)
- **Backend:** FastAPI (Python), all-MiniLM-L6-v2 model for sentence embeddings (via Sentence Transformers), ChromaDB (vector database for semantic search)
- **Audio:** Web Audio API (planned)
- **Design:** SVG animation, minimalist/organic UX

## Getting Started

1. **Backend:**  
   - Install Python dependencies: `pip install -r requirements.txt`
   - Start backend: `uvicorn sound_sanctuary_api:app --reload --port 8000`
2. **Frontend:**  
   - `cd sound-sanctuary-frontend`
   - Install dependencies: `npm install`
   - Start dev server: `npm start`
3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Directory Structure

- `sound-sanctuary-frontend/` — React frontend
- `sound_sanctuary_api.py` — FastAPI backend
- `data/sound_themes.json` — Theme data
- `chroma_db/` — ChromaDB vector database

## Planned Features & Roadmap

Below are the key features and improvements planned for Sound Sanctuary, along with recommended best practices for testing each step.

### 1. Expand Sound Library
- **Goal:** Ensure every theme has a rich, unique set of sound assets.
- **Testing:**
  - Audit each theme for missing or duplicate sounds.
  - Manually play all sounds in the UI; confirm correct mapping and playback.
  - Gather user feedback on variety and quality.

### 2. Refine and Assign Color Palettes
- **Goal:** Each theme should have a distinctive, harmonious visual palette.
- **Testing:**
  - Visual review of theme cards and backgrounds for clarity and accessibility.
  - Use color contrast tools for accessibility compliance.
  - Solicit feedback on mood and aesthetic fit.

### 3. Improve Frontend UI/UX
- **Goal:** Make the interface intuitive, ergonomic, and beautiful.
- **Testing:**
  - Manual user flow walkthroughs (mood entry, search, theme browsing).
  - Check responsiveness on mobile and desktop.
  - Gather feedback from real users; iterate on pain points.

### 4. Interactive Theme Graphics
- **Goal:** Add generative/interactive visuals unique to each theme (e.g., waves for water, light bugs for forest).
- **Testing:**
  - Prototype each graphic in isolation.
  - Integrate and test for performance and responsiveness.
  - Confirm that interactions trigger correct audio/visual feedback.

### 5. Basic Brush Drawing (Universal Option)
- **Goal:** Always provide a simple, creative brush/canvas interaction.
- **Testing:**
  - Test brush responsiveness, pressure/hold mapping, and sound feedback.
  - Ensure it works across all themes and devices.

### 6. Accessibility & Usability
- **Goal:** Make the app usable for all users, including those with disabilities.
- **Testing:**
  - Use screen readers, keyboard navigation, and color contrast checks.
  - Follow WCAG guidelines for web accessibility.

### 7. Backend & Semantic Search
- **Goal:** Ensure mood queries reliably return relevant themes.
- **Testing:**
  - Unit/integration tests for API endpoints.
  - Manual and automated tests for a wide range of queries (including edge cases).
  - Monitor and log search performance and errors.

### 8. General Testing & Continuous Improvement
- **Goal:** Maintain high code quality and user satisfaction.
- **Testing:**
  - Write and run unit, integration, and end-to-end tests.
  - Use version control for all changes and document in changelog.
  - Regularly review user analytics and feedback for new opportunities.

---

**Note:** This roadmap is a living document—priorities and features may evolve based on user feedback and creative direction. Contributions and suggestions are welcome!

## License
MIT

