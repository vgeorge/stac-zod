import { describe, test, expect } from 'vitest'
import { parseCollection, CollectionSchema } from '../src/index.js'
import collection from './fixtures/collection.json'

describe('CollectionSchema', () => {
  test('example collection passes', () => {
    expect(() => parseCollection(collection)).not.toThrow()
  })

  test('safeParse returns success for valid collection', () => {
    const result = CollectionSchema.safeParse(collection)
    expect(result.success).toBe(true)
  })

  test('safeParse returns failure when type is missing', () => {
    const { type: _type, ...rest } = collection as Record<string, unknown>
    const result = CollectionSchema.safeParse(rest)
    expect(result.success).toBe(false)
  })
})
