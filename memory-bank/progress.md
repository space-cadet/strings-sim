## 2026-07-31 — T9 completed

- Corrected central-difference state handling and stable time-step recalculation.
- Added sophisticated initial conditions, including propagating packets and collisions.
- Completed responsive desktop/mobile layout and expanded persistence.
- Verified the production build and browser behavior at desktop and mobile widths.

## 2026-07-31 — T10 completed; T11/T13 delivered slices

- Completed DPR-safe canvas resizing, explicit worldsheet timestamps, and data-space characteristics.
- Delivered the responsive instrument layout and bounded worldsheet canvas lifecycle for desktop/mobile transitions.
- Added shared Classical/Relativistic worldsheet history and continuous live metric updates.
- Published source `4f1b5db` and website payload `e93c0ec`; live hashed assets were verified.

## 2026-08-03 — T16 glossary and contextual-help plan approved

- Defined a shared glossary registry as the single source for concise GUI help and detailed documentation.
- Reframed the documentation delivery as four nested static pages: Simulator, Learn, Glossary, and How it works.
- Defined accessible hover/focus/touch behavior, guided wave experiments, and a full content outline spanning physical concepts, plots, controls, numerical implementation, and model limitations.
- Captured a generated desktop/mobile concept board at `memory-bank/screenshots/T16/tabbed-site-layout-concept.png` as planning evidence.
- Recorded T16 as planned work; no simulator code or user-facing documentation page has yet been implemented.

## 2026-08-03 — T16 foundation delivered

- Added four static, linked pages: Simulator, Learn, Glossary, and How it works.
- Added a typed glossary registry and a shared renderer for the three documentation pages.
- Added initial accessible question-mark links for String profile, Worldsheet, Boundary Conditions, Tension, and Wave Speed.
- Added the first guided Learn sequence for the physical picture, wave behaviour, and the profile/worldsheet bridge.
- Verified the production build, tab navigation, a Courant deep link, tooltip visibility, and a clean browser console. Full content/control coverage, mobile verification, and publication remain pending.

## 2026-08-03 — T16 foundation published

- Fast-forwarded the website checkout to `a151f43` before deployment.
- Pushed source commit `8a8d154` and static website payload commit `f0cbc19`.
- Confirmed successful GitHub Actions deployment run `30765405359`.
- Verified HTTP 200 for the live Simulator, Learn, Glossary, How it works, and documentation JavaScript bundle.

## 2026-08-04 — T12 probe and T16 help expansion

- Added a primary probe trajectory that links a selected profile marker, worldsheet worldline, and rolling $y(\sigma_\ast,\tau)$ trace.
- Added a KaTeX-backed shared glossary and seven guided Learn experiments for the current model, controls, diagnostics, and numerical method.
- Added 11 new contextual help links and registry tests that protect their direct glossary targets.
- Verified four automated tests, the production build, desktop/mobile probe interaction, the expanded Learn page, and a clean browser console.
- Manual T12 acceptance testing, source publication, and static-site publication remain pending.
