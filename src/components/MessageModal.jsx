import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useMutation } from '@tanstack/react-query'
import { customerAPI } from '@/services/api'
import { toast } from 'react-hot-toast'

const MessageModal = ({ isOpen, onClose, providerId, providerName }) => {
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')

  const messageMutation = useMutation({
    mutationFn: (data) => customerAPI.sendMessage(providerId, data),
    onSuccess: () => {
      toast.success('Message sent successfully!')
      onClose()
      setSubject('')
      setMessage('')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to send message')
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!subject.trim()) {
      toast.error('Please enter a subject')
      return
    }
    if (!message.trim()) {
      toast.error('Please write a message')
      return
    }

    messageMutation.mutate({
      subject: subject.trim(),
      message: message.trim()
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
            Send Message
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Send a message to <span className="font-medium">{providerName}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter subject..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={100}
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your message..."
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              maxLength={1000}
            />
            <p className="text-xs text-gray-500 mt-1">
              {message.length}/1000 characters
            </p>
          </div>

          {/* Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={messageMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={messageMutation.isPending}
            >
              <Send className="w-4 h-4 mr-2" />
              {messageMutation.isPending ? 'Sending...' : 'Send Message'}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default MessageModal