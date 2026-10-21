# Video Understanding and Beyond

**Reasoning, Streaming, and Spatial Intelligence** — ACM Multimedia 2026 tutorial website.

**Website:** https://nolimit112172.github.io/video-intelligence-acmmm2026/

The tutorial is scheduled for **November 10, 2026, 16:00–18:00 BRT (UTC−3)** in Rio de Janeiro, Brazil. The calendar file stores the equivalent **19:00–21:00 UTC**. The program lists presentation order without individual segment times.

## Run and publish

This is a static HTML, CSS, and JavaScript site. **No build step, package installation, or backend is required.** Open `index.html` in a browser to preview it, or serve this directory with a static web server.

GitHub Pages publishes the root of the `main` branch. Keep `index.html`, `styles.css`, `script.js`, and `assets/` together. The `.nojekyll` file lets Pages serve the files directly. Changes pushed to `main` update the website automatically.

## Edit the website

- `index.html`: tutorial text, organizers and presenters, program, materials, reading list, and contact links.
- `styles.css`: colors, typography, desktop and mobile layouts, portrait cropping, and horizontal wave animation.
- `script.js`: navigation, wave hover speed, agenda controls, and reading-list search and filters. Decorative motion respects the system's reduced-motion preference.
- `assets/`: presenter portraits, favicon, and `tutorial.ics`. Update the calendar if the event time changes.
- `asset-sources.json`: public sources for portraits, affiliations, and biographical information.
- `reading-list.json`: bibliographic source data. The page renders its own list in `index.html`; keep both files consistent when changing papers.

## Content still to confirm

- Weijian Ma's portrait, personal homepage, and fuller biography; the page currently uses initials.
- Final topic allocation and presentation assignments, including the closing segment.
- The final title in the official conference program and the meeting room.
- Presentation slides and any recording links when available.

## Sources

Tutorial content follows the supplied tutorial document and organizer instructions. Visual structure was informed by the [ACM MM 2024 MLLM tutorial website](https://mllm2024.github.io/ACM-MM2024/). The website code and conceptual illustration were created for this tutorial. Photograph provenance and selected paper references are recorded in the two JSON files.
