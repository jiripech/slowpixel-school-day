/* slowpixel-module {
  "every_min": 15,
  "hosts": ["api.open-meteo.com"],
  "methods": ["GET"],
  "config": [
    {"name": "home_place", "label": "Home location", "type": "text", "required": true, "help": "e.g. Hradec Králové"},
    {"name": "school_place", "label": "School location", "type": "text", "required": true, "help": "e.g. Nový Bydžov"},
    {"name": "calendar_id", "label": "School calendar ID", "type": "text", "required": true, "help": "Google Calendar ID of the timetable"},
    {"name": "max_classes", "label": "Max classes to show", "type": "text", "required": false, "help": "Default 2"}
  ],
  "view": [
    {"type": "stats", "items": [
      {"value": "{self.home_icon} {self.home_temp}°", "label": "Domů"},
      {"value": "{self.school_icon} {self.school_temp}°", "label": "Škola"}
    ]},
    {"type": "text", "size": "s", "text": "{self.home_text} · {self.home_low}–{self.home_high}°  |  {self.school_text} · {self.school_low}–{self.school_high}°"},
    {"type": "divider"},
    {"type": "heading", "text": "Další hodina", "size": "m"},
    {"type": "text", "size": "m", "text": "{self.next_class}"}
  ]
} */

export default async function run({ params, secrets, state, lang, now, sp }) {
  // TODO: Phase 1 implementation
  // 1. Fetch weather for home_place and school_place (Open-Meteo)
  // 2. Fetch next classes from the given calendar_id
  // 3. Return values

  return {
    values: {
      home_icon: "—",
      home_temp: "—",
      home_text: "—",
      home_high: "—",
      home_low: "—",
      home_rain: "—",
      school_icon: "—",
      school_temp: "—",
      school_text: "—",
      school_high: "—",
      school_low: "—",
      school_rain: "—",
      next_class: "Připravujeme…",
      status: "skeleton"
    },
    state: {}
  };
}
