# TODO / Roadmap for Sound Sanctuary

This document breaks down major goals into actionable, prioritized tasks. Highest priority items are listed first, focusing on core user experience and product vision. Check off tasks as you complete them!

---

## High Priority (Core Experience)

- [ ] **Test and Refine Frontend UI/UX**
    - [ ] Manually test mood input, theme retrieval, and display flows
    - [ ] Identify and fix usability issues (ergonomics, clarity, accessibility)
    - [ ] Gather user feedback on interface and design
    - [ ] Ensure responsive design for mobile and desktop

- [ ] **Ensure All Themes Have Sound Assets**
    - [ ] Audit existing `sound_themes.json` for missing/duplicate sounds
    - [ ] Add or replace sound files as needed
    - [ ] Test playback for each sound in the UI

- [ ] **Refine and Assign Color Palettes**
    - [ ] Review and assign a unique, harmonious palette for each theme
    - [ ] Use color contrast tools for accessibility
    - [ ] Validate palettes visually in the app

- [ ] **Backend & Semantic Search Reliability**
    - [ ] Write and run unit/integration tests for `/search` and related endpoints
    - [ ] Test theme retrieval with varied mood queries (phrases, typos, synonyms)
    - [ ] Monitor for errors or irrelevant results

---

## Medium Priority (Delight & Depth)

- [ ] **Interactive Theme Graphics**
    - [ ] Prototype and test generative visuals for key themes (e.g., waves, light bugs, rainbow strings)
    - [ ] Integrate with sound triggers and UI
    - [ ] Optimize for performance and smoothness

- [ ] **Basic Brush Drawing**
    - [ ] Ensure universal, pressure-sensitive brush/canvas is available
    - [ ] Test pressure/hold mapping to sound density/intensity
    - [ ] Validate on touch and pointer devices

---

## Lower Priority / Stretch Goals

- [ ] **Accessibility Enhancements**
    - [ ] Screen reader support, keyboard navigation
    - [ ] WCAG compliance review

- [ ] **Continuous Improvement**
    - [ ] Collect and review user analytics
    - [ ] Regularly update changelog and documentation
    - [ ] Encourage feedback and contributions

---

**This file is a living document. Update as priorities shift or new ideas emerge.**
