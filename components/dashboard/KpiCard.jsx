import { Card, CardContent } from '@/components/ui/card'

export function KpiCard({ icon: Icon, label, value, sub, accent = 'primary', className = '' }) {
  const accentClass = accent === 'accent' ? 'text-accent' : 'text-primary'
  const glowClass = accent === 'accent' ? 'bg-accent/20' : 'bg-primary/20'

  return (
    <Card className={`bg-card/60 border-border/60 overflow-hidden relative ${className}`}>
      <div className={`absolute -top-10 -right-10 h-32 w-32 rounded-full ${glowClass} blur-2xl`} />
      <CardContent className="p-5 relative">
        <div className="flex items-center justify-between">
          <div className="text-xs tracking-widest text-muted-foreground">{label}</div>
          {Icon && <Icon className={`h-4 w-4 ${accentClass}`} />}
        </div>
        <div className="font-display text-3xl font-bold mt-2 tabular-nums">{value}</div>
        {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
      </CardContent>
    </Card>
  )
}
