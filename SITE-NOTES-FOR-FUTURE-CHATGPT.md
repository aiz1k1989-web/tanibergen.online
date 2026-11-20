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
- On 21 November 2026, the user explicitly approved promoting the black /cut/ photographic archive to the root domain as the primary website.
- The root now uses the /cut/ visual direction: black background, Latin-script Kazakh title estelikter., image-led opening, and natural-flow contact-sheet archive.
- Preserve the former THE WHITE ROOM implementation in Git history and the dated backup branch created before promotion. Its source files and all alternative routes remain in the repository.
- Future concepts should be built as separate alternatives unless the user explicitly approves another primary-site change.
- A strong, coherent concept is preferable to a superficial reskin of an existing direction.

## 6. Current technical baseline and asset rules

- Main site is a static GitHub Pages project. No backend is required for the public portfolio.
- Main source files include `index.html`, `index-main.css`, `index-main.js`, and `index-main-works.js`.
- The archive manifest in `index-main-works.js` defines the working image list and exclusions. Reuse it where appropriate rather than inventing paths.
- Original WebP assets live in `photos/1/` through `photos/7/`, with personal portraits in `photos/me/`.
- Generated mobile previews live in `previews/photos/`; high-quality archive previews live in `cut-previews/photos/`.
- The GitHub Actions workflow `.github/workflows/generate-mobile-previews.yml` regenerates previews when source archive images change. Preserve it.
- For an alternative route inside a subfolder, remember that image paths need to be relative to that subfolder (for example, `../previews/photos/...` and `../photos/...`).
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
- Keep the first image (`photos/1/1.webp`, the user's self-portrait) as the opening frame. The remaining archive should continue naturally below it.

---
Last consolidated: 21 November 2026.


## 12. Latin-script Kazakh and subtle motion preference - 21 November 2026

- When Kazakh words appear in the visual identity or interface, use Kazakh Latin transliteration by default. The current /cut/ title is estelikter. rather than Cyrillic.
- The user explicitly requested gentle, refined animation for /cut/: subtle entrance on the opening title and photographs, a quiet reveal as archive images enter the viewport, a barely perceptible hover response, and a soft image-viewer opening.
- Motion must remain restrained and serve the photographs. No continuous movement, autoplay, parallax, scroll hijacking, dramatic zoom, or decorative effects.
- Respect prefers-reduced-motion; content must remain immediately visible and usable when reduced motion is enabled.


## 13. Release and interaction quality rules - 21 November 2026

- The user explicitly approved promoting the black /cut/ photographic archive to the root domain. Preserve the former root website and all alternatives in Git history and dated backup branches; do not delete their source files or routes.
- Kazakh words in the visible identity use Latin script by default.
- Never leave a red focus outline or selection frame around a photograph after the fullscreen viewer closes. Test opening and closing with pointer, touch, Escape, and keyboard navigation. Pointer-close should not leave a persistent focus ring; keyboard focus must remain accessible and use a restrained non-red focus indicator.
- Fullscreen photo browsing must feel current and effortless, not like an old slideshow. Avoid prominent Prev/Next arrows, text-heavy Close buttons, counters, or control bars. Prefer immersive image-first viewing, discreet close affordance, large unobtrusive navigation zones, horizontal swipe/keyboard navigation, and vertical swipe-down to dismiss on touch devices.
- Photo changes inside the viewer need a gentle transition without replaying the entire viewer entrance on every image.
- Before any release, manually QA the viewer lifecycle: open image, next/previous repeatedly, swipe, close by each supported method, reopen, verify scroll restoration, and verify no focus outline remains. Check both desktop and iPhone-sized viewports. Do not claim device testing unless actually performed.
- Do not ship a visible control or interaction that has not been tested for its complete open/change/close lifecycle. A visually polished static screenshot is not sufficient QA.



## 14. MUTANT experiments - 21 November 2026

- The user requested a combined / improved version based on the Claude spatial-photo-field concept, with two independent alternatives in separate folders: `/mutant/` and `/mutant-type/`.
- The root website and the current primary `estelikter` implementation must remain untouched. Do not promote either experiment without a separate explicit request.
- Both alternatives should use the current `index-main-works.js` manifest and `previews/metadata.json`, not Claude's old hardcoded 98-entry array. Deduplicate paths while preserving the first self-portrait as the first item. Never silently drop selected archive photographs.
- Use high-quality `cut-previews/` for the field and load untouched originals only after opening a photograph. Preserve natural aspect ratios and do not crop.
- Keep the recognizable spatial / draggable archive idea from Claude, but improve the interaction: responsive sizing, drag and inertial movement, trackpad / wheel navigation, pinch zoom, keyboard movement, and an image-first fullscreen viewer.
- Fullscreen viewer should support left/right navigation zones, touch swipe, keyboard arrows, Escape, vertical swipe-down dismissal, and a discreet close affordance. Avoid a text-heavy Close button or visible slideshow controls.
- Viewer lifecycle is mandatory QA: open, navigate repeatedly, close by every supported method, reopen, verify focus cleanup, scroll / camera stability, and no persistent selection outline or red focus ring. Pointer focus must not leave a visible outline; keyboard focus remains accessible with a restrained non-red indicator.
- Keep mobile browser zoom accessible. Never use `user-scalable=no`.
- The `/mutant/` direction uses quiet, large background typography reading `estelikter, archive`, with subtle responsive parallax behind the photographs.
- The `/mutant-type/` direction gives typography a stronger compositional role: oversized adaptive words with slow, restrained movement. Typography must remain behind the images and must not obscure them.
- Both directions respect `prefers-reduced-motion`, safe areas, and mobile viewport sizing. Avoid excessive motion, overlays, interface clutter, and decorative controls.
- Preserve the existing root site, `/claude/`, `/cut/`, all other routes, archive assets, and backups.


## 15. MUTANT 04 - Streamline direction - 21 November 2026

- New isolated route: `/mutant-04/`, created on `experiment/mutant-04-streamline`.
- Uses the current archive manifest and preview metadata, deduplicates image paths, and preserves the first self-portrait as the first / largest tile.
- Retains the draggable spatial archive but gives it a distinct typographic treatment: large, quiet `estelikter, archive` background lettering with restrained camera-linked movement.
- Viewer uses adapted Streamline Core Line - Free controls (Move Left, Move Right, Delete 1). The original icons are from the free Core Line set and are adapted for this interface; attribution and CC BY 4.0 license are documented in `mutant-04/README.md`.
- Keep controls subtle. Navigation supports pointer, keyboard, swipe, and large unobtrusive targets. Close via icon, Escape, backdrop click, or swipe down.
- Continue to QA the full viewer lifecycle and focus cleanup. Do not claim actual iPhone testing unless performed.
- Do not alter root, `/claude/`, `/mutant/`, `/mutant-type/`, `/cut/`, or other experiments unless explicitly asked.



## 15. Fourth MUTANT direction and conversation handoff - 21 November 2026

- A fourth independent route is being developed at `/mutant-focus/`. It must remain separate from the primary `estelikter` site and from `/mutant/`, `/mutant-type/`, and `/claude/`.
- Direction: a spatial photographic field with oversized adaptive background typography `estelikter` / `archive`, responsive parallax tied to camera movement, and a very restrained photographic focus cue.
- The focus cue uses the Streamline **Focus Center** icon from **Micro Line - Free**, with attribution recorded in `mutant-focus/ATTRIBUTION.md`. Do not add more icons unless they materially improve an interaction.
- The Streamline icon is used only as a small hover/focus cue on a photograph. It must never become a decorative overlay or compete with the image.
- Keep the archive image-led, preserve natural ratios, use `cut-previews/` for thumbnails, and load originals only in the fullscreen viewer.
- The viewer must keep keyboard focus inside the modal, support Escape and arrow keys, touch navigation and swipe-down dismissal, and must not leave a red or persistent pointer focus outline after closing.
- Keep mobile browser zoom enabled. Respect safe areas and `prefers-reduced-motion`. Avoid external font downloads and unnecessary dependencies.
- The user requested that every future project conversation end with a plain-text list of the available site versions and their backup branches. Include the live primary, each alternative route, and the relevant dated backup branches. Do not use a table or cards for this handoff list.
- Current known routes: root `/` (primary `estelikter`), `/claude/`, `/cut/`, `/mutant/`, `/mutant-type/`, and `/mutant-focus/`. Verify actual main-branch presence and publication before claiming a route is live.
- Known backup branches include `backup/2026-11-20-before-cut-black-rebuild`, `backup/2026-11-21-before-cut-archive-fix`, `backup/2026-11-21-before-cut-motion`, `backup/2026-11-21-before-mutant-llm`, and `backup/2026-11-21-before-mutant-focus`. Verify before presenting as available.

---
Last consolidated: 21 November 2026.


## 16. MUTANT 05 - Editorial sequence - 21 November 2026

- New isolated route: `/mutant-05/`, developed on `experiment/mutant-05-editorial-sequence`. Keep the root website and every prior route untouched.
- Direction: a long-form editorial photo sequence, not another draggable spatial field. The opening self-portrait is the first and largest image; subsequent works are grouped into deliberate one-, two-, and three-image spreads with asymmetrical widths and generous black negative space.
- Use the current `index-main-works.js` archive manifest and `previews/metadata.json`; deduplicate file paths while preserving the first self-portrait. Every unique selected work must remain present exactly once.
- Use `cut-previews/` for gallery images and load the original WebP only when a visitor opens a photograph. Preserve natural aspect ratios, reserve layout space from metadata, and avoid cropping or borders.
- The page is mobile-first. Desktop spreads can be asymmetrical; mobile becomes a clear single-column sequence with natural image proportions and no horizontal navigation.
- Typography stays minimal: exact site identity `tanibergen.online`, Kazakh Latin title `estelikter.`, and existing Instagram handle. No invented credits, captions, dates, or project names.
- Streamline controls use one consistent **Core Line - Free** set for previous, next, and close actions. Attribution and CC BY 4.0 license must be included in `mutant-05/README.md`.
- Viewer: immersive image-first display, quiet close icon, unobtrusive navigation zones, keyboard arrows, Escape, horizontal touch swipe, vertical swipe-down dismissal, focus trap, safe-area padding, and restored scroll position. No persistent pointer focus ring after close; keyboard focus remains visible with a restrained non-red outline.
- Subtle image entrance transitions are allowed, but no autoplay, scroll hijacking, continuous motion, parallax, or dramatic zoom. Respect `prefers-reduced-motion`.
- Keep static HTML/CSS/JS only. No external libraries, web fonts, tracking scripts, or backend. Verify syntax, archive count, metadata coverage, image paths, and viewer lifecycle. Do not claim real-device testing unless performed.
- The Website Auditor review of `tanibergen.online` should inform technical fixes where relevant, but do not add SEO copy or promotional UI that competes with the photography.

---
Last consolidated: 21 November 2026.



## 17. Retired routes - 21 November 2026

- At the user's explicit request, the unsuccessful experimental routes `/mutant/`, `/mutant-type/`, and `/after-hours/` were removed from the published project source on 21 November 2026.
- Their route files were removed from the cleanup branch and will be deleted from `main` only after the cleanup pull request is merged.
- A dated backup branch preserves the complete pre-cleanup state: `backup/2026-11-21-before-remove-failed-versions`.
- This removal applies only to those three route folders. Preserve `/mutant-04/`, `/mutant-05/`, `/mutant-focus/`, `/claude/`, `/cut/`, the primary root site, all image archives, and all other alternatives.
- Historical notes above describe the retired experiments as they existed at the time. Do not recreate or promote them unless the user explicitly asks.


## 18. Permanent base routes - 21 November 2026

The user explicitly confirmed that the following six alternative routes are the permanent foundation of the project. They must always remain in the repository and must never be deleted, renamed, repurposed, or treated as failed experiments during cleanup:

- `/mutant-focus/`
- `/mutant-05/`
- `/mutant-04/`
- `/orbit/`
- `/alt/`
- `/studio/`

This is a standing preservation rule. Only the user can explicitly authorize removal or replacement of one of these six routes. Before any cleanup, compare the proposed deletions against this list and stop if any protected route is included. Preserve their source files and direct public URLs.

The user separately asked to rebuild `/repponen/` using the design principles of https://repponen.com/ as inspiration, integrated with the user's own photographic archive. This route remains a protected independent alternative. Do not overwrite the root site or the six permanent base routes while working on it.



## 19. Repponen-inspired photographic archive - 21 November 2026

- The user asked to apply the concept of https://repponen.com/ to their own work, not to copy the reference website. The route `/repponen/` is an independent alternative; never replace the root website as part of this work.
- The direction uses large confident typography, asymmetrical editorial composition, deliberate negative space, a restrained warm paper palette, and a long photographic archive. The photographs remain the primary content.
- The route now reads the current `index-main-works.js` manifest rather than the old hardcoded Repponen list. The generated manifest currently contains 98 unique archive image paths and keeps `photos/1/1.webp` (the user's self-portrait) first and largest.
- Gallery thumbnails use `cut-previews/`; untouched originals load only after a visitor opens an image. Dimensions come from `previews/metadata.json`. All 98 unique paths have metadata and a matching high-resolution preview at the time of implementation.
- The fullscreen viewer has image-only navigation, touch swipe, keyboard arrows, Escape, focus restoration, scroll restoration, and reduced-motion support. Do not reintroduce a prominent text Close button, red focus ring, or visible slideshow counter.
- Streamline icons are from Core Line - Free: Move Left, Move Right, Delete 1. Keep the CC BY 4.0 attribution in `repponen/README.md`.
- Canva generation was started for an editable visual prototype using three actual photographs from the user's archive. Treat any completed Canva result as an art-direction reference only; the GitHub Pages implementation remains the website source of truth.
- Validation completed: JavaScript parses; all six permanent base routes exist on the experiment branch; 98 unique archive paths have metadata and matching `cut-previews/` files. Do not claim real iPhone or browser-device testing unless it is actually performed.


## 20. Central photo library - 21 November 2026

- All original photography is organized under `photos/`. Numbered archive series live at `photos/1/` through `photos/7/`; new series continue as `photos/8/`, `photos/9/`, and so on. Personal About portraits live in `photos/me/`.
- Generated lightweight previews live under `previews/photos/`; high-quality archive previews live under `cut-previews/photos/`. The metadata manifest uses original paths beginning with `photos/`.
- All public archive routes must read image paths from the shared `index-main-works.js` manifest where possible. Do not reintroduce root-level numbered photo folders or hardcoded series paths.
- The Repponen About section shows one randomly selected portrait from the 19 images in `photos/me/` each time the page loads. The full set must remain available; do not expose all 19 as a gallery unless asked.
- The preview-generation workflow automatically discovers every numeric folder under `photos/` (including future `8`, `9`, and later series), regenerates the shared manifest and both preview tiers, and preserves all originals. New archive series do not require manual code edits; add WebP files to the next numbered folder.
