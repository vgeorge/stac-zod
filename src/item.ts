import { z } from 'zod'
import { BboxSchema, GeometrySchema } from './geometry.js'
import { LinkSchema } from './link.js'
import { AssetSchema } from './asset.js'
import { StacExtensionsSchema } from './shared.js'
import { StacValidationError } from './errors.js'

export const ItemPropertiesSchema = z
  .object({
    datetime: z.string().datetime({ offset: true }).nullable().optional(),
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
  // C10: when datetime is null or absent, both start_datetime and end_datetime are required.
  .superRefine((props, ctx) => {
    if (
      (props.datetime === null || props.datetime === undefined) &&
      (props.start_datetime === undefined || props.end_datetime === undefined)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'start_datetime and end_datetime are required when datetime is null or absent',
        path: ['datetime'],
      })
    }
  })

export const ItemSchema = z
  .object({
    type: z.literal('Feature'),
    stac_version: z.literal('1.0.0'),
    stac_extensions: StacExtensionsSchema,
    id: z.string().min(1),
    geometry: GeometrySchema.nullable(),
    bbox: BboxSchema.optional(),
    properties: ItemPropertiesSchema,
    links: z.array(LinkSchema),
    assets: z.record(AssetSchema),
    collection: z.string().optional(),
  })
  // C9: bbox is required when geometry is non-null; must be absent when geometry is null.
  .superRefine((item, ctx) => {
    if (item.geometry !== null && item.bbox === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'bbox is required when geometry is non-null',
        path: ['bbox'],
      })
    }
    if (item.geometry === null && item.bbox !== undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'bbox must not be present when geometry is null',
        path: ['bbox'],
      })
    }
  })

export type ItemProperties = z.infer<typeof ItemPropertiesSchema>
export type Item = z.infer<typeof ItemSchema>

export function parseItem(data: unknown): Item {
  const result = ItemSchema.safeParse(data)
  if (!result.success) {
    throw new StacValidationError('Item', result.error)
  }
  return result.data
}
