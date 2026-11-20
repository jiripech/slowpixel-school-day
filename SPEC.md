# SlowPixel Module: school-day

**Goal**  
Show everything a student needs at a glance before leaving for school:

- Local weather (home)
- Weather at the school location
- Next class(es) from the school timetable calendar

Later phases may add leave-home time and simple public transport info.

---

## Phase 1 (current target)

### Features
- Dual weather (home + school)
- Next 1–3 upcoming classes from a Google Calendar
- Clean, readable layout suitable for 800×480 e-ink

### Configuration (dashboard)

| Name           | Type   | Required | Description                          | Example                  |
|----------------|--------|----------|--------------------------------------|--------------------------|
| `home_place`   | text   | yes      | Home location for weather            | `Hradec Králové`         |
| `school_place` | text   | yes      | School location for weather          | `Nový Bydžov`            |
| `calendar_id`  | text   | yes      | Google Calendar ID of the timetable  | `c_92c5...@group.calendar.google.com` |
| `max_classes`  | number | no       | How many upcoming classes to show    | `2` (default)            |

### Output fields

**Weather**
- `home_icon`, `home_temp`, `home_text`, `home_high`, `home_low`, `home_rain`
- `school_icon`, `school_temp`, `school_text`, `school_high`, `school_low`, `school_rain`

**Classes**
- `next_class` – short string for the soonest class
- `next_classes` – list of rows (for templated list element)
- `status` – short status line

### Suggested view

```
[ Home ]          [ School ]
☂ 8° showers      ☁ 7° cloudy

Další hodina
Matematika · 8:00–8:45 · uč. 12

(optional second class)
```

---

## Phase 2 (future)

- Single-stop departure board (next buses from one chosen stop)
- User-defined preferred journey template (e.g. “normally 101 → 151”)
- Simple “leave home by” time based on walk + preferred connection

Full automatic multi-leg IREDO journey planning is currently too complex for a lightweight module (no public free journey-planning API, GTFS too heavy).

---

## Technical notes

- Module type: JavaScript (requires JS modules enabled on the device)
- Weather source: Open-Meteo (or SlowPixel built-in weather recipe called twice)
- Calendar: must already be connected / accessible to the SlowPixel account
- Language: Czech primary, English possible later

---

## Repository structure (planned)

```
SPEC.md                 ← this file
README.md               ← installation & usage
module.js               ← the actual SlowPixel module code
views/                  ← example layout snippets
```
