import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, CheckCircle, Clock, TrendingUp, DollarSign, Calendar, AlertTriangle, LogOut } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAdmin } from '@/contexts/AdminContext';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [pendingProviders, setPendingProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { admin, logout, isAuthenticated } = useAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
      return;
    }
    fetchDashboardData();
  }, [isAuthenticated, navigate]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const [statsRes, providersRes] = await Promise.all([
        fetch('http://localhost:5000/api/admin/dashboard', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:5000/api/admin/providers/pending', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const statsData = await statsRes.json();
      const providersData = await providersRes.json();

      if (statsRes.status === 401 || providersRes.status === 401) {
        toast.error('Session expired. Please log in again.');
        logout();
        return;
      }

      if (statsData.success) setStats(statsData.data);
      if (providersData.success) setPendingProviders(providersData.data);
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleProviderAction = async (providerId, action, reason = '') => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`http://localhost:5000/api/admin/providers/${providerId}/verify`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: action, reason })
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Provider ${action} successfully!`);
        setPendingProviders(prev => prev.filter(p => p._id !== providerId));
        fetchDashboardData();
      } else {
        toast.error(data.message || 'Action failed');
      }
    } catch (error) {
      console.error('Provider action error:', error);
      toast.error('Failed to process action');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Welcome, {admin?.name}</p>
          </div>
          <Button
            onClick={logout}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Providers</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.providers.total || 0}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Verification</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.providers.pending || 0}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Events</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.events || 0}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₹{stats?.revenue?.toLocaleString() || 0}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Pending Providers */}
        <Card className="mb-8">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Pending Provider Verifications</h2>
              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm">
                {pendingProviders.length} pending
              </span>
            </div>

            {pendingProviders.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No pending verifications</p>
            ) : (
              <div className="space-y-4">
                {pendingProviders.slice(0, 5).map((provider) => (
                  <div key={provider._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{provider.businessName}</h3>
                        <p className="text-sm text-gray-600">{provider.email} • {provider.phone}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {provider.categories.map((cat) => (
                            <span key={cat} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                              {cat}
                            </span>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Applied: {new Date(provider.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <Button
                          size="sm"
                          onClick={() => handleProviderAction(provider._id, 'approved')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const reason = prompt('Rejection reason:');
                            if (reason) handleProviderAction(provider._id, 'rejected', reason);
                          }}
                          className="border-red-300 text-red-600 hover:bg-red-50"
                        >
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">User Management</h3>
            <p className="text-sm text-gray-600 mb-4">Manage customers and providers</p>
            <Button className="w-full">View All Users</Button>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Analytics</h3>
            <p className="text-sm text-gray-600 mb-4">Platform performance insights</p>
            <Button className="w-full">View Analytics</Button>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Content Moderation</h3>
            <p className="text-sm text-gray-600 mb-4">Review events and content</p>
            <Button className="w-full">Moderate Content</Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;