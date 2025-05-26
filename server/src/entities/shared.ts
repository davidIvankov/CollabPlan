import { z } from 'zod'

export const idSchema = z.string().uuid()
export const stringSchema = z.string().min(1).max(1000)
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

export const emailSchema = z.string().trim().toLowerCase().email()

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .max(64, 'Password must be at most 64 characters long')

export const passwordResetSchema = z.object({
  token: z.string(),
  password: passwordSchema,
})
