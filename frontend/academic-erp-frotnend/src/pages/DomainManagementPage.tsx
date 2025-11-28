import { useEffect, useState } from 'react'
import { apiClient, endpoints, getErrorMessage } from '../utils/api'
import DomainModal from '../components/DomainModal'
import type { Domain, DomainUpdateImpact } from '../models'

const DomainManagementPage = () => {
  const [domains, setDomains] = useState<Domain[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingDomain, setEditingDomain] = useState<Domain | null>(null)
  const [feedback, setFeedback] = useState('')

  const fetchDomains = async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await apiClient.get<Domain[]>(endpoints.domains)
      setDomains(data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchDomains()
  }, [])

  const handleAddDomain = () => {
      setEditingDomain(null)
    setShowModal(true)
  }

  const handleEdit = (domain: Domain) => {
    setEditingDomain(domain)
    setShowModal(true)
  }

  const handleModalClose = () => {
    setShowModal(false)
    setEditingDomain(null)
  }

  const handleModalSuccess = () => {
    void fetchDomains()
    setFeedback('Domain saved successfully!')
    setTimeout(() => setFeedback(''), 3000)
  }

  const handleDelete = async (domainId: number) => {
    try {
      // Check delete impact first
      const { data: impact } = await apiClient.get<DomainUpdateImpact>(
        endpoints.domainDeleteImpact(domainId)
      )
      
      const confirmMessage = impact.affectedStudentsCount > 0
        ? `${impact.message}\n\nAre you sure you want to proceed? This action cannot be undone.`
        : 'Are you sure you want to delete this domain? This action cannot be undone.'
      
      if (!confirm(confirmMessage)) {
      return
    }

      await apiClient.delete(endpoints.domainById(domainId))
      setFeedback('Domain and all associated students deleted successfully!')
      await fetchDomains()
    } catch (err) {
      setFeedback(getErrorMessage(err))
    }
  }


  return (
    <div className="animate-fade-in">
      <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-white/50 bg-white/80 backdrop-blur-xl p-6 shadow-xl shadow-brand-500/5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-md">
              <span className="text-sm font-bold">D</span>
            </div>
            <p className="text-xs uppercase tracking-[0.3em] text-brand-600 font-semibold">
              Domain Management
            </p>
          </div>
          <h2 className="text-3xl font-bold text-slate-900">
            Manage Domains
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Add, modify, and manage academic domains (MTech CSE, IMTech ECE, etc.)
          </p>
        </div>
        <button
          onClick={handleAddDomain}
          className="group rounded-full border-2 border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-all duration-200 hover:border-brand-500 hover:bg-brand-50 hover:text-brand-700 hover:shadow-md active:scale-95"
        >
          <span className="flex items-center gap-2">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Domain
          </span>
        </button>
      </div>

      {/* Domain Modal */}
      <DomainModal
        isOpen={showModal}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        domain={editingDomain}
      />

      {feedback && (
        <div
          className={`mb-6 rounded-2xl border-2 px-5 py-4 text-sm font-semibold shadow-md ${
            feedback.includes('successfully')
              ? 'border-emerald-200 bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-800'
              : 'border-red-200 bg-gradient-to-r from-red-50 to-red-100 text-red-800'
          }`}
        >
          {feedback}
        </div>
      )}

      <div className="rounded-3xl border border-white/50 bg-white/80 backdrop-blur-xl shadow-2xl shadow-slate-200/40 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600"></div>
            <p className="text-slate-600 font-medium">Loading domains...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        ) : domains.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-slate-600 font-medium">No domains found. Create one to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-700">
                    Program
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-700">
                    Batch
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-700">
                    Capacity
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-700">
                    Qualification
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-700">
                    Cutoff
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {domains.map((domain) => (
                  <tr
                    key={domain.domainId}
                    className="transition-colors duration-150 hover:bg-gradient-to-r hover:from-brand-50/50 hover:to-blue-50/50"
                  >
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {domain.program}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {domain.batch || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-lg bg-brand-100 px-3 py-1.5 font-mono text-sm font-bold text-brand-700 shadow-sm">
                        {domain.capacity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {domain.examName || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {domain.cutoffMarks !== undefined && domain.cutoffMarks !== null ? domain.cutoffMarks : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(domain)}
                          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-all hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(domain.domainId)}
                          className="rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-medium text-red-700 transition-all hover:border-red-400 hover:bg-red-50"
                        >
                          Delete
                        </button>
                        <a
                          href={`/domains/${domain.domainId}/students`}
                          className="rounded-lg border border-blue-300 bg-white px-3 py-1.5 text-xs font-medium text-blue-700 transition-all hover:border-blue-400 hover:bg-blue-50"
                        >
                          View Students
                        </a>
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

export default DomainManagementPage

