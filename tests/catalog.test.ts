import { describe, test, expect } from 'vitest'
import { parseCatalog, CatalogSchema } from '../src/index.js'
import catalog from './fixtures/catalog.json'

describe('CatalogSchema', () => {
  test('example catalog passes', () => {
    expect(() => parseCatalog(catalog)).not.toThrow()
  })

  test('safeParse returns success for valid catalog', () => {
    const result = CatalogSchema.safeParse(catalog)
    expect(result.success).toBe(true)
  })

  test('safeParse returns failure when stac_version is missing', () => {
    const { stac_version: _v, ...rest } = catalog as Record<string, unknown>
    const result = CatalogSchema.safeParse(rest)
    expect(result.success).toBe(false)
  })
})
