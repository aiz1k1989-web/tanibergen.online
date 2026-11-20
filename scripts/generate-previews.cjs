const fs = require("node:fs/promises");
const path = require("node:path");
const sharp = require("sharp");

const SERIES = ["1", "2", "3", "4", "5", "6", "7"];
const ROOT = process.cwd();

async function main() {
  let processed = 0;
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
      await sharp(input)
        .rotate()
        .resize({ width: 640, height: 640, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 54, effort: 5 })
        .toFile(output);
      processed++;
    }
  }
  console.log(`Generated ${processed} responsive previews.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
