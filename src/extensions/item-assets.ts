import { z } from 'zod'

export const EXTENSION_URL = 'https://stac-extensions.github.io/item-assets/v1.0.0/schema.json'

const ItemAssetDefinition = z
  .object({
    title: z.string().optional(),
    description: z.string().optional(),
    type: z.string().optional(),
    roles: z.array(z.string()).optional(),
  })
  .passthrough()
  .refine((v) => !('href' in v), { message: 'href is not allowed in item_assets definition' })

const ItemAssetsExtension = z.object({
  item_assets: z.record(ItemAssetDefinition),
})

export function validate(data: unknown): string[] {
  const r = ItemAssetsExtension.safeParse(data)
  if (r.success) return []
  return r.error.issues.map((i) => {
    const path = i.path.length > 0 ? i.path.join('.') : 'root'
    return `${path}: ${i.message}`
  })
}
