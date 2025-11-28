import { useEffect, useState, useCallback } from 'react'
import { useFormik } from 'formik'
import { apiClient, endpoints, getErrorMessage } from '../utils/api'
import { studentFormSchema, formatJoinYearForDB } from '../utils/validationSchemas'
import type { Student, Domain, StudentResponse } from '../models'

interface StudentFormValues {
  firstName: string
  lastName: string
  email: string
  domainId: string
  joinYear: string
  examMarks: number
}

interface AddEditStudentModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  student?: Student | null
  defaultDomainId?: string | number
}

const AddEditStudentModal = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  student,
  defaultDomainId 
}: AddEditStudentModalProps) => {
  const [domains, setDomains] = useState<Domain[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isEditMode = !!student

  const formik = useFormik<StudentFormValues>({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      domainId: defaultDomainId?.toString() || '',
      joinYear: '2026',
      examMarks: 0,
    },
    validationSchema: studentFormSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      setLoading(true)
      setError('')

      try {
        if (isEditMode && student) {
          // Include studentId in the payload for updates
          const payload = {
            studentId: student.studentId,
            firstName: values.firstName.trim(),
            lastName: values.lastName.trim(),
            email: values.email.trim(),
            domainId: Number(values.domainId),
            joinYear: formatJoinYearForDB(values.joinYear),
            examMarks: values.examMarks || 0,
          }
          await apiClient.patch<StudentResponse>(
            endpoints.studentById(student.studentId),
            payload,
          )
        } else {
          // For new students, don't include studentId
          const payload = {
            firstName: values.firstName.trim(),
            lastName: values.lastName.trim(),
            email: values.email.trim(),
            domainId: Number(values.domainId),
            joinYear: formatJoinYearForDB(values.joinYear),
            examMarks: values.examMarks || 0,
          }
          await apiClient.post<StudentResponse>(
            endpoints.admitStudent,
            payload,
          )
        }

        onSuccess()
        onClose()
        formik.resetForm()
      } catch (err) {
        setError(getErrorMessage(err))
      } finally {
        setLoading(false)
      }
    },
  })

  useEffect(() => {
    if (isOpen) {
      if (student) {
        // When editing, use defaultDomainId since Student interface doesn't include domainId
        formik.setValues({
          firstName: student.firstName,
          lastName: student.lastName,
          email: student.email,
          domainId: defaultDomainId?.toString() || '',
          joinYear: student.joinYear.toString(),
          examMarks: student.examMarks,
        })
      } else {
        formik.setValues({
          firstName: '',
          lastName: '',
          email: '',
          domainId: defaultDomainId?.toString() || '',
          joinYear: '2026',
          examMarks: 0,
        })
      }
      loadDomains()
      setError('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, student, defaultDomainId])

  const loadDomains = async () => {
    try {
      const { data } = await apiClient.get<Domain[]>(endpoints.domains)
      setDomains(data)
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  // Handle close with form reset
  const handleClose = useCallback(() => {
    formik.resetForm()
    setError('')
    onClose()
  }, [formik, onClose])

  // Handle ESC key press to close modal
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        handleClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey)
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [isOpen, handleClose])

  if (!isOpen) return null

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only close if clicking directly on the backdrop, not on the modal content
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-slate-900">
            {isEditMode ? 'Edit Student' : 'Add New Student'}
          </h2>
          <button
            onClick={handleClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={formik.handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="rounded-xl border-2 border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800 whitespace-pre-line">
              {error}
            </div>
          )}

          <div className="grid gap-6 sm:grid-cols-2">
            <label className="text-sm font-semibold text-slate-700">
              First Name *
              <input
                type="text"
                name="firstName"
                value={formik.values.firstName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`mt-2 w-full rounded-xl border-2 px-4 py-3 text-base text-slate-900 transition-all duration-200 focus:outline-none focus:ring-4 ${
                  formik.touched.firstName && formik.errors.firstName
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-200/50'
                    : 'border-slate-200 bg-white focus:border-brand-500 focus:ring-brand-200/50'
                }`}
                placeholder="Jane"
              />
              {formik.touched.firstName && formik.errors.firstName && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.firstName}</p>
              )}
            </label>

            <label className="text-sm font-semibold text-slate-700">
              Last Name *
              <input
                type="text"
                name="lastName"
                value={formik.values.lastName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`mt-2 w-full rounded-xl border-2 px-4 py-3 text-base text-slate-900 transition-all duration-200 focus:outline-none focus:ring-4 ${
                  formik.touched.lastName && formik.errors.lastName
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-200/50'
                    : 'border-slate-200 bg-white focus:border-brand-500 focus:ring-brand-200/50'
                }`}
                placeholder="Doe"
              />
              {formik.touched.lastName && formik.errors.lastName && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.lastName}</p>
              )}
            </label>
          </div>

          <label className="text-sm font-semibold text-slate-700">
            Email *
            <input
              type="email"
              name="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`mt-2 w-full rounded-xl border-2 px-4 py-3 text-base text-slate-900 transition-all duration-200 focus:outline-none focus:ring-4 ${
                formik.touched.email && formik.errors.email
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-200/50'
                  : 'border-slate-200 bg-white focus:border-brand-500 focus:ring-brand-200/50'
              }`}
              placeholder="student@university.edu"
            />
            {formik.touched.email && formik.errors.email && (
              <p className="mt-1 text-sm text-red-600">{formik.errors.email}</p>
            )}
          </label>

          <div className="grid gap-6 sm:grid-cols-2">
            <label className="text-sm font-semibold text-slate-700">
              Domain *
              <select
                name="domainId"
                value={formik.values.domainId}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={!!defaultDomainId}
                className={`mt-2 w-full rounded-xl border-2 px-4 py-3 text-base text-slate-900 transition-all duration-200 focus:outline-none focus:ring-4 ${
                  formik.touched.domainId && formik.errors.domainId
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-200/50'
                    : 'border-slate-200 bg-white focus:border-brand-500 focus:ring-brand-200/50'
                } ${defaultDomainId ? 'bg-slate-50 cursor-not-allowed' : ''}`}
              >
                <option value="" disabled>Select a domain</option>
                {domains.map((domain) => (
                  <option key={domain.domainId} value={domain.domainId}>
                    {domain.program}
                  </option>
                ))}
              </select>
              {formik.touched.domainId && formik.errors.domainId && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.domainId}</p>
              )}
            </label>

            <label className="text-sm font-semibold text-slate-700">
              Join Year *
              <select
                name="joinYear"
                value={formik.values.joinYear}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={isEditMode}
                className={`mt-1 w-full rounded-xl border-2 px-4 py-2.5 text-base text-slate-900 transition-all duration-200 focus:outline-none focus:ring-4 ${
                  formik.touched.joinYear && formik.errors.joinYear
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-200/50'
                    : 'border-slate-200 bg-white focus:border-brand-500 focus:ring-brand-200/50'
                } ${
                  isEditMode ? 'bg-slate-100 cursor-not-allowed opacity-60' : ''
                }`}
              >
                <option value="">Select Join Year</option>
                {[2021, 2022, 2023, 2024, 2025, 2026].map((year) => (
                  <option key={year} value={year.toString()}>
                    {year}
                  </option>
                ))}
              </select>
              {formik.touched.joinYear && formik.errors.joinYear && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.joinYear}</p>
              )}
            </label>
          </div>

          <label className="text-sm font-semibold text-slate-700">
            Exam Marks *
            <input
              type="text"
              name="examMarks"
              value={formik.values.examMarks !== undefined && formik.values.examMarks !== null ? formik.values.examMarks.toString() : ''}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9.]/g, '')
                const parts = value.split('.')
                const formattedValue = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : value
                const numValue = formattedValue ? parseFloat(formattedValue) : undefined
                // Enforce max value of 100
                if (numValue !== undefined && numValue > 100) {
                  formik.setFieldValue('examMarks', 100)
                } else {
                  formik.setFieldValue('examMarks', numValue)
                }
              }}
              onBlur={formik.handleBlur}
              className={`mt-1 w-full rounded-xl border-2 px-4 py-2.5 text-base text-slate-900 transition-all duration-200 focus:outline-none focus:ring-4 ${
                formik.touched.examMarks && formik.errors.examMarks
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-200/50'
                  : 'border-slate-200 bg-white focus:border-brand-500 focus:ring-brand-200/50'
              }`}
              placeholder="Enter exam marks (0-100)"
            />
            {formik.touched.examMarks && formik.errors.examMarks && (
              <p className="mt-1 text-sm text-red-600">{formik.errors.examMarks}</p>
            )}
          </label>

          <div className="flex gap-4 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 rounded-full border-2 border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formik.isValid || loading}
              className="flex-1 rounded-full bg-gradient-to-r from-brand-600 to-brand-700 px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (isEditMode ? 'Updating...' : 'Adding...') : (isEditMode ? 'Update Student' : 'Add Student')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddEditStudentModal

