# Component Library — Enterprise Design System

**Phase:** 2 · **Import:** `@/components/design-system`

---

## Button

```tsx
import { Button } from '@/components/design-system';

<Button variant="primary">Save</Button>
<Button variant="accent">Book Demo</Button>
<Button variant="outline" size="sm">Cancel</Button>
```

| Prop | Values | Default |
|------|--------|---------|
| `variant` | primary, accent, secondary, outline, ghost, destructive, link | primary |
| `size` | sm, md, lg, icon | md |
| `asChild` | boolean | false |

---

## Card

```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/design-system';

<Card elevationLevel={2}>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

| Prop | Values | Default |
|------|--------|---------|
| `elevationLevel` | 0–4 | 1 |

---

## KPICard / MetricCard / StatCard

```tsx
import { KPICard, MetricCard, StatCard } from '@/components/design-system';
import { Users } from 'lucide-react';

<KPICard
  label="Active Leads"
  value="1,284"
  change="+12%"
  trend="up"
  icon={<Users className="size-5" />}
/>

<MetricCard label="MRR" value="₹4.2L" change="+8%" trend="up" subtitle="Last 30 days" />

<StatCard label="Win Rate" value="31%" stat="+3.1%" description="vs prior period" />
```

| Prop | Type | Description |
|------|------|-------------|
| `label` | string | Metric name |
| `value` | string \| number | Primary value |
| `change` | string | Delta text |
| `trend` | up \| down \| neutral | Trend color |
| `icon` | ReactNode | Optional icon |
| `isLoading` | boolean | Skeleton state |

---

## Badge

```tsx
<Badge variant="success">Active</Badge>
<Badge variant="accent">Hot</Badge>
<Badge variant="outline">Draft</Badge>
```

Variants: `default`, `accent`, `secondary`, `outline`, `success`, `warning`, `destructive`

---

## Input / Textarea

```tsx
<Input placeholder="Email" aria-label="Email" />
<Input error aria-label="Email with error" />
<Textarea rows={4} placeholder="Message" />
```

---

## Select

```tsx
<Select defaultValue="a">
  <SelectTrigger><SelectValue placeholder="Choose" /></SelectTrigger>
  <SelectContent>
    <SelectItem value="a">Option A</SelectItem>
  </SelectContent>
</Select>
```

---

## Checkbox / Radio / Toggle

```tsx
<Checkbox id="c1" aria-label="Accept" />
<RadioGroup defaultValue="a">
  <RadioGroupItem value="a" id="a" />
</RadioGroup>
<Toggle aria-label="Enable" />
```

---

## Tabs

```tsx
<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Overview</TabsTrigger>
    <TabsTrigger value="tab2">Details</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">…</TabsContent>
</Tabs>
```

---

## Table

```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Acme Corp</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

---

## DataGrid

Sortable table powered by TanStack Table.

```tsx
import type { ColumnDef } from '@tanstack/react-table';

const columns: ColumnDef<Row>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'status', header: 'Status' },
];

<DataGrid columns={columns} data={rows} isLoading={false} emptyTitle="No rows" />
```

---

## Modal

```tsx
<Modal>
  <ModalTrigger asChild><Button>Open</Button></ModalTrigger>
  <ModalContent>
    <ModalHeader>
      <ModalTitle>Title</ModalTitle>
      <ModalDescription>Description</ModalDescription>
    </ModalHeader>
  </ModalContent>
</Modal>
```

---

## Drawer

Mobile: bottom sheet · Desktop: right panel (400px).

```tsx
<Drawer>
  <DrawerTrigger asChild><Button variant="outline">Details</Button></DrawerTrigger>
  <DrawerContent>
    <DrawerHeader><DrawerTitle>Panel</DrawerTitle></DrawerHeader>
  </DrawerContent>
</Drawer>
```

---

## Tooltip

```tsx
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild><Button variant="ghost">?</Button></TooltipTrigger>
    <TooltipContent>Help text</TooltipContent>
  </Tooltip>
</TooltipProvider>
```

---

## Dropdown

```tsx
<Dropdown>
  <DropdownTrigger asChild><Button variant="secondary">Actions</Button></DropdownTrigger>
  <DropdownContent>
    <DropdownItem>Export</DropdownItem>
  </DropdownContent>
</Dropdown>
```

---

## EmptyState / LoadingState

```tsx
<EmptyState
  title="No leads"
  description="Create your first lead to get started."
  actionLabel="Add lead"
  onAction={() => {}}
/>

<LoadingState label="Loading leads…" rows={4} />
<LoadingSpinner />
```

---

## PageHeader / SectionHeader

```tsx
<PageHeader
  title="Leads"
  description="Manage your pipeline"
  actions={<Button variant="accent">Add</Button>}
/>

<SectionHeader title="Recent activity" action={<Button size="sm" variant="ghost">View all</Button>} />
```

---

## ThemeProvider

```tsx
import { ThemeProvider } from '@/components/design-system';

<ThemeProvider theme="marketing">{/* light-leaning */}</ThemeProvider>
<ThemeProvider theme="suite">{/* enterprise dark */}</ThemeProvider>
```

---

## File Index

| Component | File |
|-----------|------|
| Button | `core/Button.tsx` |
| Card | `core/Card.tsx` |
| KPICard | `core/KPICard.tsx` |
| Badge | `core/Badge.tsx` |
| Input | `core/Input.tsx` |
| Select | `core/Select.tsx` |
| Checkbox | `core/Checkbox.tsx` |
| Radio | `core/Radio.tsx` |
| Toggle | `core/Toggle.tsx` |
| Tabs | `core/Tabs.tsx` |
| Table | `core/Table.tsx` |
| DataGrid | `core/DataGrid.tsx` |
| Modal | `core/Modal.tsx` |
| Drawer | `core/Drawer.tsx` |
| Tooltip | `core/Tooltip.tsx` |
| Dropdown | `core/Dropdown.tsx` |
| EmptyState | `core/EmptyState.tsx` |
| LoadingState | `core/LoadingState.tsx` |
| PageHeader | `core/PageHeader.tsx` |
