# TANIBERGEN

A lightweight static photography portfolio for GitHub Pages.

## Two art directions
- **AFTER HOURS** (default): dark, cinematic, asymmetrical image composition.
- **THE INDEX**: light, editorial archive layout. Open with `?view=index`.

Both views use the same image list. No framework, build step, backend, or image CDN is required.

## Add photographs
1. Create an `images` folder in the repository and upload your photographs there.
2. Open `works.js` and edit the entries in `TANIBERGEN_WORKS`.
3. Set each `file` to the image path, then edit its title, category and year.

Use JPG or WebP for web delivery. The first two images load eagerly; the rest are lazy-loaded. The lightbox preserves the original image proportions.

## Publish
In repository Settings → Pages, select Deploy from a branch, branch `main`, folder `/ (root)`.
The custom domain is set in `CNAME` to `tanibergen.online`. Configure DNS records at your domain registrar to point to GitHub Pages, then enable HTTPS in Pages settings.


## Saul Leiter-inspired alternative

An independent editorial version is available at `/saul-leiter-alt/`.
It uses the photographs already stored in the numbered root folders. The main homepage is not replaced.

A separate branch named `saul-leiter-alt` contains this alternative for isolated development.

## Website notes

On the alternative version, use the `SITE NOTE` control and enter a command such as:

`/upd#1 The text in the About section needs correcting.`

The draft is retained in the current browser. The send action opens a prefilled GitHub Issue; press **Submit new issue** on GitHub to store the report in the repository. This is deliberate: the static site does not contain a GitHub access token.

Reports can be collected from GitHub Issues by searching for `[SITE NOTE`.
