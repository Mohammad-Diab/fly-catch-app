import { pixelRatio } from "./sprites";

// One canvas for everything that moves. Drawn in CSS pixels; cleared only while something is or was on it
export class Stage {
  readonly x: CanvasRenderingContext2D;
  dpr = 1;
  w = 0;
  h = 0;
  dirty = true;   // must be drawn even while paused (after a resize clears it)
  private drawn = false;

  constructor(readonly canvas: HTMLCanvasElement) {
    this.x = canvas.getContext("2d")!;
  }

  resize(w: number, h: number) {
    const dpr = pixelRatio();
    if (w === this.w && h === this.h && dpr === this.dpr) return;
    this.w = w; this.h = h; this.dpr = dpr;
    this.canvas.width = Math.round(w * dpr);
    this.canvas.height = Math.round(h * dpr);
    this.drawn = false;
    this.dirty = true;
  }

  // Starts a frame; false when there's nothing to draw and the canvas is already empty
  begin(busy: boolean): boolean {
    this.dirty = false;
    if (!busy && !this.drawn) return false;
    const x = this.x;
    x.setTransform(1, 0, 0, 1, 0, 0);
    x.clearRect(0, 0, this.canvas.width, this.canvas.height);
    x.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.drawn = busy;
    return busy;
  }
}
