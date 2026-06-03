import pLimit from 'p-limit'
import { parseCatalog, parseCollection, parseItem, StacValidationError } from './index.js'
import { validateExtensions } from './extensions/index.js'

export type StacObjectType = 'Catalog' | 'Collection' | 'Item' | 'Unknown'

export interface ValidationResult {
  url: string
  type: StacObjectType
  valid: boolean
  errors: string[]
}

type OnResult = (result: ValidationResult) => void

export interface TraverseOptions {
  concurrency: number
  failFast: boolean
}

const FOLLOWED_RELS = new Set(['child', 'item', 'items', 'next', 'data'])

async function fetchJson(url: string): Promise<unknown> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`)
  }
  return response.json()
}

function extractLinks(data: unknown, rels: Set<string>): string[] {
  if (!data || typeof data !== 'object') return []
  const links = (data as Record<string, unknown>).links
  if (!Array.isArray(links)) return []
  return links
    .filter((l): l is Record<string, string> =>
      typeof l === 'object' &&
      l !== null &&
      typeof (l as Record<string, unknown>).rel === 'string' &&
      rels.has((l as Record<string, unknown>).rel as string) &&
      typeof (l as Record<string, unknown>).href === 'string',
    )
    .map((l) => l.href)
}

function getStacExtensions(data: unknown): string[] {
  if (!data || typeof data !== 'object') return []
  const exts = (data as Record<string, unknown>).stac_extensions
  if (!Array.isArray(exts)) return []
  return exts.filter((e): e is string => typeof e === 'string')
}

function extractErrors(err: unknown): string[] {
  if (err instanceof StacValidationError) {
    return err.issues.map((i) => {
      const path = i.path.length > 0 ? i.path.join('.') : 'root'
      return `${path}: ${i.message}`
    })
  }
  return [String(err)]
}

function validateObject(
  url: string,
  data: unknown,
  onResult: OnResult,
): string[] {
  const obj = data as Record<string, unknown>
  const type = typeof obj.type === 'string' ? obj.type : undefined

  if (type === 'Catalog') {
    let valid = true
    let errors: string[] = []
    try {
      parseCatalog(data)
    } catch (err) {
      valid = false
      errors = extractErrors(err)
    }
    onResult({ url, type: 'Catalog', valid, errors })
    return extractLinks(data, FOLLOWED_RELS)
  }

  if (type === 'Collection') {
    let valid = true
    let errors: string[] = []
    try {
      parseCollection(data)
    } catch (err) {
      valid = false
      errors = extractErrors(err)
    }
    const extErrors = validateExtensions(getStacExtensions(data), data)
    if (extErrors.length > 0) { valid = false; errors = [...errors, ...extErrors] }
    onResult({ url, type: 'Collection', valid, errors })
    return extractLinks(data, FOLLOWED_RELS)
  }

  if (type === 'Feature') {
    let valid = true
    let errors: string[] = []
    try {
      parseItem(data)
    } catch (err) {
      valid = false
      errors = extractErrors(err)
    }
    const extErrors = validateExtensions(getStacExtensions(data), data)
    if (extErrors.length > 0) { valid = false; errors = [...errors, ...extErrors] }
    onResult({ url, type: 'Item', valid, errors })
    return []
  }

  if (type === 'FeatureCollection') {
    const features = Array.isArray(obj.features) ? obj.features : []
    for (const feature of features) {
      const f = feature as Record<string, unknown>
      const selfLink = extractLinks(feature, new Set(['self']))[0]
      const itemUrl = selfLink ?? `${url}/${f.id ?? 'unknown'}`
      let valid = true
      let errors: string[] = []
      try {
        parseItem(feature)
      } catch (err) {
        valid = false
        errors = extractErrors(err)
      }
      const extErrors = validateExtensions(getStacExtensions(feature), feature)
      if (extErrors.length > 0) { valid = false; errors = [...errors, ...extErrors] }
      onResult({ url: itemUrl, type: 'Item', valid, errors })
    }
    return extractLinks(data, new Set(['next']))
  }

  // STAC API collections listing: no `type` field, has `collections` array
  if (!type && Array.isArray(obj.collections)) {
    const collections = obj.collections as unknown[]
    const nextLinks: string[] = []
    for (const collection of collections) {
      const c = collection as Record<string, unknown>
      const selfLink = extractLinks(collection, new Set(['self']))[0]
      const collectionUrl = selfLink ?? `${url}/${c.id ?? 'unknown'}`
      let valid = true
      let errors: string[] = []
      try {
        parseCollection(collection)
      } catch (err) {
        valid = false
        errors = extractErrors(err)
      }
      const extErrors = validateExtensions(getStacExtensions(collection), collection)
      if (extErrors.length > 0) { valid = false; errors = [...errors, ...extErrors] }
      onResult({ url: collectionUrl, type: 'Collection', valid, errors })
      nextLinks.push(...extractLinks(collection, new Set(['items'])))
    }
    // Follow next page if present
    nextLinks.push(...extractLinks(data, new Set(['next'])))
    return nextLinks
  }

  onResult({ url, type: 'Unknown', valid: false, errors: [`unrecognized type: ${type}`] })
  return []
}

export async function traverse(
  rootUrl: string,
  options: TraverseOptions,
  onResult: OnResult,
): Promise<ValidationResult[]> {
  const { concurrency, failFast } = options
  const limit = pLimit(concurrency)
  const visited = new Set<string>()
  const results: ValidationResult[] = []
  let hasFailed = false

  const wrappedOnResult: OnResult = (result) => {
    results.push(result)
    if (!result.valid) hasFailed = true
    onResult(result)
  }

  let queue: string[] = [rootUrl]

  while (queue.length > 0) {
    if (failFast && hasFailed) break

    const batch = queue.filter((url) => !visited.has(url))
    batch.forEach((url) => visited.add(url))
    queue = []

    const linkBatches = await Promise.all(
      batch.map((url) =>
        limit(async (): Promise<string[]> => {
          if (failFast && hasFailed) return []
          let data: unknown
          try {
            data = await fetchJson(url)
          } catch (err) {
            wrappedOnResult({ url, type: 'Unknown', valid: false, errors: [String(err)] })
            return []
          }
          return validateObject(url, data, wrappedOnResult)
        }),
      ),
    )

    if (failFast && hasFailed) break

    for (const links of linkBatches) {
      for (const link of links) {
        if (!visited.has(link)) {
          queue.push(link)
        }
      }
    }
  }

  return results
}
