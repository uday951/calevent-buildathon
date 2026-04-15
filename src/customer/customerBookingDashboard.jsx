import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, MapPin, Users, Search, RefreshCw, Plus } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

const STATUS_CONFIG = {
  pending:            { label: '⏳ Pending Review',     color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  contacted:          { label: '📞 Team Contacted',     color: 'bg-blue-100 text-blue-800 border-blue-200' },
  providers_assigned: { label: '🏢 Provider Assigned',  color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  quoted:             { label: '💰 Quote Ready',        color: 'bg-purple-100 text-purple-800 border-purple-200' },
  approved:           { label: '✅ Confirmed',           color: 'bg-green-100 text-green-800 border-green-200' },
  in_progress:        { label: '🔧 In Progress',        color: 'bg-teal-100 text-teal-800 border-teal-200' },
  completed:          { label: '🎉 Completed',          color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  cancelled:          { label: '❌ Cancelled',          color: 'bg-red-100 text-red-800 border-red-200' },
}

const CustomerBookingDashboard = () => {
  const { isAuthenticated } = useAuth()
  const [activeTab, setActiveTab] = useState('all')
  const [search, setSearch] = useState('')

  const { data: requests = [], isLoading, refetch } = useQuery({
    queryKey: ['my-event-requests'],
    queryFn: async () => {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('Not authenticated')

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/event-requests/my`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const data = await res.json()
      if (!data.success) throw new Error(data.message)
      return data.data.requests || []
    },
    enabled: isAuthenticated,
    refetchInterval: 15000,
    staleTime: 5000,
    onError: (err) => toast.error(err.message || 'Failed to fetch requests')
  })

  const tabs = [
    { id: 'all',       label: 'All',       count: requests.length },
    { id: 'pending',   label: 'Pending',   count: requests.filter(r => r.status === 'pending').length },
    { id: 'active',    label: 'Active',    count: requests.filter(r => ['contacted','providers_assigned','quoted','approved','in_progress'].includes(r.status)).length },
    { id: 'completed', label: 'Completed', count: requests.filter(r => r.status === 'completed').length },
    { id: 'cancelled', label: 'Cancelled', count: requests.filter(r => r.status === 'cancelled').length },
  ]

  const filtered = requests.filter(r => {
    const matchTab =
      activeTab === 'all' ? true :
      activeTab === 'active' ? ['contacted','providers_assigned','quoted','approved','in_progress'].includes(r.status) :
      r.status === activeTab

    const title = (r.eventTitle || r.eventType || '').toLowerCase()
    const city  = (r.location?.city || '').toLowerCase()
    const matchSearch = title.includes(search.toLowerCase()) || city.includes(search.toLowerCase())

    return matchTab && matchSearch
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-40 bg-gray-200 rounded-xl animate-pulse" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Event Requests</h1>
            <p className="text-sm text-gray-500 mt-0.5">Track your requests and admin updates in real-time</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => refetch()}
              className="p-2 text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <Link to="/plan-my-event">
              <Button className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700">
                <Plus className="w-4 h-4" /> New Request
              </Button>
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-5 border-b border-gray-200 overflow-x-auto">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                activeTab === t.id
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
              <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
                activeTab === t.id ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500'
              }`}>
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search by event name or city..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Empty state */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
            <div className="text-5xl mb-4">🎪</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No requests found</h3>
            <p className="text-gray-500 mb-6 text-sm">
              {requests.length === 0
                ? "You haven't submitted any event requests yet."
                : "No requests match your current filter."}
            </p>
            <Link to="/plan-my-event">
              <Button className="bg-purple-600 hover:bg-purple-700">Plan My Event</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((r, i) => {
              const st = STATUS_CONFIG[r.status] || STATUS_CONFIG.pending
              const assignedProviders = r.assignments?.filter(a => a.providerId) || []

              return (
                <motion.div
                  key={r._id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="overflow-hidden">
                    <CardContent className="p-5">
                      {/* Top row */}
                      <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-gray-400">{r.requestNumber}</span>
                            <h3 className="font-bold text-gray-900 capitalize">
                              {r.eventTitle || r.eventType} Event
                            </h3>
                          </div>
                          <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {new Date(r.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                              {r.location?.city || '—'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-3.5 h-3.5" />
                              {r.guestCount} guests
                            </span>
                          </div>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${st.color}`}>
                          {st.label}
                        </span>
                      </div>

                      {/* Budget & services */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium">
                          💰 Budget: ₹{r.budget?.max?.toLocaleString('en-IN')}
                        </span>
                        {r.servicesRequired?.slice(0, 4).map(s => (
                          <span key={s} className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-full capitalize">
                            {s}
                          </span>
                        ))}
                        {r.servicesRequired?.length > 4 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                            +{r.servicesRequired.length - 4} more
                          </span>
                        )}
                      </div>

                      {/* Assigned providers */}
                      {assignedProviders.length > 0 ? (
                        <div className="bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-2 mb-3">
                          <p className="text-xs text-indigo-500 font-semibold mb-1">Assigned Providers</p>
                          <div className="space-y-1">
                            {assignedProviders.map((a, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                  {(a.providerId?.businessName || a.providerId?.name || 'P').charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <span className="text-xs font-semibold text-gray-900">
                                    {a.providerId?.businessName || a.providerId?.name}
                                  </span>
                                  {a.serviceType && (
                                    <span className="text-xs text-gray-500 ml-1">• {a.serviceType}</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        r.status === 'pending' && (
                          <div className="bg-yellow-50 border border-yellow-100 rounded-lg px-3 py-2 mb-3">
                            <p className="text-xs text-yellow-700">
                              ⏳ Our team is reviewing your request and will contact you within 24 hours.
                            </p>
                          </div>
                        )
                      )}

                      {/* Quotation */}
                      {r.quotation?.totalAmount && (
                        <div className="bg-purple-50 border border-purple-200 rounded-lg px-3 py-2 mb-3">
                          <p className="text-xs text-purple-600 font-semibold mb-1">💰 Quotation from CALEVENT</p>
                          <p className="text-lg font-bold text-purple-700">
                            ₹{r.quotation.totalAmount.toLocaleString('en-IN')}
                          </p>
                          {r.quotation.notes && (
                            <p className="text-xs text-gray-600 mt-1">{r.quotation.notes}</p>
                          )}
                        </div>
                      )}

                      {/* Admin notes */}
                      {r.adminNotes && (
                        <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 mb-3">
                          <p className="text-xs text-blue-500 font-semibold mb-0.5">Note from team</p>
                          <p className="text-xs text-blue-700">{r.adminNotes}</p>
                        </div>
                      )}

                      {/* Submitted date */}
                      <p className="text-xs text-gray-400">
                        Submitted {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default CustomerBookingDashboard
