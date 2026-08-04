# UI Test Session: Probe trajectory

**Date**: 2026-08-04 18:16:14 IST
**URL**: `http://127.0.0.1:5173/projects/strings-sim/`
**Tester**: Codex

## Test Objective

Verify selection, history rendering, responsive layout, glossary deep link, and console health for the probe trajectory.

## Test Steps Log

### Step 1: Desktop probe selection and trajectory

**Action**: Selected a point on the profile, advanced the simulation, then paused it.

**Expected**: The probe panel opens; its status reports $\sigma_\ast$; the profile marker, worldsheet worldline, and trajectory trace share the cyan encoding.

**Actual**: Passed. The panel opened at $\sigma_\ast = 0.97$ and the recorded trajectory contained a visible cyan trace.

**Console Errors**: None.

**Screenshot**: `memory-bank/screenshots/2026-08-04-181614-probe-trajectory-desktop.png`

**Status**: PASS

### Step 2: Mobile probe selection and trajectory

**Action**: Repeated the selection and playback check at a $390 \times 844$ viewport.

**Expected**: The stacked worldsheet and probe panels remain usable, and the probe trace remains visible.

**Actual**: Passed. The probe panel opened at $\sigma_\ast = 0.93$ with a visible cyan trace beneath the worldsheet.

**Console Errors**: None.

**Screenshot**: `memory-bank/screenshots/2026-08-04-181614-probe-trajectory-mobile.png`

**Status**: PASS

### Step 3: Glossary deep link and mathematical rendering

**Action**: Opened `/projects/strings-sim/glossary/#probe-trajectory`.

**Expected**: The probe glossary card resolves directly and renders its LaTex expressions locally.

**Actual**: Passed. The target card was unique and contained six rendered KaTeX elements.

**Console Errors**: None.

**Status**: PASS

## Summary

All tested probe interactions passed on desktop and mobile. The glossary deep link resolved and its mathematics rendered locally; no browser-console errors were recorded.
