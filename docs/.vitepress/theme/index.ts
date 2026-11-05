import DefaultTheme from 'vitepress/theme'
import { h } from 'vue'
import FeedbackLink from './FeedbackLink.vue'
import FeedbackForm from './FeedbackForm.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'doc-after': () => h(FeedbackLink),
    })
  },
  enhanceApp({ app }) {
    app.component('FeedbackForm', FeedbackForm)
  },
}
