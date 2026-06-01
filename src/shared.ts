import { z } from 'zod'

export const StacExtensionsSchema = z
  .array(z.string())
  .refine((arr) => new Set(arr).size === arr.length, {
    message: 'stac_extensions must be unique',
  })
  .optional()
