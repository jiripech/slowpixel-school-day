# Module manifest rules

The `/* slowpixel-module { ... } */` comment at the top of `module.js` is the device manifest.

- `hosts`: declare **every** host any `fetch()` in the file contacts. Subdomains count as separate hosts (`api.open-meteo.com` ≠ `geocoding-api.open-meteo.com`). Symptom of a missing host: request blocked, weather shows "chybí", `status` names the failing place.
- `config`: types must match `SPEC.md`. Numbers use `"type": "number"`, never text. Always `parseInt(x, 10) || default` before use.
- `"methods": ["GET"]` only — do not add non-GET calls without updating it.
- `module.js` must end with a trailing newline.
