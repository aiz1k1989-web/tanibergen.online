window.TANIBERGEN_CONFIG = {
  title: "Chroma Diary",
  domain: "tanibergen.online",
  instagramHandle: "@isaac_4u",
  instagramUrl: "https://instagram.com/isaac_4u",
  statement: "Independent photographer. Working across cities, interiors, portraits, and everyday environments.",
  note: "Photographs are displayed in their original proportions, without cropping or applied filters."
};

window.TANIBERGEN_WORKS = [];
const TANIBERGEN_SERIES = [20, 20, 20, 20, 20, 20, 5];
const TANIBERGEN_EXCLUDED = new Set(["2/3.webp","2/4.webp","2/5.webp","2/6.webp","2/7.webp","2/8.webp","2/9.webp","2/10.webp","2/11.webp","2/12.webp","2/13.webp","2/14.webp","2/15.webp","2/16.webp","2/17.webp","2/18.webp","2/19.webp","3/15.webp","3/16.webp","3/17.webp","3/18.webp","3/19.webp","3/20.webp","5/13.webp","5/6.webp","6/20.webp"]);
const TANIBERGEN_SCALES = ["medium", "wide", "compact", "full", "medium", "wide", "medium", "compact", "full", "wide"];
const TANIBERGEN_ALIGNMENTS = ["left", "right", "center", "center", "right", "left", "center", "right", "left", "center"];

let tanibergenOrder = 0;
TANIBERGEN_SERIES.forEach((count, seriesIndex) => {
  const folder = String(seriesIndex + 1).padStart(2, "0");
  for (let frame = 1; frame <= count; frame++) {
    const rhythm = tanibergenOrder % TANIBERGEN_SCALES.length;
    tanibergenOrder += 1;
    if (TANIBERGEN_EXCLUDED.has((seriesIndex + 1) + "/" + frame + ".webp")) continue;
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

// Keep the selected opening photograph at the front of the sequence.
// Keep source order in the data. The public All view is shuffled at runtime.
