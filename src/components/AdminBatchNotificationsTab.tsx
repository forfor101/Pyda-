import React, { useState, useEffect, useRef } from 'react';
import {
  Radio,
  Send,
  Users,
  AlertTriangle,
  CloudRain,
  ShieldAlert,
  Sparkles,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Smartphone,
  Copy,
  Check,
  RefreshCw,
  Trash2,
  Truck,
  Building2,
  ChevronRight,
  ExternalLink,
  Info,
  ShieldCheck,
  Layers,
  Phone,
  Flame,
  Zap,
  Filter,
  Eye,
  X
} from 'lucide-react';
import {
  BatchSmsCategory,
  BatchSmsUrgency,
  BatchSmsAudience,
  ActiveClientTarget,
  BatchSmsCampaign,
  SmsGatewayConfig
} from '../types';

interface PresetBroadcastTemplate {
  id: string;
  name: string;
  category: BatchSmsCategory;
  urgency: BatchSmsUrgency;
  title: string;
  icon: any;
  template: string;
}

const PRESET_TEMPLATES: PresetBroadcastTemplate[] = [
  {
    id: 'lokoja_flood_delay',
    name: '🌧️ Lokoja / Niger Corridor Flash Flooding Delay',
    category: 'weather_delay',
    urgency: 'high',
    title: 'Flash Flooding Alert: Transit Delay on Lokoja A2 Highway',
    icon: CloudRain,
    template: 'Pyda Logistics Weather Alert: Severe flash flooding along the A2 Lokoja-Abuja corridor has slowed highway transit. Convoy #{{trackingId}} is secured safely at our Lokoja transit hub with electronic tamper seals intact. Lead Captain phone: {{driverPhone}}. 24/7 Dispatch Hotline: {{hotline}}.'
  },
  {
    id: 'monsoon_rain_speed',
    name: '⛈️ Monsoon Torrential Rains & Hydroplaning Restrictions',
    category: 'weather_delay',
    urgency: 'high',
    title: 'Weather Advisory: Heavy Rain Speed Restrictions Across Lagos-Ibadan Corridor',
    icon: CloudRain,
    template: 'Pyda Safety Advisory: Torrential tropical downpours along the Lagos-Ibadan corridor. Fleet #{{trackingId}} is proceeding under our 45 km/h safety regulation with hydro-sealed waterproof container checks. ETA adjusted by +2 hrs. Driver: {{driverPhone}}. Hotline: {{hotline}}.'
  },
  {
    id: 'ore_benin_reroute',
    name: '🚧 Highway Reroute: Ore-Benin Emergency Bridge Repairs',
    category: 'traffic_reroute',
    urgency: 'high',
    title: 'Transit Reroute: Highway Reconstruction on Ore-Benin Expressway',
    icon: AlertTriangle,
    template: 'Pyda Transit Notice: Urgent federal bridge repairs between Ore and Benin have required a temporary detour via Ondo-Akure axis. Convoy #{{trackingId}} ({{origin}} ➔ {{destination}}) remains under continuous GPS satellite escort. Tracking: https://pydamovers.com/tracking'
  },
  {
    id: 'harmattan_haze_night',
    name: '☀️ Harmattan Dust Storm & Low Visibility Protocol',
    category: 'weather_delay',
    urgency: 'medium',
    title: 'Harmattan Haze Alert: Northern Corridor Night Transit Staging',
    icon: Flame,
    template: 'Pyda Fleet Protocol: Severe harmattan dust haze has reduced Northern transit visibility below 80m. In line with ISO fleet safety rules, Convoy #{{trackingId}} is held safely at our regional depot until dawn. Cargo safe under armed guard. Hotline: {{hotline}}.'
  },
  {
    id: 'holiday_schedule_update',
    name: '📢 System-Wide Nationwide Holiday Transit Schedule',
    category: 'system_update',
    urgency: 'medium',
    title: 'System Notice: Nationwide Public Holiday Logistics Schedule',
    icon: Zap,
    template: 'Pyda Movers Notice: Scheduled public holiday transit timetables are active across all regional terminals. Express freight dispatches, Document Vault access, and 24/7 armed escort units remain fully operational: https://pydamovers.com/tracking • Hotline: {{hotline}}'
  },
  {
    id: 'vault_telematics_maintenance',
    name: '🛡️ System Telematics & Document Vault Scheduled Maintenance',
    category: 'system_update',
    urgency: 'low',
    title: 'System Advisory: Off-Peak Telematics Satellite Server Maintenance',
    icon: ShieldCheck,
    template: 'Pyda Movers Advisory: Routine off-peak telematics satellite synchronization scheduled tonight 01:00-03:00 AM. Live GPS maps may experience brief latency; on-road transit convoys remain fully protected with unbroken chain-of-custody. Hotline: {{hotline}}.'
  }
];

const MERGE_TAGS = [
  { tag: '{{clientName}}', label: 'Client Name', desc: 'e.g. National FMCG Distribution' },
  { tag: '{{trackingId}}', label: 'Tracking #', desc: 'e.g. TEMA-84920' },
  { tag: '{{origin}}', label: 'Origin Hub', desc: 'e.g. Lagos Hub' },
  { tag: '{{destination}}', label: 'Destination', desc: 'e.g. Abuja HQ' },
  { tag: '{{currentLocation}}', label: 'Position', desc: 'e.g. Lokoja Transit Hub' },
  { tag: '{{driverPhone}}', label: 'Driver Phone', desc: 'e.g. 0803 624 9911' },
  { tag: '{{driverName}}', label: 'Captain Name', desc: 'e.g. Musa Ibrahim' },
  { tag: '{{hotline}}', label: 'Hotline', desc: '0806 246 6212' },
];

interface AdminBatchNotificationsTabProps {
  showToast?: (msg: string) => void;
}

export const AdminBatchNotificationsTab: React.FC<AdminBatchNotificationsTabProps> = ({ showToast }) => {
  // Data States
  const [activeClients, setActiveClients] = useState<ActiveClientTarget[]>([]);
  const [campaigns, setCampaigns] = useState<BatchSmsCampaign[]>([]);
  const [smsConfig, setSmsConfig] = useState<SmsGatewayConfig | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Filter & Selection States
  const [audienceFilter, setAudienceFilter] = useState<BatchSmsAudience>('all_active');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedClientIds, setSelectedClientIds] = useState<Set<string>>(new Set());

  // Composer Form States
  const [broadcastTitle, setBroadcastTitle] = useState<string>('🌧️ Flash Flooding Transit Delay - Lokoja Corridor');
  const [category, setCategory] = useState<BatchSmsCategory>('weather_delay');
  const [urgency, setUrgency] = useState<BatchSmsUrgency>('high');
  const [messageTemplate, setMessageTemplate] = useState<string>(PRESET_TEMPLATES[0].template);

  // Pre-flight test send
  const [testPhone, setTestPhone] = useState<string>('08062466212');
  const [isSendingTest, setIsSendingTest] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Batch Broadcast execution states
  const [isBroadcasting, setIsBroadcasting] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [broadcastResult, setBroadcastResult] = useState<{
    success: boolean;
    message: string;
    campaign?: BatchSmsCampaign;
    dispatchedCount?: number;
  } | null>(null);

  // Active view sub-tab: 'compose' | 'history'
  const [activeSubView, setActiveSubView] = useState<'compose' | 'history'>('compose');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedCampaignDetail, setSelectedCampaignDetail] = useState<BatchSmsCampaign | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch all active clients, past campaigns, and SMS config
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [clientsRes, campaignsRes, configRes] = await Promise.all([
        fetch('/api/sms/active-clients'),
        fetch('/api/sms/broadcast/campaigns'),
        fetch('/api/sms/config'),
      ]);

      if (clientsRes.ok) {
        const clientsData = await clientsRes.json();
        const clients: ActiveClientTarget[] = clientsData.clients || [];
        setActiveClients(clients);
        // Default select all
        setSelectedClientIds(new Set(clients.map((c) => c.id)));
      }

      if (campaignsRes.ok) {
        const campaignsData = await campaignsRes.json();
        setCampaigns(campaignsData.campaigns || []);
      }

      if (configRes.ok) {
        const configData = await configRes.json();
        setSmsConfig(configData.config);
      }
    } catch (err) {
      console.error('Failed to load batch SMS data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered clients based on audience category and search query
  const filteredClients = activeClients.filter((client) => {
    const matchesAudience =
      audienceFilter === 'all_active' ||
      (audienceFilter === 'in_transit' && client.category === 'in_transit') ||
      (audienceFilter === 'corporate' && client.category === 'corporate') ||
      (audienceFilter === 'residential' && client.category === 'residential');

    const matchesSearch =
      !searchQuery.trim() ||
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (client.company && client.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
      client.phone.includes(searchQuery) ||
      (client.activeConsignment && client.activeConsignment.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (client.route && client.route.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesAudience && matchesSearch;
  });

  // Client Selection Handlers
  const handleToggleClient = (id: string) => {
    const next = new Set(selectedClientIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedClientIds(next);
  };

  const handleSelectAllFiltered = () => {
    const next = new Set(selectedClientIds);
    filteredClients.forEach((c) => next.add(c.id));
    setSelectedClientIds(next);
  };

  const handleDeselectAllFiltered = () => {
    const next = new Set(selectedClientIds);
    filteredClients.forEach((c) => next.delete(c.id));
    setSelectedClientIds(next);
  };

  // Preset Template Loader
  const handleApplyTemplate = (preset: PresetBroadcastTemplate) => {
    setBroadcastTitle(preset.title);
    setCategory(preset.category);
    setUrgency(preset.urgency);
    setMessageTemplate(preset.template);
    if (showToast) {
      showToast(`Applied preset: ${preset.name}`);
    }
  };

  // Insert Merge Tag at cursor
  const handleInsertTag = (tag: string) => {
    if (!textareaRef.current) {
      setMessageTemplate((prev) => prev + ' ' + tag);
      return;
    }
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const text = messageTemplate;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);
    const newText = before + tag + after;
    setMessageTemplate(newText);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + tag.length;
      }
    }, 50);
  };

  // Character and SMS segment calculation
  const charCount = messageTemplate.length;
  const smsSegments = Math.ceil(charCount / 160) || 1;

  // Pre-flight test send
  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPhone.trim() || !messageTemplate.trim()) return;

    setIsSendingTest(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/sms/broadcast/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: testPhone.trim(),
          messageTemplate,
          category,
          urgency,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult({
          success: true,
          message: `Pre-flight test SMS sent to ${testPhone} (${data.result?.provider?.toUpperCase()} Gateway)`,
        });
        if (showToast) showToast(`Pre-flight test dispatched to ${testPhone}`);
      } else {
        setTestResult({
          success: false,
          message: data.message || 'Failed to dispatch pre-flight test SMS.',
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Network error attempting pre-flight test.',
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  // Targeted recipients list based on selection
  const selectedRecipients = activeClients.filter((c) => selectedClientIds.has(c.id));

  // Trigger Full Batch Broadcast
  const handleExecuteBatchBroadcast = async () => {
    if (selectedRecipients.length === 0) {
      alert('Please select at least one active client recipient.');
      return;
    }

    setIsBroadcasting(true);
    setShowConfirmModal(false);
    setBroadcastResult(null);

    try {
      const res = await fetch('/api/sms/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: broadcastTitle,
          category,
          urgency,
          messageTemplate,
          targetAudience: audienceFilter,
          recipients: selectedRecipients,
          dispatchedBy: 'Admin Operations Control',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setBroadcastResult({
          success: true,
          message: data.message,
          campaign: data.campaign,
          dispatchedCount: data.dispatchedCount,
        });
        if (showToast) {
          showToast(`⚡ Batch Broadcast sent to ${data.dispatchedCount} clients!`);
        }
        fetchData();
      } else {
        setBroadcastResult({
          success: false,
          message: data.message || 'Failed to broadcast batch SMS.',
        });
      }
    } catch (err: any) {
      setBroadcastResult({
        success: false,
        message: err.message || 'Error occurred while broadcasting batch notifications.',
      });
    } finally {
      setIsBroadcasting(false);
    }
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    if (!window.confirm('Delete this broadcast campaign record from the audit trail?')) return;
    try {
      const res = await fetch(`/api/sms/broadcast/campaigns/${campaignId}`, { method: 'DELETE' });
      if (res.ok) {
        setCampaigns((prev) => prev.filter((c) => c.id !== campaignId));
        if (selectedCampaignDetail?.id === campaignId) setSelectedCampaignDetail(null);
        if (showToast) showToast('Campaign record removed.');
      }
    } catch (err) {
      console.error('Failed to delete campaign:', err);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
    if (showToast) showToast('Copied to clipboard');
  };

  // Sample rendered preview for the handset mock
  const sampleClient = selectedRecipients[0] || activeClients[0] || {
    name: 'Chief Yerima (Client)',
    trackingId: 'TEMA-84920',
    origin: 'Lagos Hub',
    destination: 'Abuja HQ',
    currentLocation: 'Lokoja Highway Corridor',
    driverPhone: '0803 624 9911',
    driverName: 'Captain Musa',
  };

  const renderedPreviewText = messageTemplate
    .replace(/{{clientName}}/gi, sampleClient.name)
    .replace(/{{name}}/gi, sampleClient.name)
    .replace(/{{company}}/gi, sampleClient.company || sampleClient.name)
    .replace(/{{trackingId}}/gi, sampleClient.activeConsignment || 'TEMA-84920')
    .replace(/{{origin}}/gi, sampleClient.route ? sampleClient.route.split('➔')[0].trim() : 'Lagos Hub')
    .replace(/{{destination}}/gi, sampleClient.route ? sampleClient.route.split('➔')[1]?.trim() || 'Abuja HQ' : 'Abuja HQ')
    .replace(/{{currentLocation}}/gi, sampleClient.currentLocation || 'Lokoja Transit Hub')
    .replace(/{{driverPhone}}/gi, sampleClient.driverPhone || '0803 624 9911')
    .replace(/{{driverName}}/gi, sampleClient.driverName || 'Captain Musa')
    .replace(/{{hotline}}/gi, '0806 246 6212');

  const inTransitCount = activeClients.filter((c) => c.category === 'in_transit').length;
  const corporateCount = activeClients.filter((c) => c.category === 'corporate').length;
  const residentialCount = activeClients.filter((c) => c.category === 'residential').length;

  return (
    <div className="pt-8 space-y-8">
      {/* Top Header Card */}
      <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 border border-amber-400/30 rounded-full text-amber-300 text-xs font-bold tracking-wide">
              <Radio className="w-3.5 h-3.5 animate-pulse text-amber-400" />
              <span>Twilio SMS High-Availability Gateway</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <span>Batch Notifications & Logistics Delay Broadcast</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
              Broadcast instantaneous, mission-critical SMS updates to all active highway convoys, corporate clients, and residential movers simultaneously. Perfect for unexpected weather washouts, flash floods along the Lokoja corridor, and holiday transit schedules.
            </p>
          </div>

          {/* Key Metrics Pill Badges */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="bg-slate-950 border border-slate-800 px-4 py-3 rounded-2xl text-center min-w-[110px]">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Active Clients</span>
              <span className="text-xl font-black text-white">{activeClients.length}</span>
            </div>

            <div className="bg-slate-950 border border-amber-500/30 px-4 py-3 rounded-2xl text-center min-w-[110px]">
              <span className="text-amber-400 text-[10px] font-bold uppercase tracking-wider block">In-Transit</span>
              <span className="text-xl font-black text-amber-400">{inTransitCount}</span>
            </div>

            <div className="bg-slate-950 border border-slate-800 px-4 py-3 rounded-2xl text-center min-w-[110px]">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Campaigns</span>
              <span className="text-xl font-black text-white">{campaigns.length}</span>
            </div>
          </div>
        </div>

        {/* View Switcher Tabs: Compose vs History */}
        <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveSubView('compose')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeSubView === 'compose'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Broadcast Composer</span>
            </button>

            <button
              onClick={() => setActiveSubView('history')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeSubView === 'history'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Broadcast History ({campaigns.length})</span>
            </button>
          </div>

          <button
            onClick={fetchData}
            disabled={isLoading}
            className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors"
            title="Refresh clients & campaigns"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SUB-VIEW 1: BROADCAST COMPOSER */}
      {/* ======================================================== */}
      {activeSubView === 'compose' && (
        <div className="space-y-8">
          {/* Quick Rapid-Response Incident Presets */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>Rapid-Response Incident Presets (1-Click Fill)</span>
              </h3>
              <span className="text-xs text-slate-400">Click any preset to pre-fill the message</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {PRESET_TEMPLATES.map((preset) => {
                const Icon = preset.icon;
                const isSelected = messageTemplate === preset.template;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handleApplyTemplate(preset)}
                    className={`p-3.5 rounded-2xl border text-left transition-all group flex flex-col justify-between ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-400/80 shadow-md ring-1 ring-amber-400/30'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                          preset.urgency === 'high'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-slate-800 text-slate-300'
                        }`}>
                          {preset.category.replace('_', ' ')}
                        </span>
                        <Icon className="w-4 h-4 text-amber-400" />
                      </div>
                      <h4 className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                        {preset.name}
                      </h4>
                    </div>

                    <div className="pt-2 mt-2 border-t border-slate-900 text-[11px] text-slate-500 line-clamp-2">
                      {preset.template}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main 2-Column Workspace: Left = Audience & Recipients; Right = Message Composer & Phone Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column (5 Cols): Audience & Recipient Selection Table */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-5 shadow-xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-wider">
                    <Users className="w-4 h-4 text-amber-400" />
                    <span>Target Active Clients</span>
                  </h3>
                  <span className="text-xs font-bold px-2.5 py-1 bg-amber-500/20 border border-amber-400/40 rounded-full text-amber-400">
                    {selectedRecipients.length} Selected
                  </span>
                </div>

                {/* Audience Category Filter Tabs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
                  <button
                    onClick={() => setAudienceFilter('all_active')}
                    className={`py-1.5 text-[11px] font-bold rounded-xl transition-all ${
                      audienceFilter === 'all_active'
                        ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    All ({activeClients.length})
                  </button>
                  <button
                    onClick={() => setAudienceFilter('in_transit')}
                    className={`py-1.5 text-[11px] font-bold rounded-xl transition-all ${
                      audienceFilter === 'in_transit'
                        ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    In Transit ({inTransitCount})
                  </button>
                  <button
                    onClick={() => setAudienceFilter('corporate')}
                    className={`py-1.5 text-[11px] font-bold rounded-xl transition-all ${
                      audienceFilter === 'corporate'
                        ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Corporate ({corporateCount})
                  </button>
                  <button
                    onClick={() => setAudienceFilter('residential')}
                    className={`py-1.5 text-[11px] font-bold rounded-xl transition-all ${
                      audienceFilter === 'residential'
                        ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Home ({residentialCount})
                  </button>
                </div>

                {/* Search & Bulk Action Bar */}
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search name, phone, tracking #, route..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Showing {filteredClients.length} clients</span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleSelectAllFiltered}
                        className="text-amber-400 hover:underline font-bold text-[11px]"
                      >
                        Select All
                      </button>
                      <span className="text-slate-600">•</span>
                      <button
                        onClick={handleDeselectAllFiltered}
                        className="text-slate-400 hover:text-white text-[11px]"
                      >
                        Deselect All
                      </button>
                    </div>
                  </div>
                </div>

                {/* Clients Roster Scrollable List */}
                <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                  {filteredClients.length === 0 ? (
                    <div className="text-center py-10 bg-slate-950 rounded-2xl border border-slate-800 text-slate-500 text-xs">
                      No active clients matched your filter.
                    </div>
                  ) : (
                    filteredClients.map((client) => {
                      const isChecked = selectedClientIds.has(client.id);
                      return (
                        <div
                          key={client.id}
                          onClick={() => handleToggleClient(client.id)}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                            isChecked
                              ? 'bg-slate-950 border-amber-500/50 shadow-sm'
                              : 'bg-slate-950/60 border-slate-800/80 opacity-60 hover:opacity-100 hover:border-slate-700'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}} // Handled by parent div
                            className="mt-1 rounded text-amber-500 focus:ring-0 cursor-pointer"
                          />

                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="text-xs font-bold text-white truncate" title={client.name}>
                                {client.name}
                              </h4>
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 uppercase ${
                                client.category === 'in_transit'
                                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                  : client.category === 'corporate'
                                  ? 'bg-blue-500/20 text-blue-400'
                                  : 'bg-emerald-500/20 text-emerald-400'
                              }`}>
                                {client.category.replace('_', ' ')}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                              <Phone className="w-3 h-3 text-slate-500" />
                              <span>{client.phone}</span>
                              {client.activeConsignment && (
                                <>
                                  <span className="text-slate-600">•</span>
                                  <span className="text-amber-400/90 font-bold">{client.activeConsignment}</span>
                                </>
                              )}
                            </div>

                            {client.route && (
                              <p className="text-[10px] text-slate-500 truncate" title={client.route}>
                                🛣️ {client.route}
                              </p>
                            )}

                            {client.currentLocation && (
                              <p className="text-[10px] text-slate-400 italic truncate">
                                📍 {client.currentLocation}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Right Column (7 Cols): Broadcast Message Composer & Live Phone Handset Preview */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl space-y-6 shadow-xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <Radio className="w-4 h-4 text-amber-400" />
                    <span>SMS Message Broadcast Composer</span>
                  </h3>

                  <span className="text-xs text-slate-400">
                    Twilio REST Carrier Endpoint
                  </span>
                </div>

                {/* Campaign Title & Category Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">
                      Broadcast Campaign Title
                    </label>
                    <input
                      type="text"
                      value={broadcastTitle}
                      onChange={(e) => setBroadcastTitle(e.target.value)}
                      placeholder="e.g. Flash Flooding Transit Delay Notice"
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">
                      Incident Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as BatchSmsCategory)}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                    >
                      <option value="weather_delay">🌧️ Weather-Related Transit Delay</option>
                      <option value="system_update">📢 System-Wide Fleet Update</option>
                      <option value="traffic_reroute">🚧 Highway Rerouting & Gridlock</option>
                      <option value="emergency_notice">⚡ Emergency Cargo Delay Notice</option>
                      <option value="general">💬 General Service Advisory</option>
                    </select>
                  </div>
                </div>

                {/* Urgency Level Row */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">
                    Alert Urgency Tier
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setUrgency('high')}
                      className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
                        urgency === 'high'
                          ? 'bg-red-950/40 border-red-500 text-white font-bold ring-1 ring-red-500/40'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                      <div>
                        <div className="text-xs font-bold">🔴 High Alert</div>
                        <div className="text-[10px] text-slate-400">Prepend [URGENT] tag</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setUrgency('medium')}
                      className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
                        urgency === 'medium'
                          ? 'bg-amber-950/40 border-amber-500 text-white font-bold ring-1 ring-amber-500/40'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Radio className="w-4 h-4 text-amber-400 shrink-0" />
                      <div>
                        <div className="text-xs font-bold">🟡 Standard</div>
                        <div className="text-[10px] text-slate-400">Normal operational notice</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setUrgency('low')}
                      className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
                        urgency === 'low'
                          ? 'bg-emerald-950/40 border-emerald-500 text-white font-bold ring-1 ring-emerald-500/40'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div>
                        <div className="text-xs font-bold">🟢 Informational</div>
                        <div className="text-[10px] text-slate-400">Courtesy bulletin</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Merge Variable Tags Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Dynamic Personalization Tags (Click to Insert):
                    </span>
                    <span className="text-[11px] text-slate-500">Auto-resolved per client</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {MERGE_TAGS.map((tag) => (
                      <button
                        key={tag.tag}
                        type="button"
                        onClick={() => handleInsertTag(tag.tag)}
                        className="px-2.5 py-1 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-amber-400/50 rounded-lg text-xs font-mono text-amber-400 transition-colors flex items-center gap-1.5 group"
                        title={tag.desc}
                      >
                        <span>{tag.tag}</span>
                        <span className="text-[10px] text-slate-500 group-hover:text-slate-300">({tag.label})</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message Textarea */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      SMS Broadcast Body Content
                    </label>
                    <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2">
                      <span className={charCount > 160 ? 'text-amber-400 font-bold' : 'text-slate-300'}>
                        {charCount} characters
                      </span>
                      <span>•</span>
                      <span className={smsSegments > 1 ? 'text-amber-400 font-bold' : 'text-emerald-400'}>
                        {smsSegments} SMS Segment{smsSegments > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  <textarea
                    ref={textareaRef}
                    rows={5}
                    value={messageTemplate}
                    onChange={(e) => setMessageTemplate(e.target.value)}
                    placeholder="Enter broadcast message text..."
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400 font-sans leading-relaxed resize-y"
                  />
                </div>

                {/* Live Smartphone Handset Preview */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-bold flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                      <span>Live Client Mobile Handset Preview (Sample: {sampleClient.name})</span>
                    </span>
                    <span className="font-mono text-slate-500">Sender: PYDA</span>
                  </div>

                  <div className="bg-slate-900/90 border border-slate-800/80 p-4 rounded-xl relative">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center text-xs shrink-0 shadow-md">
                        PM
                      </div>
                      <div className="space-y-1 text-xs text-slate-200 leading-relaxed font-sans">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">Pyda Movers Dispatch</span>
                          <span className="text-[10px] text-slate-500 font-mono">Now</span>
                        </div>
                        <p className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-200 text-xs leading-relaxed">
                          {urgency === 'high' && !renderedPreviewText.toLowerCase().includes('urgent') && (
                            <span className="text-red-400 font-bold block mb-1">[URGENT LOGISTICS ADVISORY]</span>
                          )}
                          {renderedPreviewText}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Controls: Pre-Flight Test & Trigger Broadcast Button */}
                <div className="pt-4 border-t border-slate-800 space-y-4">
                  {/* Pre-flight test send form */}
                  <form onSubmit={handleSendTest} className="flex flex-col sm:flex-row items-center gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-800">
                    <div className="flex-1 w-full relative">
                      <Phone className="w-3.5 h-3.5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Admin Phone for Pre-flight Test..."
                        value={testPhone}
                        onChange={(e) => setTestPhone(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSendingTest || !testPhone.trim()}
                      className="w-full sm:w-auto px-4 py-2 bg-slate-850 hover:bg-slate-800 text-amber-400 font-bold text-xs rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2 whitespace-nowrap active:scale-95 disabled:opacity-50"
                    >
                      {isSendingTest ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      <span>Send Pre-flight Test SMS</span>
                    </button>
                  </form>

                  {testResult && (
                    <div className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
                      testResult.success
                        ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                        : 'bg-red-950/30 border-red-500/40 text-red-300'
                    }`}>
                      {testResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                      <span>{testResult.message}</span>
                    </div>
                  )}

                  {/* Primary Trigger Broadcast Button */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-xs text-slate-400">
                      Targeting <strong className="text-amber-400">{selectedRecipients.length}</strong> active client{selectedRecipients.length !== 1 ? 's' : ''} simultaneously via <strong className="text-white">Twilio REST Gateway</strong>.
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowConfirmModal(true)}
                      disabled={selectedRecipients.length === 0 || isBroadcasting}
                      className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-sm rounded-2xl shadow-xl hover:shadow-amber-500/20 flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Radio className="w-4 h-4 animate-pulse" />
                      <span>Broadcast Batch SMS Now ({selectedRecipients.length})</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-VIEW 2: BROADCAST CAMPAIGNS AUDIT TRAIL */}
      {/* ======================================================== */}
      {activeSubView === 'history' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-400" />
                  <span>Batch Broadcast Audit Log</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Complete history of system-wide and weather delay broadcasts dispatched via Twilio to client handsets.
                </p>
              </div>

              <span className="text-xs font-mono text-slate-500">
                {campaigns.length} Recorded Campaigns
              </span>
            </div>

            {/* Campaigns Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Campaign & Category</th>
                    <th className="py-3 px-4">Urgency</th>
                    <th className="py-3 px-4">Audience</th>
                    <th className="py-3 px-4">Recipients</th>
                    <th className="py-3 px-4">Delivery Rate</th>
                    <th className="py-3 px-4">Dispatched At</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {campaigns.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-slate-500">
                        No batch broadcasts recorded yet.
                      </td>
                    </tr>
                  ) : (
                    campaigns.map((camp) => (
                      <tr key={camp.id} className="hover:bg-slate-850/50 transition-colors">
                        <td className="py-4 px-4 space-y-1">
                          <div className="font-bold text-white flex items-center gap-2">
                            <span>{camp.title}</span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-500 block">
                            ID: {camp.id} • {camp.category}
                          </span>
                        </td>

                        <td className="py-4 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            camp.urgency === 'high'
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : camp.urgency === 'medium'
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-emerald-500/20 text-emerald-400'
                          }`}>
                            {camp.urgency}
                          </span>
                        </td>

                        <td className="py-4 px-4 font-mono text-slate-300 capitalize">
                          {camp.targetAudience.replace('_', ' ')}
                        </td>

                        <td className="py-4 px-4 font-bold text-white">
                          {camp.totalRecipients} clients
                        </td>

                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-emerald-400 font-mono">
                              {camp.successfulDispatches}/{camp.totalRecipients}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              ({Math.round((camp.successfulDispatches / (camp.totalRecipients || 1)) * 100)}%)
                            </span>
                          </div>
                        </td>

                        <td className="py-4 px-4 text-slate-400 text-[11px] font-mono">
                          {new Date(camp.dispatchedAt).toLocaleString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>

                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setSelectedCampaignDetail(camp)}
                              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
                              title="View details & recipients"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleCopy(camp.messageTemplate, camp.id)}
                              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
                              title="Copy message text"
                            >
                              {copiedKey === camp.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>

                            <button
                              onClick={() => handleDeleteCampaign(camp.id)}
                              className="p-1.5 bg-red-950/40 hover:bg-red-900 text-red-300 rounded-lg text-xs"
                              title="Delete campaign"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* CONFIRMATION MODAL BEFORE BROADCAST COMMIT */}
      {/* ======================================================== */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 max-w-lg w-full rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setShowConfirmModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
                <Radio className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="text-xl font-black text-white tracking-tight">
                Confirm Batch SMS Broadcast
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                You are about to broadcast this logistics alert to <strong className="text-amber-400">{selectedRecipients.length} active clients</strong> simultaneously via the Twilio SMS Gateway.
              </p>
            </div>

            {/* Summary details */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-850">
                <span className="text-slate-400">Campaign Title:</span>
                <span className="font-bold text-white">{broadcastTitle}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-850">
                <span className="text-slate-400">Incident Category:</span>
                <span className="font-bold text-amber-400 capitalize">{category.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-850">
                <span className="text-slate-400">Total Recipients:</span>
                <span className="font-bold text-white font-mono">{selectedRecipients.length} Client Handsets</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Carrier Route:</span>
                <span className="font-bold text-emerald-400">Twilio High-Availability Carrier</span>
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 italic max-h-28 overflow-y-auto">
              "{messageTemplate}"
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleExecuteBatchBroadcast}
                disabled={isBroadcasting}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center gap-2 active:scale-95"
              >
                {isBroadcasting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>Confirm & Dispatch Broadcast</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* CAMPAIGN DETAIL MODAL */}
      {/* ======================================================== */}
      {selectedCampaignDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 max-w-2xl w-full rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedCampaignDetail(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-400/30">
                <span>{selectedCampaignDetail.category.replace('_', ' ')}</span>
              </div>
              <h3 className="text-xl font-black text-white">
                {selectedCampaignDetail.title}
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                ID: {selectedCampaignDetail.id} • Dispatched At: {new Date(selectedCampaignDetail.dispatchedAt).toLocaleString('en-GB')}
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Message Content</h4>
              <p className="text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-wrap">
                {selectedCampaignDetail.messageTemplate}
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between">
                <span>Dispatched Recipient Handsets ({selectedCampaignDetail.recipientsPreview?.length || 0})</span>
                <span className="text-emerald-400 font-mono">
                  {selectedCampaignDetail.successfulDispatches} Delivered
                </span>
              </h4>

              <div className="divide-y divide-slate-800 border border-slate-800 rounded-2xl overflow-hidden bg-slate-950">
                {selectedCampaignDetail.recipientsPreview?.map((rec, idx) => (
                  <div key={idx} className="p-3 text-xs flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <span className="font-bold text-white block">{rec.name}</span>
                      <span className="text-slate-400 font-mono text-[11px]">{rec.phone}</span>
                      {rec.route && <span className="text-[10px] text-slate-500 block">Route: {rec.route}</span>}
                    </div>

                    <div className="text-right space-y-0.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400">
                        {rec.status}
                      </span>
                      {rec.sid && <span className="text-[10px] font-mono text-slate-500 block">SID: {rec.sid}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
