import { z } from 'zod'
import { GeometrySchema } from './geometry.js'
import { LinkSchema } from './link.js'
import { AssetSchema } from './asset.js'

export const ItemPropertiesSchema = z
  .object({
    datetime: z.string().datetime({ offset: true }).nullable(),
    title: z.string().optional(),
    description: z.string().optional(),
    created: z.string().datetime({ offset: true }).optional(),
    updated: z.string().datetime({ offset: true }).optional(),
    start_datetime: z.string().datetime({ offset: true }).optional(),
    end_datetime: z.string().datetime({ offset: true }).optional(),
    platform: z.string().optional(),
    instruments: z.array(z.string()).optional(),
    constellation: z.string().optional(),
    mission: z.string().optional(),
    gsd: z.number().positive().optional(),
  })
  .passthrough()

export const ItemSchema = z.object({
  type: z.literal('Feature'),
  stac_version: z.literal('1.0.0'),
  stac_extensions: z.array(z.string().url()).optional(),
  id: z.string().min(1),
  geometry: GeometrySchema.nullable(),
  bbox: z.tuple([z.number(), z.number(), z.number(), z.number()]).optional(),
  properties: ItemPropertiesSchema,
  links: z.array(LinkSchema),
  assets: z.record(AssetSchema),
  collection: z.string().optional(),
})

export type ItemProperties = z.infer<typeof ItemPropertiesSchema>
export type Item = z.infer<typeof ItemSchema>

export function parseItem(data: unknown): Item {
  return ItemSchema.parse(data)
}
