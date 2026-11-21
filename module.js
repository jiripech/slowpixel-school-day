/* slowpixel-module {
  "every_min": 15,
  "hosts": ["api.open-meteo.com", "geocoding-api.open-meteo.com", "www.googleapis.com"],
  "methods": ["GET"],
  "config": [
    {"name": "home_place", "label": "Home location", "type": "text", "required": true, "help": "e.g. Hradec Králové"},
    {"name": "school_place", "label": "School location", "type": "text", "required": true, "help": "e.g. Nový Bydžov"},
    {"name": "calendar_id", "label": "School calendar ID", "type": "text", "required": true, "help": "Google Calendar ID of the timetable"},
    {"name": "max_classes", "label": "Max classes to show", "type": "number", "required": false, "help": "Default 2"}
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

// WMO weather code to icon/text mapping (Czech)
const WMO_CODES = {
  0: { icon: "☀️", text: "jasno" },
  1: { icon: "🌤️", text: "převážně jasno" },
  2: { icon: "⛅", text: "polojasno" },
  3: { icon: "☁️", text: "zataženo" },
  45: { icon: "🌫️", text: "mlha" },
  48: { icon: "🌫️", text: "mlha s námrazou" },
  51: { icon: "🌦️", text: "slabé mrholení" },
  53: { icon: "🌦️", text: "mrholení" },
  55: { icon: "🌧️", text: "silné mrholení" },
  56: { icon: "🌧️", text: "mrznoucí mrholení" },
  57: { icon: "🌧️", text: "silné mrznoucí mrholení" },
  61: { icon: "🌧️", text: "slabý déšť" },
  63: { icon: "🌧️", text: "déšť" },
  65: { icon: "🌧️", text: "silný déšť" },
  66: { icon: "🌧️", text: "mrznoucí déšť" },
  67: { icon: "🌧️", text: "silný mrznoucí déšť" },
  71: { icon: "🌨️", text: "slabé sněžení" },
  73: { icon: "🌨️", text: "sněžení" },
  75: { icon: "🌨️", text: "silné sněžení" },
  77: { icon: "🌨️", text: "sněhová kroupy" },
  80: { icon: "🌦️", text: "slabé přeháňky" },
  81: { icon: "🌦️", text: "přeháňky" },
  82: { icon: "🌧️", text: "silné přeháňky" },
  85: { icon: "🌨️", text: "slabé sněhové přeháňky" },
  86: { icon: "🌨️", text: "sněhové přeháňky" },
  95: { icon: "⛈️", text: "bouřka" },
  96: { icon: "⛈️", text: "bouřka s gradrem" },
  99: { icon: "⛈️", text: "silná bouřka s gradrem" }
};

const WEATHER_FALLBACK = { icon: "⚠️", temp: "—", text: "chybí", high: "—", low: "—", rain: "—" };

async function geocodePlace(placeName) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(placeName)}&count=1&language=cs&format=json`;
  const resp = await fetch(url);
  const data = await resp.json();
  if (!data.results || data.results.length === 0) {
    throw new Error(`Nenalezena lokace: ${placeName}`);
  }
  const { latitude, longitude } = data.results[0];
  return { lat: latitude, lon: longitude };
}

async function fetchWeather(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=1`;
  const resp = await fetch(url);
  const data = await resp.json();

  const current = data.current || {};
  const daily = data.daily || {};

  const code = current.weather_code ?? daily.weather_code?.[0] ?? 0;
  const wmo = WMO_CODES[code] || { icon: "❓", text: "neznámo" };

  return {
    icon: wmo.icon,
    temp: Math.round(current.temperature_2m ?? daily.temperature_2m_max?.[0] ?? 0),
    text: wmo.text,
    high: Math.round(daily.temperature_2m_max?.[0] ?? current.temperature_2m ?? 0),
    low: Math.round(daily.temperature_2m_min?.[0] ?? current.temperature_2m ?? 0),
    // Always a probability in % (never mix in mm of precipitation)
    rain: daily.precipitation_probability_max?.[0] ?? 0
  };
}

// Fetch weather for one place; a failure here must not affect the other place.
async function loadWeather(place) {
  try {
    const geo = await geocodePlace(place);
    return { data: await fetchWeather(geo.lat, geo.lon), error: null };
  } catch (e) {
    return { data: WEATHER_FALLBACK, error: `${place}: ${e.message}` };
  }
}

// sp.calendar.getEvents() return shape is undocumented: could be an array
// or Google's raw { items: [...] }. Normalize defensively.
function extractEvents(raw) {
  if (Array.isArray(raw)) return raw;
  if (raw && Array.isArray(raw.items)) return raw.items;
  return [];
}

function formatClassEvent(event) {
  const start = new Date(event.start?.dateTime || event.start?.date);
  const end = new Date(event.end?.dateTime || event.end?.date);
  const isAllDay = !event.start?.dateTime;
  const valid = !isNaN(start.getTime()) && !isNaN(end.getTime());

  let timeStr = "";
  if (!isAllDay && valid) {
    const sh = start.getHours().toString().padStart(2, "0");
    const sm = start.getMinutes().toString().padStart(2, "0");
    const eh = end.getHours().toString().padStart(2, "0");
    const em = end.getMinutes().toString().padStart(2, "0");
    timeStr = ` · ${sh}:${sm}–${eh}:${em}`;
  }

  const location = event.location ? ` · ${event.location}` : "";
  const summary = event.summary || "Bez názvu";

  return `${summary}${timeStr}${location}`;
}

export default async function run({ params, secrets, state, lang, now, sp }) {
  const homePlace = params.home_place;
  const schoolPlace = params.school_place;
  const calendarId = params.calendar_id;
  // max_classes is declared as number, but tolerate string/empty values too
  const maxClasses = Math.max(1, parseInt(params.max_classes, 10) || 2);

  if (!homePlace || !schoolPlace || !calendarId) {
    return {
      values: {
        home_icon: "⚠️",
        home_temp: "—",
        home_text: "Chybí konfigurace",
        home_high: "—",
        home_low: "—",
        home_rain: "—",
        school_icon: "⚠️",
        school_temp: "—",
        school_text: "Chybí konfigurace",
        school_high: "—",
        school_low: "—",
        school_rain: "—",
        next_class: "Nastavte home_place, school_place, calendar_id",
        next_classes: [],
        status: "config_error"
      },
      state: {}
    };
  }

  // `now` may not be a Date depending on the runtime; coerce safely.
  const nowMs = now ? new Date(now).getTime() : Date.now();
  const nowDate = Number.isNaN(nowMs) ? new Date() : new Date(nowMs);

  const [homeRes, schoolRes] = await Promise.all([
    loadWeather(homePlace),
    loadWeather(schoolPlace)
  ]);
  const homeWeather = homeRes.data;
  const schoolWeather = schoolRes.data;

  let nextClass = "Žádné nadcházející hodiny";
  let nextClasses = [];
  let calendarError = null;

  try {
    const events = extractEvents(await sp.calendar.getEvents({
      calendarId,
      timeMin: nowDate.toISOString(),
      maxResults: maxClasses,
      singleEvents: true,
      orderBy: "startTime"
    }));

    if (events.length > 0) {
      nextClasses = events.map(ev => formatClassEvent(ev));
      nextClass = nextClasses[0];
    }
  } catch (e) {
    calendarError = e.message;
    nextClass = "Chyba kalendáře";
    nextClasses = ["Zkontrolujte calendar_id a připojení"];
  }

  const statusParts = [];
  if (homeRes.error) statusParts.push(`počasí doma: ${homeRes.error}`);
  if (schoolRes.error) statusParts.push(`počasí ve škole: ${schoolRes.error}`);
  if (calendarError) statusParts.push(`kalendář: ${calendarError}`);
  const status = statusParts.length > 0 ? statusParts.join("; ") : "ok";

  return {
    values: {
      home_icon: homeWeather.icon,
      home_temp: homeWeather.temp,
      home_text: homeWeather.text,
      home_high: homeWeather.high,
      home_low: homeWeather.low,
      home_rain: homeWeather.rain,
      school_icon: schoolWeather.icon,
      school_temp: schoolWeather.temp,
      school_text: schoolWeather.text,
      school_high: schoolWeather.high,
      school_low: schoolWeather.low,
      school_rain: schoolWeather.rain,
      next_class: nextClass,
      next_classes: nextClasses,
      status
    },
    state: {}
  };
}
