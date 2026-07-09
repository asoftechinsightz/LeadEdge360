'use client'

import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, apiGet } from '@/src/lib/api'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Save, Upload } from 'lucide-react'

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

const DEFAULT_TERMS = `Proposal validity: 30 days from issue date.
Payment milestones as per commercial agreement.
Delivery schedule subject to scope confirmation.
Standard warranty and support terms apply.
Cancellation policy per signed agreement.
All information is confidential.`

export function BrandingSettingsForm() {
  const queryClient = useQueryClient()
  const [form, setForm] = useState(null)

  const brandingQuery = useQuery({
    queryKey: ['settings', 'branding'],
    queryFn: () => apiGet('/settings/branding'),
  })

  useEffect(() => {
    if (brandingQuery.data?.branding) {
      const b = brandingQuery.data.branding
      setForm({
        ...b,
        termsAndConditions: (b.termsAndConditions || []).join('\n'),
      })
    }
  }, [brandingQuery.data])

  const saveMutation = useMutation({
    mutationFn: (payload) => api.put('/settings/branding', payload),
    onSuccess: () => {
      toast.success('Branding saved')
      queryClient.invalidateQueries({ queryKey: ['settings', 'branding'] })
    },
    onError: (err) => toast.error(err.message || 'Save failed'),
  })

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const onImageUpload = async (key, file) => {
    if (!file) return
    if (file.size > 800_000) {
      toast.error('Image must be under 800 KB')
      return
    }
    const dataUrl = await readFileAsDataUrl(file)
    set(key, dataUrl)
  }

  const onSave = () => {
    if (!form) return
    const payload = {
      ...form,
      termsAndConditions: String(form.termsAndConditions || '')
        .split('\n')
        .map((t) => t.trim())
        .filter(Boolean),
    }
    saveMutation.mutate(payload)
  }

  if (brandingQuery.isLoading || !form) {
    return <p className="text-sm text-muted-foreground">Loading branding…</p>
  }

  const configured = brandingQuery.data?.configured

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-semibold">Document branding</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Company identity used on proposal and invoice PDFs for your organization.
          </p>
        </div>
        <Badge variant={configured ? 'default' : 'outline'}>
          {configured ? 'Configured' : 'Incomplete'}
        </Badge>
      </div>

      <Card className="bg-card/60">
        <CardContent className="p-6 grid sm:grid-cols-2 gap-4">
          <h3 className="sm:col-span-2 font-medium text-sm">Company identity</h3>
          <div>
            <Label>Company name</Label>
            <Input value={form.companyName || ''} onChange={(e) => set('companyName', e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label>Legal name</Label>
            <Input value={form.legalName || ''} onChange={(e) => set('legalName', e.target.value)} className="mt-1.5" />
          </div>
          <div className="sm:col-span-2">
            <Label>Tagline</Label>
            <Input value={form.tagline || ''} onChange={(e) => set('tagline', e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label>Logo</Label>
            <div className="mt-1.5 flex items-center gap-3">
              {form.logoDataUrl && (
                <img src={form.logoDataUrl} alt="Logo" className="h-10 max-w-[120px] object-contain border rounded p-1" />
              )}
              <label className="inline-flex items-center gap-2 cursor-pointer rounded-md border border-input px-3 py-2 text-sm hover:bg-muted">
                <Upload className="h-4 w-4" />
                Upload
                <input type="file" accept="image/png,image/jpeg" className="hidden" onChange={(e) => onImageUpload('logoDataUrl', e.target.files?.[0])} />
              </label>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Primary color</Label>
              <Input type="color" value={form.primaryColor || '#0A1F44'} onChange={(e) => set('primaryColor', e.target.value)} className="mt-1.5 h-10" />
            </div>
            <div>
              <Label>Accent color</Label>
              <Input type="color" value={form.secondaryColor || '#0066FF'} onChange={(e) => set('secondaryColor', e.target.value)} className="mt-1.5 h-10" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/60">
        <CardContent className="p-6 grid sm:grid-cols-2 gap-4">
          <h3 className="sm:col-span-2 font-medium text-sm">Address & contact</h3>
          <div className="sm:col-span-2">
            <Label>Address line 1</Label>
            <Input value={form.addressLine1 || ''} onChange={(e) => set('addressLine1', e.target.value)} className="mt-1.5" />
          </div>
          <div className="sm:col-span-2">
            <Label>Address line 2</Label>
            <Input value={form.addressLine2 || ''} onChange={(e) => set('addressLine2', e.target.value)} className="mt-1.5" />
          </div>
          <div><Label>City</Label><Input value={form.city || ''} onChange={(e) => set('city', e.target.value)} className="mt-1.5" /></div>
          <div><Label>State</Label><Input value={form.state || ''} onChange={(e) => set('state', e.target.value)} className="mt-1.5" /></div>
          <div><Label>PIN</Label><Input value={form.pin || ''} onChange={(e) => set('pin', e.target.value)} className="mt-1.5" /></div>
          <div><Label>Country</Label><Input value={form.country || 'India'} onChange={(e) => set('country', e.target.value)} className="mt-1.5" /></div>
          <div><Label>Phone</Label><Input value={form.phone || ''} onChange={(e) => set('phone', e.target.value)} className="mt-1.5" /></div>
          <div><Label>Support email</Label><Input type="email" value={form.supportEmail || ''} onChange={(e) => set('supportEmail', e.target.value)} className="mt-1.5" /></div>
          <div className="sm:col-span-2"><Label>Website</Label><Input value={form.website || ''} onChange={(e) => set('website', e.target.value)} className="mt-1.5" /></div>
        </CardContent>
      </Card>

      <Card className="bg-card/60">
        <CardContent className="p-6 grid sm:grid-cols-2 gap-4">
          <h3 className="sm:col-span-2 font-medium text-sm">Tax & compliance</h3>
          <div><Label>GSTIN</Label><Input value={form.gstin || ''} onChange={(e) => set('gstin', e.target.value)} className="mt-1.5" /></div>
          <div><Label>PAN</Label><Input value={form.pan || ''} onChange={(e) => set('pan', e.target.value)} className="mt-1.5" /></div>
          <div><Label>CIN</Label><Input value={form.cin || ''} onChange={(e) => set('cin', e.target.value)} className="mt-1.5" /></div>
          <div>
            <Label>GST type</Label>
            <select value={form.gstType || 'CGST_SGST'} onChange={(e) => set('gstType', e.target.value)} className="mt-1.5 w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
              <option value="CGST_SGST">CGST + SGST (intra-state)</option>
              <option value="IGST">IGST (inter-state)</option>
            </select>
          </div>
          <div className="sm:col-span-2"><Label>Place of supply</Label><Input value={form.placeOfSupply || ''} onChange={(e) => set('placeOfSupply', e.target.value)} className="mt-1.5" /></div>
        </CardContent>
      </Card>

      <Card className="bg-card/60">
        <CardContent className="p-6 grid sm:grid-cols-2 gap-4">
          <h3 className="sm:col-span-2 font-medium text-sm">Bank & payments</h3>
          <div><Label>Account name</Label><Input value={form.bankAccountName || ''} onChange={(e) => set('bankAccountName', e.target.value)} className="mt-1.5" /></div>
          <div><Label>Bank name</Label><Input value={form.bankName || ''} onChange={(e) => set('bankName', e.target.value)} className="mt-1.5" /></div>
          <div><Label>Account number</Label><Input value={form.bankAccountNumber || ''} onChange={(e) => set('bankAccountNumber', e.target.value)} className="mt-1.5" /></div>
          <div><Label>IFSC</Label><Input value={form.bankIfsc || ''} onChange={(e) => set('bankIfsc', e.target.value)} className="mt-1.5" /></div>
          <div><Label>Branch</Label><Input value={form.bankBranch || ''} onChange={(e) => set('bankBranch', e.target.value)} className="mt-1.5" /></div>
          <div><Label>UPI ID</Label><Input value={form.upiId || ''} onChange={(e) => set('upiId', e.target.value)} className="mt-1.5" /></div>
          <div className="sm:col-span-2"><Label>Payment link</Label><Input value={form.paymentLink || ''} onChange={(e) => set('paymentLink', e.target.value)} className="mt-1.5" placeholder="https://..." /></div>
        </CardContent>
      </Card>

      <Card className="bg-card/60">
        <CardContent className="p-6 grid sm:grid-cols-2 gap-4">
          <h3 className="sm:col-span-2 font-medium text-sm">Signatory & document settings</h3>
          <div><Label>Authorized signatory</Label><Input value={form.authorizedSignatory || ''} onChange={(e) => set('authorizedSignatory', e.target.value)} className="mt-1.5" /></div>
          <div><Label>Signatory title</Label><Input value={form.signatoryTitle || ''} onChange={(e) => set('signatoryTitle', e.target.value)} className="mt-1.5" /></div>
          <div>
            <Label>Digital signature</Label>
            <div className="mt-1.5 flex items-center gap-3">
              {form.signatureDataUrl && (
                <img src={form.signatureDataUrl} alt="Signature" className="h-10 max-w-[120px] object-contain border rounded p-1" />
              )}
              <label className="inline-flex items-center gap-2 cursor-pointer rounded-md border border-input px-3 py-2 text-sm hover:bg-muted">
                <Upload className="h-4 w-4" />
                Upload
                <input type="file" accept="image/png,image/jpeg" className="hidden" onChange={(e) => onImageUpload('signatureDataUrl', e.target.files?.[0])} />
              </label>
            </div>
          </div>
          <div>
            <Label>Company stamp</Label>
            <div className="mt-1.5 flex items-center gap-3">
              {form.stampDataUrl && (
                <img src={form.stampDataUrl} alt="Stamp" className="h-12 w-12 object-contain border rounded p-1" />
              )}
              <label className="inline-flex items-center gap-2 cursor-pointer rounded-md border border-input px-3 py-2 text-sm hover:bg-muted">
                <Upload className="h-4 w-4" />
                Upload
                <input type="file" accept="image/png,image/jpeg" className="hidden" onChange={(e) => onImageUpload('stampDataUrl', e.target.files?.[0])} />
              </label>
            </div>
          </div>
          <div><Label>Proposal prefix</Label><Input value={form.proposalPrefix || 'PROP'} onChange={(e) => set('proposalPrefix', e.target.value)} className="mt-1.5" /></div>
          <div><Label>Invoice prefix</Label><Input value={form.invoicePrefix || 'INV'} onChange={(e) => set('invoicePrefix', e.target.value)} className="mt-1.5" /></div>
          <div><Label>Currency</Label><Input value={form.currency || 'INR'} onChange={(e) => set('currency', e.target.value)} className="mt-1.5" /></div>
          <div><Label>Timezone</Label><Input value={form.timezone || 'Asia/Kolkata'} onChange={(e) => set('timezone', e.target.value)} className="mt-1.5" /></div>
          <div className="sm:col-span-2">
            <Label>Terms & conditions (one per line)</Label>
            <Textarea
              value={form.termsAndConditions || DEFAULT_TERMS}
              onChange={(e) => set('termsAndConditions', e.target.value)}
              rows={6}
              className="mt-1.5"
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Invoice notes</Label>
            <Textarea value={form.invoiceNotes || ''} onChange={(e) => set('invoiceNotes', e.target.value)} rows={2} className="mt-1.5" placeholder="Thank you for your business." />
          </div>
          <div className="sm:col-span-2">
            <Label>Late payment policy</Label>
            <Textarea value={form.latePaymentPolicy || ''} onChange={(e) => set('latePaymentPolicy', e.target.value)} rows={2} className="mt-1.5" />
          </div>
        </CardContent>
      </Card>

      <Button onClick={onSave} disabled={saveMutation.isPending}>
        <Save className="h-4 w-4 mr-2" />
        {saveMutation.isPending ? 'Saving…' : 'Save branding'}
      </Button>
    </div>
  )
}
