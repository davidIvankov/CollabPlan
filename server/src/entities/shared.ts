import { z } from 'zod'

export const idSchema = z.string().uuid()
export const stringSchema = z.string().min(1).max(300)
export const availabilitySlotSchema = z.object({
  start: z.string().datetime(),
  end: z.string().datetime(),
})
export type Slot = { start: string; end: string }
export const messageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
})

export const vector = z
  .array(z.number())
  .length(512, { message: 'Vector must have exactly 512 dimensions' })
  .nullable()
