import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, Send, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { customerAPI } from '@/services/api'
import { formatDate, getImageUrl } from '@/lib/utils'
import { toast } from 'react-hot-toast'
import { Link } from 'react-router-dom'

const CustomerMessages = () => {
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [replyMessage, setReplyMessage] = useState('')
  const queryClient = useQueryClient()

  // Fetch conversations
  const { data: conversationsData, isLoading } = useQuery({
    queryKey: ['customer-conversations'],
    queryFn: async () => {
      const response = await customerAPI.getConversations()
      return response.data
    },
    refetchInterval: 30000 // Refetch every 30 seconds
  })

  const conversations = conversationsData || []

  // Reply mutation
  const replyMutation = useMutation({
    mutationFn: ({ conversationId, message }) => 
      customerAPI.replyToMessage(conversationId, { message }),
    onSuccess: () => {
      toast.success('Reply sent successfully!')
      setReplyMessage('')
      queryClient.invalidateQueries(['customer-conversations'])
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to send reply')
    }
  })

  const handleSendReply = (e) => {
    e.preventDefault()
    if (!replyMessage.trim() || !selectedConversation) return

    replyMutation.mutate({
      conversationId: selectedConversation._id,
      message: replyMessage.trim()
    })
  }

  // Update selected conversation when conversations data changes
  useEffect(() => {
    if (selectedConversation && conversations.length > 0) {
      const updatedConversation = conversations.find(c => c._id === selectedConversation._id)
      if (updatedConversation) {
        setSelectedConversation(updatedConversation)
      }
    }
  }, [conversations, selectedConversation])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4" />
            <div className="h-64 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link to="/profile">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Profile
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Messages</h1>
              <p className="text-gray-600 mt-2">Conversations with event providers</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Conversations List */}
          <div className="lg:col-span-1">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5" />
                  <span>Conversations ({conversations.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
                  {conversations.length > 0 ? (
                    conversations.map((conversation) => (
                      <motion.div
                        key={conversation._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedConversation?._id === conversation._id ? 'bg-blue-50 border-blue-200' : ''
                        }`}
                        onClick={() => setSelectedConversation(conversation)}
                      >
                        <div className="flex items-start space-x-3">
                          <img
                            src={getImageUrl(conversation.providerId?.profileImage) || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiByeD0iNjQiIGZpbGw9IiNGM0Y0RjYiLz4KPHN2ZyB4PSIzMiIgeT0iMzIiIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiI+CjxwYXRoIGQ9Im0yMCAyMS0yLTJtLTItMmEzIDMgMCAwIDEtMy0zVjlhNSA1IDAgMCAxIDEwIDB2NWEzIDMgMCAwIDEtMyAzeiIvPgo8L3N2Zz4KPC9zdmc>'} 
                            alt={conversation.providerId?.businessName}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 truncate">
                              {conversation.providerId?.businessName}
                            </h4>
                            <p className="text-sm font-medium text-gray-700 truncate">
                              {conversation.subject}
                            </p>
                            <p className="text-xs text-gray-500 truncate mt-1">
                              {conversation.message.substring(0, 50)}...
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {formatDate(conversation.updatedAt || conversation.createdAt)}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <h4 className="font-medium text-gray-900 mb-2">No messages yet</h4>
                      <p className="text-gray-600">Your conversations with providers will appear here</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Message Detail */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              {selectedConversation ? (
                <>
                  <CardHeader className="border-b">
                    <div className="flex items-center space-x-4">
                      <img
                        src={getImageUrl(selectedConversation.providerId?.profileImage) || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiByeD0iNjQiIGZpbGw9IiNGM0Y0RjYiLz4KPHN2ZyB4PSIzMiIgeT0iMzIiIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiI+CjxwYXRoIGQ9Im0yMCAyMS0yLTJtLTItMmEzIDMgMCAwIDEtMy0zVjlhNSA1IDAgMCAxIDEwIDB2NWEzIDMgMCAwIDEtMyAzeiIvPgo8L3N2Zz4KPC9zdmc>'}
                        alt={selectedConversation.providerId?.businessName}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {selectedConversation.providerId?.businessName}
                        </h3>
                        <p className="text-sm text-gray-600">{selectedConversation.subject}</p>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="flex flex-col h-full p-0">
                    {/* Messages */}
                    <div className="flex-1 p-6 overflow-y-auto">
                      <div className="space-y-4">
                        {/* Original Message */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-medium text-gray-900">You</span>
                            <span className="text-sm text-gray-500">
                              {formatDate(selectedConversation.createdAt)}
                            </span>
                          </div>
                          <p className="text-gray-700 whitespace-pre-wrap">
                            {selectedConversation.message}
                          </p>
                        </div>

                        {/* Replies */}
                        {selectedConversation.replies && selectedConversation.replies.map((reply, index) => (
                          <div key={index} className={`p-4 rounded-lg ${
                            reply.isProvider ? 'bg-blue-50 mr-8' : 'bg-gray-50 ml-8'
                          }`}>
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="font-medium text-gray-900">
                                {reply.isProvider ? selectedConversation.providerId?.businessName : 'You'}
                              </span>
                              <span className="text-sm text-gray-500">
                                {formatDate(reply.createdAt)}
                              </span>
                            </div>
                            <p className="text-gray-700 whitespace-pre-wrap">{reply.message}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Reply Form */}
                    <div className="border-t p-4">
                      <form onSubmit={handleSendReply} className="space-y-3">
                        <textarea
                          value={replyMessage}
                          onChange={(e) => setReplyMessage(e.target.value)}
                          placeholder="Type your reply..."
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          maxLength={1000}
                        />
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-500">
                            {replyMessage.length}/1000 characters
                          </p>
                          <Button
                            type="submit"
                            disabled={!replyMessage.trim() || replyMutation.isPending}
                            className="flex items-center space-x-2"
                          >
                            <Send className="w-4 h-4" />
                            <span>{replyMutation.isPending ? 'Sending...' : 'Send Reply'}</span>
                          </Button>
                        </div>
                      </form>
                    </div>
                  </CardContent>
                </>
              ) : (
                <CardContent className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="font-medium text-gray-900 mb-2">Select a conversation</h3>
                    <p className="text-gray-600">Choose a message from the list to view and reply</p>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomerMessages