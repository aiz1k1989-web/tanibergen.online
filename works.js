// Image files are kept in their original numbered folders.
// Add or remove files here by changing the folder counts below.
window.TANIBERGEN_WORKS = [];
const TANIBERGEN_SERIES = [20, 20, 20, 20, 20, 20, 5];
TANIBERGEN_SERIES.forEach((count, seriesIndex) => {
  const folder = String(seriesIndex + 1);
  for (let frame = 1; frame <= count; frame++) {
    const number = String(frame).padStart(2, "0");
    window.TANIBERGEN_WORKS.push({
      file: folder + "/" + frame + ".webp",
      title: "FRAME " + folder + "." + number,
      category: "SERIES " + folder,
      year: "2026"
    });
  }
});
