import { z } from 'zod'

const Position = z.array(z.number()).min(2)

// RFC 7946 bbox: 4 numbers (2D) or 6 numbers (3D with altitude)
export const BboxSchema = z.union([
  z.tuple([z.number(), z.number(), z.number(), z.number()]),
  z.tuple([z.number(), z.number(), z.number(), z.number(), z.number(), z.number()]),
])
export type Bbox = z.infer<typeof BboxSchema>

export const PointSchema = z.object({
  type: z.literal('Point'),
  coordinates: Position,
  bbox: BboxSchema.optional(),
})

export const LineStringSchema = z.object({
  type: z.literal('LineString'),
  coordinates: z.array(Position).min(2),
  bbox: BboxSchema.optional(),
})

export const PolygonSchema = z.object({
  type: z.literal('Polygon'),
  coordinates: z.array(z.array(Position).min(4)),
  bbox: BboxSchema.optional(),
})

export const MultiPointSchema = z.object({
  type: z.literal('MultiPoint'),
  coordinates: z.array(Position),
  bbox: BboxSchema.optional(),
})

export const MultiLineStringSchema = z.object({
  type: z.literal('MultiLineString'),
  coordinates: z.array(z.array(Position).min(2)),
  bbox: BboxSchema.optional(),
})

export const MultiPolygonSchema = z.object({
  type: z.literal('MultiPolygon'),
  coordinates: z.array(z.array(z.array(Position).min(4))),
  bbox: BboxSchema.optional(),
})

export type Point = z.infer<typeof PointSchema>
export type LineString = z.infer<typeof LineStringSchema>
export type Polygon = z.infer<typeof PolygonSchema>
export type MultiPoint = z.infer<typeof MultiPointSchema>
export type MultiLineString = z.infer<typeof MultiLineStringSchema>
export type MultiPolygon = z.infer<typeof MultiPolygonSchema>

const BaseGeometrySchema = z.discriminatedUnion('type', [
  PointSchema,
  LineStringSchema,
  PolygonSchema,
  MultiPointSchema,
  MultiLineStringSchema,
  MultiPolygonSchema,
])

export type BaseGeometry = z.infer<typeof BaseGeometrySchema>

// GeometryCollection and Geometry are mutually recursive — use z.lazy()
export type GeometryCollection = {
  type: 'GeometryCollection'
  geometries: Geometry[]
  bbox?: number[]
}
export type Geometry = BaseGeometry | GeometryCollection

// GeometryCollectionSchema is declared before GeometrySchema so the z.lazy()
// reference to GeometrySchema is resolved at validation time, not definition time.
export const GeometryCollectionSchema: z.ZodType<GeometryCollection> = z.object({
  type: z.literal('GeometryCollection'),
  geometries: z.lazy(() => z.array(GeometrySchema)),
  bbox: BboxSchema.optional(),
})

export const GeometrySchema: z.ZodType<Geometry> = z.union([
  BaseGeometrySchema,
  GeometryCollectionSchema,
])
