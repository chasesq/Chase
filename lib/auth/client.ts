'use client'

import { createAuthClient } from 'better-auth/react'

const baseUrl = process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 'http://localhost:3000'

export const authClient = createAuthClient({
  baseUrl: baseUrl,
})
