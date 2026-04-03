import { cookies } from 'next/headers'

export async function POST() {
  try {
    const cookieStore = await cookies()
    cookieStore.delete('admin_session')

    return Response.json({
      success: true,
      message: 'Logged out successfully',
    })
  } catch (error) {
    console.error('Admin logout error:', error)
    return Response.json(
      { error: 'An error occurred during logout' },
      { status: 500 }
    )
  }
}
