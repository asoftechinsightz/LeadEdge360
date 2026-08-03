import SiteShell from '@/components/site/SiteShell'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Download, FileArchive, FileCode, ShieldCheck, Github, Server, Database, FileText, Smartphone } from 'lucide-react'
import Link from 'next/link'

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
  { i: ShieldCheck,t: 'Bcrypt + JWT', d: '15-min access tokens, rotating 30-day refresh, opaque hashed in DB' },
  { i: Smartphone, t: 'OTP via MSG91', d: 'SMS provider stub (logs OTP in dev; set MSG91_AUTH_KEY for live SMS)' },
  { i: FileText,   t: 'OpenAPI 3.1 spec', d: '50+ endpoints documented (auth, users, leads, followups, dashboard, whatsapp, notifications, admin, webhooks)' },
  { i: FileText,   t: 'Postman Collection', d: 'Pre-configured with auto-token refresh test scripts' },
  { i: FileText,   t: 'Auth Flow Diagrams', d: 'Mermaid sequence diagrams for OTP / password / refresh' },
  { i: FileText,   t: 'Error-code Matrix', d: '40+ canonical codes (AUTH_*, VALIDATION, PLAN_LIMIT, etc.)' },
  { i: Database,   t: 'PostgreSQL Schema (14 tables)', d: 'DDL + indexes + seed + one-shot init-db.sh' },
  { i: Server,     t: 'Postgres + Nginx + Security', d: 'Install, tune, backup, restore, SSH, UFW, Fail2ban' },
  { i: FileText,   t: 'Post-deploy Checklist', d: '50-item go-live validation list' },
]

export default function DownloadPage() {
  return (
    <SiteShell>
      <section className="container py-16">
        <div className="flex items-center gap-2 mb-5">
          <Badge variant="outline" className="rounded-full border-primary/30 text-primary">Source code</Badge>
          <Badge className="bg-primary text-primary-foreground">v1.2.0 · latest</Badge>
          <Badge variant="outline" className="rounded-full border-accent/30 text-accent">Mobile API live</Badge>
        </div>
        <h1 className="font-display font-bold text-5xl md:text-6xl">Download the full source code.</h1>
        <p className="mt-5 text-muted-foreground text-lg max-w-2xl">
          Complete production-ready codebase + <span className="text-foreground">mobile API documentation</span> + <span className="text-foreground">PostgreSQL schema</span> + <span className="text-foreground">deployment guides</span> — everything to ship LeadEdge360 to a fresh Ubuntu VPS.
        </p>

        <div className="grid md:grid-cols-2 gap-4 mt-12">
          {files.map(f => (
            <Card key={f.name} className="bg-card/60 border-border/60 hover:border-primary/40 transition">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/15 text-primary grid place-items-center shrink-0">
                    <f.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-display font-semibold text-lg truncate">{f.name}</div>
                    <div className="text-sm text-muted-foreground">{f.desc}</div>
                    <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="px-2 py-0.5 rounded-full bg-muted/30 border border-border/40">{f.size}</span>
                      <span className="font-mono">SHA-256: {f.sha}</span>
                    </div>
                  </div>
                </div>
                <a href={f.href} download className="block mt-5">
                  <Button className="w-full rounded-full bg-primary hover:bg-primary/90 glow-orange">
                    <Download className="h-4 w-4 mr-2" /> Download v1.1.0
                  </Button>
                </a>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12">
          <h2 className="font-display font-bold text-2xl mb-4">📦 What's new in v1.1.0</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {newDocs.map(d => (
              <Card key={d.t} className="bg-card/60 border-border/60">
                <CardContent className="p-4 flex items-start gap-3">
                  <d.i className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <div className="font-medium text-sm">{d.t}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{d.d}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-4">
          <InfoCard icon={Server} title="What's inside the tarball" >
            <ul className="text-sm text-muted-foreground space-y-1 mt-2">
              <li>• 8-page marketing site (Next.js 14)</li>
              <li>• LeadEdge360 CRM + AI scoring</li>
              <li>• RetailEdge360 + RevenueShield AI</li>
              <li>• Emergent Auth + multi-tenant</li>
              <li>• DPDP Act 2023 compliance</li>
              <li>• Razorpay payments</li>
              <li>• 4 n8n workflow JSONs</li>
              <li>• <strong className="text-foreground">/docs</strong>: OpenAPI + Postman + SQL + guides</li>
              <li>• Dockerfile + docker-compose</li>
              <li>• deploy.sh + GitHub Actions CI</li>
              <li>• Nginx config + Caddyfile</li>
            </ul>
          </InfoCard>
          <InfoCard icon={ShieldCheck} title="Verify integrity">
            <div className="text-sm text-muted-foreground mt-2 space-y-2">
              <p>After downloading, verify the SHA-256 checksum matches:</p>
              <code className="block bg-background/60 rounded p-2 text-xs font-mono break-all">
                shasum -a 256 asoftech-insightz-v1.1.0.tar.gz
              </code>
              <a href="/downloads/checksums.txt" className="text-primary hover:underline text-xs">Download checksums.txt →</a>
            </div>
          </InfoCard>
          <InfoCard icon={Github} title="Quick start">
            <pre className="bg-background/60 rounded p-3 text-xs font-mono overflow-x-auto mt-2 leading-relaxed">
{`tar -xzf asoftech-insightz-v1.2.0.tar.gz
cd asoftech-insightz
cp .env.example .env
docker compose up -d --build
# open http://localhost:3000`}
            </pre>
            <Link href="/contact" className="text-primary hover:underline text-xs">Need enterprise support? →</Link>
          </InfoCard>
        </div>

        <Card className="bg-card/40 border-border/60 mt-12">
          <CardContent className="p-6">
            <div className="font-display font-semibold text-lg mb-2">🚀 Deploy to fresh Ubuntu VPS — one command</div>
            <pre className="bg-background/60 rounded-lg p-4 text-xs font-mono overflow-x-auto leading-relaxed">
{`# 1) SCP the tarball, then on the VPS:
tar -xzf asoftech-insightz-v1.1.0.tar.gz && sudo mv asoftech-insightz /opt/asoftech

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

        <div className="mt-12 rounded-2xl border border-border/60 bg-card/40 p-6">
          <div className="text-sm text-muted-foreground">
            <strong className="text-foreground">License:</strong> Proprietary — © AsoftechInsightz Pvt. Ltd. For use by Asoftech and its authorised customers. Need an enterprise / source-code license? <a href="mailto:enquiry@asoftechinsightz.com" className="text-primary hover:underline">enquiry@asoftechinsightz.com</a>
          </div>
        </div>

        {/* Previous version */}
        <details className="mt-8 text-muted-foreground">
          <summary className="cursor-pointer text-sm hover:text-primary">Previous versions</summary>
          <div className="mt-3 text-sm space-y-1">
            <div>v1.0.0 — <a href="/downloads/asoftech-insightz-v1.0.0.tar.gz" className="text-primary hover:underline">tar.gz</a> · <a href="/downloads/asoftech-insightz-v1.0.0.zip" className="text-primary hover:underline">zip</a></div>
          </div>
        </details>
      </section>
    </SiteShell>
  )
}

function InfoCard({ icon: Icon, title, children }) {
  return (
    <Card className="bg-card/60 border-border/60">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-1">
          <Icon className="h-4 w-4 text-primary" />
          <div className="font-display font-semibold">{title}</div>
        </div>
        {children}
      </CardContent>
    </Card>
  )
}
