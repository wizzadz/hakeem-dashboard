import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  const { username, password } = await request.json()
  
  const adminUser = process.env.DASHBOARD_USER || 'admin'
  const adminPassword = process.env.DASHBOARD_PASSWORD
  
  if (!adminPassword) {
    console.error('DASHBOARD_PASSWORD not set')
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  if (username === adminUser && password === adminPassword) {
    // Set auth cookie - expires in 30 days
    cookies().set('dashboard_auth', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    })
    
    cookies().set('dashboard_user', username, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    })

    return NextResponse.json({ success: true, user: username })
  }

  return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
}

// Logout endpoint
export async function DELETE() {
  cookies().delete('dashboard_auth')
  cookies().delete('dashboard_user')
  return NextResponse.json({ success: true })
}
