import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { eventRequestsAPI } from '@/services/api'
import toast from 'react-hot-toast'

const STATUS_COLORS = {
  pending:   'bg-yellow-100 text-yellow-800',
  accepted:  'bg-green-100 text-green-800',
  rejected:  'bg-red-100 text-red-800',
  completed: 'bg-emerald-100 text-emerald-800',
}

export default function ProviderAssignments() {
  const [selected, setSelected] = useState(null)
  const [filter,   setFilter]   = useState('')
  const [note,     setNote]     = useState('')
  const [quote,    setQuote]    = useState('')
  const queryClient = useQueryClient()

  const { data: assignments = [], isLoading } = useQuery({
    queryKey: ['provider-assignments', filter],
    queryFn: () => eventRequestsAPI.providerGetAssignments({ status: filter || undefined }),
    select: r => r.data?.assignments || []
  })

  const respondMutation = useMutation({
    mutationFn: ({ id, response }) => eventRequestsAPI.providerRespond(id, { response, providerNote: note, providerQuote: parseInt(quote) || 0 }),
    onSuccess: (_, { response }) => {
      toast.success(`Assignment ${response}`)
      queryClient.invalidateQueries(['provider-assignments'])
      setSelected(null); setNote(''); setQuote('')
    },
    onError: e => toast.error(e.message)
  })

  const selectedItem = assignments.find(a => a._id === selected)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Assignments</h1>
        <p className="text-gray-600 mb-6">Events assigned to you by CALEVENT team</p>

        {/* Filter tabs */}
        <div className="flex gap-3 mb-6">
          {['', 'pending', 'accepted', 'rejected', 'completed'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                filter === s ? 'bg-[#7c3aed] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-purple-300'
              }`}>
              {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
          </div>
        ) : assignments.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center">
            <div className="text-5xl mb-4">📋</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No assignments yet</h3>
            <p className="text-gray-500">CALEVENT will assign events to you based on your location and services</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* List */}
            <div className="space-y-3">
              {assignments.map(a => {
                const req = a.eventRequestId
                return (
                  <button key={a._id} onClick={() => setSelected(a._id)}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all hover:shadow-md ${
                      selected === a._id ? 'border-[#7c3aed] bg-purple-50' : 'border-gray-200 bg-white'
                    }`}>
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs font-bold text-gray-400">{req?.requestNumber}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[a.status]}`}>{a.status}</span>
                    </div>
                    <h3 className="font-bold text-gray-900 capitalize">{req?.eventTitle || req?.eventType} Event</h3>
                    <p className="text-sm text-gray-500">🔧 Service: <span className="font-semibold capitalize">{a.serviceType}</span></p>
                    <p className="text-sm text-gray-500">📍 {req?.location?.city} • 📅 {req?.eventDate ? new Date(req.eventDate).toLocaleDateString('en-IN') : 'TBD'}</p>
                    <p className="text-sm text-gray-500">👥 {req?.guestCount} guests • Budget: ₹{req?.budget?.max?.toLocaleString('en-IN')}</p>
                    {a.status === 'pending' && (
                      <div className="mt-2 inline-block bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded-full">⏳ Awaiting your response</div>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Detail */}
            <div>
              {!selectedItem ? (
                <div className="bg-white rounded-2xl p-12 text-center text-gray-400">Select an assignment to view details</div>
              ) : (
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-[#7c3aed] to-purple-700 p-5 text-white">
                    <p className="text-purple-200 text-xs">{selectedItem.eventRequestId?.requestNumber}</p>
                    <h2 className="text-xl font-bold capitalize">{selectedItem.eventRequestId?.eventTitle || selectedItem.eventRequestId?.eventType} Event</h2>
                    <p className="text-purple-200 text-sm">Service: <span className="font-bold capitalize">{selectedItem.serviceType}</span></p>
                  </div>

                  <div className="p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        ['Date',     selectedItem.eventRequestId?.eventDate ? new Date(selectedItem.eventRequestId.eventDate).toLocaleDateString('en-IN') : 'TBD'],
                        ['Location', selectedItem.eventRequestId?.location?.city],
                        ['Guests',   `${selectedItem.eventRequestId?.guestCount} people`],
                        ['Budget',   `₹${selectedItem.eventRequestId?.budget?.max?.toLocaleString('en-IN')}`],
                      ].map(([l, v]) => (
                        <div key={l} className="bg-gray-50 rounded-xl p-3">
                          <p className="text-xs text-gray-500">{l}</p>
                          <p className="font-semibold text-gray-900 text-sm">{v}</p>
                        </div>
                      ))}
                    </div>

                    {selectedItem.eventRequestId?.servicesRequired?.length > 0 && (
                      <div>
                        <p className="text-sm font-bold text-gray-700 mb-2">All Services Needed</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedItem.eventRequestId.servicesRequired.map(s => (
                            <span key={s} className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                              s === selectedItem.serviceType ? 'bg-[#7c3aed] text-white' : 'bg-gray-100 text-gray-600'
                            }`}>{s}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedItem.eventRequestId?.description && (
                      <div className="bg-blue-50 rounded-xl p-3">
                        <p className="text-xs font-bold text-blue-700 mb-1">Customer's Vision</p>
                        <p className="text-sm text-blue-900">{selectedItem.eventRequestId.description}</p>
                      </div>
                    )}

                    {selectedItem.adminNote && (
                      <div className="bg-yellow-50 rounded-xl p-3">
                        <p className="text-xs font-bold text-yellow-700 mb-1">Note from CALEVENT</p>
                        <p className="text-sm text-yellow-900">{selectedItem.adminNote}</p>
                      </div>
                    )}

                    {selectedItem.status === 'pending' && (
                      <div className="border border-gray-200 rounded-xl p-4 space-y-3">
                        <p className="text-sm font-bold text-gray-700">Your Response</p>
                        <input type="number" className={inp} placeholder="Your quote for this service (₹)" value={quote} onChange={e => setQuote(e.target.value)} />
                        <textarea className={`${inp} h-20 resize-none`} placeholder="Add a note (optional)..." value={note} onChange={e => setNote(e.target.value)} />
                        <div className="grid grid-cols-2 gap-3">
                          <button onClick={() => respondMutation.mutate({ id: selectedItem._id, response: 'accepted' })}
                            disabled={respondMutation.isPending}
                            className="py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all disabled:opacity-60">
                            ✅ Accept
                          </button>
                          <button onClick={() => respondMutation.mutate({ id: selectedItem._id, response: 'rejected' })}
                            disabled={respondMutation.isPending}
                            className="py-3 border-2 border-red-300 text-red-600 rounded-xl font-bold hover:bg-red-50 transition-all disabled:opacity-60">
                            ❌ Decline
                          </button>
                        </div>
                      </div>
                    )}

                    {selectedItem.status !== 'pending' && (
                      <div className={`rounded-xl p-4 ${STATUS_COLORS[selectedItem.status]}`}>
                        <p className="font-bold capitalize">Status: {selectedItem.status}</p>
                        {selectedItem.providerNote   && <p className="text-sm mt-1">Your note: {selectedItem.providerNote}</p>}
                        {selectedItem.providerQuote > 0 && <p className="text-sm mt-1">Your quote: ₹{selectedItem.providerQuote.toLocaleString('en-IN')}</p>}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const inp = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-[#7c3aed]'
