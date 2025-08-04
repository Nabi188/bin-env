// --- lib/envConfig.ts ---
import { z } from 'zod'

const envSchema = z.object({
  BASE_URL: z.string().min(1),
  PASSWORD: z.string().min(1),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(1),
  ENCRYPTION_KEY: z.string().min(1)
})

const env = {
  BASE_URL: process.env.BASE_URL,
  PASSWORD: process.env.PASSWORD,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY
}

const parsedEnv = envSchema.safeParse(env)

if (!parsedEnv.success) {
  const envError = parsedEnv.success === false ? parsedEnv.error.issues : []

  const errorMessages = [...envError]
    .map((i) => `${i.path.join('.')}:${i.message}`)
    .join(', ')

  throw new Error('ENV validation failed: ' + errorMessages)
}

export const envConfig = parsedEnv.data
