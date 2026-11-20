const fs = require("node:fs/promises");
const path = require("node:path");
const sharp = require("sharp");

const ROOT = process.cwd();
const PHOTOS_ROOT = path.join(ROOT, "photos");
const PREVIEW_WIDTH = 960;
const PREVIEW_QUALITY = 82;
const CUT_PREVIEW_WIDTH = 1800;
const CUT_PREVIEW_QUALITY = 88;
const EXCLUDED = new Set([
  "photos/2/3.webp","photos/2/4.webp","photos/2/5.webp","photos/2/6.webp",
  "photos/2/7.webp","photos/2/8.webp","photos/2/9.webp","photos/2/10.webp",
  "photos/2/11.webp","photos/2/12.webp","photos/2/13.webp","photos/2/14.webp",
  "photos/2/15.webp","photos/2/16.webp","photos/2/17.webp","photos/2/18.webp",
  "photos/2/19.webp","photos/3/15.webp","photos/3/16.webp","photos/3/17.webp",
  "photos/3/18.webp","photos/3/19.webp","photos/3/20.webp","photos/5/13.webp",
  "photos/5/6.webp","photos/6/20.webp"
]);
const SCALES = ["medium","wide","compact","full","medium","wide","medium","compact","full","wide"];
const ALIGNMENTS = ["left","right","center","center","right","left","center","right","left","center"];

function naturalSort(a,b) {
  return a.localeCompare(b, undefined, {numeric:true, sensitivity:"base"});
}

async function listFiles(dir, filter) {
  let entries = [];
  try { entries = await fs.readdir(dir, {withFileTypes:true}); } catch { return []; }
  return entries.filter(entry => entry.isFile() && filter.test(entry.name)).map(entry => entry.name).sort(naturalSort);
}

async function buildManifest(seriesFolders) {
  const works = [];
  let order = 0;
  for (const folder of seriesFolders) {
    const files = await listFiles(path.join(PHOTOS_ROOT, folder), /\.webp$/i);
    for (const name of files) {
      const relative = "photos/" + folder + "/" + name;
      const rhythm = order % SCALES.length;
      order++;
      if (EXCLUDED.has(relative)) continue;
      works.push({
        id: String(order).padStart(2,"0"),
        file: relative === "photos/6/10.webp" ? "photos/1/16.webp" : relative,
        series: "Series " + folder.padStart(2,"0"),
        scale: SCALES[rhythm],
        align: ALIGNMENTS[rhythm],
        order
      });
    }
  }

  const manifestPath = path.join(ROOT, "index-main-works.js");
  const existing = await fs.readFile(manifestPath, "utf8");
  const configEnd = existing.indexOf("// BEGIN GENERATED ARCHIVE");
  if (configEnd < 0) throw new Error("Could not locate TANIBERGEN_CONFIG in index-main-works.js");
  const config = existing.slice(0, configEnd);
  const source = config + "// BEGIN GENERATED ARCHIVE\nwindow.TANIBERGEN_WORKS = " + JSON.stringify(works, null, 2) + ";\n";
  await fs.writeFile(manifestPath, source);
  return works;
}

async function main() {
  const directories = await fs.readdir(PHOTOS_ROOT, {withFileTypes:true});
  const seriesFolders = directories
    .filter(entry => entry.isDirectory() && /^\d+$/.test(entry.name))
    .map(entry => entry.name)
    .sort((a,b) => Number(a)-Number(b));

  let processed = 0;
  const dimensions = {};

  for (const folder of seriesFolders) {
    const sourceDir = path.join(PHOTOS_ROOT, folder);
    const names = await listFiles(sourceDir, /\.webp$/i);
    for (const name of names) {
      const relative = "photos/" + folder + "/" + name;
      const input = path.join(sourceDir, name);
      const outputDir = path.join(ROOT, "previews", "photos", folder);
      const output = path.join(outputDir, name);
      await fs.mkdir(outputDir, {recursive:true});
      const source = sharp(input);
      const metadata = await source.metadata();
      dimensions[relative] = {width:metadata.width,height:metadata.height};
      await source.rotate().resize({width:PREVIEW_WIDTH,height:PREVIEW_WIDTH,fit:"inside",withoutEnlargement:true})
        .webp({quality:PREVIEW_QUALITY,effort:5}).toFile(output);
      processed++;
    }
  }

  const meDir = path.join(PHOTOS_ROOT, "me");
  const meNames = await listFiles(meDir, /\.(webp|jpe?g|png|avif)$/i);
  for (const name of meNames) {
    const relative = "photos/me/" + name;
    const input = path.join(meDir, name);
    const outputName = path.parse(name).name + ".webp";
    const outputDir = path.join(ROOT, "previews", "photos", "me");
    const output = path.join(outputDir, outputName);
    await fs.mkdir(outputDir, {recursive:true});
    const source = sharp(input);
    const metadata = await source.metadata();
    dimensions[relative] = {width:metadata.width,height:metadata.height};
    await source.rotate().resize({width:PREVIEW_WIDTH,height:PREVIEW_WIDTH,fit:"inside",withoutEnlargement:true})
      .webp({quality:PREVIEW_QUALITY,effort:5}).toFile(output);
    processed++;
  }

  await fs.mkdir(path.join(ROOT,"previews"),{recursive:true});
  await fs.writeFile(path.join(ROOT,"previews","metadata.json"),JSON.stringify(dimensions));

  const works = await buildManifest(seriesFolders);
  const uniqueFiles = Array.from(new Set(works.map(work => work.file)));
  let cutProcessed = 0;
  for (const relativeFile of uniqueFiles) {
    const input = path.join(ROOT, relativeFile);
    const output = path.join(ROOT, "cut-previews", relativeFile);
    await fs.mkdir(path.dirname(output),{recursive:true});
    await sharp(input).rotate().resize({width:CUT_PREVIEW_WIDTH,height:CUT_PREVIEW_WIDTH,fit:"inside",withoutEnlargement:true})
      .webp({quality:CUT_PREVIEW_QUALITY,effort:5}).toFile(output);
    cutProcessed++;
  }

  console.log("Generated " + processed + " lightweight previews, " + cutProcessed + " high-quality archive previews, " + works.length + " manifest records across " + seriesFolders.length + " numbered series.");
}

main().catch(error => { console.error(error); process.exitCode = 1; });
