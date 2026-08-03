import Navbar from './Navbar'
import Footer from './Footer'
import DpdpConsentBanner from './DpdpConsentBanner'

export default function SiteShell({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <DpdpConsentBanner />
    </div>
  )
}
