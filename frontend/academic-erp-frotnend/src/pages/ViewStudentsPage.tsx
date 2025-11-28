import { useEffect, useMemo, useState } from 'react'
import { apiClient, endpoints, getErrorMessage } from '../utils/api'
import AddEditStudentModal from '../components/AddEditStudentModal'
import type { Student } from '../models'

const ViewStudentsPage = () => {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [showStudentModal, setShowStudentModal] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)

  const filteredStudents = useMemo(() => {
    const term = search.trim().toLowerCase()
    let result = students
    
    // Filter by search term
    if (term) {
      result = result.filter(
        (student) =>
          student.rollNumber.toLowerCase().includes(term) ||
          student.firstName.toLowerCase().includes(term) ||
          student.lastName.toLowerCase().includes(term) ||
          student.email.toLowerCase().includes(term) ||
          student.domainProgram.toLowerCase().includes(term),
      )
    }
    
    // Sort by exam marks (lowest to highest) - null/undefined marks go to end
    result = [...result].sort((a, b) => {
      const marksA = a.examMarks ?? Infinity
      const marksB = b.examMarks ?? Infinity
      return marksA - marksB
    })
    
    return result
  }, [search, students])

  const summary = useMemo(() => {
    const total = students.length
    const domains = new Map<string, number>()
    students.forEach((student) => {
      domains.set(
        student.domainProgram,
        (domains.get(student.domainProgram) || 0) + 1,
      )
    })
    const topDomain =
      [...domains.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'N/A'

    return { total, domainCount: domains.size, topDomain }
  }, [students])

  const fetchStudents = async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await apiClient.get<Student[]>(endpoints.students)
      setStudents(data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [])

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
    void fetchStudents()
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="rounded-2xl border border-white/50 bg-white/80 backdrop-blur-xl p-6 shadow-xl shadow-brand-500/5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-md">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <p className="text-xs uppercase tracking-[0.3em] text-brand-600 font-semibold">
                Students Management
              </p>
            </div>
            <h2 className="text-3xl font-bold text-slate-900">
              Student Roster
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Search, filter, and manage admitted students.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleAddStudent}
              className="group rounded-full border-2 border-brand-500 bg-gradient-to-r from-brand-600 to-brand-700 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95"
            >
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Student
              </span>
            </button>
            <div className="relative w-full sm:w-64">
              <svg className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="search"
                placeholder="Search by name, roll, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-full border-2 border-slate-200 bg-white pl-11 pr-4 py-2.5 text-sm text-slate-900 transition-all duration-200 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-200/50 hover:border-slate-300"
              />
            </div>
            <button
              onClick={fetchStudents}
              className="group rounded-full border-2 border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-all duration-200 hover:border-brand-500 hover:bg-brand-50 hover:text-brand-700 hover:shadow-md active:scale-95"
            >
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 transition-transform group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </span>
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="group rounded-2xl border-2 border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 shadow-md transition-all duration-200 hover:scale-105 hover:border-brand-300 hover:shadow-lg">
            <div className="mb-2 flex items-center gap-2">
              <div className="rounded-lg bg-brand-100 p-2">
                <svg className="h-5 w-5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-slate-600">Total students</p>
            </div>
            <p className="text-3xl font-bold text-slate-900">
              {summary.total}
            </p>
          </div>
          <div className="group rounded-2xl border-2 border-slate-200 bg-gradient-to-br from-white to-blue-50 p-5 shadow-md transition-all duration-200 hover:scale-105 hover:border-blue-300 hover:shadow-lg">
            <div className="mb-2 flex items-center gap-2">
              <div className="rounded-lg bg-blue-100 p-2">
                <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-slate-600">Active domains</p>
            </div>
            <p className="text-3xl font-bold text-slate-900">
              {summary.domainCount}
            </p>
          </div>
          <div className="group rounded-2xl border-2 border-slate-200 bg-gradient-to-br from-white to-purple-50 p-5 shadow-md transition-all duration-200 hover:scale-105 hover:border-purple-300 hover:shadow-lg">
            <div className="mb-2 flex items-center gap-2">
              <div className="rounded-lg bg-purple-100 p-2">
                <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-slate-600">Top domain</p>
            </div>
            <p className="text-lg font-bold text-slate-900 truncate">
              {summary.topDomain}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-white/50 bg-white/80 backdrop-blur-xl shadow-2xl shadow-slate-200/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-700">Roll #</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-700">Student</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-700">Email</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-700">Domain</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-700">Join Year</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600"></div>
                      <p className="text-slate-600 font-medium">Loading students...</p>
                    </div>
                  </td>
                </tr>
              )}

              {!loading && filteredStudents.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <svg className="h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-slate-600 font-medium">No students match your search.</p>
                    </div>
                  </td>
                </tr>
              )}

              {!loading &&
                filteredStudents.map((student) => (
                  <tr key={student.studentId} className="transition-colors duration-150 hover:bg-gradient-to-r hover:from-brand-50/50 hover:to-blue-50/50">
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
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                        {student.domainProgram}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-900">{student.joinYear}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditStudent(student)}
                          className="rounded-lg border border-brand-300 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 transition-all hover:bg-brand-100"
                        >
                          Edit
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm(`Are you sure you want to delete ${student.firstName} ${student.lastName}?`)) {
                              try {
                                await apiClient.delete(endpoints.studentById(student.studentId))
                                await fetchStudents()
                              } catch (err) {
                                setError(getErrorMessage(err))
                              }
                            }
                          }}
                          className="rounded-lg border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition-all hover:bg-red-100"
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

        {error && (
          <div className="border-t-2 border-red-200 bg-gradient-to-r from-red-50 to-red-100 px-6 py-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-red-800">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Student Modal */}
      <AddEditStudentModal
        isOpen={showStudentModal}
        onClose={handleStudentModalClose}
        onSuccess={handleStudentModalSuccess}
        student={editingStudent}
      />
    </div>
  )
}

export default ViewStudentsPage

