'use server'

import { runAeoPrompt } from '@/lib/scoring'

export async function invokeAeoPrompt(promptId, context) {
  return runAeoPrompt(promptId, context || {})
}
