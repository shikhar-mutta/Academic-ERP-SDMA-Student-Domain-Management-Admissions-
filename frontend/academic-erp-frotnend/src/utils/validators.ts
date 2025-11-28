/**
 * Validation utilities for form fields
 */

/**
 * Validates that a string is not empty
 */
export const validateNotEmpty = (value: string | undefined | null, fieldName: string): string => {
  if (!value || value.trim() === '') {
    return `${fieldName} is required`
  }
  return ''
}

/**
 * Validates first name - must not be empty
 */
export const validateFirstName = (value: string | undefined | null): string => {
  return validateNotEmpty(value, 'First name')
}

/**
 * Validates last name - must not be empty
 */
export const validateLastName = (value: string | undefined | null): string => {
  return validateNotEmpty(value, 'Last name')
}

/**
 * Validates email format using regex
 */
export const validateEmail = (value: string | undefined | null): string => {
  if (!value || value.trim() === '') {
    return 'Email is required'
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(value.trim())) {
    return 'Please enter a valid email address'
  }

  return ''
}

/**
 * Validates join year - must be between 2020 and 2025
 * Accepts string input but validates as number
 */
export const validateJoinYear = (value: string | number | undefined | null): string => {
  if (!value || value === '') {
    return 'Join year is required'
  }

  const numValue = typeof value === 'string' ? parseInt(value, 10) : value

  if (isNaN(numValue)) {
    return 'Join year must be a valid number'
  }

  if (numValue < 2020 || numValue > 2025) {
    return 'Join year must be between 2020 and 2025'
  }

  return ''
}

/**
 * Validates exam marks to be between 0 and 100 (inclusive)
 */
export const validateExamMarks = (value: number | string | undefined | null): string => {
  if (value === undefined || value === null || value === '') {
    return 'Exam marks is required'
  }

  const numValue = typeof value === 'string' ? parseFloat(value) : value

  if (isNaN(numValue)) {
    return 'Exam marks must be a valid number'
  }

  if (numValue < 0) {
    return 'Exam marks must be greater than or equal to 0'
  }

  if (numValue > 100) {
    return 'Exam marks must be less than or equal to 100'
  }

  return ''
}

/**
 * Validates program name - must not be empty
 */
export const validateProgram = (value: string | undefined | null): string => {
  return validateNotEmpty(value, 'Program')
}

/**
 * Validates capacity - must be between 0 and 150 (inclusive)
 */
export const validateCapacity = (value: number | string | undefined | null): string => {
  if (value === undefined || value === null || value === '') {
    return 'Capacity is required'
  }

  const numValue = typeof value === 'string' ? parseInt(value, 10) : value

  if (isNaN(numValue)) {
    return 'Capacity must be a valid number'
  }

  if (numValue < 0) {
    return 'Capacity must be at least 0'
  }

  if (numValue > 150) {
    return 'Capacity must be at most 150'
  }

  return ''
}

/**
 * Validates cutoff marks - must be between 0 and 100 (inclusive) if provided
 * Accepts string input but validates as number
 */
export const validateCutoffMarks = (value: number | string | undefined | null): string => {
  // Cutoff marks is optional, so empty is valid
  if (!value || value === '') {
    return ''
  }

  const numValue = typeof value === 'string' ? parseFloat(value) : value

  if (isNaN(numValue)) {
    return 'Cutoff marks must be a valid number'
  }

  if (numValue < 0) {
    return 'Cutoff marks must be at least 0'
  }

  if (numValue > 100) {
    return 'Cutoff marks must be at most 100'
  }

  return ''
}

/**
 * Helper to format join year for database (convert string to number)
 */
export const formatJoinYearForDB = (value: string | number): number => {
  return typeof value === 'string' ? parseInt(value, 10) : value
}

/**
 * Helper to format cutoff marks for database (convert string to number/undefined)
 */
export const formatCutoffMarksForDB = (value: string | number | undefined | null): number | undefined => {
  if (!value || value === '') {
    return undefined
  }
  const numValue = typeof value === 'string' ? parseFloat(value) : value
  return isNaN(numValue) ? undefined : numValue
}

