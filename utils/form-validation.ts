// Email validation regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

// Password validation regex (min 8 chars, at least 1 uppercase, 1 lowercase, 1 number)
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/

export function validateEmail(email: string): { valid: boolean; message?: string } {
  if (!email) {
    return { valid: false, message: "Email is required" }
  }

  if (!EMAIL_REGEX.test(email)) {
    return { valid: false, message: "Please enter a valid email address" }
  }

  return { valid: true }
}

export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (!password) {
    return { valid: false, message: "Password is required" }
  }

  if (!PASSWORD_REGEX.test(password)) {
    return {
      valid: false,
      message: "Password must be at least 8 characters and include uppercase, lowercase, and numbers",
    }
  }

  return { valid: true }
}

export function validatePasswordMatch(password: string, confirmPassword: string): { valid: boolean; message?: string } {
  if (password !== confirmPassword) {
    return { valid: false, message: "Passwords do not match" }
  }

  return { valid: true }
}

export function validateName(name: string): { valid: boolean; message?: string } {
  if (!name) {
    return { valid: false, message: "Name is required" }
  }

  if (name.length < 2) {
    return { valid: false, message: "Name must be at least 2 characters" }
  }

  return { valid: true }
}

export function validateBio(bio: string | undefined): { valid: boolean; message?: string } {
  if (bio && bio.length > 500) {
    return { valid: false, message: "Bio must be less than 500 characters" }
  }

  return { valid: true }
}

export function validateTimeFormat(time: string | undefined): { valid: boolean; message?: string } {
  if (!time) {
    return { valid: true } // Optional field
  }

  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/
  if (!timeRegex.test(time)) {
    return { valid: false, message: "Time must be in 24-hour format (HH:MM)" }
  }

  return { valid: true }
}
