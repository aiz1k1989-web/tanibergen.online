# TANIBERGEN - The Index

A static photography archive for GitHub Pages.

## Open

After publishing, the archive is available at:

`https://tanibergen.online/alt/`

The main homepage remains separate.

## Structure

- `index.html` - page structure
- `style.css` - visual design and responsive layout
- `app.js` - Sequence, Contact, Info, filters and fullscreen viewer
- `works.js` - site details and photograph list

Photographs are loaded from the existing numbered folders in the repository root. The files are not duplicated.

## Add a photograph

1. Upload the image to one of the numbered folders in the repository root, for example `4/21.webp`.
2. Add a new object to `window.TANIBERGEN_WORKS` in `works.js`.
3. Set `file` to the relative path from this folder, for example `../4/21.webp`.
4. Set `series`, `scale`, `align` and `order`.

Available scale values: `compact`, `medium`, `wide`, `full`.

Available alignment values: `left`, `center`, `right`.

The viewer reads each image's native dimensions after loading. You do not need to hardcode width and height. Images keep their original aspect ratios and are not cropped or filtered.

The first photographs load with priority. The remaining images are lazy-loaded. The fullscreen viewer preloads adjacent photographs.
