import { z } from 'zod'

export const EXTENSION_URL = 'https://stac-extensions.github.io/render/v1.0.0/schema.json'

const RenderSchema = z
  .object({
    assets: z.array(z.string()),
    title: z.string().optional(),
    rescale: z.array(z.array(z.number())).optional(),
    nodata: z.union([z.number(), z.string()]).optional(),
    colormap_name: z.string().optional(),
    colormap: z.record(z.unknown()).optional(),
    color_formula: z.string().optional(),
    resampling: z.string().optional(),
    expression: z.string().optional(),
    minmax_zoom: z.array(z.number()).optional(),
    bidx: z.array(z.number()).optional(),
  })
  .passthrough()

const RenderExtension = z.object({
  renders: z.record(RenderSchema),
})

export function validate(data: unknown): string[] {
  const r = RenderExtension.safeParse(data)
  if (r.success) return []
  return r.error.issues.map((i) => {
    const path = i.path.length > 0 ? i.path.join('.') : 'root'
    return `${path}: ${i.message}`
  })
}
