import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import sharp from "sharp";
import { wrapProductLabelLines } from "./vial-placeholder-svg.mjs";

const TEMPLATE_PATH = resolve(process.cwd(), "data/vial-template.png");
const OUTPUT_SIZE = 400;

const LABEL = {
  left: 0.2,
  top: 0.435,
  width: 0.6,
  height: 0.2,
};

function escapeXml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildLabelOverlaySvg(lines, size) {
  const boxLeft = size * LABEL.left;
  const boxTop = size * LABEL.top;
  const boxWidth = size * LABEL.width;
  const boxHeight = size * LABEL.height;
  const centerX = boxLeft + boxWidth / 2;
  const fontSize = lines.length > 2 ? 10 : 11;
  const lineHeight = fontSize + 3;
  const textBlockHeight = (lines.length - 1) * lineHeight;
  const startY = boxTop + boxHeight / 2 - textBlockHeight / 2 + fontSize * 0.35;

  const labelText = lines
    .map(
      (line, index) =>
        `<text x="${centerX}" y="${startY + index * lineHeight}" text-anchor="middle" fill="#142a4a" font-size="${fontSize}" font-weight="700" font-family="Arial, Helvetica, sans-serif">${escapeXml(line)}</text>`,
    )
    .join("");

  return Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
  ${labelText}
</svg>`);
}

export async function renderVialPlaceholderPng(productName) {
  if (!existsSync(TEMPLATE_PATH)) {
    throw new Error("Template nao encontrado: data/vial-template.png");
  }

  const template = readFileSync(TEMPLATE_PATH);
  const lines = wrapProductLabelLines(productName, 14, 3);
  const base = await sharp(template)
    .resize(OUTPUT_SIZE, OUTPUT_SIZE, {
      fit: "contain",
      background: { r: 6, g: 14, b: 28 },
    })
    .png()
    .toBuffer();

  const overlay = buildLabelOverlaySvg(lines, OUTPUT_SIZE);

  return sharp(base)
    .composite([{ input: overlay, top: 0, left: 0 }])
    .png({ compressionLevel: 9 })
    .toBuffer();
}
