import React, { useState, useEffect, useMemo } from 'react';
import {
  MessageSquare,
  TrendingUp,
  ExternalLink,
  Download,
  Search,
  Filter,
  Plus,
  Trash2,
  Edit3,
  Clock,
  Smartphone,
  Monitor,
  Tablet,
  CheckCircle2,
  AlertCircle,
  Building2,
  Sparkles,
  RefreshCw,
  PhoneCall,
  ArrowUpRight,
  Send,
  X,
  ChevronRight,
  Layers,
  BarChart3,
  MapPin,
  FileSpreadsheet
} from 'lucide-react';
import { WhatsAppLeadConversion, PageInquiryMetric, LeadStatus } from '../types';
import {
  fetchAllLeadConversions,
  updateLeadStatus,
  deleteLead,
  trackWhatsAppClick,
  computePageMetrics,
  getSourceDisplayName
} from '../utils/leadTracking';

interface AdminLeadConversionTabProps {
  onNotify?: (message: string, type?: 'success' | 'info' | 'warning') => void;
}

export const AdminLeadConversionTab: React.FC<AdminLeadConversionTabProps> = ({ onNotify }) => {
  const [leads, setLeads] = useState<WhatsAppLeadConversion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPageFilter, setSelectedPageFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [selectedDeviceFilter, setSelectedDeviceFilter] = useState<string>('all');
  const [isSimulateModalOpen, setIsSimulateModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<WhatsAppLeadConversion | null>(null);

  // Simulation form state
  const [simPage, setSimPage] = useState('/#calculator');
  const [simSource, setSimSource] = useState('calculator_modal');
  const [simMessage, setSimMessage] = useState('Hello Pyda Movers, inquiring about an executive relocation quote from Lekki to Abuja.');
  const [simEstimatedValue, setSimEstimatedValue] = useState('1850000');

  // Load leads
  const loadLeads = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAllLeadConversions();
      setLeads(data);
    } catch (err) {
      console.warn('Error loading leads:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();

    // Listen to real-time events triggered when users click WhatsApp anywhere on site
    const handleNewLeadEvent = (e: any) => {
      if (e.detail) {
        setLeads((prev) => [e.detail, ...prev.filter((l) => l.id !== e.detail.id)]);
        onNotify?.('New WhatsApp conversion event tracked in real-time!', 'info');
      }
    };

    window.addEventListener('pyda_lead_conversion_tracked', handleNewLeadEvent);
    return () => {
      window.removeEventListener('pyda_lead_conversion_tracked', handleNewLeadEvent);
    };
  }, []);

  // Compute Page Performance Attribution Metrics
  const pageMetrics: PageInquiryMetric[] = useMemo(() => {
    return computePageMetrics(leads);
  }, [leads]);

  // Aggregate Key Stats
  const stats = useMemo(() => {
    const total = leads.length;
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const today = leads.filter((l) => new Date(l.timestamp).getTime() >= startOfToday).length;

    const booked = leads.filter((l) => l.status === 'booked').length;
    const contacted = leads.filter((l) => l.status === 'contacted' || l.status === 'quote_sent').length;
    const newLeads = leads.filter((l) => l.status === 'new_lead').length;

    const topPage = pageMetrics.length > 0 ? pageMetrics[0] : null;

    const totalPipelineValue = leads.reduce((sum, l) => sum + (l.estimatedValueNaira || 0), 0);

    return {
      total,
      today,
      booked,
      contacted,
      newLeads,
      topPage,
      totalPipelineValue,
    };
  }, [leads, pageMetrics]);

  // Filtered Leads Table
  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesPage = (l.pageTitle || '').toLowerCase().includes(q) || (l.pagePath || '').toLowerCase().includes(q);
        const matchesMsg = (l.inquiryMessage || '').toLowerCase().includes(q);
        const matchesPhone = (l.whatsappNumber || '').includes(q);
        const matchesNotes = (l.notes || '').toLowerCase().includes(q);
        const matchesSource = (l.sourceLabel || l.source || '').toLowerCase().includes(q);
        const matchesStaff = (l.assignedStaff || '').toLowerCase().includes(q);

        if (!matchesPage && !matchesMsg && !matchesPhone && !matchesNotes && !matchesSource && !matchesStaff) {
          return false;
        }
      }

      // Page Filter
      if (selectedPageFilter !== 'all' && l.pagePath !== selectedPageFilter) {
        return false;
      }

      // Status Filter
      if (selectedStatusFilter !== 'all' && l.status !== selectedStatusFilter) {
        return false;
      }

      // Device Filter
      if (selectedDeviceFilter !== 'all' && l.deviceType !== selectedDeviceFilter) {
        return false;
      }

      return true;
    });
  }, [leads, searchQuery, selectedPageFilter, selectedStatusFilter, selectedDeviceFilter]);

  // Handle status update
  const handleStatusChange = async (id: string, newStatus: LeadStatus) => {
    try {
      await updateLeadStatus(id, { status: newStatus });
      setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l)));
      onNotify?.(`Lead status updated to ${newStatus.replace('_', ' ')}`, 'success');
    } catch {
      onNotify?.('Failed to update lead status', 'warning');
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this lead conversion record?')) return;
    try {
      await deleteLead(id);
      setLeads((prev) => prev.filter((l) => l.id !== id));
      onNotify?.('Lead record deleted.', 'info');
    } catch {
      onNotify?.('Failed to delete lead.', 'warning');
    }
  };

  // Save Lead Notes Edit
  const handleSaveLeadEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLead) return;

    try {
      await updateLeadStatus(editingLead.id, {
        notes: editingLead.notes,
        assignedStaff: editingLead.assignedStaff,
        estimatedValueNaira: editingLead.estimatedValueNaira,
        status: editingLead.status,
      });
      setLeads((prev) => prev.map((l) => (l.id === editingLead.id ? editingLead : l)));
      setEditingLead(null);
      onNotify?.('Lead details updated successfully.', 'success');
    } catch {
      onNotify?.('Failed to update lead.', 'warning');
    }
  };

  // Handle Simulate Click
  const handleSimulateClick = async (e: React.FormEvent) => {
    e.preventDefault();
    const pageTitles: Record<string, string> = {
      '/': 'Home Page (Hero & Overview)',
      '/#calculator': 'Relocation Cost Calculator',
      '/#services/corporate': 'Corporate Office Relocation',
      '/#services/commercial': 'Commercial & Warehouse Logistics',
      '/#services/residential': 'Residential Moving & Crating',
      '/#services/haulage': 'Interstate Freight Haulage (3T-30T)',
      '/#services': 'Core Logistics Services',
      '/#coverage': 'Nationwide Network Coverage Map',
      '/#investor': 'Investor Fleet Partner Portal',
      '/#careers': 'Careers & Logistics Crew Portal',
      '/#faq': 'Frequently Asked Questions (FAQ)',
      '/#contact': 'Direct Contact & Regional Hotlines',
    };

    const newLead = await trackWhatsAppClick({
      pagePath: simPage,
      pageTitle: pageTitles[simPage] || simPage,
      pageUrl: `https://pydamovers.com${simPage}`,
      source: simSource,
      sourceLabel: getSourceDisplayName(simSource),
      whatsappNumber: '2348062466212',
      inquiryMessage: simMessage,
      estimatedValueNaira: Number(simEstimatedValue) || 0,
      notes: 'Simulated inquiry generated from Admin testing panel.',
    });

    setLeads((prev) => [newLead, ...prev.filter((l) => l.id !== newLead.id)]);
    setIsSimulateModalOpen(false);
    onNotify?.(`Simulated WhatsApp inquiry logged for ${simPage}!`, 'success');
  };

  // Export CSV
  const handleExportCsv = () => {
    window.open('/api/leads/whatsapp-conversions/export-csv', '_blank');
    onNotify?.('Exporting Lead Conversion CSV report...', 'info');
  };

  const getStatusBadge = (status: LeadStatus) => {
    switch (status) {
      case 'new_lead':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-black bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            New Inquiry
          </span>
        );
      case 'contacted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-black bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <PhoneCall className="w-3 h-3" />
            Contacted
          </span>
        );
      case 'quote_sent':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-black bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <FileSpreadsheet className="w-3 h-3" />
            Quote Sent
          </span>
        );
      case 'booked':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" />
            Booked Move
          </span>
        );
      case 'archived':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
            Archived
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn" id="admin-lead-conversion-section">
      {/* Tab Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-bold">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp Business Event Tracking Active</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Lead Conversion Intelligence
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Real-time telemetry tracking every WhatsApp Business click across the website. Identify which pages, calculators, and regional hubs are generating the highest volume of qualified moving and haulage inquiries.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setIsSimulateModalOpen(true)}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 font-bold text-xs rounded-xl flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-md"
              title="Test WhatsApp event tracking by simulating a page click"
            >
              <Plus className="w-4 h-4" />
              <span>Simulate Click</span>
            </button>

            <button
              onClick={handleExportCsv}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-900/30"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={loadLeads}
              disabled={isLoading}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors"
              title="Refresh Lead Data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* 4 Stat Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          {/* Card 1: Total Inquiries */}
          <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4.5 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
              <span>Total WhatsApp Inquiries</span>
              <MessageSquare className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-black text-white font-mono">
              {stats.total}
            </div>
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <span className="text-emerald-400 font-bold">+{stats.today} today</span>
              <span>across all landing pages</span>
            </div>
          </div>

          {/* Card 2: Top Converting Page */}
          <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4.5 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
              <span>#1 Driving Page</span>
              <TrendingUp className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-lg font-black text-white truncate" title={stats.topPage?.pageTitle || 'N/A'}>
              {stats.topPage?.pageTitle || 'Cost Calculator'}
            </div>
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-mono text-[10px] font-bold">
                {stats.topPage?.clickCount || 0} inquiries ({stats.topPage?.percentage || 0}%)
              </span>
              <span className="text-slate-400 font-mono text-[11px] truncate">
                {stats.topPage?.pagePath}
              </span>
            </div>
          </div>

          {/* Card 3: Conversion Pipeline */}
          <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4.5 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
              <span>Pipeline Status</span>
              <CheckCircle2 className="w-4 h-4 text-purple-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white font-mono">{stats.booked}</span>
              <span className="text-xs text-emerald-400 font-bold">Booked Deals</span>
            </div>
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <span className="text-blue-400 font-bold">{stats.newLeads} new</span>
              <span>•</span>
              <span className="text-amber-400 font-bold">{stats.contacted} in progress</span>
            </div>
          </div>

          {/* Card 4: Estimated Pipeline Value */}
          <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4.5 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
              <span>Est. Pipeline Value</span>
              <Building2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-amber-400 font-mono truncate">
              ₦{stats.totalPipelineValue.toLocaleString('en-NG')}
            </div>
            <div className="text-xs text-slate-400">
              Commercial moves & fleet registrations
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: Page Attribution Analytics (Measures which pages drive the most inquiries) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-amber-400" />
              <h3 className="text-lg font-black text-white">
                Page Inquiry Attribution Ranking
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              Detailed performance ranking of website URLs driving inbound customer WhatsApp inquiries.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            {pageMetrics.length} Active Inquiry Routes
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pageMetrics.map((pm, idx) => {
            const isSelected = selectedPageFilter === pm.pagePath;
            return (
              <div
                key={pm.pagePath}
                onClick={() => setSelectedPageFilter(isSelected ? 'all' : pm.pagePath)}
                className={`cursor-pointer group relative p-5 rounded-2xl border transition-all duration-200 ${
                  isSelected
                    ? 'bg-amber-500/10 border-amber-400/80 shadow-lg shadow-amber-500/5 ring-1 ring-amber-400'
                    : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-950'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center font-mono ${
                      idx === 0
                        ? 'bg-amber-500 text-slate-950'
                        : idx === 1
                        ? 'bg-slate-300 text-slate-950'
                        : idx === 2
                        ? 'bg-amber-700 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      #{idx + 1}
                    </span>
                    <span className="font-mono text-xs text-slate-400 font-bold truncate max-w-[140px]">
                      {pm.pagePath}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-white font-mono">
                      {pm.clickCount}
                    </span>
                    <span className="text-[11px] font-bold text-amber-400 ml-1 font-mono">
                      ({pm.percentage}%)
                    </span>
                  </div>
                </div>

                <h4 className="font-extrabold text-white text-sm group-hover:text-amber-400 transition-colors line-clamp-1 mb-2">
                  {pm.pageTitle}
                </h4>

                {/* Progress Visualizer */}
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-3">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(pm.percentage, 5)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span className="flex items-center gap-1 truncate max-w-[150px]" title={`Top Touchpoint: ${pm.topSource}`}>
                    <Sparkles className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span className="truncate">{pm.topSource}</span>
                  </span>
                  <span className="font-mono text-slate-400">
                    {new Date(pm.lastInquiryAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-bold">
                  <span className={isSelected ? 'text-amber-400 font-black' : 'text-slate-400'}>
                    {isSelected ? '✓ Filtering Table Below' : 'Click to filter table'}
                  </span>
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'rotate-90 text-amber-400' : 'text-slate-400 group-hover:translate-x-0.5'}`} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: The 'Lead Conversion' Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-400" />
              <span>Lead Conversion Records</span>
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold">
                {filteredLeads.length} {filteredLeads.length === 1 ? 'inquiry' : 'inquiries'}
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Click any WhatsApp row to view notes, update customer dispatch status, or initiate instant follow-up chat.
            </p>
          </div>

          {/* Filter Controls Bar */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Search */}
            <div className="relative min-w-[220px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search page, message, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-400 focus:border-amber-400 outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Page Filter Select */}
            <select
              value={selectedPageFilter}
              onChange={(e) => setSelectedPageFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-bold focus:border-amber-400 outline-none"
            >
              <option value="all">All Pages ({leads.length})</option>
              {pageMetrics.map((pm) => (
                <option key={pm.pagePath} value={pm.pagePath}>
                  {pm.pageTitle} ({pm.clickCount})
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-bold focus:border-amber-400 outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="new_lead">New Inquiry</option>
              <option value="contacted">Contacted</option>
              <option value="quote_sent">Quote Sent</option>
              <option value="booked">Booked Move</option>
              <option value="archived">Archived</option>
            </select>

            {/* Device Filter */}
            <select
              value={selectedDeviceFilter}
              onChange={(e) => setSelectedDeviceFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-bold focus:border-amber-400 outline-none"
            >
              <option value="all">All Devices</option>
              <option value="mobile">Mobile (Smartphone)</option>
              <option value="desktop">Desktop</option>
              <option value="tablet">Tablet</option>
            </select>

            {(selectedPageFilter !== 'all' || selectedStatusFilter !== 'all' || selectedDeviceFilter !== 'all' || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedPageFilter('all');
                  setSelectedStatusFilter('all');
                  setSelectedDeviceFilter('all');
                  setSearchQuery('');
                }}
                className="px-3 py-2 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* The Lead Conversion Table Container */}
        <div className="overflow-x-auto border border-slate-800 rounded-2xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/90 text-slate-400 font-mono text-[11px] uppercase tracking-wider border-b border-slate-800">
                <th className="py-3.5 px-4 font-bold">Time & Date</th>
                <th className="py-3.5 px-4 font-bold">Source Page & Hub</th>
                <th className="py-3.5 px-4 font-bold">Touchpoint</th>
                <th className="py-3.5 px-4 font-bold">Inquiry Message Context</th>
                <th className="py-3.5 px-4 font-bold">Target WhatsApp</th>
                <th className="py-3.5 px-4 font-bold">Device / Source</th>
                <th className="py-3.5 px-4 font-bold">Lead Status</th>
                <th className="py-3.5 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-900/50">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <MessageSquare className="w-10 h-10 text-slate-400" />
                      <p className="font-bold text-sm text-slate-300">No lead conversion records found matching filter criteria.</p>
                      <button
                        onClick={() => setIsSimulateModalOpen(true)}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl font-bold text-xs"
                      >
                        Simulate a Test WhatsApp Click
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => {
                  const leadDate = new Date(lead.timestamp);
                  const isRecent = Date.now() - leadDate.getTime() < 1000 * 60 * 60 * 2; // < 2 hours

                  return (
                    <tr
                      key={lead.id}
                      className="hover:bg-slate-850/60 transition-colors group"
                    >
                      {/* 1. Date & Time */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-mono text-white font-bold flex items-center gap-1.5">
                          {leadDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                          <span className="text-slate-400 font-normal">
                            {leadDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isRecent && (
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" title="Recent conversion" />
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          ID: {lead.id.substring(0, 15)}...
                        </div>
                      </td>

                      {/* 2. Source Page & Hub */}
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-white group-hover:text-amber-400 transition-colors">
                          {lead.pageTitle}
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                            {lead.pagePath}
                          </span>
                        </div>
                      </td>

                      {/* 3. Touchpoint */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-slate-200 font-medium">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{lead.sourceLabel || lead.source}</span>
                        </div>
                        {lead.assignedStaff && (
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            Staff: {lead.assignedStaff}
                          </div>
                        )}
                      </td>

                      {/* 4. Inquiry Message Context */}
                      <td className="py-3.5 px-4 max-w-[280px]">
                        {lead.inquiryMessage ? (
                          <div
                            className="text-slate-300 text-xs italic bg-slate-950/70 p-2 rounded-xl border border-slate-800/80 line-clamp-2"
                            title={lead.inquiryMessage}
                          >
                            "{lead.inquiryMessage}"
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Direct WhatsApp button click</span>
                        )}
                        {lead.estimatedValueNaira ? (
                          <div className="text-[11px] font-mono text-amber-400 font-bold mt-1">
                            Est: ₦{lead.estimatedValueNaira.toLocaleString('en-NG')}
                          </div>
                        ) : null}
                      </td>

                      {/* 5. Target WhatsApp */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-mono text-emerald-400 font-bold flex items-center gap-1">
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>+{lead.whatsappNumber}</span>
                        </div>
                      </td>

                      {/* 6. Device & Referrer */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                          {lead.deviceType === 'mobile' ? (
                            <Smartphone className="w-3.5 h-3.5 text-blue-400" />
                          ) : lead.deviceType === 'tablet' ? (
                            <Tablet className="w-3.5 h-3.5 text-purple-400" />
                          ) : (
                            <Monitor className="w-3.5 h-3.5 text-slate-400" />
                          )}
                          <span className="capitalize">{lead.deviceType || 'Desktop'}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[120px]" title={lead.referrer}>
                          {lead.referrer ? lead.referrer.replace('https://', '') : 'Direct'}
                        </div>
                      </td>

                      {/* 7. Status & Inline Dropdown */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <select
                          value={lead.status}
                          onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                          className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-200 outline-none focus:border-amber-400 cursor-pointer"
                        >
                          <option value="new_lead">🟢 New Inquiry</option>
                          <option value="contacted">🟡 Contacted</option>
                          <option value="quote_sent">🟣 Quote Sent</option>
                          <option value="booked">✅ Booked Move</option>
                          <option value="archived">⚪ Archived</option>
                        </select>
                      </td>

                      {/* 8. Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Direct WhatsApp Response Link */}
                          <a
                            href={`https://wa.me/${lead.whatsappNumber}?text=${encodeURIComponent(
                              `Hello! Thank you for contacting Pyda Movers regarding your inquiry on our ${lead.pageTitle}. How can our logistics dispatch team assist you today?`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-colors"
                            title="Open direct WhatsApp response chat"
                          >
                            <ArrowUpRight className="w-4 h-4" />
                          </a>

                          {/* Edit Notes */}
                          <button
                            onClick={() => setEditingLead(lead)}
                            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 rounded-lg transition-colors"
                            title="Edit notes and assigned coordinator"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(lead.id)}
                            className="p-2 bg-slate-900 hover:bg-red-950/60 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
                            title="Delete record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Simulate WhatsApp Click Event for Verification */}
      {isSimulateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base">Simulate WhatsApp Inquiry Click</h3>
                  <p className="text-xs text-slate-400">Test attribution telemetry across pages in real-time</p>
                </div>
              </div>
              <button
                onClick={() => setIsSimulateModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSimulateClick} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">
                  Originating Page Route *
                </label>
                <select
                  value={simPage}
                  onChange={(e) => setSimPage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-xs font-mono outline-none focus:border-amber-400"
                >
                  <option value="/#calculator">/#calculator - Relocation Cost Calculator</option>
                  <option value="/#services/corporate">/#services/corporate - Corporate Office Relocation</option>
                  <option value="/#services/commercial">/#services/commercial - Commercial Logistics</option>
                  <option value="/#services/residential">/#services/residential - Residential Moving</option>
                  <option value="/#services/haulage">/#services/haulage - Interstate Freight (3T-30T)</option>
                  <option value="/#coverage">/#coverage - Nationwide Network Coverage Map</option>
                  <option value="/#investor">/#investor - Investor Fleet Partner Portal</option>
                  <option value="/#faq">/#faq - Frequently Asked Questions</option>
                  <option value="/#careers">/#careers - Careers & Driver Jobs</option>
                  <option value="/#contact">/#contact - Direct Contact & Hotlines</option>
                  <option value="/">/ - Home Page Hero & Overview</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">
                  Source Touchpoint Element *
                </label>
                <select
                  value={simSource}
                  onChange={(e) => setSimSource(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-xs outline-none focus:border-amber-400"
                >
                  <option value="calculator_modal">Quote Cost Calculator Modal</option>
                  <option value="floating_widget">Floating WhatsApp Desk Widget</option>
                  <option value="branch_map">Branch Office Map Pin Button</option>
                  <option value="investor_fleet">Investor Fleet VIP Line</option>
                  <option value="contact_section">Contact Page Emergency Hotline</option>
                  <option value="footer_cta">Footer Quick WhatsApp Link</option>
                  <option value="faq_section">FAQ Support Coordinator</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">
                  Pre-filled Inquiry Message *
                </label>
                <textarea
                  rows={3}
                  value={simMessage}
                  onChange={(e) => setSimMessage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-xs outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">
                  Estimated Booking Value (₦ Naira)
                </label>
                <input
                  type="number"
                  value={simEstimatedValue}
                  onChange={(e) => setSimEstimatedValue(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-xs font-mono outline-none focus:border-amber-400"
                  placeholder="e.g. 1500000"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsSimulateModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-850 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-amber-500/20"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Log Simulated Inquiry</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Edit Lead Notes & Pipeline Assignment */}
      {editingLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="font-extrabold text-white text-base">Lead Follow-Up & Dispatch Notes</h3>
                <p className="text-xs text-slate-400">ID: {editingLead.id}</p>
              </div>
              <button
                onClick={() => setEditingLead(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLeadEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">
                  Pipeline Status *
                </label>
                <select
                  value={editingLead.status}
                  onChange={(e) => setEditingLead({ ...editingLead, status: e.target.value as LeadStatus })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-xs outline-none focus:border-amber-400"
                >
                  <option value="new_lead">🟢 New Inquiry</option>
                  <option value="contacted">🟡 Contacted & In Discussion</option>
                  <option value="quote_sent">🟣 Quote Sent / Survey Booked</option>
                  <option value="booked">✅ Move Confirmed / Booked</option>
                  <option value="archived">⚪ Archived / Dropped</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">
                  Assigned Logistics Coordinator
                </label>
                <input
                  type="text"
                  placeholder="e.g. Fatima Bello (Lagos Hub)"
                  value={editingLead.assignedStaff || ''}
                  onChange={(e) => setEditingLead({ ...editingLead, assignedStaff: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-xs outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">
                  Estimated Relocation / Freight Value (₦ Naira)
                </label>
                <input
                  type="number"
                  value={editingLead.estimatedValueNaira || ''}
                  onChange={(e) => setEditingLead({ ...editingLead, estimatedValueNaira: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-xs font-mono outline-none focus:border-amber-400"
                  placeholder="e.g. 2500000"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">
                  Internal Operations Notes
                </label>
                <textarea
                  rows={3}
                  value={editingLead.notes || ''}
                  onChange={(e) => setEditingLead({ ...editingLead, notes: e.target.value })}
                  placeholder="Log client requirements, survey schedules, packaging notes..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-xs outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingLead(null)}
                  className="px-4 py-2.5 bg-slate-850 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-amber-500/20"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Updates</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
