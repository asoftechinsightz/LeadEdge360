import { NextResponse } from 'next/server'

export function portalError(error) {
  const status = error.message === 'UNAUTHORIZED' ? 401
    : (error.message === 'INVALID_CREDENTIALS' ? 401 : 500)
  return NextResponse.json({ success: false, error: error.message }, { status })
}
