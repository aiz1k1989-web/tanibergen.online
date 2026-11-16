# TANIBERGEN

A static photography portfolio for GitHub Pages.

## Versions

- Main homepage: `/`
- The Index archive: `/alt/`

The Index is a separate presentation of the same photographs. It includes Sequence and Contact views, series filters, an Info panel and a fullscreen viewer with mobile swipe navigation.

## Photograph storage

The original photographs remain in the numbered folders `1` to `7` at the repository root. The archive loads these files directly. No duplicate image library is created.

To add photographs to The Index:
1. Upload the image to its numbered folder.
2. Add an entry to `alt/works.js`.
3. Use a path relative to `alt/`, for example `../4/21.webp`.
4. Set its series, scale, alignment and order.

The viewer reads the image's natural dimensions after loading. Images retain their original proportions and are not cropped or filtered.

## Publishing

GitHub Pages deploys from the `main` branch, repository root. The custom domain is configured in `CNAME`.


## Journal publishing

The Journal reads public posts from GitHub Issues. To publish a post:

1. Open the Journal section on the website.
2. Select **Write a post**. GitHub opens the Blog post form.
3. Enter a title and write the post in the text field.
4. Drag photographs into the text field. GitHub uploads them and inserts the image links automatically. The first image becomes the cover image.
5. Publish the issue. It appears in the Journal automatically. No website code changes or redeployment are needed.

Only issues with the `[BLOG]` title prefix appear as posts. Close an issue to remove it from the public Journal. The repository and posts must remain public for the website to display them.
