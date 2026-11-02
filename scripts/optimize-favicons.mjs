/**
 * Generate Google-friendly favicon sizes from the brand icon.
 * Run: node scripts/optimize-favicons.mjs
 */
import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const publicDir = path.join(root, "public");

const SOURCE = path.join(publicDir, "icon.png");

async function writePng(size, outPath) {
  await sharp(SOURCE)
    .resize(size, size, { fit: "cover" })
    .png({ compressionLevel: 9, palette: true })
    .toFile(outPath);
  const kb = (fs.statSync(outPath).size / 1024).toFixed(1);
  console.log(`${path.basename(outPath)} (${size}x${size}) -> ${kb} KiB`);
}

async function writeIco(outPath) {
  const sizes = [16, 32, 48];
  const buffers = await Promise.all(
    sizes.map((size) =>
      sharp(SOURCE).resize(size, size, { fit: "cover" }).png().toBuffer()
    )
  );

  let toIco;
  try {
    toIco = (await import("to-ico")).default;
  } catch {
    console.warn("to-ico not installed; run: npm install --save-dev to-ico");
    await sharp(SOURCE).resize(32, 32, { fit: "cover" }).png().toFile(outPath.replace(".ico", "-fallback.png"));
    return;
  }

  const ico = await toIco(buffers);
  fs.writeFileSync(outPath, ico);
  console.log(`${path.basename(outPath)} -> ${(ico.length / 1024).toFixed(1)} KiB`);
}

if (!fs.existsSync(SOURCE)) {
  console.error("Missing public/icon.png");
  process.exit(1);
}

console.log("Generating favicons from public/icon.png...\n");

await writePng(16, path.join(publicDir, "favicon-16x16.png"));
await writePng(32, path.join(publicDir, "favicon-32x32.png"));
await writePng(48, path.join(publicDir, "favicon-48x48.png"));
await writePng(96, path.join(publicDir, "favicon-96x96.png"));
await writePng(180, path.join(publicDir, "apple-touch-icon.png"));
await writePng(192, path.join(publicDir, "android-chrome-192x192.png"));

await writeIco(path.join(publicDir, "favicon.ico"));

// Icons are declared only in app/layout.tsx metadata. Do not copy them into
// app/ as files: app/favicon.ico, app/icon.png and app/apple-icon.png are file
// conventions that emit a second set of <link> tags, which made browsers
// download /favicon.ico twice (measured: +14 KiB per first visit).
console.log("\nDone. Icons live in public/ and are declared in app/layout.tsx metadata.");
