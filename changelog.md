# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
