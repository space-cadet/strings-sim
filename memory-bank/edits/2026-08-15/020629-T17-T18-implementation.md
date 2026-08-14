---
kind: edit_chunk
id: 20260215-021000-t17-t18-implementation
created_at: 2026-08-15 02:06:29 IST
task_ids: [T17, T18]
source_branch: master
source_commit: f1a926c
---

#### 02:06:29 IST - T17, T18: Implement baseline and nonlinear engine
- Modified `src/physics/core.ts` - Added periodic boundary and nonlinear mode types with natural-unit timestep handling.
- Modified `src/physics/classical.ts` - Added periodic ring updates and metrics.
- Modified `src/physics/relativistic.ts` - Added periodic linear reference updates and metrics.
- Created `src/physics/t17-baselines.ts` - Added reproducible fixed, free, periodic, and mixed velocity-bearing baseline reports.
- Created `src/physics/nonlinear-relativistic.ts` - Added constrained closed-string conformal-gauge evolution and diagnostics.
- Created `src/visualization/embedding.ts` - Added target-space projection rendering for T18.
- Created `test/t17-baselines.test.mjs` - Added T17 regression coverage and tolerance checks.
- Created `test/nonlinear-relativistic.test.mjs` - Added T18 constraint, energy, refinement, and small-amplitude checks.
- Modified `index.html`, `src/main.ts`, and `src/style.css` - Added the separate T18 mode, embedding panel, and live constraint diagnostic.
- Modified `src/content/glossary.ts` and `src/docs.ts` - Added T18 formulation, constraints, and model-boundary documentation.
- Modified `package.json` - Included physics regression modules in the test compilation.
- Modified `memory-bank/tasks/T17.md`, `memory-bank/tasks/T18.md`, `memory-bank/tasks.md`, `memory-bank/activeContext.md`, `memory-bank/session_cache.md`, `memory-bank/sessions/2026-08-14-evening.md`, `memory-bank/projectbrief.md`, and `memory-bank/implementation-details/` - Recorded T17 closeout and T18 progress.
- Created `memory-bank/ui-tests/2026-08-15-020328-t18-nonlinear-mode.md` - Recorded desktop/mobile browser verification.
- Created `memory-bank/screenshots/2026-08-15-t18-nonlinear-mode.png` - Captured T18 desktop evidence.
- Created `memory-bank/screenshots/2026-08-15-t18-nonlinear-mobile.png` - Captured T18 mobile evidence.
