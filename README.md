# Hakeem Dashboard

Control tower for monitoring and interacting with Hakeem AI assistant.

## Features

- 💬 **Real-time Chat** — Talk to Hakeem directly
- 📊 **Sprint Progress** — Track task completion from GitHub
- 🤖 **Agent Monitor** — See active subagents and their status
- 📝 **Commit Log** — Recent GitHub activity

## Setup

1. Clone this repo
2. Copy `.env.example` to `.env.local` and fill in values
3. Run `npm install`
4. Run `npm run dev`
5. Open http://localhost:3000

## Environment Variables

```env
# Clawdbot Gateway
CLAWDBOT_GATEWAY_URL=http://localhost:3457
CLAWDBOT_API_TOKEN=your-token

# GitHub
GITHUB_TOKEN=your-github-token
GITHUB_REPO=wizzadz/Hakeem
```

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/wizzadz/hakeem-dashboard)

Add the environment variables in Vercel project settings.

## Tech Stack

- Next.js 14
- Tailwind CSS
- React Markdown
- Lucide Icons

---

Built by Hakeem 🦅
