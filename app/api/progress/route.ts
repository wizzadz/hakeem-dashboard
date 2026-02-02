import { NextResponse } from 'next/server'

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || ''
const GITHUB_REPO = process.env.GITHUB_REPO || 'wizzadz/Hakeem'

export async function GET() {
  try {
    // Fetch todo.md from GitHub
    const res = await fetch(
      `https://raw.githubusercontent.com/${GITHUB_REPO}/master/tasks/todo.md`,
      {
        headers: GITHUB_TOKEN ? { 'Authorization': `token ${GITHUB_TOKEN}` } : {},
        next: { revalidate: 60 }, // Cache for 60 seconds
      }
    )

    if (!res.ok) {
      return NextResponse.json({ tasks: [], progress: 0 })
    }

    const content = await res.text()
    
    // Parse checkboxes from markdown
    const lines = content.split('\n')
    const tasks: { text: string; completed: boolean }[] = []
    
    for (const line of lines) {
      const checkboxMatch = line.match(/^[-*]\s*\[([ xX])\]\s*(.+)$/)
      if (checkboxMatch) {
        tasks.push({
          completed: checkboxMatch[1].toLowerCase() === 'x',
          text: checkboxMatch[2].trim(),
        })
      }
    }
    
    const completed = tasks.filter(t => t.completed).length
    const progress = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0

    return NextResponse.json({ tasks, progress })
  } catch (error) {
    console.error('Progress error:', error)
    return NextResponse.json({ tasks: [], progress: 0 })
  }
}
