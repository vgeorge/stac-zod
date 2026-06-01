#!/bin/bash
cd /Users/vgeorge/dev/veda/apps/stac-zod
git remote add origin git@github.com:vgeorge/stac-zod.git
git add -A
git commit -m "feat: initial stac-zod implementation

Zod schemas for STAC 1.0.0 Item, Collection, and Catalog objects.

- Generated base schemas from stac-spec JSON Schema via json-schema-to-zod
- Curated public API wrappers with inferred TypeScript types
- update-schemas script for regenerating from spec
- Vitest tests with official STAC example fixtures"
git branch -M main
git push -u origin main
