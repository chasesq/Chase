import crypto from 'crypto'

interface Auth0MyAccountConfig {
  domain: string
  clientId: string
  clientSecret: string
}

interface UserProfile {
  email?: string
  name?: string
  given_name?: string
  family_name?: string
  phone_number?: string
  picture?: string
  user_metadata?: Record<string, any>
}

class Auth0MyAccountClient {
  private domain: string
  private clientId: string
  private clientSecret: string
  private accessToken: string | null = null
  private tokenExpires: number = 0

  constructor(config: Auth0MyAccountConfig) {
    this.domain = config.domain
    this.clientId = config.clientId
    this.clientSecret = config.clientSecret
  }

  private async getManagementToken(): Promise<string> {
    // Return cached token if still valid
    if (this.accessToken && this.tokenExpires > Date.now()) {
      return this.accessToken
    }

    try {
      const response = await fetch(`https://${this.domain}/oauth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          audience: `https://${this.domain}/api/v2/`,
          grant_type: 'client_credentials',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get management token')
      }

      const data = await response.json()
      this.accessToken = data.access_token
      this.tokenExpires = Date.now() + (data.expires_in - 60) * 1000 // Refresh 1 min before expiry

      return this.accessToken
    } catch (error) {
      console.error('[Auth0] Failed to get management token:', error)
      throw error
    }
  }

  /**
   * Get user profile information
   */
  async getUserProfile(userId: string): Promise<UserProfile> {
    const token = await this.getManagementToken()

    try {
      const response = await fetch(
        `https://${this.domain}/api/v2/users/${encodeURIComponent(userId)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (!response.ok) {
        throw new Error(`Failed to get user profile: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('[Auth0] Failed to get user profile:', error)
      throw error
    }
  }

  /**
   * Update user profile information
   */
  async updateUserProfile(userId: string, updates: UserProfile): Promise<UserProfile> {
    const token = await this.getManagementToken()

    try {
      const response = await fetch(
        `https://${this.domain}/api/v2/users/${encodeURIComponent(userId)}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updates),
        },
      )

      if (!response.ok) {
        throw new Error(`Failed to update user profile: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('[Auth0] Failed to update user profile:', error)
      throw error
    }
  }

  /**
   * Update user metadata
   */
  async updateUserMetadata(userId: string, metadata: Record<string, any>): Promise<void> {
    const token = await this.getManagementToken()

    try {
      const response = await fetch(
        `https://${this.domain}/api/v2/users/${encodeURIComponent(userId)}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            user_metadata: metadata,
          }),
        },
      )

      if (!response.ok) {
        throw new Error(`Failed to update user metadata: ${response.statusText}`)
      }
    } catch (error) {
      console.error('[Auth0] Failed to update user metadata:', error)
      throw error
    }
  }

  /**
   * Get user's authentication methods
   */
  async getUserAuthenticationMethods(userId: string): Promise<any[]> {
    const token = await this.getManagementToken()

    try {
      const response = await fetch(
        `https://${this.domain}/api/v2/users/${encodeURIComponent(userId)}/authentication-methods`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (!response.ok) {
        throw new Error(`Failed to get authentication methods: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('[Auth0] Failed to get authentication methods:', error)
      throw error
    }
  }

  /**
   * Delete an authentication method
   */
  async deleteAuthenticationMethod(userId: string, authMethodId: string): Promise<void> {
    const token = await this.getManagementToken()

    try {
      const response = await fetch(
        `https://${this.domain}/api/v2/users/${encodeURIComponent(userId)}/authentication-methods/${encodeURIComponent(authMethodId)}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (!response.ok) {
        throw new Error(`Failed to delete authentication method: ${response.statusText}`)
      }
    } catch (error) {
      console.error('[Auth0] Failed to delete authentication method:', error)
      throw error
    }
  }

  /**
   * Get user sessions
   */
  async getUserSessions(userId: string): Promise<any[]> {
    const token = await this.getManagementToken()

    try {
      const response = await fetch(
        `https://${this.domain}/api/v2/users/${encodeURIComponent(userId)}/sessions`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (!response.ok) {
        throw new Error(`Failed to get user sessions: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('[Auth0] Failed to get user sessions:', error)
      throw error
    }
  }

  /**
   * Delete a user session
   */
  async deleteUserSession(userId: string, sessionId: string): Promise<void> {
    const token = await this.getManagementToken()

    try {
      const response = await fetch(
        `https://${this.domain}/api/v2/users/${encodeURIComponent(userId)}/sessions/${encodeURIComponent(sessionId)}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (!response.ok) {
        throw new Error(`Failed to delete session: ${response.statusText}`)
      }
    } catch (error) {
      console.error('[Auth0] Failed to delete session:', error)
      throw error
    }
  }
}

// Create singleton instance
let auth0Client: Auth0MyAccountClient | null = null

export function getAuth0MyAccountClient(): Auth0MyAccountClient {
  if (!auth0Client) {
    const domain = process.env.AUTH0_DOMAIN
    const clientId = process.env.AUTH0_CLIENT_ID
    const clientSecret = process.env.AUTH0_CLIENT_SECRET

    if (!domain || !clientId || !clientSecret) {
      throw new Error('Auth0 configuration is incomplete')
    }

    auth0Client = new Auth0MyAccountClient({
      domain,
      clientId,
      clientSecret,
    })
  }

  return auth0Client
}

export { Auth0MyAccountClient }
