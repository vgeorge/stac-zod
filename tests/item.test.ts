import { describe, test, expect, expectTypeOf } from 'vitest'
import { parseItem, ItemSchema, type Item } from '../src/index.js'
import simpleItem from './fixtures/simple-item.json'
import extendedItem from './fixtures/extended-item.json'

describe('ItemSchema', () => {
  test('simple item passes', () => {
    expect(() => parseItem(simpleItem)).not.toThrow()
  })

  test('extended item passes', () => {
    expect(() => parseItem(extendedItem)).not.toThrow()
  })

  test('safeParse returns success for valid item', () => {
    const result = ItemSchema.safeParse(simpleItem)
    expect(result.success).toBe(true)
  })

  test('safeParse returns failure for non-Feature type', () => {
    const bad = { ...simpleItem, type: 'NotAFeature' }
    const result = ItemSchema.safeParse(bad)
    expect(result.success).toBe(false)
  })

  test('type inference: type field is "Feature"', () => {
    expectTypeOf<Item>().toHaveProperty('type')
  })
})
