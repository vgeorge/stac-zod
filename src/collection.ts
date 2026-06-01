import { z } from 'zod'
import { LinkSchema } from './link.js'
import { AssetSchema } from './asset.js'
import { ProviderSchema } from './provider.js'

export const SpatialExtentSchema = z.object({
  bbox: z.array(z.array(z.number()).min(4)),
})

export const TemporalExtentSchema = z.object({
  interval: z.array(z.tuple([z.string().datetime({ offset: true }).nullable(), z.string().datetime({ offset: true }).nullable()])),
})

export const ExtentSchema = z.object({
  spatial: SpatialExtentSchema,
  temporal: TemporalExtentSchema,
})

export const CollectionSchema = z.object({
  type: z.literal('Collection'),
  stac_version: z.literal('1.0.0'),
  stac_extensions: z.array(z.string().url()).optional(),
  id: z.string().min(1),
  title: z.string().optional(),
  description: z.string().min(1),
  keywords: z.array(z.string()).optional(),
  license: z.string().min(1),
  providers: z.array(ProviderSchema).optional(),
  extent: ExtentSchema,
  summaries: z.record(z.unknown()).optional(),
  links: z.array(LinkSchema),
  assets: z.record(AssetSchema).optional(),
})

export type SpatialExtent = z.infer<typeof SpatialExtentSchema>
export type TemporalExtent = z.infer<typeof TemporalExtentSchema>
export type Extent = z.infer<typeof ExtentSchema>
export type Collection = z.infer<typeof CollectionSchema>

export function parseCollection(data: unknown): Collection {
  return CollectionSchema.parse(data)
}
