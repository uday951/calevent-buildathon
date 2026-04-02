import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { eventRequestsAPI } from '@/services/api'
import toast from 'react-hot-toast'

const STATUS_OPTIONS = ['pending','contacted','providers_assigned','quoted','approved','in_progress','completed','cancelled']
const STATUS_COLORS  = {
  pending:'bg-yellow-100 text-yellow-800', contacted:'bg-blue-100 text-blue-800',
  providers_assigned:'bg-indigo-100 text-indigo-800', quoted:'bg-purple-100 text-purple-800',
  approved:'bg-green-100 text-green-800', in_progress:'bg-teal-100 text-teal-800',
  completed:'bg-emerald-100 text-emerald-800', cancelled:'bg-red-100 text-red-800'
}
const SERVICES = ['catering','decoration','photography','videography','lighting','sound','stage','dj','band','anchor','security','transport','venue','cake','flowers','other']

export default function AdminEventRequests() {
  const [selected,      setSelected]      = useState(null)
  const [filterStatus,  setFilterStatus]  = useState('')
  const [filterCity,    setFilterCity]    = useState('')
  const [showAssign,    setShowAssign]    = useState(false)
  const [showQuote,     setShowQuote]     = useState(false)
  const [assignForm,    setAssignForm]    = useState({ providerId: '', serviceType: '', adminNote: '' })
  const [providerSearch,setProviderSearch]= useState({ city: '', service: '' })
  const [quoteForm,     setQuoteForm]     = useState({ totalAmount: '', notes: '', breakdown: [{ service: '', amount: '', description: '' }] })
  const queryClient = useQueryClient()

  const { data: listData, isLoading } = useQuery({
    queryKey: ['admin-requests', filterStatus, filterCity],
    queryFn: () => eventRequestsAPI.adminGetAll({ status: filterStatus || undefined, city: filterCity || undefined }),
    select: r => r.data
  })

  const { data: detailData, isLoading: detailLoading } = useQuery({
    queryKey: ['admin-request', selected],
    queryFn: () => eventRequestsAPI.adminGetById(selected),
    enabled: !!selected,
    select: r => r.data
  })

  const { data: providerResults = [] } = useQuery({
    queryKey: ['provider-search', providerSearch],
    queryFn: () => eventRequestsAPI.adminSearchProviders(providerSearch),
    enabled: showAssign && (!!providerSearch.city || !!providerSearch.service),
    select: r => r.data?.providers || []
  })

  const invalidate = () => {
    queryClient.invalidateQueries(['admin-requests'])
    queryClient.invalidateQueries(['admin-request', selected])
  }

  const statusMutation = useMutation({
    mutationFn: ({ id, status, note }) => eventRequestsAPI.adminUpdateStatus(id, { status, note }),
    onSuccess: () => { toast.success('Status updated'); invalidate() },
    onError: e => toast.error(e.message)
  })

  const assignMutation = useMutation({
    mutationFn: ({ id, data }) => eventRequestsAPI.adminAssignProvider(id, data),
    onSuccess: () => {
      toast.success('Provider assigned')
      setShowAssign(false)
      setAssignForm({ providerId: '', serviceType: '', adminNote: '' })
      invalidate()
    },
    onError: e => toast.error(e.message)
  })

  const removeAssignMutation = useMutation({
    mutationFn: ({ reqId, asgId }) => eventRequestsAPI.adminRemoveAssignment(reqId, asgId),
    onSuccess: () => { toast.success('Assignment removed'); invalidate() },
    onError: e => toast.error(e.message)
  })

  const quoteMutation = useMutation({
    mutationFn: ({ id, data }) => eventRequestsAPI.adminCreateQuotation(id, data),
    onSuccess: () => { toast.success('Quotation sent to customer'); setShowQuote(false); invalidate() },
    onError: e => toast.error(e.message)
  })

  const requests     = listData?.requests || []
  const statusCounts = listData?.statusCounts || []

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Event Requests</h1>
        <p className="text-gray-600 mb-6">Manage all incoming event planning requests</p>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total',     value: requests.length,                                                   bg: 'bg-slate-100' },
            { label: 'Pending',   value: statusCounts.find(s => s._id === 'pending')?.count || 0,           bg: 'bg-yellow-100' },
            { label: 'Quoted',    value: statusCounts.find(s => s._id === 'quoted')?.count || 0,            bg: 'bg-purple-100' },
            { label: 'Confirmed', value: statusCounts.find(s => s._id === 'approved')?.count || 0,          bg: 'bg-green-100' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-2xl p-4`}>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-sm text-gray-600 font-medium">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className={sel}>
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
          </select>
          <input className={inp + ' w-48'} placeholder="Filter by city..." value={filterCity} onChange={e => setFilterCity(e.target.value)} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* List */}
          <div className="lg:col-span-2 space-y-3">
            {isLoading ? <Spinner /> : requests.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center text-gray-500">No requests found</div>
            ) : requests.map(req => (
              <button key={req._id} onClick={() => setSelected(req._id)}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all hover:shadow-md ${
                  selected === req._id ? 'border-[#7c3aed] bg-purple-50' : 'border-gray-200 bg-white'
                }`}>
                <div className="flex items-start justify-between mb-1">
                  <span className="text-xs font-bold text-gray-400">{req.requestNumber}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[req.status]}`}>{req.status?.replace('_',' ')}</span>
                </div>
                <p className="font-bold text-gray-900 capitalize">{req.eventTitle || req.eventType} Event</p>
                <p className="text-sm text-gray-500">👤 {req.customerId?.name} • 📍 {req.location?.city}</p>
                <p className="text-sm text-gray-500">📅 {new Date(req.eventDate).toLocaleDateString('en-IN')} • 👥 {req.guestCount} guests</p>
                <p className="text-sm font-semibold text-[#7c3aed]">₹{req.budget?.max?.toLocaleString('en-IN')}</p>
              </button>
            ))}
          </div>

          {/* Detail */}
          <div className="lg:col-span-3">
            {!selected ? (
              <div className="bg-white rounded-2xl p-12 text-center text-gray-400">Select a request to manage</div>
            ) : detailLoading ? <Spinner /> : detailData ? (
              <AdminDetail
                request={detailData.request}
                assignments={detailData.assignments || []}
                onStatusChange={(status, note) => statusMutation.mutate({ id: detailData.request._id, status, note })}
                onRemoveAssignment={asgId => removeAssignMutation.mutate({ reqId: detailData.request._id, asgId })}
                showAssign={showAssign} setShowAssign={setShowAssign}
                showQuote={showQuote}   setShowQuote={setShowQuote}
                assignForm={assignForm} setAssignForm={setAssignForm}
                providerSearch={providerSearch} setProviderSearch={setProviderSearch}
                providerResults={providerResults}
                onAssign={() => assignMutation.mutate({ id: detailData.request._id, data: assignForm })}
                assigning={assignMutation.isPending}
                quoteForm={quoteForm} setQuoteForm={setQuoteForm}
                onSendQuote={() => quoteMutation.mutate({ id: detailData.request._id, data: { ...quoteForm, totalAmount: parseInt(quoteForm.totalAmount) } })}
                sendingQuote={quoteMutation.isPending}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

function AdminDetail({ request, assignments, onStatusChange, onRemoveAssignment, showAssign, setShowAssign, showQuote, setShowQuote, assignForm, setAssignForm, providerSearch, setProviderSearch, providerResults, onAssign, assigning, quoteForm, setQuoteForm, onSendQuote, sendingQuote }) {
  const [statusNote, setStatusNote] = useState('')
  const [newStatus,  setNewStatus]  = useState(request.status)

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 p-5 text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-slate-400 text-xs">{request.requestNumber}</p>
            <h2 className="text-xl font-bold capitalize">{request.eventTitle || request.eventType} Event</h2>
            <p className="text-slate-300 text-sm">👤 {request.customerId?.name} • {request.customerId?.phone} • {request.customerId?.email}</p>
          </div>
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${STATUS_COLORS[request.status]}`}>{request.status?.replace('_',' ')}</span>
        </div>
      </div>

      <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
        {/* Info grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            ['Event Type', request.eventType],
            ['Date',       new Date(request.eventDate).toLocaleDateString('en-IN')],
            ['Guests',     `${request.guestCount} people`],
            ['Location',   `${request.location?.address}, ${request.location?.city}`],
            ['Budget',     `₹${request.budget?.min?.toLocaleString('en-IN')||0} – ₹${request.budget?.max?.toLocaleString('en-IN')}`],
            ['Contact via',request.contactPreference],
          ].map(([l, v]) => (
            <div key={l} className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500">{l}</p>
              <p className="font-semibold text-gray-900 capitalize text-sm">{v}</p>
            </div>
          ))}
        </div>

        {request.servicesRequired?.length > 0 && (
          <div>
            <p className="text-sm font-bold text-gray-700 mb-2">Services Required</p>
            <div className="flex flex-wrap gap-2">
              {request.servicesRequired.map(s => (
                <span key={s} className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium capitalize">{s}</span>
              ))}
            </div>
          </div>
        )}

        {request.description && (
          <div className="bg-blue-50 rounded-xl p-3">
            <p className="text-xs font-bold text-blue-700 mb-1">Customer Description</p>
            <p className="text-sm text-blue-900">{request.description}</p>
          </div>
        )}

        {/* Update Status */}
        <div className="border border-gray-200 rounded-xl p-4">
          <p className="text-sm font-bold text-gray-700 mb-3">Update Status</p>
          <select value={newStatus} onChange={e => setNewStatus(e.target.value)} className={sel + ' w-full mb-2'}>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
          </select>
          <input className={inp + ' mb-2'} placeholder="Add a note (optional)" value={statusNote} onChange={e => setStatusNote(e.target.value)} />
          <button onClick={() => onStatusChange(newStatus, statusNote)}
            className="w-full bg-slate-800 text-white py-2 rounded-xl font-semibold text-sm hover:bg-slate-700 transition-all">
            Update Status
          </button>
        </div>

        {/* Assign Provider */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-gray-700">Assigned Providers ({assignments.length})</p>
            <button onClick={() => setShowAssign(!showAssign)}
              className="text-xs bg-[#7c3aed] text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-purple-700 transition-all">
              + Assign Provider
            </button>
          </div>

          {assignments.length > 0 && (
            <div className="space-y-2 mb-3">
              {assignments.map(a => (
                <div key={a._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-9 h-9 rounded-full bg-[#7c3aed] flex items-center justify-center text-white font-bold text-xs">
                    {(a.providerId?.businessName || 'P').charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{a.providerId?.businessName}</p>
                    <p className="text-xs text-gray-500 capitalize">{a.serviceType} • {a.providerId?.phone}</p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    a.status === 'accepted' ? 'bg-green-100 text-green-700' :
                    a.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>{a.status}</span>
                  <button onClick={() => onRemoveAssignment(a._id)} className="text-red-400 hover:text-red-600 text-xs font-bold">✕</button>
                </div>
              ))}
            </div>
          )}

          {showAssign && (
            <div className="border border-purple-200 rounded-xl p-4 bg-purple-50 space-y-3">
              <p className="text-sm font-bold text-purple-900">Search & Assign Provider</p>
              <div className="grid grid-cols-2 gap-2">
                <input className={inp} placeholder="City" value={providerSearch.city} onChange={e => setProviderSearch(p => ({ ...p, city: e.target.value }))} />
                <select className={sel} value={providerSearch.service} onChange={e => setProviderSearch(p => ({ ...p, service: e.target.value }))}>
                  <option value="">All Services</option>
                  {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              {providerResults.length > 0 && (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {providerResults.map(p => (
                    <button key={p._id} onClick={() => setAssignForm(f => ({ ...f, providerId: p._id }))}
                      className={`w-full text-left p-2 rounded-lg border transition-all text-sm ${
                        assignForm.providerId === p._id ? 'border-[#7c3aed] bg-white' : 'border-gray-200 bg-white hover:border-purple-300'
                      }`}>
                      <span className="font-semibold">{p.businessName}</span>
                      <span className="text-gray-500 ml-2">📍 {p.location?.city} • ⭐ {p.rating}</span>
                    </button>
                  ))}
                </div>
              )}
              <select className={sel + ' w-full'} value={assignForm.serviceType} onChange={e => setAssignForm(f => ({ ...f, serviceType: e.target.value }))}>
                <option value="">Select Service Type *</option>
                {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <input className={inp} placeholder="Note to provider (optional)" value={assignForm.adminNote} onChange={e => setAssignForm(f => ({ ...f, adminNote: e.target.value }))} />
              <button onClick={onAssign} disabled={assigning || !assignForm.providerId || !assignForm.serviceType}
                className="w-full bg-[#7c3aed] text-white py-2 rounded-xl font-semibold text-sm disabled:opacity-50 hover:bg-purple-700 transition-all">
                {assigning ? 'Assigning...' : 'Assign Provider'}
              </button>
            </div>
          )}
        </div>

        {/* Quotation */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-gray-700">Quotation</p>
            <button onClick={() => setShowQuote(!showQuote)}
              className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-green-700 transition-all">
              {request.quotation?.totalAmount ? 'Update Quote' : '+ Create Quote'}
            </button>
          </div>

          {request.quotation?.totalAmount && !showQuote && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-3">
              <p className="text-sm font-bold text-green-800">Quote Sent: ₹{request.quotation.totalAmount?.toLocaleString('en-IN')}</p>
              {request.quotation.approvedAt && <p className="text-xs text-green-600 mt-1">✅ Approved by customer</p>}
            </div>
          )}

          {showQuote && (
            <div className="border border-green-200 rounded-xl p-4 bg-green-50 space-y-3">
              {quoteForm.breakdown.map((b, i) => (
                <div key={i} className="grid grid-cols-3 gap-2">
                  <input className={inp} placeholder="Service" value={b.service} onChange={e => {
                    const br = [...quoteForm.breakdown]; br[i].service = e.target.value; setQuoteForm(f => ({ ...f, breakdown: br }))
                  }} />
                  <input type="number" className={inp} placeholder="Amount ₹" value={b.amount} onChange={e => {
                    const br = [...quoteForm.breakdown]; br[i].amount = e.target.value; setQuoteForm(f => ({ ...f, breakdown: br }))
                  }} />
                  <input className={inp} placeholder="Note" value={b.description} onChange={e => {
                    const br = [...quoteForm.breakdown]; br[i].description = e.target.value; setQuoteForm(f => ({ ...f, breakdown: br }))
                  }} />
                </div>
              ))}
              <button onClick={() => setQuoteForm(f => ({ ...f, breakdown: [...f.breakdown, { service: '', amount: '', description: '' }] }))}
                className="text-xs text-[#7c3aed] font-semibold">+ Add Line Item</button>
              <input type="number" className={inp} placeholder="Total Amount ₹ *" value={quoteForm.totalAmount} onChange={e => setQuoteForm(f => ({ ...f, totalAmount: e.target.value }))} />
              <textarea className={inp + ' h-16 resize-none'} placeholder="Notes to customer..." value={quoteForm.notes} onChange={e => setQuoteForm(f => ({ ...f, notes: e.target.value }))} />
              <button onClick={onSendQuote} disabled={sendingQuote || !quoteForm.totalAmount}
                className="w-full bg-green-600 text-white py-2 rounded-xl font-semibold text-sm disabled:opacity-50 hover:bg-green-700 transition-all">
                {sendingQuote ? 'Sending...' : '💰 Send Quote to Customer'}
              </button>
            </div>
          )}
        </div>

        {/* Status History */}
        {request.statusHistory?.length > 0 && (
          <div>
            <p className="text-sm font-bold text-gray-700 mb-2">Status History</p>
            <div className="space-y-2">
              {[...request.statusHistory].reverse().map((h, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <span className={`px-2 py-0.5 rounded-full font-bold shrink-0 ${STATUS_COLORS[h.status] || 'bg-gray-100 text-gray-600'}`}>{h.status?.replace('_',' ')}</span>
                  <span className="text-gray-500">{h.note}</span>
                  <span className="text-gray-400 ml-auto shrink-0">{new Date(h.changedAt).toLocaleDateString('en-IN')}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const Spinner = () => <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" /></div>
const inp = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-[#7c3aed] bg-white'
const sel = 'px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-[#7c3aed] bg-white'
