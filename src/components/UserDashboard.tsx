import React, { useState, useEffect, useMemo } from 'react';
import {
  User,
  Shield,
  ShieldCheck,
  Package,
  Truck,
  Car,
  Image as ImageIcon,
  FileText,
  Clock,
  MapPin,
  Calendar,
  Lock,
  Unlock,
  LogOut,
  LogIn,
  KeyRound,
  Trash2,
  Download,
  ExternalLink,
  Plus,
  Camera,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Eye,
  X,
  Search,
  Building2,
  Layers,
  MessageCircle,
  HelpCircle,
  FileBadge,
  FolderLock,
  PenTool,
  Stamp,
  Check,
  FileDown,
  Smartphone,
  Send,
  Coins,
  Navigation
} from 'lucide-react';
import { useCms } from '../context/CmsContext';
import { PageView, ServiceType, SiteSurveyPhoto, CustomerUser, CustomerSavedQuote, ShipmentTrackStatus, VaultDocument, SignatureRecord, DashboardTab, CarHireTripType } from '../types';
import jsPDF from 'jspdf';
import { DocumentVault } from './DocumentVault';
import { DigitalSignatureModal } from './DigitalSignatureModal';
import { BillOfLadingModal, generateBillOfLadingPdf } from './BillOfLadingModal';
import { InvestorPayoutsTab } from './InvestorPayoutsTab';
import { ActiveFleetOverviewMap } from './ActiveFleetOverviewMap';
import { SAMPLE_INVESTOR_STATEMENTS } from '../data/sampleInvestorStatements';
import { useAuth } from '../context/AuthContext';
import registeredSignImg from '../assets/images/registered_trademark_sign_1790283777721.jpg';

const CUSTOMER_SESSION_KEY = 'megatrend_customer_session';
const CUSTOMER_PROFILE_KEY = 'megatrend_customer_profile';
const SAVED_QUOTES_KEY = 'megatrend_customer_saved_quotes';
const INVENTORY_PHOTOS_KEY = 'megatrend_inventory_survey_photos';
const INVENTORY_ITEMS_KEY = 'megatrend_inventory_planner_items';

interface UserDashboardProps {
  onNavigatePage: (page: PageView, service?: ServiceType) => void;
  onOpenQuoteModal: (service?: ServiceType, origin?: string, dest?: string) => void;
  onOpenCarHireModal?: (tripType?: CarHireTripType, vehicleId?: string) => void;
  initialTab?: DashboardTab;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  onNavigatePage,
  onOpenQuoteModal,
  onOpenCarHireModal,
  initialTab,
}) => {
  const { cms, updateShipment } = useCms();
  const {
    user,
    customerProfile,
    loading: authLoading,
    error: authErrorContext,
    clearError,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signInWithDemoUser,
    logout,
    userShipments,
    userDocuments,
    userQuotes,
    saveQuoteToCloud,
    deleteQuoteFromCloud,
    saveDocumentToCloud,
    updateDocumentInCloud,
    updateProfileInCloud,
    updateShipmentInCloud,
  } = useAuth();

  const phone = cms.company?.phones?.[0] || '08062466212';
  const cleanPhone = phone.replace(/\D/g, '');
  const waNumber = cleanPhone.startsWith('0') ? `234${cleanPhone.slice(1)}` : cleanPhone;

  // Authentication State is derived from Firebase Auth context
  const isAuthenticated = !!user || !!customerProfile;

  const currentUser: CustomerUser = useMemo(() => {
    if (customerProfile) return customerProfile;
    if (user) {
      return {
        id: user.uid,
        fullName: user.displayName || user.email?.split('@')[0] || 'Client',
        email: user.email || 'client@pyda.ng',
        phone: user.phoneNumber || '+234 803 555 0192',
        companyName: 'Client Account',
        defaultCity: 'Lagos',
        registeredAt: 'Active Session',
      };
    }
    return {
      id: 'CUST-84920',
      fullName: 'Chief Emeka Adeleke',
      email: 'emeka.adeleke@groupcorp.ng',
      phone: '+234 803 555 0192',
      companyName: 'Adeleke Logistics & Holdings',
      defaultCity: 'Lagos (Victoria Island)',
      registeredAt: 'January 2026',
    };
  }, [customerProfile, user]);

  // Profile Editing Form State
  const [profileForm, setProfileForm] = useState<CustomerUser>(currentUser);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    setProfileForm(currentUser);
  }, [currentUser]);

  // Login / Auth Form State
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authCompanyName, setAuthCompanyName] = useState('');
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active Tab: 'quotes' | 'tracking' | 'vault' | 'inventory' | 'payouts' | 'profile'
  const [activeTab, setActiveTab] = useState<DashboardTab>(initialTab || 'quotes');

  // Shipment Search & Filter Query
  const [shipmentSearchQuery, setShipmentSearchQuery] = useState('');

  // Customer Data States
  const [savedQuotes, setSavedQuotes] = useState<CustomerSavedQuote[]>(() => {
    try {
      const saved = localStorage.getItem(SAVED_QUOTES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}

    // Default sample quotes for new session
    return [
      {
        id: 'QUO-LAG-ABJ-904',
        serviceType: 'corporate',
        fullName: 'Chief Emeka Adeleke',
        email: 'emeka.adeleke@groupcorp.ng',
        phone: '+234 803 555 0192',
        companyName: 'Adeleke Logistics & Holdings',
        originCity: 'Lagos (Victoria Island)',
        destinationCity: 'Abuja (Maitama)',
        movingDate: '2026-09-15',
        propertySize: 'Executive 5-Bed Penthouse + 2 Office Suites',
        needsPacking: true,
        needsStorage: false,
        needsInsurance: true,
        estimatedCostNaira: 1450000,
        status: 'approved',
        savedAt: '2026-08-20T14:30:00Z',
        notes: 'Includes hydraulic liftgate container truck and 100% GIT Insurance policy cover.',
      },
      {
        id: 'QUO-RES-IBD-322',
        serviceType: 'residential',
        fullName: 'Chief Emeka Adeleke',
        email: 'emeka.adeleke@groupcorp.ng',
        phone: '+234 803 555 0192',
        originCity: 'Lagos (Lekki Phase 1)',
        destinationCity: 'Ibadan (Bodija Estate)',
        movingDate: '2026-10-02',
        propertySize: '3-Bedroom Luxury Apartment',
        needsPacking: true,
        needsStorage: true,
        needsInsurance: true,
        estimatedCostNaira: 480000,
        status: 'pending',
        savedAt: '2026-08-22T09:15:00Z',
        notes: 'Requires 14-day climate-controlled palletized storage allotment.',
      },
    ];
  });

  // Saved Inventory Survey Photos
  const [surveyPhotos, setSurveyPhotos] = useState<SiteSurveyPhoto[]>(() => {
    try {
      const saved = localStorage.getItem(INVENTORY_PHOTOS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });

  // Photo Zoom Preview Modal
  const [previewPhoto, setPreviewPhoto] = useState<SiteSurveyPhoto | null>(null);

  // Digital Signature Modal States
  const [isSignModalOpen, setIsSignModalOpen] = useState<boolean>(false);
  const [activeQuoteForSigning, setActiveQuoteForSigning] = useState<CustomerSavedQuote | null>(null);
  const [activeDocForSigning, setActiveDocForSigning] = useState<VaultDocument | null>(null);
  const [toastNotification, setToastNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // Bill of Lading (BOL) Document Generator States
  const [isBolModalOpen, setIsBolModalOpen] = useState<boolean>(false);
  const [activeShipmentForBol, setActiveShipmentForBol] = useState<ShipmentTrackStatus | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(SAVED_QUOTES_KEY, JSON.stringify(savedQuotes));
    } catch (e) {
      console.error('Failed to sync saved quotes', e);
    }
  }, [savedQuotes]);

  useEffect(() => {
    try {
      localStorage.setItem(CUSTOMER_PROFILE_KEY, JSON.stringify(currentUser));
    } catch (e) {
      console.error('Failed to sync profile', e);
    }
  }, [currentUser]);

  // Auth Handlers
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    clearError();

    if (!authEmail.trim() || !authPassword.trim()) {
      setAuthError('Please enter your email and password.');
      return;
    }

    if (authPassword.length < 6) {
      setAuthError('Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (authMode === 'login') {
        await signInWithEmail(authEmail, authPassword);
      } else {
        await signUpWithEmail(authEmail, authPassword, authName, authPhone, authCompanyName);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleDeleteQuote = (id?: string) => {
    if (!id) return;
    if (confirm('Are you sure you want to remove this saved quote from your dashboard?')) {
      setSavedQuotes((prev) => prev.filter((q) => q.id !== id));
    }
  };

  const handleDeletePhoto = (photoId: string) => {
    if (confirm('Remove this survey photo?')) {
      const updated = surveyPhotos.filter((p) => p.id !== photoId);
      setSurveyPhotos(updated);
      try {
        localStorage.setItem(INVENTORY_PHOTOS_KEY, JSON.stringify(updated));
      } catch {}
    }
  };

  // Export Quote to PDF
  const handleDownloadQuotePdf = (quote: CustomerSavedQuote) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header Banner
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setFillColor(245, 158, 11); // amber-500
    doc.rect(0, 40, pageWidth, 2, 'F');

    doc.setTextColor(245, 158, 11);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('PYDA MOVERS & LOGISTICS', 14, 16);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.text('Customer Portal - Official Saved Relocation Quotation', 14, 23);
    doc.text(`Customer: ${quote.fullName} | Date: ${new Date().toLocaleDateString('en-GB')}`, 14, 29);
    doc.text(`24/7 Dispatch Hotline: ${phone}`, 14, 35);

    // Reference Pill
    doc.setFillColor(30, 41, 59);
    doc.roundedRect(pageWidth - 70, 10, 56, 20, 2, 2, 'F');
    doc.setTextColor(245, 158, 11);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text('QUOTE REFERENCE', pageWidth - 66, 17);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9.5);
    doc.text(quote.id || 'QUO-SAVED', pageWidth - 66, 25);

    let currentY = 52;

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Relocation Scope & Freight Route Details', 14, currentY);
    currentY += 6;

    // Details Grid Box
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, currentY, 182, 48, 2, 2, 'FD');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text('ORIGIN LOCATION', 18, currentY + 8);
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(quote.originCity, 18, currentY + 14);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text('DESTINATION LOCATION', 108, currentY + 8);
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(quote.destinationCity, 108, currentY + 14);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text('SERVICE CLASS & PROPERTY', 18, currentY + 24);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(`${quote.serviceType.toUpperCase()} - ${quote.propertySize || 'Standard Volume'}`, 18, currentY + 30);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text('MOVING DATE SCHEDULED', 108, currentY + 24);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(quote.movingDate || 'Flexible Schedule', 108, currentY + 30);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text('TOTAL ESTIMATED NAIRA', 18, currentY + 38);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(217, 119, 6);
    doc.text(`₦${(quote.estimatedCostNaira || 0).toLocaleString('en-NG')}`, 18, currentY + 45);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text('INCLUDED SAFEGUARDS', 108, currentY + 38);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(5, 150, 105);
    doc.text('100% Comprehensive GIT Insurance & Live GPS Tracking', 108, currentY + 44);

    currentY += 58;

    if (quote.notes) {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(71, 85, 105);
      doc.text(`Notes: ${quote.notes}`, 14, currentY);
      currentY += 8;
    }

    doc.save(`Pyda_Quote_${quote.id || 'Document'}.pdf`);
  };

  // Digital Signature Handlers
  const handleOpenSignForQuote = (quote: CustomerSavedQuote) => {
    setActiveQuoteForSigning(quote);
    setActiveDocForSigning(null);
    setIsSignModalOpen(true);
  };

  const handleOpenSignForDoc = (doc?: VaultDocument) => {
    setActiveDocForSigning(doc || null);
    setActiveQuoteForSigning(null);
    setIsSignModalOpen(true);
  };

  const handleSignComplete = (signedDoc: VaultDocument, quoteId?: string, signatureRecord?: SignatureRecord) => {
    // 1. Update quote if tied to a quote
    if (quoteId) {
      setSavedQuotes((prev) =>
        prev.map((q) => {
          if (q.id === quoteId) {
            return {
              ...q,
              status: 'approved',
              signedStatus: 'signed',
              signedAt: signatureRecord?.signedAt,
              signedAgreementId: signedDoc.id,
              signatureRecord,
            };
          }
          return q;
        })
      );
    }

    // 2. Persist to vault documents in localStorage
    try {
      const existingDocsStr = localStorage.getItem('megatrend_customer_vault_docs');
      let currentDocs: VaultDocument[] = [];
      if (existingDocsStr) {
        currentDocs = JSON.parse(existingDocsStr);
      }
      const filtered = currentDocs.filter((d) => d.id !== signedDoc.id);
      localStorage.setItem('megatrend_customer_vault_docs', JSON.stringify([signedDoc, ...filtered]));
    } catch (e) {
      console.error('Failed to sync signed document to vault storage', e);
    }

    setToastNotification({
      message: `Agreement #${signedDoc.referenceNumber} has been digitally signed and sealed with PKI stamp.`,
      type: 'success',
    });

    setTimeout(() => {
      setToastNotification(null);
    }, 6000);
  };

  // Bill of Lading (BOL) Handlers
  const handleOpenBolModal = (shipment: ShipmentTrackStatus) => {
    setActiveShipmentForBol(shipment);
    setIsBolModalOpen(true);
  };

  const handleDirectDownloadBol = (shipment: ShipmentTrackStatus) => {
    try {
      const bolNumber = generateBillOfLadingPdf(shipment, currentUser);
      setToastNotification({
        message: `Bill of Lading #${bolNumber} generated and downloaded as official PDF.`,
        type: 'success',
      });
      setTimeout(() => setToastNotification(null), 5000);
    } catch (err: any) {
      alert(`Failed to generate Bill of Lading PDF: ${err.message || 'Unknown error'}`);
    }
  };

  const handleSaveBolToVault = async (doc: VaultDocument) => {
    try {
      // 1. If Firebase Auth is active, save to cloud
      if (user) {
        await saveDocumentToCloud(doc);
      }

      // 2. Also ensure local storage persistence for Document Vault
      const existingDocsStr = localStorage.getItem('megatrend_customer_vault_docs');
      let currentDocs: VaultDocument[] = [];
      if (existingDocsStr) {
        currentDocs = JSON.parse(existingDocsStr);
      }
      const filtered = currentDocs.filter((d) => d.id !== doc.id);
      localStorage.setItem('megatrend_customer_vault_docs', JSON.stringify([doc, ...filtered]));

      setToastNotification({
        message: `Bill of Lading #${doc.referenceNumber} permanently registered in your Document Vault.`,
        type: 'success',
      });
      setTimeout(() => setToastNotification(null), 5000);
    } catch (err: any) {
      console.error('Failed to register BOL in Document Vault', err);
    }
  };

  // Real-Time SMS Notification States & Handlers (via Twilio Gateway)
  const [smsTogglingShipmentId, setSmsTogglingShipmentId] = useState<string | null>(null);
  const [smsSendingCheckpointId, setSmsSendingCheckpointId] = useState<string | null>(null);
  const [customPhoneInputs, setCustomPhoneInputs] = useState<Record<string, string>>({});
  const [isEditingPhone, setIsEditingPhone] = useState<Record<string, boolean>>({});

  const handleToggleSmsNotifications = async (shipment: ShipmentTrackStatus) => {
    const isCurrentlyEnabled = !!shipment.smsNotificationsEnabled;
    const targetState = !isCurrentlyEnabled;
    const recipientPhone =
      customPhoneInputs[shipment.trackingId]?.trim() ||
      shipment.smsNotificationPhone ||
      currentUser.phone ||
      '08062466212';

    setSmsTogglingShipmentId(shipment.trackingId);

    try {
      const response = await fetch('/api/sms/toggle-shipment-notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackingId: shipment.trackingId,
          enabled: targetState,
          recipientPhone,
          recipientName: currentUser.fullName,
          shipment,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const updates: Partial<ShipmentTrackStatus> = {
          smsNotificationsEnabled: targetState,
          smsNotificationPhone: recipientPhone,
          ...(targetState && data.result?.messageSid
            ? {
                smsLastDispatchedAt: new Date().toISOString(),
                smsLastDispatchedSid: data.result.messageSid,
              }
            : {}),
        };

        // 1. Sync with Firebase Firestore
        await updateShipmentInCloud(shipment.trackingId, updates);

        // 2. Sync with CMS context
        updateShipment(shipment.trackingId, updates);

        // 3. Clear phone edit state
        setIsEditingPhone((prev) => ({ ...prev, [shipment.trackingId]: false }));

        setToastNotification({
          message: targetState
            ? `Real-time SMS alerts activated for Convoy #${shipment.trackingId} via Twilio Gateway! Verification SMS dispatched to ${recipientPhone}.`
            : `SMS alerts paused for Convoy #${shipment.trackingId}.`,
          type: 'success',
        });
      } else {
        throw new Error(data.message || 'Failed to update SMS preference');
      }
    } catch (err: any) {
      console.error('Error toggling shipment SMS:', err);
      setToastNotification({
        message: `Failed to toggle SMS alerts: ${err.message || 'Unknown network error'}`,
        type: 'info',
      });
    } finally {
      setSmsTogglingShipmentId(null);
      setTimeout(() => setToastNotification(null), 6000);
    }
  };

  const handleSendLiveCheckpointSms = async (shipment: ShipmentTrackStatus) => {
    const recipientPhone =
      customPhoneInputs[shipment.trackingId]?.trim() ||
      shipment.smsNotificationPhone ||
      currentUser.phone ||
      '08062466212';

    setSmsSendingCheckpointId(shipment.trackingId);

    try {
      const response = await fetch('/api/sms/notify-shipment-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackingId: shipment.trackingId,
          recipientPhone,
          recipientName: currentUser.fullName,
          shipment,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const updates: Partial<ShipmentTrackStatus> = {
          smsLastDispatchedAt: new Date().toISOString(),
          smsLastDispatchedSid: data.result?.messageSid || 'SM-TWILIO-DIRECT-OK',
        };

        await updateShipmentInCloud(shipment.trackingId, updates);
        updateShipment(shipment.trackingId, updates);

        setToastNotification({
          message: `Live convoy status SMS successfully dispatched to ${recipientPhone} via Twilio Gateway (SID: ${data.result?.messageSid || 'VERIFIED'}).`,
          type: 'success',
        });
      } else {
        throw new Error(data.message || 'Failed to dispatch status SMS');
      }
    } catch (err: any) {
      console.error('Error sending checkpoint SMS:', err);
      setToastNotification({
        message: `Failed to dispatch status SMS: ${err.message || 'Gateway error'}`,
        type: 'info',
      });
    } finally {
      setSmsSendingCheckpointId(null);
      setTimeout(() => setToastNotification(null), 6000);
    }
  };

  // Active Shipments linked to current customer (real-time from Firestore)
  const customerShipments = useMemo(() => {
    if (userShipments && userShipments.length > 0) {
      return userShipments;
    }
    const all = cms.shipments || [];
    return all;
  }, [userShipments, cms.shipments]);

  // Filtered shipments by search query (tracking number, origin, destination, driver, vehicle plate)
  const filteredCustomerShipments = useMemo(() => {
    const query = shipmentSearchQuery.trim().toLowerCase();
    if (!query) return customerShipments;

    return customerShipments.filter((shipment) => {
      const trackingId = (shipment.trackingId || '').toLowerCase();
      const origin = (shipment.origin || '').toLowerCase();
      const destination = (shipment.destination || '').toLowerCase();
      const driverName = (shipment.driverName || '').toLowerCase();
      const currentLocation = (shipment.currentLocation || '').toLowerCase();
      const vehiclePlate = (shipment.vehiclePlate || '').toLowerCase();
      const status = (shipment.status || '').toLowerCase();

      return (
        trackingId.includes(query) ||
        origin.includes(query) ||
        destination.includes(query) ||
        driverName.includes(query) ||
        currentLocation.includes(query) ||
        vehiclePlate.includes(query) ||
        status.includes(query)
      );
    });
  }, [customerShipments, shipmentSearchQuery]);

  // Active Quotes (real-time from Firestore)
  const displayQuotes = useMemo(() => {
    if (userQuotes && userQuotes.length > 0) {
      return userQuotes;
    }
    return savedQuotes;
  }, [userQuotes, savedQuotes]);

  // If Not Authenticated: Render Secure Login / Register Screen
  if (!isAuthenticated) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-16 animate-in fade-in duration-300">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-md mx-auto space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 flex items-center justify-center mx-auto shadow-xl">
                <Lock className="w-8 h-8 stroke-[2.5]" />
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Secured with Firebase Authentication</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center justify-center gap-1.5">
                <span>Pyda</span>
                <img
                  src={registeredSignImg}
                  alt="Registered Sign"
                  referrerPolicy="no-referrer"
                  className="w-4 h-4 rounded-full object-cover ring-1 ring-amber-400/50 shadow-sm"
                  title="Registered Trademark"
                />
                <span className="text-amber-400">Customer Portal</span>
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm">
                Authenticate to access your real-time shipment convoys, digital PKI Document Vault, and saved quotes.
              </p>
            </div>

            {/* Quick Demo Access Bar */}
            <div className="bg-slate-950/80 border border-amber-500/20 rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center justify-between text-[11px] font-bold text-amber-400">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Instant 1-Click Demo Access</span>
                </span>
                <span className="text-[10px] text-slate-500">Live Firebase Session</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={async () => {
                    setIsSubmitting(true);
                    await signInWithDemoUser('vip');
                    setIsSubmitting(false);
                  }}
                  className="py-2.5 px-3 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/40 text-slate-200 hover:text-amber-400 rounded-xl text-xs font-bold transition-all text-center"
                  id="portal-vip-demo-btn"
                >
                  👑 VIP Client (Adeleke)
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={async () => {
                    setIsSubmitting(true);
                    await signInWithDemoUser('corporate');
                    setIsSubmitting(false);
                  }}
                  className="py-2.5 px-3 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/40 text-slate-200 hover:text-amber-400 rounded-xl text-xs font-bold transition-all text-center"
                  id="portal-corp-demo-btn"
                >
                  🏢 Corporate Dispatch
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-800" />
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">or sign in with email</span>
              <div className="flex-1 h-px bg-slate-800" />
            </div>

            {/* Mode Switcher */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setAuthError('');
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  authMode === 'login' ? 'bg-amber-500 text-slate-950 font-black shadow' : 'text-slate-400 hover:text-white'
                }`}
                id="portal-tab-login"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setAuthError('');
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  authMode === 'register' ? 'bg-amber-500 text-slate-950 font-black shadow' : 'text-slate-400 hover:text-white'
                }`}
                id="portal-tab-register"
              >
                Register Account
              </button>
            </div>

            {(authError || authErrorContext) && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError || authErrorContext}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              {authMode === 'register' && (
                <>
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1.5">Full Name / Contact Person</label>
                    <input
                      type="text"
                      placeholder="e.g. Chief Emeka Adeleke"
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 text-white text-xs rounded-xl p-3 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1.5">Phone Number (WhatsApp Active)</label>
                    <input
                      type="tel"
                      placeholder="+234 803 000 0000"
                      value={authPhone}
                      onChange={(e) => setAuthPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 text-white text-xs rounded-xl p-3 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1.5">Company Name (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Adeleke Logistics & Holdings"
                      value={authCompanyName}
                      onChange={(e) => setAuthCompanyName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 text-white text-xs rounded-xl p-3 outline-none"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">Customer Email Address</label>
                <input
                  type="email"
                  placeholder="name@company.com"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 text-white text-xs rounded-xl p-3 outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 text-white text-xs rounded-xl p-3 outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm py-3.5 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50"
                id="portal-login-btn"
              >
                <KeyRound className="w-4 h-4" />
                <span>
                  {isSubmitting
                    ? 'Authenticating...'
                    : authMode === 'login'
                    ? 'Access Protected Dashboard'
                    : 'Create Customer Profile'}
                </span>
              </button>
            </form>

            {/* Google Authentication */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={async () => {
                setIsSubmitting(true);
                try {
                  await signInWithGoogle();
                } catch (err: any) {
                  setAuthError(err.message || 'Google login failed');
                } finally {
                  setIsSubmitting(false);
                }
              }}
              className="w-full bg-slate-950 hover:bg-slate-850 border border-slate-800 text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors"
              id="portal-google-btn"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="border-t border-slate-800 pt-4 flex items-center justify-center gap-2 text-slate-500 text-[11px]">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>256-Bit Encrypted Client Session • Firebase Auth Gateway</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated Portal View
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Top Welcome & Profile Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-black text-xl shrink-0">
            {currentUser.fullName.charAt(0) || 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-black text-white">
                {currentUser.fullName}
              </h2>
              <span className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Verified Client</span>
              </span>
              <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Firestore Synced</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 flex flex-wrap items-center gap-3">
              <span>{currentUser.email}</span>
              <span>•</span>
              <span>{currentUser.phone}</span>
              {currentUser.companyName && (
                <>
                  <span>•</span>
                  <span className="text-amber-400/90 font-medium">{currentUser.companyName}</span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 relative z-10 w-full md:w-auto justify-between md:justify-end">
          <button
            type="button"
            onClick={() => onOpenQuoteModal('corporate')}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow flex items-center gap-1.5 transition-all active:scale-95"
            id="dashboard-new-quote-btn"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>New Quote</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 text-xs font-bold px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors"
            id="dashboard-signout-btn"
            title="Sign out of portal"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800 scrollbar-thin">
        {[
          { id: 'quotes', label: 'Saved Quotes & Estimates', icon: <FileText className="w-4 h-4" />, count: displayQuotes.length },
          { id: 'tracking', label: 'Shipment Tracking History', icon: <Truck className="w-4 h-4" />, count: customerShipments.length },
          { id: 'fleet', label: 'Active Fleet Overview', icon: <Navigation className="w-4 h-4" />, count: 12 },
          { id: 'vault', label: 'Document Vault (Insurance & Agreements)', icon: <FolderLock className="w-4 h-4" /> },
          { id: 'inventory', label: 'Inventory Survey Photos', icon: <ImageIcon className="w-4 h-4" />, count: surveyPhotos.length },
          { id: 'payouts', label: 'Investor Fleet Performance & Payouts', icon: <Coins className="w-4 h-4" />, count: 2 },
          { id: 'profile', label: 'Account & Security Settings', icon: <ShieldCheck className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
              activeTab === tab.id
                ? 'bg-amber-500 text-slate-950 shadow-lg'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                activeTab === tab.id ? 'bg-slate-950 text-amber-400' : 'bg-slate-800 text-slate-400'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* TAB 1: SAVED QUOTES & ESTIMATES */}
      {activeTab === 'quotes' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg sm:text-xl font-black text-white">Your Saved Relocation Quotes</h3>
              <p className="text-xs text-slate-400">Review, print formal PDF agreements, or confirm dispatch with your move coordinator.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => {
                  if (onOpenCarHireModal) {
                    onOpenCarHireModal('intra_state');
                  } else {
                    onNavigatePage('car_hire');
                  }
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-md active:scale-95"
                id="dashboard-quotes-book-car-hire-btn"
              >
                <Car className="w-3.5 h-3.5" />
                <span>Book Car Hire & Receipts</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigatePage('calculator')}
                className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-400 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Open Cost Estimator</span>
              </button>
            </div>
          </div>

          {displayQuotes.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/40 border border-dashed border-slate-800 rounded-3xl space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-white text-sm">No Saved Quotes Found</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">Use our interactive calculator or instant quote wizard to generate and save detailed relocation estimates.</p>
              </div>
              <button
                type="button"
                onClick={() => onOpenQuoteModal('corporate')}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl"
              >
                Create First Quote
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {displayQuotes.map((quote) => (
                <div
                  key={quote.id}
                  className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-3xl p-6 space-y-5 shadow-xl transition-all relative overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-amber-400 uppercase">{quote.id}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                          quote.status === 'approved'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                          {quote.status || 'saved'}
                        </span>
                      </div>
                      <h4 className="text-base font-extrabold text-white">
                        {quote.originCity} ➔ {quote.destinationCity}
                      </h4>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteQuote(quote.id)}
                      className="text-slate-500 hover:text-rose-400 p-1.5 transition-colors"
                      title="Remove saved quote"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Quote Metadata */}
                  <div className="bg-slate-950 rounded-2xl p-4 border border-slate-850 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Service Tier:</span>
                      <span className="text-slate-200 font-bold uppercase">{quote.serviceType} Move</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Property Volume:</span>
                      <span className="text-slate-200">{quote.propertySize || 'Standard Residential'}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Scheduled Date:</span>
                      <span className="text-slate-200 font-mono">{quote.movingDate || 'Flexible'}</span>
                    </div>
                    <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-800">
                      <span>Estimated Relocation Cost:</span>
                      <span className="text-base font-black text-amber-400 font-mono">
                        ₦{(quote.estimatedCostNaira || 0).toLocaleString('en-NG')}
                      </span>
                    </div>
                  </div>

                  {/* Digital Signature Status Banner */}
                  {quote.signatureRecord || quote.signedStatus === 'signed' ? (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-3.5 flex items-center justify-between text-xs text-emerald-400">
                      <div className="flex items-center gap-2.5">
                        <Stamp className="w-5 h-5 text-amber-400 shrink-0" />
                        <div>
                          <span className="font-bold text-white block">Contract Digitally Executed</span>
                          <span className="text-[10px] text-emerald-300 font-mono">
                            Signed: {quote.signatureRecord?.signedAt || quote.signedAt || 'Verified PKI'}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] bg-emerald-500/20 px-2.5 py-1 rounded-full font-bold border border-emerald-500/40 shrink-0">
                        PKI Sealed
                      </span>
                    </div>
                  ) : (
                    <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-amber-400">
                        <PenTool className="w-4 h-4" />
                        <span className="font-bold">Pending Client Signature</span>
                      </div>
                      <span className="text-[10px] text-slate-400">Required before truck dispatch</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {quote.signatureRecord || quote.signedStatus === 'signed' ? (
                      <button
                        type="button"
                        onClick={() => setActiveTab('vault')}
                        className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow"
                      >
                        <FolderLock className="w-3.5 h-3.5" />
                        <span>View in Vault</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleOpenSignForQuote(quote)}
                        className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow active:scale-98"
                        id={`sign-quote-btn-${quote.id}`}
                      >
                        <PenTool className="w-3.5 h-3.5" />
                        <span>Sign Contract & Manifest</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDownloadQuotePdf(quote)}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs py-2.5 px-3 rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5 text-amber-400" />
                      <span>PDF</span>
                    </button>

                    <a
                      href={`https://wa.me/${waNumber}?text=${encodeURIComponent(`Hello Pyda Movers! I would like to confirm and book my saved quote #${quote.id} (${quote.originCity} to ${quote.destinationCity}) for ₦${(quote.estimatedCostNaira || 0).toLocaleString('en-NG')}.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Confirm</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SHIPMENT TRACKING HISTORY */}
      {activeTab === 'tracking' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg sm:text-xl font-black text-white">Live Consignments & Tracking Logs</h3>
              <p className="text-xs text-slate-400">Track active trucks, driver telematics, tamper seal status, and delivery ETA.</p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setActiveTab('fleet')}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow active:scale-95"
                id="dashboard-open-active-fleet-map-btn"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Active Fleet Overview Map</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigatePage('tracking')}
                className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-400 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm"
                id="dashboard-open-live-map-btn"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Single-Shipment</span> Map
              </button>
            </div>
          </div>

          {/* Shipment Search Bar */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 sm:p-4 space-y-3 shadow-xl">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-amber-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                value={shipmentSearchQuery}
                onChange={(e) => setShipmentSearchQuery(e.target.value)}
                placeholder="Search by tracking #, origin city, destination, driver, or plate..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 text-white placeholder-slate-500 text-xs rounded-xl pl-10 pr-10 py-3 outline-none transition-colors"
                id="shipment-search-input"
              />
              {shipmentSearchQuery && (
                <button
                  type="button"
                  onClick={() => setShipmentSearchQuery('')}
                  className="absolute right-3 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  aria-label="Clear shipment search"
                  id="shipment-search-clear-btn"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick Filter Tag Bar & Results Counter */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/80 text-xs">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">Quick Filters:</span>
                {['Lagos', 'Abuja', 'Port Harcourt', 'In-Transit', 'En-Route'].map((tag) => {
                  const isActive = shipmentSearchQuery.toLowerCase() === tag.toLowerCase();
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setShipmentSearchQuery(isActive ? '' : tag)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                        isActive
                          ? 'bg-amber-500 text-slate-950 font-black shadow'
                          : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>

              <div className="text-[11px] text-slate-400 font-medium">
                Showing <strong className="text-amber-400 font-bold">{filteredCustomerShipments.length}</strong> of{' '}
                <strong className="text-slate-300">{customerShipments.length}</strong> consignments
              </div>
            </div>
          </div>

          {/* Shipment List or Empty Search State */}
          {filteredCustomerShipments.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/40 border border-dashed border-slate-800 rounded-3xl space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-white text-sm">
                  {shipmentSearchQuery
                    ? `No shipments matching "${shipmentSearchQuery}"`
                    : 'No Active Consignments Found'}
                </p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {shipmentSearchQuery
                    ? 'Try searching with a different tracking code (e.g. MGT-), origin state, or destination city.'
                    : 'Once your relocation quote is confirmed, your live GPS convoy will appear here automatically.'}
                </p>
              </div>
              {shipmentSearchQuery && (
                <button
                  type="button"
                  onClick={() => setShipmentSearchQuery('')}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl transition-colors"
                  id="clear-shipment-filter-empty-btn"
                >
                  Clear Search Filter
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCustomerShipments.map((shipment) => (
                <div
                  key={shipment.trackingId}
                  className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-3xl p-6 space-y-4 shadow-xl transition-all"
                  id={`shipment-card-${shipment.trackingId}`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold">
                        <Truck className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-black text-white">{shipment.trackingId}</span>
                          <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                            {shipment.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          <strong className="text-slate-200">{shipment.origin}</strong> ➔{' '}
                          <strong className="text-slate-200">{shipment.destination}</strong> • Driver:{' '}
                          {shipment.driverName || 'Captain Bello'}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onNavigatePage('tracking')}
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 self-start sm:self-auto transition-all shadow"
                    >
                      <span>View Telematics</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Progress Meter */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-400">
                        Current Position: <strong className="text-white">{shipment.currentLocation}</strong>
                      </span>
                      <span className="font-mono font-bold text-amber-400">{shipment.progressPercent}% Completed</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all duration-500"
                        style={{ width: `${shipment.progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Quick Telematics Badges */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs">
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Vehicle Plate</span>
                      <span className="font-mono text-slate-200 font-bold">{shipment.vehiclePlate || 'KJA-892-XY'}</span>
                    </div>
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Tamper Seal</span>
                      <span className="font-mono text-emerald-400 font-bold">{shipment.tamperSealCode || 'SEAL-99482'}</span>
                    </div>
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Cargo Temp</span>
                      <span className="font-mono text-slate-200 font-bold">{shipment.cargoTempCelsius || 24}°C (Dry)</span>
                    </div>
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Est. Arrival</span>
                      <span className="font-mono text-amber-400 font-bold">{shipment.estimatedArrival}</span>
                    </div>
                  </div>

                  {/* Real-Time SMS Status Notification Gateway via Twilio */}
                  <div className="bg-slate-950/90 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-4 space-y-3 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                            shipment.smsNotificationsEnabled
                              ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 shadow-sm shadow-emerald-500/10'
                              : 'bg-slate-900 border border-slate-800 text-slate-500'
                          }`}
                        >
                          <Smartphone className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-white">Real-Time SMS Status Notifications</span>
                            <span
                              className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full border transition-colors ${
                                shipment.smsNotificationsEnabled
                                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                  : 'bg-slate-900 text-slate-400 border-slate-800'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  shipment.smsNotificationsEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                                }`}
                              />
                              <span>{shipment.smsNotificationsEnabled ? 'Twilio Gateway Active' : 'Gateway Inactive'}</span>
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Automated live SMS alerts for highway checkpoints, driver rotations, and arrival milestones.
                          </p>
                        </div>
                      </div>

                      {/* Toggle Switch */}
                      <div className="flex items-center gap-3 self-end sm:self-center">
                        <span
                          className={`text-xs font-bold transition-colors ${
                            shipment.smsNotificationsEnabled ? 'text-emerald-400' : 'text-slate-500'
                          }`}
                        >
                          {shipment.smsNotificationsEnabled ? 'SMS Active' : 'SMS Disabled'}
                        </span>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={!!shipment.smsNotificationsEnabled}
                          id={`sms-toggle-${shipment.trackingId}`}
                          disabled={smsTogglingShipmentId === shipment.trackingId}
                          onClick={() => handleToggleSmsNotifications(shipment)}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                            shipment.smsNotificationsEnabled ? 'bg-emerald-500' : 'bg-slate-700'
                          } ${smsTogglingShipmentId === shipment.trackingId ? 'opacity-50 cursor-wait' : ''}`}
                          title={
                            shipment.smsNotificationsEnabled
                              ? 'Click to disable SMS status notifications'
                              : 'Click to enable real-time SMS status notifications via Twilio'
                          }
                        >
                          <span className="sr-only">Toggle SMS notifications for {shipment.trackingId}</span>
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                              shipment.smsNotificationsEnabled ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Recipient Phone & Checkpoint Dispatch Action */}
                    <div className="pt-2.5 border-t border-slate-900 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 text-xs">
                      {/* Phone configuration */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                          <Phone className="w-3 h-3 text-amber-400" />
                          <span>Recipient Phone:</span>
                        </span>

                        {isEditingPhone[shipment.trackingId] ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="tel"
                              value={
                                customPhoneInputs[shipment.trackingId] !== undefined
                                  ? customPhoneInputs[shipment.trackingId]
                                  : shipment.smsNotificationPhone || currentUser.phone || '08062466212'
                              }
                              onChange={(e) =>
                                setCustomPhoneInputs((prev) => ({
                                  ...prev,
                                  [shipment.trackingId]: e.target.value,
                                }))
                              }
                              className="bg-slate-900 border border-amber-500/50 text-white font-mono text-xs px-2.5 py-1 rounded-lg outline-none focus:border-amber-400 w-36"
                              placeholder="e.g. 08035550192"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const newPhone =
                                  customPhoneInputs[shipment.trackingId]?.trim() ||
                                  shipment.smsNotificationPhone ||
                                  currentUser.phone ||
                                  '08062466212';
                                const updates: Partial<ShipmentTrackStatus> = { smsNotificationPhone: newPhone };
                                updateShipmentInCloud(shipment.trackingId, updates);
                                updateShipment(shipment.trackingId, updates);
                                setIsEditingPhone((prev) => ({ ...prev, [shipment.trackingId]: false }));
                                setToastNotification({
                                  message: `SMS recipient phone updated to ${newPhone} for Convoy #${shipment.trackingId}.`,
                                  type: 'success',
                                });
                                setTimeout(() => setToastNotification(null), 4000);
                              }}
                              className="bg-amber-500 text-slate-950 px-2 py-1 rounded-lg font-bold text-[11px] hover:bg-amber-400"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setIsEditingPhone((prev) => ({ ...prev, [shipment.trackingId]: false }))}
                              className="text-slate-400 hover:text-white px-1 py-1 text-[11px]"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-slate-200 font-bold bg-slate-900 px-2.5 py-0.5 rounded-lg border border-slate-800">
                              {shipment.smsNotificationPhone || currentUser.phone || '08062466212'}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setCustomPhoneInputs((prev) => ({
                                  ...prev,
                                  [shipment.trackingId]:
                                    shipment.smsNotificationPhone || currentUser.phone || '08062466212',
                                }));
                                setIsEditingPhone((prev) => ({ ...prev, [shipment.trackingId]: true }));
                              }}
                              className="text-[11px] text-amber-400 hover:text-amber-300 underline font-medium"
                            >
                              Change
                            </button>
                          </div>
                        )}

                        {/* Dispatched meta details if active */}
                        {shipment.smsNotificationsEnabled && shipment.smsLastDispatchedSid && (
                          <span className="text-[10px] text-slate-400 font-mono hidden lg:inline">
                            • Last Twilio SID: <strong className="text-slate-300">{shipment.smsLastDispatchedSid.slice(0, 15)}...</strong>
                          </span>
                        )}
                      </div>

                      {/* On-Demand Live Checkpoint SMS Button */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={smsSendingCheckpointId === shipment.trackingId}
                          onClick={() => handleSendLiveCheckpointSms(shipment)}
                          className="flex-1 md:flex-none bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/40 text-amber-400 hover:text-amber-300 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                          id={`test-sms-btn-${shipment.trackingId}`}
                          title="Send on-demand live telematics checkpoint SMS to this phone"
                        >
                          <Send className={`w-3 h-3 ${smsSendingCheckpointId === shipment.trackingId ? 'animate-spin' : ''}`} />
                          <span>
                            {smsSendingCheckpointId === shipment.trackingId
                              ? 'Dispatching via Twilio...'
                              : 'Send Live Status SMS'}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Bill of Lading (BOL) Document Generator Toolbar */}
                  <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <FileBadge className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>
                        Official Non-Negotiable Bill of Lading • Ref: <strong className="font-mono text-slate-300">BOL-MGT-{shipment.trackingId.replace(/[^A-Za-z0-9]/g, '')}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenBolModal(shipment)}
                        className="flex-1 sm:flex-none bg-slate-950 hover:bg-slate-800 border border-slate-700 hover:border-amber-400 text-amber-400 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm"
                        id={`preview-bol-btn-${shipment.trackingId}`}
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Preview & Print BOL</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDirectDownloadBol(shipment)}
                        className="flex-1 sm:flex-none bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:text-amber-200 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all"
                        id={`download-bol-pdf-btn-${shipment.trackingId}`}
                        title="Instant Download PDF"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Download</span> PDF
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: ACTIVE FLEET OVERVIEW REAL-TIME MAP */}
      {activeTab === 'fleet' && (
        <ActiveFleetOverviewMap
          onSelectShipmentToTrack={(trackingId) => {
            setShipmentSearchQuery(trackingId);
            setActiveTab('tracking');
          }}
          onOpenQuoteModal={() => onOpenQuoteModal('corporate')}
        />
      )}

      {/* TAB 3: INVENTORY & SITE SURVEY PHOTOS */}
      {activeTab === 'inventory' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg sm:text-xl font-black text-white">Uploaded Inventory & Site Survey Photos</h3>
              <p className="text-xs text-slate-400">Visual proof of fragile items, server racks, and pre-loading cargo condition.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => onNavigatePage('inspection')}
                className="bg-gradient-to-r from-[#fed700] to-amber-500 hover:opacity-95 text-slate-950 text-xs font-black px-4 py-2 rounded-xl flex items-center gap-1.5 self-start sm:self-auto shadow-md active:scale-95 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
                <span>Google AI Studio Cargo Scanner</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigatePage('calculator')}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold px-3.5 py-2 rounded-xl border border-slate-700"
              >
                <span>Inventory Planner</span>
              </button>
            </div>
          </div>

          {surveyPhotos.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/40 border border-dashed border-slate-800 rounded-3xl space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
                <ImageIcon className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-white text-sm">No Survey Photos Attached</p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Powered by <strong className="text-amber-400">Google AI Studio</strong>. Use your device camera to automatically generate a labeled inventory manifest and fragility assessment using Gemini 3.8 Flash Vision.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => onNavigatePage('inspection')}
                  className="bg-gradient-to-r from-[#fed700] via-amber-400 to-[#83b735] text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl shadow-lg active:scale-95 transition-all flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
                  <span>Start Google AI Studio Cargo Inspection</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {surveyPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-2.5 space-y-2 group relative overflow-hidden"
                >
                  <div
                    className="relative aspect-video bg-slate-950 rounded-xl overflow-hidden cursor-pointer"
                    onClick={() => setPreviewPhoto(photo)}
                  >
                    <img
                      src={photo.dataUrl}
                      alt={photo.label}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Eye className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="truncate">
                      <span className="font-bold text-slate-200 block truncate">{photo.label}</span>
                      <span className="text-[10px] text-slate-500">{photo.category}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeletePhoto(photo.id)}
                      className="text-slate-500 hover:text-rose-400 p-1"
                      title="Delete photo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: DOCUMENT VAULT */}
      {activeTab === 'vault' && (
        <DocumentVault
          currentUser={currentUser}
          onOpenQuoteModal={() => onOpenQuoteModal('corporate')}
          onOpenSignModal={handleOpenSignForDoc}
          onOpenCarHireModal={onOpenCarHireModal || (() => onNavigatePage('car_hire'))}
        />
      )}

      {/* TAB 4: ACCOUNT & SECURITY SETTINGS */}
      {activeTab === 'profile' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 max-w-3xl">
          <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg sm:text-xl font-black text-white">Client Account & Security Settings</h3>
              <p className="text-xs text-slate-400">Manage verified contact details and company corporate preferences synchronized with Firestore.</p>
            </div>
            <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Cloud Synced</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-400 block mb-1">Full Name</label>
              <input
                type="text"
                value={profileForm.fullName}
                onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-3 outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="font-bold text-slate-400 block mb-1">Primary Email Address</label>
              <input
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-3 outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="font-bold text-slate-400 block mb-1">Phone Number (WhatsApp Active)</label>
              <input
                type="tel"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-3 outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="font-bold text-slate-400 block mb-1">Company / Organization Name</label>
              <input
                type="text"
                value={profileForm.companyName || ''}
                onChange={(e) => setProfileForm({ ...profileForm, companyName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-3 outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-white block">Security & Privacy Protocol</span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Your inventory photos and location coordinates are safeguarded using end-to-end client cryptographic storage and Firebase Authentication security rules.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              disabled={isSavingProfile}
              onClick={async () => {
                setIsSavingProfile(true);
                try {
                  await updateProfileInCloud(profileForm);
                  setToastNotification({
                    message: 'Customer profile synchronized and saved to Firebase Firestore successfully.',
                    type: 'success',
                  });
                  setTimeout(() => setToastNotification(null), 4000);
                } catch (err: any) {
                  alert(err.message || 'Failed to update profile');
                } finally {
                  setIsSavingProfile(false);
                }
              }}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl shadow disabled:opacity-50"
            >
              {isSavingProfile ? 'Saving to Cloud...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}

      {/* TAB 6: INVESTOR FLEET COMMISSION & PAYOUT STATEMENTS */}
      {activeTab === 'payouts' && (
        <InvestorPayoutsTab
          investorName={currentUser.fullName || 'Chief Adebayo Alabi'}
          investorCompany={currentUser.companyName || 'Alabi Prime Logistics Ltd'}
          onNavigateToInvestorRegistration={() => onNavigatePage('investors')}
          onShowToast={(msg, type) => {
            setToastNotification({ message: msg, type: type || 'success' });
            setTimeout(() => setToastNotification(null), 5000);
          }}
        />
      )}

      {/* Photo Preview Modal */}
      {previewPhoto && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setPreviewPhoto(null)}
        >
          <div
            className="bg-slate-900 border border-slate-800 rounded-3xl p-4 max-w-2xl w-full space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white text-sm">{previewPhoto.label}</h4>
                <p className="text-xs text-slate-400">{previewPhoto.category} • Captured: {new Date(previewPhoto.capturedAt).toLocaleDateString()}</p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewPhoto(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="rounded-2xl overflow-hidden bg-slate-950 max-h-[70vh] flex items-center justify-center">
              <img
                src={previewPhoto.dataUrl}
                alt={previewPhoto.label}
                className="w-full h-auto max-h-[70vh] object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* Interactive Digital Signature Modal */}
      <DigitalSignatureModal
        isOpen={isSignModalOpen}
        onClose={() => {
          setIsSignModalOpen(false);
          setActiveQuoteForSigning(null);
          setActiveDocForSigning(null);
        }}
        targetQuote={activeQuoteForSigning}
        targetDocument={activeDocForSigning}
        currentUser={currentUser}
        onSignComplete={handleSignComplete}
      />

      {/* Official Bill of Lading (BOL) Document Generator & PDF Modal */}
      <BillOfLadingModal
        isOpen={isBolModalOpen}
        onClose={() => {
          setIsBolModalOpen(false);
          setActiveShipmentForBol(null);
        }}
        shipment={activeShipmentForBol}
        currentUser={currentUser}
        onSaveToVault={handleSaveBolToVault}
      />

      {/* Floating Status Toast Notification */}
      {toastNotification && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-slate-900 border border-emerald-500/40 p-4 rounded-2xl shadow-2xl flex items-center gap-3 text-xs animate-in slide-in-from-bottom-5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <p className="text-slate-200 font-medium flex-1">
            {toastNotification.message}
          </p>
          <button
            type="button"
            onClick={() => setToastNotification(null)}
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
};
