import "server-only"

import { importSPKI, jwtVerify } from "jose"

const permissions = new Set([
  "blockbusters.view",
  "blockbusters.write",
  "blockbusters.publish",
  "blockbusters.delete",
])

let verificationKey: ReturnType<typeof importSPKI> | undefined

async function getVerificationKey() {
  const pem = process.env.ADMIN_IDENTITY_PUBLIC_KEY?.trim().replace(/\\n/g, "\n")
  if (!pem) throw new Error("ADMIN_IDENTITY_PUBLIC_KEY is not configured.")
  verificationKey ??= importSPKI(pem, "RS256")
  return verificationKey
}

export async function verifyAdminIdentity(
  request: Request,
  requiredPermission: string,
  write: boolean,
) {
  const authorization = request.headers.get("authorization") ?? ""
  const match = /^Bearer ([^\s]+)$/.exec(authorization)
  if (!match) return { error: "A valid admin identity is required.", status: 401 as const }

  let payload
  try {
    const result = await jwtVerify(match[1], await getVerificationKey(), {
      algorithms: ["RS256"],
      issuer: "admin-2",
      audience: "blockbusters",
    })
    payload = result.payload
  } catch {
    return { error: "A valid admin identity is required.", status: 401 as const }
  }

  const now = Math.floor(Date.now() / 1000)
  const issuedAt = payload.iat
  if (
    typeof payload.sub !== "string" ||
    !payload.sub.includes("@") ||
    typeof payload.jti !== "string" ||
    !/^[0-9a-f-]{36}$/i.test(payload.jti) ||
    typeof issuedAt !== "number" ||
    typeof payload.exp !== "number" ||
    payload.exp - issuedAt > 60 ||
    issuedAt > now + 5
  ) {
    return { error: "A valid admin identity is required.", status: 401 as const }
  }

  const claimedPermissions = Array.isArray(payload.permissions)
    ? payload.permissions.filter((value): value is string => typeof value === "string")
    : []
  if (
    claimedPermissions.some((permission) => !permissions.has(permission) && permission !== "*") ||
    (!claimedPermissions.includes("*") && !claimedPermissions.includes(requiredPermission))
  ) {
    return { error: "Missing required permission.", status: 403 as const }
  }

  let reason: string | null = null
  let requestId: string | null = null
  if (write) {
    requestId = request.headers.get("x-admin-request-id")
    reason = request.headers.get("x-admin-audit-reason")?.trim() ?? null
    if (
      !requestId ||
      requestId !== payload.jti ||
      !/^[0-9a-f-]{36}$/i.test(requestId) ||
      !reason ||
      reason.length > 1000
    ) {
      return { error: "A valid audit reason and request ID are required.", status: 400 as const }
    }
  }

  return {
    identity: { subject: payload.sub, requestId, reason },
  }
}
