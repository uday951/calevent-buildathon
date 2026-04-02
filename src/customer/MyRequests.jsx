import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { eventRequestsAPI } from '@/services/api'
import toast from 'react-hot-toast'

const STATUS_CONFIG = {
  pending:            { label: 'Pending Review',     color: 'bg-yellow-100 text-yellow-800',   step: 1 },
  contacted:          { label: 'Team Contacted You', color: 'bg-blue-100 text-blue-800',       step: 2 },
  providers_assigned: { label: 'Providers Assigned', color: 'bg-indigo-100 text-indigo-800',   step: 3 },
  quoted:             { label: 'Quote Ready',        color: 'bg-purple-100 text-purple-800',   step: 4 },
  approved:           { label: 'Confirmed',          color: 'bg-green-100 text-green-800',     step: 5 },
  in_progress:        { label: 'In Progress',        color: 'bg-teal-100 text-teal-800',       step: 6 },
  completed:          { label: 'Completed',          color: 'bg-emerald-100 text-emerald-800', step: 7 },
  cancelled:          { label: 'Cancelled',          color: 'bg-red-100 text-red-800',         step: 0 },
}

const TIMELINE = ['Submitted', 'Contacted', 'Assigned', 'Quoted', 'Confirmed', 'In Progress', 'Completed']

export default function MyRequests() {
  const [selected, setSelected] = useState(null)
  const queryClient = useQueryClient()

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['my-requests'],
    queryFn: () => eventRequestsAPI.getMy(),
    select: r => r.data?.requests || []
  })

  const { data: detail, isLoading: detailLoading } = useQuery({
    queryKey: ['my-request', selected],
    queryFn: () => eventRequestsAPI.getMyById(selected),
    enabled: !!selected,
    select: r => r.data
  })

  const approveMutation = useMutation({
    mutationFn: (id) => eventRequestsAPI.approveQuote(id),
    onSuccess: () => {
      toast.success('Quote approved! Your event is confirmed 🎉')
      queryClient.invalidateQueries(['my-requests'])
      queryClient.invalidateQueries(['my-request', selected])
    },
    onError: e => toast.error(e.message)
  })

  const cancelMutation = useMutation({
    mutationFn: (id) => eventRequestsAPI.cancel(id, { reason: 'Cancelled by customer' }),
    onSuccess: () => {
      toast.success('Request cancelled')
      queryClient.invalidateQueries(['my-requests'])
      setSelected(null)
    },
    onError: e => toast.error(e.message)
  })

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Event Requests</h1>
            <p className="text-gray-600 mt-1">Track the status of your event planning requests</p>
          </div>
          <Link to="/plan-my-event"
            className="bg-[#7c3aed] text-white px-6 py-3 rounded-xl font-bold hover:bg-purple-700 transition-all shadow-lg">
            + Plan New Event
          </Link>
        </div>

        {requests.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
            <div className="text-6xl mb-4">🎪</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No event requests yet</h3>
            <p className="text-gray-600 mb-6">Start planning your perfect event with CALEVENT</p>
            <Link to="/plan-my-event" className="bg-[#7c3aed] text-white px-8 py-3 rounded-xl font-bold hover:bg-purple-700 transition-all">
              Plan My Event
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* List */}
            <div className="lg:col-span-1 space-y-3">
              {requests.map(req => {
                const cfg = STATUS_CONFIG[req.status] || STATUS_CONFIG.pending
                return (
                  <button key={req._id} onClick={() => setSelected(req._id)}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all hover:shadow-md ${
                      selected === req._id ? 'border-[#7c3aed] bg-purple-50' : 'border-gray-200 bg-white'
                    }`}>
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs font-bold text-gray-400">{req.requestNumber}</span>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${cfg.color}`}>{cfg.label}</span>
                    </div>
                    <h3 className="font-bold text-gray-900 capitalize">{req.eventTitle || req.eventType} Event</h3>
                    <p className="text-sm text-gray-500 mt-1">📍 {req.location?.city} • 📅 {new Date(req.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    <p className="text-sm font-semibold text-[#7c3aed] mt-1">Budget: ₹{req.budget?.max?.toLocaleString('en-IN')}</p>
                  </button>
                )
              })}
            </div>

            {/* Detail */}
            <div className="lg:col-span-2">
              {!selected ? (
                <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                  <div className="text-5xl mb-4">👈</div>
                  <p className="text-gray-500 font-medium">Select a request to view details</p>
                </div>
              ) : detailLoading ? (
                <div className="bg-white rounded-2xl shadow-sm p-12 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
                </div>
              ) : detail ? (
                <RequestDetail
                  request={detail.request}
                  assignments={detail.assignments || []}
                  onApprove={() => approveMutation.mutate(detail.request._id)}
                  onCancel={() => cancelMutation.mutate(detail.request._id)}
                  approving={approveMutation.isPending}
                  cancelling={cancelMutation.isPending}
                />
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function RequestDetail({ request, assignments, onApprove, onCancel, approving, cancelling }) {
  const cfg = STATUS_CONFIG[request.status] || STATUS_CONFIG.pending

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-[#7c3aed] to-purple-700 p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-purple-200 text-sm font-medium">{request.requestNumber}</p>
            <h2 className="text-2xl font-bold mt-1 capitalize">{request.eventTitle || request.eventType} Event</h2>
            <p className="text-purple-200 mt-1">📍 {request.location?.city} • 📅 {new Date(request.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          <span className={`text-sm font-bold px-3 py-1.5 rounded-full ${cfg.color}`}>{cfg.label}</span>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Timeline */}
        <div>
          <h3 className="font-bold text-gray-900 mb-3">Progress</h3>
          <div className="flex items-center gap-1">
            {TIMELINE.map((s, i) => {
              const active = i < cfg.step
              return (
                <div key={i} className="flex items-center flex-1">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    active ? 'bg-[#7c3aed] text-white' : 'bg-gray-200 text-gray-400'
                  }`}>
                    {active ? '✓' : i + 1}
                  </div>
                  {i < TIMELINE.length - 1 && <div className={`flex-1 h-1 ${active ? 'bg-[#7c3aed]' : 'bg-gray-200'}`} />}
                </div>
              )
            })}
          </div>
          <div className="flex justify-between mt-1">
            {TIMELINE.map((s, i) => (
              <span key={i} className="text-[9px] text-gray-400 text-center" style={{ width: `${100 / TIMELINE.length}%` }}>{s}</span>
            ))}
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-4">
          {[
            ['Event Type',  request.eventType],
            ['Guests',      `${request.guestCount} people`],
            ['Budget',      `₹${request.budget?.min?.toLocaleString('en-IN') || 0} – ₹${request.budget?.max?.toLocaleString('en-IN')}`],
            ['Contact via', request.contactPreference],
          ].map(([label, value]) => (
            <div key={label} className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500 font-medium">{label}</p>
              <p className="font-bold text-gray-900 capitalize mt-0.5">{value}</p>
            </div>
          ))}
        </div>

        {/* Services */}
        {request.servicesRequired?.length > 0 && (
          <div>
            <h3 className="font-bold text-gray-900 mb-2">Services Requested</h3>
            <div className="flex flex-wrap gap-2">
              {request.servicesRequired.map(s => (
                <span key={s} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium capitalize">{s}</span>
              ))}
            </div>
          </div>
        )}

        {/* Assigned Providers */}
        {assignments.length > 0 && (
          <div>
            <h3 className="font-bold text-gray-900 mb-3">Assigned Providers</h3>
            <div className="space-y-3">
              {assignments.map(a => (
                <div key={a._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-[#7c3aed] flex items-center justify-center text-white font-bold text-sm">
                    {(a.providerId?.businessName || 'P').charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{a.providerId?.businessName}</p>
                    <p className="text-xs text-gray-500 capitalize">{a.serviceType} • ⭐ {a.providerId?.rating || 'N/A'}</p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    a.status === 'accepted' ? 'bg-green-100 text-green-700' :
                    a.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>{a.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quotation */}
        {request.quotation?.totalAmount && (
          <div className="border-2 border-purple-200 rounded-2xl p-5 bg-purple-50">
            <h3 className="font-bold text-gray-900 mb-3">💰 Your Quotation</h3>
            {request.quotation.breakdown?.map((b, i) => (
              <div key={i} className="flex justify-between text-sm py-1.5 border-b border-purple-100 last:border-0">
                <span className="text-gray-700 capitalize">{b.service}</span>
                <span className="font-semibold">₹{b.amount?.toLocaleString('en-IN')}</span>
              </div>
            ))}
            <div className="flex justify-between font-bold text-lg mt-3 pt-3 border-t-2 border-purple-300">
              <span>Total</span>
              <span className="text-[#7c3aed]">₹{request.quotation.totalAmount?.toLocaleString('en-IN')}</span>
            </div>
            {request.quotation.notes && <p className="text-sm text-gray-600 mt-2">{request.quotation.notes}</p>}
            {request.status === 'quoted' && (
              <button onClick={onApprove} disabled={approving}
                className="w-full mt-4 bg-[#7c3aed] text-white py-3 rounded-xl font-bold hover:bg-purple-700 transition-all disabled:opacity-60">
                {approving ? 'Approving...' : '✅ Approve & Confirm Event'}
              </button>
            )}
          </div>
        )}

        {/* Cancel */}
        {!['completed', 'cancelled', 'approved'].includes(request.status) && (
          <button onClick={onCancel} disabled={cancelling}
            className="w-full py-3 rounded-xl border-2 border-red-200 text-red-600 font-semibold hover:bg-red-50 transition-all disabled:opacity-60">
            {cancelling ? 'Cancelling...' : 'Cancel Request'}
          </button>
        )}
      </div>
    </div>
  )
}
