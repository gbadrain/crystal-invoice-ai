/**
 * Password strength rules — shared between client (signup/reset forms)
 * and server (register + reset API routes).
 *
 * Keeping the logic in one place guarantees the client UI and the server
 * gate always enforce identical requirements.
 */

export interface PasswordChecks {
  minLength: boolean    // ≥ 8 characters
  hasUppercase: boolean // A-Z
  hasLowercase: boolean // a-z
  hasNumber: boolean    // 0-9
  hasSymbol: boolean    // any non-alphanumeric
}

export interface PasswordStrength {
  checks: PasswordChecks
  /** Number of checks that pass (0–5). */
  score: number
  /** true only when every check passes. */
  isValid: boolean
}

/** Human-readable labels for each rule — used in the UI checklist. */
export const PASSWORD_RULES: { key: keyof PasswordChecks; label: string }[] = [
  { key: 'minLength',    label: 'At least 8 characters' },
  { key: 'hasUppercase', label: 'One uppercase letter (A–Z)' },
  { key: 'hasLowercase', label: 'One lowercase letter (a–z)' },
  { key: 'hasNumber',    label: 'One number (0–9)' },
  { key: 'hasSymbol',    label: 'One symbol (!, @, #, …)' },
]

export function checkPassword(password: string): PasswordStrength {
  const checks: PasswordChecks = {
    minLength:    password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber:    /[0-9]/.test(password),
    hasSymbol:    /[^A-Za-z0-9]/.test(password),
  }
  const score = Object.values(checks).filter(Boolean).length
  return { checks, score, isValid: score === 5 }
}
