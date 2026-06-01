import { z } from 'zod'
import { LinkSchema } from './link.js'

const stacExtensionsSchema = z
  .array(z.string())
  .refine((arr) => new Set(arr).size === arr.length, {
    message: 'stac_extensions must be unique',
  })
  .optional()

export const CatalogSchema = z.object({
  type: z.literal('Catalog'),
  stac_version: z.literal('1.0.0'),
  stac_extensions: stacExtensionsSchema,
  id: z.string().min(1),
  title: z.string().optional(),
  description: z.string().min(1),
  links: z.array(LinkSchema),
})

export type Catalog = z.infer<typeof CatalogSchema>

export function parseCatalog(data: unknown): Catalog {
  return CatalogSchema.parse(data)
}
