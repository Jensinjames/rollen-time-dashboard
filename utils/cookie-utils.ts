// Cookie utility functions

type CookieOptions = {
  maxAge?: number
  expires?: Date
  path?: string
  domain?: string
  secure?: boolean
  sameSite?: "strict" | "lax" | "none"
}

/**
 * Set a cookie with the given name, value, and options
 */
export function setCookie(name: string, value: string, options: CookieOptions = {}) {
  // Default options
  const defaultOptions: CookieOptions = {
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  }

  // Merge options
  const cookieOptions = { ...defaultOptions, ...options }

  // Build cookie string
  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`

  // Add options to cookie string
  if (cookieOptions.maxAge) {
    cookieString += `; Max-Age=${cookieOptions.maxAge}`
  }

  if (cookieOptions.expires) {
    cookieString += `; Expires=${cookieOptions.expires.toUTCString()}`
  }

  if (cookieOptions.path) {
    cookieString += `; Path=${cookieOptions.path}`
  }

  if (cookieOptions.domain) {
    cookieString += `; Domain=${cookieOptions.domain}`
  }

  if (cookieOptions.secure) {
    cookieString += "; Secure"
  }

  if (cookieOptions.sameSite) {
    cookieString += `; SameSite=${cookieOptions.sameSite}`
  }

  // Set the cookie
  document.cookie = cookieString
}

/**
 * Get a cookie by name
 */
export function getCookie(name: string): string | null {
  const cookies = document.cookie.split(";")
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim()
    // Check if this cookie starts with the name we're looking for
    if (cookie.startsWith(`${encodeURIComponent(name)}=`)) {
      // Return the cookie value
      return decodeURIComponent(cookie.substring(name.length + 1))
    }
  }
  return null
}

/**
 * Delete a cookie by name
 */
export function deleteCookie(name: string, options: CookieOptions = {}) {
  // To delete a cookie, set its expiration date to the past
  setCookie(name, "", {
    ...options,
    expires: new Date(0),
  })
}

/**
 * Check if a cookie exists
 */
export function hasCookie(name: string): boolean {
  return getCookie(name) !== null
}
