import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { apiClient, endpoints, getErrorMessage } from '../utils/api'
import AddEditStudentModal from '../components/AddEditStudentModal'
import type { Domain, Student } from '../models'

const ViewDomainPage = () => {
  const { domainId } = useParams<{ domainId: string }>()
  const navigate = useNavigate()
  const [domain, setDomain] = useState<Domain | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>('asc')

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
      } finally {
        setLoading(false)
      }
    }

    void fetchData()
  }, [domainId])

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
    setShowModal(true)
  }

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student)
    setShowModal(true)
  }

  const handleModalClose = () => {
    setShowModal(false)
      setEditingStudent(null)
  }

  const handleModalSuccess = () => {
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

  const handleSortByExamMarks = () => {
    if (sortOrder === null) {
      setSortOrder('asc')
    } else if (sortOrder === 'asc') {
      setSortOrder('desc')
    } else {
      setSortOrder(null)
    }
  }

  const sortedStudents = sortOrder === null 
    ? students 
    : [...students].sort((a, b) => {
        const marksA = a.examMarks ?? Infinity
        const marksB = b.examMarks ?? Infinity
        if (sortOrder === 'asc') {
          return marksA - marksB
        } else {
          return marksB - marksA
        }
      })

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
    <div className="animate-fade-in space-y-4 px-4 py-6 sm:px-6 lg:px-8">
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
          <h2 className="text-3xl font-bold text-slate-900">Domain details (With List of students)</h2>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border-2 border-red-200 bg-gradient-to-r from-red-50 to-red-100 px-5 py-4 text-sm font-semibold text-red-800 shadow-md">
          {error}
        </div>
      )}

      {/* Domain Details */}
      {domain && (
        <div className="rounded-2xl border border-white/50 bg-white/80 backdrop-blur-xl p-6 shadow-xl mb-6 -mt-2">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-xl font-bold text-slate-900">Domain Information</h3>
            <div className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/50 px-3 py-1.5 shadow-sm">
              <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span className="text-xs font-medium text-green-700">Enrolled Students:</span>
              <span className="text-sm font-bold text-green-900">{students.length}</span>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
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
                <p className="text-xs font-semibold text-slate-500 uppercase">Qualification</p>
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

      {/* Add/Edit Student Modal */}
      <AddEditStudentModal
        isOpen={showModal}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
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
          <div className="max-h-80 overflow-y-auto rounded-lg border border-slate-200 mb-4 mt-2">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-100 sticky top-0 z-10">
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
                  <th 
                    className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-700 cursor-pointer hover:bg-slate-200 transition-colors select-none"
                    onClick={handleSortByExamMarks}
                  >
                    <div className="flex items-center gap-2">
                    Exam Marks
                      <div className="flex flex-col">
                        <svg 
                          className={`w-3 h-3 ${sortOrder === 'asc' ? 'text-brand-600' : 'text-slate-400'}`} 
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                        <svg 
                          className={`w-3 h-3 -mt-1 ${sortOrder === 'desc' ? 'text-brand-600' : 'text-slate-400'}`} 
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
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
                    className={`transition-colors duration-150 hover:bg-gradient-to-r hover:from-brand-50/50 hover:to-blue-50/50 ${
                      index === sortedStudents.length - 1 ? '[&>td:first-child]:rounded-bl-lg [&>td:last-child]:rounded-br-lg' : ''
                    }`}
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

export default ViewDomainPage

