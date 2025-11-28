import { useEffect, useState } from 'react'
import { useFormik } from 'formik'
import { apiClient, endpoints, getErrorMessage } from '../utils/api'
import { domainFormSchema, formatCutoffMarksForDB } from '../utils/validationSchemas'
import type { Domain, DomainRequest, DomainUpdateImpact } from '../models'

interface DomainFormValues {
  program: string
  batch: string
  capacity: number | undefined
  examName: string
  cutoffMarks: number | undefined
}

interface DomainModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  domain?: Domain | null
  checkImpact?: boolean
}

const DomainModal = ({ isOpen, onClose, onSuccess, domain, checkImpact = false }: DomainModalProps) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [pendingPayload, setPendingPayload] = useState<DomainRequest | null>(null)
  const [impact, setImpact] = useState<DomainUpdateImpact | null>(null)
  const [checkingImpact, setCheckingImpact] = useState(false)

  const formik = useFormik<DomainFormValues>({
    initialValues: {
      program: '',
      batch: '2026',
      capacity: undefined,
      examName: '',
      cutoffMarks: undefined,
    },
    validationSchema: domainFormSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      setError('')

      try {
        const payload: DomainRequest = {
          program: values.program,
          batch: values.batch,
          capacity: values.capacity ?? 0,
          examName: values.examName,
          cutoffMarks: formatCutoffMarksForDB(values.cutoffMarks) ?? 0,
        }

        if (domain && checkImpact) {
          // Check impact before updating
          setCheckingImpact(true)
          try {
            const { data: impactData } = await apiClient.post<DomainUpdateImpact>(
              endpoints.domainImpact(domain.domainId),
              payload
            )
            setImpact(impactData)
            if (impactData.affectedStudentsCount > 0) {
              setPendingPayload(payload)
              setShowConfirmDialog(true)
              setCheckingImpact(false)
              return
            }
          } catch (err) {
            setError(getErrorMessage(err))
            setCheckingImpact(false)
            return
          } finally {
            setCheckingImpact(false)
          }
        }

        setLoading(true)
        if (domain) {
          // Update existing domain
          await apiClient.patch(endpoints.domainById(domain.domainId), payload)
        } else {
          // Create new domain
          await apiClient.post(endpoints.domains, payload)
        }

        onSuccess()
        onClose()
        formik.resetForm()
        setShowConfirmDialog(false)
        setPendingPayload(null)
        setImpact(null)
      } catch (err) {
        setError(getErrorMessage(err))
      } finally {
        setLoading(false)
      }
    },
  })

  useEffect(() => {
    if (isOpen) {
      if (domain) {
        formik.setValues({
          program: domain.program || '',
          batch: domain.batch || '2026',
          capacity: domain.capacity,
          examName: domain.examName || '',
          cutoffMarks: domain.cutoffMarks,
        })
      } else {
        formik.resetForm()
      }
      setError('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, domain])

  // Handle ESC key press to close modal
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        if (showConfirmDialog) {
          // Close confirmation dialog first
          setShowConfirmDialog(false)
          setPendingPayload(null)
          setImpact(null)
        } else {
          // Close main modal
          onClose()
        }
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey)
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [isOpen, showConfirmDialog, onClose])

  if (!isOpen) return null

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only close if clicking directly on the backdrop, not on the modal content
    if (e.target === e.currentTarget && !showConfirmDialog) {
      onClose()
    }
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl m-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">
              {domain ? 'Edit Domain' : 'Add New Domain'}
            </h2>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 rounded-xl border-2 border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={formik.handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-semibold text-slate-700">
                Program *
                <input
                  type="text"
                  name="program"
                  value={formik.values.program}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`mt-1 w-full rounded-xl border-2 px-4 py-2.5 text-base text-slate-900 transition-all duration-200 focus:outline-none focus:ring-4 ${
                    formik.touched.program && formik.errors.program
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-200/50'
                      : 'border-slate-200 bg-white focus:border-brand-500 focus:ring-brand-200/50'
                  }`}
                  placeholder="Bachelor of Technology in CSE"
                />
                {formik.touched.program && formik.errors.program && (
                  <p className="mt-1 text-sm text-red-600">{formik.errors.program}</p>
                )}
              </label>
              <label className="text-sm font-semibold text-slate-700">
                Batch *
                <select
                  name="batch"
                  value={formik.values.batch}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`mt-1 w-full rounded-xl border-2 px-4 py-2.5 text-base text-slate-900 transition-all duration-200 focus:outline-none focus:ring-4 ${
                    formik.touched.batch && formik.errors.batch
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-200/50'
                      : 'border-slate-200 bg-white focus:border-brand-500 focus:ring-brand-200/50'
                  }`}
                >
                  <option value="">Select Batch</option>
                  {[2020, 2021, 2022, 2023, 2024, 2025, 2026].map((year) => (
                    <option key={year} value={year.toString()}>
                      {year}
                    </option>
                  ))}
                </select>
                {formik.touched.batch && formik.errors.batch && (
                  <p className="mt-1 text-sm text-red-600">{formik.errors.batch}</p>
                )}
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-semibold text-slate-700">
                Capacity *
                <input
                  type="text"
                  name="capacity"
                  value={formik.values.capacity !== undefined && formik.values.capacity !== null ? formik.values.capacity.toString() : ''}
                  onChange={(e) => {
                    // Only allow numbers (no decimals for capacity)
                    const value = e.target.value.replace(/[^0-9]/g, '')
                    const numValue = value ? parseInt(value, 10) : undefined
                    // Enforce max value of 150
                    if (numValue !== undefined && numValue > 150) {
                      formik.setFieldValue('capacity', 150)
                    } else {
                      formik.setFieldValue('capacity', numValue)
                    }
                  }}
                  onBlur={formik.handleBlur}
                  className={`mt-1 w-full rounded-xl border-2 px-4 py-2.5 text-base text-slate-900 transition-all duration-200 focus:outline-none focus:ring-4 ${
                    formik.touched.capacity && formik.errors.capacity
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-200/50'
                      : 'border-slate-200 bg-white focus:border-brand-500 focus:ring-brand-200/50'
                  }`}
                  placeholder="Enter capacity (0-150)"
                />
                {formik.touched.capacity && formik.errors.capacity && (
                  <p className="mt-1 text-sm text-red-600">{formik.errors.capacity}</p>
                )}
              </label>
              <label className="text-sm font-semibold text-slate-700">
                Exam Name *
                <input
                  type="text"
                  name="examName"
                  value={formik.values.examName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`mt-1 w-full rounded-xl border-2 px-4 py-2.5 text-base text-slate-900 transition-all duration-200 focus:outline-none focus:ring-4 ${
                    formik.touched.examName && formik.errors.examName
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-200/50'
                      : 'border-slate-200 bg-white focus:border-brand-500 focus:ring-brand-200/50'
                  }`}
                  placeholder="JEE Main"
                />
                {formik.touched.examName && formik.errors.examName && (
                  <p className="mt-1 text-sm text-red-600">{formik.errors.examName}</p>
                )}
              </label>
            </div>

            <label className="text-sm font-semibold text-slate-700">
              Cutoff Marks *
              <input
                type="text"
                name="cutoffMarks"
                value={formik.values.cutoffMarks !== undefined && formik.values.cutoffMarks !== null ? formik.values.cutoffMarks.toString() : ''}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9.]/g, '')
                  const parts = value.split('.')
                  const formattedValue = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : value
                  const numValue = formattedValue ? parseFloat(formattedValue) : undefined
                  // Enforce max value of 100
                  if (numValue !== undefined && numValue > 100) {
                    formik.setFieldValue('cutoffMarks', 100)
                  } else {
                    formik.setFieldValue('cutoffMarks', numValue)
                  }
                }}
                onBlur={formik.handleBlur}
                className={`mt-1 w-full rounded-xl border-2 px-4 py-2.5 text-base text-slate-900 transition-all duration-200 focus:outline-none focus:ring-4 ${
                  formik.touched.cutoffMarks && formik.errors.cutoffMarks
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-200/50'
                    : 'border-slate-200 bg-white focus:border-brand-500 focus:ring-brand-200/50'
                }`}
                placeholder="Enter cutoff marks (0-100)"
              />
              {formik.touched.cutoffMarks && formik.errors.cutoffMarks && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.cutoffMarks}</p>
              )}
            </label>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading || checkingImpact || !formik.isValid}
                className="flex-1 rounded-full bg-gradient-to-r from-brand-600 to-brand-700 px-6 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'Saving...' : checkingImpact ? 'Checking...' : domain ? 'Update Domain' : 'Create Domain'}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={loading || checkingImpact}
                className="rounded-full border-2 border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-400 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Confirmation Dialog for Impact */}
      {showConfirmDialog && impact && pendingPayload && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowConfirmDialog(false)
              setPendingPayload(null)
              setImpact(null)
            }
          }}
        >
          <div 
            className="mx-4 w-full max-w-md rounded-2xl border border-white/50 bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-4 text-xl font-bold text-slate-900">Confirm Domain Update</h3>
            <p className="mb-6 text-sm text-slate-600">{impact.message}</p>
            <div className="flex gap-3">
              <button
                onClick={async () => {
                  if (!domain || !pendingPayload) return
                  setLoading(true)
                  try {
                    await apiClient.patch(endpoints.domainById(domain.domainId), pendingPayload)
                    onSuccess()
                    onClose()
                    formik.resetForm()
                    setShowConfirmDialog(false)
                    setPendingPayload(null)
                    setImpact(null)
                  } catch (err) {
                    setError(getErrorMessage(err))
                  } finally {
                    setLoading(false)
                  }
                }}
                disabled={loading}
                className="flex-1 rounded-full bg-gradient-to-r from-brand-600 to-brand-700 px-6 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Confirm Update'}
              </button>
              <button
                onClick={() => {
                  setShowConfirmDialog(false)
                  setPendingPayload(null)
                  setImpact(null)
                }}
                disabled={loading}
                className="rounded-full border-2 border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-400 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DomainModal

