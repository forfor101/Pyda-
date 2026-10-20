import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Key, 
  FileText, 
  DollarSign, 
  Truck, 
  Building2, 
  Phone, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  RotateCw,
  Edit3, 
  Save, 
  Plus, 
  X, 
  TrendingUp, 
  Users, 
  Layers, 
  BellRing,
  Eye,
  EyeOff,
  LogOut,
  MapPin,
  Image as ImageIcon,
  Upload,
  Globe,
  Trash2,
  Check,
  Share2,
  Copy,
  Sparkles,
  ExternalLink,
  HelpCircle,
  Database,
  ArrowRight,
  Briefcase,
  UserCheck,
  KeyRound,
  Mail,
  Camera
} from 'lucide-react';
import { useCms, MediaItem, DEFAULT_CMS_CONFIG, DEFAULT_ADMIN_PASSKEY } from '../context/CmsContext';
import { ImagePicker } from './ImagePicker';
import { AdminPasskeyRecoveryModal } from './AdminPasskeyRecoveryModal';
import { AdminSecurityTab } from './AdminSecurityTab';
import { AdminEmailTab } from './AdminEmailTab';
import { AdminVideoTab } from './AdminVideoTab';
import { AdminNewsletterTab } from './AdminNewsletterTab';
import { AdminSeoTab } from './AdminSeoTab';
import { AdminSmsTab } from './AdminSmsTab';
import { AdminBatchNotificationsTab } from './AdminBatchNotificationsTab';
import { AdminInvestorFleetTab } from './AdminInvestorFleetTab';
import { AdminLeadConversionTab } from './AdminLeadConversionTab';
import { AdminDispatchLiveMap } from './AdminDispatchLiveMap';
import { INITIAL_REGISTERED_FLEET } from '../data/activeFleetData';
import registeredSignImg from '../assets/images/registered_trademark_sign_1790283777721.jpg';
import { QuoteRequestData, ServiceType, ServiceDetail, OfficeLocation, ShipmentTrackStatus, JobOpening, JobApplication, JobCategory } from '../types';
import { MockEmailPreviewModal, EmailTemplateType, MockApplicantData } from './MockEmailPreviewModal';

interface AdminDashboardProps {
  onBackToSite: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToSite }) => {
  const {
    cms,
    updateHero,
    updateCompany,
    updateServices,
    updateService,
    addService,
    deleteService,
    updateBranches,
    updateBranch,
    addBranch,
    deleteBranch,
    updateTestimonials,
    addTestimonial,
    deleteTestimonial,
    updatePricing,
    updateAbout,
    updateAnnouncement,
    addMedia,
    deleteMedia,
    updateShipments,
    updateShipment,
    addShipment,
    deleteShipment,
    advanceShipmentSimulation,
    updateJobOpenings,
    updateJobOpening,
    addJobOpening,
    deleteJobOpening,
    updateJobApplications,
    updateJobApplicationStatus,
    deleteJobApplication,
    updateSecurity,
    verifyPasskey,
    updateLogisticsExperts,
    updateLogisticsExpert,
    addLogisticsExpert,
    deleteLogisticsExpert,
    resetPasskey,
    recordSecurityLog,
    resetToDefaults,
    exportJson,
    importJson,
    saveToServer,
    isLoading: isSavingServer
  } = useCms();

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('megatrend_admin_session') === 'true' || localStorage.getItem('tema_admin_session') === 'true';
  });
  const [passkeyInput, setPasskeyInput] = useState('');
  const [showPasskey, setShowPasskey] = useState(false);
  const [passkeyError, setPasskeyError] = useState('');
  const [failedAttemptCount, setFailedAttemptCount] = useState(0);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    'media' | 'hero' | 'services' | 'branches' | 'testimonials' | 'videos' | 'pricing' | 'about' | 'company' | 'announcement' | 'shipments' | 'dispatch_map' | 'quotes' | 'careers' | 'investor_fleet' | 'lead_conversions' | 'newsletter' | 'email' | 'sms' | 'batch_notifications' | 'security' | 'seo' | 'system'
  >('media');

  // Resending quote email state
  const [resendingQuoteId, setResendingQuoteId] = useState<string | null>(null);

  // Careers & Job Openings State
  const [careersSubTab, setCareersSubTab] = useState<'openings' | 'applications'>('openings');
  const [editingJob, setEditingJob] = useState<JobOpening | null>(null);
  const [isNewJobOpen, setIsNewJobOpen] = useState(false);
  const [jobSearchQuery, setJobSearchQuery] = useState('');
  const [selectedApp, setSelectedApp] = useState<JobApplication | null>(null);
  const [appStatusFilter, setAppStatusFilter] = useState<string>('all');
  const [appSearchQuery, setAppSearchQuery] = useState('');

  // Shipment Dispatch State
  const [editingShipment, setEditingShipment] = useState<ShipmentTrackStatus | null>(null);
  const [isNewShipmentOpen, setIsNewShipmentOpen] = useState(false);
  const [shipmentSearch, setShipmentSearch] = useState('');
  const [shipmentFilterStatus, setShipmentFilterStatus] = useState('all');

  // Mock Email Preview Modal State
  const [emailPreviewModalOpen, setEmailPreviewModalOpen] = useState(false);
  const [emailPreviewTemplate, setEmailPreviewTemplate] = useState<EmailTemplateType>('quote_confirmation');
  const [emailPreviewQuote, setEmailPreviewQuote] = useState<QuoteRequestData | null>(null);
  const [emailPreviewShipment, setEmailPreviewShipment] = useState<ShipmentTrackStatus | null>(null);
  const [emailPreviewApplicant, setEmailPreviewApplicant] = useState<MockApplicantData | null>(null);

  const handleOpenEmailPreview = (
    template: EmailTemplateType = 'quote_confirmation',
    quote: QuoteRequestData | null = null,
    shipment: ShipmentTrackStatus | null = null,
    applicant: MockApplicantData | null = null
  ) => {
    setEmailPreviewTemplate(template);
    setEmailPreviewQuote(quote);
    setEmailPreviewShipment(shipment);
    setEmailPreviewApplicant(applicant);
    setEmailPreviewModalOpen(true);
  };

  // Quotes state
  const [quotes, setQuotes] = useState<QuoteRequestData[]>([]);
  const [loadingQuotes, setLoadingQuotes] = useState(false);
  const [quoteSearchQuery, setQuoteSearchQuery] = useState('');
  const [quoteStatusFilter, setQuoteStatusFilter] = useState<string>('all');
  const [selectedQuote, setSelectedQuote] = useState<QuoteRequestData | null>(null);

  // Toast notifications
  const [toastMsg, setToastMsg] = useState('');
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  // Media Library tab states
  const [mediaCategoryFilter, setMediaCategoryFilter] = useState<string>('all');
  const [mediaSearch, setMediaSearch] = useState('');
  const [dragOverMedia, setDragOverMedia] = useState(false);
  const fileUploadInputRef = useRef<HTMLInputElement>(null);

  // Quotes fetch
  const fetchQuotes = async () => {
    setLoadingQuotes(true);
    try {
      const res = await fetch('/api/quotes');
      if (res.ok) {
        const data = await res.json();
        if (data && data.quotes) {
          setQuotes(data.quotes);
        }
      }
    } catch (err) {
      console.warn('Could not fetch server quotes', err);
    } finally {
      setLoadingQuotes(false);
    }
  };

  const handleResendQuoteEmail = async (quoteId: string, email: string) => {
    setResendingQuoteId(quoteId);
    try {
      const res = await fetch(`/api/email/resend-quote/${quoteId}`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast(`Quotation confirmation email successfully resent to ${email}`);
      } else {
        showToast(data.error || 'Failed to resend quotation email');
      }
    } catch (err) {
      showToast('Error connecting to email delivery engine');
    } finally {
      setResendingQuoteId(null);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchQuotes();
    }
  }, [isAuthenticated]);

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const currentFails = failedAttemptCount;
    const isSuccess = verifyPasskey(passkeyInput, {
      method: 'admin_modal',
      source: '/admin-portal',
      consecutiveFails: currentFails,
    });

    if (isSuccess) {
      setIsAuthenticated(true);
      localStorage.setItem('megatrend_admin_session', 'true');
      setPasskeyError('');
      setFailedAttemptCount(0);
      showToast('Welcome to Pyda Movers Site CMS Management Studio!');
    } else {
      const nextFails = currentFails + 1;
      setFailedAttemptCount(nextFails);
      if (nextFails >= 3) {
        setPasskeyError(`Invalid Admin Passkey (${nextFails} consecutive failed attempts recorded). Security audit event logged to server with client metadata. Click "Forgot Passkey / Reset" if you need recovery.`);
      } else {
        setPasskeyError('Invalid Admin Passkey. Access denied & attempt logged to security audit.');
      }
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('megatrend_admin_session');
    localStorage.removeItem('tema_admin_session');
  };

  // Multiple File Upload Handler in Media Gallery
  const handleMultipleFilesUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    let addedCount = 0;
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      if (file.size > 15 * 1024 * 1024) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const sizeFormatted = `${(file.size / (1024 * 1024)).toFixed(2)} MB`;

        addMedia({
          name: file.name.replace(/\.[^/.]+$/, ''),
          url: dataUrl,
          category: 'general',
          sizeFormatted,
        });
        addedCount++;
        if (addedCount === files.length) {
          showToast(`Successfully uploaded ${addedCount} photo(s) to Media Library!`);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Quick Assign Media helper
  const handleAssignMedia = (itemUrl: string, target: string) => {
    if (target === 'hero') {
      updateHero({ bgImageUrl: itemUrl });
      showToast('Updated Hero background photo!');
    } else if (target === 'about_hero') {
      updateAbout({ heroImage: itemUrl });
      showToast('Updated About Us banner photo!');
    } else if (target === 'svc_corporate') {
      updateService('corporate', { fullDesc: cms.services.find(s => s.id === 'corporate')?.fullDesc });
      showToast('Assigned photo to Corporate Relocation!');
    }
  };

  // Quote status update
  const handleUpdateQuoteStatus = async (quoteId: string, newStatus: any) => {
    try {
      await fetch(`/api/quotes/${quoteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      setQuotes((prev) =>
        prev.map((q) => (q.id === quoteId ? { ...q, status: newStatus } : q))
      );
      if (selectedQuote && selectedQuote.id === quoteId) {
        setSelectedQuote((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
      showToast(`Quote #${quoteId} status updated to ${newStatus.toUpperCase()}`);
    } catch (err) {
      showToast('Failed to update quote status.');
    }
  };

  // Export & Import backup JSON
  const handleDownloadBackup = () => {
    const jsonStr = exportJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pyda-movers-site-cms-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Downloaded complete website configuration JSON!');
  };

  const handleUploadBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      const success = importJson(content);
      if (success) {
        showToast('Successfully restored website configuration from backup!');
      } else {
        alert('Failed to parse backup JSON file.');
      }
    };
    reader.readAsText(file);
  };

  // Save to Server helper
  const handleSaveToServer = async () => {
    const success = await saveToServer();
    if (success) {
      showToast('Site CMS changes published & synced to cloud server!');
    } else {
      showToast('Saved locally in browser storage (server offline or mock mode).');
    }
  };

  // ----------------------------------------------------
  // LOGIN SCREEN (If not authenticated)
  // ----------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        {/* Passkey Recovery Modal */}
        <AdminPasskeyRecoveryModal
          isOpen={isForgotModalOpen}
          onClose={() => setIsForgotModalOpen(false)}
          onSuccessLogin={(newKey) => {
            setPasskeyInput(newKey);
            setIsAuthenticated(true);
            localStorage.setItem('megatrend_admin_session', 'true');
            setIsForgotModalOpen(false);
            showToast('Admin session unlocked with updated passkey!');
          }}
        />

        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mx-auto border border-amber-500/30 shadow-inner">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-2xl font-black text-white">Pyda Movers CMS</h1>
              <img
                src={registeredSignImg}
                alt="Registered Sign"
                referrerPolicy="no-referrer"
                className="w-5 h-5 rounded-full object-cover ring-1 ring-amber-400/40 shadow-sm"
                title="Registered Trademark"
              />
            </div>
            <p className="text-xs text-slate-400">
              Admin Portal: Upload Photos, Edit Pages, Dispatch Fleet & Manage Content
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Admin Master Passkey
                </label>
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(true)}
                  className="text-[11px] font-bold text-amber-400 hover:text-amber-300 hover:underline flex items-center gap-1"
                >
                  <KeyRound className="w-3 h-3" />
                  <span>Forgot Passkey?</span>
                </button>
              </div>

              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPasskey ? 'text' : 'password'}
                  required
                  placeholder="Enter admin passkey..."
                  value={passkeyInput}
                  onChange={(e) => setPasskeyInput(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPasskey(!showPasskey)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  title={showPasskey ? 'Hide passkey' : 'Show passkey'}
                >
                  {showPasskey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passkeyError && (
                <div className="p-2.5 bg-red-950/40 border border-red-800/60 rounded-xl mt-2 text-xs text-red-400 flex items-start gap-1.5 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{passkeyError}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
            >
              <Key className="w-4 h-4 stroke-[2.5]" />
              <span>Unlock Admin Controls</span>
            </button>
          </form>

          {/* Quick reset / forgot password callout */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between text-xs">
            <span className="text-slate-400 text-[11px]">Need to reset your credentials?</span>
            <button
              type="button"
              onClick={() => setIsForgotModalOpen(true)}
              className="text-amber-400 hover:text-amber-300 font-black text-[11px] hover:underline flex items-center gap-1"
            >
              <RotateCw className="w-3 h-3" />
              <span>Reset Options (Email OTP / Q&A)</span>
            </button>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 text-slate-500">
              <Lock className="w-3 h-3 text-slate-500" />
              <span>Authorized personnel only</span>
            </span>
            <button
              onClick={onBackToSite}
              className="text-slate-300 hover:text-white font-bold underline"
            >
              Return to Website
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // AUTHENTICATED ADMIN DASHBOARD
  // ----------------------------------------------------
  const filteredMedia = cms.mediaLibrary.filter((item) => {
    const matchesCat = mediaCategoryFilter === 'all' || item.category === mediaCategoryFilter;
    const matchesSearch = item.name.toLowerCase().includes(mediaSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-24">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-500 text-slate-950 font-black text-xs px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 stroke-[3]" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Admin Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black shadow-md">
              <Truck className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-base text-white tracking-tight uppercase flex items-center gap-1.5">
                  Pyda Movers <span className="text-amber-400">CMS</span>
                  <img
                    src={registeredSignImg}
                    alt="Registered Sign"
                    referrerPolicy="no-referrer"
                    className="w-3.5 h-3.5 rounded-full object-cover ring-1 ring-amber-400/40"
                    title="Registered Trademark"
                  />
                </span>
                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-500/30">
                  LIVE EDIT MODE
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Full site content, photo uploader & CRM management
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleSaveToServer}
              disabled={isSavingServer}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSavingServer ? 'Publishing...' : 'Save & Publish Live'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleOpenEmailPreview('quote_confirmation')}
              className="px-3.5 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
              title="Preview automated client email notifications before dispatch"
            >
              <Mail className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mock Email Preview</span>
            </button>

            <button
              onClick={onBackToSite}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all"
            >
              <Eye className="w-3.5 h-3.5 text-amber-400" />
              <span>View Website</span>
            </button>

            <button
              onClick={handleLogout}
              className="px-3 py-2 bg-slate-900 hover:bg-red-950/50 text-slate-400 hover:text-red-400 font-bold text-xs rounded-xl border border-slate-800 transition-colors flex items-center gap-1"
              title="Logout from Admin"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main CMS Workspace */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-6">
        
        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none border-b border-slate-800">
          {[
            { id: 'media', label: '📸 Photo Uploader & Media', count: cms.mediaLibrary.length },
            { id: 'hero', label: '🏠 Hero & Home Page' },
            { id: 'services', label: '🏢 Services (4 Core)', count: cms.services.length },
            { id: 'branches', label: '🗺️ Branches & Coverage', count: cms.branches.length },
            { id: 'testimonials', label: '⭐ Testimonials', count: cms.testimonials.length },
            { id: 'videos', label: '🎥 Video Tours & Proof', count: cms.videoShowcase?.length || 4 },
            { id: 'pricing', label: '💰 Pricing Rates', count: cms.pricing.length },
            { id: 'about', label: '📖 About & Fleet Showcase' },
            { id: 'company', label: '📞 Hotlines & Footer' },
            { id: 'announcement', label: '📢 Site Announcement Bar' },
            { id: 'shipments', label: '🛰️ Fleet GPS & Tracking', count: cms.shipments?.length || 0 },
            { id: 'dispatch_map', label: '🗺️ Dispatch Live Map', count: INITIAL_REGISTERED_FLEET.length },
            { id: 'quotes', label: '📥 Customer Quotes', count: quotes.length },
            { id: 'lead_conversions', label: '📊 WhatsApp Lead Conversions' },
            { id: 'careers', label: '💼 Careers & Driver Jobs', count: (cms.jobOpenings?.length || 0) + (cms.jobApplications?.length || 0) },
            { id: 'investor_fleet', label: '🚛 Investor Fleet & Surveys' },
            { id: 'newsletter', label: '📬 Mailing List & Newsletter', count: cms.newsletterSubscribers?.length || 0 },
            { id: 'email', label: '📧 Email Service & Logs' },
            { id: 'sms', label: '📱 SMS Alerts & Twilio' },
            { id: 'batch_notifications', label: '📢 Batch Notifications & Weather Alerts' },
            { id: 'security', label: '🔐 Security & Passkey' },
            { id: 'seo', label: '🔍 SEO & Sitemap XML' },
            { id: 'system', label: '⚙️ Backup & Reset' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 shrink-0 border ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-black'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-850 hover:text-white'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                      isActive ? 'bg-slate-950 text-amber-400 font-bold' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ==================================================== */}
        {/* TAB 1: MEDIA LIBRARY & PHOTO UPLOADER */}
        {/* ==================================================== */}
        {activeTab === 'media' && (
          <div className="pt-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-amber-400" />
                  <span>Central Media Gallery & Photo Uploader</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1 max-w-xl">
                  Upload high-resolution photos of fleet trucks, warehouse facilities, corporate relocations, and team staff. Photos are saved persistently and can be attached to any section or page with one click.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <input
                  ref={fileUploadInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleMultipleFilesUpload(e.target.files)}
                />
                <button
                  onClick={() => fileUploadInputRef.current?.click()}
                  className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center gap-2 transition-all active:scale-95"
                >
                  <Upload className="w-4 h-4 stroke-[2.5]" />
                  <span>Upload Photos from Device</span>
                </button>
              </div>
            </div>

            {/* Drag and Drop Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverMedia(true);
              }}
              onDragLeave={() => setDragOverMedia(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOverMedia(false);
                handleMultipleFilesUpload(e.dataTransfer.files);
              }}
              onClick={() => fileUploadInputRef.current?.click()}
              className={`p-8 rounded-3xl border-2 border-dashed text-center cursor-pointer transition-all ${
                dragOverMedia
                  ? 'border-amber-400 bg-amber-500/10'
                  : 'border-slate-800 hover:border-amber-500/40 bg-slate-900/40'
              }`}
            >
              <Upload className="w-8 h-8 text-amber-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-white">Drag & drop multiple photos here or click to browse</p>
              <p className="text-xs text-slate-500 mt-1">Supports JPG, PNG, WebP (up to 15MB each)</p>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
                {['all', 'hero', 'fleet', 'services', 'branches', 'warehouse', 'team', 'general'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setMediaCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider capitalize transition-colors ${
                      mediaCategoryFilter === cat
                        ? 'bg-amber-500 text-slate-950 font-black'
                        : 'bg-slate-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search photo title..."
                  value={mediaSearch}
                  onChange={(e) => setMediaSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Media Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredMedia.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden group hover:border-slate-700 transition-all flex flex-col justify-between shadow-md"
                >
                  <div className="relative aspect-video overflow-hidden bg-slate-950">
                    <img
                      src={item.url}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-2 left-2">
                      <span className="bg-slate-950/80 backdrop-blur px-2 py-0.5 rounded text-[10px] font-bold text-amber-400 uppercase border border-slate-800">
                        {item.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    <div>
                      <h4 className="text-xs font-bold text-white truncate" title={item.name}>
                        {item.name}
                      </h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {item.sizeFormatted} • {item.uploadedAt}
                      </p>
                    </div>

                    {/* Quick Assign Dropdown */}
                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-1.5">
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            handleAssignMedia(item.url, e.target.value);
                            e.target.value = '';
                          }
                        }}
                        defaultValue=""
                        className="bg-slate-950 border border-slate-800 text-slate-300 text-[11px] rounded-lg px-2 py-1.5 focus:outline-none focus:border-amber-400"
                      >
                        <option value="" disabled>
                          Assign Photo To...
                        </option>
                        <option value="hero">Hero Banner Background</option>
                        <option value="about_hero">About Us Facility Banner</option>
                        <option value="svc_corporate">Corporate Relocation Service</option>
                      </select>

                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(item.url);
                          showToast('Photo URL copied to clipboard!');
                        }}
                        className="p-1.5 bg-slate-800 text-slate-300 hover:text-white rounded-lg"
                        title="Copy Photo URL"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => deleteMedia(item.id)}
                        className="p-1.5 bg-red-950/50 hover:bg-red-900 text-red-300 rounded-lg"
                        title="Delete photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 2: HERO & HOME PAGE EDITOR */}
        {/* ==================================================== */}
        {activeTab === 'hero' && (
          <div className="pt-8 space-y-8">
            <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl space-y-6">
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-400" />
                <span>Hero & Homepage Main Banner Settings</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">
                    Top Badge Text
                  </label>
                  <input
                    type="text"
                    value={cms.hero.badgeText}
                    onChange={(e) => updateHero({ badgeText: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">
                    Primary Button Label
                  </label>
                  <input
                    type="text"
                    value={cms.hero.primaryBtnText}
                    onChange={(e) => updateHero({ primaryBtnText: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">
                    Main Headline (First Line)
                  </label>
                  <input
                    type="text"
                    value={cms.hero.headlinePrefix}
                    onChange={(e) => updateHero({ headlinePrefix: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">
                    Headline Highlight (Amber Gradient)
                  </label>
                  <input
                    type="text"
                    value={cms.hero.headlineGradient}
                    onChange={(e) => updateHero({ headlineGradient: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">
                  Hero Sub-Headline Paragraph
                </label>
                <textarea
                  rows={3}
                  value={cms.hero.subHeadline}
                  onChange={(e) => updateHero({ subHeadline: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Hero Photo Picker */}
              <div className="pt-4 border-t border-slate-800">
                <ImagePicker
                  label="Hero Background Photo"
                  value={cms.hero.bgImageUrl}
                  onChange={(url) => updateHero({ bgImageUrl: url })}
                  category="hero"
                  helperText="High-resolution wide image recommended"
                />
              </div>

              {/* Stats Counters */}
              <div className="pt-6 border-t border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider text-amber-400">
                  Key Statistics Counters (Hero Badges)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {cms.hero.stats.map((stat, idx) => (
                    <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                      <input
                        type="text"
                        value={stat.value}
                        onChange={(e) => {
                          const updated = [...cms.hero.stats];
                          updated[idx].value = e.target.value;
                          updateHero({ stats: updated });
                        }}
                        className="w-full font-black text-amber-400 text-lg bg-slate-900 px-2.5 py-1 rounded border border-slate-800"
                      />
                      <input
                        type="text"
                        value={stat.label}
                        onChange={(e) => {
                          const updated = [...cms.hero.stats];
                          updated[idx].label = e.target.value;
                          updateHero({ stats: updated });
                        }}
                        className="w-full text-xs text-slate-300 bg-slate-900 px-2.5 py-1 rounded border border-slate-800"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 3: SERVICES & SOLUTIONS EDITOR */}
        {/* ==================================================== */}
        {activeTab === 'services' && (
          <div className="pt-8 space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-white">Logistics & Moving Services Editor</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Edit service titles, detailed descriptions, custom photos, feature bullet points, and process steps.
                </p>
              </div>
            </div>

            <div className="space-y-8">
              {cms.services.map((svc) => (
                <div key={svc.id} className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-amber-500 text-slate-950 font-black">
                        <Truck className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">{svc.title}</h3>
                        <span className="text-xs font-mono text-amber-400">ID: {svc.id}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">
                        Service Title
                      </label>
                      <input
                        type="text"
                        value={svc.title}
                        onChange={(e) => updateService(svc.id, { title: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">
                        Service Tagline
                      </label>
                      <input
                        type="text"
                        value={svc.tagline}
                        onChange={(e) => updateService(svc.id, { tagline: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">
                      Detailed Service Description
                    </label>
                    <textarea
                      rows={3}
                      value={svc.fullDesc}
                      onChange={(e) => updateService(svc.id, { fullDesc: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  {/* Service Photo Upload */}
                  <div>
                    <ImagePicker
                      label={`Photo for ${svc.title}`}
                      value={svc.imageUrl || 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200&auto=format&fit=crop&q=80'}
                      onChange={(url) => updateService(svc.id, { imageUrl: url })}
                      category="services"
                    />
                  </div>

                  {/* Bullet points */}
                  <div className="pt-4 border-t border-slate-800 space-y-3">
                    <label className="block text-xs font-bold text-amber-400 uppercase">
                      Key Features / Bullet Points
                    </label>
                    <div className="space-y-2">
                      {svc.features.map((feat, fIdx) => (
                        <div key={fIdx} className="flex gap-2">
                          <input
                            type="text"
                            value={feat}
                            onChange={(e) => {
                              const newFeatures = [...svc.features];
                              newFeatures[fIdx] = e.target.value;
                              updateService(svc.id, { features: newFeatures });
                            }}
                            className="flex-1 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newFeatures = svc.features.filter((_, i) => i !== fIdx);
                              updateService(svc.id, { features: newFeatures });
                            }}
                            className="p-2 bg-red-950/40 text-red-400 hover:bg-red-900 rounded-xl"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          updateService(svc.id, { features: [...svc.features, 'New capability feature'] });
                        }}
                        className="text-xs text-amber-400 font-bold hover:underline flex items-center gap-1 mt-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add feature item</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 4: BRANCHES & PAN-AFRICA LOCATIONS */}
        {/* ==================================================== */}
        {activeTab === 'branches' && (
          <div className="pt-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-white">Branch & Regional Coverage Editor</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Manage headquarters in Abuja, Lagos hub, state terminals, and international cross-border hubs.
                </p>
              </div>
              <button
                onClick={() => {
                  const newBranch: OfficeLocation = {
                    id: `branch-${Date.now()}`,
                    city: 'New Branch City',
                    type: 'branch',
                    address: 'Enter street address & estate',
                    phones: ['08062466212'],
                    email: 'branch@pydamovers.com',
                    stateCountry: 'State, Nigeria',
                    region: 'Nigeria',
                    coordinates: { lat: 9.0, lng: 7.0 },
                    hours: 'Mon - Sat: 8:00 AM - 5:30 PM',
                  };
                  addBranch(newBranch);
                  showToast('New branch card added!');
                }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Add Branch</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {cms.branches.map((branch) => (
                <div key={branch.id} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-md">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-amber-400" />
                      <span className="font-bold text-white">{branch.city}</span>
                      <span className="text-[10px] uppercase font-bold bg-slate-950 px-2 py-0.5 rounded text-slate-400">
                        {branch.region}
                      </span>
                    </div>
                    {!branch.isMainHub && (
                      <button
                        onClick={() => deleteBranch(branch.id)}
                        className="p-1 text-slate-500 hover:text-red-400"
                        title="Delete branch"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">City Name</label>
                      <input
                        type="text"
                        value={branch.city}
                        onChange={(e) => updateBranch(branch.id, { city: e.target.value })}
                        className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">State / Country</label>
                      <input
                        type="text"
                        value={branch.stateCountry}
                        onChange={(e) => updateBranch(branch.id, { stateCountry: e.target.value })}
                        className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Physical Street Address</label>
                    <input
                      type="text"
                      value={branch.address}
                      onChange={(e) => updateBranch(branch.id, { address: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Direct Phone</label>
                      <input
                        type="text"
                        value={branch.phones[0] || ''}
                        onChange={(e) => updateBranch(branch.id, { phones: [e.target.value] })}
                        className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Branch Email</label>
                      <input
                        type="text"
                        value={branch.email}
                        onChange={(e) => updateBranch(branch.id, { email: e.target.value })}
                        className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                      />
                    </div>
                  </div>

                  {/* Local Station Manager & Contact Details */}
                  <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wider">
                        👤 Station Manager & Pin Pop-up Contact
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Manager Full Name</label>
                        <input
                          type="text"
                          value={branch.managerName || ''}
                          placeholder="e.g. Alhaji Yerima Forfor"
                          onChange={(e) => updateBranch(branch.id, { managerName: e.target.value })}
                          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Manager Job Title</label>
                        <input
                          type="text"
                          value={branch.managerTitle || ''}
                          placeholder="e.g. FCT Regional Director"
                          onChange={(e) => updateBranch(branch.id, { managerTitle: e.target.value })}
                          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Manager Direct Mobile</label>
                        <input
                          type="text"
                          value={branch.managerPhone || ''}
                          placeholder="e.g. 08062466212"
                          onChange={(e) => updateBranch(branch.id, { managerPhone: e.target.value })}
                          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">WhatsApp Number</label>
                        <input
                          type="text"
                          value={branch.whatsappPhone || ''}
                          placeholder="e.g. 2348062466212"
                          onChange={(e) => updateBranch(branch.id, { whatsappPhone: e.target.value })}
                          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Manager Photo URL</label>
                        <input
                          type="text"
                          value={branch.managerAvatar || ''}
                          placeholder="https://..."
                          onChange={(e) => updateBranch(branch.id, { managerAvatar: e.target.value })}
                          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Stationed Fleet Specs</label>
                        <input
                          type="text"
                          value={branch.fleetCapacity || ''}
                          placeholder="e.g. 15 Enclosed Box Trucks"
                          onChange={(e) => updateBranch(branch.id, { fleetCapacity: e.target.value })}
                          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Coverage LGAs & Corridors</label>
                      <input
                        type="text"
                        value={branch.coverageAreas || ''}
                        placeholder="e.g. Abuja Municipal, Gwagwalada, Kuje, Bwari, Suleja"
                        onChange={(e) => updateBranch(branch.id, { coverageAreas: e.target.value })}
                        className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 5: TESTIMONIALS & CASE STUDIES */}
        {/* ==================================================== */}
        {activeTab === 'testimonials' && (
          <div className="pt-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-white">Client Reviews & Testimonials</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Manage corporate and residential reviews, author photos, company names, and move route highlights.
                </p>
              </div>
              <button
                onClick={() => {
                  const newTestimonial = {
                    id: `test-${Date.now()}`,
                    category: 'corporate' as const,
                    serviceTitle: 'Corporate Relocation',
                    quote: 'Pyda Movers executed our move flawlessly with zero downtime.',
                    author: 'Client Name',
                    role: 'Operations Director',
                    company: 'Organization Name',
                    city: 'Lagos ➔ Abuja',
                    rating: 5,
                    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
                    verified: true,
                    moveHighlight: 'Verified Relocation Move',
                    date: 'August 2026',
                  };
                  addTestimonial(newTestimonial);
                  showToast('New testimonial created!');
                }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Add Review</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {cms.testimonials.map((test) => (
                <div key={test.id} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-md">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                      <img
                        src={test.avatar}
                        alt={test.author}
                        className="w-10 h-10 rounded-full object-cover border border-amber-400"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <h4 className="text-sm font-bold text-white">{test.author}</h4>
                        <p className="text-[10px] text-slate-400">{test.role} • {test.company}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => deleteTestimonial(test.id)}
                      className="p-1.5 text-slate-500 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Client Quote</label>
                    <textarea
                      rows={3}
                      value={test.quote}
                      onChange={(e) => {
                        const updated = cms.testimonials.map((t) =>
                          t.id === test.id ? { ...t, quote: e.target.value } : t
                        );
                        updateTestimonials(updated);
                      }}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Client Name</label>
                      <input
                        type="text"
                        value={test.author}
                        onChange={(e) => {
                          const updated = cms.testimonials.map((t) =>
                            t.id === test.id ? { ...t, author: e.target.value } : t
                          );
                          updateTestimonials(updated);
                        }}
                        className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Company / Organization</label>
                      <input
                        type="text"
                        value={test.company}
                        onChange={(e) => {
                          const updated = cms.testimonials.map((t) =>
                            t.id === test.id ? { ...t, company: e.target.value } : t
                          );
                          updateTestimonials(updated);
                        }}
                        className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                      />
                    </div>
                  </div>

                  {/* Photo picker for testimonial author */}
                  <div>
                    <ImagePicker
                      label="Client Avatar Photo"
                      value={test.avatar}
                      onChange={(url) => {
                        const updated = cms.testimonials.map((t) =>
                          t.id === test.id ? { ...t, avatar: url } : t
                        );
                        updateTestimonials(updated);
                      }}
                      category="team"
                      previewHeight="h-20"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 5B: VIDEO TESTIMONIALS & FACILITY TOURS */}
        {/* ==================================================== */}
        {activeTab === 'videos' && (
          <div className="pt-8">
            <AdminVideoTab onShowToast={showToast} />
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 6: PRICING & RATE BENCHMARKS */}
        {/* ==================================================== */}
        {activeTab === 'pricing' && (
          <div className="pt-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-white">Pricing Guide Benchmarks Editor</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Update published baseline rate guides for local intra-city moves and interstate corridors across Nigeria.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {cms.pricing.map((bench, idx) => (
                <div key={idx} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-md">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <span className="font-bold text-white text-sm">{bench.serviceName}</span>
                    <span className="text-[10px] uppercase font-bold bg-amber-500 text-slate-950 px-2 py-0.5 rounded">
                      {bench.category}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">
                        Intra-City Starting Naira
                      </label>
                      <input
                        type="number"
                        value={bench.localIntraCityNaira}
                        onChange={(e) => {
                          const updated = [...cms.pricing];
                          updated[idx].localIntraCityNaira = Number(e.target.value);
                          updatePricing(updated);
                        }}
                        className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">
                        Interstate Starting Naira
                      </label>
                      <input
                        type="number"
                        value={bench.interstateNaira}
                        onChange={(e) => {
                          const updated = [...cms.pricing];
                          updated[idx].interstateNaira = Number(e.target.value);
                          updatePricing(updated);
                        }}
                        className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">
                      Recommended Vehicle Truck Type
                    </label>
                    <input
                      type="text"
                      value={bench.recommendedVehicle}
                      onChange={(e) => {
                        const updated = [...cms.pricing];
                        updated[idx].recommendedVehicle = e.target.value;
                        updatePricing(updated);
                      }}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">
                      Description / Recommended Scope
                    </label>
                    <input
                      type="text"
                      value={bench.description}
                      onChange={(e) => {
                        const updated = [...cms.pricing];
                        updated[idx].description = e.target.value;
                        updatePricing(updated);
                      }}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 7: ABOUT US & FLEET SHOWCASE */}
        {/* ==================================================== */}
        {activeTab === 'about' && (
          <div className="pt-8 space-y-8">
            <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl space-y-6">
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-400" />
                <span>About Us Page & Corporate Profile Settings</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 mb-2 uppercase">Company History & Story</label>
                  <textarea
                    rows={4}
                    value={cms.about.story}
                    onChange={(e) => updateAbout({ story: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2 uppercase">Year Founded</label>
                  <input
                    type="text"
                    value={cms.about.foundedYear}
                    onChange={(e) => updateAbout({ foundedYear: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2 uppercase">Mission Statement</label>
                  <textarea
                    rows={3}
                    value={cms.about.mission}
                    onChange={(e) => updateAbout({ mission: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2 uppercase">Vision Statement</label>
                  <textarea
                    rows={3}
                    value={cms.about.vision}
                    onChange={(e) => updateAbout({ vision: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              {/* About Banner Photo */}
              <div className="pt-4 border-t border-slate-800">
                <ImagePicker
                  label="About Us Main Facility Banner Photo"
                  value={cms.about.heroImage}
                  onChange={(url) => updateAbout({ heroImage: url })}
                  category="warehouse"
                />
              </div>

              {/* Fleet Showcase Vehicles */}
              <div className="pt-6 border-t border-slate-800 space-y-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider text-amber-400">
                  Fleet Showcase Vehicles & Trucks
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {cms.about.fleetShowcase.map((fleet, fIdx) => (
                    <div key={fleet.id} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                      <input
                        type="text"
                        value={fleet.title}
                        onChange={(e) => {
                          const updated = [...cms.about.fleetShowcase];
                          updated[fIdx].title = e.target.value;
                          updateAbout({ fleetShowcase: updated });
                        }}
                        className="w-full font-bold text-sm text-white bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800"
                      />

                      <input
                        type="text"
                        value={fleet.capacity}
                        onChange={(e) => {
                          const updated = [...cms.about.fleetShowcase];
                          updated[fIdx].capacity = e.target.value;
                          updateAbout({ fleetShowcase: updated });
                        }}
                        className="w-full text-xs text-amber-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 font-bold"
                      />

                      <ImagePicker
                        label="Truck Photo"
                        value={fleet.imageUrl}
                        onChange={(url) => {
                          const updated = [...cms.about.fleetShowcase];
                          updated[fIdx].imageUrl = url;
                          updateAbout({ fleetShowcase: updated });
                        }}
                        category="fleet"
                        previewHeight="h-24"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Leadership & CEO Photo Management */}
              <div className="pt-6 border-t border-slate-800 space-y-4">
                <h3 className="text-sm font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>Executive Leadership Team & CEO Profile</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {cms.about.leadershipTeam.map((leader, lIdx) => (
                    <div key={leader.id} className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-amber-400 uppercase">
                          {leader.id === 'team-1' ? '★ Chief Executive Officer' : `Executive #${lIdx + 1}`}
                        </span>
                      </div>

                      <ImagePicker
                        label="Executive Portrait"
                        value={leader.avatar}
                        onChange={(url) => {
                          const updated = [...cms.about.leadershipTeam];
                          updated[lIdx].avatar = url;
                          updateAbout({ leadershipTeam: updated });
                        }}
                        category="team"
                        previewHeight="h-32"
                      />

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Full Name</label>
                        <input
                          type="text"
                          value={leader.name}
                          onChange={(e) => {
                            const updated = [...cms.about.leadershipTeam];
                            updated[lIdx].name = e.target.value;
                            updateAbout({ leadershipTeam: updated });
                          }}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Designation & Role</label>
                        <input
                          type="text"
                          value={leader.role}
                          onChange={(e) => {
                            const updated = [...cms.about.leadershipTeam];
                            updated[lIdx].role = e.target.value;
                            updateAbout({ leadershipTeam: updated });
                          }}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Executive Bio</label>
                        <textarea
                          rows={3}
                          value={leader.bio}
                          onChange={(e) => {
                            const updated = [...cms.about.leadershipTeam];
                            updated[lIdx].bio = e.target.value;
                            updateAbout({ leadershipTeam: updated });
                          }}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Meet Our Logistics Experts Management Section */}
              <div className="pt-8 border-t border-slate-800 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-black text-white flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-amber-400" />
                      <span>Meet Our Logistics Experts — Personnel Profiles ({cms.logisticsExperts?.length || 0})</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Manage profiles, verified credentials, track records, and quotes displayed in the 'Meet Our Logistics Experts' section.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const newId = `expert-${Date.now()}`;
                      addLogisticsExpert({
                        id: newId,
                        name: 'New Logistics Specialist',
                        role: 'Senior Route & Freight Coordinator',
                        department: 'corporate',
                        departmentLabel: 'Corporate Relocations',
                        experienceYears: '10+ Years',
                        location: 'Abuja & Interstate Hubs',
                        bio: 'Experienced supply chain coordinator managing specialized freight transit, client inventories, and rapid road dispatch.',
                        quote: 'Every client item is handled with utmost precision, security, and care.',
                        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=80',
                        certifications: ['Certified Logistics Professional', 'Highway Safety Compliance'],
                        trackRecord: '500+ Successful Operations',
                        specialties: ['Route Planning', 'Asset Packaging', 'Client Care'],
                        featured: false,
                        phone: '+234 806 246 6212',
                        email: 'operations@pydamovers.com'
                      });
                    }}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl shadow transition-all shrink-0 flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Specialist Profile</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(cms.logisticsExperts || []).map((expert, eIdx) => (
                    <div key={expert.id} className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-3.5 flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-amber-400 uppercase bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            Specialist #{eIdx + 1}
                          </span>
                          <button
                            onClick={() => deleteLogisticsExpert(expert.id)}
                            className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors text-xs flex items-center gap-1"
                            title="Remove Expert Profile"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <ImagePicker
                          label="Specialist Portrait"
                          value={expert.avatar}
                          onChange={(url) => updateLogisticsExpert(expert.id, { avatar: url })}
                          category="team"
                          previewHeight="h-28"
                        />

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Full Name</label>
                            <input
                              type="text"
                              value={expert.name}
                              onChange={(e) => updateLogisticsExpert(expert.id, { name: e.target.value })}
                              className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Experience</label>
                            <input
                              type="text"
                              value={expert.experienceYears}
                              onChange={(e) => updateLogisticsExpert(expert.id, { experienceYears: e.target.value })}
                              placeholder="e.g. 14+ Years"
                              className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Role / Designation</label>
                          <input
                            type="text"
                            value={expert.role}
                            onChange={(e) => updateLogisticsExpert(expert.id, { role: e.target.value })}
                            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Department</label>
                            <select
                              value={expert.department}
                              onChange={(e) => {
                                const dept = e.target.value as any;
                                let label = 'Corporate Relocations';
                                if (dept === 'executive') label = 'Executive Directorate';
                                else if (dept === 'fleet_safety') label = 'Fleet Safety & Telematics';
                                else if (dept === 'white_glove') label = 'White-Glove & Fragile Assets';
                                else if (dept === 'cross_border') label = 'Pan-African & Customs';
                                else if (dept === 'heavy_rigging') label = 'Heavy Rigging & Machinery';

                                updateLogisticsExpert(expert.id, { department: dept, departmentLabel: label });
                              }}
                              className="w-full px-2 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                            >
                              <option value="executive">Executive Directorate</option>
                              <option value="corporate">Corporate Relocations</option>
                              <option value="fleet_safety">Fleet Safety & Security</option>
                              <option value="white_glove">White-Glove & Fragile</option>
                              <option value="cross_border">Pan-African & Customs</option>
                              <option value="heavy_rigging">Heavy Rigging & Machinery</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Location Hub</label>
                            <input
                              type="text"
                              value={expert.location}
                              onChange={(e) => updateLogisticsExpert(expert.id, { location: e.target.value })}
                              className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Personal Commitment Quote</label>
                          <input
                            type="text"
                            value={expert.quote}
                            onChange={(e) => updateLogisticsExpert(expert.id, { quote: e.target.value })}
                            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 italic"
                          />
                        </div>

                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Track Record Metric</label>
                          <input
                            type="text"
                            value={expert.trackRecord}
                            onChange={(e) => updateLogisticsExpert(expert.id, { trackRecord: e.target.value })}
                            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Professional Bio</label>
                          <textarea
                            rows={2}
                            value={expert.bio}
                            onChange={(e) => updateLogisticsExpert(expert.id, { bio: e.target.value })}
                            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 8: COMPANY HOTLINES, CONTACTS & FOOTER */}
        {/* ==================================================== */}
        {activeTab === 'company' && (
          <div className="pt-8 space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl space-y-6">
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <Phone className="w-5 h-5 text-amber-400" />
                <span>Primary Hotlines & Footer Configuration</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2 uppercase">Company Name</label>
                  <input
                    type="text"
                    value={cms.company.name}
                    onChange={(e) => updateCompany({ name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2 uppercase">Brand Highlight</label>
                  <input
                    type="text"
                    value={cms.company.brandName}
                    onChange={(e) => updateCompany({ brandName: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2 uppercase">Brand Suffix</label>
                  <input
                    type="text"
                    value={cms.company.brandSuffix}
                    onChange={(e) => updateCompany({ brandSuffix: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2 uppercase">Abuja Primary Hotline</label>
                  <input
                    type="text"
                    value={cms.company.phones[0] || ''}
                    onChange={(e) => {
                      const newPhones = [...cms.company.phones];
                      newPhones[0] = e.target.value;
                      updateCompany({ phones: newPhones });
                    }}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2 uppercase">Lagos Primary Hotline</label>
                  <input
                    type="text"
                    value={cms.company.phones[1] || ''}
                    onChange={(e) => {
                      const newPhones = [...cms.company.phones];
                      newPhones[1] = e.target.value;
                      updateCompany({ phones: newPhones });
                    }}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2 uppercase">WhatsApp Emergency Line</label>
                  <input
                    type="text"
                    value={cms.company.whatsapp}
                    onChange={(e) => updateCompany({ whatsapp: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2 uppercase">Primary Info Email</label>
                  <input
                    type="email"
                    value={cms.company.email}
                    onChange={(e) => updateCompany({ email: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2 uppercase">Quotes Inquiries Email</label>
                  <input
                    type="email"
                    value={cms.company.quoteEmail}
                    onChange={(e) => updateCompany({ quoteEmail: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider text-amber-400">
                  Social Media Channels & Community Links
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">Facebook Page URL</label>
                    <input
                      type="text"
                      placeholder="https://facebook.com/pydamovers"
                      value={cms.company.socialLinks?.facebook || ''}
                      onChange={(e) => updateCompany({
                        socialLinks: { ...cms.company.socialLinks, facebook: e.target.value }
                      })}
                      className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">X (Twitter) Profile URL</label>
                    <input
                      type="text"
                      placeholder="https://twitter.com/pydamovers"
                      value={cms.company.socialLinks?.twitter || ''}
                      onChange={(e) => updateCompany({
                        socialLinks: { ...cms.company.socialLinks, twitter: e.target.value }
                      })}
                      className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">LinkedIn Company URL</label>
                    <input
                      type="text"
                      placeholder="https://linkedin.com/company/pyda-movers"
                      value={cms.company.socialLinks?.linkedin || ''}
                      onChange={(e) => updateCompany({
                        socialLinks: { ...cms.company.socialLinks, linkedin: e.target.value }
                      })}
                      className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">Instagram Profile URL</label>
                    <input
                      type="text"
                      placeholder="https://instagram.com/pydamovers"
                      value={cms.company.socialLinks?.instagram || ''}
                      onChange={(e) => updateCompany({
                        socialLinks: { ...cms.company.socialLinks, instagram: e.target.value }
                      })}
                      className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">YouTube Channel URL</label>
                    <input
                      type="text"
                      placeholder="https://youtube.com/@pydamovers"
                      value={cms.company.socialLinks?.youtube || ''}
                      onChange={(e) => updateCompany({
                        socialLinks: { ...cms.company.socialLinks, youtube: e.target.value }
                      })}
                      className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase">WhatsApp Channel / Group</label>
                    <input
                      type="text"
                      placeholder="https://chat.whatsapp.com/invite/..."
                      value={cms.company.socialLinks?.whatsappChannel || ''}
                      onChange={(e) => updateCompany({
                        socialLinks: { ...cms.company.socialLinks, whatsappChannel: e.target.value }
                      })}
                      className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2 uppercase">Footer Copyright Line</label>
                <input
                  type="text"
                  value={cms.company.copyrightText}
                  onChange={(e) => updateCompany({ copyrightText: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 9: ANNOUNCEMENT BAR */}
        {/* ==================================================== */}
        {activeTab === 'announcement' && (
          <div className="pt-8 space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-white flex items-center gap-2">
                    <BellRing className="w-5 h-5 text-amber-400" />
                    <span>Top Site Announcement & Operational Banner</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Controls the high-visibility notification bar appearing at the very top of all pages.
                  </p>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cms.announcement.enabled}
                    onChange={(e) => updateAnnouncement({ enabled: e.target.checked })}
                    className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
                  />
                  <span className="text-xs font-bold text-white">Enable Top Banner</span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2 uppercase">Announcement Text</label>
                <textarea
                  rows={2}
                  value={cms.announcement.text}
                  onChange={(e) => updateAnnouncement({ text: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2 uppercase">CTA Button Text</label>
                  <input
                    type="text"
                    value={cms.announcement.ctaText}
                    onChange={(e) => updateAnnouncement({ ctaText: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2 uppercase">Badge Label</label>
                  <input
                    type="text"
                    value={cms.announcement.badge}
                    onChange={(e) => updateAnnouncement({ badge: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 10: CUSTOMER QUOTES CRM */}
        {/* ==================================================== */}
        {activeTab === 'quotes' && (
          <div className="pt-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-white">Customer Quote Inquiries CRM</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Review customer requests, update dispatch status, and launch instant telephone or WhatsApp contact.
                </p>
              </div>

              <button
                onClick={fetchQuotes}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 self-start"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingQuotes ? 'animate-spin' : ''}`} />
                <span>Refresh Quotes</span>
              </button>
            </div>

            {/* Filter Search */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search customer name, email, phone..."
                  value={quoteSearchQuery}
                  onChange={(e) => setQuoteSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
                {['all', 'pending', 'approved', 'in-progress', 'completed'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setQuoteStatusFilter(st)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition-colors ${
                      quoteStatusFilter === st
                        ? 'bg-amber-500 text-slate-950 font-black'
                        : 'bg-slate-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Quotes Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase font-black tracking-wider text-[11px] border-b border-slate-800">
                    <tr>
                      <th className="p-4">Quote ID</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Route</th>
                      <th className="p-4">Service Type</th>
                      <th className="p-4">Est. Cost</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {quotes.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-500">
                          No quotes found in database yet.
                        </td>
                      </tr>
                    ) : (
                      quotes.map((q) => (
                        <tr key={q.id} className="hover:bg-slate-850/50 transition-colors">
                          <td className="p-4 font-mono font-bold text-amber-400">
                            <div>{q.id}</div>
                            {q.surveyPhotos && q.surveyPhotos.length > 0 && (
                              <span 
                                onClick={() => setSelectedQuote(q)}
                                className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] cursor-pointer hover:bg-amber-500/20 font-bold"
                                title="Click to view site survey photos"
                              >
                                <Camera className="w-3 h-3" />
                                <span>{q.surveyPhotos.length} Photo{q.surveyPhotos.length > 1 ? 's' : ''}</span>
                              </span>
                            )}
                          </td>
                          <td className="p-4">
                            <p className="font-bold text-white">{q.fullName}</p>
                            <p className="text-[11px] text-slate-400">{q.phone} • {q.email}</p>
                            {q.companyName && (
                              <p className="text-[10px] text-slate-500">{q.companyName}</p>
                            )}
                          </td>
                          <td className="p-4">
                            <p className="font-medium text-slate-200">{q.originCity} ➔ {q.destinationCity}</p>
                            <p className="text-[10px] text-slate-500">{q.movingDate}</p>
                          </td>
                          <td className="p-4 uppercase font-bold text-slate-300">{q.serviceType}</td>
                          <td className="p-4 font-bold text-emerald-400">
                            ₦{Number(q.estimatedCostNaira || 0).toLocaleString()}
                          </td>
                          <td className="p-4">
                            <select
                              value={q.status || 'pending'}
                              onChange={(e) => handleUpdateQuoteStatus(q.id, e.target.value)}
                              className="bg-slate-950 border border-slate-800 text-xs rounded-lg px-2 py-1 font-bold text-amber-400"
                            >
                              <option value="pending">Pending</option>
                              <option value="approved">Approved</option>
                              <option value="in-progress">In Progress</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setSelectedQuote(q)}
                                className="p-1.5 bg-slate-800 text-slate-200 hover:text-amber-400 rounded-lg transition-colors cursor-pointer"
                                title="View full quote details & survey photos"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenEmailPreview('quote_confirmation', q)}
                                className="p-1.5 bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-amber-400 rounded-lg transition-colors cursor-pointer"
                                title={`Preview automated quotation notification email for ${q.fullName}`}
                              >
                                <FileText className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleResendQuoteEmail(q.id, q.email)}
                                disabled={resendingQuoteId === q.id}
                                className="p-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg transition-colors disabled:opacity-50"
                                title={`Resend confirmation email to ${q.email}`}
                              >
                                <Mail className={`w-3.5 h-3.5 ${resendingQuoteId === q.id ? 'animate-spin' : ''}`} />
                              </button>
                              <a
                                href={`tel:${q.phone}`}
                                className="p-1.5 bg-slate-800 text-slate-200 hover:text-white rounded-lg"
                                title="Call customer"
                              >
                                <Phone className="w-3.5 h-3.5" />
                              </a>
                              <a
                                href={`https://wa.me/${q.phone.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 bg-emerald-950/60 text-emerald-400 hover:bg-emerald-900 rounded-lg"
                                title="Chat on WhatsApp"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal: View Quote Details & Site Survey Photos */}
            {selectedQuote && (
              <div 
                className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
                onClick={() => setSelectedQuote(null)}
              >
                <div 
                  className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto shadow-2xl relative my-8"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                        {selectedQuote.id}
                      </span>
                      <h3 className="text-lg font-black text-white">{selectedQuote.fullName}</h3>
                    </div>
                    <button
                      onClick={() => setSelectedQuote(null)}
                      className="p-1.5 bg-slate-800 text-slate-400 hover:text-white rounded-xl"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Route & Pricing Summary */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs">
                    <div>
                      <span className="text-slate-500 text-[11px] block">Route Corridor</span>
                      <span className="font-bold text-white text-sm">{selectedQuote.originCity} ➔ {selectedQuote.destinationCity}</span>
                      {selectedQuote.distanceKm && (
                        <span className="text-amber-400 text-[10px] block mt-0.5">{selectedQuote.distanceKm} km • Est. {selectedQuote.estimatedTransitHours || 24} hrs</span>
                      )}
                    </div>
                    <div>
                      <span className="text-slate-500 text-[11px] block">Estimated Rate</span>
                      <span className="font-bold text-emerald-400 text-base">₦{Number(selectedQuote.estimatedCostNaira || 0).toLocaleString()}</span>
                      <span className="text-slate-400 text-[10px] block mt-0.5">Moving Date: {selectedQuote.movingDate}</span>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-500 text-[10px] block">Phone</span>
                      <span className="font-bold text-white">{selectedQuote.phone}</span>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-500 text-[10px] block">Email</span>
                      <span className="font-bold text-white truncate block">{selectedQuote.email}</span>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 col-span-2 sm:col-span-1">
                      <span className="text-slate-500 text-[10px] block">Property Size</span>
                      <span className="font-bold text-white">{selectedQuote.propertySize || 'Standard'}</span>
                    </div>
                  </div>

                  {/* Special Instructions */}
                  {selectedQuote.specialInstructions && (
                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                      <span className="text-slate-400 text-[11px] font-bold block">Special Instructions & Handling Notes:</span>
                      <p className="text-slate-200 text-xs whitespace-pre-line leading-relaxed">{selectedQuote.specialInstructions}</p>
                    </div>
                  )}

                  {/* Site Survey Photos Gallery */}
                  {selectedQuote.surveyPhotos && selectedQuote.surveyPhotos.length > 0 && (
                    <div className="space-y-3 pt-2 border-t border-slate-800">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Camera className="w-4 h-4 text-amber-400" />
                          <h4 className="text-xs font-black text-white uppercase tracking-wider">
                            Attached Site Survey Photos ({selectedQuote.surveyPhotos.length})
                          </h4>
                        </div>
                        <span className="text-[10px] text-amber-400 font-mono">
                          ~{selectedQuote.surveyPhotos.reduce((s, p) => s + (p.estimatedCbm || 1.0), 0).toFixed(1)} CBM total
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {selectedQuote.surveyPhotos.map((photo) => (
                          <div
                            key={photo.id}
                            className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden group"
                          >
                            <div className="relative aspect-video bg-black">
                              <img
                                src={photo.dataUrl}
                                alt={photo.label}
                                className="w-full h-full object-cover"
                              />
                              <span className="absolute bottom-1 right-1 text-[9px] bg-slate-950/80 px-1.5 py-0.5 rounded text-amber-400 font-mono">
                                +{(photo.estimatedCbm || 1.0).toFixed(1)} CBM
                              </span>
                            </div>
                            <div className="p-2 space-y-0.5">
                              <p className="text-[11px] font-bold text-white truncate">{photo.label}</p>
                              <span className="text-[9px] text-slate-400 block">{photo.category}</span>
                              {photo.notes && (
                                <p className="text-[9px] text-slate-400 line-clamp-1 italic">{photo.notes}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quick Action Contact Bar */}
                  <div className="pt-3 border-t border-slate-800 space-y-2">
                    <button
                      type="button"
                      onClick={() => {
                        handleOpenEmailPreview('quote_confirmation', selectedQuote);
                      }}
                      className="w-full py-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 font-black text-xs rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-sm"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Preview Client Notification Email (Mock Previewer)</span>
                    </button>

                    <div className="flex items-center gap-3">
                      <a
                        href={`tel:${selectedQuote.phone}`}
                        className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white rounded-xl flex items-center justify-center gap-2 border border-slate-700"
                      >
                        <Phone className="w-3.5 h-3.5 text-amber-400" />
                        <span>Call Customer</span>
                      </a>
                      <a
                        href={`https://wa.me/${selectedQuote.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-xs font-bold text-white rounded-xl flex items-center justify-center gap-2"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>WhatsApp Chat</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 10: FLEET GPS & CONSIGNMENT TRACKING MANAGEMENT */}
        {/* ==================================================== */}
        {activeTab === 'shipments' && (
          <div className="pt-8 space-y-6">
            
            {/* Top Header Card */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <Truck className="w-5 h-5 text-amber-400" />
                  <span>Fleet GPS Tracking & Active Dispatch Console</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1 max-w-xl">
                  Manage live consignment waybills, modify GPS lat/lng coordinates, simulate convoy movement, update vehicle telematics (speed, fuel, temperature), and monitor electronic tamper seals.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveTab('dispatch_map')}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-cyan-300 hover:text-white border border-cyan-500/40 font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all"
                >
                  <MapPin className="w-4 h-4 text-cyan-400" />
                  <span>Dispatch Live Map</span>
                </button>
                <button
                  onClick={() => setIsNewShipmentOpen(true)}
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center gap-1.5 active:scale-95 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Consignment Dispatch</span>
                </button>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={shipmentSearch}
                  onChange={(e) => setShipmentSearch(e.target.value)}
                  placeholder="Search by ID, client, driver, or city..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
                {['all', 'In Transit', 'Out for Delivery', 'Customs Clearance', 'Delivered'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setShipmentFilterStatus(st)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition-colors whitespace-nowrap ${
                      shipmentFilterStatus === st
                        ? 'bg-amber-500 text-slate-950 font-black'
                        : 'bg-slate-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Shipments Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase font-black tracking-wider text-[11px] border-b border-slate-800">
                    <tr>
                      <th className="p-4">Tracking Ref</th>
                      <th className="p-4">Client / Consignment</th>
                      <th className="p-4">Route Corridor</th>
                      <th className="p-4">Current GPS Location</th>
                      <th className="p-4">Telematics</th>
                      <th className="p-4">Progress</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {(cms.shipments || [])
                      .filter((s) => {
                        if (shipmentFilterStatus !== 'all' && s.status !== shipmentFilterStatus) return false;
                        if (!shipmentSearch) return true;
                        const q = shipmentSearch.toLowerCase();
                        return (
                          s.trackingId.toLowerCase().includes(q) ||
                          s.clientName.toLowerCase().includes(q) ||
                          s.origin.toLowerCase().includes(q) ||
                          s.destination.toLowerCase().includes(q) ||
                          (s.driverName && s.driverName.toLowerCase().includes(q))
                        );
                      })
                      .map((shipment) => (
                        <tr key={shipment.trackingId} className="hover:bg-slate-850/50 transition-colors">
                          <td className="p-4">
                            <span className="font-mono font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                              {shipment.trackingId}
                            </span>
                            <span className="block text-[10px] text-slate-500 mt-1">{shipment.serviceType}</span>
                          </td>
                          <td className="p-4">
                            <p className="font-bold text-white text-sm">{shipment.clientName}</p>
                            <p className="text-[11px] text-slate-400">Unit: {shipment.vehicleUnit || 'MTM-FL-108'}</p>
                          </td>
                          <td className="p-4">
                            <p className="font-medium text-slate-200">{shipment.origin} ➔ {shipment.destination}</p>
                            <p className="text-[10px] text-slate-500">ETA: {shipment.estimatedArrival}</p>
                          </td>
                          <td className="p-4">
                            <p className="font-bold text-white">{shipment.currentLocation}</p>
                            <p className="text-[10px] text-amber-400/80 font-mono">
                              {(typeof shipment.currentCoordinates?.lat === 'number' && Number.isFinite(shipment.currentCoordinates.lat) ? shipment.currentCoordinates.lat : 7.8023).toFixed(4)}° N, {(typeof shipment.currentCoordinates?.lng === 'number' && Number.isFinite(shipment.currentCoordinates.lng) ? shipment.currentCoordinates.lng : 6.7412).toFixed(4)}° E
                            </p>
                          </td>
                          <td className="p-4">
                            <div className="space-y-0.5 text-[11px]">
                              <span className="text-emerald-400 font-mono font-bold block">{shipment.speedKmh ?? 65} km/h</span>
                              <span className="text-slate-400">Diesel: {shipment.fuelLevelPercent ?? 75}%</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="w-24 space-y-1">
                              <div className="flex justify-between text-[10px] font-bold">
                                <span className="text-amber-400">{shipment.progressPercent}%</span>
                                <span className="text-slate-400">{shipment.distanceTraveledKm || 0}km</span>
                              </div>
                              <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className="bg-amber-400 h-full rounded-full"
                                  style={{ width: `${shipment.progressPercent}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase inline-block ${
                              shipment.status === 'Out for Delivery' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                              shipment.status === 'Customs Clearance' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                              shipment.status === 'Delivered' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                              'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            }`}>
                              {shipment.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => advanceShipmentSimulation(shipment.trackingId, 1)}
                                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg transition-colors"
                                title="Advance truck 1 step on GPS highway"
                              >
                                <RotateCw className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => setEditingShipment(shipment)}
                                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg transition-colors"
                                title="Edit shipment & coordinates"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  const isDelivered = shipment.status === 'Delivered';
                                  handleOpenEmailPreview(
                                    isDelivered ? 'shipment_delivered' : 'shipment_dispatched',
                                    null,
                                    shipment
                                  );
                                }}
                                className="p-1.5 bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-amber-400 rounded-lg transition-colors cursor-pointer"
                                title="Preview automated shipment notification email"
                              >
                                <Mail className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => {
                                  if (window.confirm(`Delete consignment ${shipment.trackingId}?`)) {
                                    deleteShipment(shipment.trackingId);
                                    showToast(`Deleted shipment ${shipment.trackingId}`);
                                  }
                                }}
                                className="p-1.5 bg-red-950/40 hover:bg-red-900 text-red-400 rounded-lg transition-colors"
                                title="Delete shipment"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal: Edit Shipment & GPS Telematics */}
            {editingShipment && (
              <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-2xl shadow-2xl space-y-4 my-8">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="text-base font-black text-white flex items-center gap-2">
                      <Edit3 className="w-4 h-4 text-amber-400" />
                      <span>Edit GPS & Dispatch: {editingShipment.trackingId}</span>
                    </h3>
                    <button
                      onClick={() => setEditingShipment(null)}
                      className="p-1.5 bg-slate-800 text-slate-400 hover:text-white rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block text-slate-400 font-bold mb-1">Client Name</label>
                      <input
                        type="text"
                        value={editingShipment.clientName}
                        onChange={(e) => setEditingShipment({ ...editingShipment, clientName: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 font-bold mb-1">Current Transit Status</label>
                      <select
                        value={editingShipment.status}
                        onChange={(e) => setEditingShipment({ ...editingShipment, status: e.target.value as any })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-bold text-amber-400"
                      >
                        <option value="In Transit">In Transit</option>
                        <option value="Out for Delivery">Out for Delivery</option>
                        <option value="Customs Clearance">Customs Clearance</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-400 font-bold mb-1">Current Highway Location Description</label>
                      <input
                        type="text"
                        value={editingShipment.currentLocation}
                        onChange={(e) => setEditingShipment({ ...editingShipment, currentLocation: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 font-bold mb-1">Estimated Arrival (ETA)</label>
                      <input
                        type="text"
                        value={editingShipment.estimatedArrival}
                        onChange={(e) => setEditingShipment({ ...editingShipment, estimatedArrival: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 font-bold mb-1">GPS Latitude</label>
                      <input
                        type="number"
                        step="0.000001"
                        value={editingShipment.currentCoordinates?.lat || 7.8023}
                        onChange={(e) =>
                          setEditingShipment({
                            ...editingShipment,
                            currentCoordinates: {
                              lat: parseFloat(e.target.value) || 0,
                              lng: editingShipment.currentCoordinates?.lng || 6.7412,
                            },
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 font-bold mb-1">GPS Longitude</label>
                      <input
                        type="number"
                        step="0.000001"
                        value={editingShipment.currentCoordinates?.lng || 6.7412}
                        onChange={(e) =>
                          setEditingShipment({
                            ...editingShipment,
                            currentCoordinates: {
                              lat: editingShipment.currentCoordinates?.lat || 7.8023,
                              lng: parseFloat(e.target.value) || 0,
                            },
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 font-bold mb-1">Progress Percentage (0 - 100%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={editingShipment.progressPercent}
                        onChange={(e) => setEditingShipment({ ...editingShipment, progressPercent: parseInt(e.target.value) || 0 })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 font-bold mb-1">Live Speed (km/h)</label>
                      <input
                        type="number"
                        value={editingShipment.speedKmh ?? 65}
                        onChange={(e) => setEditingShipment({ ...editingShipment, speedKmh: parseInt(e.target.value) || 0 })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 font-bold mb-1">Lead Driver Name</label>
                      <input
                        type="text"
                        value={editingShipment.driverName || ''}
                        onChange={(e) => setEditingShipment({ ...editingShipment, driverName: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 font-bold mb-1">Driver Hotline</label>
                      <input
                        type="text"
                        value={editingShipment.driverPhone || ''}
                        onChange={(e) => setEditingShipment({ ...editingShipment, driverPhone: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 font-bold mb-1">Electronic Tamper Seal Serial</label>
                      <input
                        type="text"
                        value={editingShipment.tamperSealCode || ''}
                        onChange={(e) => setEditingShipment({ ...editingShipment, tamperSealCode: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 font-bold mb-1">Vehicle License Plate</label>
                      <input
                        type="text"
                        value={editingShipment.vehiclePlate || ''}
                        onChange={(e) => setEditingShipment({ ...editingShipment, vehiclePlate: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                    <button
                      onClick={() => setEditingShipment(null)}
                      className="px-4 py-2 bg-slate-800 text-slate-300 hover:text-white font-bold text-xs rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        updateShipment(editingShipment.trackingId, editingShipment);
                        setEditingShipment(null);
                        showToast(`Updated shipment ${editingShipment.trackingId}`);
                      }}
                      className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg"
                    >
                      Save GPS & Status Updates
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal: New Shipment Dispatch */}
            {isNewShipmentOpen && (
              <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-2xl shadow-2xl space-y-4 my-8">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="text-base font-black text-white flex items-center gap-2">
                      <Plus className="w-4 h-4 text-amber-400" />
                      <span>Create New Highway Consignment Dispatch</span>
                    </h3>
                    <button
                      onClick={() => setIsNewShipmentOpen(false)}
                      className="p-1.5 bg-slate-800 text-slate-400 hover:text-white rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const form = e.target as any;
                      const newTrackId = `MTM-${Math.floor(10000 + Math.random() * 90000)}`;
                      const newObj: ShipmentTrackStatus = {
                        trackingId: newTrackId,
                        clientName: form.clientName.value,
                        origin: form.origin.value,
                        destination: form.destination.value,
                        status: 'In Transit',
                        progressPercent: 20,
                        currentLocation: `${form.origin.value} Outskirts Highway Tollgate`,
                        estimatedArrival: form.eta.value || 'Within 48 Hours',
                        serviceType: form.serviceType.value,
                        speedKmh: 65,
                        fuelLevelPercent: 90,
                        driverName: form.driverName.value || 'Lead Musa Ibrahim',
                        driverPhone: form.driverPhone.value || '08036249911',
                        vehicleUnit: form.vehicleUnit.value || 'MTM-FL-120',
                        vehiclePlate: form.vehiclePlate.value || 'KJA-921-XA',
                        tamperSealCode: `MTM-SEAL-${Math.floor(10000 + Math.random() * 90000)}-LOK`,
                        currentCoordinates: { lat: 6.5244, lng: 3.3792 },
                        routeCoordinates: [
                          [6.4674, 3.2831],
                          [6.6018, 3.3515],
                          [6.8322, 3.6321],
                          [7.1475, 3.9056],
                          [7.3775, 3.947],
                          [7.8023, 6.7412],
                          [8.4966, 4.5421],
                          [9.0765, 7.3986]
                        ],
                        updates: [
                          {
                            date: new Date().toLocaleDateString('en-GB'),
                            time: '08:00 AM',
                            location: form.origin.value,
                            note: 'Consignment loaded, manifest verified, electronic tamper seal affixed.'
                          }
                        ]
                      };
                      addShipment(newObj);
                      setIsNewShipmentOpen(false);
                      showToast(`Created new dispatch ${newTrackId}`);
                    }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs"
                  >
                    <div>
                      <label className="block text-slate-400 font-bold mb-1">Client / Company Name</label>
                      <input
                        type="text"
                        name="clientName"
                        required
                        placeholder="e.g. Corporate Client / Enterprise Ltd"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 font-bold mb-1">Service Type</label>
                      <select
                        name="serviceType"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-bold text-amber-400"
                      >
                        <option value="Interstate Heavy Haulage">Interstate Heavy Haulage</option>
                        <option value="Corporate Office Relocation">Corporate Office Relocation</option>
                        <option value="Port Container Drayage">Port Container Drayage</option>
                        <option value="Residential White-Glove Moving">Residential White-Glove Moving</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-400 font-bold mb-1">Origin City / Depot</label>
                      <input
                        type="text"
                        name="origin"
                        required
                        placeholder="e.g. Lagos Port Apapa"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 font-bold mb-1">Destination City / Terminal</label>
                      <input
                        type="text"
                        name="destination"
                        required
                        placeholder="e.g. Abuja Central Industrial Zone"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 font-bold mb-1">Estimated Arrival (ETA)</label>
                      <input
                        type="text"
                        name="eta"
                        placeholder="e.g. Tomorrow, 4:00 PM"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 font-bold mb-1">Fleet Unit ID</label>
                      <input
                        type="text"
                        name="vehicleUnit"
                        placeholder="e.g. MTM-FL-120"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 font-bold mb-1">Vehicle Plate Number</label>
                      <input
                        type="text"
                        name="vehiclePlate"
                        placeholder="e.g. KJA-921-XA"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 font-bold mb-1">Driver Name & Phone</label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          name="driverName"
                          placeholder="Musa Ibrahim"
                          className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                        />
                        <input
                          type="text"
                          name="driverPhone"
                          placeholder="08036249911"
                          className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2 flex justify-end gap-2 pt-3 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={() => setIsNewShipmentOpen(false)}
                        className="px-4 py-2 bg-slate-800 text-slate-300 hover:text-white font-bold text-xs rounded-xl"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg"
                      >
                        Create Consignment & Initialize GPS
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ==================================================== */}
        {/* TAB: DISPATCH LIVE MAP (LEAFLET TELEMATICS + TRAFFIC API) */}
        {/* ==================================================== */}
        {activeTab === 'dispatch_map' && (
          <div className="pt-8 space-y-6">
            <AdminDispatchLiveMap cmsShipments={cms.shipments} />
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB: CAREERS & DRIVER JOBS MANAGEMENT */}
        {/* ==================================================== */}
        {activeTab === 'careers' && (
          <div className="pt-8 space-y-6">
            
            {/* Top Overview & Sub-tab Switcher */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl">
              <div>
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-amber-400" />
                  <h2 className="text-xl font-black text-white">Logistics & Driver Recruitment Center</h2>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Post and manage heavy truck driver, forklift operator, and warehouse logistics vacancies. Review incoming candidate applications.
                </p>
              </div>

              {/* Sub-tab Pills */}
              <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 shrink-0">
                <button
                  onClick={() => setCareersSubTab('openings')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    careersSubTab === 'openings'
                      ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  id="admin-careers-openings-tab"
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Job Openings ({cms.jobOpenings?.length || 0})</span>
                </button>

                <button
                  onClick={() => setCareersSubTab('applications')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    careersSubTab === 'applications'
                      ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  id="admin-careers-apps-tab"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Candidate Applications ({cms.jobApplications?.length || 0})</span>
                </button>
              </div>
            </div>

            {/* ------------------------------------------- */}
            {/* SUBTAB 1: JOB OPENINGS & VACANCIES */}
            {/* ------------------------------------------- */}
            {careersSubTab === 'openings' && (
              <div className="space-y-6">
                
                {/* Search & Add Bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                  <div className="relative flex-grow max-w-md">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search job title, category, city..."
                      value={jobSearchQuery}
                      onChange={(e) => setJobSearchQuery(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-400"
                    />
                  </div>

                  <button
                    onClick={() => {
                      setEditingJob(null);
                      setIsNewJobOpen(true);
                    }}
                    className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center justify-center gap-1.5 shrink-0"
                    id="admin-add-job-btn"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create New Job Opening</span>
                  </button>
                </div>

                {/* Job Openings Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(cms.jobOpenings || [])
                    .filter(
                      (j) =>
                        jobSearchQuery === '' ||
                        j.title.toLowerCase().includes(jobSearchQuery.toLowerCase()) ||
                        j.location.toLowerCase().includes(jobSearchQuery.toLowerCase()) ||
                        j.category.toLowerCase().includes(jobSearchQuery.toLowerCase())
                    )
                    .map((job) => (
                      <div
                        key={job.id}
                        className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 hover:border-slate-700 transition-all flex flex-col justify-between"
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-start justify-between gap-2">
                            <span
                              className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                                job.category === 'driver'
                                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                  : job.category === 'warehouse'
                                  ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              }`}
                            >
                              {job.category.toUpperCase()} • {job.employmentType}
                            </span>

                            <div className="flex items-center gap-1.5">
                              <span
                                className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                                  job.status === 'active'
                                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                                    : 'bg-slate-800 text-slate-400 border-slate-700'
                                }`}
                              >
                                {job.status.toUpperCase()}
                              </span>
                            </div>
                          </div>

                          <h3 className="text-base font-black text-white">{job.title}</h3>

                          <div className="text-xs text-slate-400 space-y-1">
                            <p className="flex items-center gap-1.5 text-slate-300">
                              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              <span className="truncate">{job.location}</span>
                            </p>
                            {job.salaryRange && (
                              <p className="flex items-center gap-1.5 text-amber-400 font-bold">
                                <DollarSign className="w-3.5 h-3.5 shrink-0" />
                                <span>{job.salaryRange}</span>
                              </p>
                            )}
                            <p className="text-[11px] text-slate-400">
                              {job.vacancies} Vacancies • {job.experienceRequired}
                            </p>
                          </div>

                          <p className="text-xs text-slate-400 line-clamp-2">{job.description}</p>
                        </div>

                        <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                          <button
                            onClick={() => {
                              updateJobOpening(job.id, {
                                status: job.status === 'active' ? 'closed' : 'active',
                              });
                              showToast(`Job opening status set to ${job.status === 'active' ? 'Closed' : 'Active'}`);
                            }}
                            className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-colors ${
                              job.status === 'active'
                                ? 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                                : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/30'
                            }`}
                          >
                            {job.status === 'active' ? 'Pause / Close' : 'Activate Opening'}
                          </button>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setEditingJob(job);
                                setIsNewJobOpen(true);
                              }}
                              className="p-2 text-slate-400 hover:text-amber-400 bg-slate-950 rounded-xl border border-slate-800 transition-colors"
                              title="Edit Job Details"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => {
                                if (window.confirm(`Delete job opening "${job.title}"?`)) {
                                  deleteJobOpening(job.id);
                                  showToast('Job opening removed.');
                                }
                              }}
                              className="p-2 text-slate-400 hover:text-red-400 bg-slate-950 rounded-xl border border-slate-800 transition-colors"
                              title="Delete Job Opening"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* ------------------------------------------- */}
            {/* SUBTAB 2: CANDIDATE APPLICATIONS REVIEW */}
            {/* ------------------------------------------- */}
            {careersSubTab === 'applications' && (
              <div className="space-y-6">
                
                {/* Search & Status Filter */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                  <div className="relative flex-grow max-w-md">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search applicant name, phone, city, license..."
                      value={appSearchQuery}
                      onChange={(e) => setAppSearchQuery(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-amber-400 shrink-0" />
                    <select
                      value={appStatusFilter}
                      onChange={(e) => setAppStatusFilter(e.target.value)}
                      className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-amber-400"
                    >
                      <option value="all">All Application Statuses</option>
                      <option value="submitted">Submitted (New)</option>
                      <option value="under_review">Under Review</option>
                      <option value="interview_scheduled">Interview Scheduled</option>
                      <option value="offer_extended">Offer Extended</option>
                      <option value="hired">Hired</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>

                {/* Applications Table / Cards */}
                {((cms.jobApplications || []).length === 0) ? (
                  <div className="bg-slate-900 border border-slate-800 p-12 text-center rounded-3xl space-y-3">
                    <UserCheck className="w-10 h-10 text-slate-600 mx-auto" />
                    <h3 className="text-base font-bold text-white">No Applications Received Yet</h3>
                    <p className="text-xs text-slate-400">
                      When candidates apply via the public Careers portal, their details and qualifications will appear here instantly.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(cms.jobApplications || [])
                      .filter((app) => {
                        const matchesSearch =
                          appSearchQuery === '' ||
                          app.fullName.toLowerCase().includes(appSearchQuery.toLowerCase()) ||
                          app.phone.includes(appSearchQuery) ||
                          app.cityState.toLowerCase().includes(appSearchQuery.toLowerCase()) ||
                          app.jobTitle.toLowerCase().includes(appSearchQuery.toLowerCase());

                        const matchesStatus = appStatusFilter === 'all' || app.status === appStatusFilter;
                        return matchesSearch && matchesStatus;
                      })
                      .map((app) => (
                        <div
                          key={app.id}
                          className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                          id={`admin-app-card-${app.id}`}
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                                {app.id}
                              </span>
                              <span
                                className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                                  app.status === 'interview_scheduled'
                                    ? 'bg-purple-500/20 text-purple-400 border-purple-500/40'
                                    : app.status === 'hired'
                                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                                    : app.status === 'under_review'
                                    ? 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                                    : app.status === 'rejected'
                                    ? 'bg-red-500/20 text-red-400 border-red-500/40'
                                    : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                                }`}
                              >
                                {app.status.replace('_', ' ').toUpperCase()}
                              </span>
                              <span className="text-[11px] text-slate-500">
                                Applied: {new Date(app.appliedAt).toLocaleDateString()}
                              </span>
                            </div>

                            <h4 className="text-base font-black text-white">{app.fullName}</h4>
                            <p className="text-xs font-bold text-amber-400">{app.jobTitle}</p>

                            <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap pt-1">
                              <span className="flex items-center gap-1 text-slate-300">
                                <Phone className="w-3.5 h-3.5 text-amber-400" />
                                {app.phone}
                              </span>
                              <span>•</span>
                              <span>{app.cityState}</span>
                              <span>•</span>
                              <span className="text-slate-300 font-medium">{app.licenseClass}</span>
                              <span>•</span>
                              <span>{app.yearsExperience}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                handleOpenEmailPreview('job_application', null, null, {
                                  fullName: app.fullName,
                                  email: app.email,
                                  phone: app.phone,
                                  jobTitle: app.jobTitle,
                                  licenseClass: app.licenseClass,
                                  cityState: app.cityState,
                                });
                              }}
                              className="p-2 text-amber-400 hover:text-slate-950 hover:bg-amber-500 bg-slate-950 rounded-xl border border-slate-800 transition-colors cursor-pointer"
                              title={`Preview HR Confirmation Email for ${app.fullName}`}
                            >
                              <Mail className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => setSelectedApp(app)}
                              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-transform active:scale-95 flex items-center gap-1.5"
                            >
                              <span>Review Candidate</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => {
                                if (window.confirm(`Delete candidate application for ${app.fullName}?`)) {
                                  deleteJobApplication(app.id);
                                  showToast('Application deleted.');
                                }
                              }}
                              className="p-2 text-slate-400 hover:text-red-400 bg-slate-950 rounded-xl border border-slate-800 transition-colors"
                              title="Delete Application"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}

              </div>
            )}

            {/* ------------------------------------------- */}
            {/* MODAL: CREATE / EDIT JOB OPENING */}
            {/* ------------------------------------------- */}
            {isNewJobOpen && (
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl relative">
                  <button
                    onClick={() => {
                      setIsNewJobOpen(false);
                      setEditingJob(null);
                    }}
                    className="absolute right-5 top-5 text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <h3 className="text-xl font-black text-white">
                    {editingJob ? 'Edit Logistics Job Opening' : 'Post New Driver / Logistics Vacancy'}
                  </h3>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const form = e.currentTarget;
                      const title = (form.elements.namedItem('title') as HTMLInputElement).value;
                      const category = (form.elements.namedItem('category') as HTMLSelectElement).value as JobCategory;
                      const location = (form.elements.namedItem('location') as HTMLInputElement).value;
                      const employmentType = (form.elements.namedItem('employmentType') as HTMLInputElement).value;
                      const salaryRange = (form.elements.namedItem('salaryRange') as HTMLInputElement).value;
                      const experienceRequired = (form.elements.namedItem('experienceRequired') as HTMLInputElement).value;
                      const vacancies = parseInt((form.elements.namedItem('vacancies') as HTMLInputElement).value) || 1;
                      const status = (form.elements.namedItem('status') as HTMLSelectElement).value as 'active' | 'draft' | 'closed';
                      const description = (form.elements.namedItem('description') as HTMLTextAreaElement).value;
                      const responsibilitiesRaw = (form.elements.namedItem('responsibilities') as HTMLTextAreaElement).value;
                      const requirementsRaw = (form.elements.namedItem('requirements') as HTMLTextAreaElement).value;
                      const benefitsRaw = (form.elements.namedItem('benefits') as HTMLTextAreaElement).value;

                      const responsibilities = responsibilitiesRaw.split('\n').map((s) => s.trim()).filter(Boolean);
                      const requirements = requirementsRaw.split('\n').map((s) => s.trim()).filter(Boolean);
                      const benefits = benefitsRaw.split('\n').map((s) => s.trim()).filter(Boolean);

                      if (editingJob) {
                        updateJobOpening(editingJob.id, {
                          title,
                          category,
                          location,
                          employmentType,
                          salaryRange,
                          experienceRequired,
                          vacancies,
                          status,
                          description,
                          responsibilities,
                          requirements,
                          benefits,
                        });
                        showToast('Job opening updated successfully!');
                      } else {
                        const newJob: JobOpening = {
                          id: `job-${category}-${Date.now().toString().slice(-4)}`,
                          title,
                          category,
                          location,
                          employmentType,
                          salaryRange,
                          experienceRequired,
                          vacancies,
                          status,
                          postedDate: 'August 2026',
                          deadline: 'Open',
                          featured: false,
                          description,
                          responsibilities: responsibilities.length ? responsibilities : ['Execute safe transportation across assigned routes.'],
                          requirements: requirements.length ? requirements : ['Valid driver’s license and 2 verifiable guarantors.'],
                          benefits: benefits.length ? benefits : ['Guaranteed salary, HMO medical insurance, trip allowances.'],
                        };
                        addJobOpening(newJob);
                        showToast('New job opening published to Careers portal!');
                      }

                      setIsNewJobOpen(false);
                      setEditingJob(null);
                    }}
                    className="space-y-4 text-xs"
                  >
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Job Position Title *</label>
                      <input
                        type="text"
                        name="title"
                        required
                        defaultValue={editingJob?.title || ''}
                        placeholder="e.g. Heavy-Duty Interstate Truck Driver (Class G)"
                        className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-3 outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-slate-300 font-bold mb-1">Role Category</label>
                        <select
                          name="category"
                          defaultValue={editingJob?.category || 'driver'}
                          className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-3 outline-none focus:border-amber-500"
                        >
                          <option value="driver">🚛 Driver (Truck / Van)</option>
                          <option value="warehouse">📦 Warehouse & Forklift</option>
                          <option value="operations">🛰️ Fleet Dispatch & Ops</option>
                          <option value="technician">🛠️ Heavy Rigging / Tech</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-300 font-bold mb-1">Vacancies</label>
                        <input
                          type="number"
                          name="vacancies"
                          min="1"
                          defaultValue={editingJob?.vacancies || 2}
                          className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-3 outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 font-bold mb-1">Status</label>
                        <select
                          name="status"
                          defaultValue={editingJob?.status || 'active'}
                          className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-3 outline-none focus:border-amber-500"
                        >
                          <option value="active">Active (Visible)</option>
                          <option value="closed">Closed</option>
                          <option value="draft">Draft</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-300 font-bold mb-1">Location & Operational Base</label>
                        <input
                          type="text"
                          name="location"
                          required
                          defaultValue={editingJob?.location || 'Abuja HQ & Lagos Metro'}
                          className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-3 outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 font-bold mb-1">Employment Type</label>
                        <input
                          type="text"
                          name="employmentType"
                          defaultValue={editingJob?.employmentType || 'Full-Time'}
                          className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-3 outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-300 font-bold mb-1">Salary Range & Allowances</label>
                        <input
                          type="text"
                          name="salaryRange"
                          defaultValue={editingJob?.salaryRange || '₦200,000 - ₦320,000 / month + Trip Allowances'}
                          className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-3 outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 font-bold mb-1">Experience Required</label>
                        <input
                          type="text"
                          name="experienceRequired"
                          defaultValue={editingJob?.experienceRequired || '3+ Years Heavy Haulage'}
                          className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-3 outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Role Description</label>
                      <textarea
                        name="description"
                        rows={2}
                        required
                        defaultValue={editingJob?.description || ''}
                        className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-3 outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Key Responsibilities (One per line)</label>
                      <textarea
                        name="responsibilities"
                        rows={3}
                        defaultValue={editingJob?.responsibilities.join('\n') || ''}
                        className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-3 outline-none focus:border-amber-500 font-mono text-[11px]"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Requirements & Driver Licenses (One per line)</label>
                      <textarea
                        name="requirements"
                        rows={3}
                        defaultValue={editingJob?.requirements.join('\n') || ''}
                        className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-3 outline-none focus:border-amber-500 font-mono text-[11px]"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Benefits & Perks (One per line)</label>
                      <textarea
                        name="benefits"
                        rows={2}
                        defaultValue={editingJob?.benefits.join('\n') || ''}
                        className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-3 outline-none focus:border-amber-500 font-mono text-[11px]"
                      />
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsNewJobOpen(false);
                          setEditingJob(null);
                        }}
                        className="px-4 py-2.5 bg-slate-800 text-slate-300 font-bold rounded-xl"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow-lg"
                      >
                        {editingJob ? 'Save Changes' : 'Publish Job Opening'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* ------------------------------------------- */}
            {/* MODAL: REVIEW CANDIDATE APPLICATION */}
            {/* ------------------------------------------- */}
            {selectedApp && (
              <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl relative">
                  <button
                    onClick={() => setSelectedApp(null)}
                    className="absolute right-5 top-5 text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className="space-y-1">
                    <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      {selectedApp.id}
                    </span>
                    <h3 className="text-2xl font-black text-white">{selectedApp.fullName}</h3>
                    <p className="text-xs font-bold text-amber-400">{selectedApp.jobTitle}</p>
                    <p className="text-[11px] text-slate-400">
                      Submitted: {new Date(selectedApp.appliedAt).toLocaleString()}
                    </p>
                  </div>

                  {/* Candidate Details Grid */}
                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-3 text-xs">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-slate-500 text-[11px]">Phone / WhatsApp</p>
                        <p className="font-bold text-white">{selectedApp.phone}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-[11px]">Email</p>
                        <p className="font-bold text-white">{selectedApp.email}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-slate-500 text-[11px]">Location</p>
                        <p className="font-bold text-white">{selectedApp.cityState}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-[11px]">Earliest Start</p>
                        <p className="font-bold text-emerald-400">{selectedApp.availableStartDate}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-slate-500 text-[11px]">License / Cert</p>
                        <p className="font-bold text-white">{selectedApp.licenseClass}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-[11px]">Experience</p>
                        <p className="font-bold text-white">{selectedApp.yearsExperience}</p>
                      </div>
                    </div>

                    {selectedApp.currentEmployer && (
                      <div>
                        <p className="text-slate-500 text-[11px]">Previous Employer</p>
                        <p className="font-bold text-white">{selectedApp.currentEmployer}</p>
                      </div>
                    )}

                    <div>
                      <p className="text-slate-500 text-[11px]">Guarantor Confirmation</p>
                      <p className="font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Confirmed 2 Verifiable Guarantors Available</span>
                      </p>
                    </div>

                    {selectedApp.resumeOrBioNotes && (
                      <div className="pt-2 border-t border-slate-800/80">
                        <p className="text-slate-500 text-[11px]">Experience Notes & Driving Record:</p>
                        <p className="text-slate-200 mt-1 leading-relaxed">{selectedApp.resumeOrBioNotes}</p>
                      </div>
                    )}
                  </div>

                  {/* Direct Action Contact Buttons */}
                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${selectedApp.phone}`}
                      className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white rounded-xl flex items-center justify-center gap-2 border border-slate-700"
                    >
                      <Phone className="w-3.5 h-3.5 text-amber-400" />
                      <span>Call Applicant</span>
                    </a>
                    <a
                      href={`https://wa.me/234${selectedApp.phone.replace(/^0/, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-xs font-bold text-white rounded-xl flex items-center justify-center gap-2"
                    >
                      <span>WhatsApp Chat</span>
                    </a>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      handleOpenEmailPreview('job_application', null, null, {
                        fullName: selectedApp.fullName,
                        email: selectedApp.email,
                        phone: selectedApp.phone,
                        jobTitle: selectedApp.jobTitle,
                        licenseClass: selectedApp.licenseClass,
                        cityState: selectedApp.cityState,
                      });
                    }}
                    className="w-full py-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 font-black text-xs rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-sm"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Preview HR Confirmation Email (Mock Previewer)</span>
                  </button>

                  {/* Status & Admin Notes Editor */}
                  <div className="space-y-3 pt-3 border-t border-slate-800 text-xs">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">
                        Application Status Workflow
                      </label>
                      <select
                        value={selectedApp.status}
                        onChange={(e) => {
                          const newStatus = e.target.value as JobApplication['status'];
                          updateJobApplicationStatus(selectedApp.id, newStatus, selectedApp.adminNotes);
                          setSelectedApp({ ...selectedApp, status: newStatus });
                          showToast(`Application marked as ${newStatus.replace('_', ' ')}`);
                        }}
                        className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-3 outline-none focus:border-amber-400 font-bold"
                      >
                        <option value="submitted">Submitted (New Application)</option>
                        <option value="under_review">Under Review / Background Check</option>
                        <option value="interview_scheduled">Interview & Road Test Scheduled</option>
                        <option value="offer_extended">Job Offer Extended</option>
                        <option value="hired">Hired (Onboarded to Fleet)</option>
                        <option value="rejected">Rejected / Not Qualified</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-bold mb-1">
                        Internal HR & Dispatch Notes
                      </label>
                      <textarea
                        rows={3}
                        defaultValue={selectedApp.adminNotes || ''}
                        onBlur={(e) => {
                          updateJobApplicationStatus(selectedApp.id, selectedApp.status, e.target.value);
                          setSelectedApp({ ...selectedApp, adminNotes: e.target.value });
                          showToast('HR notes updated');
                        }}
                        placeholder="e.g. Guarantors confirmed via phone call. Practical road test on 30-ton trailer scheduled for Tuesday in Abuja."
                        className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-3 outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Delete application for ${selectedApp.fullName}?`)) {
                          deleteJobApplication(selectedApp.id);
                          setSelectedApp(null);
                          showToast('Application deleted.');
                        }
                      }}
                      className="text-xs font-bold text-red-400 hover:underline flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Application</span>
                    </button>

                    <button
                      onClick={() => setSelectedApp(null)}
                      className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl"
                    >
                      Done
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ==================================================== */}
        {/* TAB: INVESTOR FLEET ASSETS & SITE SURVEY VERIFICATION */}
        {/* ==================================================== */}
        {activeTab === 'investor_fleet' && (
          <AdminInvestorFleetTab showToast={showToast} />
        )}

        {/* ==================================================== */}
        {/* TAB 12: MAILING LIST & NEWSLETTER SUBSCRIBERS */}
        {/* ==================================================== */}
        {activeTab === 'newsletter' && (
          <AdminNewsletterTab />
        )}

        {/* ==================================================== */}
        {/* TAB 13: EMAIL SERVICE & TRANSACTIONAL DISPATCH LOGS */}
        {/* ==================================================== */}
        {activeTab === 'email' && (
          <AdminEmailTab 
            showToast={showToast} 
            onOpenMockPreview={(tpl) => handleOpenEmailPreview(tpl || 'quote_confirmation')}
          />
        )}

        {/* ==================================================== */}
        {/* TAB 14: SMS NOTIFICATION GATEWAY & TWILIO LOGS */}
        {/* ==================================================== */}
        {activeTab === 'sms' && (
          <AdminSmsTab onOpenBatchNotifications={() => setActiveTab('batch_notifications')} />
        )}

        {/* ==================================================== */}
        {/* TAB: BATCH NOTIFICATIONS & WEATHER DELAY BROADCAST */}
        {/* ==================================================== */}
        {activeTab === 'batch_notifications' && (
          <AdminBatchNotificationsTab showToast={showToast} />
        )}

        {/* ==================================================== */}
        {/* TAB 15: SECURITY & PASSKEY MANAGEMENT */}
        {/* ==================================================== */}
        {activeTab === 'security' && (
          <AdminSecurityTab showToast={showToast} />
        )}

        {/* ==================================================== */}
        {/* TAB: WHATSAPP LEAD CONVERSION INTELLIGENCE */}
        {/* ==================================================== */}
        {activeTab === 'lead_conversions' && (
          <div className="pt-8">
            <AdminLeadConversionTab onNotify={(msg) => showToast(msg)} />
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 14: SEO & SITEMAP XML GENERATOR */}
        {/* ==================================================== */}
        {activeTab === 'seo' && (
          <AdminSeoTab showToast={showToast} />
        )}

        {/* ==================================================== */}
        {/* TAB 15: SYSTEM BACKUP, EXPORT & RESET */}
        {/* ==================================================== */}
        {activeTab === 'system' && (
          <div className="pt-8 space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl space-y-6">
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-amber-400" />
                <span>Configuration Backups & Factory Reset</span>
              </h2>

              <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
                You can download a complete backup of all custom text, photos, services, and pricing benchmarks. This JSON file can be re-imported anytime or migrated to another instance.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <button
                  onClick={handleDownloadBackup}
                  className="p-5 bg-slate-950 border border-slate-800 hover:border-amber-400/50 rounded-2xl text-left space-y-2 group transition-all"
                >
                  <Download className="w-6 h-6 text-amber-400 group-hover:scale-110 transition-transform" />
                  <h4 className="font-bold text-white text-sm">Download Backup (JSON)</h4>
                  <p className="text-xs text-slate-400">Save site configuration snapshot to your computer.</p>
                </button>

                <label className="p-5 bg-slate-950 border border-slate-800 hover:border-amber-400/50 rounded-2xl text-left space-y-2 group transition-all cursor-pointer">
                  <input type="file" accept=".json" onChange={handleUploadBackup} className="hidden" />
                  <Upload className="w-6 h-6 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <h4 className="font-bold text-white text-sm">Restore from JSON</h4>
                  <p className="text-xs text-slate-400">Upload a previously exported backup file.</p>
                </label>

                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to reset all site pages and photos back to factory default?')) {
                      resetToDefaults();
                      showToast('Site reset to factory defaults.');
                    }
                  }}
                  className="p-5 bg-red-950/30 border border-red-900/40 hover:border-red-500 rounded-2xl text-left space-y-2 group transition-all"
                >
                  <RefreshCw className="w-6 h-6 text-red-400 group-hover:scale-110 transition-transform" />
                  <h4 className="font-bold text-white text-sm">Reset to Factory Defaults</h4>
                  <p className="text-xs text-slate-400">Restores default text and curated sample photos.</p>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Mock Email Preview Modal */}
      <MockEmailPreviewModal
        isOpen={emailPreviewModalOpen}
        onClose={() => {
          setEmailPreviewModalOpen(false);
          setEmailPreviewQuote(null);
          setEmailPreviewShipment(null);
          setEmailPreviewApplicant(null);
        }}
        initialTemplate={emailPreviewTemplate}
        quoteData={emailPreviewQuote}
        shipmentData={emailPreviewShipment}
        applicantData={emailPreviewApplicant}
        showToast={showToast}
      />
    </div>
  );
};
