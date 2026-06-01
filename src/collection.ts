import { z } from 'zod'
import { LinkSchema } from './link.js'
import { AssetSchema } from './asset.js'
import { ProviderSchema } from './provider.js'

const stacExtensionsSchema = z
  .array(z.string())
  .refine((arr) => new Set(arr).size === arr.length, {
    message: 'stac_extensions must be unique',
  })
  .optional()

// C3: outer bbox array requires at least one entry per STAC spec (minItems: 1).
export const SpatialExtentSchema = z.object({
  bbox: z.array(z.array(z.number()).min(4)).min(1),
})

export const TemporalExtentSchema = z.object({
  interval: z.array(
    z.tuple([
      z.string().datetime({ offset: true }).nullable(),
      z.string().datetime({ offset: true }).nullable(),
    ]),
  ),
})

export const ExtentSchema = z.object({
  spatial: SpatialExtentSchema,
  temporal: TemporalExtentSchema,
})

export const CollectionSchema = z.object({
  type: z.literal('Collection'),
  stac_version: z.literal('1.0.0'),
  stac_extensions: stacExtensionsSchema,
  id: z.string().min(1),
  title: z.string().optional(),
  description: z.string().min(1),
  keywords: z.array(z.string()).optional(),
  // C5: STAC requires license to match pattern ^[\w\-\.+]+$
  license: z.string().regex(/^[\w\-\.+]+$/, {
    message: 'license must match SPDX expression pattern',
  }),
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
