# stac-zod

Zod schemas for STAC 1.0.0 (SpatioTemporal Asset Catalog) with validation CLI.

## Features

- Full STAC 1.0.0 schema coverage (Item, Collection, Catalog)
- TypeScript types inferred from Zod schemas
- Extension validators (projection, raster, item-assets, render)
- CLI for validating live STAC catalogs
- Cross-validated against official STAC JSON Schema

## Installation

```bash
git clone https://github.com/vgeorge/stac-zod.git
cd stac-zod
pnpm install
pnpm build
```

## CLI Usage

After building the package:

```bash
# Validate a STAC catalog
pnpm validate <url>

# Or run directly
node dist/cli.js validate <url>
```

**Options:**
- `-c, --concurrency <n>` — Max concurrent requests (default: 10)
- `-o, --output <path>` — Markdown report path (default: `stac-validation-report.md`)
- `--fail-fast` — Stop on first validation error

**Examples:**

```bash
# Build first
pnpm build

# Validate with default settings
pnpm validate https://dev.disasters.openveda.cloud/api/stac/

# High concurrency for large catalogs
node dist/cli.js validate https://earth-search.aws.element84.com/v1 -c 20

# Stop on first error
node dist/cli.js validate https://api.stacspec.org/v1.0.0 --fail-fast
```

## Library Usage

```typescript
import { parseItem, parseCollection, parseCatalog } from 'stac-zod'

// Validate STAC objects
const item = parseItem(stacJsonData)
const collection = parseCollection(stacJsonData)
const catalog = parseCatalog(stacJsonData)
```

## Supported Extensions

- **projection v1.1.0** — `proj:*` fields (epsg, wkt2, geometry, shape, transform)
- **raster v1.1.0** — `raster:bands` with statistics
- **item-assets v1.0.0** — `item_assets` collection definitions
- **render v1.0.0** — `renders` for tile rendering parameters

## Development

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Build
pnpm build

# Validate test endpoint
pnpm smoke-test
```

## License

MIT
