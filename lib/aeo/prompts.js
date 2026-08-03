import faqSuggestions from '../../config/aeo/prompts/faq-suggestions.json'
import descriptionImprove from '../../config/aeo/prompts/description-improve.json'
import reviewReply from '../../config/aeo/prompts/review-reply.json'
import gbpPost from '../../config/aeo/prompts/gbp-post.json'
import serviceDescription from '../../config/aeo/prompts/service-description.json'
import localPage from '../../config/aeo/prompts/local-page.json'
import socialCaption from '../../config/aeo/prompts/social-caption.json'
import whatsappOutreach from '../../config/aeo/prompts/whatsapp-outreach.json'

const PROMPTS = {
  'faq-suggestions': faqSuggestions,
  'description-improve': descriptionImprove,
  'review-reply': reviewReply,
  'gbp-post': gbpPost,
  'service-description': serviceDescription,
  'local-page': localPage,
  'social-caption': socialCaption,
  'whatsapp-outreach': whatsappOutreach,
}

export function getAeoPrompt(promptId) {
  return PROMPTS[promptId] || null
}

export function listAeoPromptIds() {
  return Object.keys(PROMPTS)
}

export function renderPromptTemplate(template, context = {}) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const val = context[key]
    if (val == null) return ''
    if (typeof val === 'object') return JSON.stringify(val, null, 2)
    return String(val)
  })
}
