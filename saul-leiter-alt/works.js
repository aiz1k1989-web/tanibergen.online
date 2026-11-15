(() => {
  const series = [20, 20, 20, 20, 20, 20, 5];
  const works = [];
  series.forEach((count, index) => {
    const folder = String(index + 1);
    for (let frame = 1; frame <= count; frame++) {
      works.push({ file: "../" + folder + "/" + frame + ".webp" });
    }
  });
  window.TANIBERGEN_ALT_WORKS = works;
})();