/**
 * Otimiza uma imagem de produto para a vitrine (sem ampliar além do original).
 * Uso: node scripts/optimize-product-image.mjs <slug-ou-caminho>
 */

import { existsSync } from "node:fs";
import { resolve, extname, join } from "node:path";
import sharp from "sharp";

const inputArg = process.argv[2];
if (!inputArg) {
  console.error("Uso: node scripts/optimize-product-image.mjs <slug|caminho>");
  process.exit(1);
}

const IMAGE_DIR = resolve(process.cwd(), "data/product-images");
const ALLOWED = new Set([".png", ".jpg", ".jpeg", ".webp"]);

let filePath = resolve(inputArg);
if (!existsSync(filePath)) {
  for (const ext of ALLOWED) {
    const candidate = join(IMAGE_DIR, `${inputArg}${ext}`);
    if (existsSync(candidate)) {
      filePath = candidate;
      break;
    }
  }
}

if (!existsSync(filePath)) {
  console.error("Arquivo nao encontrado:", inputArg);
  process.exit(1);
}

const meta = await sharp(filePath).metadata();
const buffer = await sharp(filePath)
  .resize(400, 400, {
    fit: "contain",
    background: { r: 255, g: 255, b: 255, alpha: 1 },
    withoutEnlargement: true,
  })
  .png({ compressionLevel: 9 })
  .toBuffer();

await sharp(buffer).toFile(filePath);

const after = await sharp(filePath).metadata();
console.log(
  `OK: ${filePath}\n   ${meta.width}x${meta.height} -> ${after.width}x${after.height} (${buffer.byteLength} bytes)`,
);
