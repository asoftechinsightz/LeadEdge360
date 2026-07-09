/**
 * Fetch with exponential backoff for integration API calls.
 */
export async function fetchWithRetry(url, options = {}, {
  retries = 3,
  baseDelayMs = 300,
  retryOn = [429, 502, 503, 504],
} = {}) {
  let lastError
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        ...options,
        signal: options.signal || AbortSignal.timeout(options.timeoutMs || 30_000),
      })
      if (retryOn.includes(res.status) && attempt < retries) {
        await sleep(baseDelayMs * 2 ** attempt)
        continue
      }
      return res
    } catch (e) {
      lastError = e
      if (attempt < retries) await sleep(baseDelayMs * 2 ** attempt)
    }
  }
  throw lastError || new Error('FETCH_FAILED')
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}
