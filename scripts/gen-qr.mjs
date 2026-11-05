// 印刷用の QR コードを生成する。
//   npm run qr
// 出力: qr/<ページ名>.png と qr/index.html (一覧・印刷用)
// 各 QR は「修正依頼フォーム (対象ページ入り)」を開く。
import QRCode from 'qrcode'
import { mkdir, writeFile } from 'node:fs/promises'
import { SITE_URL, keyclickerPages } from '../docs/.vitepress/config.mts'

const outDir = new URL('../qr/', import.meta.url)
await mkdir(outDir, { recursive: true })

const rows = []
for (const p of keyclickerPages) {
  const slug = p.link.replace(/\/$/, '/index').replace(/^\//, '').replace(/\//g, '-')
  const url = `${SITE_URL}/feedback?page=${encodeURIComponent(p.link)}`
  const file = `${slug}.png`
  await QRCode.toFile(new URL(file, outDir).pathname, url, { width: 512, margin: 2, errorCorrectionLevel: 'M' })
  rows.push({ ...p, url, file })
  console.log(file, '→', url)
}

const html = `<!doctype html><html lang="ja"><meta charset="utf-8"><title>修正依頼 QR コード一覧</title>
<style>body{font-family:sans-serif;padding:24px}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
figure{margin:0;text-align:center;page-break-inside:avoid}img{width:160px}figcaption{font-size:14px}small{color:#666;word-break:break-all}</style>
<h1>修正依頼 QR コード</h1><p>印刷したマニュアルの各ページに、対応する QR コードを貼ってください。</p>
<div class="grid">${rows
  .map((r) => `<figure><img src="${r.file}" alt=""><figcaption><b>${r.text}</b><br><small>${r.url}</small></figcaption></figure>`)
  .join('')}</div></html>`
await writeFile(new URL('index.html', outDir), html)
console.log('qr/index.html を書き出しました')
