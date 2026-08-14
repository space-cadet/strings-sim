# T16, T18: Publish and live-verify simulator release

**Timestamp:** 2026-08-15 02:13:40 IST  
**Scope:** Website publication and Memory Bank synchronization

## Evidence

- Source `npm test`: 16 passing, 0 failing.
- Source `npm run build`: successful Vite production build.
- Website checkout was fast-forwarded before the generated payload replacement.
- Only `website/projects/strings-sim/` was replaced from the fresh `dist` output.
- Website commit: `9105ef0686d0ca882fd326a4fa2253829ef114cb` (`deploy(strings-sim): publish T17 and T18 engine`).
- GitHub Actions: run `31839085133`, completed successfully.
- Live routes: `/projects/strings-sim/`, `/learn/`, `/glossary/`, `/implementation/` all returned HTTP 200.
- Live assets: `docs-3sF0S9Mx.css`, `docs-Ch6cvTft.js`, `modulepreload-polyfill-B5Qt9EMX.js`, `simulator-B2s0pxtT.css`, and `simulator-Bscz5bn7.js` all returned HTTP 200.
- Live root HTML contains the T18 nonlinear mode and nonlinear classical dynamics markers.

## Status boundary

- T16 is complete: documentation/help content and live production verification are recorded.
- T18 remains in progress: a defensible documented nonlinear mode-coupling/observable example is still required before closing its full validation scope.
- The source repository remains intentionally uncommitted; the website publication is committed and pushed separately.
