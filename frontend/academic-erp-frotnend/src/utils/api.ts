import axios from 'axios'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true,
  timeout: 10000,
})

// Separate client for non-API endpoints (OAuth)
export const oauthClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 10000,
})

export interface ErrorResponse {
  error?: string
  message?: string
  errors?: Record<string, string> | string
  suggestion?: string
  type?: string
}

export const getErrorMessage = (error: unknown): string => {
  try {
  if (axios.isAxiosError(error)) {
      // Handle different HTTP status codes
      if (error.response) {
        const status = error.response.status
        const data = error.response.data as ErrorResponse
        
        // Check for duplicate/unique constraint errors first (before generic database errors)
        if (data?.type && (data.type.includes('DUPLICATE') || data.type.includes('DATA_INTEGRITY'))) {
          return data?.error || data?.message || 'This record already exists. Please check your input.'
        }
        
        // Check for database-related errors
        if (data?.type && (data.type.includes('DATABASE') || data.type.includes('SQL'))) {
          // Check if it's actually a duplicate error disguised as database error
          const message = (data?.error || data?.message || '').toLowerCase()
          if (message.includes('email') && (message.includes('duplicate') || message.includes('unique') || message.includes('already exists'))) {
            return 'A student with this email address already exists. Please use a different email.'
          }
          // Use the error message directly - it's already user-friendly
          return data?.error || data?.message || 'Database error occurred. Please try again.'
        }
        
        // Extract error message from response
        const message = data?.message || data?.error || data?.errors || error.message
        
        // Provide user-friendly messages based on status
        switch (status) {
          case 400:
            // Handle validation errors first
            if (data?.errors && typeof data.errors === 'object') {
              const errorEntries = Object.entries(data.errors as Record<string, string>)
              if (errorEntries.length > 0) {
                // Format all field errors
                const formattedErrors = errorEntries.map(([field, errorMsg]) => {
                  const formattedField = field
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, str => str.toUpperCase())
                    .trim()
                  return `${formattedField}: ${errorMsg}`
                })
                // Return all errors, one per line
                return formattedErrors.join('\n')
              }
            }
            // Check for specific error types and provide user-friendly messages
            if (typeof message === 'string') {
              const lowerMessage = message.toLowerCase()
              if (lowerMessage.includes('student not found')) {
                return 'The requested student could not be found. Please check the student ID and try again.'
              }
              if (lowerMessage.includes('domain not found')) {
                return 'The requested domain could not be found. Please check the domain ID and try again.'
              }
              if (lowerMessage.includes('seat') || lowerMessage.includes('capacity') || lowerMessage.includes('exhausted')) {
                return 'This domain has reached its maximum capacity. No more students can be admitted at this time.'
              }
              if (lowerMessage.includes('photo') || lowerMessage.includes('image file')) {
                return 'Photo upload error. Please ensure you selected a valid image file (JPEG, PNG, GIF, or WebP).'
              }
              if (lowerMessage.includes('invalid degree') || lowerMessage.includes('degree type')) {
                return 'The program name must include a valid degree type (B.Tech, M.Tech, IM.Tech, M.Sc, or Ph.D). Examples: "Bachelor of Technology in CSE", "B.Tech CSE". Please update the program name.'
              }
              if (lowerMessage.includes('unknown department') || lowerMessage.includes('department')) {
                return 'The program name must include a recognized department (CSE, ECE, or AIDS). Examples: "Bachelor of Technology in CSE", "B.Tech ECE". Please update the program name.'
              }
              // Check if message is "Validation failed"
              if (lowerMessage.includes('validation failed')) {
                return 'Validation failed. Please check all fields and ensure they meet the requirements.'
              }
            }
            return typeof message === 'string' ? message : 'Invalid request. Please check your input.'
          case 401:
            return 'Authentication required. Please log in again.'
          case 403:
            return 'You do not have permission to perform this action.'
          case 404:
            // Provide more specific message based on error content
            if (typeof message === 'string') {
              const lowerMessage = message.toLowerCase()
              if (lowerMessage.includes('student')) {
                return 'The requested student could not be found. Please check the student ID and try again.'
              }
              if (lowerMessage.includes('domain')) {
                return 'The requested domain could not be found. Please check the domain ID and try again.'
              }
            }
            return 'The requested resource could not be found. Please check your input and try again.'
          case 409:
            // Check for specific duplicate errors
            if (data?.type === 'DUPLICATE_EMAIL' || 
                (typeof message === 'string' && message.toLowerCase().includes('email') && message.toLowerCase().includes('already exists'))) {
              return 'A student with this email address already exists. Please use a different email.'
            }
            if (data?.type === 'DUPLICATE_ROLL_NUMBER' || 
                (typeof message === 'string' && message.toLowerCase().includes('roll') && message.toLowerCase().includes('already exists'))) {
              return 'A student with this roll number already exists. Please contact the administrator.'
            }
            return typeof message === 'string' ? message : 'This record already exists. Please check your input.'
          case 422:
            // Handle validation errors with field-specific messages
            if (data?.errors && typeof data.errors === 'object') {
              // Multiple field errors - return first one with field name
              const errorEntries = Object.entries(data.errors as Record<string, string>)
              if (errorEntries.length > 0) {
                const [field, errorMsg] = errorEntries[0]
                // Format field name to be more readable
                const formattedField = field
                  .replace(/([A-Z])/g, ' $1')
                  .replace(/^./, str => str.toUpperCase())
                  .trim()
                return `${formattedField}: ${errorMsg}`
              }
            }
            return typeof message === 'string' ? message : 'Validation error. Please check your input and ensure all required fields are filled correctly.'
          case 500:
            // Check if it's a database error even if type is not set
            if (typeof message === 'string' && 
                (message.toLowerCase().includes("database") || 
                 message.toLowerCase().includes("table") ||
                 message.toLowerCase().includes("sql"))) {
              return message + ' The system is attempting to fix this automatically. Please refresh the page in a moment.'
            }
            return typeof message === 'string' ? message : 'Server error. Please try again later.'
          case 502:
            return 'Service temporarily unavailable. Please try again later.'
          case 503:
            return 'Service unavailable. Please try again later.'
          default:
            // For unknown status codes, try to provide a user-friendly message
            if (typeof message === 'string' && message.trim() !== '') {
              return message
            }
            return `An error occurred (${status}). Please try again or contact support if the issue persists.`
        }
      }
      
      // Network error
      if (error.request) {
        return 'Network error. Please check your connection and try again.'
      }
      
      return error.message || 'An unexpected error occurred.'
    }
    
    if (error instanceof Error) {
      return error.message
    }
    
    return 'An unexpected error occurred. Please try again.'
  } catch {
    return 'An unexpected error occurred. Please try again.'
  }
}


export const endpoints = {
  login: '/login',
  signout: '/signout',
  currentUser: '/auth/me',
  domains: '/domains',
  domainById: (id: number) => `/domains/${id}`,
  domainImpact: (id: number) => `/domains/${id}/impact`,
  domainDeleteImpact: (id: number) => `/domains/${id}/delete-impact`,
  studentsByDomain: (id: number) => `/students/domain/${id}`,
  admitStudent: '/students/admit',
  students: '/students',
  studentById: (id: number) => `/students/${id}`,
  initDatabase: '/database/init',
}

