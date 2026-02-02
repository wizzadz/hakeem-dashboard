import { NextResponse } from 'next/server'

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || ''
const GITHUB_REPO = process.env.GITHUB_REPO || 'wizzadz/Hakeem'

export async function GET() {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/commits?per_page=10`,
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          ...(GITHUB_TOKEN ? { 'Authorization': `token ${GITHUB_TOKEN}` } : {}),
        },
        next: { revalidate: 60 },
      }
    )

    if (!res.ok) {
      throw new Error(`GitHub API error: ${res.status}`)
    }

    const data = await res.json()
    
    const commits = data.map((commit: any) => ({
      sha: commit.sha,
      message: commit.commit.message.split('\n')[0], // First line only
      date: new Date(commit.commit.author.date).toLocaleDateString(),
      url: commit.html_url,
    }))

    return NextResponse.json({ commits })
  } catch (error) {
    console.error('GitHub error:', error)
    return NextResponse.json({ commits: [] })
  }
}
