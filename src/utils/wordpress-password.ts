/**
 * WordPress Password Verification Utilities
 * Handles both legacy phpass ($P$) and modern bcrypt ($wp$2y$) hashes
 */

import * as bcrypt from "bcryptjs"
import * as crypto from "crypto"

// phpass itoa64 alphabet
const ITOA64 = "./0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"

/**
 * Encode bytes to phpass base64 format
 */
function encode64(input: Buffer, count: number): string {
  let output = ""
  let i = 0

  while (i < count) {
    let value = input[i++]
    output += ITOA64[value & 0x3f]

    if (i < count) {
      value |= input[i] << 8
    }
    output += ITOA64[(value >> 6) & 0x3f]

    if (i++ >= count) break

    if (i < count) {
      value |= input[i] << 16
    }
    output += ITOA64[(value >> 12) & 0x3f]

    if (i++ >= count) break

    output += ITOA64[(value >> 18) & 0x3f]
  }

  return output
}

/**
 * Verify password against phpass hash ($P$ or $H$)
 */
function verifyPhpass(password: string, storedHash: string): boolean {
  const hash = storedHash.replace(/\\/g, "")

  if (hash.length < 12) return false

  const id = hash.substring(0, 3)
  if (id !== "$P$" && id !== "$H$") return false

  const countLog2 = ITOA64.indexOf(hash[3])
  if (countLog2 < 7 || countLog2 > 30) return false

  const count = 1 << countLog2
  const salt = hash.substring(4, 12)

  let checkHash = crypto.createHash("md5").update(salt + password).digest()

  for (let i = 0; i < count; i++) {
    checkHash = crypto
      .createHash("md5")
      .update(Buffer.concat([checkHash, Buffer.from(password)]))
      .digest()
  }

  const encoded = encode64(checkHash, 16)
  const expectedHash = "$P$" + hash[3] + salt + encoded

  return hash === expectedHash || hash.replace("$H$", "$P$") === expectedHash
}

/**
 * Verify password against WordPress bcrypt hash ($wp$2y$)
 */
function verifyWpBcrypt(password: string, storedHash: string): boolean {
  let hash = storedHash.replace(/\\/g, "")

  // Convert WordPress bcrypt prefix to standard bcrypt
  if (hash.startsWith("$wp$2y$")) {
    hash = hash.replace("$wp$2y$", "$2a$")
  } else if (hash.startsWith("$wp$2a$")) {
    hash = hash.replace("$wp$2a$", "$2a$")
  }

  try {
    return bcrypt.compareSync(password, hash)
  } catch {
    return false
  }
}

/**
 * Verify a password against a WordPress password hash
 * Automatically detects hash type and uses appropriate verification
 */
export function verifyWordPressPassword(
  password: string,
  storedHash: string
): boolean {
  if (!password || !storedHash) return false

  // Clean escape characters that might be in database
  const cleanHash = storedHash.replace(/\\'/g, "'").replace(/\\\\/g, "\\")

  // Detect hash type
  if (cleanHash.startsWith("$P$") || cleanHash.startsWith("$H$")) {
    return verifyPhpass(password, cleanHash)
  } else if (
    cleanHash.startsWith("$wp$2y$") ||
    cleanHash.startsWith("$wp$2a$")
  ) {
    return verifyWpBcrypt(password, cleanHash)
  } else if (cleanHash.startsWith("$2y$") || cleanHash.startsWith("$2a$")) {
    // Standard bcrypt
    try {
      return bcrypt.compareSync(password, cleanHash)
    } catch {
      return false
    }
  }

  return false
}

/**
 * Hash a password using bcrypt (for rehashing after successful login)
 */
export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10)
}

/**
 * Check if a hash is a legacy WordPress format that should be rehashed
 */
export function isWordPressHash(hash: string): boolean {
  const cleanHash = hash.replace(/\\'/g, "'").replace(/\\\\/g, "\\")
  return (
    cleanHash.startsWith("$P$") ||
    cleanHash.startsWith("$H$") ||
    cleanHash.startsWith("$wp$")
  )
}
