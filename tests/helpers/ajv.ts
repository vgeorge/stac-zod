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

// C7: Use bundle() instead of dereference() — bundle() inlines all external $refs as
// internal JSON pointer definitions without creating circular JS object references.
// dereference() created circular refs that caused stripIds() to return {} and silently
// drop descendant constraints from the Ajv oracle.
function stripIds(schema: unknown): unknown {
  if (Array.isArray(schema)) return schema.map(stripIds)
  if (schema && typeof schema === 'object') {
    const { $id: _, ...rest } = schema as Record<string, unknown>
    return Object.fromEntries(Object.entries(rest).map(([k, v]) => [k, stripIds(v)]))
  }
  return schema
}

async function loadValidator(schemaPath: string) {
  const raw = JSON.parse(readFileSync(schemaPath, 'utf-8'))
  const bundled = await $RefParser.bundle(schemaPath, raw, {})
  return ajv.compile(stripIds(bundled) as object)
}

export const validators = {
  item: await loadValidator(resolve(schemaRoot, 'item-spec/json-schema/item.json')),
  collection: await loadValidator(resolve(schemaRoot, 'collection-spec/json-schema/collection.json')),
  catalog: await loadValidator(resolve(schemaRoot, 'catalog-spec/json-schema/catalog.json')),
}
