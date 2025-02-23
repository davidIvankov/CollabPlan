import { z } from 'zod'

export const idSchema = z.string().uuid()
export const stringSchema = z.string().min(1).max(300)
export const availabilitySlotSchema = z.object({
  start: z.string().datetime(),
  end: z.string().datetime(),
})
