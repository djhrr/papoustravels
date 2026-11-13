# Papou's Travels

A static travel blog built with [Eleventy (11ty)](https://www.11ty.dev/) and deployed to [papoustravels.com](https://papoustravels.com) via GitHub Pages.

---

## Work Completed

### Infrastructure & Deployment
- Converted site to Eleventy (11ty) with Nunjucks templates
- Added `package.json`, `.eleventy.js`, `src/` layouts and pages
- Set up GitHub Actions workflow (`.github/workflows/deploy.yml`) to auto-build and deploy `_site/` to GitHub Pages on every push to `main`
- Removed `_site/` from git tracking; it is now built and deployed exclusively by GitHub Actions
- Added `.nojekyll` to prevent GitHub Pages from running Jekyll on the output
- SSH key configured for `djhrr` on deployment machine

### Homepage (`src/index.njk`)
- Displays the 2 latest blog posts dynamically (first image, title, excerpt)
- "Latest from YouTube" section (always shown) pulling videos at build time (`src/_data/youtube.js`). It tries the channel RSS feed first; if YouTube returns 404 for the feed it falls back to reading the channel Videos page, and if that fails too it shows a "coming soon" line with a channel link
- Sidebar calendar events from a private Google Calendar iCal feed, filtered to the next 7 days (`src/_data/calendar.js`)
- Random gallery image widget picking from `assets/blog-images/` on each page load (`src/_data/galleryImages.js`)
- Mission bar tagline: *"A recorded trail of my life for those I love — down the roads that shaped who I became."*

### Navigation
- Gallery link opens Google Photos album in a new tab
- Nav bar: Home, Blog, Gallery. Trips and Contact were removed (the `comingSoon()` toast code remains in `base.njk`)

### Blog (`src/blog/index.njk`)
- **Card grid layout** — 2 columns on desktop, 1 on mobile; each card shows thumbnail, date, title, excerpt
- Thumbnail fills a 16:9 aspect ratio, zooms subtly on hover; card lifts on hover
- Defaults to **newest first** (sorted by date + time)
- Single toggle button switches between Newest first / Oldest first
- A–Z alphabetical sort also available
- All links open in a new tab (`target="_blank"`)

### Blog Posts
- Individual post template (`src/_layouts/post.njk`) shows date and optional time
- `time:` frontmatter field (format: `"HH:MM"` 24hr, must be quoted) enables ordering of multiple posts on the same date
- All 454 blog images downloaded locally from Blogger CDN — no external image dependencies
- All links in posts open in new tab (HTML anchors and markdown links via `markdown-it-link-attributes`)

### Admin (`/admin/`)
- Passphrase-protected browser-based admin panel — no server required
- Uses GitHub Contents API directly from the browser
- **Dashboard** with tiles: New Post, Edit Posts, Analytics
- **New Post**: title, date, time, author, dynamic paragraph/image content blocks, publish commits directly to repo
- **Edit Posts**: lists all posts fetched from GitHub, click any to edit title/date/time/author/body, save commits back
- **Delete** post with confirmation
- **Site Theme** tile: pick a color scheme or holiday theme (see "Site Themes" below)
- **Analytics tile** links directly to Google Analytics dashboard
- No backend or hosting cost — runs entirely as a static page on GitHub Pages

### Admin Login & Security
- No hardcoded username/password. The first time, you paste a GitHub token and choose a passphrase (16+ characters; 4–5 random words work well)
- The token is encrypted in the browser (AES-GCM, key derived from the passphrase with PBKDF2, 600,000 iterations) and saved to `assets/admin-vault.json` in the repo, so every device only needs the passphrase. The browser also keeps a local copy
- The file is public, so the passphrase is the only protection: keep it long and unguessable
- Wrong passphrases are slowed down after a few tries; the session logs out after 30 minutes idle
- "Forgot passphrase or changing token? Start over" lets you enter a new token and passphrase, replacing the vault for all devices. You cannot be permanently locked out as long as you can create a GitHub token
- Use a fine-grained token limited to the `papoustravels` repo with **Contents: Read and write** (Metadata: Read-only is added automatically)
- Old devices that only had a local copy upload the vault automatically on their next unlock (if their passphrase is 16+ characters)
- `admin/server.js` (Express, for Railway) is a separate legacy admin and still defaults to `admin` / `password` unless `ADMIN_USER`, `ADMIN_PASS` and `SESSION_SECRET` are set. Not used by the hosted admin; consider deleting it

### Site Themes
- Theme definitions live in `assets/js/themes.js`: 9 color schemes (Classic, Ocean Blue, Sunset Orange, Royal Purple, Cherry Red, Slate Gray, Teal, Rose Pink, Earth Brown) and 18 US holiday themes
- **Classic is the original look, is the default, and is built in so it cannot be deleted.** Any unknown or missing setting falls back to Classic
- The chosen theme is stored in `src/_data/theme.json` (`{"theme": "classic", "base": "classic"}`). Saving a theme from the admin commits this file and the site rebuilds in 1–2 minutes
- **Automatic** mode shows a holiday theme around each US holiday (date logic runs in the visitor's browser, including floating dates like Thanksgiving and Easter) and the chosen `base` color scheme the rest of the year. Windows: Christmas Dec 1–26, Halloween 14 days before, Thanksgiving 7 days before plus the day after, Easter 7 days before plus the day after, Valentine's Day and Independence Day 7 days before, most others a few days before through the day itself
- Themes set the CSS variables `--banner`, `--nav`, `--muted`, `--teal`, `--bg`, `--mission-text`. Page text, cards and light/dark are unchanged
- Tab icon (favicon) is `assets/favicon.png`, made from the site logo
### Analytics
- Google Analytics 4 embedded on all pages (Measurement ID: `G-9ENW933NCQ`)
- Tracks: pages visited, session duration, countries, cities, browsers, devices, traffic sources
- Access via the Analytics tile in the admin dashboard

### Images
- All 454 blog images migrated from Blogger CDN to `assets/blog-images/` — fully self-hosted
- Large GIFs compressed: `Fontana_Dam.gif` 58MB→23MB, `ride_path.gif` 31MB→23MB
- GIFs resized to max 800px wide with 128-color palette

### Bug Fixes
- Fixed blog collection sort — Eleventy parses YAML `date:` as a JS `Date` object; sort now uses `new Date()` correctly
- Fixed YAML sexagesimal issue — unquoted `time: 09:00` is parsed as `540` by YAML; all time values stored as quoted strings
- Added `timeString` Eleventy filter to safely normalize time values (string or number) to `HH:MM`
- Fixed undefined CSS variable `--navy` on sort buttons
- Fixed sort button default state — no button highlighted on page load
- Fixed multiline HTML `<a>` tags missing `target="_blank"` (single-line regex didn't catch them)
- Fixed Blogger image download bug — URL parser had `imageID` and `size` fields swapped, causing all images to map to the same file; re-downloaded all 454 images with correct parsing

---

## How to Run Locally

```bash
npm install
npm start        # Eleventy dev server at http://localhost:8080
npm run build    # Build static site into _site/
```

### Environment Variables

| Variable | Purpose |
|---|---|
| `GCAL_ICAL_URL` | Private Google Calendar iCal URL for sidebar events |

Set as a GitHub Actions secret (`GCAL_ICAL_URL`) for production builds.

---

## Deployment

Push to `main` — GitHub Actions builds the site and deploys automatically. No manual steps needed.

The workflow also runs on a schedule every day at 08:26 UTC (3:26 AM Eastern in winter, 4:26 AM during daylight saving time) so YouTube videos, calendar events and holiday themes stay fresh without a push. It can also be started by hand with "Run workflow" on the repo's Actions tab.

---

## Blog Post Frontmatter

```yaml
---
title: "Post Title"
date: 2026-07-01
time: "09:00"       # optional — orders same-day posts; must be quoted HH:MM
author: mrogers
layout: post
---
```

---

## Project Structure

```
src/
  _layouts/         # base.njk, post.njk
  _data/            # youtube.js, calendar.js, galleryImages.js, theme.json
  blog/             # *.md blog posts
  admin/            # index.njk — hosted admin panel
  index.njk         # homepage
assets/
  css/styles.css
  js/themes.js      # theme definitions + holiday logic (shared by site and admin)
  admin-vault.json  # encrypted GitHub token for the admin (created by the admin page)
  favicon.png
  blog-images/      # 454 self-hosted images
.eleventy.js        # Eleventy config, filters, collections
.github/workflows/  # deploy.yml — build + deploy pipeline
```

