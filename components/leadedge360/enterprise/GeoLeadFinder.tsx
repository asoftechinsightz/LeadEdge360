'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { leadEdgeApi } from '@/src/services/api';
import { apiGet, apiPost } from '@/src/lib/api';
import { PageHeader } from '@/components/design-system/core/PageHeader';
import { Card, CardContent } from '@/components/design-system/core/Card';
import { Button } from '@/components/design-system/core/Button';
import { Input } from '@/components/design-system/core/Input';
import { Badge } from '@/components/design-system/core/Badge';
import { LoadingState } from '@/components/design-system/core/LoadingState';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/design-system/core/Table';
import {
  MapPin, Search, Phone, Globe, Star, ExternalLink,
  UserCheck, Building2, ShieldCheck, Filter,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { GEO_CRITICAL_INDUSTRIES } from '@/lib/scanner/constants';

const SOURCES = [
  'All Sources (Combined)',
  'Google Maps (Nearby)',
  'Google Places (Text)',
  'Meta (Facebook & Instagram)',
] as const;

const SOURCE_LABELS: Record<string, string> = {
  google_maps_nearby: 'Google Maps',
  google_places_text: 'Google Places',
  google_maps: 'Google Maps',
  meta_places: 'Meta',
  meta: 'Meta',
};

function scoreBadge(score: number) {
  if (score >= 80) return { label: 'Hot', className: 'text-red-400 bg-red-500/15 border-red-500/30' };
  if (score >= 50) return { label: 'Warm', className: 'text-amber-400 bg-amber-500/15 border-amber-500/30' };
  return { label: 'Cold', className: 'text-sky-400 bg-sky-500/15 border-sky-500/30' };
}

function qualityBadge(quality?: string) {
  if (quality === 'verified') return { label: 'Verified', className: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30' };
  if (quality === 'partial') return { label: 'Partial', className: 'text-amber-400 bg-amber-500/15 border-amber-500/30' };
  if (quality === 'listing_only') return { label: 'Listing', className: 'text-sky-400 bg-sky-500/15 border-sky-500/30' };
  return null;
}

type GeoScanResult = {
  items: Array<{
    id: string
    businessName: string
    category: string
    address: string
    city: string
    phone: string
    website?: string
    rating?: number
    score: number
    label?: string
    source?: string
    quality?: string
  }>
  stats?: {
    totalFound?: number
    totalStored?: number
    totalRejected?: number
    totalDuplicates?: number
    warnings?: string[]
    rejectReasons?: Record<string, number>
  }
}

export function GeoLeadFinder() {
  const queryClient = useQueryClient();
  const [scanKey, setScanKey] = useState(0);
  const [pinLookupLoading, setPinLookupLoading] = useState(false);
  const [locationResolved, setLocationResolved] = useState(false);
  const [filters, setFilters] = useState({
    country: 'India',
    state: '',
    district: '',
    city: '',
    area: '',
    pinCode: '',
    radius: '10',
    industry: 'Real Estate',
    source: 'All Sources (Combined)' as typeof SOURCES[number],
    qualityOnly: true,
  });

  const [keysReady, setKeysReady] = useState<boolean | null>(null);

  useEffect(() => {
    apiGet<{ ready?: boolean }>('/scanner/readiness')
      .then((d) => setKeysReady(d?.ready ?? false))
      .catch(() => setKeysReady(false));
  }, []);

  const lookupPin = useCallback(async (pin: string) => {
    const digits = pin.replace(/\D/g, '');
    if (digits.length !== 6) {
      setLocationResolved(false);
      return;
    }
    setPinLookupLoading(true);
    try {
      const data = await apiGet<{ location?: {
        pinCode: string
        city: string
        state: string
        district: string
        country: string
        area?: string
      } }>(`/scanner/pincode/${digits}`);
      const loc = data?.location;
      if (loc) {
        setFilters((f) => ({
          ...f,
          pinCode: loc.pinCode,
          city: loc.city,
          state: loc.state,
          district: loc.district,
          country: loc.country || 'India',
          area: loc.area || '',
        }));
        setLocationResolved(true);
      }
    } catch {
      setLocationResolved(false);
      toast.error('Invalid PIN code — could not resolve location');
    } finally {
      setPinLookupLoading(false);
    }
  }, []);

  useEffect(() => {
    const digits = filters.pinCode.replace(/\D/g, '');
    if (digits.length !== 6) return;
    const timer = setTimeout(() => lookupPin(digits), 400);
    return () => clearTimeout(timer);
  }, [filters.pinCode, lookupPin]);

  const query = useQuery({
    queryKey: ['leadedge360', 'geo-leads', filters, scanKey],
    queryFn: () => leadEdgeApi.geoLeads({
      city: filters.city,
      state: filters.state,
      district: filters.district,
      pinCode: filters.pinCode,
      country: filters.country,
      industry: filters.industry,
      radius: Number(filters.radius),
      source: filters.source,
      qualityOnly: filters.qualityOnly,
      run: true,
    }) as Promise<GeoScanResult>,
    enabled: scanKey > 0,
    retry: false,
  });

  const scanErrorMessage = query.isError
    ? String((query.error as { message?: string })?.message || 'Scan failed')
    : '';

  const runScan = () => {
    const pin = filters.pinCode.replace(/\D/g, '');
    if (pin.length !== 6) {
      toast.error('Enter a valid 6-digit PIN code');
      return;
    }
    if (!locationResolved) {
      toast.error('Wait for location to load from PIN code');
      return;
    }
    setScanKey((k) => k + 1);
    toast.message(`Scanning PIN ${pin} — ${filters.city}, ${filters.state}`);
  };

  const convertToLead = async (resultId: string, businessName: string) => {
    try {
      const data = await apiPost<{ success?: boolean; duplicate?: boolean; leadId?: string }>(
        `/scanner/convert/${resultId}`,
      );
      if (data?.duplicate) {
        toast.info(`${businessName} already exists as a lead`);
      } else {
        toast.success(`${businessName} added to CRM`);
      }
      queryClient.invalidateQueries({ queryKey: ['leadedge360', 'geo-leads'] });
    } catch {
      toast.error(`Failed to convert ${businessName}`);
    }
  };

  const update = (key: string, value: string | boolean) => {
    if (key === 'pinCode') {
      const digits = String(value).replace(/\D/g, '').slice(0, 6);
      setLocationResolved(false);
      setFilters((f) => ({
        ...f,
        pinCode: digits,
        ...(digits.length < 6 ? { city: '', state: '', district: '', area: '' } : {}),
      }));
      return;
    }
    setFilters((f) => ({ ...f, [key]: value }));
  };
  const leads = query.data?.items || [];
  const stats = query.data?.stats;

  return (
    <div className="w-full min-w-0 space-y-4 pb-6">
      <PageHeader
        title="Geo Lead Finder"
        description="Enter PIN code — city, district and state auto-fill. Scan uses PIN-centred location only."
      />

      {keysReady === false && (
        <Card className="border-amber-500/40 bg-amber-500/10">
          <CardContent className="p-4 text-sm text-amber-200">
            Google API keys not configured on server. Add <code className="text-xs">GOOGLE_MAPS_API_KEY</code> and{' '}
            <code className="text-xs">GOOGLE_PLACES_API_KEY</code> to <code className="text-xs">.env</code> on VPS, enable Geocoding + Places API, then{' '}
            <code className="text-xs">docker compose up -d app</code>.
          </CardContent>
        </Card>
      )}

      <Card className="bg-card/70 border-border/50 backdrop-blur-sm">
        <CardContent className="p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Search Filters</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="sm:col-span-2">
              <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1 block">
                PIN Code <span className="text-primary">*</span>
              </label>
              <Input
                className="h-9 text-sm font-mono tracking-wider"
                value={filters.pinCode}
                onChange={(e) => update('pinCode', e.target.value)}
                placeholder="e.g. 201306"
                inputMode="numeric"
                maxLength={6}
              />
              {pinLookupLoading && (
                <p className="text-[10px] text-muted-foreground mt-1">Resolving location…</p>
              )}
              {locationResolved && filters.city && (
                <p className="text-[10px] text-emerald-500/90 mt-1">
                  ✓ {filters.area ? `${filters.area}, ` : ''}{filters.city}, {filters.district}, {filters.state}
                </p>
              )}
            </div>
            <div>
              <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1 block">State</label>
              <Input className="h-9 text-sm bg-muted/30" value={filters.state || '—'} readOnly />
            </div>
            <div>
              <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1 block">District</label>
              <Input className="h-9 text-sm bg-muted/30" value={filters.district || '—'} readOnly />
            </div>
            <div>
              <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1 block">City</label>
              <Input className="h-9 text-sm bg-muted/30" value={filters.city || '—'} readOnly />
            </div>
            <div>
              <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1 block">Country</label>
              <Input className="h-9 text-sm bg-muted/30" value={filters.country} readOnly />
            </div>
            <div>
              <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1 block">Radius (km)</label>
              <Input
                className="h-9 text-sm"
                value={filters.radius}
                onChange={(e) => update('radius', e.target.value)}
                type="number"
              />
            </div>
            <div>
              <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1 block">Sector (10 critical)</label>
              <select
                className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm h-9"
                value={filters.industry}
                onChange={(e) => update('industry', e.target.value)}
              >
                {GEO_CRITICAL_INDUSTRIES.map((sector) => (
                  <option key={sector.value} value={sector.value}>{sector.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1 block">Lead Sources</label>
              <select
                className="w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm h-9"
                value={filters.source}
                onChange={(e) => update('source', e.target.value)}
              >
                {SOURCES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
          <label className="mt-3 flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={filters.qualityOnly}
              onChange={(e) => update('qualityOnly', e.target.checked)}
              className="rounded border-border"
            />
            <Filter className="size-3.5 text-muted-foreground" />
            <span>Quality leads only</span>
            <span className="text-xs text-muted-foreground">(must have phone or website — skips junk listings)</span>
          </label>
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-border/40">
            <Button onClick={runScan} disabled={query.isFetching || pinLookupLoading || !locationResolved} size="sm" className="rounded-full">
              <Search className="size-4 mr-2" /> Find Leads
            </Button>
            {!query.isLoading && scanKey > 0 && (
              <span className="text-xs text-muted-foreground ml-auto text-right">
                <strong className="text-foreground">{leads.length}</strong> unique leads
                {stats != null && (
                  <>
                    {' '}· {stats.totalFound ?? 0} found
                    {(stats.totalRejected ?? 0) > 0 && ` · ${stats.totalRejected} filtered`}
                    {(stats.totalDuplicates ?? 0) > 0 && ` · ${stats.totalDuplicates} duplicates`}
                  </>
                )}
                {(stats?.warnings?.length ?? 0) > 0 && (
                  <span className="block text-amber-500/90 mt-1">{stats.warnings?.[0]}</span>
                )}
                {query.isError && (
                  <span className="block text-red-400 mt-1">{scanErrorMessage}</span>
                )}
                {' '}· {filters.city}, {filters.state}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {scanKey === 0 ? (
        <Card className="bg-card/70 border-border/50">
          <CardContent className="py-16 text-center text-sm text-muted-foreground">
            <MapPin className="size-10 mx-auto mb-3 opacity-30" />
            Set your <strong>6-digit PIN code</strong> first — city, district and state fill automatically. Then choose sector and click <strong>Find Leads</strong>.
          </CardContent>
        </Card>
      ) : query.isLoading ? (
        <LoadingState label="Scanning & validating businesses…" rows={5} />
      ) : (
        <Card className="bg-card/70 border-border/50 overflow-hidden">
          <CardContent className="p-0">
            <div className="px-4 py-3 border-b border-border/50 bg-muted/20 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Building2 className="size-4 text-primary" />
                <p className="text-sm font-semibold">Validated Results</p>
                <Badge variant="outline" className="text-[10px]">{filters.source}</Badge>
                {filters.qualityOnly && (
                  <Badge variant="outline" className="text-[10px] text-emerald-500 border-emerald-500/30">
                    <ShieldCheck className="size-3 mr-0.5 inline" /> Quality filter
                  </Badge>
                )}
              </div>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent bg-muted/30">
                    <TableHead className="text-[10px] uppercase tracking-wide h-10 min-w-[140px]">Business</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wide h-10">Industry</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wide h-10 min-w-[120px]">Location</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wide h-10">Phone</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wide h-10 hidden md:table-cell">Website</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wide h-10 text-center">Source</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wide h-10 text-center">Rating</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wide h-10 text-center">Lead Score</TableHead>
                    <TableHead className="text-[10px] uppercase tracking-wide h-10 text-right min-w-[100px]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead) => (
                    <TableRow key={lead.id} className="hover:bg-muted/15">
                      <TableCell className="font-medium text-sm py-3">
                        <span className="line-clamp-2">{lead.businessName}</span>
                        {lead.quality && (() => {
                          const q = qualityBadge(lead.quality);
                          return q ? (
                            <Badge variant="outline" className={cn('text-[9px] mt-1', q.className)}>{q.label}</Badge>
                          ) : null;
                        })()}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground py-3">{lead.category}</TableCell>
                      <TableCell className="text-xs py-3">
                        <span className="inline-flex items-start gap-1 text-muted-foreground">
                          <MapPin className="size-3 shrink-0 mt-0.5 opacity-60" />
                          <span className="line-clamp-2">{lead.city}{lead.address ? ` · ${lead.address}` : ''}</span>
                        </span>
                      </TableCell>
                      <TableCell className="text-xs py-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1"><Phone className="size-3 opacity-60" />{lead.phone || '—'}</span>
                      </TableCell>
                      <TableCell className="text-xs py-3 hidden md:table-cell max-w-[140px]">
                        {lead.website ? (
                          <span className="inline-flex items-center gap-1 text-primary truncate"><Globe className="size-3 shrink-0" />{lead.website}</span>
                        ) : '—'}
                      </TableCell>
                      <TableCell className="py-3 text-center">
                        <Badge variant="secondary" className="text-[9px]">
                          {SOURCE_LABELS[lead.source || ''] || lead.source || '—'}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3 text-center">
                        {lead.rating != null ? (
                          <Badge variant="outline" className="text-xs tabular-nums">
                            <Star className="size-3 mr-0.5 inline text-amber-400 fill-amber-400" />
                            {lead.rating.toFixed(1)}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="py-3 text-center">
                        {(() => {
                          const badge = scoreBadge(lead.score);
                          return (
                            <Badge variant="outline" className={cn('text-[10px] font-bold tabular-nums gap-1', badge.className)}>
                              {lead.score} · {lead.label || badge.label}
                            </Badge>
                          );
                        })()}
                      </TableCell>
                      <TableCell className="py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-[10px] px-2 rounded-full"
                            onClick={() => convertToLead(lead.id, lead.businessName)}
                          >
                            <UserCheck className="size-3 mr-0.5" /> Add to CRM
                          </Button>
                          {lead.website && (
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" asChild>
                              <a href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`} target="_blank" rel="noopener noreferrer" aria-label="Open website">
                                <ExternalLink className="size-3.5" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {leads.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} className="py-16 text-center text-sm text-muted-foreground">
                        <MapPin className="size-10 mx-auto mb-3 opacity-30" />
                        No leads matched your filters.
                        {stats && (stats.totalFound ?? 0) > 0
                          ? ` ${stats.totalFound} businesses found — ${stats.totalRejected ?? 0} filtered. Turn off "Quality leads only" or widen radius.`
                          : ' Check GOOGLE_PLACES_API_KEY and GOOGLE_MAPS_API_KEY on the server.'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
