# Edit History

*Created: 2026-07-30 17:10 IST*
*Last Updated: 2026-07-30 18:30 IST*

---

## 2026-07-30

#### 17:10 IST - INIT: Project initialization
- Created project folder `code/strings-sim/`
- Initialized memory bank with mb-core tools
- Created directory structure (src/, public/, assets/)
- Set up Vite + TypeScript build configuration

#### 17:20 IST - T1/T2/T3/T4: Core Implementation
- Complete physics engine, renderer, and UI controls
- Deployed to quantumofgravity.com/projects/strings-sim/

#### 18:05 IST - Bug Fixes
1. **Mobile Layout**: Added sticky canvas positioning so plot stays visible while scrolling controls
2. **Mobile Controls**: Added collapsible bottom sheet with floating toggle button (⚙️)
3. **Settings Persistence**: Implemented localStorage save/load for all parameters, presets, mode, and boundary conditions
4. **Plot Stability**: Fixed CSS to prevent canvas disappearing on scroll

#### 18:30 IST - UI Redesign & Git Setup
1. **Canvas Boundary Controls**: Play/Pause/Reset buttons moved to bottom edge of canvas
2. **Removed Modal**: All settings inline — no bottom sheet, no ⚙️ toggle
3. **Mobile**: Sticky canvas + inline controls panel below
4. **Git**: Initialized repo, created .gitignore, preparing for GitHub push
