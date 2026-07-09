'use client'

import { ThemeProvider } from '@/components/design-system/themes/ThemeProvider'
import { PortalAuthProvider } from '@/components/portal/PortalAuthProvider'

export default function PortalLayout({ children }) {
  return (
    <ThemeProvider theme="suite">
      <PortalAuthProvider>{children}</PortalAuthProvider>
    </ThemeProvider>
  )
}
