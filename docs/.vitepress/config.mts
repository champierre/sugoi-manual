import { defineConfig } from 'vitepress'

// 公開 URL (GitHub Pages)。QR コード生成スクリプトもこの値を使う。
export const SITE_URL = 'https://champierre.github.io/sugoi-manual'

// 修正依頼フォームの送信先 (Cloudflare Worker)。デプロイ後に差し替える。
export const FEEDBACK_ENDPOINT = 'https://sugoi-manual-feedback.example.workers.dev/feedback'

export const keyclickerPages = [
  { text: 'キークリッカーとは', link: '/keyclicker/' },
  { text: 'ひな型をコピーする', link: '/keyclicker/01-template' },
  { text: 'シェイプをはりつける', link: '/keyclicker/02-attach-shape' },
  { text: 'シェイプを整列させる', link: '/keyclicker/03-align' },
  { text: 'キートップをまとめる', link: '/keyclicker/04-union' },
  { text: 'キートップをエクスポート', link: '/keyclicker/05-export-keytop' },
  { text: 'キーボックスをエクスポート', link: '/keyclicker/06-export-keybox' },
  { text: '3Dモデルをスライス', link: '/keyclicker/07-slice' },
  { text: 'LEDをつける', link: '/keyclicker/08-led' },
  { text: '電池をつける', link: '/keyclicker/09-battery' },
  { text: 'スイッチを組み立てる', link: '/keyclicker/10-assemble' },
]

export default defineConfig({
  lang: 'ja',
  title: 'つくまなラボ マニュアル',
  description: '青学つくまなラボのワークショップ用マニュアル',
  base: '/sugoi-manual/',
  cleanUrls: true,
  lastUpdated: true,
  head: [['meta', { name: 'viewport', content: 'width=device-width, initial-scale=1' }]],
  themeConfig: {
    nav: [
      { text: 'キークリッカー', link: '/keyclicker/' },
      { text: '修正を依頼する', link: '/feedback' },
    ],
    sidebar: [{ text: 'キークリッカーをつくろう', items: keyclickerPages }],
    outline: { label: 'このページの内容' },
    docFooter: { prev: '前のページ', next: '次のページ' },
    sidebarMenuLabel: 'もくじ',
    returnToTopLabel: 'トップへもどる',
    darkModeSwitchLabel: '表示',
    lastUpdated: { text: '最終更新' },
    search: { provider: 'local' },
    // カスタム項目 (テーマ側で参照)
    feedbackEndpoint: FEEDBACK_ENDPOINT,
  } as any,
})
