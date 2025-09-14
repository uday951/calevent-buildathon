import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Camera, Save, MapPin, Phone, Mail, Globe, Star, Users, Calendar, Eye, Edit, Trash2, Upload, X, Heart } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Link } from 'react-router-dom'
import { providersAPI, eventsAPI } from '../services/api'
import toast from 'react-hot-toast'

const ProviderProfile = () => {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const fileInputRef = useRef(null)
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    description: '',
    specialties: [],
    experience: '',
    teamSize: '',
    profileImage: '',
    rating: 0,
    reviewCount: 0
  })
  const [stats, setStats] = useState({
    totalEvents: 0,
    thisMonth: 0,
    successRate: 0,
    responseTime: '',
    followersCount: 0
  })

  useEffect(() => {
    fetchProfileData()
    fetchStats()
    fetchMyEvents()
  }, [])

  const fetchProfileData = async () => {
    try {
      const response = await providersAPI.getMyProfile()
      if (response.success) {
        setProfileData(response.data)
      }
    } catch (error) {
      toast.error('Failed to load profile data')
      console.error('Profile fetch error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await providersAPI.getDashboardStats()
      if (response.success) {
        setStats({
          totalEvents: response.data.overview?.totalEvents || 0,
          thisMonth: response.data.overview?.pendingBookings || 0,
          successRate: response.data.overview?.completedBookings || 0,
          responseTime: '< 2 hours',
          followersCount: response.data.overview?.followersCount || 0,
          reviewsCount: response.data.overview?.reviewsCount || 0
        })
      }
    } catch (error) {
      console.error('Stats fetch error:', error)
    }
  }

  const fetchMyEvents = async () => {
    try {
      const response = await providersAPI.searchEvents()
      if (response.success) {
        setMyEvents(response.data.events || [])
      }
    } catch (error) {
      console.error('Events fetch error:', error)
    }
  }

  const [myEvents, setMyEvents] = useState([
    {
      id: 1,
      title: 'Premium Wedding Package',
      category: 'Wedding',
      price: 250000,
      location: 'Mumbai, Maharashtra',
      maxGuests: 500,
      status: 'active',
      bookings: 12,
      views: 245,
      image: '/src/public/people-8552338_1280.jpg',
      createdDate: '2024-01-15'
    },
    {
      id: 2,
      title: 'Corporate Event Standard',
      category: 'Corporate',
      price: 150000,
      location: 'Mumbai, Maharashtra',
      maxGuests: 200,
      status: 'active',
      bookings: 8,
      views: 189,
      image: '/src/public/Ryan-360x290.jpg',
      createdDate: '2024-01-20'
    },
    {
      id: 3,
      title: 'Birthday Celebration',
      category: 'Birthday',
      price: 75000,
      location: 'Mumbai, Maharashtra',
      maxGuests: 100,
      status: 'draft',
      bookings: 0,
      views: 45,
      image: '/src/public/pexels-gabby-k-5876695.jpg',
      createdDate: '2024-02-01'
    }
  ])

  const handleImageSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB')
        return
      }
      
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please select a valid image file (JPEG, PNG, WebP)')
        return
      }
      
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onload = (e) => setImagePreview(e.target.result)
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setSelectedImage(null)
    setImagePreview('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const formData = new FormData()
      formData.append('businessName', profileData.businessName || profileData.name)
      formData.append('phone', profileData.phone)
      formData.append('website', profileData.website)
      formData.append('description', profileData.description)
      formData.append('experience', profileData.experience)
      formData.append('teamSize', profileData.teamSize)
      
      // Add profile image if selected
      if (selectedImage) {
        formData.append('profileImage', selectedImage)
      }
      
      // Handle location as JSON
      const location = {
        city: profileData.address || profileData.location?.city,
        state: profileData.location?.state || '',
        country: profileData.location?.country || 'India'
      }
      formData.append('location', JSON.stringify(location))
      
      if (profileData.categories) {
        formData.append('categories', JSON.stringify(profileData.categories))
      }

      const response = await providersAPI.updateProfile(formData)
      if (response.success) {
        setProfileData(response.data.provider || response.data)
        toast.success('Profile updated successfully!')
        setIsEditing(false)
        setSelectedImage(null)
        setImagePreview('')
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#333f63] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Provider Profile</h1>
            <p className="text-gray-600 mt-2">Manage your business information and settings</p>
          </div>
          <div className="flex items-center space-x-3">
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Image & Basic Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="relative inline-block mb-4">
                  <img
                    src={imagePreview || profileData.profileImage || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiByeD0iNjQiIGZpbGw9IiNGM0Y0RjYiLz4KPHN2ZyB4PSIzMiIgeT0iMzIiIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiI+CjxwYXRoIGQ9Im0yMCAyMS0yLTJtLTItMmEzIDMgMCAwIDEtMy0zVjlhNSA1IDAgMCAxIDEwIDB2NWEzIDMgMCAwIDEtMyAzeiIvPgo8L3N2Zz4KPC9zdmc+'}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-gray-200"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiByeD0iNjQiIGZpbGw9IiNGM0Y0RjYiLz4KPHN2ZyB4PSIzMiIgeT0iMzIiIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiI+CjxwYXRoIGQ9Im0yMCAyMS0yLTJtLTItMmEzIDMgMCAwIDEtMy0zVjlhNSA1IDAgMCAxIDEwIDB2NWEzIDMgMCAwIDEtMyAzeiIvPgo8L3N2Zz4KPC9zdmc+'
                    }}
                  />
                  {isEditing && (
                    <>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-0 right-0 p-2 bg-gradient-to-r from-black to-[#333f63] text-white rounded-full hover:opacity-80 transition-opacity"
                        title="Change profile picture"
                      >
                        <Camera className="w-4 h-4" />
                      </button>
                      {selectedImage && (
                        <button
                          onClick={handleRemoveImage}
                          className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                          title="Remove selected image"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </>
                  )}
                </div>
                
                {isEditing && selectedImage && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center space-x-2 text-sm text-blue-700">
                      <Upload className="w-4 h-4" />
                      <span>New image selected: {selectedImage.name}</span>
                    </div>
                    <p className="text-xs text-blue-600 mt-1">
                      Image will be uploaded when you save changes
                    </p>
                  </div>
                )}
                
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {profileData.name}
                </h2>
                
                <div className="flex items-center justify-center space-x-1 mb-4">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{profileData.rating || 0}</span>
                  <span className="text-gray-500 text-sm">({profileData.reviewCount || 0} reviews)</span>
                </div>

                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-center justify-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span>{profileData.teamSize || 'N/A'} team members</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <MapPin className="w-4 h-4" />
                    <span>{profileData.location?.city || profileData.address || 'Location not set'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Events</span>
                    <span className="font-semibold">{stats.totalEvents || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">This Month</span>
                    <span className="font-semibold">{stats.thisMonth || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Success Rate</span>
                    <span className="font-semibold text-green-600">{stats.successRate || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Response Time</span>
                    <span className="font-semibold">{stats.responseTime || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Followers</span>
                    <span className="font-semibold text-purple-600">{stats.followersCount || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Reviews</span>
                    <span className="font-semibold text-blue-600">{stats.reviewsCount || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Profile Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Name
                    </label>
                    <Input
                      value={profileData.businessName || profileData.name || ''}
                      onChange={(e) => handleInputChange('businessName', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Experience (Years)
                    </label>
                    <Input
                      value={profileData.experience}
                      onChange={(e) => handleInputChange('experience', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Description
                  </label>
                  <textarea
                    rows={4}
                    value={profileData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    disabled={!isEditing}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#333f63] focus:border-transparent resize-none disabled:bg-gray-50"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Team Size
                    </label>
                    <Input
                      type="number"
                      value={profileData.teamSize}
                      onChange={(e) => handleInputChange('teamSize', e.target.value)}
                      disabled={!isEditing}
                      placeholder="Number of team members"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Service Areas
                    </label>
                    <Input
                      value={profileData.serviceAreas || ''}
                      onChange={(e) => handleInputChange('serviceAreas', e.target.value)}
                      disabled={!isEditing}
                      placeholder="Cities you serve (comma separated)"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categories
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {profileData.categories && profileData.categories.length > 0 ? (
                      profileData.categories.map((category, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                        >
                          {category}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500 text-sm">No categories set</span>
                    )}
                  </div>
                  {isEditing && (
                    <p className="text-xs text-gray-500 mt-1">
                      Contact support to update your service categories
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        disabled={!isEditing}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        value={profileData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        disabled={!isEditing}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website
                    </label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        value={profileData.website}
                        onChange={(e) => handleInputChange('website', e.target.value)}
                        disabled={!isEditing}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        value={profileData.location?.city || profileData.address || ''}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        disabled={!isEditing}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Followers & Reviews */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FollowersSection />
              <ReviewsSection />
            </div>

            {/* My Events */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>My Events</CardTitle>
                  <Link to="/provider/post-event">
                    <Button size="sm">Add New Event</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {myEvents.map((event) => (
                    <div key={event.id} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <img
                        src={event.eventImage || '/placeholder-event.jpg'}
                        alt={event.title}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">{event.title}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            event.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {event.isActive ? 'active' : 'inactive'}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                          <span className="font-medium">₹{event.price?.toLocaleString() || 'N/A'}</span>
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-3 h-3" />
                            <span>{event.location || 'Location not set'}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="w-3 h-3" />
                            <span>Category: {event.category || 'N/A'}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{event.bookingCount || 0} bookings</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="w-3 h-3" />
                            <span>{event.rating || 0} rating</span>
                          </div>
                          <span>Created {new Date(event.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                {myEvents.length === 0 && (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h4 className="font-medium text-gray-900 mb-2">No events yet</h4>
                    <p className="text-gray-600 mb-4">Start by creating your first event</p>
                    <Link to="/provider/post-event">
                      <Button>Create Event</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

// Followers Section Component
const FollowersSection = () => {
  const [followers, setFollowers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFollowers()
  }, [])

  const fetchFollowers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/provider/followers', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      const data = await response.json()
      if (data.success) {
        setFollowers(data.data.followers || [])
      }
    } catch (error) {
      console.error('Fetch followers error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Heart className="w-5 h-5 text-red-500" />
          <span>Recent Followers</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#333f63] mx-auto"></div>
          </div>
        ) : followers.length > 0 ? (
          <div className="space-y-3">
            {followers.slice(0, 5).map((follow) => (
              <div key={follow._id} className="flex items-center space-x-3">
                <img
                  src={follow.customerId?.profileImage || '/default-avatar.png'}
                  alt={follow.customerId?.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="flex-1">
                  <p className="font-medium text-sm">{follow.customerId?.name}</p>
                  <p className="text-xs text-gray-500">
                    Followed {new Date(follow.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No followers yet</p>
        )}
      </CardContent>
    </Card>
  )
}

// Reviews Section Component
const ReviewsSection = () => {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/provider/reviews', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      const data = await response.json()
      if (data.success) {
        setReviews(data.data.reviews || [])
      }
    } catch (error) {
      console.error('Fetch reviews error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Star className="w-5 h-5 text-yellow-500" />
          <span>Recent Reviews</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#333f63] mx-auto"></div>
          </div>
        ) : reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.slice(0, 3).map((review) => (
              <div key={review._id} className="border-b border-gray-100 pb-3 last:border-b-0">
                <div className="flex items-start space-x-3">
                  <img
                    src={review.customerId?.profileImage || '/default-avatar.png'}
                    alt={review.customerId?.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="font-medium text-sm">{review.customerId?.name}</p>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < review.rating
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{review.comment}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No reviews yet</p>
        )}
      </CardContent>
    </Card>
  )
}

// Analyze decoration image with Gemini Vision
const analyzeDecorationImage = async (base64Image) => {
  const prompt = `Analyze this event decoration image and extract key features:
1. Main colors (list 2-3 dominant colors)
2. Decoration style (elegant, rustic, modern, traditional, etc.)
3. Event type (wedding, birthday, corporate, etc.)
4. Key objects/elements (flowers, drapes, lights, etc.)
5. Theme description (1-2 words)

Provide a brief description and categorize the style.`;

  const requestData = {
    contents: [{
      parts: [
        { text: prompt },
        {
          inline_data: {
            mime_type: "image/jpeg",
            data: base64Image
          }
        }
      ]
    }]
  };

  try {
    const result = await callGemini('gemini-1.5-flash', requestData);
    
    if (result.success && result.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      const analysisText = result.data.candidates[0].content.parts[0].text;
      
      // Extract features from analysis
      const features = extractFeaturesFromAnalysis(analysisText);
      
      return {
        success: true,
        description: analysisText.split('\n')[0] || 'Beautiful decoration setup',
        features
      };
    }
  } catch (error) {
    console.error('Gemini Vision error:', error);
  }
  
  return { success: false };
};

// Extract searchable features from analysis text
const extractFeaturesFromAnalysis = (text) => {
  const features = {
    colors: [],
    style: '',
    eventType: '',
    elements: [],
    theme: ''
  };
  
  // Simple keyword extraction
  const lowerText = text.toLowerCase();
  
  // Extract colors
  const colorKeywords = ['red', 'blue', 'green', 'yellow', 'pink', 'purple', 'gold', 'silver', 'white', 'black', 'orange'];
  features.colors = colorKeywords.filter(color => lowerText.includes(color));
  
  // Extract style
  const styleKeywords = ['elegant', 'rustic', 'modern', 'traditional', 'vintage', 'minimalist', 'luxury'];
  features.style = styleKeywords.find(style => lowerText.includes(style)) || 'elegant';
  
  // Extract event type
  const eventKeywords = ['wedding', 'birthday', 'corporate', 'anniversary', 'party'];
  features.eventType = eventKeywords.find(event => lowerText.includes(event)) || 'wedding';
  
  return features;
};

// Find matching providers based on features
const findMatchingProviders = async (features) => {
  try {
    // Simple matching based on categories and description keywords
    const searchTerms = [
      features.eventType,
      features.style,
      ...features.colors
    ].filter(Boolean);
    
    const providers = await Provider.find({
      $or: [
        { categories: features.eventType },
        { description: new RegExp(searchTerms.join('|'), 'i') },
        { businessName: new RegExp(features.style, 'i') }
      ],
      isActive: true
    })
    .select('name businessName rating totalReviews location.city profileImage categories description')
    .limit(3);

    return providers.map(provider => ({
      id: provider._id,
      name: provider.businessName || provider.name,
      rating: provider.rating || 4.5,
      reviews: provider.totalReviews || 0,
      location: provider.location?.city || 'India',
      image: provider.profileImage ? `http://localhost:5000/${provider.profileImage.replace(/\\/g, '/')}` : null,
      categories: provider.categories,
      price: '₹50,000 - ₹2,00,000' // Sample pricing
    }));
  } catch (error) {
    console.error('Provider matching error:', error);
    return [];
  }
};

// Format response for image analysis
const formatImageAnalysisResponse = (description, matches) => {
  if (matches.length === 0) {
    return {
      text: `${description}\n\n🎨 I couldn't find exact matches, but here are some related themes you might like:\n• Royal wedding decor\n• Minimal stage setup\n• Floral arrangements\n\nTry uploading another image or browse providers by category!`,
      suggestions: ['Show Weddings', 'Corporate Events', 'Browse Providers']
    };
  }

  const matchText = matches.map((provider, i) => 
    `${i + 1}. **${provider.name}**\n   ⭐ ${provider.rating} (${provider.reviews} reviews)\n   📍 ${provider.location}\n   💰 ${provider.price}`
  ).join('\n\n');

  return {
    text: `🎨 **${description}**\n\n✨ Here are 3 providers with similar decoration styles:\n\n${matchText}\n\n💡 Would you like to view their full packages or see more similar designs?`,
    suggestions: ['View Full Package', 'More Similar Designs', 'Upload Another Image']
  };
};

export default ProviderProfile