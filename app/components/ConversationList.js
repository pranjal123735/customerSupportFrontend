'use client'

import { MessageSquare, Mic, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import clsx from 'clsx'

export default function ConversationList({ conversations }) {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'pending':
        return <Clock className="h-4 w-4 text-gray-500" />
      default:
        return <MessageSquare className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-yellow-100 text-yellow-800'
      case 'resolved':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Recent Conversations</h2>
      </div>
      
      <div className="divide-y divide-gray-200">
        {conversations.map((conversation) => (
          <div key={conversation.id} className="p-6 hover:bg-gray-50 cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  {conversation.type === 'voice' ? (
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Mic className="h-5 w-5 text-blue-600" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <MessageSquare className="h-5 w-5 text-gray-600" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {conversation.customerPhone}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {conversation.lastMessage}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {conversation.timestamp}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className={clsx(
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                  getStatusColor(conversation.status)
                )}>
                  {conversation.status}
                </span>
                {getStatusIcon(conversation.status)}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {conversations.length === 0 && (
        <div className="p-12 text-center">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No conversations yet</p>
        </div>
      )}
    </div>
  )
}