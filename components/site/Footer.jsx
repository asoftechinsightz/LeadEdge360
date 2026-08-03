import Link from 'next/link'
import Image from 'next/image'

const LOGO = 'https://customer-assets.emergentagent.com/job_qualify-leads-hub/artifacts/5r2ee7t5_image.png'

export default function Footer() {
  return (
    <footer className="border-t border-border/40 mt-24">
      <div className="container py-14 grid md:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="relative h-10 w-10 rounded-full overflow-hidden ring-2 ring-primary/40 bg-[#0B1220]">
              <Image src={LOGO} alt="AsoftechInsightz" fill className="object-cover scale-[1.4]" sizes="40px"/>
            </div>
            <div className="font-display font-semibold">
              <span className="text-white">Asoftech</span><span className="text-primary">Insightz</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground max-w-xs">Insight. Innovation. Intelligence. A Made-in-India AI SaaS Suite — transforming businesses through AI &amp; automation.</p>
        </div>
        <div>
          <h4 className="font-medium mb-3 text-sm">Products</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/products" className="hover:text-primary">LeadEdge360</Link></li>
            <li><Link href="/products" className="hover:text-primary">RetailEdge360</Link></li>
            <li><Link href="/solutions" className="hover:text-primary">Solutions</Link></li>
            <li><Link href="/products" className="hover:text-primary">All Products</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-medium mb-3 text-sm">Company</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/about" className="hover:text-primary">About</Link></li>
            <li><Link href="/solutions" className="hover:text-primary">Solutions</Link></li>
            <li><Link href="/blog" className="hover:text-primary">Blog</Link></li>
            <li><Link href="/contact" className="hover:text-primary">Contact</Link></li>
            <li><Link href="/pricing" className="hover:text-primary">Pricing</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-medium mb-3 text-sm">Contact</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="mailto:enquiry@asoftechinsightz.com" className="hover:text-primary">enquiry@asoftechinsightz.com</a></li>
            <li><a href="tel:+917307911405" className="hover:text-primary">+91-7307911405</a></li>
            <li>Noida, India</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/40">
        <div className="container py-5 text-xs text-muted-foreground flex flex-col md:flex-row justify-between gap-3">
          <div>© {new Date().getFullYear()} AsoftechInsightz Pvt. Ltd. · DPDP Act, 2023 compliant.</div>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-primary">Privacy</Link>
            <Link href="/terms" className="hover:text-primary">Terms</Link>
            <a href="mailto:enquiry@asoftechinsightz.com" className="hover:text-primary">Grievance</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
