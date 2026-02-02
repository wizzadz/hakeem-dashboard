import { NextRequest, NextResponse } from 'next/server'

const CLAWDBOT_URL = process.env.CLAWDBOT_GATEWAY_URL || 'http://localhost:3457'
const CLAWDBOT_TOKEN = process.env.CLAWDBOT_API_TOKEN || ''

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()
    
    if (!message) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 })
    }

    // Send to Clawdbot Gateway
    const res = await fetch(`${CLAWDBOT_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CLAWDBOT_TOKEN}`,
      },
      body: JSON.stringify({
        message,
        session: 'dashboard',
      }),
    })

    if (!res.ok) {
      throw new Error(`Clawdbot error: ${res.status}`)
    }

    const data = await res.json()
    
    return NextResponse.json({ 
      response: data.response || data.message || 'No response',
    })
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json({ 
      error: 'Failed to connect to Hakeem',
      response: 'I couldn\'t connect to the backend. Make sure Clawdbot is running.'
    }, { status: 500 })
  }
}
