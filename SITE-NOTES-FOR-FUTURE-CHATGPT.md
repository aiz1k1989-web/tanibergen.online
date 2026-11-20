# TANIBERGEN WEBSITE - WORKING NOTES FOR FUTURE CHATGPT SESSIONS

> Read this file before making any change to the Tanibergen website or repository. Treat it as the standing project brief. The user's newest explicit instruction takes priority if it conflicts with an older experiment. Do not silently discard a critical comment.

## 1. Project identity

- Repository: https://github.com/aiz1k1989-web/tanibergen.online
- Public domain: https://tanibergen.online
- This is Aizat Tanibergen's personal photographic website and visual archive.
- Identity text previously approved: "Aizat Tanibergen, photographer and videographer from Almaty, now based in Bangkok."
- The photographs are the main subject. The site is a portfolio and an experimental visual space, not a generic creative-agency template.
- The site name/domain should remain `tanibergen.online`. The user previously asked for the header to read exactly `tanibergen.online` in the main archive. Do not replace it with invented studio names or generic branding.
- The user wants a distinctive authorial point of view. A good film director or creative director should come away with a positive impression of the photographer and the work.

## 2. Mandatory workflow for every future site task

1. Read this file before inspecting or editing the site.
2. Inspect the current `main`, the relevant alternative route, and recent commits before changing anything. Do not assume the current code matches an older chat.
3. Create a dated backup branch from the current `main` before risky or broad changes. Never overwrite an existing backup branch.
4. Keep experiments in a separate branch and preferably a separate route/folder. Do not replace the live site unless the user explicitly asks to publish/promote it.
5. Preserve all source photographs, archive folders, working routes, and previous experiments unless the user explicitly authorizes removal.
6. Do not rewrite Git history or remove archive material as a casual cleanup step. Git object deduplication does not mean duplicate paths or historical snapshots are disposable.
7. When an alternative is ready, provide a direct preview URL (for example, `https://tanibergen.online/after-hours/`) and explain whether it is live, merged, or only on a branch.
8. Test the experience at iPhone width and desktop width. Check image loading, layout shifts, navigation, opening/closing the viewer, and keyboard/touch interactions.
9. Do not claim a deployment or optimization succeeded until GitHub Actions or the published site confirms it.
10. Keep commit messages neutral and professional. Do not mention that changes were made because of the user's comments.

## 3. What matters most

- The photography must lead. UI should frame the work, not compete with it.
- The site should feel authored, intentional, visually memorable, and credible to a film director, photographer, editor, or creative producer.
- Avoid a ready-made portfolio theme, obvious magazine imitation, generic agency language, and decorative design that has no relationship to the photographs.
- The user is experimenting and may not provide a precise art direction. When invited to take the lead, make a coherent, brave design decision rather than asking for a long list of preferences.
- Preserve the photographs' original color. Do not apply global monochrome, tint, filters, or color grading to the source images unless explicitly requested.
- Preserve each photograph's natural aspect ratio. Avoid cropping important content just to make a uniform grid.
- Keep the layout visually composed. A considered mix of image scale and negative space is welcome; random clutter and overlapping images are not.
- Make the mobile experience first-class. Most visitors are expected to use iPhones, sometimes on a weak connection.
- Load small previews in galleries and request the original only when a photograph is opened in the large/fullscreen viewer.
- Avoid layout shifts while images load. Reserve space using intrinsic dimensions or a reliable aspect ratio.
- Keep interaction fast, quiet, and understandable. Do not add effects just to make the site feel interactive.

## 4. Explicit dislikes and things to avoid

- No obvious copy of another photographer's or studio's website. References are for understanding mood or structure, not for cloning.
- No literal paper-book simulation, page-turn animation, thick paper textures, or heavy shadows. The user liked the idea of contact sheets and book-like sequencing, but specifically rejected literal book effects.
- No gradients, HUD lines, glassmorphism, glowing panels, chromatic UI overlays, or decorative animation in the strict black/white direction requested on 16 November 2026.
- No semantic pseudo-mystery labels or fake lore such as `FALSE MEMORY / 4110`. The user later preferred neutral random numbers/codes over invented meaningful phrases.
- Do not use "Chroma Diary" as site branding or explanatory copy. The user asked to remove that wording after experimenting with it.
- Do not use generic filler content, invented exhibitions, news, awards, clients, projects, dates, credits, or claims.
- Do not use a color-analysis interface as a substitute for the photographs. The user previously reported that the color tool did not correctly distinguish red and black-and-white images. Do not revive automated color categorization without a clearly accurate implementation and a reason to use it.
- Avoid mobile navigation that requires awkward horizontal hunting or makes collections difficult to reach.
- Avoid loading the full archive at full resolution on first visit.
- Do not make the first screen a blog or an unnecessary intro page. The user's earlier main-site preference was to land directly on the photographs / All view.
- Avoid excessive motion, autoplay, automatic photo rotation, and scroll-triggered tricks unless the user explicitly asks for them. A previous auto-rotation idea was not wanted in the final behavior.
- Do not let play icons, overlays, badges, or controls obscure the photographs.
- Do not change the user's domain, Instagram identity, archive paths, or profile text without checking current source and context.

## 5. Chronology of design experiments and how to interpret them

The user has deliberately explored different directions. These are not all simultaneous requirements. The newest explicit instruction wins.

### 15 November 2026
- The user rejected an obvious magazine-site copy and wanted a distinct visual system.
- The user accepted the direction named **AFTER HOURS** for the main project, with **THE INDEX** as an alternative. AFTER HOURS was conceived as a dark, atmospheric, large-photo personal visual space. THE INDEX was a lighter, stricter archival structure.
- The user wanted both directions explored while preserving the live version.
- The user also explored a contact-sheet / book-like presentation, with image scale and sequencing. The visual idea was interesting, but later comments clarified that it must not become a literal paper book.

### 16 November 2026
- The user asked to restore the version before contact-sheet experiments and bring back the Chroma Diary / color-mosaic direction, then later changed direction again.
- The user asked to remove "Chroma Diary" wording, semantic labels, and fake phrases. Random numbers/codes were preferred to invented poetic lore.
- The user asked for the header to read exactly `tanibergen.online`.
- The user said mobile collection navigation was poor and asked for a strict black/white interface, with no gradients, HUD lines, glass/color effects, or decorative animation. The photographs themselves should retain their actual colors.
- A Repponen-inspired alternative was explored separately under `/repponen/`. It must remain an alternative, not silently replace the live main site.
- A Saul Leiter-inspired alternative was also created separately. Keep it separate and untouched unless the user explicitly asks to work on it. Do not treat it as the main site's permanent design instruction.

### 20 November 2026
- The live main site became **THE WHITE ROOM**, with a light paper-like palette, asymmetrical image layout, technical PLATE captions, and updated navigation.
- The user asked for mobile image optimization: lightweight WebP previews and loading full-resolution originals only when a photograph is opened.
- This optimization is now implemented in the main project with 640px WebP previews generated by GitHub Actions. Preserve that behavior in future redesigns.

### Current instruction
- The user now wants a genuinely different alternative site and has delegated creative direction. They want to be surprised and want the result to make a good director think positively about the work and the photographer.
- Build this as an independent alternative route. Do not replace the current live site.
- A strong, coherent concept is preferable to a superficial reskin of THE WHITE ROOM.

## 6. Current technical baseline and asset rules

- Main site is a static GitHub Pages project. No backend is required for the public portfolio.
- Main source files include `index.html`, `index-main.css`, `index-main.js`, and `index-main-works.js`.
- The archive manifest in `index-main-works.js` defines the working image list and exclusions. Reuse it where appropriate rather than inventing paths.
- Original WebP assets live in numbered folders `1/` through `7/`.
- Generated mobile previews live in `previews/1/` through `previews/7/`.
- The GitHub Actions workflow `.github/workflows/generate-mobile-previews.yml` regenerates previews when source archive images change. Preserve it.
- For an alternative route inside a subfolder, remember that image paths need to be relative to that subfolder (for example, `../previews/...` and `../1/...`).
- Gallery thumbnails should use previews. Full-resolution originals should only be assigned to the fullscreen/open-image viewer when requested by the visitor.
- Keep source images intact. Do not convert, overwrite, crop, or recompress the originals as part of generating previews.
- Avoid adding large dependencies or a build system to a static site unless clearly justified.

## 7. Content and identity

- Known identity: Aizat Tanibergen.
- Known description: photographer and videographer from Almaty, now based in Bangkok.
- Instagram handle in the current project source: `@isaac_4u`. Verify before changing.
- Do not invent a personal manifesto. If writing a statement, keep it grounded, short, and in the user's voice.
- The site can be in English when appropriate. The Saul Leiter alternative was specifically requested in English.
- Avoid overexplaining the artist or adding a long biography. Let the photographs do most of the work.

## 8. Existing routes and experiments - protect them

The repository contains or has contained separate design experiments, including:
- `/white-room/`
- `/repponen/`
- `/saul-leiter-alt/`
- `/alt/`
- `/studio/`
- the current root website

Do not delete, rename, or repurpose these routes as part of unrelated work. Do not modify the Saul Leiter alternative unless requested. Keep a new concept in its own folder and branch.

## 9. Practical review checklist

Before calling any redesign complete, verify:
- [ ] The design is genuinely distinct from the current live site.
- [ ] The photographs, not UI decoration, dominate the experience.
- [ ] No invented facts, credits, dates, awards, or project descriptions appear.
- [ ] Natural image proportions are preserved.
- [ ] Thumbnails use the generated preview files.
- [ ] Originals load only after the visitor opens a photograph.
- [ ] Images reserve layout space and do not cause scroll jumps.
- [ ] Mobile navigation is obvious and easy to use.
- [ ] No unwanted gradients, HUD graphics, fake mystery copy, or distracting animation.
- [ ] All archive images remain available and no source archive has been removed.
- [ ] Root `main` and all existing alternatives/backups remain untouched until explicit approval.
- [ ] A direct preview link and clear publication status are provided.


## 10. New explicit visual rules from 20 November 2026

These instructions apply to future work, especially the `/cut/` alternative, and take priority over older layout experiments when they conflict.

- The visible site identity and logo must remain exactly `tanibergen.online`. Do not invent a project title, studio name, or alternate brand for the site.
- The user dislikes filler interface copy. Use as few visible words, headings, category labels, captions, instructions, counters, and decorative metadata as possible. Do not add phrases just to make a page look designed.
- The user is open to a short Kazakh artistic title such as `естеліктер` (memories). When used as the graphic title, a small red full stop is a preferred accent.
- The `/cut/` direction should use a black background.
- Photographs must have no visible frames, gray backing blocks, borders, card surfaces, shadows, or forced crops. Keep natural proportions and let the image edges sit directly on the page background.
- The first archive frame is the user's self-portrait. Keep it as the first and largest opening image; never shuffle it behind other images.
- The user wants the visual quality of gallery previews to be high. The existing 640px / quality-54 previews are too degraded for this route. Use a separate high-resolution WebP preview tier for `/cut/`, while retaining lazy loading and loading the untouched original only when a visitor opens a photograph.
- Use Repponen as a reference for art direction, typography, composition, and editorial intelligence, not as a template to copy. Keep the site personal and image-led.
- Prefer deliberate typographic scale, asymmetrical image placement, negative space, and a small number of strong decisions over decorative effects or interface chrome.
- Streamline iconography should be restrained. Do not add icons merely to fill space; the photography and typography should remain dominant. If used, keep it to tiny functional details such as one external-link mark.

---
Last consolidated: 20 November 2026.


## 11. Archive layout preference confirmed on 21 November 2026

- The user specifically remembers and liked the archive/contact-sheet layout refined on 16 November 2026.
- The successful implementation used CSS multi-column flow, not a CSS grid with manually calculated row spans.
- Preferred behavior: three natural-flow columns on desktop, two columns on mobile, varied image heights from original aspect ratios, consistent narrow gutters, and cards that never split across columns.
- Keep the visual rhythm of a photographic contact sheet. Let images retain their actual proportions. Do not force uniform card ratios or crop.
- For the current black /cut/ direction, retain the multi-column behavior but remove all old paper surfaces, placeholders, borders, captions, shadows, and other framing. The images should sit directly on black.
- Avoid returning to CSS grid row-span masonry for this archive. It produced holes / unstable placement in the current /cut/ implementation.
- Keep the first image (1/1.webp, the user's self-portrait) as the opening frame. The remaining archive should continue naturally below it.

---
Last consolidated: 21 November 2026.


## 12. Latin-script Kazakh and subtle motion preference - 21 November 2026

- When Kazakh words appear in the visual identity or interface, use Kazakh Latin transliteration by default. The current /cut/ title is estelikter. rather than Cyrillic.
- The user explicitly requested gentle, refined animation for /cut/: subtle entrance on the opening title and photographs, a quiet reveal as archive images enter the viewport, a barely perceptible hover response, and a soft image-viewer opening.
- Motion must remain restrained and serve the photographs. No continuous movement, autoplay, parallax, scroll hijacking, dramatic zoom, or decorative effects.
- Respect prefers-reduced-motion; content must remain immediately visible and usable when reduced motion is enabled.
