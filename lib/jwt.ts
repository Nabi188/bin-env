import { SignJWT, jwtVerify } from 'jose'
import { envConfig } from './envConfig'

const secret = new TextEncoder().encode(envConfig.JWT_SECRET)
const JWT_PAYLOAD = { userId: 'Bin siêu đẹp trai' }

export async function createToken(): Promise<string> {
  return await new SignJWT(JWT_PAYLOAD)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .sign(secret)
}

export async function verifyToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, secret)
    return true
  } catch {
    return false
  }
}
