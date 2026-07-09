const MERGE_FIELDS = ['name', 'company', 'email', 'phone', 'city', 'territory', 'label', 'status']

export function mergeTemplate(content, lead = {}) {
  let out = String(content || '')
  for (const field of MERGE_FIELDS) {
    const value = lead[field] ?? (field === 'city' ? lead.territory : '') ?? ''
    out = out.replaceAll(`{{${field}}}`, String(value))
  }
  return out
}

export function previewTemplate(template, lead = {}) {
  return {
    subject: mergeTemplate(template.subject, lead),
    body: mergeTemplate(template.body, lead),
  }
}
