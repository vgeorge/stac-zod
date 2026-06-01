import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import $RefParser from '@apidevtools/json-schema-ref-parser'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ajv = new Ajv({ strict: false, allErrors: true })
addFormats(ajv)
// STAC schemas use iri/iri-reference formats not included in ajv-formats; accept without validating
ajv.addFormat('iri', true)
ajv.addFormat('iri-reference', true)

const schemaRoot = resolve(__dirname, '../json-schemas')

function stripIds(schema: unknown, seen = new WeakSet()): unknown {
  if (Array.isArray(schema)) return schema.map((v) => stripIds(v, seen))
  if (schema && typeof schema === 'object') {
    if (seen.has(schema as object)) return {}
    seen.add(schema as object)
    const { $id: _, ...rest } = schema as Record<string, unknown>
    return Object.fromEntries(Object.entries(rest).map(([k, v]) => [k, stripIds(v, seen)]))
  }
  return schema
}

async function loadValidator(schemaPath: string) {
  const raw = JSON.parse(readFileSync(schemaPath, 'utf-8'))
  const derefed = await $RefParser.dereference(schemaPath, raw, {})
  return ajv.compile(stripIds(derefed) as object)
}

export const validators = {
  item: await loadValidator(resolve(schemaRoot, 'item-spec/json-schema/item.json')),
  collection: await loadValidator(resolve(schemaRoot, 'collection-spec/json-schema/collection.json')),
  catalog: await loadValidator(resolve(schemaRoot, 'catalog-spec/json-schema/catalog.json')),
}
