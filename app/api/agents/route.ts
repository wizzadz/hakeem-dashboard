import { NextResponse } from 'next/server'

const CLAWDBOT_URL = process.env.CLAWDBOT_GATEWAY_URL || 'http://localhost:3457'
const CLAWDBOT_TOKEN = process.env.CLAWDBOT_API_TOKEN || ''

export async function GET() {
  try {
    const res = await fetch(`${CLAWDBOT_URL}/api/sessions?kinds=subagent&activeMinutes=60`, {
      headers: {
        'Authorization': `Bearer ${CLAWDBOT_TOKEN}`,
      },
    })

    if (!res.ok) {
      throw new Error(`Clawdbot error: ${res.status}`)
    }

    const data = await res.json()
    
    const agents = (data.sessions || []).map((s: any) => ({
      id: s.sessionKey || s.id,
      label: s.label || s.sessionKey?.split(':').pop() || 'agent',
      status: s.status === 'running' ? 'working' : 
              s.status === 'completed' ? 'completed' :
              s.status === 'failed' ? 'failed' : 'idle',
      runtime: s.runtime,
    }))

    return NextResponse.json({ agents })
  } catch (error) {
    console.error('Agents error:', error)
    return NextResponse.json({ agents: [] })
  }
}
