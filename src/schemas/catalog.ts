import { z } from 'zod'
import { catalogSchema } from '../generated/catalog.js'

export const CatalogSchema = catalogSchema
export type Catalog = z.infer<typeof CatalogSchema>

export function parseCatalog(data: unknown): Catalog {
  return CatalogSchema.parse(data)
}
