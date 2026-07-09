'use client';

import * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { BarChart3, Users, DollarSign, Activity } from 'lucide-react';
import { ThemeProvider } from './themes';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  KPICard,
  MetricCard,
  StatCard,
  Badge,
  Input,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Checkbox,
  RadioGroup,
  RadioGroupItem,
  Toggle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  DataGrid,
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalTrigger,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownTrigger,
  EmptyState,
  LoadingState,
  PageHeader,
  SectionHeader,
} from './core';

type SampleRow = { id: string; name: string; status: string; value: string };

const sampleColumns: ColumnDef<SampleRow, unknown>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'value', header: 'Value' },
];

const sampleData: SampleRow[] = [
  { id: '1', name: 'Enterprise Plan', status: 'Active', value: '₹2.4L' },
  { id: '2', name: 'Growth Plan', status: 'Pending', value: '₹85K' },
  { id: '3', name: 'Starter Plan', status: 'Active', value: '₹25K' },
];

function ComponentShowcase() {
  return (
    <div className="space-y-10">
      <SectionHeader title="Actions & Inputs" description="Buttons, forms, and controls" />
      <div className="flex flex-wrap gap-3">
        <Button variant="primary">Primary</Button>
        <Button variant="accent">Accent CTA</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Input placeholder="Email address" aria-label="Email" />
        <Select defaultValue="royal">
          <SelectTrigger aria-label="Plan">
            <SelectValue placeholder="Select plan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="royal">Royal Blue</SelectItem>
            <SelectItem value="electric">Electric Blue</SelectItem>
          </SelectContent>
        </Select>
        <Textarea placeholder="Message" className="md:col-span-2" aria-label="Message" />
        <div className="flex items-center gap-4">
          <Checkbox id="ds-check" aria-label="Accept terms" />
          <label htmlFor="ds-check" className="text-sm">Accept terms</label>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm">Notifications</span>
          <Toggle aria-label="Toggle notifications" />
        </div>
        <RadioGroup defaultValue="a" className="flex gap-4">
          <div className="flex items-center gap-2">
            <RadioGroupItem value="a" id="r-a" />
            <label htmlFor="r-a" className="text-sm">Option A</label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="b" id="r-b" />
            <label htmlFor="r-b" className="text-sm">Option B</label>
          </div>
        </RadioGroup>
      </div>

      <SectionHeader title="Data Display" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard label="Total Revenue" value="₹12.4L" change="+18.2%" trend="up" icon={<DollarSign className="size-5" />} />
        <MetricCard label="Active Leads" value="1,284" change="+12%" trend="up" subtitle="Last 30 days" icon={<Users className="size-5" />} />
        <StatCard label="Conversion" value="24.8%" stat="+3.1%" description="vs prior period" icon={<BarChart3 className="size-5" />} />
        <KPICard label="Pipeline" value="₹8.2L" change="-2.4%" trend="down" icon={<Activity className="size-5" />} />
      </div>
      <div className="flex flex-wrap gap-2">
        <Badge>Default</Badge>
        <Badge variant="accent">Accent</Badge>
        <Badge variant="success">Success</Badge>
        <Badge variant="warning">Warning</Badge>
        <Badge variant="outline">Outline</Badge>
      </div>

      <Tabs defaultValue="grid">
        <TabsList>
          <TabsTrigger value="grid">Data Grid</TabsTrigger>
          <TabsTrigger value="states">States</TabsTrigger>
        </TabsList>
        <TabsContent value="grid">
          <DataGrid columns={sampleColumns} data={sampleData} />
        </TabsContent>
        <TabsContent value="states" className="grid gap-4 md:grid-cols-2">
          <EmptyState title="No records" description="Sample empty state for lists." />
          <LoadingState label="Loading sample data" />
        </TabsContent>
      </Tabs>

      <SectionHeader title="Overlays" />
      <div className="flex flex-wrap gap-3">
        <Modal>
          <ModalTrigger asChild>
            <Button variant="outline">Open Modal</Button>
          </ModalTrigger>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Confirm action</ModalTitle>
              <ModalDescription>Enterprise modal pattern for confirmations and forms.</ModalDescription>
            </ModalHeader>
          </ModalContent>
        </Modal>
        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="outline">Open Drawer</Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Detail panel</DrawerTitle>
            </DrawerHeader>
            <p className="px-6 pb-6 text-sm text-muted-foreground">Mobile bottom sheet · desktop side panel.</p>
          </DrawerContent>
        </Drawer>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost">Tooltip</Button>
            </TooltipTrigger>
            <TooltipContent>Contextual help</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <Dropdown>
          <DropdownTrigger asChild>
            <Button variant="secondary">Dropdown</Button>
          </DropdownTrigger>
          <DropdownContent>
            <DropdownItem>Export CSV</DropdownItem>
            <DropdownItem>Export PDF</DropdownItem>
          </DropdownContent>
        </Dropdown>
      </div>

      <Card elevationLevel={2}>
        <CardHeader>
          <CardTitle>Card elevation level 2</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Premium card surface with token-based shadow and border.
        </CardContent>
      </Card>
    </div>
  );
}

export interface DesignSystemPreviewProps {
  view: 'marketing' | 'suite' | 'gallery' | 'mobile';
}

export function DesignSystemPreview({ view }: DesignSystemPreviewProps) {
  if (view === 'marketing') {
    return (
      <ThemeProvider theme="marketing" className="min-h-screen p-6 md:p-10">
        <PageHeader
          title="Marketing Theme"
          description="Premium, AI-driven, growth-oriented — www.asoftechinsightz.com"
          actions={<Button variant="accent">Book Demo</Button>}
        />
        <div className="grid gap-6 md:grid-cols-3">
          <KPICard label="Businesses Transformed" value="500+" change="+24% YoY" trend="up" />
          <KPICard label="Lead Conversion Lift" value="38%" change="+12 pts" trend="up" />
          <KPICard label="Revenue Impact" value="₹50Cr+" change="AI-powered" trend="neutral" />
        </div>
        <div className="mt-8">
          <ComponentShowcase />
        </div>
      </ThemeProvider>
    );
  }

  if (view === 'suite') {
    return (
      <ThemeProvider theme="suite" className="min-h-screen p-6 md:p-10">
        <PageHeader
          title="Business Suite Theme"
          description="Enterprise dark · executive dashboards — app.asoftechinsightz.com"
          actions={
            <>
              <Button variant="outline" size="sm">Export</Button>
              <Button variant="accent" size="sm">Quick Action</Button>
            </>
          }
        />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KPICard label="MRR" value="₹4.2L" change="+8.1%" trend="up" icon={<DollarSign className="size-5" />} />
          <KPICard label="Open Leads" value="342" change="+15" trend="up" icon={<Users className="size-5" />} />
          <KPICard label="Win Rate" value="31%" change="-1.2%" trend="down" icon={<BarChart3 className="size-5" />} />
          <KPICard label="Activities" value="128" change="Today" trend="neutral" icon={<Activity className="size-5" />} />
        </div>
        <div className="mt-8">
          <DataGrid columns={sampleColumns} data={sampleData} />
        </div>
      </ThemeProvider>
    );
  }

  if (view === 'mobile') {
    return (
      <ThemeProvider theme="suite" className="min-h-screen max-w-[390px] mx-auto border-x border-border">
        <div className="p-4">
          <PageHeader title="Mobile Preview" description="390px viewport · touch targets ≥44px" />
          <div className="space-y-3">
            <KPICard label="Revenue" value="₹4.2L" change="+8%" trend="up" />
            <Button className="w-full" variant="accent">Primary Action</Button>
            <DataGrid columns={sampleColumns.slice(0, 2)} data={sampleData.slice(0, 2)} />
          </div>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme="suite" className="min-h-screen p-6 md:p-10">
      <PageHeader
        title="Component Gallery"
        description="AsoftechInsightz Enterprise Design System — Phase 2"
      />
      <ComponentShowcase />
    </ThemeProvider>
  );
}
