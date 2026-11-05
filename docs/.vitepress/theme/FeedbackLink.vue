<script setup lang="ts">
import { useData, withBase } from 'vitepress'
import { computed } from 'vue'

const { page, frontmatter } = useData()
// 'keyclicker/08-led.md' → '/keyclicker/08-led'
const pagePath = computed(() => '/' + page.value.relativePath.replace(/\.md$/, '').replace(/(^|\/)index$/, '$1'))
const href = computed(() => withBase('/feedback') + '?page=' + encodeURIComponent(pagePath.value))
</script>

<template>
  <div v-if="!frontmatter.noFeedback" class="feedback-link">
    <a :href="href" class="feedback-button">✏️ このページの修正を依頼する</a>
    <p class="feedback-note">
      わかりにくいところ、まちがい、追加してほしいことなどを教えてください。
    </p>
  </div>
</template>

<style scoped>
.feedback-link { margin-top: 2.5rem; padding: 1.25rem; border: 1px solid var(--vp-c-divider); border-radius: 12px; text-align: center; }
.feedback-button { display: inline-block; padding: 0.7rem 1.4rem; border-radius: 999px; background: var(--vp-c-brand-1); color: #fff !important; font-weight: 600; text-decoration: none !important; }
.feedback-note { margin: 0.75rem 0 0; font-size: 0.9rem; color: var(--vp-c-text-2); }
</style>
