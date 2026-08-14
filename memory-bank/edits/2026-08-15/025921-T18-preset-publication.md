# T18: Publish conformal preset family

**Timestamp:** 2026-08-15 02:59:21 IST  
**Scope:** Static website publication and live verification

## Evidence

- Website commit: `c4a6a46c0469be99e96188f94565fe90d543d409` (`deploy(strings-sim): publish T18 presets`).
- GitHub Actions run: `31842567883`, completed successfully.
- Live routes: `/projects/strings-sim/`, `/learn/`, `/glossary/`, and `/implementation/` all returned HTTP 200.
- Live assets: `docs-3sF0S9Mx.css`, `docs-BegV--wi.js`, `modulepreload-polyfill-B5Qt9EMX.js`, `simulator-CL5G3HP_.css`, and `simulator-TAiJDWHy.js` all returned HTTP 200.
- Live HTML contains the T18 preset description control and conformal-preset explanatory copy.
- Live JavaScript contains the preset-family label and embedding resize markers.
- Website worktree is clean and synchronized with `origin/master`.

## Boundary

- The source implementation and Memory Bank changes remain intentionally local and uncommitted.
- T18 remains in progress pending the documented nonlinear mode-coupling/observable gate.
