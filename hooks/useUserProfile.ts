import { useEffect, useState } from 'react'

interface UserProfile {
  id: string
  email: string
  username: string
  full_name: string
  phone: string
  address: string
  member_since: string
  tier: string
  account_number: string
  balance: number
}

export function useUserProfile() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Get user data from session/localStorage
    const storedUser = localStorage.getItem('user_profile')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (err) {
        setError('Failed to parse user profile')
      }
    }
    setLoading(false)
  }, [])

  const setUserProfile = (profile: UserProfile) => {
    localStorage.setItem('user_profile', JSON.stringify(profile))
    setUser(profile)
  }

  const clearUserProfile = () => {
    localStorage.removeItem('user_profile')
    setUser(null)
  }

  return {
    user,
    loading,
    error,
    setUserProfile,
    clearUserProfile,
  }
}
