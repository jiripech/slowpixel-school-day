# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-11-21

### Noteworthy additions

- **Full Phase 1 implementation** in `module.js`:
  - Dual weather fetching for home and school locations via Open-Meteo API
  - Geocoding of place names (e.g., "Hradec Králové") to latitude/longitude using Open-Meteo Geocoding API
  - Current weather + daily forecast (high/low temperatures, precipitation probability)
  - WMO weather code mapping to Czech text descriptions and emoji icons (28 codes covered)
  - Calendar integration using `sp.calendar.getEvents()` to fetch upcoming classes from Google Calendar
  - Class event formatting: `"Předmět · HH:MM–HH:MM · místnost"` (handles all-day events)
  - All output fields per SPEC: `home_*`, `school_*`, `next_class`, `next_classes`, `status`
  - Graceful error handling with descriptive `status` field (`"ok"`, `"počasí: ..."`, `"kalendář: ..."`, `"config_error"`)
  - Configuration validation with helpful error messages when required fields are missing

- **Module manifest** (embedded in `module.js`):
  - `every_min: 15` — refresh interval
  - Declared hosts: `api.open-meteo.com`, `www.googleapis.com`
  - Config schema: `home_place`, `school_place`, `calendar_id` (required), `max_classes` (optional, default 2)
  - View template matching SPEC: stats row, detail line, divider, heading, next class

### Changed

- `module.js`: Replaced skeleton implementation (returning `"—"` placeholders) with complete Phase 1 logic

### Fixed (post code review, same day)

- Manifest: added missing host `geocoding-api.open-meteo.com` to `hosts` (geocoding fetch was undeclared); `max_classes` type corrected to `number`
- WMO Czech text typos: `převážně jasno`, `mlha s námrazou`, `mrznoucí mrholení/déšť`, `slabé sněžení`/`sněžení`/`silné sněžení`
- Per-location weather error handling: a failed geocode/weather for one place no longer blanks both panels
- Calendar events normalized to handle both array and `{ items: [...] }` return shapes (`extractEvents`)
- `now` coerced safely to a `Date` (works for Date, ISO string, epoch number, or invalid values)
- `rain` unit fixed to always be precipitation probability (%), removed mixed mm fallback
- Invalid calendar event dates guarded (no more `NaN:NaN` in class times)
- Removed dead code (`now` param in `formatClassEvent`, unused `label` in `geocodePlace`); added trailing newline
- Added `AGENTS.md` and `.agents/` topic files for future agents

### Configuration (Dashboard)

| Field | Type | Required | Description |
| ------- | ------ | ---------- | ------------- |
| `home_place` | text | yes | Home location for weather (e.g., `Hradec Králové`) |
| `school_place` | text | yes | School location for weather (e.g., `Nový Bydžov`) |
| `calendar_id` | text | yes | Google Calendar ID of the timetable |
| `max_classes` | number | no | Max upcoming classes to show (default: `2`) |

### Output Fields

**Weather (per location):**

- `icon` — emoji icon (☀️, 🌧️, ⛈️, etc.)
- `temp` — current temperature (°C, rounded)
- `text` — Czech description (jasno, déšť, bouřka, …)
- `high` — daily max temperature (°C)
- `low` — daily min temperature (°C)
- `rain` — precipitation probability (%)

**Classes:**

- `next_class` — string for the soonest class
- `next_classes` — array of formatted class strings (for templated list)
- `status` — `"ok"` or error description

---

## [0.1.0] - 2026-11-21 (Initial scaffold)

### Added

- `SPEC.md` — Phase 1 & 2 specification
- `README.md` — Installation & usage documentation
- `module.js` — Skeleton module with placeholder return values
