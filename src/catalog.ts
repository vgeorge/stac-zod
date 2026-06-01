import { z } from 'zod'
import { LinkSchema } from './link.js'
import { StacExtensionsSchema } from './shared.js'
import { StacValidationError } from './errors.js'

export const CatalogSchema = z.object({
  type: z.literal('Catalog'),
  stac_version: z.literal('1.0.0'),
  stac_extensions: StacExtensionsSchema,
  id: z.string().min(1),
  title: z.string().optional(),
  description: z.string().min(1),
  links: z.array(LinkSchema),
})

export type Catalog = z.infer<typeof CatalogSchema>

export function parseCatalog(data: unknown): Catalog {
  const result = CatalogSchema.safeParse(data)
  if (!result.success) {
    throw new StacValidationError('Catalog', result.error)
  }
  return result.data
}
