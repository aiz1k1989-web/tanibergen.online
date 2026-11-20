# Photo library

All original photographs live here.

## Main archive

- `1/` through `7/` are the current archive series.
- Add the next series as `8/`, then `9/`, and so on.
- Put original `.webp` files inside each numbered folder. Number filenames naturally: `1.webp`, `2.webp`, `3.webp`.
- The GitHub Actions workflow automatically discovers new numbered folders, updates `index-main-works.js`, and regenerates previews. Do not edit the manifest or preview folders manually.
- Keep originals in this folder. Do not upload compressed preview files here.

## About portraits

- `me/` contains the portraits used by the Repponen About section.
- It supports WebP, JPG/JPEG, PNG and AVIF.
- One portrait is selected at random each time the page loads. The entire set is not shown as a gallery.
- Add or replace portraits in this folder. The same workflow creates optimized WebP previews.

Generated files are stored separately in `../previews/photos/` and `../cut-previews/photos/`. They can be regenerated at any time from the originals here.
