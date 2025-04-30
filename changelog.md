# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
- feat: Scaffolded minimalist React frontend (`sound-sanctuary-frontend`) for mood-based sound theme discovery.
  - Dark, organic UI with animated geometric SVG background, Lato font, and animated prompt.
  - Mood input, flickering tag suggestions, and theme match display.
  - Integrated with FastAPI backend `/search` endpoint for live theme retrieval.
- feat: Experimental smooth suggestions feature (experimental/smooth-suggestions-with-black-interface branch)
  - Implemented smooth fade in/out transitions for mood suggestions
  - Optimized timing for a more soothing user experience
  - Isolated changes to prevent interference with core functionality
  - Improved suggestion text positioning and alignment for better UX
  - Fine-tuned vertical alignment of suggestions within input field

### Changed
- Project structure updated to include frontend and backend directories, supporting full-stack development.

### Fixed
- fix: Removed duplicate 'celestial-drift' theme from sound_themes.json, ensuring only unique themes are embedded
- fix: Resolved CORS and proxy configuration issues between frontend and backend
  - Implemented direct API calls to backend endpoint
  - Added proper CORS headers in FastAPI backend
  - Fixed theme search functionality
  - Improved error handling and logging for API requests

### Rationale
- Enables modern, intuitive user experience for exploring sound themes by mood.
- Lays the foundation for future features (sound playback, interactive brush/canvas, etc.).
- Enables scripting and automation for embedding/querying sound themes
- Prevents user confusion and errors from duplicate data or unwanted input loops

## [2025-04-27]
### Added
- feat: Visual and audio fade duration now based on total pigment (time × pressure × brush width), not stroke length
- Fade and sound linger according to pigment amount for more paint-like realism
- Slowed down fade for more natural, immersive experience

### Changed
- BREAKING CHANGE: Removes length-based duration logic for fading/sound; all marks now fade and sound according to pigment amount

### Rationale
- Aligns pigment flow and sound with real painting behavior
- Prepares for future tuning of brush sensitivity and flow

## [2025-04-24]
### Changed
- Update color menu and audio mapping; adjust tailwind neon colors
- fix: update Tibetan Bowl sound to binaural_bowls.mp3

## [2025-04-23]
### Added
- feat: color selector rings now match each color
- Add pure-CSS dropSlide animation to top menu
- feat: enable independent looping of multiple sounds and update ambient sound mapping
- chore: update background sound mappings and assets

## [2025-04-22]
### Added
- Initial commit: Sound Sanctuary project setup
