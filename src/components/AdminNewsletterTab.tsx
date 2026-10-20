import React, { useState } from 'react';
import {
  Mail,
  Users,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Download,
  Plus,
  Trash2,
  Send,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Building2,
  Home,
  Truck,
  Sparkles,
  Check,
  X,
  Edit3,
  Copy,
  Radio,
  FileSpreadsheet,
  Layers,
  History,
  Eye,
  Sliders,
  Award,
  Zap,
  Info,
  Server,
  Key,
  Gift
} from 'lucide-react';
import { useCms } from '../context/CmsContext';
import { NewsletterSubscriber, NewsletterInterest, NewsletterCampaign } from '../types';
import { ExitIntentNewsletterModal } from './ExitIntentNewsletterModal';

interface PresetTemplate {
  id: string;
  name: string;
  category: NewsletterInterest;
  badge: string;
  subject: string;
  previewText: string;
  ctaText: string;
  ctaUrl: string;
  bodyContent: string;
}

const PRESET_TEMPLATES: PresetTemplate[] = [
  {
    id: 'rainy_season_guide',
    name: '🌧️ Rainy Season Zero-Loss Moving Masterclass',
    category: 'all',
    badge: 'MONSOON LOGISTICS PROTOCOL',
    subject: '📦 Heavy Tropical Rains: How Pyda Shields Luxury Goods & IT Assets',
    previewText: 'Discover our 5-stage weatherproof packing protocol and containerized hydraulic liftgates.',
    ctaText: 'Calculate Weather-Protected Rate',
    ctaUrl: 'https://pydamovers.com#quote',
    bodyContent: `Dear {{name}},\n\nAs the tropical rainy season peaks across Nigeria, moving delicate home furniture, expensive electronics, and corporate data servers requires specialized moisture barrier protection.\n\nAt Pyda Movers & Logistics, every haul during this period is covered by our **Zero-Loss Monsoon Guarantee**:\n\n• **5-Layer Moisture Barrier:** Industrial-grade heat-shrink film, bubble cushioning, and custom hydro-sealed wooden crates.\n• **Enclosed Air-Suspension Fleet:** Water-tight containerized trucks with hydraulic liftgates to eliminate wet ground handling.\n• **Comprehensive Goods-In-Transit Insurance:** Full commercial policy coverage from departure to final placement in your new residence.\n\nContact our dispatch desk or use our online portal to schedule your upcoming relocation with guaranteed priority dispatch!`,
  },
  {
    id: 'corporate_relocation',
    name: '🏢 Corporate HQ Relocation & IT Migration Bulletin',
    category: 'corporate',
    badge: 'EXECUTIVE DISPATCH',
    subject: '💼 Zero-Downtime Corporate Office Moves Across Abuja & Lagos Financial Hubs',
    previewText: 'Weekend server de-racking, secure cable tagging, and white-glove executive setup before Monday 8:00 AM.',
    ctaText: 'Schedule Facility Site Audit',
    ctaUrl: 'https://pydamovers.com#quote',
    bodyContent: `Dear Facilities Director / Team Lead,\n\nRelocating an entire commercial headquarters without losing a single hour of business productivity requires military-grade planning.\n\nPyda Movers specializes in **Weekend Turnkey Corporate Relocations** across Victoria Island, Ikoyi, Marina, Maitama, and the Central Business District (CBD) Abuja.\n\nOur Corporate Protocol includes:\n1. Dedicated Project Logistics Manager on-site.\n2. Certified IT technicians for server rack tagging, anti-static packing, and precision cable mapping.\n3. Asset inventory barcodes scanned at point-of-origin and destination desks.\n4. Comprehensive weekend dispatch — packing starts Friday 5:00 PM, fully functional by Monday 7:30 AM.\n\nContact our corporate dispatch desk at 0806 246 6212 for a confidential on-site survey.`,
  },
  {
    id: 'freight_highway_bulletin',
    name: '🚚 Interstate Highway Freight & Escort Safety Alert',
    category: 'haulage',
    badge: 'HIGHWAY FREIGHT REPORT',
    subject: '🛡️ Lagos ⇄ Abuja & Niger Delta Corridor Telematics & Night-Run Security',
    previewText: 'Live satellite convoy tracking and speed-governed heavy haulage across all 36 Nigerian states.',
    ctaText: 'Book Interstate Haulage Fleet',
    ctaUrl: 'https://pydamovers.com#services',
    bodyContent: `Dear Freight Shipper,\n\nManaging cross-country freight across the Lagos–Ibadan–Abuja corridor requires robust security and unbroken real-time tracking.\n\nPyda Logistics operates a modern fleet of 10-ton, 20-ton, and 30-ton closed articulated trucks equipped with:\n\n• 24/7 Satellite Telematics & Speed Governors.\n• Dual-Driver Relief Protocols on routes exceeding 500km.\n• Armed Security Escort liaisons across high-value transit corridors.\n• Real-Time Client Tracking portal with live geofence milestone alerts.\n\nWhether moving heavy industrial machinery, FMCG stock, or sensitive project equipment, trust Nigeria's premier logistics partner.`,
  },
  {
    id: 'residential_relocation_guide',
    name: '📦 30-Day Master Relocation & Packing Checklist',
    category: 'residential',
    badge: 'HOME RELOCATION GUIDE',
    subject: '🏠 Stress-Free Home Moving: The Step-by-Step 30-Day Packing Blueprint',
    previewText: 'Organize your household relocation seamlessly with our expert room-by-room moving checklist.',
    ctaText: 'Explore Residential Moving',
    ctaUrl: 'https://pydamovers.com#services',
    bodyContent: `Hello {{name}},\n\nPlanning a household relocation to a new home or apartment? Moving does not have to be stressful.\n\nOur master logistics team has compiled the ultimate **30-Day Home Relocation Blueprint**:\n\n• **4 Weeks Before:** Room-by-room inventory audit and decluttering.\n• **2 Weeks Before:** White-glove fragile packing, appliance disconnection, and furniture disassembly.\n• **Moving Day:** Hydraulic liftgate loading, real-time GPS tracking, and complete zero-scratch placement.\n\nVisit our online booking portal or call our dispatch lines at 0806 246 6212 / 0802 560 9972 to reserve your moving crew!`,
  }
];

export const AdminNewsletterTab: React.FC = () => {
  const {
    cms,
    addNewsletterSubscriber,
    updateNewsletterSubscriber,
    deleteNewsletterSubscriber,
    unsubscribeNewsletter,
    testMailchimpConnection,
    broadcastNewsletter,
    sendNewsletterTestEmail,
    deleteNewsletterCampaign
  } = useCms();

  const subscribers = cms.newsletterSubscribers || [];
  const campaigns = cms.newsletterCampaigns || [];

  // Active Sub-Tab: 'subscribers' | 'broadcast' | 'campaigns'
  const [activeSubTab, setActiveSubTab] = useState<'subscribers' | 'broadcast' | 'campaigns'>('subscribers');

  // Search and filter states for subscribers
  const [searchQuery, setSearchQuery] = useState('');
  const [interestFilter, setInterestFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Mailchimp state
  const [testingMailchimp, setTestingMailchimp] = useState(false);
  const [mailchimpResult, setMailchimpResult] = useState<any>(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<NewsletterSubscriber | null>(null);
  const [showExitIntentPreview, setShowExitIntentPreview] = useState(false);

  // Add Subscriber Form state
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newInterest, setNewInterest] = useState<NewsletterInterest>('all');
  const [newNotes, setNewNotes] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formFeedback, setFormFeedback] = useState<{ success?: boolean; message: string } | null>(null);

  // Broadcast Form state
  const [broadcastTitle, setBroadcastTitle] = useState('Rainy Season Moving Masterclass & Logistics Protocol');
  const [broadcastSubject, setBroadcastSubject] = useState('📦 Rainy Season Moving Masterclass & Waterproof Wrapping Protocol');
  const [broadcastPreviewText, setBroadcastPreviewText] = useState('How our hydraulic fleet shields high-value IT equipment and luxury furniture during heavy tropical downpours.');
  const [broadcastTarget, setBroadcastTarget] = useState<string>('all');
  const [broadcastBadge, setBroadcastBadge] = useState('LOGISTICS OPERATIONAL BULLETIN');
  const [broadcastCtaText, setBroadcastCtaText] = useState('Calculate Protected Moving Rate');
  const [broadcastCtaUrl, setBroadcastCtaUrl] = useState('https://pydamovers.com#quote');
  const [broadcastBodyContent, setBroadcastBodyContent] = useState(
    `Dear {{name}},\n\nAs heavy rains continue across Nigeria, moving delicate furniture, corporate servers, and luxury home electronics requires maximum moisture protection.\n\nAt Pyda Movers & Logistics, every move includes our Zero-Loss Weather Protection:\n\n• 5-Layer Moisture Barrier wrapping.\n• Containerized water-sealed hydraulic trucks.\n• 100% Comprehensive Goods-In-Transit Insurance.\n\nContact our dispatch desk to schedule your relocation with full peace of mind!`
  );

  // Broadcast execution & Test states
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState<{ success?: boolean; message: string; successfulCount?: number; failedCount?: number } | null>(null);
  const [testRecipient, setTestRecipient] = useState('yerimaforfor@gmail.com');
  const [sendingTest, setSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{ success?: boolean; message: string; provider?: string } | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Filtered subscribers
  const filteredSubscribers = subscribers.filter((sub) => {
    const matchesSearch =
      sub.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sub.fullName && sub.fullName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (sub.notes && sub.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesInterest = interestFilter === 'all' || sub.interest === interestFilter;
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;

    return matchesSearch && matchesInterest && matchesStatus;
  });

  // Calculate statistics
  const totalSubscribers = subscribers.length;
  const activeSubscribers = subscribers.filter((s) => s.status === 'subscribed').length;
  const unsubscribedCount = subscribers.filter((s) => s.status === 'unsubscribed').length;
  const mailchimpSyncedCount = subscribers.filter((s) => s.mailchimpSynced).length;
  const exitIntentSubscribersCount = subscribers.filter((s) => s.source === 'exit_intent_modal' || s.source === 'exit_intent_popup').length;

  const handleApplyTemplate = (template: PresetTemplate) => {
    setBroadcastTitle(template.name.replace(/^[^\w]+/, ''));
    setBroadcastSubject(template.subject);
    setBroadcastPreviewText(template.previewText);
    setBroadcastTarget(template.category);
    setBroadcastBadge(template.badge);
    setBroadcastCtaText(template.ctaText);
    setBroadcastCtaUrl(template.ctaUrl);
    setBroadcastBodyContent(template.bodyContent);
    setBroadcastResult(null);
    setTestResult(null);
  };

  const handleTestMailchimp = async () => {
    setTestingMailchimp(true);
    setMailchimpResult(null);
    try {
      const res = await testMailchimpConnection();
      setMailchimpResult(res);
    } catch (err: any) {
      setMailchimpResult({ success: false, message: err.message });
    } finally {
      setTestingMailchimp(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail) return;

    setFormSubmitting(true);
    setFormFeedback(null);

    const result = await addNewsletterSubscriber({
      email: newEmail,
      fullName: newName || undefined,
      interest: newInterest,
      source: 'manual_admin_entry',
      notes: newNotes || undefined,
    });

    setFormSubmitting(false);
    setFormFeedback(result);

    if (result.success) {
      setTimeout(() => {
        setIsAddModalOpen(false);
        setNewEmail('');
        setNewName('');
        setNewInterest('all');
        setNewNotes('');
        setFormFeedback(null);
      }, 1500);
    }
  };

  const handleExportCsv = () => {
    if (subscribers.length === 0) return;

    const headers = ['ID', 'Email', 'Full Name', 'Interest Topic', 'Source', 'Status', 'Subscribed Date', 'Mailchimp Synced', 'Notes'];
    const rows = subscribers.map((s) => [
      s.id,
      `"${s.email}"`,
      `"${s.fullName || ''}"`,
      s.interest,
      s.source,
      s.status,
      s.subscribedAt,
      s.mailchimpSynced ? 'Yes' : 'No',
      `"${(s.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pyda-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testRecipient || !broadcastSubject) return;

    setSendingTest(true);
    setTestResult(null);

    const result = await sendNewsletterTestEmail({
      testRecipient,
      subject: broadcastSubject,
      previewText: broadcastPreviewText,
      bodyContent: broadcastBodyContent,
      bannerBadge: broadcastBadge,
      ctaText: broadcastCtaText,
      ctaUrl: broadcastCtaUrl,
    });

    setSendingTest(false);
    setTestResult(result);
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastSubject || !broadcastBodyContent) return;

    const targetedSubscribers = broadcastTarget === 'all'
      ? subscribers.filter(s => s.status === 'subscribed')
      : subscribers.filter(s => s.status === 'subscribed' && (s.interest === broadcastTarget || s.interest === 'all'));

    const confirmMsg = `Are you sure you want to broadcast this newsletter to ${targetedSubscribers.length} active subscriber(s) using your active SMTP/Email service?`;
    if (!window.confirm(confirmMsg)) {
      return;
    }

    setBroadcasting(true);
    setBroadcastResult(null);

    const result = await broadcastNewsletter({
      title: broadcastTitle || broadcastSubject,
      subject: broadcastSubject,
      previewText: broadcastPreviewText || broadcastSubject,
      targetInterest: broadcastTarget,
      bannerBadge: broadcastBadge,
      ctaText: broadcastCtaText,
      ctaUrl: broadcastCtaUrl,
      bodyContent: broadcastBodyContent,
    });

    setBroadcasting(false);
    setBroadcastResult(result);
  };

  const interestBadgeConfig: Record<NewsletterInterest, { label: string; color: string; icon: React.FC<{ className?: string }> }> = {
    all: { label: 'All Topics', color: 'bg-slate-800 text-slate-300 border-slate-700', icon: Sparkles },
    residential: { label: 'Home Moves', color: 'bg-sky-500/10 text-sky-400 border-sky-500/20', icon: Home },
    corporate: { label: 'Corporate & Office', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20', icon: Building2 },
    haulage: { label: 'Haulage & Freight', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: Truck },
  };

  return (
    <div className="pt-8 space-y-6">
      {/* Top Banner & Navigation Sub-Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
              Audience & Growth
            </span>
            <span className="text-xs text-slate-400">SMTP Bulk Dispatcher & Mailchimp Sync</span>
          </div>
          <h2 className="text-xl font-black text-white mt-1 flex items-center gap-2">
            <Mail className="w-5 h-5 text-amber-400" />
            <span>Newsletter Marketing & Bulk Email Engine</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Manage your subscribers from the footer form, send bulk email newsletters and operational bulletins using your existing SMTP provider, and review past broadcast campaigns.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setActiveSubTab('subscribers')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
              activeSubTab === 'subscribers'
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
            }`}
            id="subtab-subscribers-btn"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Mailing List ({activeSubscribers})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('broadcast')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
              activeSubTab === 'broadcast'
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
            }`}
            id="subtab-broadcast-btn"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Bulk Broadcast Studio</span>
          </button>

          <button
            onClick={() => setActiveSubTab('campaigns')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
              activeSubTab === 'campaigns'
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
            }`}
            id="subtab-campaigns-btn"
          >
            <History className="w-3.5 h-3.5" />
            <span>Sent History ({campaigns.length})</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
          <p className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Total Subscribers</p>
          <p className="text-2xl font-black text-white mt-1">{totalSubscribers}</p>
          <p className="text-[10px] text-slate-500 mt-1">Website footer & quotes</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
          <p className="text-[11px] font-bold uppercase text-emerald-400 tracking-wider">Active Recipients</p>
          <p className="text-2xl font-black text-emerald-400 mt-1">{activeSubscribers}</p>
          <p className="text-[10px] text-slate-500 mt-1">Targetable for broadcasts</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
          <p className="text-[11px] font-bold uppercase text-amber-400 tracking-wider">Mailchimp Synced</p>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-2xl font-black text-amber-400">{mailchimpSyncedCount}</p>
            <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">
              {totalSubscribers > 0 ? `${Math.round((mailchimpSyncedCount / totalSubscribers) * 100)}%` : '0%'}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Cloud synchronized</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
          <p className="text-[11px] font-bold uppercase text-indigo-400 tracking-wider">Sent Campaigns</p>
          <p className="text-2xl font-black text-indigo-400 mt-1">{campaigns.length}</p>
          <p className="text-[10px] text-slate-500 mt-1">Dispatches logged</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
          <p className="text-[11px] font-bold uppercase text-rose-400 tracking-wider">Unsubscribed</p>
          <p className="text-2xl font-black text-rose-400 mt-1">{unsubscribedCount}</p>
          <p className="text-[10px] text-slate-500 mt-1">1-click compliance</p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: MAILING LIST (SUBSCRIBERS TABLE & CONTROLS) */}
      {/* ========================================================================= */}
      {activeSubTab === 'subscribers' && (
        <div className="space-y-6 animate-fade-in">
          {/* Mailchimp Dual-Engine Banner */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 font-black text-sm">
                  MC
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white">Dual-Engine Subscription Architecture</h4>
                    <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>SMTP Ready + Mailchimp Cloud Sync</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Subscribers are persisted to local storage and mirrored to Mailchimp if configured in <code className="text-amber-300 bg-slate-950 px-1 py-0.5 rounded">.env</code>. Bulk broadcasts use your active SMTP provider.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setShowExitIntentPreview(true)}
                  className="px-3.5 py-2 bg-gradient-to-r from-amber-500/10 to-amber-600/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold text-xs rounded-xl flex items-center gap-2 transition-colors shrink-0"
                  id="preview-exit-intent-btn"
                  title="Test the timed Exit-Intent newsletter offer popup"
                >
                  <Gift className="w-3.5 h-3.5 text-amber-400" />
                  <span>Preview Exit-Intent Popup ({exitIntentSubscribersCount})</span>
                </button>

                <button
                  onClick={handleTestMailchimp}
                  disabled={testingMailchimp}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl flex items-center gap-2 transition-colors shrink-0 disabled:opacity-50"
                  id="test-mailchimp-api-btn"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testingMailchimp ? 'animate-spin text-amber-400' : ''}`} />
                  <span>{testingMailchimp ? 'Checking API...' : 'Test Mailchimp Connection'}</span>
                </button>
              </div>
            </div>

            {mailchimpResult && (
              <div
                className={`mt-4 p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 animate-fade-in ${
                  mailchimpResult.success
                    ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300'
                    : 'bg-amber-950/60 border border-amber-500/40 text-amber-300'
                }`}
              >
                {mailchimpResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                )}
                <span>{mailchimpResult.message}</span>
              </div>
            )}
          </div>

          {/* Filter and Action Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
            <div className="relative flex-grow max-w-md">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search email, name, or subscriber notes..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 text-white placeholder-slate-500 text-xs rounded-xl pl-9 pr-4 py-2.5 outline-none transition-colors"
                id="search-subscribers-input"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5">
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                <select
                  value={interestFilter}
                  onChange={(e) => setInterestFilter(e.target.value)}
                  className="bg-transparent text-slate-300 text-xs font-semibold outline-none cursor-pointer"
                  id="filter-interest-select"
                >
                  <option value="all" className="bg-slate-900">All Topics ({subscribers.length})</option>
                  <option value="residential" className="bg-slate-900">Home Moving Tips</option>
                  <option value="corporate" className="bg-slate-900">Corporate & Office</option>
                  <option value="haulage" className="bg-slate-900">Haulage & Freight</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-transparent text-slate-300 text-xs font-semibold outline-none cursor-pointer"
                  id="filter-status-select"
                >
                  <option value="all" className="bg-slate-900">All Statuses</option>
                  <option value="subscribed" className="bg-slate-900">Subscribed (Active)</option>
                  <option value="unsubscribed" className="bg-slate-900">Unsubscribed</option>
                </select>
              </div>

              <button
                onClick={handleExportCsv}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors shadow-sm"
                id="export-subscribers-csv-btn"
                title="Export subscriber list to CSV spreadsheet"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center gap-1.5 transition-all"
                id="add-subscriber-btn"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Add Subscriber</span>
              </button>
            </div>
          </div>

          {/* Subscribers Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Subscriber</th>
                    <th className="py-3.5 px-4">Interest Topic</th>
                    <th className="py-3.5 px-4">Source</th>
                    <th className="py-3.5 px-4">Subscribed Date</th>
                    <th className="py-3.5 px-4">Mailchimp Sync</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredSubscribers.length > 0 ? (
                    filteredSubscribers.map((sub) => {
                      const interestCfg = interestBadgeConfig[sub.interest] || interestBadgeConfig.all;
                      const InterestIcon = interestCfg.icon;

                      return (
                        <tr key={sub.id} className="hover:bg-slate-850/50 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="space-y-0.5">
                              <p className="font-bold text-white">{sub.email}</p>
                              {sub.fullName && (
                                <p className="text-[11px] text-slate-400 font-medium">{sub.fullName}</p>
                              )}
                              {sub.notes && (
                                <p className="text-[10px] text-amber-400/80 italic">{sub.notes}</p>
                              )}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg border ${interestCfg.color}`}
                            >
                              <InterestIcon className="w-3 h-3" />
                              <span>{interestCfg.label}</span>
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            {sub.source === 'exit_intent_modal' || sub.source === 'exit_intent_popup' ? (
                              <span className="inline-flex items-center gap-1 font-bold text-[10px] text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/30">
                                <Gift className="w-3 h-3 text-amber-400" />
                                <span>Exit-Intent Modal</span>
                              </span>
                            ) : sub.source === 'quote_modal' ? (
                              <span className="inline-flex items-center gap-1 font-mono text-[11px] text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                                <span>Quote Calculator</span>
                              </span>
                            ) : (
                              <span className="font-mono text-[11px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                                {sub.source || 'footer_form'}
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-[11px] text-slate-400 whitespace-nowrap">
                            {sub.subscribedAt ? new Date(sub.subscribedAt).toLocaleDateString() : 'Recent'}
                          </td>

                          <td className="py-3.5 px-4">
                            {sub.mailchimpSynced ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Synced</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-full">
                                <span>Local Only</span>
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            {sub.status === 'subscribed' ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                <span>Subscribed</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full">
                                <span>Unsubscribed</span>
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {sub.status === 'subscribed' ? (
                                <button
                                  onClick={() => unsubscribeNewsletter(sub.id)}
                                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded text-[10px] font-bold"
                                  title="Mark as unsubscribed"
                                >
                                  Unsubscribe
                                </button>
                              ) : (
                                <button
                                  onClick={() => updateNewsletterSubscriber(sub.id, { status: 'subscribed' })}
                                  className="px-2 py-1 bg-slate-800 hover:bg-emerald-950 text-emerald-400 rounded text-[10px] font-bold"
                                  title="Resubscribe"
                                >
                                  Reactivate
                                </button>
                              )}

                              <button
                                onClick={() => {
                                  if (window.confirm(`Delete subscriber ${sub.email} permanently?`)) {
                                    deleteNewsletterSubscriber(sub.id);
                                  }
                                }}
                                className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                                title="Delete subscriber"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500">
                        <Users className="w-8 h-8 mx-auto text-slate-600 mb-2 opacity-50" />
                        <p className="text-sm font-bold text-slate-400">No subscribers found</p>
                        <p className="text-xs text-slate-600 mt-0.5">Try clearing filters or add a new subscriber manually.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: BULK EMAIL BROADCAST STUDIO */}
      {/* ========================================================================= */}
      {activeSubTab === 'broadcast' && (
        <div className="space-y-6 animate-fade-in">
          {/* Preset Campaign Template Selectors */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Pre-Configured High-Conversion Logistics Templates</h3>
              </div>
              <span className="text-[11px] text-slate-400">Click any template to auto-populate the composer</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
              {PRESET_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  onClick={() => handleApplyTemplate(tmpl)}
                  className="text-left p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-900 transition-all group flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {tmpl.category}
                    </span>
                    <h4 className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors mt-2">
                      {tmpl.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                      {tmpl.previewText}
                    </p>
                  </div>
                  <div className="mt-3 text-[10px] font-black text-amber-400 flex items-center gap-1">
                    <span>Load Template</span>
                    <span>→</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Broadcast Composer Form Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Composer Form (7 cols) */}
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-white">Campaign Composer & Content Settings</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(true)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold rounded-lg border border-slate-700 flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5 text-amber-400" />
                  <span>Full Screen Preview</span>
                </button>
              </div>

              <form onSubmit={handleSendBroadcast} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Target Audience Group</label>
                    <select
                      value={broadcastTarget}
                      onChange={(e) => setBroadcastTarget(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 text-white text-xs rounded-xl px-3.5 py-2.5 outline-none font-semibold"
                      id="broadcast-target-select"
                    >
                      <option value="all">All Active Subscribers ({activeSubscribers})</option>
                      <option value="residential">Residential Moving Clients ({subscribers.filter(s => s.interest === 'residential').length})</option>
                      <option value="corporate">Corporate & Facilities Directors ({subscribers.filter(s => s.interest === 'corporate').length})</option>
                      <option value="haulage">Haulage & Freight Shippers ({subscribers.filter(s => s.interest === 'haulage').length})</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Category Badge</label>
                    <input
                      type="text"
                      value={broadcastBadge}
                      onChange={(e) => setBroadcastBadge(e.target.value)}
                      placeholder="e.g. LOGISTICS DISPATCH"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 text-white text-xs rounded-xl px-3.5 py-2.5 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Email Subject Line *</label>
                  <input
                    type="text"
                    required
                    value={broadcastSubject}
                    onChange={(e) => setBroadcastSubject(e.target.value)}
                    placeholder="e.g. 📦 Rainy Season Relocation & Heavy Haulage Advisory"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 text-white text-xs font-bold rounded-xl px-3.5 py-2.5 outline-none"
                    id="broadcast-subject-input"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Pre-Header Preview Text</label>
                  <input
                    type="text"
                    value={broadcastPreviewText}
                    onChange={(e) => setBroadcastPreviewText(e.target.value)}
                    placeholder="Snippet shown in email clients before opening..."
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 text-white text-xs rounded-xl px-3.5 py-2.5 outline-none"
                  />
                </div>

                {/* Call to Action Button */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">CTA Button Text</label>
                    <input
                      type="text"
                      value={broadcastCtaText}
                      onChange={(e) => setBroadcastCtaText(e.target.value)}
                      placeholder="e.g. Calculate Protected Rate"
                      className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl px-3.5 py-2.5 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">CTA Button URL</label>
                    <input
                      type="text"
                      value={broadcastCtaUrl}
                      onChange={(e) => setBroadcastCtaUrl(e.target.value)}
                      placeholder="https://pydamovers.com#quote"
                      className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl px-3.5 py-2.5 outline-none"
                    />
                  </div>
                </div>

                {/* Message Body */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-300">Newsletter Body Content *</label>
                    <div className="flex items-center gap-1 text-[10px] text-amber-400 font-mono">
                      <span>Tags:</span>
                      <span className="bg-slate-950 px-1 py-0.5 rounded cursor-pointer" onClick={() => setBroadcastBodyContent(p => p + ' {{name}}')}>&#123;&#123;name&#125;&#125;</span>
                    </div>
                  </div>
                  <textarea
                    rows={8}
                    required
                    value={broadcastBodyContent}
                    onChange={(e) => setBroadcastBodyContent(e.target.value)}
                    placeholder="Write the announcement or newsletter copy..."
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 text-white placeholder-slate-600 text-xs rounded-xl p-3.5 outline-none font-sans leading-relaxed"
                    id="broadcast-body-textarea"
                  />
                </div>

                {/* Broadcast Feedback */}
                {broadcastResult && (
                  <div
                    className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-3 animate-fade-in ${
                      broadcastResult.success
                        ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-300'
                        : 'bg-red-950/80 border border-red-500/40 text-red-300'
                    }`}
                  >
                    {broadcastResult.success ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                    )}
                    <div>
                      <p className="font-bold">{broadcastResult.message}</p>
                      {broadcastResult.successfulCount !== undefined && (
                        <p className="text-[11px] opacity-80 mt-0.5">
                          Delivered: {broadcastResult.successfulCount} | Failed: {broadcastResult.failedCount || 0}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5 text-amber-400" />
                    <span>Dispatched via active SMTP / Email provider</span>
                  </div>

                  <button
                    type="submit"
                    disabled={broadcasting}
                    className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 transition-all active:scale-95"
                    id="submit-broadcast-blast-btn"
                  >
                    {broadcasting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Sending Broadcast to Subscribers...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 stroke-[2.5]" />
                        <span>Broadcast to {broadcastTarget === 'all' ? activeSubscribers : subscribers.filter(s => s.status === 'subscribed' && (s.interest === broadcastTarget || s.interest === 'all')).length} Subscribers</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Right: Pre-Flight Test Sender & Live Branded Preview (5 cols) */}
            <div className="lg:col-span-5 space-y-5">
              {/* Pre-Flight Test Email Sender Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-white">Pre-Flight Test Email</h3>
                </div>
                <p className="text-xs text-slate-400">
                  Send a live test copy to your personal or admin inbox to review formatting and deliverability before blasting to your entire subscriber list.
                </p>

                <form onSubmit={handleSendTestEmail} className="space-y-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Test Recipient Email</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="email"
                        required
                        value={testRecipient}
                        onChange={(e) => setTestRecipient(e.target.value)}
                        placeholder="yerimaforfor@gmail.com"
                        className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 text-white text-xs rounded-xl px-3 py-2 outline-none"
                        id="test-recipient-email-input"
                      />
                      <button
                        type="submit"
                        disabled={sendingTest}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-amber-400 font-bold text-xs rounded-xl border border-amber-500/30 whitespace-nowrap flex items-center gap-1.5 transition-colors disabled:opacity-50"
                        id="send-test-newsletter-btn"
                      >
                        {sendingTest ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Send className="w-3.5 h-3.5" />
                        )}
                        <span>Send Test</span>
                      </button>
                    </div>
                  </div>

                  {testResult && (
                    <div
                      className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fade-in ${
                        testResult.success
                          ? 'bg-emerald-950/80 border border-emerald-500/30 text-emerald-300'
                          : 'bg-red-950/80 border border-red-500/30 text-red-300'
                      }`}
                    >
                      {testResult.success ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                      )}
                      <span>{testResult.message}</span>
                    </div>
                  )}
                </form>
              </div>

              {/* Live Mini Preview Box */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-amber-400" />
                    <h3 className="text-sm font-bold text-white">Live Email Appearance</h3>
                  </div>
                  <span className="text-[10px] text-slate-500 uppercase font-mono">Recipient View</span>
                </div>

                {/* Email Mockup Container */}
                <div className="bg-[#050811] border border-slate-800 rounded-xl overflow-hidden text-slate-300 font-sans text-xs">
                  {/* Email Header Banner */}
                  <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-3 text-center text-slate-950">
                    <span className="text-[9px] font-black uppercase tracking-wider block">PYDA MOVERS & LOGISTICS</span>
                    <p className="text-[10px] font-bold">Nigeria & Pan-Africa Logistics Dispatch</p>
                  </div>

                  {/* Email Intro Card */}
                  <div className="p-4 space-y-3 bg-[#0b1120]">
                    {broadcastBadge && (
                      <span className="inline-block text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                        {broadcastBadge}
                      </span>
                    )}

                    <h4 className="text-sm font-black text-white leading-snug">
                      {broadcastSubject || 'Untitled Newsletter Dispatch'}
                    </h4>

                    <p className="text-[11px] text-slate-400 leading-relaxed whitespace-pre-line">
                      {broadcastBodyContent.replace(/\{\{name\}\}/gi, 'Alhaji Yerima')}
                    </p>

                    {broadcastCtaText && (
                      <div className="text-center pt-2">
                        <div className="inline-block bg-amber-500 text-slate-950 font-black text-[11px] px-4 py-2 rounded-lg">
                          {broadcastCtaText} →
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Email Footer */}
                  <div className="p-3 bg-[#070a13] border-t border-slate-800/80 text-[9px] text-slate-500 text-center space-y-1">
                    <p>Pyda Movers & Logistics Ltd • Abuja & Lagos</p>
                    <p>Hotlines: 0806 246 6212 | 0802 560 9972</p>
                    <p className="text-slate-600">You received this because you subscribed on pydamovers.com</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: CAMPAIGN DISPATCH HISTORY */}
      {/* ========================================================================= */}
      {activeSubTab === 'campaigns' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <History className="w-4 h-4 text-amber-400" />
                  <span>Broadcast Campaign Dispatch Archive</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Complete historical record of all broadcast newsletters and logistics bulletins sent to your mailing list.
                </p>
              </div>

              <button
                onClick={() => setActiveSubTab('broadcast')}
                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Create New Campaign</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Campaign Title & Subject</th>
                    <th className="py-3.5 px-4">Target Group</th>
                    <th className="py-3.5 px-4">Recipients</th>
                    <th className="py-3.5 px-4">Dispatched At</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {campaigns.length > 0 ? (
                    campaigns.map((camp) => (
                      <tr key={camp.id} className="hover:bg-slate-850/50 transition-colors">
                        <td className="py-3.5 px-4 max-w-sm">
                          <div className="space-y-0.5">
                            <p className="font-bold text-white">{camp.title}</p>
                            <p className="text-[11px] text-slate-400 line-clamp-1">{camp.subject}</p>
                            {camp.senderInfo && (
                              <p className="text-[10px] text-amber-400/70 font-mono">{camp.senderInfo}</p>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="inline-block text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg bg-slate-950 text-slate-300 border border-slate-800">
                            {camp.targetInterest}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="space-y-0.5">
                            <p className="font-bold text-white">{camp.recipientCount.toLocaleString()} sent</p>
                            {camp.successfulCount !== undefined && (
                              <p className="text-[10px] text-emerald-400 font-medium">{camp.successfulCount.toLocaleString()} delivered</p>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-[11px] text-slate-400 whitespace-nowrap">
                          {camp.sentAt ? new Date(camp.sentAt).toLocaleString() : 'Recent'}
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Delivered</span>
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete campaign archive "${camp.title}"?`)) {
                                deleteNewsletterCampaign(camp.id);
                              }
                            }}
                            className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                            title="Delete campaign record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500">
                        <History className="w-8 h-8 mx-auto text-slate-600 mb-2 opacity-50" />
                        <p className="text-sm font-bold text-slate-400">No campaigns dispatched yet</p>
                        <p className="text-xs text-slate-600 mt-0.5">Use the Bulk Broadcast Studio to send your first newsletter.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add Subscriber Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-400" />
                <span>Add New Newsletter Subscriber</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="subscriber@example.com"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 text-white placeholder-slate-600 text-xs rounded-xl px-3.5 py-2.5 outline-none"
                  id="new-subscriber-email"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Full Name (Optional)</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Alh. Farouk Ibrahim"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 text-white placeholder-slate-600 text-xs rounded-xl px-3.5 py-2.5 outline-none"
                  id="new-subscriber-name"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Topic / Interest Category</label>
                <select
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value as NewsletterInterest)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 text-white text-xs rounded-xl px-3.5 py-2.5 outline-none"
                  id="new-subscriber-interest"
                >
                  <option value="all">All Topics & Guides</option>
                  <option value="residential">Residential & Home Moves</option>
                  <option value="corporate">Corporate & Office Relocations</option>
                  <option value="haulage">Haulage & Interstate Freight</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Internal Notes (Optional)</label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="e.g. Added from client contact directory..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 text-white placeholder-slate-600 text-xs rounded-xl px-3.5 py-2.5 outline-none"
                />
              </div>

              {formFeedback && (
                <div
                  className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                    formFeedback.success ? 'bg-emerald-950/80 text-emerald-300' : 'bg-red-950/80 text-red-300'
                  }`}
                >
                  {formFeedback.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  <span>{formFeedback.message}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md disabled:opacity-50"
                  id="save-subscriber-btn"
                >
                  {formSubmitting ? 'Saving...' : 'Add Subscriber'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Full Screen Live Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-amber-400" />
                <h3 className="text-base font-black text-white">Full Screen Email Preview</h3>
              </div>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-[#050811] border border-slate-800 rounded-2xl overflow-hidden text-slate-300 font-sans text-xs">
              <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-6 text-center text-slate-950">
                <span className="text-[10px] font-black uppercase tracking-wider block">PYDA MOVERS & LOGISTICS</span>
                <h2 className="text-xl font-black mt-1">Nigeria & Pan-Africa Logistics Dispatch</h2>
                <p className="text-xs font-bold text-slate-900 mt-1">Corporate Relocation • Heavy Haulage • White-Glove Packing</p>
              </div>

              <div className="p-6 space-y-4 bg-[#0b1120]">
                {broadcastBadge && (
                  <span className="inline-block text-[10px] font-extrabold px-3 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                    {broadcastBadge}
                  </span>
                )}

                <h3 className="text-lg font-black text-white leading-snug">
                  {broadcastSubject}
                </h3>

                <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-line">
                  {broadcastBodyContent.replace(/\{\{name\}\}/gi, 'Alhaji Yerima')}
                </p>

                {broadcastCtaText && (
                  <div className="text-center pt-3">
                    <a
                      href={broadcastCtaUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block bg-amber-500 text-slate-950 font-black text-xs px-6 py-3 rounded-xl shadow-lg"
                    >
                      {broadcastCtaText} →
                    </a>
                  </div>
                )}
              </div>

              <div className="p-4 bg-[#070a13] border-t border-slate-800 text-[10px] text-slate-500 text-center space-y-1">
                <p className="font-bold text-slate-400">Pyda Movers & Logistics Ltd</p>
                <p>Abuja HQ: Suite A204 Citygate Plaza, Airport Rd | Lagos: 374/376 Old Ojo Rd, Alakija</p>
                <p>Direct Hotlines: 0806 246 6212 | 0802 560 9972</p>
                <p className="text-slate-600">You are receiving this official update because you subscribed on pydamovers.com.</p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowPreviewModal(false)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Live Preview of Exit-Intent Popup */}
      {showExitIntentPreview && (
        <ExitIntentNewsletterModal
          forceOpen={true}
          onClose={() => setShowExitIntentPreview(false)}
        />
      )}
    </div>
  );
};
