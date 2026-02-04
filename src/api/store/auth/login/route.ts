/**
 * Unified Customer Login API Route
 * Handles both WordPress migrated customers and standard Medusa customers
 *
 * POST /store/auth/login
 * Body: { email: string, password: string }
 * Returns: { token: string, customer: {...} } on success
 *
 * This endpoint:
 * 1. First checks if customer was migrated from WordPress
 * 2. If yes, verifies against WordPress password hash
 * 3. If WordPress auth succeeds, rehashes password to bcrypt
 * 4. Falls back to standard Medusa auth if not a WP customer
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { verifyWordPressPassword, hashPassword } from "../../../../utils/wordpress-password"
import * as jwt from "jsonwebtoken"

interface LoginRequest {
  email: string
  password: string
}

export async function POST(
  req: MedusaRequest<LoginRequest>,
  res: MedusaResponse
) {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required",
    })
  }

  const normalizedEmail = email.toLowerCase().trim()

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pgConnection = req.scope.resolve("pgConnection") as any

    // Step 1: Find the customer by email
    const customerResult = await pgConnection.raw(
      `SELECT id, email, first_name, last_name, has_account, metadata
       FROM customer
       WHERE LOWER(email) = ?`,
      [normalizedEmail]
    )

    if (!customerResult.rows || customerResult.rows.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password",
      })
    }

    const customer = customerResult.rows[0]

    // Step 2: Check for WordPress password hash
    const wpAuthResult = await pgConnection.raw(
      `SELECT wp_password_hash, hash_migrated
       FROM wp_customer_auth
       WHERE customer_id = ?`,
      [customer.id]
    )

    const wpAuth = wpAuthResult.rows?.[0]
    let authenticated = false
    let passwordMigrated = false

    if (wpAuth && !wpAuth.hash_migrated) {
      // WordPress customer - verify against WP hash
      authenticated = verifyWordPressPassword(password, wpAuth.wp_password_hash)

      if (authenticated) {
        // Migrate password to bcrypt
        const newPasswordHash = hashPassword(password)
        await migratePassword(pgConnection, customer.id, newPasswordHash)
        await pgConnection.raw(
          `UPDATE wp_customer_auth SET hash_migrated = true, updated_at = NOW() WHERE customer_id = ?`,
          [customer.id]
        )
        passwordMigrated = true
      }
    }

    // Step 3: If not WordPress auth or WP auth failed, try standard Medusa auth
    if (!authenticated) {
      const authResult = await pgConnection.raw(
        `SELECT pi.provider_metadata
         FROM provider_identity pi
         JOIN auth_identity ai ON pi.auth_identity_id = ai.id
         WHERE pi.entity_id = ? AND pi.provider = 'emailpass'`,
        [customer.id]
      )

      if (authResult.rows?.length > 0) {
        const providerMetadata = authResult.rows[0].provider_metadata
        if (providerMetadata?.password) {
          const bcrypt = await import("bcryptjs")
          authenticated = bcrypt.compareSync(password, providerMetadata.password)
        }
      }
    }

    if (!authenticated) {
      return res.status(401).json({
        message: "Invalid email or password",
      })
    }

    // Step 4: Get or create auth identity for token generation
    let authIdentityId = await getOrCreateAuthIdentity(pgConnection, customer.id, password)

    // Step 5: Generate JWT token
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const configModule = req.scope.resolve("configModule") as any
    const jwtSecret = configModule.projectConfig?.http?.jwtSecret || "supersecret"

    const token = jwt.sign(
      {
        actor_id: customer.id,
        actor_type: "customer",
        auth_identity_id: authIdentityId,
      },
      jwtSecret,
      { expiresIn: "7d" }
    )

    return res.status(200).json({
      token,
      customer: {
        id: customer.id,
        email: customer.email,
        first_name: customer.first_name,
        last_name: customer.last_name,
      },
      ...(passwordMigrated && {
        message: "Your account has been upgraded to our new system.",
      }),
    })

  } catch (error) {
    console.error("Login error:", error)
    return res.status(500).json({
      message: "Authentication failed",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}

/**
 * Migrate WordPress password to Medusa auth system
 */
async function migratePassword(
  pgConnection: any,
  customerId: string,
  passwordHash: string
): Promise<void> {
  // Check if auth identity exists
  const existingAuth = await pgConnection.raw(
    `SELECT ai.id as auth_identity_id, pi.id as provider_identity_id
     FROM auth_identity ai
     JOIN provider_identity pi ON pi.auth_identity_id = ai.id
     WHERE pi.entity_id = ? AND pi.provider = 'emailpass'`,
    [customerId]
  )

  if (existingAuth.rows?.length > 0) {
    // Update existing provider identity
    await pgConnection.raw(
      `UPDATE provider_identity
       SET provider_metadata = jsonb_set(
         COALESCE(provider_metadata, '{}')::jsonb,
         '{password}',
         to_jsonb(?::text)
       ),
       updated_at = NOW()
       WHERE id = ?`,
      [passwordHash, existingAuth.rows[0].provider_identity_id]
    )
  } else {
    // Create new auth identity and provider identity
    const authIdentityId = `authid_${generateId()}`
    const providerIdentityId = `provid_${generateId()}`

    await pgConnection.raw(
      `INSERT INTO auth_identity (id, created_at, updated_at)
       VALUES (?, NOW(), NOW())`,
      [authIdentityId]
    )

    await pgConnection.raw(
      `INSERT INTO provider_identity (id, entity_id, provider, auth_identity_id, provider_metadata, created_at, updated_at)
       VALUES (?, ?, 'emailpass', ?, ?::jsonb, NOW(), NOW())`,
      [
        providerIdentityId,
        customerId,
        authIdentityId,
        JSON.stringify({ password: passwordHash }),
      ]
    )
  }
}

/**
 * Get or create auth identity for a customer
 */
async function getOrCreateAuthIdentity(
  pgConnection: any,
  customerId: string,
  password: string
): Promise<string> {
  const existingAuth = await pgConnection.raw(
    `SELECT ai.id
     FROM auth_identity ai
     JOIN provider_identity pi ON pi.auth_identity_id = ai.id
     WHERE pi.entity_id = ? AND pi.provider = 'emailpass'`,
    [customerId]
  )

  if (existingAuth.rows?.length > 0) {
    return existingAuth.rows[0].id
  }

  // Create new auth identity
  const authIdentityId = `authid_${generateId()}`
  const providerIdentityId = `provid_${generateId()}`
  const bcrypt = await import("bcryptjs")
  const passwordHash = bcrypt.hashSync(password, 10)

  await pgConnection.raw(
    `INSERT INTO auth_identity (id, created_at, updated_at)
     VALUES (?, NOW(), NOW())`,
    [authIdentityId]
  )

  await pgConnection.raw(
    `INSERT INTO provider_identity (id, entity_id, provider, auth_identity_id, provider_metadata, created_at, updated_at)
     VALUES (?, ?, 'emailpass', ?, ?::jsonb, NOW(), NOW())`,
    [
      providerIdentityId,
      customerId,
      authIdentityId,
      JSON.stringify({ password: passwordHash }),
    ]
  )

  return authIdentityId
}

/**
 * Generate a random ID string
 */
function generateId(): string {
  const chars = "0123456789abcdefghijklmnopqrstuvwxyz"
  let id = ""
  for (let i = 0; i < 26; i++) {
    id += chars[Math.floor(Math.random() * chars.length)]
  }
  return id
}
