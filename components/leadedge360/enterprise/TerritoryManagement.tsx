'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPatch } from '@/src/lib/api';
import { PageHeader } from '@/components/design-system/core/PageHeader';
import { Card, CardContent } from '@/components/design-system/core/Card';
import { Badge } from '@/components/design-system/core/Badge';
import { Button } from '@/components/design-system/core/Button';
import { Input } from '@/components/design-system/core/Input';
import { Label } from '@/components/ui/label';
import { LoadingState } from '@/components/design-system/core/LoadingState';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/design-system/core/Table';
import { Map, Users, TrendingUp, Plus } from 'lucide-react';
import { KPICard } from '@/components/design-system/core/KPICard';
import { toast } from 'sonner';

export function TerritoryManagement() {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ name: '', region: '', manager: '' });

  const query = useQuery({
    queryKey: ['territories', 'stats'],
    queryFn: () => apiGet('/territories?stats=1'),
  });

  const territories = query.data?.items || [];
  const totalLeads = territories.reduce((s, t) => s + (t.leadCount || 0), 0);
  const totalRevenue = territories.reduce((s, t) => s + (t.wonRevenue || 0), 0);

  const createTerritory = useMutation({
    mutationFn: () => apiPost('/territories', form),
    onSuccess: () => {
      toast.success('Territory created');
      setCreateOpen(false);
      setForm({ name: '', region: '', manager: '' });
      queryClient.invalidateQueries({ queryKey: ['territories'] });
    },
    onError: (err) => toast.error(err.message || 'Failed to create territory'),
  });

  const updateTerritory = useMutation({
    mutationFn: ({ id, body }) => apiPatch(`/territories/${id}`, body),
    onSuccess: () => {
      toast.success('Territory updated');
      queryClient.invalidateQueries({ queryKey: ['territories'] });
    },
    onError: (err) => toast.error(err.message || 'Failed to update territory'),
  });

  if (query.isLoading) {
    return (
      <div className="container py-10">
        <PageHeader title="Territory Management" description="Assign, track, and optimize regional performance." />
        <LoadingState label="Loading territories…" rows={6} />
      </div>
    );
  }

  return (
    <div className="container py-10 space-y-6">
      <PageHeader
        title="Territory Management"
        description="Regional lead distribution, agent coverage, and conversion analytics."
        actions={
          <Button className="rounded-full" onClick={() => setCreateOpen((v) => !v)}>
            <Plus className="size-4 mr-1" /> New territory
          </Button>
        }
      />

      {createOpen && (
        <Card className="bg-card/60 border-border/60">
          <CardContent className="p-4 grid sm:grid-cols-3 gap-3">
            <div>
              <Label>Name *</Label>
              <Input className="mt-1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <Label>Region</Label>
              <Input className="mt-1" value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} />
            </div>
            <div>
              <Label>Manager</Label>
              <Input className="mt-1" value={form.manager} onChange={(e) => setForm({ ...form, manager: e.target.value })} />
            </div>
            <div className="sm:col-span-3">
              <Button disabled={!form.name.trim() || createTerritory.isPending} onClick={() => createTerritory.mutate()}>
                Create territory
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid sm:grid-cols-3 gap-4">
        <KPICard label="Territories" value={territories.length} icon={<Map className="size-5" />} />
        <KPICard label="Total leads" value={totalLeads} icon={<Users className="size-5" />} />
        <KPICard label="Won revenue" value={`₹${(totalRevenue / 100000).toFixed(1)}L`} icon={<TrendingUp className="size-5" />} />
      </div>

      <Card className="bg-card/60 border-border/60 overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Territory</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead>Leads</TableHead>
                <TableHead>Agents</TableHead>
                <TableHead>Conversion</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {territories.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.name}</TableCell>
                  <TableCell>
                    <Input
                      className="h-8"
                      defaultValue={t.region || ''}
                      onBlur={(e) => {
                        if (e.target.value !== (t.region || '')) {
                          updateTerritory.mutate({ id: t.id, body: { region: e.target.value } });
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      className="h-8"
                      defaultValue={t.manager || ''}
                      onBlur={(e) => {
                        if (e.target.value !== (t.manager || '')) {
                          updateTerritory.mutate({ id: t.id, body: { manager: e.target.value } });
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>{t.leadCount}</TableCell>
                  <TableCell>{t.agents}</TableCell>
                  <TableCell>{t.conversion}%</TableCell>
                  <TableCell>₹{((t.wonRevenue || 0) / 100000).toFixed(1)}L</TableCell>
                  <TableCell>
                    <Badge variant={t.status === 'active' ? 'default' : 'outline'} className="capitalize">
                      {t.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
