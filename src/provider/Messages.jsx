import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, Send, Search, Filter, Clock, User, Mail, Phone } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { providersAPI } from '@/services/api'
import { formatDate, getImageUrl } from '@/lib/utils'
import { toast } from 'react-hot-toast'

const Messages = () => {
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [replyMessage, setReplyMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const queryClient = useQueryClient()

  // Fetch messages
  const { data: messagesData, isLoading } = useQuery({
    queryKey: ['provider-messages', filterStatus],
    queryFn: async () => {
      const response = await providersAPI.getMessages({ status: filterStatus })
      return response.data
    }
  })

  const messages = messagesData?.messages || []

  // Reply to message mutation
  const replyMutation = useMutation({
    mutationFn: ({ messageId, reply }) => providersAPI.replyToMessage(messageId, { message: reply }),
    onSuccess: () => {
      toast.success('Reply sent successfully!')
      setReplyMessage('')
      queryClient.invalidateQueries(['provider-messages'])
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to send reply')
    }
  })

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (messageId) => providersAPI.markMessageAsRead(messageId),
    onSuccess: () => {
      queryClient.invalidateQueries(['provider-messages'])
    }
  })

  const handleSelectConversation = (message) => {
    setSelectedConversation(message)
    if (!message.isRead) {
      markAsReadMutation.mutate(message._id)
    }
  }

  const handleSendReply = (e) => {
    e.preventDefault()
    if (!replyMessage.trim() || !selectedConversation) return

    replyMutation.mutate({
      messageId: selectedConversation._id,
      reply: replyMessage.trim()
    })
  }

  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.subject?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#333f63] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading messages...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
            <p className="text-gray-600 mt-2">Manage customer inquiries and communications</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Messages</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Messages List */}
          <div className="lg:col-span-1">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5" />
                  <span>Conversations ({filteredMessages.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
                  {filteredMessages.length > 0 ? (
                    filteredMessages.map((message) => (
                      <motion.div
                        key={message._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedConversation?._id === message._id ? 'bg-blue-50 border-blue-200' : ''
                        }`}
                        onClick={() => handleSelectConversation(message)}
                      >
                        <div className="flex items-start space-x-3">
                          <img
                            src={getImageUrl(message.customerImage) || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiByeD0iNjQiIGZpbGw9IiNGM0Y0RjYiLz4KPHN2ZyB4PSIzMiIgeT0iMzIiIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiI+CjxwYXRoIGQ9Im0yMCAyMS0yLTJtLTItMmEzIDMgMCAwIDEtMy0zVjlhNSA1IDAgMCAxIDEwIDB2NWEzIDMgMCAwIDEtMyAzeiIvPgo8L3N2Zz4KPC9zdmc>'} 
                            alt={message.customerName}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className={`font-medium truncate ${!message.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                                {message.customerName}
                              </h4>
                              {!message.isRead && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              )}
                            </div>
                            <p className={`text-sm truncate ${!message.isRead ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                              {message.subject}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <p className="text-xs text-gray-500 truncate">
                                {message.message.substring(0, 50)}...
                              </p>
                              <div className="flex items-center space-x-1 text-xs text-gray-500">
                                <Clock className="w-3 h-3" />
                                <span>{formatDate(message.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <h4 className="font-medium text-gray-900 mb-2">No messages found</h4>
                      <p className="text-gray-600">Customer messages will appear here</p>
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
                        src={getImageUrl(selectedConversation.customerImage) || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiByeD0iNjQiIGZpbGw9IiNGM0Y0RjYiLz4KPHN2ZyB4PSIzMiIgeT0iMzIiIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiI+CjxwYXRoIGQ9Im0yMCAyMS0yLTJtLTItMmEzIDMgMCAwIDEtMy0zVjlhNSA1IDAgMCAxIDEwIDB2NWEzIDMgMCAwIDEtMyAzeiIvPgo8L3N2Zz4KPC9zdmc>'}
                        alt={selectedConversation.customerName}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{selectedConversation.customerName}</h3>
                        <p className="text-sm text-gray-600">{selectedConversation.subject}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {selectedConversation.customerEmail && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`mailto:${selectedConversation.customerEmail}`, '_blank')}
                          >
                            <Mail className="w-4 h-4 mr-1" />
                            Email
                          </Button>
                        )}
                        {selectedConversation.customerPhone && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`tel:${selectedConversation.customerPhone}`, '_blank')}
                          >
                            <Phone className="w-4 h-4 mr-1" />
                            Call
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="flex flex-col h-full p-0">
                    {/* Message Content */}
                    <div className="flex-1 p-6 overflow-y-auto">
                      <div className="space-y-4">
                        {/* Original Message */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <User className="w-4 h-4 text-gray-500" />
                            <span className="font-medium text-gray-900">{selectedConversation.customerName}</span>
                            <span className="text-sm text-gray-500">{formatDate(selectedConversation.createdAt)}</span>
                          </div>
                          <p className="text-gray-700 whitespace-pre-wrap">{selectedConversation.message}</p>
                        </div>

                        {/* Replies */}
                        {selectedConversation.replies && selectedConversation.replies.map((reply, index) => (
                          <div key={index} className={`p-4 rounded-lg ${reply.isProvider ? 'bg-blue-50 ml-8' : 'bg-gray-50 mr-8'}`}>
                            <div className="flex items-center space-x-2 mb-2">
                              <User className="w-4 h-4 text-gray-500" />
                              <span className="font-medium text-gray-900">
                                {reply.isProvider ? 'You' : selectedConversation.customerName}
                              </span>
                              <span className="text-sm text-gray-500">{formatDate(reply.createdAt)}</span>
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

export default Messages