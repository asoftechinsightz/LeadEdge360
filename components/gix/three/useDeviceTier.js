'use client'

import { useEffect, useState } from 'react'

/** mobile = phone only · tablet = laptop+tablet · desktop = all three */
export function useDeviceTier() {
  const [tier, setTier] = useState('desktop')

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth
      if (w < 640) setTier('mobile')
      else if (w < 1024) setTier('tablet')
      else setTier('desktop')
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return tier
}
