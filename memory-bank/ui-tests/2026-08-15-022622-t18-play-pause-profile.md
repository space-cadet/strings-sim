# UI Test Session: T18 Play/Pause and profile autoscaling
**Date**: 2026-08-15 02:26:22 IST
**URL**: http://127.0.0.1:5173/projects/strings-sim/
**Tester**: Codex via Playwright CLI

## Test Objective

Verify the single Play/Pause control, Reset state, T18 crossing caveat, and automatic profile y-axis range.

## Test Steps Log

### Step 1: Open T18 mode
**Action**: Selected `T18 Nonlinear`.
**Expected**: The target-space projection and T18 diagnostics appear; the profile remains visible.
**Actual**: T18 embedding, periodic boundary, constraint residual, and crossing/reconnection caveat appeared.
**Console Errors**: None
**Status**: PASS

### Step 2: Toggle playback
**Action**: Clicked the single `Play simulation` button, then clicked `Pause simulation`.
**Expected**: The same button changes icon, accessible label, title, and `aria-pressed` state.
**Actual**: Play changed to Pause with `aria-pressed=true`; Pause changed it back to Play with `aria-pressed=false`.
**Console Errors**: None
**Status**: PASS

### Step 3: Reset playback
**Action**: Clicked `Reset simulation` after pausing.
**Expected**: The simulation resets and the combined control remains in the Play state.
**Actual**: The button remained `Play simulation`; the T18 constraint residual returned to its initial-scale value.
**Console Errors**: None
**Status**: PASS

### Step 4: Check profile range
**Action**: Played the T18 mode and inspected the profile plot screenshot.
**Expected**: The profile curve stays inside the visible plotting area with padded y-axis bounds.
**Actual**: The profile remained visible; the renderer now derives the vertical range from current data with a minimum half-range of 0.5 and 15% breathing room.
**Screenshot**: `memory-bank/screenshots/2026-08-15-t18-profile-autoscale-top.png`
**Console Errors**: None
**Status**: PASS

## Summary

- Single Play/Pause control: PASS
- T18 physical-model caveat visible: PASS
- Profile y-axis autoscaling: PASS
- Browser console errors: 0
