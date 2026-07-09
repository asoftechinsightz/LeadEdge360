'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { LoadingSpinner } from '@/components/design-system/core/LoadingState'
import { getPortalToken } from '@/lib/portal/client'

const PUBLIC_PATHS = ['/portal/login']

export function PortalAuthProvider({ children }) {
  const pathname = usePathname()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname?.startsWith(`${p}/`))
    const token = getPortalToken()
    if (!isPublic && !token) {
      window.location.assign('/portal/login')
      return
    }
    if (isPublic && token && pathname === '/portal/login') {
      window.location.assign('/portal/invoices')
      return
    }
    setReady(true)
  }, [pathname])

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner className="size-10" />
      </div>
    )
  }

  return children
}
