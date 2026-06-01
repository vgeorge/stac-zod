import { describe, test, expect, expectTypeOf } from 'vitest'
import { parseItem, ItemSchema, type Item } from '../src/index.js'
import { validators } from './helpers/ajv.js'
import simpleItem from './fixtures/simple-item.json'
import extendedItem from './fixtures/extended-item.json'

describe('ItemSchema — valid fixtures', () => {
  for (const [name, fixture] of [['simple-item', simpleItem], ['extended-item', extendedItem]] as const) {
    test(`${name}: Zod and JSON Schema both pass`, () => {
      const zodResult = ItemSchema.safeParse(fixture)
      const ajvValid = validators.item(fixture)

      if (!zodResult.success) console.error('Zod errors:', zodResult.error.issues)
      if (!ajvValid) console.error('Ajv errors:', validators.item.errors)

      expect(zodResult.success).toBe(true)
      expect(ajvValid).toBe(true)
    })
  }
})

describe('ItemSchema — invalid inputs', () => {
  test('wrong type field: Zod and JSON Schema both reject', () => {
    const bad = { ...simpleItem, type: 'NotAFeature' }
    expect(ItemSchema.safeParse(bad).success).toBe(false)
    expect(validators.item(bad)).toBe(false)
  })

  test('missing id: Zod and JSON Schema both reject', () => {
    const { id: _id, ...bad } = simpleItem as Record<string, unknown>
    expect(ItemSchema.safeParse(bad).success).toBe(false)
    expect(validators.item(bad)).toBe(false)
  })
})

describe('ItemSchema — types', () => {
  test('parseItem returns typed Item', () => {
    const item = parseItem(simpleItem)
    expectTypeOf(item).toMatchTypeOf<Item>()
    expect(item.type).toBe('Feature')
    expect(item.stac_version).toBe('1.0.0')
  })
})
