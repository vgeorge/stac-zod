import { z } from 'zod'

export const ProviderRoleSchema = z.enum(['producer', 'licensor', 'processor', 'host'])

export const ProviderSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  roles: z.array(ProviderRoleSchema).optional(),
  url: z.string().optional(),
})

export type ProviderRole = z.infer<typeof ProviderRoleSchema>
export type Provider = z.infer<typeof ProviderSchema>
