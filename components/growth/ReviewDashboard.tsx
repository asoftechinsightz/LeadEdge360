'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Plus, Send, Star, Trash2 } from 'lucide-react';
import { api, apiGet } from '@/src/lib/api';
import { PageHeader } from '@/components/design-system/core/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Campaign = {
  id: string;
  name: string;
  channel: string;
  reviewUrl: string;
  status: string;
  stats?: {
    sent?: number;
    opened?: number;
    completed?: number;
    avgRating?: number;
  };
};

type ReviewRequest = {
  id: string;
  customerName?: string;
  customerEmail?: string;
  status: string;
  rating?: number | null;
  reviewLink?: string;
  createdAt: string;
};

export function ReviewDashboard() {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [reviewUrl, setReviewUrl] = useState('https://g.page/r/');
  const [channel, setChannel] = useState('link');
  const [message, setMessage] = useState('We would love your feedback! Please rate your experience.');
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [feedback, setFeedback] = useState('');

  const summaryQuery = useQuery({
    queryKey: ['reviews', 'summary'],
    queryFn: () => apiGet('/growth/reviews/summary'),
  });

  const campaignsQuery = useQuery({
    queryKey: ['reviews', 'campaigns'],
    queryFn: () => apiGet('/growth/reviews/campaigns'),
  });

  const campaigns: Campaign[] = campaignsQuery.data?.items || [];
  const summary = summaryQuery.data?.data;
  const recentRequests: ReviewRequest[] = summary?.recentRequests || [];

  const createMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/growth/reviews/campaigns', {
        name,
        reviewUrl,
        channel,
        message,
        status: 'active',
      });
      return data.data;
    },
    onSuccess: (data) => {
      setFeedback(`Campaign "${data.name}" created`);
      setName('');
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
    onError: (err: Error) => setFeedback(err.message || 'Create failed'),
  });

  const sendMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post(`/growth/reviews/campaigns/${selectedCampaign}/send`, {
        customerName,
        customerEmail,
      });
      return data.data;
    },
    onSuccess: (data) => {
      setFeedback(`Review link sent: ${data.reviewLink}`);
      setCustomerName('');
      setCustomerEmail('');
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
    onError: (err: Error) => setFeedback(err.message || 'Send failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/growth/reviews/campaigns/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reviews'] }),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reviews"
        description="Send review requests, collect ratings, and track campaign performance."
      />

      {feedback ? <p className="text-sm text-muted-foreground">{feedback}</p> : null}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Campaigns', value: summary?.totals?.totalCampaigns ?? 0 },
          { label: 'Requests sent', value: summary?.totals?.sent ?? 0 },
          { label: 'Completed', value: summary?.totals?.completed ?? 0 },
          { label: 'Avg rating', value: summary?.totals?.avgRating ?? 0, icon: Star },
        ].map((stat) => (
          <Card key={stat.label} className="bg-card/60">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-semibold flex items-center gap-1">
                {stat.icon ? <stat.icon className="size-5 text-amber-500 fill-amber-500" /> : null}
                {stat.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-card/60">
          <CardContent className="space-y-4 p-6">
            <h2 className="font-semibold flex items-center gap-2">
              <Plus className="size-4" />
              Create campaign
            </h2>
            <div className="space-y-2">
              <Label>Campaign name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Google reviews Q2" />
            </div>
            <div className="space-y-2">
              <Label>Review URL</Label>
              <Input value={reviewUrl} onChange={(e) => setReviewUrl(e.target.value)} placeholder="https://g.page/r/..." />
            </div>
            <div className="space-y-2">
              <Label>Channel</Label>
              <Select value={channel} onValueChange={setChannel}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="link">Shareable link</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <Input value={message} onChange={(e) => setMessage(e.target.value)} />
            </div>
            <Button type="button" onClick={() => createMutation.mutate()} disabled={createMutation.isPending || !name}>
              {createMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
              Create campaign
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-card/60">
          <CardContent className="space-y-4 p-6">
            <h2 className="font-semibold flex items-center gap-2">
              <Send className="size-4" />
              Send review request
            </h2>
            <div className="space-y-2">
              <Label>Campaign</Label>
              <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
                <SelectTrigger><SelectValue placeholder="Select campaign" /></SelectTrigger>
                <SelectContent>
                  {campaigns.filter((c) => c.status === 'active').map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Customer name</Label>
              <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Rajesh Kumar" />
            </div>
            <div className="space-y-2">
              <Label>Customer email</Label>
              <Input value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="customer@example.com" />
            </div>
            <Button
              type="button"
              onClick={() => sendMutation.mutate()}
              disabled={sendMutation.isPending || !selectedCampaign}
            >
              {sendMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              Generate review link
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/60">
        <CardContent className="p-6 space-y-4">
          <h2 className="font-semibold">Campaigns</h2>
          {campaigns.length === 0 ? (
            <p className="text-sm text-muted-foreground">No campaigns yet.</p>
          ) : (
            <div className="space-y-3">
              {campaigns.map((c) => (
                <div key={c.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/60 p-3">
                  <div>
                    <p className="font-medium text-sm">{c.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{c.channel} · {c.status}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.stats?.sent ?? 0} sent · {c.stats?.completed ?? 0} completed · avg {c.stats?.avgRating ?? 0}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{c.stats?.avgRating ? `${c.stats.avgRating}★` : '—'}</Badge>
                    <Button type="button" variant="outline" size="sm" onClick={() => deleteMutation.mutate(c.id)}>
                      <Trash2 className="size-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-card/60">
        <CardContent className="p-6 space-y-3">
          <h2 className="font-semibold">Recent requests</h2>
          {recentRequests.length === 0 ? (
            <p className="text-sm text-muted-foreground">No requests yet.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {recentRequests.map((r) => (
                <li key={r.id} className="flex flex-wrap justify-between gap-2 border-b border-border/40 pb-2">
                  <span>{r.customerName || r.customerEmail || 'Customer'}</span>
                  <span className="text-muted-foreground capitalize">
                    {r.status}{r.rating ? ` · ${r.rating}★` : ''}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
