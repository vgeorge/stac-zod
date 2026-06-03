import { describe, test, expect } from 'vitest'
import { validateExtensions } from '../src/extensions/index.js'
import * as projection from '../src/extensions/projection.js'
import * as raster from '../src/extensions/raster.js'
import * as itemAssets from '../src/extensions/item-assets.js'
import * as render from '../src/extensions/render.js'

const projUrl = projection.EXTENSION_URL
const rasterUrl = raster.EXTENSION_URL
const itemAssetsUrl = itemAssets.EXTENSION_URL
const renderUrl = render.EXTENSION_URL

describe('projection extension', () => {
  const base = {
    stac_extensions: [projUrl],
    type: 'Feature',
    properties: {},
    assets: {},
  }

  test('passes with no proj: fields', () => {
    expect(projection.validate(base)).toEqual([])
  })

  test('passes with valid proj:epsg and proj:shape', () => {
    const data = { ...base, properties: { 'proj:epsg': 4326, 'proj:shape': [512, 512] } }
    expect(projection.validate(data)).toEqual([])
  })

  test('passes with proj:epsg null', () => {
    const data = { ...base, properties: { 'proj:epsg': null } }
    expect(projection.validate(data)).toEqual([])
  })

  test('rejects non-integer proj:epsg', () => {
    const data = { ...base, properties: { 'proj:epsg': 'EPSG:4326' } }
    const errors = projection.validate(data)
    expect(errors.length).toBeGreaterThan(0)
    expect(errors[0]).toContain('proj:epsg')
  })

  test('rejects proj:transform with wrong length', () => {
    const data = { ...base, properties: { 'proj:transform': [1, 2, 3] } }
    const errors = projection.validate(data)
    expect(errors.length).toBeGreaterThan(0)
  })

  test('validates proj: fields in assets', () => {
    const data = { ...base, assets: { band1: { href: 's3://x', 'proj:epsg': 'wrong' } } }
    const errors = projection.validate(data)
    expect(errors.some((e) => e.startsWith('assets.band1'))).toBe(true)
  })
})

describe('raster extension', () => {
  const base = { stac_extensions: [rasterUrl], type: 'Feature', assets: {} }

  test('passes with no raster:bands', () => {
    expect(raster.validate({ ...base, assets: { band1: { href: 's3://x' } } })).toEqual([])
  })

  test('passes with valid raster:bands', () => {
    const data = {
      ...base,
      assets: {
        band1: {
          href: 's3://x',
          'raster:bands': [{ data_type: 'float32', nodata: -9999, scale: 1.0, offset: 0.0 }],
        },
      },
    }
    expect(raster.validate(data)).toEqual([])
  })

  test('rejects unknown data_type enum value', () => {
    const data = {
      ...base,
      assets: { b: { href: 's3://x', 'raster:bands': [{ data_type: 'complex128' }] } },
    }
    const errors = raster.validate(data)
    expect(errors.length).toBeGreaterThan(0)
  })

  test('rejects empty raster:bands array', () => {
    const data = { ...base, assets: { b: { href: 's3://x', 'raster:bands': [] } } }
    const errors = raster.validate(data)
    expect(errors.length).toBeGreaterThan(0)
  })
})

describe('item-assets extension', () => {
  test('passes with valid item_assets', () => {
    const data = {
      stac_extensions: [itemAssetsUrl],
      type: 'Collection',
      item_assets: { cog: { title: 'COG', type: 'image/tiff', roles: ['data'] } },
    }
    expect(itemAssets.validate(data)).toEqual([])
  })

  test('fails when item_assets missing', () => {
    const data = { stac_extensions: [itemAssetsUrl], type: 'Collection' }
    const errors = itemAssets.validate(data)
    expect(errors.length).toBeGreaterThan(0)
    expect(errors[0]).toContain('item_assets')
  })

  test('fails when item_assets definition contains href', () => {
    const data = {
      stac_extensions: [itemAssetsUrl],
      type: 'Collection',
      item_assets: { bad: { href: 'https://example.com', title: 'Bad' } },
    }
    const errors = itemAssets.validate(data)
    expect(errors.length).toBeGreaterThan(0)
  })
})

describe('render extension', () => {
  test('passes with valid renders', () => {
    const data = {
      stac_extensions: [renderUrl],
      type: 'Collection',
      renders: { default: { assets: ['band1'], colormap_name: 'viridis' } },
    }
    expect(render.validate(data)).toEqual([])
  })

  test('fails when renders missing', () => {
    const data = { stac_extensions: [renderUrl], type: 'Collection' }
    const errors = render.validate(data)
    expect(errors.length).toBeGreaterThan(0)
    expect(errors[0]).toContain('renders')
  })

  test('fails when render entry missing assets', () => {
    const data = {
      stac_extensions: [renderUrl],
      type: 'Collection',
      renders: { default: { colormap_name: 'viridis' } },
    }
    const errors = render.validate(data)
    expect(errors.length).toBeGreaterThan(0)
  })
})

describe('validateExtensions dispatch', () => {
  test('runs only declared extensions', () => {
    const data = {
      stac_extensions: [projUrl],
      type: 'Feature',
      properties: { 'proj:epsg': 'bad' },
      assets: {},
    }
    const errors = validateExtensions([projUrl], data)
    expect(errors.length).toBeGreaterThan(0)
  })

  test('skips unknown extension URLs', () => {
    const data = { stac_extensions: ['https://example.com/unknown/schema.json'] }
    expect(validateExtensions(['https://example.com/unknown/schema.json'], data)).toEqual([])
  })

  test('runs multiple extensions', () => {
    const data = {
      stac_extensions: [itemAssetsUrl, renderUrl],
      type: 'Collection',
      // missing both item_assets and renders
    }
    const errors = validateExtensions([itemAssetsUrl, renderUrl], data)
    expect(errors.length).toBeGreaterThanOrEqual(2)
  })
})
