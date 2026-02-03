import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  const { password } = await request.json()
  
  const correctPassword = process.env.DASHBOARD_PASSWORD
  
  if (!correctPassword) {
    console.error('DASHBOARD_PASSWORD not set')
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  if (password === correctPassword) {
    // Set auth cookie - expires in 30 days
    cookies().set('dashboard_auth', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    })

    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
}

// Optional: logout endpoint
export async function DELETE() {
  cookies().delete('dashboard_auth')
  return NextResponse.json({ success: true })
}
