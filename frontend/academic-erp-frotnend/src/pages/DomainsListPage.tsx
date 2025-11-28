import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiClient, endpoints, getErrorMessage } from '../utils/api'
import type { Domain, DomainUpdateImpact } from '../models'
import DomainModal from '../components/DomainModal'

const DomainsListPage = () => {
  const navigate = useNavigate()
  const [domains, setDomains] = useState<Domain[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingDomain, setEditingDomain] = useState<Domain | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null)
  const [deleteImpact, setDeleteImpact] = useState<DomainUpdateImpact | null>(null)
  const [checkingDeleteImpact, setCheckingDeleteImpact] = useState(false)

  const fetchDomains = async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await apiClient.get<Domain[]>(endpoints.domains)
      setDomains(data)
    } catch (err) {
      const errorMsg = getErrorMessage(err)
      setError(errorMsg)
      console.error('Error fetching domains:', err)
    } finally {
      setLoading(false)
    }
  }

  const initializeDatabase = async () => {
    try {
      setLoading(true)
      await apiClient.post(endpoints.initDatabase)
      // Wait a moment for tables to be created
      await new Promise(resolve => setTimeout(resolve, 1000))
      // Retry fetching domains
      await fetchDomains()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchDomains()
  }, [])

  const handleView = (domain: Domain) => {
    navigate(`/domains/${domain.domainId}/view`)
  }

  const handleEdit = (domain: Domain) => {
    setEditingDomain(domain)
    setShowModal(true)
  }

  const handleAdd = () => {
    setEditingDomain(null)
    setShowModal(true)
  }

  const handleModalSuccess = () => {
    void fetchDomains()
  }

  const handleModalClose = () => {
    setShowModal(false)
    setEditingDomain(null)
  }

  const checkDeleteImpact = async (domainId: number) => {
    setCheckingDeleteImpact(true)
    try {
      const { data } = await apiClient.get<DomainUpdateImpact>(
        endpoints.domainDeleteImpact(domainId)
      )
      setDeleteImpact(data)
      setPendingDeleteId(domainId)
      setShowDeleteConfirm(true)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setCheckingDeleteImpact(false)
    }
  }

  const handleDelete = async (domainId: number) => {
    await checkDeleteImpact(domainId)
  }

  const confirmDelete = async () => {
    if (!pendingDeleteId) return

    try {
      await apiClient.delete(endpoints.domainById(pendingDeleteId))
      setShowDeleteConfirm(false)
      setPendingDeleteId(null)
      setDeleteImpact(null)
      await fetchDomains()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }


  return (
    <div className="animate-fade-in flex flex-col h-full w-full">
      {/* Fixed Header Section */}
      <div className="flex-shrink-0 mb-6 w-[90%] mx-auto">
        <div className="mb-4 flex flex-col gap-4 rounded-2xl border border-white/50 bg-white/80 backdrop-blur-xl p-6 shadow-xl shadow-brand-500/5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-md">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <p className="text-xs uppercase tracking-[0.3em] text-brand-600 font-semibold">
              Academic Domains List
              </p>
            </div>
          </div>
            <div className="flex gap-3">
              <button
                onClick={handleAdd}
                className="group rounded-full border-2 border-brand-500 bg-gradient-to-r from-brand-600 to-brand-700 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95"
              >
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Domain
                </span>
              </button>
          <button
            onClick={fetchDomains}
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

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                <svg className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm text-red-800">{error}</p>
                  {(error.toLowerCase().includes("database") || 
                    error.toLowerCase().includes("table") ||
                    error.toLowerCase().includes("being created")) && 
                    !error.toLowerCase().includes("have been created") && (
                    <p className="text-xs text-red-600 mt-1">Setting up database automatically. Please wait...</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => {
                  setError('')
                  const isDatabaseError = error.toLowerCase().includes("database") || 
                                         error.toLowerCase().includes("table") ||
                                         error.toLowerCase().includes("doesn't exist") ||
                                         error.toLowerCase().includes("being created")
                  const tablesCreated = error.toLowerCase().includes("have been created") ||
                                      error.toLowerCase().includes("created successfully")
                  
                  if (tablesCreated) {
                    // Refresh the page
                    window.location.reload()
                  } else if (isDatabaseError) {
                    void initializeDatabase()
                  } else {
                    void fetchDomains()
                  }
                }}
                disabled={loading}
                className="flex-shrink-0 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-red-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {loading ? (
                  error.toLowerCase().includes("have been created") ? 'Refreshing...' :
                  (error.toLowerCase().includes("database") || error.toLowerCase().includes("table") ? 'Creating tables...' : 'Retrying...')
                ) : (
                  error.toLowerCase().includes("have been created") ? 'Refresh Page' :
                  (error.toLowerCase().includes("database") || error.toLowerCase().includes("table") ? 'Create Tables' : 'Retry')
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Scrollable Domains List Section */}
      <div className="flex-1 overflow-y-auto w-full">
        <div className="w-[90%] mx-auto">
          <div className="grid gap-6 grid-cols-1 w-full py-4">
        {loading ? (
          <div className="col-span-full p-12 text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600"></div>
            <p className="text-slate-600 font-medium">Loading domains...</p>
          </div>
        ) : domains.length === 0 ? (
          <div className="col-span-full p-12 text-center">
            <svg className="mx-auto h-16 w-16 text-slate-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <p className="text-slate-600 font-medium mb-4">No domains available.</p>
            <p className="text-sm text-slate-500 mb-4">
              {error || 'The database appears to be empty. Please add a domain using the "Add Domain" button above, or insert data using the SQL script.'}
            </p>
            <button
              onClick={handleAdd}
              className="rounded-full bg-gradient-to-r from-brand-600 to-brand-700 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:scale-105 hover:shadow-lg"
            >
              Add Your First Domain
            </button>
          </div>
        ) : (
          domains.map((domain, index) => (
            <div
              key={domain.domainId}
              className="group rounded-2xl border-2 border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 shadow-md transition-all duration-200 hover:scale-105 hover:border-brand-300 hover:shadow-xl flex gap-4 w-full"
            >
              <div className="flex self-stretch items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 px-4 text-white shadow-md min-h-full w-[10%]">
                <span className="text-xl font-bold">{index + 1}</span>
              </div>
              <div className="flex-1">
                {/* Title Row with Student Chip */}
                <div className="mb-3 flex items-start justify-between gap-3">
                <div className="flex-1">
                    <h3 className="text-2xl font-extrabold text-slate-900 mb-1.5 leading-tight">
                    {domain.program}
                  </h3>
                  {domain.batch && (
                      <p className="text-xs text-slate-400 font-medium">
                      Batch: {domain.batch}
                    </p>
                  )}
                </div>
                  <div className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/50 px-3 py-1.5 shadow-sm">
                    <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span className="text-xs font-medium text-green-700">Enrolled Students:</span>
                    <span className="text-sm font-bold text-green-900">{domain.studentCount ?? 0}</span>
                  </div>
                </div>

                {/* Info Blocks */}
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="rounded-lg bg-brand-100 p-2">
                      <svg className="h-4 w-4 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Capacity</p>
                      <p className="text-base font-bold text-slate-900">{domain.capacity} seats</p>
                    </div>
                  </div>

                  {domain.examName && (
                    <div className="flex items-start gap-2.5">
                    <div className="rounded-lg bg-blue-100 p-2">
                        <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <div className="flex-1">
                        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Qualification</p>
                        <p className="text-sm font-semibold text-slate-700">
                          {domain.examName}
                          {domain.cutoffMarks !== undefined && domain.cutoffMarks !== null && (
                            <span className="ml-2 text-xs font-normal text-slate-500">(Cutoff: {domain.cutoffMarks})</span>
                          )}
                        </p>
                    </div>
                  </div>
                )}
                </div>
              </div>

              {/* Action Buttons - Closer to content */}
              <div className="flex flex-col gap-2.5 ml-2">
                <button
                  onClick={() => handleView(domain)}
                  className="rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95 whitespace-nowrap min-w-[110px]"
                >
                  View
                </button>
                <button
                  onClick={() => handleEdit(domain)}
                  className="rounded-lg bg-gradient-to-r from-brand-500 to-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95 whitespace-nowrap min-w-[110px]"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(domain.domainId)}
                  className="rounded-lg bg-gradient-to-r from-red-500 to-red-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95 whitespace-nowrap min-w-[110px]"
              >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && deleteImpact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md m-4">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900">Confirm Domain Deletion</h3>
              </div>
              
              <div className="mb-6">
                <p className="text-slate-700 mb-4">
                  Are you sure you want to delete this domain? This action cannot be undone.
                </p>
                {deleteImpact.affectedStudentsCount > 0 && (
                  <div className="rounded-xl border-2 border-red-200 bg-red-50 p-4">
                    <p className="text-sm font-semibold text-red-800">
                      {deleteImpact.message}
                    </p>
                    <p className="text-xs text-red-600 mt-2">
                      All {deleteImpact.affectedStudentsCount} student(s) will be permanently removed from the database.
                    </p>
                  </div>
                )}
                {deleteImpact.affectedStudentsCount === 0 && (
                  <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-4">
                    <p className="text-sm font-semibold text-blue-800">
                      No students are associated with this domain.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    setPendingDeleteId(null)
                    setDeleteImpact(null)
                  }}
                  className="flex-1 rounded-full border-2 border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={checkingDeleteImpact}
                  className="flex-1 rounded-full bg-gradient-to-r from-red-600 to-red-700 px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {checkingDeleteImpact ? 'Checking...' : 'Delete Domain'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Domain Modal */}
      <DomainModal
        isOpen={showModal}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        domain={editingDomain}
      />
    </div>
  )
}

export default DomainsListPage
