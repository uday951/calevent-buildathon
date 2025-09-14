import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import Navbar from '@/components/navbar'
import Homepage from '@/pages/Homepage'
import Chatbot from '@/components/Chatbot'
import { Toaster } from 'react-hot-toast'
import './App.css'

// Lazy load components for better performance
import { lazy, Suspense } from 'react'

const AllEvents = lazy(() => import('@/customer/all-events'))
const Categories = lazy(() => import('@/pages/Categories'))
const CategoryPage = lazy(() => import('@/pages/CategoryPage'))
const CategoryEvents = lazy(() => import('@/customer/category-events'))
const ComboEvents = lazy(() => import('@/customer/combo-events'))
const Providers = lazy(() => import('@/pages/Providers'))
const ComboDetails = lazy(() => import('@/pages/ComboDetails'))
const CustomerLogin = lazy(() => import('@/pages/customerLogin'))
const CustomerSignup = lazy(() => import('@/pages/customerRegister'))
const ProviderLogin = lazy(() => import('@/pages/providerLogin'))
const ProviderSignup = lazy(() => import('@/pages/providerRegister'))
const Dashboard = lazy(() => import('@/provider/dashboard'))
const PostEvent = lazy(() => import('@/provider/post-event'))
const ProviderBookingDashboard = lazy(() => import('@/provider/providerBookinDashboard'))
const EventDetail = lazy(() => import('@/customer/EventDetails'))
const BookEventForm = lazy(() => import('@/customer/BookEventForm'))
const ProviderPublicProfile = lazy(() => import('@/pages/ProviderPublicProfile'))
const CustomerBookingDashboard = lazy(() => import('@/customer/customerBookingDashboard'))
const ProviderProfile = lazy(() => import('@/provider/ProviderProfile'))
const ProviderAnalytics = lazy(() => import('@/provider/ProviderAnalytics'))
const ProviderLayout = lazy(() => import('@/provider/ProviderLayout'))
const MyEvents = lazy(() => import('@/provider/MyEvents'))
const ProviderSettings = lazy(() => import('@/provider/ProviderSettings'))
const Messages = lazy(() => import('@/provider/Messages'))
const CustomerMessages = lazy(() => import('@/customer/Messages'))
const CustomerProfile = lazy(() => import('@/pages/CustomerProfile'))
const Favorites = lazy(() => import('@/pages/Favorites'))

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
  </div>
)

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user, loading } = useAuth()
  
  if (loading) {
    return <LoadingSpinner />
  }
  
  if (!isAuthenticated) {
    return <Navigate to={`/login/${requiredRole}`} replace />
  }
  
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />
  }
  
  return children
}

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Homepage />} />
            <Route path="/events" element={<AllEvents />} />
            <Route path="/AllEvent" element={<AllEvents />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/category/:category" element={<CategoryPage />} />
            <Route path="/combo" element={<ComboEvents />} />
            <Route path="/combo/:id" element={<ComboDetails />} />
            <Route path="/providers" element={<Providers />} />
            <Route path="/event/:eventId" element={<EventDetail />} />
            <Route path="/provider/profile/:providerId" element={<ProviderPublicProfile />} />
            
            {/* Authentication Routes */}
            <Route path="/login/customer" element={<CustomerLogin />} />
            <Route path="/signup/customer" element={<CustomerSignup />} />
            <Route path="/login/provider" element={<ProviderLogin />} />
            <Route path="/signup/provider" element={<ProviderSignup />} />
            
            {/* Customer Protected Routes */}
            <Route path="/bookings" element={
              <ProtectedRoute requiredRole="customer">
                <CustomerBookingDashboard />
              </ProtectedRoute>
            } />
            <Route path="/book-event/:eventId" element={
              <ProtectedRoute requiredRole="customer">
                <BookEventForm />
              </ProtectedRoute>
            } />
            <Route path="/book/:eventId" element={
              <ProtectedRoute requiredRole="customer">
                <BookEventForm />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute requiredRole="customer">
                <CustomerProfile />
              </ProtectedRoute>
            } />
            <Route path="/favorites" element={
              <ProtectedRoute requiredRole="customer">
                <Favorites />
              </ProtectedRoute>
            } />
            <Route path="/messages" element={
              <ProtectedRoute requiredRole="customer">
                <CustomerMessages />
              </ProtectedRoute>
            } />
            
            {/* Provider Protected Routes */}
            <Route path="/provider/*" element={
              <ProtectedRoute requiredRole="provider">
                <ProviderLayout />
              </ProtectedRoute>
            }>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="events" element={<MyEvents />} />
              <Route path="post-event" element={<PostEvent />} />
              <Route path="track" element={<ProviderBookingDashboard />} />
              <Route path="messages" element={<Messages />} />
              <Route path="profile" element={<ProviderProfile />} />
              <Route path="analytics" element={<ProviderAnalytics />} />
              <Route path="settings" element={<ProviderSettings />} />
            </Route>
            
            {/* 404 Route */}
            <Route path="*" element={
              <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                  <p className="text-gray-600 mb-8">Page not found</p>
                  <a href="/" className="text-purple-600 hover:text-purple-700">
                    Go back home
                  </a>
                </div>
              </div>
            } />
          </Routes>
        </Suspense>
        <Chatbot />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              theme: {
                primary: '#4aed88',
              },
            },
          }}
        />
      </div>
    </AuthProvider>
  )
}

export default App