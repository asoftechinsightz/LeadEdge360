# Split monolith into 5 stacked commits (safe — never deletes .git).
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

$env:GIT_AUTHOR_NAME = "Arnav"
$env:GIT_AUTHOR_EMAIL = "anoopkumar.2007@gmail.com"
$env:GIT_COMMITTER_NAME = "Arnav"
$env:GIT_COMMITTER_EMAIL = "anoopkumar.2007@gmail.com"

git tag -f monolith/p0-p1 main

function Add-Paths([string[]]$paths) {
  foreach ($p in $paths) {
    if (Test-Path -LiteralPath $p) {
      git add -f -- $p
    } else {
      git checkout monolith/p0-p1 -- -- "$p" 2>$null
      if (Test-Path -LiteralPath $p) { git add -f -- $p }
    }
  }
}

# --- integration base (PR target) ---
git checkout --orphan integration-base
git rm -rf --cached . 2>$null | Out-Null
git checkout monolith/p0-p1 -- README.md .gitignore
git add README.md .gitignore
git commit -m "chore: integration base for stacked P0/P1 PRs"

# --- stacked feature commits ---
git checkout --orphan split-work
git rm -rf --cached . 2>$null | Out-Null
git checkout monolith/p0-p1 -- .

$PR1 = @(
  "README.md", ".gitignore", "package.json", "package-lock.json", "yarn.lock",
  "lib/onboarding", "lib/seed/demo-seed.js", "lib/mobile-routes.js",
  "app/api/leads/demo-data", "app/api/onboarding/lead-step",
  "app/onboarding", "app/splash", "app/product-selection",
  "components/settings/DemoDataPanel.tsx", "components/leads/LeadsZeroBanner.tsx",
  "components/onboarding", "components/empty-states/LeadsEmpty.tsx",
  "middleware/auth.js", "middleware.js",
  "tests/p0-leadedge360.test.js",
  "docs/P0_DEMO_SCRIPT.md", "docs/P0_PR_PLAN.md", "docs/GITHUB_PROJECT_2.md"
)
git reset
Add-Paths $PR1
git commit -m "feat(p0): onboarding, demo seed, and activation CTAs"
git branch -f feat/p0-onboarding-demo-seed HEAD

$PR2 = @(
  "lib/campaigns/drip.js", "lib/automation/workflow-engine.js",
  "components/marketing/CampaignBuilder.tsx", "components/automation",
  "app/campaigns/page.js", "app/leadedge360/automation", "app/api/automation",
  "components/leads/LeadDetailActions.tsx"
)
Add-Paths $PR2
git checkout monolith/p0-p1 -- "app/api/leads/[id]/whatsapp-intro"
git add -f "app/api/leads/[id]/whatsapp-intro"
git commit -m "feat(p0): marketing automation v1 and visual workflow"
git branch -f feat/p0-marketing-automation HEAD

$PR3 = @(
  "app/administration", "components/suite/SettingsModule.js",
  "components/settings/IntegrationsSettingsPanel.tsx", "components/integrations",
  "app/settings/integrations", "lib/auth/sso.js", "lib/auth/sso-session.js",
  "components/support/SLADashboard.tsx", "app/settings/support",
  "lib/integrations/gmail-sync.js", "lib/integrations/outlook-sync.js"
)
Add-Paths $PR3
git commit -m "feat(p1): integrations hub and security SSO settings"
git branch -f feat/p1-integrations-sso HEAD

$PR4 = @(
  "components/analytics/Attribution.tsx", "app/analytics/page.js",
  "components/reports/Attribution.tsx", "app/api/analytics/attribution",
  "app/api/analytics/roi", "lib/analytics/roi-calculator.js", "lib/attribution",
  "app/leadedge360/reports/attribution"
)
Add-Paths $PR4
git commit -m "feat(p1): attribution and analytics ROAS tab"
git branch -f feat/p1-attribution-analytics HEAD

$PR5 = @(
  "components/layout/Sidebar.tsx", "components/suite/nav-config.ts",
  "components/suite/AppShell.tsx", "components/suite/Sidebar.tsx",
  "lib/leads/paths.js", "app/leads", "app/leadedge360/leads",
  "components/leadedge360/LeadTable.js", "components/leadedge360/LeadDetailTabs.js",
  "components/leadedge360/LeadDeleteButton.js", "components/leadedge360/LeadEdge360Hub.tsx",
  "components/leadedge360/LeadCaptureDialog.js", "components/leadedge360/LeadsManagement.js",
  "components/leadedge360/LeadDashboard.js", "components/leadedge360/enterprise/AICommandCenter.tsx",
  "lib/activities/registry.js", "lib/activities/format.js",
  "app/api/global-search/route.js", "e2e/enterprise"
)
Add-Paths $PR5
git add -A
git commit -m "feat(p0): unified navigation, canonical routes, and platform baseline"
git branch -f feat/p0-nav-unify HEAD

git checkout main
Write-Host "Done. Branches:"
git log --oneline integration-base
git log --oneline feat/p0-onboarding-demo-seed -1
git log --oneline feat/p0-marketing-automation -1
git log --oneline feat/p1-integrations-sso -1
git log --oneline feat/p1-attribution-analytics -1
git log --oneline feat/p0-nav-unify -1
