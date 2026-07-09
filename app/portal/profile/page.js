'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PortalShell } from '@/components/portal/PortalShell'
import { portalFetch } from '@/lib/portal/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LoadingState } from '@/components/design-system/core/LoadingState'
import { toast } from 'sonner'

export default function PortalProfilePage() {
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: ['portal', 'profile'],
    queryFn: () => portalFetch('/profile'),
  })

  const profile = query.data?.profile
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')

  const saveMutation = useMutation({
    mutationFn: (body) => portalFetch('/profile', { method: 'PATCH', body }),
    onSuccess: () => {
      toast.success('Profile updated')
      queryClient.invalidateQueries({ queryKey: ['portal', 'profile'] })
    },
    onError: (err) => toast.error(err.message || 'Update failed'),
  })

  const displayName = name || profile?.name || ''
  const displayPhone = phone || profile?.phone || ''

  return (
    <PortalShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Profile</h1>
          <p className="text-sm text-muted-foreground">Update your contact details</p>
        </div>
        {query.isLoading ? (
          <LoadingState label="Loading profile…" rows={3} />
        ) : (
          <Card>
            <CardContent className="space-y-4 p-6">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={profile?.email || ''} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={displayName}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={profile?.name || ''}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={displayPhone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={profile?.phone || ''}
                />
              </div>
              <Button
                disabled={saveMutation.isPending}
                onClick={() => saveMutation.mutate({
                  name: name || profile?.name,
                  phone: phone || profile?.phone,
                })}
              >
                Save changes
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </PortalShell>
  )
}
