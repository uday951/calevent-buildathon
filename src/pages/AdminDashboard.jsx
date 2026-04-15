import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, CheckCircle, Clock, DollarSign, Calendar,
  AlertTriangle, LogOut, ClipboardList, UserCheck,
  ChevronDown, X, RefreshCw, Eye
} from 'lucide-react';
import { useAdmin } from '@/contexts/AdminContext';
import toast from 'react-hot-toast';

const API = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const adminFetch = (url, options = {}) => {
  const token = localStorage.getItem('adminToken');
  return fetch(`${API}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers
    }
  });
};

const STATUS_LABELS = {
  pending:            { label: 'Pending Review',    color: 'bg-yellow-100 text-yellow-800' },
  contacted:          { label: 'Contacted',         color: 'bg-blue-100 text-blue-800' },
  providers_assigned: { label: 'Provider Assigned', color: 'bg-indigo-100 text-indigo-800' },
  quoted:             { label: 'Quote Sent',        color: 'bg-purple-100 text-purple-800' },
  approved:           { label: 'Confirmed',         color: 'bg-green-100 text-green-800' },
  in_progress:        { label: 'In Progress',       color: 'bg-teal-100 text-teal-800' },
  completed:          { label: 'Completed',         color: 'bg-emerald-100 text-emerald-800' },
  cancelled:          { label: 'Cancelled',         color: 'bg-red-100 text-red-800' },
};

// ─── STAT CARD ───────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

// ─── ASSIGN PROVIDER MODAL ───────────────────────────────────────────────────
const AssignModal = ({ request, onClose, onAssigned }) => {
  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    adminFetch(`/api/event-requests/admin/${request._id}`)
      .then(r => r.json())
      .then(d => { if (d.success) setProviders(d.data.availableProviders); });
  }, [request._id]);

  const handleAssign = async () => {
    if (!selectedProvider) return toast.error('Please select a provider');
    setLoading(true);
    try {
      const res = await adminFetch(`/api/event-requests/admin/${request._id}/assign-provider`, {
        method: 'POST',
        body: JSON.stringify({ providerId: selectedProvider, serviceType })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        onAssigned();
        onClose();
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error('Failed to assign provider');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-lg font-bold text-gray-900">Assign Provider</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-1">
            <p><span className="font-medium">Customer:</span> {request.customerId?.name}</p>
            <p><span className="font-medium">Event:</span> {request.eventTitle || request.eventType}</p>
            <p><span className="font-medium">Date:</span> {new Date(request.eventDate).toLocaleDateString()}</p>
            <p><span className="font-medium">Location:</span> {request.location?.city}</p>
            <p><span className="font-medium">Guests:</span> {request.guestCount}</p>
            <p><span className="font-medium">Budget:</span> ₹{request.budget?.max?.toLocaleString()}</p>
            <p><span className="font-medium">Services:</span> {request.servicesRequired?.join(', ')}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Provider ({providers.length} available)
            </label>
            {providers.length === 0 ? (
              <p className="text-sm text-red-500">No verified providers available.</p>
            ) : (
              <select
                value={selectedProvider}
                onChange={e => setSelectedProvider(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
              >
                <option value="">-- Choose a provider --</option>
                {providers.map(p => (
                  <option key={p._id} value={p._id}>
                    {p.businessName || p.name} — {p.location?.city || 'N/A'} (⭐ {p.rating || 'New'})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Service Type (optional)</label>
            <input
              value={serviceType}
              onChange={e => setServiceType(e.target.value)}
              placeholder="e.g. decoration, catering..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>
        </div>
        <div className="flex gap-3 p-5 border-t">
          <button
            onClick={handleAssign}
            disabled={loading || !selectedProvider}
            className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold py-2 rounded-lg transition"
          >
            {loading ? 'Assigning...' : 'Assign Provider'}
          </button>
          <button onClick={onClose} className="flex-1 border border-gray-300 text-gray-700 font-semibold py-2 rounded-lg hover:bg-gray-50 transition">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── REQUESTS TAB (Event Requests from customers) ────────────────────────────
const BookingsTab = () => {
  const [requests, setRequests] = useState([]);
  const [statusCounts, setStatusCounts] = useState({});
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [assignTarget, setAssignTarget] = useState(null);

  const load = useCallback(async () => {
    try {
      const params = filter !== 'all' ? `?status=${filter}` : '';
      const res = await adminFetch(`/api/event-requests/admin/all${params}`);
      const data = await res.json();
      console.log('📡 /api/event-requests/admin/all response:', data);
      if (data.success) {
        setRequests(data.data.requests);
        setStatusCounts(data.data.statusCounts || {});
      } else {
        toast.error(data.message || 'Failed to load requests');
      }
    } catch (err) {
      console.error('❌ load error:', err);
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  // Initial load + auto-refresh every 8 seconds
  useEffect(() => {
    load();
    const interval = setInterval(load, 8000);
    return () => clearInterval(interval);
  }, [load]);

  const handleStatusChange = async (requestId, status) => {
    try {
      const res = await adminFetch(`/api/event-requests/admin/${requestId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) { toast.success(data.message); load(); }
      else toast.error(data.message);
    } catch {
      toast.error('Failed to update status');
    }
  };

  const STATUS_LABELS = {
    pending:            { label: 'Pending Review',    color: 'bg-yellow-100 text-yellow-800' },
    contacted:          { label: 'Contacted',         color: 'bg-blue-100 text-blue-800' },
    providers_assigned: { label: 'Provider Assigned', color: 'bg-indigo-100 text-indigo-800' },
    quoted:             { label: 'Quote Sent',        color: 'bg-purple-100 text-purple-800' },
    approved:           { label: 'Confirmed',         color: 'bg-green-100 text-green-800' },
    in_progress:        { label: 'In Progress',       color: 'bg-teal-100 text-teal-800' },
    completed:          { label: 'Completed',         color: 'bg-emerald-100 text-emerald-800' },
    cancelled:          { label: 'Cancelled',         color: 'bg-red-100 text-red-800' },
  };

  const filterTabs = [
    { key: 'all',               label: 'All' },
    { key: 'pending',           label: 'Pending' },
    { key: 'contacted',         label: 'Contacted' },
    { key: 'providers_assigned', label: 'Assigned' },
    { key: 'quoted',            label: 'Quoted' },
    { key: 'approved',          label: 'Confirmed' },
    { key: 'in_progress',       label: 'In Progress' },
    { key: 'completed',         label: 'Completed' },
    { key: 'cancelled',         label: 'Cancelled' },
  ];

  // Debug: log what we're getting
  console.log('📋 Admin requests loaded:', requests.length, requests.map(r => ({ id: r.requestNumber, status: r.status, type: r.eventType })));

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-5">
        {filterTabs.map(t => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
              filter === t.key ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {t.label}
            {t.key !== 'all' && statusCounts[t.key] ? (
              <span className="ml-1.5 bg-white/30 px-1.5 rounded-full text-xs">{statusCounts[t.key]}</span>
            ) : null}
          </button>
        ))}
        <button onClick={load} className="ml-auto p-1.5 text-gray-500 hover:text-gray-700">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p>No event requests found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map(r => {
            const st = STATUS_LABELS[r.status] || STATUS_LABELS.pending;
            return (
              <div key={r._id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-sm transition">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs font-bold text-gray-400">{r.requestNumber}</span>
                      <span className="font-semibold text-gray-900 text-sm capitalize">
                        {r.eventTitle || r.eventType} Event
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${st.color}`}>
                        {st.label}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 space-y-0.5">
                      <p>👤 {r.customerId?.name} • {r.customerId?.phone}</p>
                      <p>📅 {new Date(r.eventDate).toLocaleDateString()} • 📍 {r.location?.city}</p>
                      <p>👥 {r.guestCount} guests • 💰 Budget: ₹{r.budget?.max?.toLocaleString()}</p>
                      <p>🛠 {r.servicesRequired?.join(', ')}</p>
                      {r.assignments?.length > 0 && (
                        <p className="text-purple-600 font-medium">
                          🏢 Assigned: {r.assignments.map(a => a.providerId?.businessName || a.providerId?.name).join(', ')}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 shrink-0">
                    {r.status === 'pending' && (
                      <button
                        onClick={() => handleStatusChange(r._id, 'contacted')}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition"
                      >
                        Mark Contacted
                      </button>
                    )}

                    {['pending', 'contacted', 'providers_assigned'].includes(r.status) && (
                      <button
                        onClick={() => setAssignTarget(r)}
                        className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg transition"
                      >
                        {r.assignments?.length > 0 ? 'Add Provider' : 'Assign Provider'}
                      </button>
                    )}

                    {!['completed', 'cancelled', 'pending'].includes(r.status) && (
                      <select
                        defaultValue=""
                        onChange={e => { if (e.target.value) handleStatusChange(r._id, e.target.value); }}
                        className="text-xs border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      >
                        <option value="" disabled>Update Status</option>
                        <option value="quoted">Send Quote</option>
                        <option value="approved">Confirm</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancel</option>
                      </select>
                    )}

                    {r.status === 'pending' && (
                      <button
                        onClick={() => handleStatusChange(r._id, 'cancelled')}
                        className="px-3 py-1.5 border border-red-300 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-50 transition"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {assignTarget && (
        <AssignModal
          request={assignTarget}
          onClose={() => setAssignTarget(null)}
          onAssigned={load}
        />
      )}
    </div>
  );
};

// ─── PROVIDERS TAB ───────────────────────────────────────────────────────────
const ProvidersTab = () => {
  const [providers, setProviders] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch(`/api/admin/providers?status=${filter}`);
      const data = await res.json();
      if (data.success) setProviders(data.data);
    } catch {
      toast.error('Failed to load providers');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const handleVerify = async (providerId, status, reason = '') => {
    try {
      const res = await adminFetch(`/api/admin/providers/${providerId}/verify`, {
        method: 'PATCH',
        body: JSON.stringify({ status, reason })
      });
      const data = await res.json();
      if (data.success) { toast.success(data.message); load(); }
      else toast.error(data.message);
    } catch {
      toast.error('Action failed');
    }
  };

  return (
    <div>
      <div className="flex gap-2 mb-5">
        {['pending', 'approved', 'rejected', 'all'].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium capitalize transition ${
              filter === s ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {s}
          </button>
        ))}
        <button onClick={load} className="ml-auto p-1.5 text-gray-500 hover:text-gray-700">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : providers.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <UserCheck className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p>No providers found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {providers.map(p => (
            <div key={p._id} className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900">{p.businessName}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      p.verificationStatus === 'approved' ? 'bg-green-100 text-green-700' :
                      p.verificationStatus === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {p.verificationStatus}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{p.email} • {p.phone}</p>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {p.categories?.map(c => (
                      <span key={c} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full">{c}</span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    📍 {p.location?.city || 'N/A'} • Applied {new Date(p.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {p.verificationStatus === 'pending' && (
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleVerify(p._id, 'approved')}
                      className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg transition flex items-center gap-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Approve
                    </button>
                    <button
                      onClick={() => {
                        const reason = window.prompt('Rejection reason:');
                        if (reason !== null) handleVerify(p._id, 'rejected', reason);
                      }}
                      className="px-3 py-1.5 border border-red-300 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-50 transition flex items-center gap-1"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" /> Reject
                    </button>
                  </div>
                )}

                {p.verificationStatus === 'approved' && (
                  <button
                    onClick={() => handleVerify(p._id, 'rejected', 'Suspended by admin')}
                    className="px-3 py-1.5 border border-red-300 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-50 transition"
                  >
                    Suspend
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── USERS TAB ───────────────────────────────────────────────────────────────
const UsersTab = () => {
  const [users, setUsers] = useState([]);
  const [type, setType] = useState('customers');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch(`/api/admin/users?type=${type}`);
      const data = await res.json();
      if (data.success) setUsers(data.data);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => { load(); }, [load]);

  const toggleStatus = async (userId, currentStatus) => {
    const action = currentStatus ? 'suspend' : 'activate';
    const reason = action === 'suspend' ? window.prompt('Suspension reason:') : '';
    if (action === 'suspend' && reason === null) return;

    try {
      const userType = type === 'providers' ? 'provider' : 'customer';
      const res = await adminFetch(`/api/admin/users/${userId}/${userType}/toggle-status`, {
        method: 'PATCH',
        body: JSON.stringify({ action, reason })
      });
      const data = await res.json();
      if (data.success) { toast.success(data.message); load(); }
      else toast.error(data.message);
    } catch {
      toast.error('Action failed');
    }
  };

  return (
    <div>
      <div className="flex gap-2 mb-5">
        {['customers', 'providers'].map(t => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium capitalize transition ${
              type === t ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {t}
          </button>
        ))}
        <button onClick={load} className="ml-auto p-1.5 text-gray-500 hover:text-gray-700">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="space-y-2">
          {users.map(u => (
            <div key={u._id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 text-sm">{u.name || u.businessName}</p>
                <p className="text-xs text-gray-500">{u.email} • {u.phone}</p>
                <p className="text-xs text-gray-400">Joined {new Date(u.createdAt).toLocaleDateString()}</p>
              </div>
              <button
                onClick={() => toggleStatus(u._id, u.isActive)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                  u.isActive
                    ? 'border border-red-300 text-red-600 hover:bg-red-50'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {u.isActive ? 'Suspend' : 'Activate'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── MAIN DASHBOARD ──────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('bookings');
  const { admin, logout, isAuthenticated } = useAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) { navigate('/admin/login'); return; }
    Promise.all([
      adminFetch('/api/admin/dashboard').then(r => r.json()),
      adminFetch('/api/event-requests/admin/stats').then(r => r.json())
    ])
      .then(([dashData, reqData]) => {
        if (dashData.success) setStats({ ...dashData.data, requests: reqData.data });
      })
      .catch(() => toast.error('Failed to load stats'));
  }, [isAuthenticated, navigate]);

  const tabs = [
    { id: 'bookings', label: 'Bookings', icon: ClipboardList },
    { id: 'providers', label: 'Providers', icon: UserCheck },
    { id: 'users', label: 'Users', icon: Users }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">CALEVENT Admin</h1>
          <p className="text-xs text-gray-500">Welcome, {admin?.name}</p>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 transition"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard icon={ClipboardList} label="Pending Requests" value={stats?.requests?.pending ?? '—'} color="bg-yellow-500" />
          <StatCard icon={Calendar} label="Total Requests" value={stats?.requests?.total ?? '—'} color="bg-blue-500" />
          <StatCard icon={UserCheck} label="Pending Providers" value={stats?.providers?.pending ?? '—'} color="bg-orange-500" />
          <StatCard icon={DollarSign} label="Monthly Revenue" value={stats ? `₹${((stats.revenue || 0) / 1000).toFixed(0)}K` : '—'} color="bg-green-500" />
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="flex border-b border-gray-100">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-5 py-4 text-sm font-medium transition border-b-2 ${
                  activeTab === t.id
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <t.icon className="w-4 h-4" />
                {t.label}
                {t.id === 'bookings' && stats?.requests?.pending > 0 && (
                  <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {stats.requests.pending}
                  </span>
                )}
                {t.id === 'providers' && stats?.providers?.pending > 0 && (
                  <span className="bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {stats.providers.pending}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="p-5">
            {activeTab === 'bookings' && <BookingsTab />}
            {activeTab === 'providers' && <ProvidersTab />}
            {activeTab === 'users' && <UsersTab />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
