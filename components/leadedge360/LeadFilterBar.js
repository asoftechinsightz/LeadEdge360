'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ROLES, STATUSES, TERRITORIES } from './constants'

export function LeadFilterBar({ role, territory, status, onRoleChange, onTerritoryChange, onStatusChange }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={role} onValueChange={onRoleChange}>
        <SelectTrigger className="w-[180px] bg-card/60"><SelectValue /></SelectTrigger>
        <SelectContent>
          {ROLES.map((r) => (
            <SelectItem key={r.v} value={r.v}>{r.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={territory} onValueChange={onTerritoryChange}>
        <SelectTrigger className="w-[160px] bg-card/60"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All territories</SelectItem>
          {TERRITORIES.map((t) => (
            <SelectItem key={t} value={t}>{t}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger className="w-[140px] bg-card/60"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All status</SelectItem>
          {STATUSES.map((s) => (
            <SelectItem key={s} value={s}>{s}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
