'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { AlertCircle, Check, Loader2, Camera } from 'lucide-react'

interface ProfileFormProps {
  email?: string
  onStepUpRequired?: () => void
}

export function ProfileForm({ email, onStepUpRequired }: ProfileFormProps) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    profilePicture: '',
  })

  useEffect(() => {
    loadProfile()
  }, [email])

  const loadProfile = async () => {
    if (!email) return

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/auth/profile?email=${encodeURIComponent(email)}`)

      if (!response.ok) {
        throw new Error('Failed to load profile')
      }

      const data = await response.json()
      setFormData({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        phone: data.phone || '',
        profilePicture: data.profilePicture || '',
      })

      if (data.profilePicture) {
        setPreviewUrl(data.profilePicture)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB')
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file')
      return
    }

    setAvatarFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    setSuccess(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)

    if (!email) {
      setError('Email is required')
      setSaving(false)
      return
    }

    try {
      let profilePicture = formData.profilePicture

      // If a new avatar file was selected, convert to base64
      if (avatarFile) {
        const reader = new FileReader()
        profilePicture = await new Promise<string>((resolve, reject) => {
          reader.onloadend = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(avatarFile)
        })
      }

      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          profilePicture,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update profile')
      }

      setSuccess(true)
      setAvatarFile(null)
      setFormData((prev) => ({
        ...prev,
        profilePicture,
      }))

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card className="w-full max-w-md mx-auto p-6 space-y-4">
        <div className="h-32 bg-muted animate-pulse rounded-lg" />
        <div className="space-y-2">
          <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
          <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
        </div>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar Section */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Avatar className="h-32 w-32">
              <AvatarImage src={previewUrl || ''} alt="Profile picture" />
              <AvatarFallback className="bg-[#0a4fa6] text-white text-xl">
                {formData.firstName.charAt(0)}
                {formData.lastName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <label
              htmlFor="avatar-input"
              className="absolute bottom-0 right-0 bg-[#0a4fa6] hover:bg-[#083d80] text-white rounded-full p-2 cursor-pointer transition-colors"
            >
              <Camera className="h-4 w-4" />
              <input
                id="avatar-input"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </label>
          </div>
          <p className="text-xs text-muted-foreground">Click camera icon to change avatar</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex gap-3 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
            <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="flex gap-3 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
            <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-600 dark:text-green-400">Profile updated successfully</p>
          </div>
        )}

        {/* Form Fields */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="John"
              disabled={saving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Doe"
              disabled={saving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1 (555) 000-0000"
              disabled={saving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={email || ''}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">Email cannot be changed here</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <Button
            type="submit"
            disabled={saving}
            className="flex-1 bg-[#0a4fa6] hover:bg-[#083d80]"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </form>
    </Card>
  )
}
