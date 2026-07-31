# Responsive Canvas Lifecycle

*Updated: 2026-07-31 18:13 IST*
*Implementation Attribution: GPT-5.6 Terra (Codex)*

## Problems Resolved

- Repeated resizing previously multiplied the device-pixel-ratio transform.
- A hidden worldsheet could initialize at zero dimensions.
- Mobile compositing could leave a canvas visually black after scrolling.
- Measuring the entire worldsheet panel created a height feedback loop.

## Implementation

- Both renderers call `ctx.setTransform(1, 0, 0, 1, 0, 0)` before setting canvas dimensions and applying DPR scale.
- `updateWorldsheetVisibility()` waits one animation frame after display changes, resizes the worldsheet, then renders it.
- Scroll, visual-viewport resize, and document-visibility events queue a repaint.
- `#worldsheet-plot` is the dedicated measured canvas parent. It constrains desktop height to `clamp(240px, 28vw, 360px)` and mobile height to `clamp(190px, 48vw, 280px)`.

## Verified Sizes

The browser check observed desktop $1032\times360$, mobile $338\times190$, then desktop $1032\times360$ after returning from the mobile viewport.
