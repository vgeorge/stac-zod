import { z } from 'zod'

const Position = z.array(z.number()).min(2)

export const PointSchema = z.object({
  type: z.literal('Point'),
  coordinates: Position,
  bbox: z.array(z.number()).min(4).optional(),
})

export const LineStringSchema = z.object({
  type: z.literal('LineString'),
  coordinates: z.array(Position).min(2),
  bbox: z.array(z.number()).min(4).optional(),
})

export const PolygonSchema = z.object({
  type: z.literal('Polygon'),
  coordinates: z.array(z.array(Position).min(4)),
  bbox: z.array(z.number()).min(4).optional(),
})

export const MultiPointSchema = z.object({
  type: z.literal('MultiPoint'),
  coordinates: z.array(Position),
  bbox: z.array(z.number()).min(4).optional(),
})

export const MultiLineStringSchema = z.object({
  type: z.literal('MultiLineString'),
  coordinates: z.array(z.array(Position).min(2)),
  bbox: z.array(z.number()).min(4).optional(),
})

export const MultiPolygonSchema = z.object({
  type: z.literal('MultiPolygon'),
  coordinates: z.array(z.array(z.array(Position).min(4))),
  bbox: z.array(z.number()).min(4).optional(),
})

export type Point = z.infer<typeof PointSchema>
export type LineString = z.infer<typeof LineStringSchema>
export type Polygon = z.infer<typeof PolygonSchema>
export type MultiPoint = z.infer<typeof MultiPointSchema>
export type MultiLineString = z.infer<typeof MultiLineStringSchema>
export type MultiPolygon = z.infer<typeof MultiPolygonSchema>

// Forward reference required for GeometryCollection (self-referential)
const BaseGeometrySchema = z.discriminatedUnion('type', [
  PointSchema,
  LineStringSchema,
  PolygonSchema,
  MultiPointSchema,
  MultiLineStringSchema,
  MultiPolygonSchema,
])

export const GeometryCollectionSchema = z.object({
  type: z.literal('GeometryCollection'),
  geometries: z.array(BaseGeometrySchema),
  bbox: z.array(z.number()).min(4).optional(),
})

export const GeometrySchema = z.union([BaseGeometrySchema, GeometryCollectionSchema])

export type Geometry = z.infer<typeof GeometrySchema>
export type GeometryCollection = z.infer<typeof GeometryCollectionSchema>
