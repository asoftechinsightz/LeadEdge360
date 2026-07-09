export const CATEGORIES = [
  'dairy', 'bakery', 'produce', 'meat', 'beverage',
  'pharma', 'cosmetic', 'electronics', 'household', 'other',
]

export const RISK_STYLES = {
  High: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  Medium: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  Low: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
}

export const CHART_COLORS = [
  'hsl(var(--destructive))',
  'hsl(var(--brand-orange))',
  'hsl(var(--brand-electric))',
  'hsl(280 60% 65%)',
  'hsl(var(--muted-foreground))',
]

export const formatCurrency = (n) => `₹${Math.round(Number(n) || 0).toLocaleString('en-IN')}`
