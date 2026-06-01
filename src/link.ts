import { z } from 'zod'

export const LinkSchema = z.object({
  href: z.string().min(1),
  rel: z.string().min(1),
  type: z.string().optional(),
  title: z.string().optional(),
})

export type Link = z.infer<typeof LinkSchema>
