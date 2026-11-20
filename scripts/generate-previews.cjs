const fs = require("node:fs/promises");
const path = require("node:path");
const sharp = require("sharp");

const SERIES = ["1", "2", "3", "4", "5", "6", "7"];
const ROOT = process.cwd();
const CUT_PREVIEW_WIDTH = 1800;
const CUT_PREVIEW_QUALITY = 88;

async function main() {
  let processed = 0;
  const dimensions = {};

  for (const series of SERIES) {
    const sourceDir = path.join(ROOT, series);
    let entries = [];
    try {
      entries = await fs.readdir(sourceDir, { withFileTypes: true });
    } catch {
      continue;
    }

    for (const entry of entries) {
      if (!entry.isFile() || !/\.webp$/i.test(entry.name)) continue;
      const input = path.join(sourceDir, entry.name);
      const outputDir = path.join(ROOT, "previews", series);
      const output = path.join(outputDir, entry.name);
      await fs.mkdir(outputDir, { recursive: true });
      const source = sharp(input);
      const metadata = await source.metadata();
      dimensions[series + "/" + entry.name] = { width: metadata.width, height: metadata.height };
      await source
        .rotate()
        .resize({ width: 640, height: 640, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 54, effort: 5 })
        .toFile(output);
      processed++;
    }
  }

  await fs.writeFile(path.join(ROOT, "previews", "metadata.json"), JSON.stringify(dimensions));

  // The CUT route uses a separate high-quality preview tier.
  // Originals remain untouched and are still loaded only in the image viewer.
  global.window = {};
  require(path.join(ROOT, "index-main-works.js"));
  const manifest = Array.isArray(global.window.TANIBERGEN_WORKS)
    ? global.window.TANIBERGEN_WORKS
    : [];
  const uniqueFiles = Array.from(new Set(manifest.map((work) => work && work.file).filter(Boolean)));
  let cutProcessed = 0;

  for (const relativeFile of uniqueFiles) {
    const input = path.join(ROOT, relativeFile);
    const output = path.join(ROOT, "cut-previews", relativeFile);
    await fs.mkdir(path.dirname(output), { recursive: true });
    await sharp(input)
      .rotate()
      .resize({
        width: CUT_PREVIEW_WIDTH,
        height: CUT_PREVIEW_WIDTH,
        fit: "inside",
        withoutEnlargement: true
      })
      .webp({ quality: CUT_PREVIEW_QUALITY, effort: 5 })
      .toFile(output);
    cutProcessed++;
  }

  console.log(
    `Generated ${processed} lightweight previews, ${cutProcessed} high-quality CUT previews, and image dimensions.`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
