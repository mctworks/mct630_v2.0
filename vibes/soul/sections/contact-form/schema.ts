import { z } from 'zod'

export const schema = z.object({
  email: z.string().email('Please enter a valid email.'),
  message: z.string().min(10, 'Message must be at least 10 characters.'),
  _trap: z.string().max(0, '').optional(),
})