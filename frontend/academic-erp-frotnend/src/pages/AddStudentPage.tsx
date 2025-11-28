import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AddEditStudentModal from '../components/AddEditStudentModal'
import type { StudentResponse } from '../models'

const AddStudentPage = () => {
  const navigate = useNavigate()
  // Modal is open by default when page loads
  const [showModal, setShowModal] = useState(true)
  const [lastStudent, setLastStudent] = useState<StudentResponse | null>(null)
  const [feedback, setFeedback] = useState('')

  const handleModalClose = () => {
    setShowModal(false)
    navigate('/students')
  }

  const handleModalSuccess = async (studentData?: StudentResponse) => {
    if (studentData) {
      setLastStudent(studentData)
      setFeedback(`Student admitted. Generated roll number: ${studentData.rollNumber}`)
    }
    // Keep modal open for adding another student
    // User can close manually or navigate away
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-white/50 bg-white/80 backdrop-blur-xl p-6 shadow-xl shadow-brand-500/5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-md">
              <span className="text-sm font-bold">1</span>
            </div>
            <p className="text-xs uppercase tracking-[0.3em] text-brand-600 font-semibold">
              Step 01
            </p>
          </div>
          <h2 className="text-3xl font-bold text-slate-900">
            Add a new student
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Capture admission details and assign the student to an ERP domain.
          </p>
        </div>
        </div>

        {feedback && (
          <div
          className={`mb-6 rounded-2xl border-2 px-5 py-4 text-sm font-semibold shadow-md ${
            feedback.includes('admitted') || feedback.includes('successfully')
                ? 'border-emerald-200 bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-800'
              : 'border-red-200 bg-gradient-to-r from-red-50 to-red-100 text-red-800'
          }`}
          >
            {feedback}
          </div>
        )}

        {lastStudent && (
        <div className="mb-6 rounded-2xl border-2 border-brand-200 bg-gradient-to-r from-brand-50 to-blue-50 px-5 py-4 text-sm font-medium text-slate-800 shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <svg className="h-5 w-5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-bold">Last admission:</span>
            </div>
            <p className="ml-7">
              {lastStudent.firstName} {lastStudent.lastName} · Roll{' '}
              <span className="font-mono font-bold text-brand-700">{lastStudent.rollNumber}</span> · Domain{' '}
              <span className="font-semibold">{lastStudent.domainProgram}</span> · {lastStudent.joinYear}
            </p>
          </div>
        )}

      {/* Add Student Modal */}
      <AddEditStudentModal
        isOpen={showModal}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
      />
    </div>
  )
}

export default AddStudentPage
