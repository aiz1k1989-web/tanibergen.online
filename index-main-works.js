window.TANIBERGEN_CONFIG = {
  title: "tanibergen.online",
  domain: "tanibergen.online",
  instagramHandle: "@isaac_4u",
  instagramUrl: "https://instagram.com/isaac_4u",
  statement: "I’m Aizat Tanibergen, a photographer and videographer from Almaty, now based in Bangkok. I love experimenting with acid colours in my personal work, which inspired me to organise this archive by colour. This site is also my playground for creative experiments, interactive ideas and little tools for self-development. Mostly, I make things here for the fun of making something new.",
  note: ""
};

// BEGIN GENERATED ARCHIVE
window.TANIBERGEN_WORKS = [];
const TANIBERGEN_SERIES = [20, 20, 20, 20, 20, 20, 5];
const TANIBERGEN_EXCLUDED = new Set(["photos/2/3.webp","photos/2/4.webp","photos/2/5.webp","photos/2/6.webp","photos/2/7.webp","photos/2/8.webp","photos/2/9.webp","photos/2/10.webp","photos/2/11.webp","photos/2/12.webp","photos/2/13.webp","photos/2/14.webp","photos/2/15.webp","photos/2/16.webp","photos/2/17.webp","photos/2/18.webp","photos/2/19.webp","photos/3/15.webp","photos/3/16.webp","photos/3/17.webp","photos/3/18.webp","photos/3/19.webp","photos/3/20.webp","photos/5/13.webp","photos/5/6.webp","photos/6/20.webp"]);
const TANIBERGEN_SCALES = ["medium", "wide", "compact", "full", "medium", "wide", "medium", "compact", "full", "wide"];
const TANIBERGEN_ALIGNMENTS = ["left", "right", "center", "center", "right", "left", "center", "right", "left", "center"];

let tanibergenOrder = 0;
TANIBERGEN_SERIES.forEach((count, seriesIndex) => {
  const folder = String(seriesIndex + 1).padStart(2, "0");
  for (let frame = 1; frame <= count; frame++) {
    const rhythm = tanibergenOrder % TANIBERGEN_SCALES.length;
    tanibergenOrder += 1;
    if (TANIBERGEN_EXCLUDED.has("photos/" + (seriesIndex + 1) + "/" + frame + ".webp")) continue;
    window.TANIBERGEN_WORKS.push({
      id: String(tanibergenOrder).padStart(2, "0"),
      file: (seriesIndex === 5 && frame === 10 ? "photos/1/16.webp" : "photos/" + (seriesIndex + 1) + "/" + frame + ".webp"),
      series: "Series " + folder,
      scale: TANIBERGEN_SCALES[rhythm],
      align: TANIBERGEN_ALIGNMENTS[rhythm],
      order: tanibergenOrder
    });
  }
});

// Keep the selected opening photograph at the front of the sequence.
// Keep source order in the data. The public All view is shuffled at runtime.
