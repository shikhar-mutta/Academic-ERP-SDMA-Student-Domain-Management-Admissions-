import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { apiClient, endpoints, getErrorMessage } from '../utils/api'
import type { Domain, Student } from '../models'

const ViewDomainStudentsPage = () => {
  const { domainId } = useParams<{ domainId: string }>()
  const [domain, setDomain] = useState<Domain | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Sort students by exam marks (lowest to highest) - null/undefined marks go to end
  const sortedStudents = useMemo(() => {
    return [...students].sort((a, b) => {
      const marksA = a.examMarks ?? Infinity
      const marksB = b.examMarks ?? Infinity
      return marksA - marksB
    })
  }, [students])

  const handleBack = (e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    // Use window.location for guaranteed navigation that updates the component
    window.location.href = '/domains-list'
  }

  useEffect(() => {
    const fetchData = async () => {
      if (!domainId) {
        setError('Invalid domain ID')
        setLoading(false)
        return
      }

      setLoading(true)
      setError('')

      try {
        // Fetch domain details
        const domainResponse = await apiClient.get<Domain>(
          endpoints.domainById(parseInt(domainId)),
        )
        setDomain(domainResponse.data)

        // Fetch students for this domain
        const studentsResponse = await apiClient.get<Student[]>(
          endpoints.studentsByDomain(parseInt(domainId)),
        )
        setStudents(studentsResponse.data)
      } catch (err) {
        setError(getErrorMessage(err))
      } finally {
        setLoading(false)
      }
    }

    void fetchData()
  }, [domainId])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600"></div>
          <p className="text-slate-600 font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  if (error || !domain) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-medium mb-4">{error || 'Domain not found'}</p>
          <button
            type="button"
            onClick={() => {
              window.location.href = '/domains-list'
            }}
            className="rounded-full bg-brand-600 px-6 py-2 text-white font-semibold hover:bg-brand-700"
          >
            Back to Domains
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-white/50 bg-white/80 backdrop-blur-xl p-6 shadow-xl shadow-brand-500/5">
        <div className="flex items-center justify-between">
          <div>
            <button
              type="button"
              onClick={handleBack}
              className="mb-4 flex items-center gap-2 text-sm text-slate-600 hover:text-brand-700"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Domains
            </button>
            <h2 className="text-3xl font-bold text-slate-900">{domain.program}</h2>
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600">
              {domain.batch && (
                <span>
                  <span className="font-semibold">Batch:</span> {domain.batch}
                </span>
              )}
              <span>
                <span className="font-semibold">Capacity:</span> {domain.capacity}
              </span>
              {domain.examName && (
                <span>
                  <span className="font-semibold">Exam:</span> {domain.examName}
                </span>
              )}
              {domain.cutoffMarks !== undefined && (
                <span>
                  <span className="font-semibold">Cutoff:</span> {domain.cutoffMarks}
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-brand-700">{students.length}</div>
            <div className="text-sm text-slate-600">Students</div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-white/50 bg-white/80 backdrop-blur-xl shadow-2xl shadow-slate-200/40 overflow-hidden">
        {students.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-slate-600 font-medium">No students enrolled in this domain yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-700">
                    Roll #
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-700">
                    Student
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-700">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-700">
                    Join Year
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {sortedStudents.map((student) => (
                  <tr
                    key={student.studentId}
                    className="transition-colors duration-150 hover:bg-gradient-to-r hover:from-brand-50/50 hover:to-blue-50/50"
                  >
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-lg bg-brand-100 px-3 py-1.5 font-mono text-sm font-bold text-brand-700 shadow-sm">
                        {student.rollNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">
                        {student.firstName} {student.lastName}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{student.email}</td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-900">{student.joinYear}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default ViewDomainStudentsPage

