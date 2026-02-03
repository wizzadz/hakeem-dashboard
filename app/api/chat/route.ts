import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

// Session ID for dashboard conversations (separate from WhatsApp)
const DASHBOARD_SESSION = 'hakeem-dashboard-chat'

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()
    
    if (!message) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 })
    }

    // Use clawdbot CLI to send message and get response
    const escapedMessage = message.replace(/"/g, '\\"').replace(/`/g, '\\`').replace(/\$/g, '\\$')
    
    const { stdout, stderr } = await execAsync(
      `clawdbot agent --session-id "${DASHBOARD_SESSION}" --message "${escapedMessage}" --local --timeout 120`,
      { 
        timeout: 130000,
        maxBuffer: 10 * 1024 * 1024 // 10MB buffer for large responses
      }
    )

    try {
      const result = JSON.parse(stdout)
      return NextResponse.json({ 
        response: result.response || result.message || result.content || 'No response',
      })
    } catch (parseError) {
      // If not JSON, return stdout directly
      return NextResponse.json({ 
        response: stdout.trim() || 'No response',
      })
    }
  } catch (error: any) {
    console.error('Chat error:', error)
    
    // Try to extract response from error output
    if (error.stdout) {
      try {
        const result = JSON.parse(error.stdout)
        if (result.response) {
          return NextResponse.json({ response: result.response })
        }
      } catch {}
    }
    
    return NextResponse.json({ 
      error: 'Failed to get response',
      response: error.message || 'Something went wrong. Is Clawdbot running?'
    }, { status: 500 })
  }
}
