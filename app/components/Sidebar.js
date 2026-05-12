'use client'

import { 
  LayoutDashboard, 
  MessageSquare, 
  Settings, 
  BarChart3, 
  Mic,
  Users
} from 'lucide-react'
import clsx from 'clsx'

const navigation = [
  { name: 'Dashboard', href: 'dashboard', icon: LayoutDashboard },
  { name: 'Conversations', href: 'conversations', icon: MessageSquare },
  { name: 'Voice Testing', href: 'voice', icon: Mic },
  { name: 'Analytics', href: 'analytics', icon: BarChart3 },
  { name: 'Customers', href: 'customers', icon: Users },
  { name: 'Settings', href: 'settings', icon: Settings },
]

export default function Sidebar({ activeTab, setActiveTab }) {
  return (
    <div className="flex flex-col w-64 bg-white shadow-lg">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 px-4 bg-whatsapp-green">
        <h1 className="text-xl font-bold text-white">Voice Agent</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => (
          <button
            key={item.name}
            onClick={() => setActiveTab(item.href)}
            className={clsx(
              'w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
              activeTab === item.href
                ? 'bg-whatsapp-light text-whatsapp-dark'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            )}
          >
            <item.icon className="h-5 w-5 mr-3" />
            {item.name}
          </button>
        ))}
      </nav>

      {/* Status */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <div>
            <p className="text-sm font-medium text-gray-900">System Status</p>
            <p className="text-xs text-gray-500">All services operational</p>
          </div>
        </div>
      </div>
    </div>
  )
}