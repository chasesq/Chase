import { createClient } from '@supabase/supabase-js'
import { verifyAdminPassword } from '@/lib/admin-auth'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
      return Response.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Create Supabase client with service role for database queries
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    })

    // Query admin credentials table
    const { data: adminData, error: queryError } = await supabase
      .from('admin_credentials')
      .select('id, email, password_hash, name, status')
      .eq('email', email.toLowerCase())
      .eq('status', 'active')
      .single()

    if (queryError || !adminData) {
      return Response.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Verify password
    const passwordMatch = await verifyAdminPassword(password, adminData.password_hash)

    if (!passwordMatch) {
      return Response.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Create session token (in production, use JWT or secure session management)
    const sessionToken = Buffer.from(
      JSON.stringify({
        adminId: adminData.id,
        email: adminData.email,
        name: adminData.name,
        timestamp: Date.now(),
      })
    ).toString('base64')

    // Set secure httpOnly cookie
    const cookieStore = await cookies()
    cookieStore.set('admin_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/',
    })

    return Response.json({
      success: true,
      admin: {
        id: adminData.id,
        email: adminData.email,
        name: adminData.name,
      },
    })
  } catch (error) {
    console.error('Admin login error:', error)
    return Response.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    )
  }
}
