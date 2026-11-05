# sugoi-manual

青学つくまなラボのワークショップ用マニュアル。VitePress でスマホ向けに公開し、読者からの修正依頼を AI が PR にする仕組み付き。

- 公開サイト: https://champierre.github.io/sugoi-manual/
- 修正依頼フォーム: https://champierre.github.io/sugoi-manual/feedback

## 構成

```
docs/                     VitePress のソース (Markdown)
  keyclicker/             「キークリッカーをつくろう」の各ページ
  feedback.md             修正依頼フォームのページ
  public/images/          写真・スクリーンショット
  .vitepress/config.mts   サイト設定 (SITE_URL / FEEDBACK_ENDPOINT もここ)
  .vitepress/theme/       「このページの修正を依頼する」ボタンとフォーム
worker/                   フォーム → GitHub Issue を作る Cloudflare Worker
scripts/gen-qr.mjs        印刷用 QR コードを生成
.github/workflows/
  deploy.yml              main に push → GitHub Pages にデプロイ
  claude-fix.yml          Issue に approved ラベル → Claude が修正して PR 作成
```

## 修正依頼が PR になるまで

1. 印刷マニュアルの QR コード → サイト内のフォームが開く (対象ページ入り)
2. 読者が自然文で依頼を書いて送信 → Worker が GitHub Issue を作成 (ラベル `修正依頼`)
3. スタッフが Issue を見て問題なければ `approved` ラベルを付ける
4. GitHub Actions で Claude Code が依頼の意図を汲んで Markdown を修正し、PR を作成
5. スタッフが PR を確認してマージ → GitHub Pages に反映

## ローカルで動かす

```sh
npm install
npm run dev      # http://localhost:5173/sugoi-manual/
npm run build
npm run qr       # qr/ に QR 画像と一覧 (qr/index.html) を出力
```

## 初回セットアップ (一度だけ)

### GitHub

1. リポジトリ Settings → Pages → Source を「GitHub Actions」にする
2. ラベル `修正依頼` と `approved` を作る
3. Settings → Secrets → `ANTHROPIC_API_KEY` を登録
4. Claude GitHub App をインストールする (https://github.com/apps/claude)。または `claude` 内で `/install-github-app`

### Cloudflare Worker (フォームの受け口)

```sh
cd worker
npm install
npx wrangler login
npx wrangler secret put GITHUB_TOKEN        # Issues: write 権限の fine-grained PAT
npx wrangler secret put TURNSTILE_SECRET    # 任意。スパム対策を入れる場合
npx wrangler deploy
```

デプロイ後に表示される URL を `docs/.vitepress/config.mts` の `FEEDBACK_ENDPOINT` に設定する (末尾 `/feedback`)。

### 印刷用 QR

`npm run qr` で `qr/index.html` を開き、各ページ用の QR を印刷マニュアルに貼る。
