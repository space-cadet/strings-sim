# Edit History

*Created: 2026-07-30 17:10 IST*
*Last Updated: 2026-07-31 02:50:47 IST*

---

## 2026-07-31

#### 02:50:47 IST - T9: Simulation integrity and responsive UX
- Modified `src/physics/core.ts` - Added conservative stable time-step calculation
- Modified `src/physics/classical.ts` - Corrected central-difference state handling and parameter grid updates
- Modified `src/physics/relativistic.ts` - Corrected central-difference state handling, causal check, and parameter grid updates
- Modified `src/ui/presets.ts` - Added curated displacement and velocity initial conditions
- Modified `src/main.ts` - Added state restoration, fractional stepping, and responsive view state handling
- Modified `src/visualization/renderer.ts` - Enabled energy-density rendering
- Modified `src/visualization/worldsheet.ts` - Corrected transverse-history axis label
- Modified `src/style.css` - Added responsive layout, focus, touch, and reduced-motion styles
- Modified `index.html` - Restructured visualization layout and improved accessible controls
- Modified `vite.config.ts` - Disabled production source maps for the public deployment bundle
- Modified `README.md` - Clarified presets and relativistic-model scope
- Created `memory-bank/tasks/T9.md` - Recorded T9 scope, work, and verification
- Created `memory-bank/sessions/2026-07-31-early.md` - Recorded session outcome and deployment handoff
- Modified `memory-bank/tasks.md` - Synchronized task registry
- Modified `memory-bank/activeContext.md` - Synchronized current state and next steps
- Modified `memory-bank/session_cache.md` - Synchronized session metadata and task registry
- Modified `memory-bank/progress.md` - Recorded completed milestone
- Modified `memory-bank/changelog.md` - Recorded release changes

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
