# MUTANT 05 - Editorial Sequence

Independent static portfolio experiment at `/mutant-05/`.

## Direction

A long-form editorial photo sequence rather than another draggable spatial field. The opening self-portrait leads; the rest of the selected archive is arranged into asymmetrical one-, two-, and three-image spreads. The sequence remains vertical and straightforward on phones.

## Implementation

- Static HTML, CSS and JavaScript. No backend, libraries, tracking scripts or remote fonts.
- Uses the current `index-main-works.js` manifest and `previews/metadata.json`.
- Duplicate file paths are removed while preserving source order and the opening self-portrait.
- Gallery images use `cut-previews/`; untouched originals load only in the viewer.
- Natural aspect ratios and intrinsic dimensions are preserved.
- Responsive single-column mobile layout.
- Viewer supports previous/next, keyboard arrows, Escape, touch swipe, swipe-down dismissal, focus return and scroll restoration.
- Reduced-motion preference is respected.

## Streamline attribution

Functional viewer icons are adapted from Streamline Core Line - Free:
- Move Left: https://www.streamlinehq.com/icons/download/move-left--26733
- Move Right: https://www.streamlinehq.com/icons/download/move-right--26733
- Delete 1: https://www.streamlinehq.com/icons/download/delete-1--26733

Streamline Core Line - Free is licensed under Creative Commons Attribution 4.0 International (CC BY 4.0): https://creativecommons.org/licenses/by/4.0/

The icons are adapted as inline SVG paths for this interface. Attribution link is also present in the page footer.
