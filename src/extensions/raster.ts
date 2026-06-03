import { z } from 'zod'

export const EXTENSION_URL = 'https://stac-extensions.github.io/raster/v1.1.0/schema.json'

const BandSchema = z
  .object({
    data_type: z
      .enum(['uint8', 'uint16', 'int8', 'int16', 'uint32', 'int32', 'float32', 'float64', 'cint16', 'cint32', 'cfloat32', 'cfloat64', 'other'])
      .optional(),
    unit: z.string().optional(),
    bits_per_sample: z.number().int().optional(),
    sampling: z.string().optional(),
    nodata: z.union([z.number(), z.enum(['nan', 'inf', '-inf'])]).optional(),
    scale: z.number().optional(),
    offset: z.number().optional(),
    spatial_resolution: z.number().optional(),
    statistics: z
      .object({
        mean: z.number().optional(),
        minimum: z.number().optional(),
        maximum: z.number().optional(),
        stddev: z.number().optional(),
        valid_percent: z.number().optional(),
      })
      .passthrough()
      .optional(),
    histogram: z
      .object({
        count: z.number().int(),
        min: z.number(),
        max: z.number(),
        buckets: z.array(z.number().int()),
      })
      .passthrough()
      .optional(),
  })
  .passthrough()

const RasterAsset = z
  .object({
    'raster:bands': z.array(BandSchema).min(1).optional(),
  })
  .passthrough()

export function validate(data: unknown): string[] {
  const errors: string[] = []
  const obj = data as Record<string, unknown>

  if (typeof obj.assets === 'object' && obj.assets !== null) {
    for (const [key, asset] of Object.entries(obj.assets as Record<string, unknown>)) {
      const r = RasterAsset.safeParse(asset)
      if (!r.success) {
        for (const i of r.error.issues) {
          const path = i.path.length > 0 ? `assets.${key}.${i.path.join('.')}` : `assets.${key}`
          errors.push(`${path}: ${i.message}`)
        }
      }
    }
  }

  return errors
}
