/**
 * Check if a token is valid
 * In a real app, this would verify the token's signature, expiration, etc.
 * For this demo, we'll just check if it starts with "mock-token-"
 */
export function isTokenValid(token: string): boolean {
  // In a real app, you would verify the token's signature, expiration, etc.
  // For this demo, we'll just check if it starts with "mock-token-"
  return token.startsWith("mock-token-")
}

/**
 * Parse a JWT token
 * This is a simplified version that assumes the token is valid
 */
export function parseToken(token: string): any {
  try {
    // In a real app, you would verify the token before parsing it
    // For this demo, we'll just parse a mock token
    if (token.startsWith("mock-token-")) {
      return {
        sub: token.substring(11), // Remove "mock-token-" prefix to get the user ID
        exp: Math.floor(Date.now() / 1000) + 86400, // 24 hours from now
        iat: Math.floor(Date.now() / 1000),
      }
    }

    // For real JWT tokens
    const base64Url = token.split(".")[1]
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    )

    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error("Error parsing token:", error)
    return null
  }
}

/**
 * Check if a token is expired
 */
export function isTokenExpired(token: string): boolean {
  try {
    const payload = parseToken(token)
    if (!payload || !payload.exp) return true

    const now = Math.floor(Date.now() / 1000)
    return payload.exp < now
  } catch (error) {
    console.error("Error checking token expiration:", error)
    return true
  }
}
