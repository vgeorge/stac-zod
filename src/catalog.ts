import { z } from 'zod'
import { LinkSchema } from './link.js'

export const CatalogSchema = z.object({
  type: z.literal('Catalog'),
  stac_version: z.literal('1.0.0'),
  stac_extensions: z.array(z.string().url()).optional(),
  id: z.string().min(1),
  title: z.string().optional(),
  description: z.string().min(1),
  links: z.array(LinkSchema),
})

export type Catalog = z.infer<typeof CatalogSchema>

export function parseCatalog(data: unknown): Catalog {
  return CatalogSchema.parse(data)
}
