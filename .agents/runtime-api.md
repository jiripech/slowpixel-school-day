# Runtime & API shapes — never assume, normalize

- `sp.calendar.getEvents(...)` return shape is undocumented: could be an array or Google's `{ items: [...] }`. Always normalize — see `extractEvents()` in `module.js`.
- `now` from the runtime may not be a `Date`. Coerce safely: `new Date(now)`, fall back to `new Date()` if invalid — see top of `run()`.
- Keep units consistent per output field: `*_rain` is a probability in % (`precipitation_probability_max`). Never mix in mm `precipitation`.
- Google Calendar times: `dateTime` (zoned) or `date` (all-day, parsed as UTC). Guard `isNaN(date.getTime())` before formatting.
