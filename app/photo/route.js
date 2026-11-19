// Placeholder "photo": a gradient SVG with a big initial. No external image hosts needed.
// Used as /photo?id=3
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function GET(req) {
  const id = parseInt(new URL(req.url).searchParams.get('id'), 10) || 0;
  const hue = (id * 47) % 360;
  const letter = LETTERS[(id * 7) % 26];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="hsl(${hue},75%,62%)"/><stop offset="1" stop-color="hsl(${(hue + 50) % 360},70%,38%)"/>
</linearGradient></defs>
<rect width="600" height="800" fill="url(#g)"/>
<circle cx="300" cy="330" r="110" fill="rgba(255,255,255,.28)"/>
<ellipse cx="300" cy="640" rx="200" ry="170" fill="rgba(255,255,255,.28)"/>
<text x="300" y="372" font-family="sans-serif" font-size="120" font-weight="700" fill="#fff" text-anchor="middle">${letter}</text>
</svg>`;
  return new Response(svg, {
    headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=86400' },
  });
}
