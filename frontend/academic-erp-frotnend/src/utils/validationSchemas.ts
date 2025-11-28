import * as Yup from 'yup'

/**
 * Validation schemas using Yup for Formik forms
 */

/**
 * Student admission/update form validation schema
 */
export const studentFormSchema = Yup.object().shape({
  firstName: Yup.string()
    .trim()
    .required('First name is required')
    .min(1, 'First name cannot be empty'),
  lastName: Yup.string()
    .trim()
    .required('Last name is required')
    .min(1, 'Last name cannot be empty'),
  email: Yup.string()
    .trim()
    .required('Email is required')
    .email('Please enter a valid email address'),
  domainId: Yup.string()
    .required('Domain is required'),
  joinYear: Yup.string()
    .required('Join year is required')
    .matches(/^\d{4}$/, 'Join year must be 4 digits')
    .test('year-range', 'Join year must be between 2021 and 2026', (value) => {
      if (!value) return false
      const year = parseInt(value, 10)
      return year >= 2021 && year <= 2026
    }),
  examMarks: Yup.number()
    .required('Exam marks is required')
    .min(0, 'Exam marks must be greater than or equal to 0')
    .max(100, 'Exam marks must be less than or equal to 100'),
})

/**
 * Domain form validation schema
 */
export const domainFormSchema = Yup.object().shape({
  program: Yup.string()
    .trim()
    .required('Program is required')
    .min(1, 'Program cannot be empty'),
  batch: Yup.string()
    .trim()
    .required('Batch is required')
    .matches(/^(202[0-6])$/, 'Batch must be between 2020 and 2026')
    .test('year-range', 'Batch must be between 2020 and 2026', (value) => {
      if (!value) return false
      const year = parseInt(value, 10)
      return year >= 2020 && year <= 2026
    }),
  capacity: Yup.number()
    .required('Capacity is required')
    .integer('Capacity must be a whole number')
    .min(0, 'Capacity must be at least 0')
    .max(150, 'Capacity must be at most 150'),
  examName: Yup.string()
    .trim()
    .required('Exam name is required')
    .min(1, 'Exam name cannot be empty'),
  cutoffMarks: Yup.number()
    .required('Cutoff marks is required')
    .min(0, 'Cutoff marks must be at least 0')
    .max(100, 'Cutoff marks must be at most 100')
    .transform((value, originalValue) => {
      // Transform empty string to undefined for validation
      if (originalValue === '' || originalValue === null || originalValue === undefined) {
        return undefined
      }
      return value
    })
    .test('required', 'Cutoff marks is required', (value) => {
      return value !== undefined && value !== null
    }),
})

/**
 * Helper function to format join year for database
 */
export const formatJoinYearForDB = (value: string | number): number => {
  return typeof value === 'string' ? parseInt(value, 10) : value
}

/**
 * Helper function to format cutoff marks for database
 */
export const formatCutoffMarksForDB = (value: string | number | undefined | null): number | undefined => {
  if (!value || value === '') {
    return undefined
  }
  const numValue = typeof value === 'string' ? parseFloat(value) : value
  return isNaN(numValue) ? undefined : numValue
}

