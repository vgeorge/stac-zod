import { z } from 'zod'
import { collectionSchema } from '../generated/collection.js'

export const CollectionSchema = collectionSchema
export type Collection = z.infer<typeof CollectionSchema>

export function parseCollection(data: unknown): Collection {
  return CollectionSchema.parse(data)
}
