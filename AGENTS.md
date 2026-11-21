# AGENTS.md

Guidelines for AI agents working in this repo. Read only the topic file you need:

- **Touching `module.js` (manifest, config, any `fetch`)** → [.agents/module-manifest.md](.agents/module-manifest.md)
- **Writing user-facing text (Czech)** → [.agents/czech-text.md](.agents/czech-text.md)
- **Using `sp.*`, `now`, or external API responses** → [.agents/runtime-api.md](.agents/runtime-api.md)
- **Working with markdown files** → [.agents/md-rules.md](.agents/md-rules.md)

Universal rule: every host a `fetch()` contacts must be declared in the manifest `hosts` array (subdomains are separate hosts).
