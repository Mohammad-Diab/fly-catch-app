// Pictures are made once per size and reused every frame, shadows included, so a frame is only image copies

export const pixelRatio = () => Math.min(devicePixelRatio || 1, 2);

export function makeCanvas(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.ceil(w));
  c.height = Math.max(1, Math.ceil(h));
  return c;
}

export const ctx2d = (c: HTMLCanvasElement) => c.getContext("2d")!;

// Safari before 18 has no ctx.filter; it then skips the blur
export const canBlur = "filter" in ctx2d(makeCanvas(1, 1));

// An inline SVG as an image of exactly w×h pixels
export function svgImage(svg: string, w: number, h: number): Promise<HTMLImageElement> {
  const img = new Image();
  const src = svg.trim().replace("<svg ", `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" `);
  img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(src);
  return img.decode().then(() => img);
}

// The picture with empty room around it, for shadows and parts that swing out
export function padded(img: CanvasImageSource, w: number, h: number, pad: number): HTMLCanvasElement {
  const c = makeCanvas(w + pad * 2, h + pad * 2);
  ctx2d(c).drawImage(img, pad, pad, w, h);
  return c;
}

// Blurred black silhouette, drawn under the picture at the shadow's offset and strength.
// Canvas shadowBlur and CSS blur radius use the same scale, so blur is the CSS drop-shadow radius in pixels
export function silhouette(src: HTMLCanvasElement, blur: number): HTMLCanvasElement {
  const c = makeCanvas(src.width, src.height), x = ctx2d(c);
  const off = src.width + blur * 4 + 8;   // the picture itself lands off the canvas, only its shadow stays
  x.shadowColor = "#000";
  x.shadowBlur = blur;
  x.shadowOffsetX = off;
  x.drawImage(src, -off, 0);
  return c;
}

// The picture with a fixed drop shadow baked in
export function withShadow(src: HTMLCanvasElement, dx: number, dy: number, blur: number, color: string): HTMLCanvasElement {
  const c = makeCanvas(src.width, src.height), x = ctx2d(c);
  x.shadowColor = color;
  x.shadowBlur = blur;
  x.shadowOffsetX = dx;
  x.shadowOffsetY = dy;
  x.drawImage(src, 0, 0);
  x.shadowColor = "transparent";
  return c;
}

// Soft edges like CSS filter: blur(), applied to the finished drawing
export function blurred(src: HTMLCanvasElement, px: number): HTMLCanvasElement {
  if (!canBlur || px <= 0) return src;
  const c = makeCanvas(src.width, src.height), x = ctx2d(c);
  x.filter = `blur(${px}px)`;
  x.drawImage(src, 0, 0);
  return c;
}
