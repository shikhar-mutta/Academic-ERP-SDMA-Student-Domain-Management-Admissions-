import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { apiClient, endpoints, getErrorMessage } from '../utils/api'
import AddEditStudentModal from '../components/AddEditStudentModal'
import DomainModal from '../components/DomainModal'
import type { Domain, Student } from '../models'

const EditDomainPage = () => {
  const { domainId } = useParams<{ domainId: string }>()
  const navigate = useNavigate()
  const [domain, setDomain] = useState<Domain | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showDomainModal, setShowDomainModal] = useState(false)
  const [showStudentModal, setShowStudentModal] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)

  // Sort students by exam marks (lowest to highest) - null/undefined marks go to end
  const sortedStudents = useMemo(() => {
    return [...students].sort((a, b) => {
      const marksA = a.examMarks ?? Infinity
      const marksB = b.examMarks ?? Infinity
      return marksA - marksB
    })
  }, [students])

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
        const domainData = domainResponse.data
        setDomain(domainData)

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

  const handleDomainModalClose = () => {
    setShowDomainModal(false)
  }

  const handleDomainModalSuccess = async () => {
    if (!domainId) return
    // Refresh domain and students data after update
    try {
      const domainResponse = await apiClient.get<Domain>(
        endpoints.domainById(parseInt(domainId)),
      )
      setDomain(domainResponse.data)
      const studentsResponse = await apiClient.get<Student[]>(
        endpoints.studentsByDomain(parseInt(domainId)),
      )
      setStudents(studentsResponse.data)
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const refreshStudents = async () => {
    if (!domainId) return
    try {
      const studentsResponse = await apiClient.get<Student[]>(
        endpoints.studentsByDomain(parseInt(domainId)),
      )
      setStudents(studentsResponse.data)
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const handleAddStudent = () => {
    setEditingStudent(null)
    setShowStudentModal(true)
  }

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student)
    setShowStudentModal(true)
  }

  const handleStudentModalClose = () => {
    setShowStudentModal(false)
      setEditingStudent(null)
  }

  const handleStudentModalSuccess = () => {
    void refreshStudents()
  }

  const handleDeleteStudent = async (studentId: number) => {
    if (!confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
      return
    }

    try {
      await apiClient.delete(endpoints.studentById(studentId))
      await refreshStudents()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

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

  if (error && !domain) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-medium mb-4">{error || 'Domain not found'}</p>
          <button
            onClick={() => navigate('/domains-list')}
            className="rounded-full bg-brand-600 px-6 py-2 text-white font-semibold hover:bg-brand-700"
          >
            Back to Domains
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in space-y-8">
      {/* Back button and header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/domains-list')}
          className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-all hover:border-brand-500 hover:bg-brand-50 hover:text-brand-700"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Domains
        </button>
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Edit Domain</h2>
          <p className="mt-1 text-sm text-slate-600">Update domain details and view students</p>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border-2 border-red-200 bg-gradient-to-r from-red-50 to-red-100 px-5 py-4 text-sm font-semibold text-red-800 shadow-md">
          {error}
        </div>
      )}

      {/* Domain Information Display */}
      {domain && (
        <div className="rounded-2xl border border-white/50 bg-white/80 backdrop-blur-xl p-6 shadow-xl mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-bold text-slate-900">Domain Information</h3>
              <button
                onClick={() => setShowDomainModal(true)}
                className="rounded-full border border-brand-300 bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700 transition-all hover:bg-brand-100"
              >
                Edit Domain
              </button>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/50 px-3 py-1.5 shadow-sm">
              <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span className="text-xs font-medium text-green-700">Enrolled Students:</span>
              <span className="text-sm font-bold text-green-900">{students.length}</span>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Program</p>
              <p className="text-lg font-bold text-slate-900">{domain.program}</p>
            </div>
            {domain.batch && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Batch</p>
                <p className="text-lg font-bold text-slate-900">{domain.batch}</p>
              </div>
            )}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Capacity</p>
              <p className="text-lg font-bold text-slate-900">{domain.capacity} seats</p>
            </div>
            {domain.examName && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Exam</p>
                <p className="text-lg font-bold text-slate-900">
                  {domain.examName}
                  {domain.cutoffMarks !== undefined && domain.cutoffMarks !== null && (
                    <span className="ml-2 text-sm text-slate-600">(Cutoff: {domain.cutoffMarks})</span>
                  )}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Domain Edit Modal */}
      <DomainModal
        isOpen={showDomainModal}
        onClose={handleDomainModalClose}
        onSuccess={handleDomainModalSuccess}
        domain={domain}
        checkImpact={true}
      />

      {/* Add/Edit Student Modal */}
      <AddEditStudentModal
        isOpen={showStudentModal}
        onClose={handleStudentModalClose}
        onSuccess={handleStudentModalSuccess}
        student={editingStudent}
        defaultDomainId={domainId}
      />

      {/* Students List */}
      <div className="rounded-2xl border border-white/50 bg-white/80 backdrop-blur-xl p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Students in this Domain</h3>
            <p className="mt-1 text-sm text-slate-600">
              {students.length} student{students.length !== 1 ? 's' : ''} enrolled
            </p>
          </div>
          <button
            onClick={handleAddStudent}
            className="rounded-full bg-gradient-to-r from-brand-600 to-brand-700 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all hover:scale-105 hover:shadow-lg"
          >
            + Add Student
          </button>
        </div>

        {students.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-12 text-center">
            <svg className="mx-auto h-16 w-16 text-slate-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <p className="text-slate-600 font-medium">No students enrolled in this domain yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-700">
                    #
                  </th>
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
                    Exam Marks
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-700">
                    Join Year
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {sortedStudents.map((student, index) => (
                  <tr
                    key={student.studentId}
                    className="transition-colors duration-150 hover:bg-gradient-to-r hover:from-brand-50/50 hover:to-blue-50/50"
                  >
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-900">{index + 1}</span>
                    </td>
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
                    <td className="px-6 py-4">
                      <a
                        href={`mailto:${student.email}`}
                        className="inline-flex items-center justify-center w-10 h-10 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors"
                        title={`Send email to ${student.email}`}
                      >
                        <span className="text-2xl">📧</span>
                      </a>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-900">
                        {student.examMarks.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-900">{student.joinYear}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditStudent(student)}
                          className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition-all hover:bg-blue-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(student.studentId)}
                          className="rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 transition-all hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
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

export default EditDomainPage

