import CryptoJS from 'crypto-js'
import { envConfig } from './envConfig'

export function encrypt(content: string): string {
  try {
    const encrypted = CryptoJS.AES.encrypt(content, envConfig.ENCRYPTION_KEY).toString()
    return encrypted
  } catch {
    throw new Error('Failed to encrypt content')
  }
}

export function decrypt(encryptedContent: string): string {
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedContent, envConfig.ENCRYPTION_KEY)
    const originalContent = decrypted.toString(CryptoJS.enc.Utf8)
    
    if (!originalContent) {
      throw new Error('Failed to decrypt content - invalid encrypted data')
    }
    
    return originalContent
  } catch {
    throw new Error('Failed to decrypt content')
  }
}