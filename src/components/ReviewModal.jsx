import { useState } from 'react'
import { motion } from 'framer-motion'
import { Star, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { customerAPI } from '@/services/api'
import { toast } from 'react-hot-toast'

const ReviewModal = ({ isOpen, onClose, providerId, providerName, existingReview = null }) => {
  const [rating, setRating] = useState(existingReview?.rating || 0)
  const [comment, setComment] = useState(existingReview?.comment || '')
  const [hoveredRating, setHoveredRating] = useState(0)
  
  const queryClient = useQueryClient()

  const reviewMutation = useMutation({
    mutationFn: (data) => {
      if (existingReview) {
        return customerAPI.updateReview(existingReview._id, data)
      }
      return customerAPI.addReview(providerId, data)
    },
    onSuccess: () => {
      toast.success(existingReview ? 'Review updated successfully!' : 'Review added successfully!')
      queryClient.invalidateQueries(['provider-profile', providerId])
      onClose()
      setRating(0)
      setComment('')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to submit review')
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (rating === 0) {
      toast.error('Please select a rating')
      return
    }
    if (!comment.trim()) {
      toast.error('Please write a comment')
      return
    }

    reviewMutation.mutate({
      rating,
      comment: comment.trim()
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {existingReview ? 'Update Review' : 'Write a Review'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            How was your experience with {providerName}?
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating
            </label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1 transition-colors"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comment
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {comment.length}/500 characters
            </p>
          </div>

          {/* Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={reviewMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={reviewMutation.isPending}
            >
              {reviewMutation.isPending 
                ? 'Submitting...' 
                : existingReview ? 'Update Review' : 'Submit Review'
              }
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default ReviewModal