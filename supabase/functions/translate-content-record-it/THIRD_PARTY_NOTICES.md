# Third-party notice

The translation transport in `index.ts` is adapted from the GoogleTranslator
strategy of the **deep-translator** project.

- Project: deep-translator
- Author/copyright: Copyright (C) 2020 Nidhal Baccouri
- Upstream repository: https://github.com/nidhaloff/deep-translator
- License: Apache License 2.0

The original Python package performs an HTTP GET request to the mobile Google
Translate page and extracts the translated text from the returned HTML. This
project implements the equivalent transport in TypeScript/Deno so it can run
inside a Supabase Edge Function. The upstream package itself is not bundled.
