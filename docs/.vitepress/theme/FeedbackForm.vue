<script setup lang="ts">
import { useData } from 'vitepress'
import { onMounted, ref } from 'vue'

const { theme } = useData()
const endpoint: string = (theme.value as any).feedbackEndpoint

const page = ref('')
const message = ref('')
const name = ref('')
const status = ref<'idle' | 'sending' | 'done' | 'error'>('idle')
const errorText = ref('')

onMounted(() => {
  const params = new URLSearchParams(location.search)
  page.value = params.get('page') || ''
})

async function submit() {
  if (!message.value.trim()) return
  status.value = 'sending'
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page: page.value, message: message.value, name: name.value }),
    })
    if (!res.ok) throw new Error(await res.text())
    status.value = 'done'
  } catch (e: any) {
    status.value = 'error'
    errorText.value = e?.message || String(e)
  }
}
</script>

<template>
  <div class="feedback-form">
    <div v-if="status === 'done'" class="thanks">
      <p><strong>送信しました。ありがとうございます!</strong></p>
      <p>いただいた内容をもとにマニュアルを見直します。</p>
    </div>
    <form v-else @submit.prevent="submit">
      <label>
        対象のページ
        <input v-model="page" type="text" placeholder="例: /keyclicker/08-led (QRコードから開くと自動で入ります)" />
      </label>
      <label>
        修正してほしいこと <span class="req">必須</span>
        <textarea
          v-model="message"
          rows="7"
          required
          placeholder="例: LEDをつけるページの「長い方の足を右側に」が、写真だと左に見えます。どちらが正しいか書いてほしいです。"
        ></textarea>
      </label>
      <label>
        お名前 (任意)
        <input v-model="name" type="text" placeholder="ニックネームでもOK" />
      </label>
      <button type="submit" :disabled="status === 'sending' || !message.trim()">
        {{ status === 'sending' ? '送信中…' : '送信する' }}
      </button>
      <p v-if="status === 'error'" class="error">送信できませんでした。時間をおいてもう一度お試しください。({{ errorText }})</p>
    </form>
  </div>
</template>

<style scoped>
.feedback-form label { display: block; margin: 1rem 0 0; font-weight: 600; }
.feedback-form input, .feedback-form textarea { display: block; width: 100%; margin-top: 0.4rem; padding: 0.6rem 0.8rem; border: 1px solid var(--vp-c-divider); border-radius: 8px; background: var(--vp-c-bg); color: var(--vp-c-text-1); font: inherit; font-weight: 400; }
.feedback-form button { margin-top: 1.25rem; padding: 0.75rem 1.6rem; border: none; border-radius: 999px; background: var(--vp-c-brand-1); color: #fff; font-weight: 600; font-size: 1rem; cursor: pointer; }
.feedback-form button:disabled { opacity: 0.5; cursor: default; }
.req { font-size: 0.75rem; color: var(--vp-c-danger-1); margin-left: 0.3rem; }
.error { color: var(--vp-c-danger-1); font-size: 0.9rem; }
.thanks { padding: 1.5rem; border: 1px solid var(--vp-c-divider); border-radius: 12px; }
</style>
