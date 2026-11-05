// 修正依頼フォーム → GitHub Issue 作成の受け口 (Cloudflare Worker)
// GitHub のトークンをブラウザに置かないために、この Worker を経由する。

export interface Env {
  GITHUB_REPO: string
  ALLOWED_ORIGIN: string
  ISSUE_LABEL: string
  GITHUB_TOKEN: string
  TURNSTILE_SECRET?: string
}

const MAX_MESSAGE = 4000
const MAX_NAME = 100
const MAX_PAGE = 200

function cors(env: Env, extra: HeadersInit = {}): HeadersInit {
  return {
    'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    ...extra,
  }
}

function clean(s: unknown, max: number): string {
  return typeof s === 'string' ? s.replace(/\r\n?/g, '\n').trim().slice(0, max) : ''
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url)
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(env) })
    if (req.method !== 'POST' || url.pathname !== '/feedback') {
      return new Response('Not found', { status: 404, headers: cors(env) })
    }

    let body: any
    try {
      body = await req.json()
    } catch {
      return new Response('Bad JSON', { status: 400, headers: cors(env) })
    }

    const page = clean(body.page, MAX_PAGE)
    const message = clean(body.message, MAX_MESSAGE)
    const name = clean(body.name, MAX_NAME)
    if (!message) return new Response('message is required', { status: 400, headers: cors(env) })

    // Turnstile (任意)
    if (env.TURNSTILE_SECRET) {
      const token = clean(body.turnstileToken, 2048)
      const verify = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret: env.TURNSTILE_SECRET, response: token, remoteip: req.headers.get('CF-Connecting-IP') }),
      }).then((r) => r.json() as Promise<{ success: boolean }>)
      if (!verify.success) return new Response('captcha failed', { status: 403, headers: cors(env) })
    }

    const title = `[修正依頼] ${page || 'ページ不明'}: ${message.split('\n')[0].slice(0, 50)}`
    const issueBody = [
      '## 対象ページ',
      page ? `\`${page}\`` : '(未指定)',
      '',
      '## 依頼内容',
      '```text',
      message,
      '```',
      '',
      `依頼者: ${name || '(匿名)'}`,
      '',
      '---',
      `このページの修正を AI に任せるには、Issue に \`approved\` ラベルを付けてください。`,
    ].join('\n')

    const gh = await fetch(`https://api.github.com/repos/${env.GITHUB_REPO}/issues`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.GITHUB_TOKEN}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'User-Agent': 'sugoi-manual-feedback-worker',
      },
      body: JSON.stringify({ title, body: issueBody, labels: [env.ISSUE_LABEL] }),
    })
    if (!gh.ok) {
      console.log('github error', gh.status, await gh.text())
      return new Response('failed to create issue', { status: 502, headers: cors(env) })
    }
    const issue = (await gh.json()) as { number: number }
    return new Response(JSON.stringify({ ok: true, number: issue.number }), {
      status: 200,
      headers: cors(env, { 'Content-Type': 'application/json' }),
    })
  },
}
