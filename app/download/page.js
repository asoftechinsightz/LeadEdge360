import SiteShell from '@/components/site/SiteShell'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Download, FileArchive, FileCode, ShieldCheck, Github, Server, Database, FileText, Smartphone } from 'lucide-react'
import Link from 'next/link'
import MarketingPageHero from '@/components/gix/enterprise/MarketingPageHero'
import { FadeIn } from '@/components/gix/enterprise/primitives'

export const metadata = { title: 'Download · AsoftechInsightz' }

const files = [
  {
    name: 'asoftech-insightz-v1.2.0.tar.gz',
    desc: 'Linux / macOS — recommended (full source + mobile API live + docs + SQL)',
    size: '172 KB',
    sha: 'c77bf85e…d5d02c15d',
    icon: FileArchive,
    href: '/downloads/asoftech-insightz-v1.2.0.tar.gz',
  },
  {
    name: 'asoftech-insightz-v1.2.0.zip',
    desc: 'Windows — double-click to extract',
    size: '233 KB',
    sha: 'dc4ee4e3…81df4d16',
    icon: FileCode,
    href: '/downloads/asoftech-insightz-v1.2.0.zip',
  },
]

const newDocs = [
  { i: Smartphone, t: 'Mobile API — LIVE', d: '30+ endpoints: JWT auth, OTP, /users, /followups, /dashboard, /whatsapp, /notifications, /admin' },
  { i: ShieldCheck, t: 'Bcrypt + JWT', d: '15-min access tokens, rotating 30-day refresh, opaque hashed in DB' },
  { i: Smartphone, t: 'OTP via MSG91', d: 'SMS provider stub (logs OTP in dev; set MSG91_AUTH_KEY for live SMS)' },
  { i: FileText, t: 'OpenAPI 3.1 spec', d: '50+ endpoints documented (auth, users, leads, followups, dashboard, whatsapp, notifications, admin, webhooks)' },
  { i: FileText, t: 'Postman Collection', d: 'Pre-configured with auto-token refresh test scripts' },
  { i: FileText, t: 'Auth Flow Diagrams', d: 'Mermaid sequence diagrams for OTP / password / refresh' },
  { i: FileText, t: 'Error-code Matrix', d: '40+ canonical codes (AUTH_*, VALIDATION, PLAN_LIMIT, etc.)' },
  { i: Database, t: 'PostgreSQL Schema (14 tables)', d: 'DDL + indexes + seed + one-shot init-db.sh' },
  { i: Server, t: 'Postgres + Nginx + Security', d: 'Install, tune, backup, restore, SSH, UFW, Fail2ban' },
  { i: FileText, t: 'Post-deploy Checklist', d: '50-item go-live validation list' },
]

export default function DownloadPage() {
  return (
    <SiteShell>
      <MarketingPageHero
        eyebrow="Source code"
        title="Download the full"
        accent="enterprise codebase"
        description="Complete production-ready codebase with mobile API documentation, PostgreSQL schema, and deployment guides — everything to ship LeadEdge360 to a fresh Ubuntu VPS."
      >
        <div className="flex flex-wrap justify-center gap-2 mt-8">
          <Badge className="bg-[#0066FF]/20 text-[hsl(var(--brand-electric))] border-0">v1.2.0 · latest</Badge>
          <Badge variant="outline" className="rounded-full border-white/20">Mobile API live</Badge>
        </div>
      </MarketingPageHero>

      <section className="container pb-12">
        <div className="grid md:grid-cols-2 gap-4">
          {files.map((f, i) => (
            <FadeIn key={f.name} delay={i * 0.06}>
              <Card className="glass border-white/10 hover:gix-glow transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-lg bg-[#0066FF]/15 text-[hsl(var(--brand-electric))] grid place-items-center shrink-0">
                      <f.icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-display font-semibold text-lg truncate">{f.name}</div>
                      <div className="text-sm text-muted-foreground">{f.desc}</div>
                      <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10">{f.size}</span>
                        <span className="font-mono">SHA-256: {f.sha}</span>
                      </div>
                    </div>
                  </div>
                  <a href={f.href} download className="block mt-5">
                    <Button className="w-full rounded-full bg-[#0066FF] hover:bg-[#00C6FF]">
                      <Download className="h-4 w-4 mr-2" /> Download v1.2.0
                    </Button>
                  </a>
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>
      </section>

      <section className="container pb-12">
        <h2 className="font-display font-bold text-2xl mb-4">What&apos;s new in v1.2.0</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {newDocs.map((d, i) => (
            <FadeIn key={d.t} delay={i * 0.03}>
              <Card className="glass border-white/10">
                <CardContent className="p-4 flex items-start gap-3">
                  <d.i className="h-5 w-5 text-[hsl(var(--brand-electric))] mt-0.5 shrink-0" />
                  <div>
                    <div className="font-medium text-sm">{d.t}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{d.d}</div>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>
      </section>

      <section className="container pb-12 grid md:grid-cols-3 gap-4">
        <InfoCard icon={Server} title="What's inside the tarball">
          <ul className="text-sm text-muted-foreground space-y-1 mt-2">
            <li>• Enterprise marketing site (Next.js 14)</li>
            <li>• LeadEdge360 CRM + AI Workforce</li>
            <li>• RetailEdge360 + RevenueShield AI</li>
            <li>• Multi-tenant auth + DPDP compliance</li>
            <li>• Razorpay payments</li>
            <li>• n8n workflow JSONs</li>
            <li>• <strong className="text-foreground">/docs</strong>: OpenAPI + Postman + SQL + guides</li>
            <li>• Dockerfile + docker-compose</li>
            <li>• deploy.sh + GitHub Actions CI</li>
            <li>• Nginx config + Caddyfile</li>
          </ul>
        </InfoCard>
        <InfoCard icon={ShieldCheck} title="Verify integrity">
          <div className="text-sm text-muted-foreground mt-2 space-y-2">
            <p>After downloading, verify the SHA-256 checksum matches:</p>
            <code className="block bg-black/30 rounded p-2 text-xs font-mono break-all border border-white/10">
              shasum -a 256 asoftech-insightz-v1.2.0.tar.gz
            </code>
            <a href="/downloads/checksums.txt" className="text-[hsl(var(--brand-electric))] hover:underline text-xs">Download checksums.txt →</a>
          </div>
        </InfoCard>
        <InfoCard icon={Github} title="Quick start">
          <pre className="bg-black/30 rounded p-3 text-xs font-mono overflow-x-auto mt-2 leading-relaxed border border-white/10">
{`tar -xzf asoftech-insightz-v1.2.0.tar.gz
cd asoftech-insightz
cp .env.example .env
docker compose up -d --build
# open http://localhost:3000`}
          </pre>
          <Link href="/contact" className="text-[hsl(var(--brand-electric))] hover:underline text-xs">Need enterprise support? →</Link>
        </InfoCard>
      </section>

      <section className="container pb-12">
        <Card className="glass border-white/10">
          <CardContent className="p-6">
            <div className="font-display font-semibold text-lg mb-2">Deploy to fresh Ubuntu VPS — one command</div>
            <pre className="bg-black/30 rounded-lg p-4 text-xs font-mono overflow-x-auto leading-relaxed border border-white/10">
{`# 1) SCP the tarball, then on the VPS:
tar -xzf asoftech-insightz-v1.2.0.tar.gz && sudo mv asoftech-insightz /opt/asoftech

# 2) One-shot installer (Docker + Caddy + UFW + secrets + HTTPS)
sudo APP_DOMAIN=app.asoftechinsightz.com \\
     ROOT_DOMAIN=asoftechinsightz.com \\
     EMERGENT_LLM_KEY=sk-emergent-... \\
     /opt/asoftech/deploy.sh

# 3) Provision Postgres (creates DB, user, runs schema + seed)
sudo -u postgres /opt/asoftech/docs/sql/init-db.sh

# Done. App is live at https://app.asoftechinsightz.com`}
            </pre>
          </CardContent>
        </Card>
      </section>

      <section className="container pb-24">
        <div className="rounded-2xl border border-white/10 gix-glass p-6">
          <div className="text-sm text-muted-foreground">
            <strong className="text-foreground">License:</strong> Proprietary — © AsoftechInsightz Pvt. Ltd. For use by Asoftech and its authorised customers. Need an enterprise / source-code license? <a href="mailto:enquiry@asoftechinsightz.com" className="text-[hsl(var(--brand-electric))] hover:underline">enquiry@asoftechinsightz.com</a>
          </div>
        </div>

        <details className="mt-8 text-muted-foreground">
          <summary className="cursor-pointer text-sm hover:text-[hsl(var(--brand-electric))]">Previous versions</summary>
          <div className="mt-3 text-sm space-y-1">
            <div>v1.0.0 — <a href="/downloads/asoftech-insightz-v1.0.0.tar.gz" className="text-[hsl(var(--brand-electric))] hover:underline">tar.gz</a> · <a href="/downloads/asoftech-insightz-v1.0.0.zip" className="text-[hsl(var(--brand-electric))] hover:underline">zip</a></div>
          </div>
        </details>
      </section>
    </SiteShell>
  )
}

function InfoCard({ icon: Icon, title, children }) {
  return (
    <FadeIn>
      <Card className="glass border-white/10 h-full">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-1">
            <Icon className="h-4 w-4 text-[hsl(var(--brand-electric))]" />
            <div className="font-display font-semibold">{title}</div>
          </div>
          {children}
        </CardContent>
      </Card>
    </FadeIn>
  )
}
