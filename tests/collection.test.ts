import { describe, test, expect, expectTypeOf } from 'vitest'
import { parseCollection, CollectionSchema, type Collection } from '../src/index.js'
import { validators } from './helpers/ajv.js'
import collection from './fixtures/collection.json'

describe('CollectionSchema — valid fixtures', () => {
  test('collection: Zod and JSON Schema both pass', () => {
    const zodResult = CollectionSchema.safeParse(collection)
    const ajvValid = validators.collection(collection)

    if (!zodResult.success) console.error('Zod errors:', zodResult.error.issues)
    if (!ajvValid) console.error('Ajv errors:', validators.collection.errors)

    expect(zodResult.success).toBe(true)
    expect(ajvValid).toBe(true)
  })
})

describe('CollectionSchema — invalid inputs', () => {
  test('missing type: Zod and JSON Schema both reject', () => {
    const { type: _type, ...bad } = collection as Record<string, unknown>
    expect(CollectionSchema.safeParse(bad).success).toBe(false)
    expect(validators.collection(bad)).toBe(false)
  })

  test('missing description: Zod and JSON Schema both reject', () => {
    const { description: _desc, ...bad } = collection as Record<string, unknown>
    expect(CollectionSchema.safeParse(bad).success).toBe(false)
    expect(validators.collection(bad)).toBe(false)
  })
})

describe('CollectionSchema — types', () => {
  test('parseCollection returns typed Collection', () => {
    const col = parseCollection(collection)
    expectTypeOf(col).toMatchTypeOf<Collection>()
    expect(col.type).toBe('Collection')
    expect(col.stac_version).toBe('1.0.0')
  })
})
