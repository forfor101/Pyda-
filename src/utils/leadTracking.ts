import { WhatsAppLeadConversion, PageInquiryMetric, LeadStatus } from '../types';
import { db } from '../lib/firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, limit } from 'firebase/firestore';

export const LEADS_STORAGE_KEY = 'pyda_whatsapp_lead_conversions';

// Helper to determine readable page title from current route/hash
export function getReadablePageContext(pathname: string = window.location.pathname, hash: string = window.location.hash): { path: string; title: string } {
  const cleanHash = hash ? hash.toLowerCase() : '';
  const currentPath = pathname + (cleanHash || '');

  if (cleanHash.startsWith('#calculator')) {
    return { path: '/#calculator', title: 'Relocation Cost Calculator' };
  }
  if (cleanHash.startsWith('#tracking')) {
    return { path: '/#tracking', title: 'Live Fleet GPS Tracking' };
  }
  if (cleanHash.startsWith('#checklist')) {
    return { path: '/#checklist', title: 'Moving Day Checklist' };
  }
  if (cleanHash.startsWith('#coverage') || cleanHash.startsWith('#network')) {
    return { path: '/#coverage', title: 'Nationwide Network Coverage Map' };
  }
  if (cleanHash.startsWith('#services/corporate') || cleanHash.includes('corporate')) {
    return { path: '/#services/corporate', title: 'Corporate Office Relocation' };
  }
  if (cleanHash.startsWith('#services/commercial') || cleanHash.includes('commercial')) {
    return { path: '/#services/commercial', title: 'Commercial & Warehouse Logistics' };
  }
  if (cleanHash.startsWith('#services/residential') || cleanHash.includes('residential')) {
    return { path: '/#services/residential', title: 'Residential Moving & Crating' };
  }
  if (cleanHash.startsWith('#services/haulage') || cleanHash.includes('haulage')) {
    return { path: '/#services/haulage', title: 'Interstate Freight Haulage (3T-30T)' };
  }
  if (cleanHash.startsWith('#services')) {
    return { path: '/#services', title: 'Core Logistics Services' };
  }
  if (cleanHash.startsWith('#about')) {
    return { path: '/#about', title: 'About Pyda Movers & Fleet' };
  }
  if (cleanHash.startsWith('#contact')) {
    return { path: '/#contact', title: 'Direct Contact & Regional Hotlines' };
  }
  if (cleanHash.startsWith('#careers') || cleanHash.includes('jobs')) {
    return { path: '/#careers', title: 'Careers & Logistics Crew Portal' };
  }
  if (cleanHash.startsWith('#investor') || cleanHash.includes('fleet')) {
    return { path: '/#investor', title: 'Investor Fleet Partner Portal' };
  }
  if (cleanHash.startsWith('#faq')) {
    return { path: '/#faq', title: 'Frequently Asked Questions (FAQ)' };
  }
  if (cleanHash.startsWith('#admin')) {
    return { path: '/#admin', title: 'Admin Management Portal' };
  }

  return { path: '/', title: 'Home Page (Hero & Overview)' };
}

// Detect device category
export function detectDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop';
  const width = window.innerWidth;
  const ua = navigator.userAgent.toLowerCase();
  if (/mobile|android|iphone|ipod|blackberry|opera mini|iemobile/i.test(ua) || width < 768) {
    return 'mobile';
  }
  if (/ipad|tablet/i.test(ua) || (width >= 768 && width <= 1024)) {
    return 'tablet';
  }
  return 'desktop';
}

// Extract human readable source label
export function getSourceDisplayName(source: string): string {
  switch (source) {
    case 'floating_widget':
      return 'Floating WhatsApp Widget';
    case 'floating_prompt_option':
      return 'Floating Chat Prompt Option';
    case 'calculator_modal':
      return 'Quote Cost Calculator';
    case 'contact_section':
      return 'Contact Section Hotline';
    case 'footer_cta':
      return 'Footer Quick WhatsApp Link';
    case 'faq_section':
      return 'FAQ Support Coordinator';
    case 'branch_map':
      return 'Branch Office Map Pin';
    case 'coverage_map_modal':
      return 'Network Coverage Dispatch';
    case 'investor_fleet':
      return 'Investor Fleet VIP Line';
    case 'user_dashboard_quote':
      return 'Client Dashboard Saved Quote';
    case 'video_tour':
      return 'Facility Video Tour CTA';
    case 'logistics_expert':
      return 'Logistics Expert Consultation';
    case 'active_truck_map':
      return 'Live Fleet Driver WhatsApp';
    case 'qr_share':
      return 'QR Code WhatsApp Share';
    default:
      return source ? source.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'Direct WhatsApp Link';
  }
}

// Sample baseline conversions to demonstrate page attribution immediately
export const SAMPLE_LEAD_CONVERSIONS: WhatsAppLeadConversion[] = [
  {
    id: 'lead-wa-101',
    timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(), // 18 mins ago
    pageUrl: 'https://pydamovers.com/#calculator',
    pagePath: '/#calculator',
    pageTitle: 'Relocation Cost Calculator',
    source: 'calculator_modal',
    sourceLabel: 'Quote Cost Calculator',
    whatsappNumber: '2348062466212',
    inquiryMessage: 'Hello Pyda Movers! I would like to book a 3-bedroom duplex relocation quote from Lekki Phase 1 to Guzape Abuja.',
    status: 'new_lead',
    deviceType: 'mobile',
    referrer: 'https://google.com',
    estimatedValueNaira: 1450000,
    notes: 'Urgent weekend move. Sent automated quote PDF follow-up.',
    assignedStaff: 'Fatima Bello',
  },
  {
    id: 'lead-wa-102',
    timestamp: new Date(Date.now() - 1000 * 60 * 85).toISOString(), // 1.4 hrs ago
    pageUrl: 'https://pydamovers.com/#services/corporate',
    pagePath: '/#services/corporate',
    pageTitle: 'Corporate Office Relocation',
    source: 'floating_widget',
    sourceLabel: 'Floating WhatsApp Widget',
    whatsappNumber: '2348062466212',
    inquiryMessage: 'Hi, we are migrating 60 workstations and server racks from Victoria Island to Marina next month. Need corporate survey.',
    status: 'contacted',
    deviceType: 'desktop',
    referrer: 'https://linkedin.com',
    estimatedValueNaira: 4200000,
    notes: 'Called Facilities Director. Scheduled on-site physical survey for Friday 10 AM.',
    assignedStaff: 'Kayode Tamandi',
  },
  {
    id: 'lead-wa-103',
    timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(), // 4 hrs ago
    pageUrl: 'https://pydamovers.com/#coverage',
    pagePath: '/#coverage',
    pageTitle: 'Nationwide Network Coverage Map',
    source: 'branch_map',
    sourceLabel: 'Branch Office Map Pin',
    whatsappNumber: '2348025609972',
    inquiryMessage: 'Hello Abuja Branch Manager, inquiring about 30T haulage container movement from Abuja Idu Industrial Yard to Kano.',
    status: 'quote_sent',
    deviceType: 'desktop',
    referrer: 'Direct',
    estimatedValueNaira: 2800000,
    notes: 'Waybill draft generated. Awaiting client procurement LPO confirmation.',
    assignedStaff: 'Aliyu Danladi',
  },
  {
    id: 'lead-wa-104',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(), // 14 hrs ago
    pageUrl: 'https://pydamovers.com/#investor',
    pagePath: '/#investor',
    pageTitle: 'Investor Fleet Partner Portal',
    source: 'investor_fleet',
    sourceLabel: 'Investor Fleet VIP Line',
    whatsappNumber: '2348062466212',
    inquiryMessage: 'Hello Pyda Fleet Directorate, I have 3 units of 30-ton Sinotruk Howo flatbeds available for managed lease.',
    status: 'booked',
    deviceType: 'mobile',
    referrer: 'https://pydamovers.com/#investor',
    estimatedValueNaira: 3900000,
    notes: 'Physical vehicle inspection passed at Ikeja workshop. Signed lease agreement.',
    assignedStaff: 'Alhaji Yerima Forfor',
  },
  {
    id: 'lead-wa-105',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 29).toISOString(), // 1.2 days ago
    pageUrl: 'https://pydamovers.com/',
    pagePath: '/',
    pageTitle: 'Home Page (Hero & Overview)',
    source: 'floating_widget',
    sourceLabel: 'Floating WhatsApp Widget',
    whatsappNumber: '2348062466212',
    inquiryMessage: 'Inquiry: Heavy Haulage Logistics across Nigeria. Need rates for Lagos to Port Harcourt.',
    status: 'contacted',
    deviceType: 'mobile',
    referrer: 'https://instagram.com',
    estimatedValueNaira: 1950000,
    notes: 'Sent rate card via WhatsApp.',
    assignedStaff: 'Customer Desk',
  },
  {
    id: 'lead-wa-106',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    pageUrl: 'https://pydamovers.com/#faq',
    pagePath: '/#faq',
    pageTitle: 'Frequently Asked Questions (FAQ)',
    source: 'faq_section',
    sourceLabel: 'FAQ Support Coordinator',
    whatsappNumber: '2348062466212',
    inquiryMessage: 'Hello Pyda Movers! I have a specific relocation question about moving insurance and goods-in-transit policy.',
    status: 'booked',
    deviceType: 'desktop',
    referrer: 'https://google.com',
    estimatedValueNaira: 850000,
    notes: 'Transit insurance policy explained. Booking confirmed for residential relocation.',
    assignedStaff: 'Fatima Bello',
  },
];

// In-memory / local sync helper
export function getLocalLeadConversions(): WhatsAppLeadConversion[] {
  if (typeof window === 'undefined') return SAMPLE_LEAD_CONVERSIONS;
  try {
    const raw = localStorage.getItem(LEADS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(SAMPLE_LEAD_CONVERSIONS));
      return SAMPLE_LEAD_CONVERSIONS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : SAMPLE_LEAD_CONVERSIONS;
  } catch {
    return SAMPLE_LEAD_CONVERSIONS;
  }
}

export function saveLocalLeadConversions(leads: WhatsAppLeadConversion[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(leads));
  } catch (err) {
    console.warn('[Lead Tracking] Error caching to localStorage:', err);
  }
}

/**
 * Main Track WhatsApp Click function
 * Captures click, attributes to current page & source, syncs to server and Firestore
 */
export async function trackWhatsAppClick(params: {
  pagePath?: string;
  pageTitle?: string;
  pageUrl?: string;
  source?: string;
  sourceLabel?: string;
  whatsappNumber?: string;
  inquiryMessage?: string;
  estimatedValueNaira?: number;
  notes?: string;
}): Promise<WhatsAppLeadConversion> {
  const pageInfo = getReadablePageContext();
  const pagePath = params.pagePath || pageInfo.path;
  const pageTitle = params.pageTitle || pageInfo.title;
  const pageUrl = params.pageUrl || (typeof window !== 'undefined' ? window.location.href : 'https://pydamovers.com');
  const source = params.source || 'direct_link';
  const sourceLabel = params.sourceLabel || getSourceDisplayName(source);
  const whatsappNumber = (params.whatsappNumber || '2348062466212').replace(/\D/g, '');
  const deviceType = detectDeviceType();
  const referrer = typeof document !== 'undefined' ? document.referrer || 'Direct' : 'Direct';

  const newLead: WhatsAppLeadConversion = {
    id: `lead-wa-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    pageUrl,
    pagePath,
    pageTitle,
    source,
    sourceLabel,
    whatsappNumber,
    inquiryMessage: params.inquiryMessage || undefined,
    status: 'new_lead',
    deviceType,
    referrer,
    notes: params.notes || 'Inbound WhatsApp inquiry logged via website click tracking.',
    estimatedValueNaira: params.estimatedValueNaira,
  };

  // 1. Immediately store in local state / LocalStorage
  const existing = getLocalLeadConversions();
  const updatedList = [newLead, ...existing.filter((l) => l.id !== newLead.id)];
  saveLocalLeadConversions(updatedList);

  // 2. Dispatch custom event so open Admin dashboard updates in real-time
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('pyda_lead_conversion_tracked', { detail: newLead }));
  }

  // 3. Post to backend server API
  try {
    fetch('/api/leads/whatsapp-click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newLead),
    }).catch((err) => console.warn('[Lead Tracking API sync non-fatal]:', err));
  } catch (err) {
    // Non-blocking
  }

  // 4. Also persist to Firestore if available
  try {
    if (db) {
      addDoc(collection(db, 'leadConversions'), newLead).catch((err) => {
        // Safe catch for offline/permission fallback
        console.warn('[Firestore lead write fallback]:', err);
      });
    }
  } catch (err) {
    // Non-blocking
  }

  return newLead;
}

/**
 * Fetch all leads from Server API, fallback to Firestore or LocalStorage
 */
export async function fetchAllLeadConversions(): Promise<WhatsAppLeadConversion[]> {
  try {
    const res = await fetch('/api/leads/whatsapp-conversions');
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.leads) && data.leads.length > 0) {
        saveLocalLeadConversions(data.leads);
        return data.leads;
      }
    }
  } catch (err) {
    console.warn('[Lead Tracking] Server API unreachable, trying Firestore/LocalStorage:', err);
  }

  // Try Firestore
  try {
    if (db) {
      const q = query(collection(db, 'leadConversions'), orderBy('timestamp', 'desc'), limit(150));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const firestoreLeads: WhatsAppLeadConversion[] = snap.docs.map((d) => d.data() as WhatsAppLeadConversion);
        if (firestoreLeads.length > 0) {
          saveLocalLeadConversions(firestoreLeads);
          return firestoreLeads;
        }
      }
    }
  } catch (err) {
    console.warn('[Lead Tracking] Firestore fetch fallback:', err);
  }

  return getLocalLeadConversions();
}

/**
 * Update lead status, notes, or assigned staff
 */
export async function updateLeadStatus(id: string, updates: Partial<WhatsAppLeadConversion>): Promise<boolean> {
  const current = getLocalLeadConversions();
  const updated = current.map((l) => (l.id === id ? { ...l, ...updates } : l));
  saveLocalLeadConversions(updated);

  // Sync to server
  try {
    await fetch(`/api/leads/whatsapp-conversions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
  } catch (err) {
    console.warn('[Lead Tracking] Update server sync failed:', err);
  }

  return true;
}

/**
 * Delete a lead
 */
export async function deleteLead(id: string): Promise<boolean> {
  const current = getLocalLeadConversions();
  const filtered = current.filter((l) => l.id !== id);
  saveLocalLeadConversions(filtered);

  try {
    await fetch(`/api/leads/whatsapp-conversions/${id}`, {
      method: 'DELETE',
    });
  } catch (err) {
    console.warn('[Lead Tracking] Delete server sync failed:', err);
  }

  return true;
}

/**
 * Aggregate Page Inquiry Metrics: measures which pages are driving the most inquiries
 */
export function computePageMetrics(leads: WhatsAppLeadConversion[]): PageInquiryMetric[] {
  const total = leads.length || 1;
  const map: Record<string, { count: number; title: string; lastInquiry: string; sources: Record<string, number> }> = {};

  for (const lead of leads) {
    const path = lead.pagePath || '/';
    const title = lead.pageTitle || getReadablePageContext('', path.includes('#') ? '#' + path.split('#')[1] : '').title;

    if (!map[path]) {
      map[path] = { count: 0, title, lastInquiry: lead.timestamp, sources: {} };
    }
    map[path].count++;
    if (new Date(lead.timestamp) > new Date(map[path].lastInquiry)) {
      map[path].lastInquiry = lead.timestamp;
    }
    const src = lead.sourceLabel || lead.source || 'Direct';
    map[path].sources[src] = (map[path].sources[src] || 0) + 1;
  }

  const result: PageInquiryMetric[] = Object.entries(map).map(([path, data]) => {
    // Find top source
    let topSource = 'Direct';
    let maxSrcCount = 0;
    for (const [src, c] of Object.entries(data.sources)) {
      if (c > maxSrcCount) {
        maxSrcCount = c;
        topSource = src;
      }
    }

    return {
      pagePath: path,
      pageTitle: data.title,
      clickCount: data.count,
      percentage: Math.round((data.count / total) * 100),
      lastInquiryAt: data.lastInquiry,
      topSource,
    };
  });

  // Sort by click count descending
  return result.sort((a, b) => b.clickCount - a.clickCount);
}

/**
 * Global Auto-tracker initialization
 * Intercepts clicks on any wa.me or WhatsApp links across the whole document
 */
let isTrackerInitialized = false;

export function initGlobalWhatsAppTracker() {
  if (typeof window === 'undefined' || isTrackerInitialized) return;
  isTrackerInitialized = true;

  document.addEventListener('click', (event) => {
    try {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      const anchor = target.closest('a') as HTMLAnchorElement | null;
      if (!anchor) return;

      const href = anchor.href || '';
      const isWhatsAppLink = href.includes('wa.me') || href.includes('whatsapp.com') || href.includes('api.whatsapp.com');

      if (!isWhatsAppLink) return;

      // Extract phone number from URL
      let whatsappNumber = '2348062466212';
      const phoneMatch = href.match(/wa\.me\/([0-9+]+)/) || href.match(/phone=([0-9+]+)/);
      if (phoneMatch && phoneMatch[1]) {
        whatsappNumber = phoneMatch[1].replace(/\D/g, '');
      }

      // Extract pre-filled message if present
      let inquiryMessage: string | undefined = undefined;
      const textMatch = href.match(/text=([^&]+)/);
      if (textMatch && textMatch[1]) {
        try {
          inquiryMessage = decodeURIComponent(textMatch[1].replace(/\+/g, ' '));
        } catch {
          inquiryMessage = textMatch[1];
        }
      }

      // Determine source container
      let source = 'direct_link';
      let sourceLabel = 'Direct WhatsApp Link';

      if (anchor.closest('#floating-whatsapp-widget-container') || anchor.id.includes('whatsapp-direct')) {
        source = 'floating_widget';
        sourceLabel = 'Floating WhatsApp Widget';
      } else if (anchor.closest('#calculator-modal') || anchor.closest('[id*="calculator"]')) {
        source = 'calculator_modal';
        sourceLabel = 'Quote Cost Calculator';
      } else if (anchor.closest('#contact') || anchor.closest('[id*="contact"]')) {
        source = 'contact_section';
        sourceLabel = 'Contact Section Hotline';
      } else if (anchor.closest('footer')) {
        source = 'footer_cta';
        sourceLabel = 'Footer Quick WhatsApp Link';
      } else if (anchor.closest('#faq') || anchor.id.includes('faq')) {
        source = 'faq_section';
        sourceLabel = 'FAQ Support Coordinator';
      } else if (anchor.closest('#coverage') || anchor.closest('[id*="coverage"]') || anchor.closest('[id*="map"]')) {
        source = 'branch_map';
        sourceLabel = 'Branch Office Map Pin';
      } else if (anchor.closest('#investor') || anchor.closest('[id*="investor"]')) {
        source = 'investor_fleet';
        sourceLabel = 'Investor Fleet VIP Line';
      } else if (anchor.closest('#careers') || anchor.closest('[id*="careers"]')) {
        source = 'careers_section';
        sourceLabel = 'Careers Crew Desk';
      } else if (anchor.closest('#services') || anchor.closest('[id*="services"]')) {
        source = 'services_section';
        sourceLabel = 'Services Section Inquiry';
      }

      // Log conversion asynchronously
      trackWhatsAppClick({
        source,
        sourceLabel,
        whatsappNumber,
        inquiryMessage,
      });
    } catch (err) {
      console.warn('[Global WhatsApp Click Tracker error]:', err);
    }
  }, { capture: true });
}
