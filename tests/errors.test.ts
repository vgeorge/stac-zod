import { describe, test, expect } from 'vitest'
import { parseItem, parseCollection, parseCatalog, StacValidationError } from '../src/index'

describe('StacValidationError', () => {
  test('parseItem throws StacValidationError for bad data', () => {
    expect(() => parseItem({ type: 'NotAFeature' })).toThrow(StacValidationError)
    try {
      parseItem({ type: 'NotAFeature' })
      expect.fail('Should have thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(StacValidationError)
      if (error instanceof StacValidationError) {
        expect(error.name).toBe('StacValidationError')
        expect(error.objectType).toBe('Item')
        expect(error.message).toMatch(/Item validation failed/)
        expect(error.issues).toBeInstanceOf(Array)
        expect(error.issues.length).toBeGreaterThan(0)
      }
    }
  })

  test('parseCollection throws StacValidationError for bad data', () => {
    expect(() => parseCollection({ type: 'NotACollection' })).toThrow(StacValidationError)
    try {
      parseCollection({ type: 'NotACollection' })
      expect.fail('Should have thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(StacValidationError)
      if (error instanceof StacValidationError) {
        expect(error.name).toBe('StacValidationError')
        expect(error.objectType).toBe('Collection')
        expect(error.message).toMatch(/Collection validation failed/)
        expect(error.issues).toBeInstanceOf(Array)
        expect(error.issues.length).toBeGreaterThan(0)
      }
    }
  })

  test('parseCatalog throws StacValidationError for bad data', () => {
    expect(() => parseCatalog({ type: 'NotACatalog' })).toThrow(StacValidationError)
    try {
      parseCatalog({ type: 'NotACatalog' })
      expect.fail('Should have thrown')
    } catch (error) {
      expect(error).toBeInstanceOf(StacValidationError)
      if (error instanceof StacValidationError) {
        expect(error.name).toBe('StacValidationError')
        expect(error.objectType).toBe('Catalog')
        expect(error.message).toMatch(/Catalog validation failed/)
        expect(error.issues).toBeInstanceOf(Array)
        expect(error.issues.length).toBeGreaterThan(0)
      }
    }
  })

  test('error message includes path and issue details', () => {
    try {
      parseItem({ type: 'Feature', stac_version: '1.0.0', id: '', links: [], assets: {} })
      expect.fail('Should have thrown')
    } catch (error) {
      if (error instanceof StacValidationError) {
        expect(error.message).toMatch(/id.*String must contain/)
        expect(error.message).toMatch(/geometry.*Invalid/)
        expect(error.message).toMatch(/properties.*Required/)
      }
    }
  })

  test('can catch StacValidationError and inspect zodError', () => {
    try {
      parseItem({ type: 'Feature', stac_version: '1.0.0', id: '', links: [], assets: {} })
      expect.fail('Should have thrown')
    } catch (error) {
      if (error instanceof StacValidationError) {
        expect(error.zodError).toBeDefined()
        expect(error.zodError.issues).toEqual(error.issues)
      }
    }
  })
})
