import React from 'react'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'

export default function SettingsPage() {
  return (
    <main className="container py-8 max-w-2xl">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <p className="mt-2 text-gray-600">Configure application settings and preferences.</p>

      <Card className="p-6 mt-6">
        <h3 className="font-medium">General Settings</h3>
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Display Name</label>
            <Input placeholder="Enter display name" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Email Notifications</label>
            <Input type="email" placeholder="your@email.com" />
          </div>
          <Button>Save Changes</Button>
        </div>
      </Card>
    </main>
  )
}
