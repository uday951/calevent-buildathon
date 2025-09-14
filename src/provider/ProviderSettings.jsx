import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Bell, 
  Shield, 
  CreditCard, 
  Globe, 
  Moon, 
  Sun,
  Save,
  Eye,
  EyeOff
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import toast from 'react-hot-toast'

const ProviderSettings = () => {
  const [activeTab, setActiveTab] = useState('notifications')
  const [showPassword, setShowPassword] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [settings, setSettings] = useState({
    notifications: {
      emailBookings: true,
      emailMessages: true,
      emailPromotions: false,
      pushBookings: true,
      pushMessages: true,
      pushPromotions: false
    },
    privacy: {
      profileVisibility: 'public',
      showPhone: true,
      showEmail: false,
      allowReviews: true
    },
    payment: {
      bankName: 'State Bank of India',
      accountNumber: '****1234',
      ifscCode: 'SBIN0001234',
      upiId: 'provider@paytm'
    },
    preferences: {
      language: 'en',
      timezone: 'Asia/Kolkata',
      theme: 'light',
      currency: 'INR'
    },
    security: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  })

  const tabs = [
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'preferences', label: 'Preferences', icon: Globe },
    { id: 'security', label: 'Security', icon: Shield }
  ]

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      toast.success('Settings updated successfully!')
    } catch (error) {
      toast.error('Failed to update settings')
    } finally {
      setIsSaving(false)
    }
  }

  const updateSetting = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }))
  }

  const renderNotifications = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Email Notifications</h3>
        <div className="space-y-4">
          {[
            { key: 'emailBookings', label: 'New bookings and booking updates' },
            { key: 'emailMessages', label: 'Customer messages and inquiries' },
            { key: 'emailPromotions', label: 'Promotional offers and platform updates' }
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between">
              <span className="text-gray-700">{item.label}</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications[item.key]}
                  onChange={(e) => updateSetting('notifications', item.key, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#333f63]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-black peer-checked:to-[#333f63]"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Push Notifications</h3>
        <div className="space-y-4">
          {[
            { key: 'pushBookings', label: 'New bookings and booking updates' },
            { key: 'pushMessages', label: 'Customer messages and inquiries' },
            { key: 'pushPromotions', label: 'Promotional offers and platform updates' }
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between">
              <span className="text-gray-700">{item.label}</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications[item.key]}
                  onChange={(e) => updateSetting('notifications', item.key, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#333f63]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-black peer-checked:to-[#333f63]"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderPrivacy = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Profile Visibility
        </label>
        <select
          value={settings.privacy.profileVisibility}
          onChange={(e) => updateSetting('privacy', 'profileVisibility', e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#333f63] focus:border-transparent"
        >
          <option value="public">Public - Visible to all users</option>
          <option value="verified">Verified customers only</option>
          <option value="private">Private - By invitation only</option>
        </select>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Contact Information Display</h3>
        {[
          { key: 'showPhone', label: 'Show phone number on profile' },
          { key: 'showEmail', label: 'Show email address on profile' },
          { key: 'allowReviews', label: 'Allow customer reviews' }
        ].map(item => (
          <div key={item.key} className="flex items-center justify-between">
            <span className="text-gray-700">{item.label}</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.privacy[item.key]}
                onChange={(e) => updateSetting('privacy', item.key, e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#333f63]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-black peer-checked:to-[#333f63]"></div>
            </label>
          </div>
        ))}
      </div>
    </div>
  )

  const renderPayment = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bank Name
          </label>
          <Input
            value={settings.payment.bankName}
            onChange={(e) => updateSetting('payment', 'bankName', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Account Number
          </label>
          <Input
            value={settings.payment.accountNumber}
            onChange={(e) => updateSetting('payment', 'accountNumber', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            IFSC Code
          </label>
          <Input
            value={settings.payment.ifscCode}
            onChange={(e) => updateSetting('payment', 'ifscCode', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            UPI ID
          </label>
          <Input
            value={settings.payment.upiId}
            onChange={(e) => updateSetting('payment', 'upiId', e.target.value)}
          />
        </div>
      </div>
    </div>
  )

  const renderPreferences = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Language
          </label>
          <select
            value={settings.preferences.language}
            onChange={(e) => updateSetting('preferences', 'language', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#333f63] focus:border-transparent"
          >
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="mr">Marathi</option>
            <option value="gu">Gujarati</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Timezone
          </label>
          <select
            value={settings.preferences.timezone}
            onChange={(e) => updateSetting('preferences', 'timezone', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#333f63] focus:border-transparent"
          >
            <option value="Asia/Kolkata">India Standard Time (IST)</option>
            <option value="Asia/Dubai">Gulf Standard Time (GST)</option>
            <option value="UTC">Coordinated Universal Time (UTC)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Theme
          </label>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => updateSetting('preferences', 'theme', 'light')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg border ${
                settings.preferences.theme === 'light'
                  ? 'border-[#333f63] bg-[#333f63] text-white'
                  : 'border-gray-300 text-gray-700'
              }`}
            >
              <Sun className="w-4 h-4" />
              <span>Light</span>
            </button>
            <button
              onClick={() => updateSetting('preferences', 'theme', 'dark')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg border ${
                settings.preferences.theme === 'dark'
                  ? 'border-[#333f63] bg-[#333f63] text-white'
                  : 'border-gray-300 text-gray-700'
              }`}
            >
              <Moon className="w-4 h-4" />
              <span>Dark</span>
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Currency
          </label>
          <select
            value={settings.preferences.currency}
            onChange={(e) => updateSetting('preferences', 'currency', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#333f63] focus:border-transparent"
          >
            <option value="INR">Indian Rupee (₹)</option>
            <option value="USD">US Dollar ($)</option>
            <option value="EUR">Euro (€)</option>
          </select>
        </div>
      </div>
    </div>
  )

  const renderSecurity = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Current Password
        </label>
        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            value={settings.security.currentPassword}
            onChange={(e) => updateSetting('security', 'currentPassword', e.target.value)}
            placeholder="Enter current password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          New Password
        </label>
        <Input
          type="password"
          value={settings.security.newPassword}
          onChange={(e) => updateSetting('security', 'newPassword', e.target.value)}
          placeholder="Enter new password"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Confirm New Password
        </label>
        <Input
          type="password"
          value={settings.security.confirmPassword}
          onChange={(e) => updateSetting('security', 'confirmPassword', e.target.value)}
          placeholder="Confirm new password"
        />
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeTab) {
      case 'notifications':
        return renderNotifications()
      case 'privacy':
        return renderPrivacy()
      case 'payment':
        return renderPayment()
      case 'preferences':
        return renderPreferences()
      case 'security':
        return renderSecurity()
      default:
        return renderNotifications()
    }
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account preferences and settings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-black to-[#333f63] text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {(() => {
                    const activeTabData = tabs.find(tab => tab.id === activeTab)
                    const IconComponent = activeTabData?.icon
                    return IconComponent ? <IconComponent className="w-5 h-5" /> : null
                  })()}
                  <span>{tabs.find(tab => tab.id === activeTab)?.label}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderContent()}
                
                <div className="flex justify-end mt-8 pt-6 border-t border-gray-200">
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProviderSettings