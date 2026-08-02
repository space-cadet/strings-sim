# Glossary and Contextual Help Architecture

*Created: 2026-08-03 00:36:36 IST*
*Last Updated: 2026-08-03 01:45:50 IST*
*Status: Foundation delivered; content and contextual-help expansion remain*
*Related Task: T16*

## Purpose

The String Motion Simulator is intended to be a visual guide to learning string theory, not only a display of attractive string motion. The glossary and help system connect every meaningful interaction to the physical and numerical idea it represents.

## Delivered Foundation

- `src/content/glossary.ts` is the shared typed registry for current learning, glossary, and implementation entries.
- `index.html`, `learn/index.html`, `glossary/index.html`, and `implementation/index.html` are built as Vite multipage entries.
- `src/docs.ts` renders the three learning/reference pages from the shared registry; `src/docs.css` provides their responsive presentation.
- The Simulator now includes linked question-mark help controls for String profile, Worldsheet, Boundary Conditions, Tension, and Wave Speed.
- The first Learn path introduces $\sigma$, $\tau$, and $y(\sigma,\tau)$; wave behaviour and normal modes; and the profile/worldsheet conceptual bridge.

The foundation is intentionally not a claim that every current control or future T12/T13 concept is documented yet.

## Single Source of Truth

Create a typed glossary registry, proposed at `src/content/glossary.ts`. Each entry has:

- a stable, URL-safe identifier;
- display label and symbol;
- a one-sentence tooltip;
- a detailed explanation;
- formulae and interpretation;
- an account of how the running application computes or displays it;
- related concepts; and
- a caveat where the model has a physical or numerical limit.

The simulator help links and documentation renderer read the same registry. No tooltip text or documentation target is manually duplicated in markup.

## Tabbed Information Architecture

Use Vite's multipage build rather than adding a runtime router or JavaScript-only tabs. The shared navigation is styled as tabs, but each tab is a standard link with a stable static URL:

| Tab | URL | Learning role |
|---|---|---|
| Simulator | `/projects/strings-sim/` | Interactive profile, worldsheet, probe, controls, and diagnostics. |
| Learn | `/projects/strings-sim/learn/` | Guided sequence from vibrating waves and modes to worldsheets. |
| Glossary | `/projects/strings-sim/glossary/` | Deep-linkable mathematical reference for quantities, plots, controls, and diagnostics. |
| How it works | `/projects/strings-sim/implementation/` | Equations, numerical method, stability, history storage, and model limits. |

The proposed HTML entry points are `index.html`, `learn/index.html`, `glossary/index.html`, and `implementation/index.html`. Their corresponding TypeScript renderers share the glossary registry and navigation component. Vite configuration must include all four inputs.

The tab row must expose the current page with an appropriate accessible state and remain usable with mouse, keyboard, touch, browser history, bookmarked URLs, and no JavaScript.

## Link Targets

The destination for a question-mark link depends on what the user needs next:

- `String profile` links to `/projects/strings-sim/learn/#physical-picture`.
- `Worldsheet` links to `/projects/strings-sim/learn/#worldsheet`.
- `Third normal mode` links to `/projects/strings-sim/learn/#normal-modes`.
- `Tension` links to `/projects/strings-sim/glossary/#tension`.
- `Courant number` links to `/projects/strings-sim/implementation/#courant-condition`.

The glossary uses stable hash anchors for individual entries. Learn and How it works use anchors to link a simulator control to an experiment or its numerical explanation.

## Pedagogical Sequence

The Learn tab must be an active path, not a prose duplicate of the glossary:

1. **Physical picture:** Explain that $\sigma$ labels a position on the string, $\tau$ labels evolution time, and $y(\sigma,\tau)$ is transverse displacement.
2. **Wave behaviour:** Provide short guided experiments for normal modes, reflections, standing waves, travelling pulses, interference, and boundary conditions.
3. **Conceptual bridge:** State explicitly that the profile is the string now, the worldsheet is the history of every point on the string, and the probe trajectory is the history of one selected point.
4. **Control interpretation:** Explain what each control changes physically. For example, tension changes wave speed, boundary conditions select allowed modes, damping represents energy loss in this toy model, and the Courant number is a numerical-stability quantity rather than a string-theory observable.
5. **Model boundary:** Repeat clearly that this is a classical/linearized transverse-string teaching model, not a full quantum, interacting string-theory calculation.

## Help-Control Contract

Each help affordance is a compact real anchor beside a meaningful control label, plot heading, or metric label.

- Pointer hover and keyboard focus reveal the concise tooltip.
- Click, Enter, Space where applicable, or touch activation opens the matching documentation anchor.
- The accessible name identifies the subject, for example `Learn about string tension`.
- The tooltip is supplementary: no essential information is hidden from keyboard or touch users.
- The control must not obscure sliders, buttons, canvas gestures, or mobile layout.

## Glossary Coverage

### Reading the Simulation

- worldsheet coordinates $\sigma$ and $\tau$;
- transverse displacement $y(\sigma,\tau)$;
- live profile $y(\sigma,\tau_0)$;
- worldsheet heatmap, axes, colour scale, and energy-density strip;
- the later probe trajectory $y(\tau;\sigma_*)$.

### Physical Model and Controls

- classical versus linearized relativistic mode;
- length $L$, tension $\tau$, linear density $\mu$, damping $\gamma$, and wave speed $c$;
- fixed, free, and mixed boundary conditions;
- presets, including modes, packets, collision states, and their velocity content;
- playback time scale versus physical timestep.

### Diagnostics and Numerical Implementation

- total, kinetic, and potential energy;
- fundamental frequency;
- Courant number $\lambda = c\,\Delta\tau/\Delta\sigma$;
- maximum transverse speed and energy drift when T13 adds them;
- grid size $N$, spatial step $\Delta\sigma$, timestep $\Delta\tau$;
- the central finite-difference update and its boundary treatment;
- immutable-current-slice stencil evaluation, which avoids a directional in-place update;
- retained worldsheet history and its temporal bounds.

### Limits of the Teaching Model

The documentation must state that the application is a classical/linearized transverse-string teaching model. It develops intuition for vibrations, modes, and worldsheets; it does not calculate a full quantum, interacting string-theory spectrum or amplitudes.

## Content Pattern

Each detailed entry should answer, in this order:

1. What the quantity or plot means.
2. What changing it does in the simulation.
3. How this application calculates or renders it.
4. A concise `Try this` experiment when useful.
5. A model or numerical caveat when required.

This pattern keeps the page useful to newcomers while making the computational details available to advanced readers. The Learn tab uses the same pattern at experiment scale: observe, change one setting, predict, then interpret the plot.

## Integration Sequence

1. Build the registry, shared navigation, and four static pages with high-value entries for the current interface.
2. Build the Learn sequence around physical picture, guided wave experiments, and the profile/worldsheet bridge.
3. Add the accessible help-link component and map current controls, panels, and metrics to the appropriate tab and anchor.
4. Complete the How it works numerical-implementation and limitation sections against the current solvers.
5. Extend the registry and Learn sequence when T12 adds the probe and T13 adds diagnostics, field selection, and colour bars.
6. Verify every visible help link, deep anchor, responsive layout, production build, static deployment, and live documentation URL.

## Layout Evidence

`memory-bank/screenshots/T16/tabbed-site-layout-concept.png` is a generated concept board, not implementation evidence. Its desktop and mobile panels establish the desired information hierarchy: persistent linked tabs; profile before worldsheet; local question-mark help; and a short `Try this` learning prompt without obscuring the simulator.

## Foundation Verification

- `npm run build` passed after Vite emitted all four HTML pages.
- Browser checks opened the Simulator, selected the Glossary tab, resolved `/implementation/#courant-condition`, and confirmed the matching heading.
- Hovering the String profile help link revealed its short tooltip and exposed the correct Learn deep-link target.
- The final browser-console check found no errors or warnings.
- Source commit `8a8d154` and website payload commit `f0cbc19` were pushed after the website checkout fast-forwarded to `a151f43`.
- GitHub Actions run `30765405359` completed successfully. Public HTTP checks returned 200 for Simulator, Learn, Glossary, How it works, and `assets/docs-COqnTtK3.js`.

## Accuracy Rules

- Describe only code and plots that are present in the deployed application.
- Keep the app's teaching-model boundary visible and specific.
- Verify formulae against `src/physics/core.ts`, `src/physics/classical.ts`, and `src/physics/relativistic.ts` before publication.
- Keep UI wording plain-language first, with equations and implementation detail available in the linked documentation.
