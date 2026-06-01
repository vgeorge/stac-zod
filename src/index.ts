// Item
export { ItemSchema, ItemPropertiesSchema, parseItem } from './item.js'
export type { Item, ItemProperties } from './item.js'

// Collection
export { CollectionSchema, ExtentSchema, SpatialExtentSchema, TemporalExtentSchema, parseCollection } from './collection.js'
export type { Collection, Extent, SpatialExtent, TemporalExtent } from './collection.js'

// Catalog
export { CatalogSchema, parseCatalog } from './catalog.js'
export type { Catalog } from './catalog.js'

// Error handling
export { StacValidationError } from './errors.js'

// Shared building blocks
export { GeometrySchema, PointSchema, LineStringSchema, PolygonSchema, MultiPointSchema, MultiLineStringSchema, MultiPolygonSchema, GeometryCollectionSchema, BboxSchema } from './geometry.js'
export type { Geometry, Point, LineString, Polygon, MultiPoint, MultiLineString, MultiPolygon, GeometryCollection, Bbox } from './geometry.js'

export { StacExtensionsSchema } from './shared.js'

export { LinkSchema } from './link.js'
export type { Link } from './link.js'

export { AssetSchema } from './asset.js'
export type { Asset } from './asset.js'

export { ProviderSchema, ProviderRoleSchema } from './provider.js'
export type { Provider, ProviderRole } from './provider.js'
