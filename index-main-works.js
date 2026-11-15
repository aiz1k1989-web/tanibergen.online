window.TANIBERGEN_CONFIG = {
  title: "TANIBERGEN",
  domain: "tanibergen.online",
  instagramHandle: "@isaac_4u",
  instagramUrl: "https://instagram.com/isaac_4u",
  statement: "Independent photographer. Working across cities, interiors, portraits, and everyday environments.",
  note: "Photographs are displayed in their original proportions, without cropping or applied filters."
};

window.TANIBERGEN_WORKS = [];
const TANIBERGEN_SERIES = [20, 20, 20, 20, 20, 20, 5];
const TANIBERGEN_SCALES = ["medium", "wide", "compact", "full", "medium", "wide", "medium", "compact", "full", "wide"];
const TANIBERGEN_ALIGNMENTS = ["left", "right", "center", "center", "right", "left", "center", "right", "left", "center"];

let tanibergenOrder = 0;
TANIBERGEN_SERIES.forEach((count, seriesIndex) => {
  const folder = String(seriesIndex + 1).padStart(2, "0");
  for (let frame = 1; frame <= count; frame++) {
    const rhythm = tanibergenOrder % TANIBERGEN_SCALES.length;
    tanibergenOrder += 1;
    window.TANIBERGEN_WORKS.push({
      id: String(tanibergenOrder).padStart(2, "0"),
      file: "" + (seriesIndex + 1) + "/" + frame + ".webp",
      series: "Series " + folder,
      scale: TANIBERGEN_SCALES[rhythm],
      align: TANIBERGEN_ALIGNMENTS[rhythm],
      order: tanibergenOrder
    });
  }
});
