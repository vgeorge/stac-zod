import { z } from 'zod'
import { BboxSchema, GeometrySchema } from '../geometry.js'

export const EXTENSION_URL = 'https://stac-extensions.github.io/projection/v1.1.0/schema.json'

const ProjFields = z
  .object({
    'proj:epsg': z.number().int().nullable().optional(),
    'proj:wkt2': z.string().nullable().optional(),
    'proj:projjson': z.record(z.unknown()).nullable().optional(),
    'proj:geometry': GeometrySchema.optional(),
    'proj:bbox': BboxSchema.optional(),
    'proj:centroid': z
      .object({ lat: z.number().min(-90).max(90), lon: z.number().min(-180).max(180) })
      .optional(),
    'proj:shape': z.tuple([z.number(), z.number()]).optional(),
    'proj:transform': z
      .array(z.number())
      .refine((a) => a.length === 6 || a.length === 9, { message: 'must have 6 or 9 elements' })
      .optional(),
  })
  .passthrough()

function parseFields(data: unknown, prefix: string): string[] {
  const r = ProjFields.safeParse(data)
  if (r.success) return []
  return r.error.issues.map((i) => {
    const path = i.path.length > 0 ? `${prefix}.${i.path.join('.')}` : prefix
    return `${path}: ${i.message}`
  })
}

export function validate(data: unknown): string[] {
  const errors: string[] = []
  const obj = data as Record<string, unknown>

  if (typeof obj.properties === 'object' && obj.properties !== null) {
    errors.push(...parseFields(obj.properties, 'properties'))
  }

  if (typeof obj.assets === 'object' && obj.assets !== null) {
    for (const [key, asset] of Object.entries(obj.assets as Record<string, unknown>)) {
      errors.push(...parseFields(asset, `assets.${key}`))
    }
  }

  return errors
}
