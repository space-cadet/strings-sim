# Canvas Resize Transform Fix

*Created: 2026-07-31 14:55 IST*

## Problem

Both `StringRenderer` and `WorldsheetRenderer` call `this.ctx.scale(this.dpr, this.dpr)` on every resize. Without resetting the transform matrix first, repeated window resizes accumulate the scale factor.

With DPR=2 (Retina), after N resizes the effective scale is `2^N`. After 5 resizes, content is 32× too large.

## Affected Files

- `src/visualization/renderer.ts` — `handleResize()`
- `src/visualization/worldsheet.ts` — `handleResize()`

## Fix

Reset the transform matrix before scaling:

```typescript
handleResize(): void {
  const rect = this.canvas.parentElement?.getBoundingClientRect();
  if (!rect) return;

  this.width = rect.width;
  this.height = rect.height;

  // Reset transform before any canvas dimension changes
  this.ctx.setTransform(1, 0, 0, 1, 0, 0);

  this.canvas.width = this.width * this.dpr;
  this.canvas.height = this.height * this.dpr;
  this.canvas.style.width = `${this.width}px`;
  this.canvas.style.height = `${this.height}px`;

  this.ctx.scale(this.dpr, this.dpr);
}
```

## Better: ResizeObserver

Consider using `ResizeObserver` on the canvas container instead of `window.resize`:

```typescript
private resizeObserver: ResizeObserver | null = null;

constructor(config: RendererConfig) {
  // ... existing setup ...
  this.resizeObserver = new ResizeObserver(() => this.handleResize());
  this.resizeObserver.observe(this.canvas.parentElement!);
}
```

`ResizeObserver` fires when the container size changes (CSS, layout, etc.), not just on window resize. More reliable for responsive layouts.

## Verification

1. Open simulator
2. Resize browser window 10+ times
3. Canvas content should remain at correct physical scale
4. Check `ctx.getTransform()` in dev tools — should show scale = DPR, not DPR^N

## Related

- T10a
- Terra's review (Point 10)
