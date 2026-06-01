import { describe, test, expect, expectTypeOf } from 'vitest'
import { parseCatalog, CatalogSchema, type Catalog } from '../src/index.js'
import { validators } from './helpers/ajv.js'
import catalog from './fixtures/catalog.json'

describe('CatalogSchema — valid fixtures', () => {
  test('catalog: Zod and JSON Schema both pass', () => {
    const zodResult = CatalogSchema.safeParse(catalog)
    const ajvValid = validators.catalog(catalog)

    if (!zodResult.success) console.error('Zod errors:', zodResult.error.issues)
    if (!ajvValid) console.error('Ajv errors:', validators.catalog.errors)

    expect(zodResult.success).toBe(true)
    expect(ajvValid).toBe(true)
  })
})

describe('CatalogSchema — invalid inputs', () => {
  test('missing stac_version: Zod and JSON Schema both reject', () => {
    const { stac_version: _v, ...bad } = catalog as Record<string, unknown>
    expect(CatalogSchema.safeParse(bad).success).toBe(false)
    expect(validators.catalog(bad)).toBe(false)
  })

  test('missing description: Zod and JSON Schema both reject', () => {
    const { description: _d, ...bad } = catalog as Record<string, unknown>
    expect(CatalogSchema.safeParse(bad).success).toBe(false)
    expect(validators.catalog(bad)).toBe(false)
  })
})

describe('CatalogSchema — types', () => {
  test('parseCatalog returns typed Catalog', () => {
    const cat = parseCatalog(catalog)
    expectTypeOf(cat).toMatchTypeOf<Catalog>()
    expect(cat.type).toBe('Catalog')
    expect(cat.stac_version).toBe('1.0.0')
  })
})
