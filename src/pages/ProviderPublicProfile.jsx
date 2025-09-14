import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Star, MapPin, Phone, Mail, Calendar, Users, 
  CheckCircle, Award, Clock, MessageSquare, Heart,
  Share2, ArrowLeft, ExternalLink, UserPlus, UserCheck
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import EventCard from '@/components/EventCard'
import ReviewModal from '@/components/ReviewModal'
import MessageModal from '@/components/MessageModal'
import { formatPrice, formatDate, getImageUrl } from '@/lib/utils'
import { Link } from 'react-router-dom'
import { providersAPI, eventsAPI, customerAPI } from '@/services/api'
import { toast } from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'

const ProviderPublicProfile = () => {
  const { providerId } = useParams()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('about')
  const [isFollowing, setIsFollowing] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [showMessageModal, setShowMessageModal] = useState(false)
  const [userReview, setUserReview] = useState(null)
  const queryClient = useQueryClient()

  const tabs = [
    { id: 'about', label: 'About' },
    { id: 'events', label: 'Events' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'reviews', label: 'Reviews' }
  ]

  // Fetch real provider data
  const { data: providerData, isLoading } = useQuery({
    queryKey: ['provider-profile', providerId],
    queryFn: async () => {
      const response = await providersAPI.getProviderProfile(providerId)
      return response.data
    }
  })

  const provider = providerData?.provider

  const { data: eventsData = [] } = useQuery({
    queryKey: ['provider-events', providerId],
    queryFn: async () => {
      const response = await eventsAPI.getAllEvents({ providerId })
      return response.data?.events || []
    },
    enabled: !!providerId
  })

  const events = providerData?.events || eventsData

  // Use portfolio images from provider data
  const gallery = provider?.portfolio || []

  // Use reviews from provider data
  const reviews = providerData?.reviews || []

  // Check follow status
  const { data: followStatus } = useQuery({
    queryKey: ['follow-status', providerId],
    queryFn: async () => {
      const response = await customerAPI.checkFollowStatus(providerId)
      return response.data
    },
    enabled: !!user && !!providerId,
    retry: false
  })

  // Get user's review for this provider
  const { data: myReviews } = useQuery({
    queryKey: ['my-reviews'],
    queryFn: async () => {
      const response = await customerAPI.getMyReviews()
      return response.data
    },
    enabled: !!user,
    retry: false
  })

  useEffect(() => {
    if (followStatus) {
      setIsFollowing(followStatus.isFollowing)
    }
  }, [followStatus])

  useEffect(() => {
    if (myReviews && providerId) {
      const review = myReviews.find(r => r.providerId === providerId)
      setUserReview(review)
    }
  }, [myReviews, providerId])

  // Follow/Unfollow mutation
  const followMutation = useMutation({
    mutationFn: (action) => {
      return action === 'follow' 
        ? customerAPI.followProvider(providerId)
        : customerAPI.unfollowProvider(providerId)
    },
    onSuccess: (data, action) => {
      setIsFollowing(action === 'follow')
      toast.success(action === 'follow' ? 'Following provider!' : 'Unfollowed provider')
      queryClient.invalidateQueries(['follow-status', providerId])
      queryClient.invalidateQueries(['provider-profile', providerId])
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update follow status')
    }
  })

  const handleFollow = () => {
    if (!user) {
      toast.error('Please login to follow providers')
      return
    }
    followMutation.mutate(isFollowing ? 'unfollow' : 'follow')
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: provider.name,
        text: provider.tagline,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-64 bg-gray-200 rounded-lg mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-8 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </div>
              <div className="h-64 bg-gray-200 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'about':
        return (
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>About {provider?.businessName || provider?.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 whitespace-pre-line leading-relaxed">
                  {provider?.description || 'No description available.'}
                </p>
              </CardContent>
            </Card>

            {provider?.categories && provider.categories.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Service Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {provider.categories.map((category, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-gray-700 capitalize">{category}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {provider?.location && (
              <Card>
                <CardHeader>
                  <CardTitle>Location Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {provider.location.address && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Address</span>
                        <span className="font-medium">{provider.location.address}</span>
                      </div>
                    )}
                    {provider.location.city && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">City</span>
                        <span className="font-medium">{provider.location.city}</span>
                      </div>
                    )}
                    {provider.location.state && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">State</span>
                        <span className="font-medium">{provider.location.state}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )

      case 'events':
        return (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {events.map((event, index) => (
                <motion.div
                  key={event._id || event.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <EventCard event={event} />
                </motion.div>
              ))}
            </div>
          </div>
        )

      case 'gallery':
        return (
          <div>
            {gallery && gallery.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {gallery.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="aspect-square rounded-lg overflow-hidden group cursor-pointer"
                  >
                    <img
                      src={getImageUrl(item.image) || '/wedding.jpg'}
                      alt={item.title || `Portfolio ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = '/wedding.jpg'
                      }}
                    />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No portfolio images available.</p>
              </div>
            )}
          </div>
        )

      case 'reviews':
        return (
          <div className="space-y-6">
            {reviews && reviews.length > 0 ? (
              reviews.map((review, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <img
                          src={getImageUrl(review.customerImage) || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiByeD0iNjQiIGZpbGw9IiNGM0Y0RjYiLz4KPHN2ZyB4PSIzMiIgeT0iMzIiIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiI+CjxwYXRoIGQ9Im0yMCAyMS0yLTJtLTItMmEzIDMgMCAwIDEtMy0zVjlhNSA1IDAgMCAxIDEwIDB2NWEzIDMgMCAwIDEtMyAzeiIvPgo8L3N2Zz4KPC9zdmc>'}
                          alt={review.customerName}
                          className="w-12 h-12 rounded-full object-cover"
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiByeD0iNjQiIGZpbGw9IiNGM0Y0RjYiLz4KPHN2ZyB4PSIzMiIgeT0iMzIiIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiI+CjxwYXRoIGQ9Im0yMCAyMS0yLTJtLTItMmEzIDMgMCAwIDEtMy0zVjlhNSA1IDAgMCAxIDEwIDB2NWEzIDMgMCAwIDEtMyAzeiIvPgo8L3N2Zz4KPC9zdmc>'
                          }}
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="font-semibold text-gray-900">{review.customerName}</h4>
                              <p className="text-sm text-gray-500">{review.eventType} Event</p>
                            </div>
                            <div className="flex items-center space-x-1">
                              {[...Array(review.rating)].map((_, i) => (
                                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              ))}
                            </div>
                          </div>
                          <p className="text-gray-600 mb-2">{review.comment}</p>
                          <p className="text-sm text-gray-500">{formatDate(review.date)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No reviews available yet.</p>
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover Image */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img
          src={getImageUrl(provider?.coverImage) || '/corporate.jpg'}
          alt={`${provider?.name || 'Provider'} cover`}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = '/corporate.jpg'
          }}
        />
        <div className="absolute inset-0 bg-black/30" />
        
        {/* Back Button */}
        <Link
          to="/AllEvent"
          className="absolute top-4 left-4 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </Link>

        {/* Action Buttons */}
        <div className="absolute top-4 right-4 flex space-x-2">
          {user && (
            <button
              onClick={handleFollow}
              disabled={followMutation.isPending}
              className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors disabled:opacity-50"
            >
              {isFollowing ? (
                <UserCheck className="w-5 h-5 text-green-600" />
              ) : (
                <UserPlus className="w-5 h-5 text-gray-700" />
              )}
            </button>
          )}
          <button
            onClick={handleShare}
            className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
          >
            <Share2 className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Provider Header */}
            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <img
                    src={getImageUrl(provider?.image || provider?.profileImage) || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiByeD0iNjQiIGZpbGw9IiNGM0Y0RjYiLz4KPHN2ZyB4PSIzMiIgeT0iMzIiIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiI+CjxwYXRoIGQ9Im0yMCAyMS0yLTJtLTItMmEzIDMgMCAwIDEtMy0zVjlhNSA1IDAgMCAxIDEwIDB2NWEzIDMgMCAwIDEtMyAzeiIvPgo8L3N2Zz4KPC9zdmc+'}
                    alt={provider?.name || 'Provider'}
                    className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiByeD0iNjQiIGZpbGw9IiNGM0Y0RjYiLz4KPHN2ZyB4PSIzMiIgeT0iMzIiIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiI+CjxwYXRoIGQ9Im0yMCAyMS0yLTJtLTItMmEzIDMgMCAwIDEtMy0zVjlhNSA1IDAgMCAxIDEwIDB2NWEzIDMgMCAwIDEtMyAzeiIvPgo8L3N2Zz4KPC9zdmc>'
                    }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h1 className="text-2xl font-bold text-gray-900">{provider?.businessName || provider?.name}</h1>
                      {provider?.isVerified && (
                        <CheckCircle className="w-6 h-6 text-blue-500" />
                      )}
                    </div>
                    <p className="text-gray-600 mb-3">{provider?.description?.substring(0, 100)}...</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{provider?.rating || '0.0'}</span>
                          <span>({provider?.totalReviews || 0} reviews)</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{provider?.location?.city || 'Location not specified'}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{provider?.totalBookings || 0} bookings</span>
                        </div>
                        {isFollowing && (
                          <div className="flex items-center space-x-1">
                            <UserCheck className="w-4 h-4 text-green-600" />
                            <span className="text-green-600 font-medium">Following</span>
                          </div>
                        )}
                      </div>
                      {user && (
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setShowReviewModal(true)}
                          >
                            <Star className="w-4 h-4 mr-1" />
                            {userReview ? 'Update Review' : 'Write Review'}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <div className="mb-6">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                        activeTab === tab.id
                          ? 'border-purple-500 text-purple-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Tab Content */}
            {renderTabContent()}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900">{provider?.phone || 'Not provided'}</p>
                    <p className="text-sm text-gray-500">Call for inquiries</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900">{provider?.email || 'Not provided'}</p>
                    <p className="text-sm text-gray-500">Send email</p>
                  </div>
                </div>
                
                {provider?.socialMedia?.website && (
                  <div className="flex items-center space-x-3">
                    <ExternalLink className="w-5 h-5 text-gray-600" />
                    <div>
                      <a 
                        href={`https://${provider.socialMedia.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-purple-600 hover:text-purple-700"
                      >
                        {provider.socialMedia.website}
                      </a>
                      <p className="text-sm text-gray-500">Visit website</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900">Response Time</p>
                    <p className="text-sm text-gray-500">Usually within {provider.responseTime}</p>
                  </div>
                </div>

                <div className="pt-4 space-y-3">
                  {user ? (
                    <>
                      <Button 
                        className="w-full"
                        onClick={() => setShowMessageModal(true)}
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Send Message
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => window.open(`tel:${provider?.phone}`, '_self')}
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Call Now
                      </Button>
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500 mb-3">Login to contact this provider</p>
                      <Link to="/login/customer">
                        <Button className="w-full">
                          Login to Contact
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card>
              <CardHeader>
                <CardTitle>Provider Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Member Since</span>
                    <span className="font-medium">{new Date(provider?.createdAt).getFullYear() || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Bookings</span>
                    <span className="font-medium">{provider?.totalBookings || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Average Rating</span>
                    <span className="font-medium">{provider?.rating || '0.0'}/5.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Reviews</span>
                    <span className="font-medium">{provider?.totalReviews || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Followers</span>
                    <span className="font-medium">{provider?.followersCount || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Specializations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {provider?.categories?.map((category, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium capitalize"
                    >
                      {category}
                    </span>
                  )) || <span className="text-gray-500">No specializations listed</span>}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        providerId={providerId}
        providerName={provider?.businessName || provider?.name}
        existingReview={userReview}
      />

      <MessageModal
        isOpen={showMessageModal}
        onClose={() => setShowMessageModal(false)}
        providerId={providerId}
        providerName={provider?.businessName || provider?.name}
      />
    </div>
  )
}

export default ProviderPublicProfile