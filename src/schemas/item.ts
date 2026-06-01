import { z } from 'zod'
import { itemSchema } from '../generated/item.js'

export const ItemSchema = itemSchema
export type Item = z.infer<typeof ItemSchema>

export function parseItem(data: unknown): Item {
  return ItemSchema.parse(data)
}
