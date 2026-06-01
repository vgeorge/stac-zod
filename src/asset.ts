import { z } from 'zod'

export const AssetSchema = z.object({
  href: z.string().min(1),
  title: z.string().optional(),
  description: z.string().optional(),
  type: z.string().optional(),
  roles: z.array(z.string()).optional(),
})

export type Asset = z.infer<typeof AssetSchema>
