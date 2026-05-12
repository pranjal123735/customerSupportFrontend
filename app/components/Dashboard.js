'use client'

import { useState, useEffect } from 'react'
import { MessageSquare, Users, Clock, TrendingUp, Mic, Volume2 } from 'lucide-react'
import ConversationList from './ConversationList'
import VoiceTest from './VoiceTest'

export default function Dashboard({ stats }) {
  const [conversations, setConversations] = useState([])

  useEffect(() => {
    // Mock conversations data
    setConversations([
      {
        id: 1,
        customerPhone: '+1234567890',
        lastMessage: 'Hi, I need help with my order',
        timestamp: '2 minutes ago',
        status: 'active',
        type: 'voice'
      },
      {
        id: 2,
        customerPhone: '+0987654321',
        lastMessage: 'Thank you for your help!',
        timestamp: '15 minutes ago',
        status: 'resolved',
        type: 'text'
      },
      {
        id: 3,
        customerPhone: '+1122334455',
        lastMessage: 'Can you check my billing?',
        timestamp: '1 hour ago',
        status: 'pending',
        type: 'voice'
      }
    ])
  }, [])

  const StatCard = ({ title, value, icon: Icon, color = 'blue' }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">
          WhatsApp Voice Agent Dashboard
        </h1>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Agent Online</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Conversations"
          value={stats.totalConversations}
          icon={MessageSquare}
          color="blue"
        />
        <StatCard
          title="Active Chats"
          value={stats.activeChats}
          icon={Users}
          color="green"
        />
        <StatCard
          title="Avg Response Time"
          value={stats.avgResponseTime}
          icon={Clock}
          color="yellow"
        />
        <StatCard
          title="Success Rate"
          value={stats.successRate}
          icon={TrendingUp}
          color="purple"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations List */}
        <div className="lg:col-span-2">
          <ConversationList conversations={conversations} />
        </div>

        {/* Voice Testing Panel */}
        <div className="space-y-6">
          <VoiceTest />
          
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-whatsapp-green hover:bg-whatsapp-dark">
                <Mic className="h-4 w-4 mr-2" />
                Test Voice Recognition
              </button>
              <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <Volume2 className="h-4 w-4 mr-2" />
                Test Voice Synthesis
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}