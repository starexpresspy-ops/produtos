export function wrapProductLabelLines(name, maxCharsPerLine = 16, maxLines = 3) {
  const clean = String(name || "").trim().replace(/\s+/g, " ");
  if (!clean) return ["Produto"];

  const words = clean.split(" ");
  const lines = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxCharsPerLine) {
      current = candidate;
      continue;
    }

    if (current) lines.push(current);
    current = word.length > maxCharsPerLine ? `${word.slice(0, maxCharsPerLine - 1)}…` : word;
    if (lines.length >= maxLines - 1) break;
  }

  if (lines.length < maxLines && current) lines.push(current);

  if (lines.length === maxLines) {
    const usedWords = lines.join(" ").split(" ").length;
    if (usedWords < words.length) {
      const last = lines[maxLines - 1];
      lines[maxLines - 1] = last.endsWith("…") ? last : `${last}…`;
    }
  }

  return lines.slice(0, maxLines);
}

function escapeXml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function buildVialPlaceholderSvg(productName) {
  const lines = wrapProductLabelLines(productName);
  const lineHeight = 15;
  const labelStartY = 214 - ((lines.length - 1) * lineHeight) / 2;
  const labelText = lines
    .map(
      (line, index) =>
        `<text x="200" y="${labelStartY + index * lineHeight}" text-anchor="middle" fill="#1a3558" font-size="11" font-weight="700" font-family="Arial, Helvetica, sans-serif">${escapeXml(line)}</text>`,
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
  <defs>
    <linearGradient id="vial-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f5f8fc"/>
      <stop offset="100%" stop-color="#e7eef6"/>
    </linearGradient>
    <linearGradient id="vial-glass" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#dfe8f2" stop-opacity="0.95"/>
      <stop offset="45%" stop-color="#f8fbff" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#c9d7e6" stop-opacity="0.9"/>
    </linearGradient>
    <linearGradient id="vial-cap" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#d7dde5"/>
      <stop offset="100%" stop-color="#9aa6b5"/>
    </linearGradient>
    <linearGradient id="vial-liquid" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#f6e7b8" stop-opacity="0.85"/>
      <stop offset="100%" stop-color="#d8b35d" stop-opacity="0.9"/>
    </linearGradient>
  </defs>
  <rect width="400" height="400" fill="url(#vial-bg)"/>
  <ellipse cx="200" cy="292" rx="58" ry="10" fill="#c5d0dc" opacity="0.45"/>
  <rect x="168" y="98" width="64" height="18" rx="4" fill="url(#vial-cap)"/>
  <rect x="174" y="92" width="52" height="10" rx="3" fill="#eef2f6"/>
  <path d="M154 116 H246 Q252 116 252 122 V286 Q252 304 236 310 H164 Q148 304 148 286 V122 Q148 116 154 116 Z" fill="url(#vial-glass)" stroke="#b7c5d4" stroke-width="2"/>
  <path d="M162 228 H238 V286 Q238 296 226 299 H174 Q162 296 162 286 Z" fill="url(#vial-liquid)"/>
  <rect x="164" y="188" width="72" height="58" rx="5" fill="#ffffff" stroke="#c8d5e3"/>
  <rect x="168" y="192" width="64" height="50" rx="4" fill="#f8fbfe"/>
  ${labelText}
  <path d="M158 132 C170 150 170 170 158 188" stroke="#ffffff" stroke-width="3" opacity="0.55" fill="none"/>
</svg>`;
}
