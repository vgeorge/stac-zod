import * as itemAssets from './item-assets.js'
import * as projection from './projection.js'
import * as raster from './raster.js'
import * as render from './render.js'

export { itemAssets, projection, raster, render }

const registry: Record<string, (data: unknown) => string[]> = {
  [itemAssets.EXTENSION_URL]: itemAssets.validate,
  [projection.EXTENSION_URL]: projection.validate,
  [raster.EXTENSION_URL]: raster.validate,
  [render.EXTENSION_URL]: render.validate,
}

export function validateExtensions(stacExtensions: string[], data: unknown): string[] {
  const errors: string[] = []
  for (const url of stacExtensions) {
    const validator = registry[url]
    if (validator) errors.push(...validator(data))
  }
  return errors
}
