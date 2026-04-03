'use client'

import { createAuthClient } from '@neondatabase/neon-js/auth'

export const authClient = createAuthClient({
  baseUrl: process.env.NEXT_PUBLIC_NEON_AUTH_URL!,
})
