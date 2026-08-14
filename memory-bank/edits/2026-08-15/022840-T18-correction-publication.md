# T18: Publish playback and profile correction

**Timestamp:** 2026-08-15 02:28:40 IST  
**Scope:** Website publication and live verification

## Evidence

- Website commit: `ad9bd08029780e94b116b70b64491d77652ebaa5` (`deploy(strings-sim): refine playback and profile view`).
- GitHub Actions run: `31840298369`, completed successfully.
- Live routes: `/projects/strings-sim/`, `/learn/`, `/glossary/`, and `/implementation/` all returned HTTP 200.
- Live assets: `docs-3sF0S9Mx.css`, `docs-BZgSzpED.js`, `modulepreload-polyfill-B5Qt9EMX.js`, `simulator-B2s0pxtT.css`, and `simulator-CpQkmsMM.js` all returned HTTP 200.
- Live HTML/JavaScript contains `btn-play-pause`, `togglePlayPause`, `Pause simulation`, and `setVerticalBoundsFromData`.
- Website worktree is clean and synchronized with `origin/master`.

## Change boundary

- The T18 projection caveat now states that crossings are allowed classical configurations in this model, without reconnection or interaction dynamics.
- The source repository remains intentionally uncommitted; the generated website payload was committed and pushed separately.
