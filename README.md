# ✦ AstroSpark — Ignite Your Universe

AstroSpark is a space-themed browser start page that pairs a calm, cinematic dashboard with useful daily tools and NASA's Astronomy Picture of the Day. It is built with plain HTML, CSS, and JavaScript.

## Screenshots

_Screenshot placeholder — add an image of the dashboard here._

## Features

- Live clock, local date, and an optional personalized greeting.
- Web search with Google, Bing, or DuckDuckGo.
- User-configurable appearance, animation, clock, and search preferences.
- NASA APOD discovery with date navigation, date picker, media, credit, expandable explanation, and cached results. Video entries use the video source in NASA's `basic_html` page.
- A continuously crossfading photographic background made from five NASA nebula and galaxy images stored locally in the project. Rotation can be paused in Settings and respects reduced-motion preferences.
- On-demand NASA data explorer for NeoWs asteroid approaches, DONKI space-weather notices, EONET natural events, EPIC Earth imagery, and NASA Image and Video Library search.
- Task list, auto-saving quick notes, and a timestamp-based focus/break timer.
- Expandable solar system guide.
- Responsive layout, keyboard-operable settings drawer, and reduced-motion support.
- Ambient audio controls are prepared in settings; no audio is bundled or claimed to be integrated.

## Technology

| Technology | Use |
| --- | --- |
| HTML5 | Semantic page structure and accessible controls |
| CSS3 | Responsive layout, cosmic visuals, and animation |
| Vanilla JavaScript | Dashboard interactions, persistence, and NASA requests |
| Browser localStorage | Preferences, tasks, notes, timer state, and APOD cache |

No framework or build step is required.

## Project structure

```text
AstroSpark/
├── index.html       # Dashboard and settings markup
├── styles.css       # Visual system and responsive layout
├── script.js        # Settings, productivity tools, APOD, and NASA data explorer
├── favicon.png      # Existing AstroSpark icon
├── assets/
│   └── backgrounds/ # NASA nebula and galaxy photographs used by the rotating backdrop
├── .env.example     # API key configuration notes for static deployments
├── .gitignore       # Local secrets and environment files
└── README.md
```

## Run locally

1. Clone the repository or download the project.
2. Open `index.html` in a modern browser. For consistent browser API behavior, you can also serve the folder with any static HTTP server.
3. Open the gear menu to personalize the dashboard. Your preferences and productivity data remain in this browser's local storage.

## NASA APOD setup

AstroSpark requests the supplied NASA Science endpoint:

```text
https://science.nasa.gov/wp-json/wp/v2/apod-basic/?date=YYYY-MM-DD&api_key=DEMO_KEY
```

The default `DEMO_KEY` requires no setup and is subject to NASA's shared demo limits. For a personal key, open **Settings → NASA APIs** and enter it there. The key is stored in local storage on that browser and sent with browser requests; do not enter a secret or production key on a public deployment. A static frontend cannot protect API keys from its users. To keep a key private, add a serverless/backend proxy and have the browser call that proxy. `.env.example` documents this limitation; environment files are not read directly by this no-build static site. NASA's demo key is shared across users, so the additional feeds load only when requested.

APOD supports today's image or video, previous dates, date validation, retry states, and a small local cache. Returned batches are matched against the selected date, preventing the latest item from being shown for every date. During testing, NASA's new endpoint returned its latest 25 entries even when a different `date` was supplied; AstroSpark therefore selects the requested date from that batch and tries NASA's legacy single-date endpoint for dates outside it. NASA currently says the legacy service is scheduled to retire on December 1, 2026. If NASA returns no valid entry for a selected date, the UI shows a retry/error state instead of displaying unrelated media. It reads direct image/video sources from NASA's response and falls back to the APOD media markup when needed, including supported embedded video players. APOD date navigation is limited to June 16, 1995 through today.

The explorer's **Asteroids** view uses NeoWs close-approach feed data; **Space weather** uses DONKI notifications; **Earth events** uses the current EONET v3 events feed; **Earth view** uses EPIC natural-color images; and **NASA media** searches the NASA Image and Video Library. Those feeds are fetched on demand. EONET and NASA media search do not need an API key. The former Mars Rover Photos API is archived and is not used.

## Feature roadmap

- [x] Cosmic dashboard, clock, greeting, and search
- [x] Persistent preferences and settings drawer
- [x] NASA APOD with dates, cache, video, and error handling
- [x] On-demand NeoWs, DONKI, EONET, EPIC, and NASA media integrations
- [x] Tasks, notes, and persistent accurate focus/break timer
- [x] Responsive layout, keyboard controls, and reduced motion
- [ ] Add original AstroSpark ambient recordings under `assets/audio/`
- [ ] Consider a serverless NASA proxy for public deployments
- [ ] Optional Mars Rover photography exploration

## Credits

- Astronomy Picture of the Day data and media: NASA Science APOD service. Image and media rights/credits vary by entry; see the linked APOD page.
- Background photographs are bundled locally from the official [NASA Image and Video Library](https://images.nasa.gov/). Their source records and listed credits:
  - [Cosmic Cliffs in the Carina Nebula](https://images.nasa.gov/details/carina_nebula) — NASA, ESA, CSA, and STScI (`cosmic-cliffs-carina.png`).
  - [Dumbbell Nebula](https://images.nasa.gov/details/PIA14417) — NASA/JPL-Caltech/Harvard-Smithsonian CfA (`dumbbell-nebula.jpg`).
  - [Soul Nebula](https://images.nasa.gov/details/PIA13014) — NASA/JPL-Caltech/UCLA (`soul-nebula.jpg`).
  - [Frankenstein Galaxy](https://images.nasa.gov/details/PIA20695) — NASA/JPL-Caltech/SDSS/NRAO (`frankenstein-galaxy.jpg`).
  - [Triple Scoop from Galaxy Hunter](https://images.nasa.gov/details/PIA08646) — NASA/Caltech-JPL (`galaxy-triptych.jpg`).
- Fonts: Manrope and DM Mono, loaded from Google Fonts when network access is available; system fonts are used as fallback.
- The existing AstroSpark favicon is retained.

## Author

**Ishaan** · [@ishaan7india](https://github.com/ishaan7india)

---

*AstroSpark — Ignite Your Universe.*
