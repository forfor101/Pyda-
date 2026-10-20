import React, { useState, useEffect } from 'react';
import {
  Search,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  Copy,
  ExternalLink,
  Tag,
  Share2,
  Building2,
  Warehouse,
  Home,
  Truck,
  Layers,
  Globe,
  Sliders,
  Check,
  Plus,
  X,
  AlertCircle,
  Eye,
  FileCode,
  Image as ImageIcon,
  Wand2
} from 'lucide-react';
import { useCms } from '../context/CmsContext';
import { ServiceType, ServiceSeoConfig } from '../types';
import { DEFAULT_SERVICE_SEO_CONFIGS, DEFAULT_OG_IMAGE, BASE_URL } from '../lib/seoMetadata';

interface AdminSeoMetadataManagerProps {
  showToast: (msg: string) => void;
}

interface ServiceMetadataOption {
  id: ServiceType;
  label: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  hashPath: string;
  color: string;
  badge: string;
  defaultKeywords: string[];
  smartPresets: {
    name: string;
    title: string;
    description: string;
    keywords: string[];
  }[];
}

const SERVICE_OPTIONS: ServiceMetadataOption[] = [
  {
    id: 'corporate',
    label: 'Corporate Relocation',
    category: 'Enterprise & Office Moving',
    icon: Building2,
    hashPath: '#services/corporate',
    color: 'from-blue-500/20 to-indigo-500/20 border-blue-500/30 text-blue-400',
    badge: 'Zero-Downtime',
    defaultKeywords: [
      'corporate relocation Nigeria',
      'office moving Abuja',
      'IT server migration',
      'corporate movers Lagos',
      'business relocation service',
      'executive office moving',
      'workstation packing Nigeria',
      'weekend office dispatch'
    ],
    smartPresets: [
      {
        name: 'Abuja Corporate Focus',
        title: 'Corporate Office Relocation Services Abuja | Zero-Downtime Migration | Pyda Movers',
        description: 'Zero-downtime office migration in Abuja FCT & Lagos. Certified IT server rack disassembly, serialized asset tagging, and weekend corporate dispatch with full insurance.',
        keywords: ['office moving Abuja', 'corporate relocation Nigeria', 'Abuja movers', 'IT server migration', 'business office transfer']
      },
      {
        name: 'Lagos Commercial & Island Priority',
        title: 'Office Relocation & Corporate Movers Lagos | Victoria Island & Ikoyi | Pyda',
        description: 'Premier corporate office moves in Lagos (VI, Lekki, Ikeja, Marina). Zero operational disruption with night & weekend workstation transfers and insurance backing.',
        keywords: ['corporate movers Lagos', 'office relocation Victoria Island', 'business movers Ikeja', 'commercial relocation Nigeria']
      }
    ]
  },
  {
    id: 'commercial',
    label: 'Commercial & Warehouse',
    category: 'Industrial & Facility Logistics',
    icon: Warehouse,
    hashPath: '#services/commercial',
    color: 'from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-400',
    badge: 'Heavy Machinery',
    defaultKeywords: [
      'commercial relocation Nigeria',
      'warehouse moving Lagos',
      'industrial logistics Abuja',
      'factory equipment transport',
      'retail store inventory relocation',
      'pallet racking disassembly',
      'medical laboratory moving'
    ],
    smartPresets: [
      {
        name: 'Industrial & Heavy Machinery Focus',
        title: 'Commercial Facility & Warehouse Relocation Solutions | Pyda Movers Nigeria',
        description: 'End-to-end relocation for warehouses, manufacturing plants, retail distribution centers, and laboratories across Nigeria. Heavy machinery rigging and inventory crating.',
        keywords: ['warehouse moving Lagos', 'commercial logistics Nigeria', 'factory equipment transport', 'industrial movers Abuja']
      },
      {
        name: 'Retail & Store Chain Inventory',
        title: 'Retail Store & Commercial Inventory Relocation Nigeria | Pyda Logistics',
        description: 'Fast, secure inventory transfer and store fixture relocation for nationwide retail chains, supermarkets, and pharmaceutical hubs across 36 Nigerian states.',
        keywords: ['retail store relocation', 'commercial inventory transport', 'supermarket moving Nigeria', 'logistics distribution']
      }
    ]
  },
  {
    id: 'residential',
    label: 'Residential Moving',
    category: 'Home & Apartment Relocation',
    icon: Home,
    hashPath: '#services/residential',
    color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400',
    badge: 'White-Glove',
    defaultKeywords: [
      'home movers Nigeria',
      'house moving Abuja',
      'residential moving Lagos',
      'apartment relocation Port Harcourt',
      'furniture movers Nigeria',
      'white glove packing service',
      'delicate glassware crating',
      'stress-free family move'
    ],
    smartPresets: [
      {
        name: 'White-Glove Premium Care',
        title: 'Residential & Home Moving Services | Stress-Free Packing & Relocation | Pyda Movers',
        description: 'Premium home and apartment relocation across Lagos, Abuja, Port Harcourt, and 36 states. Full packing, furniture disassembly, delicate glassware crating, and safe delivery.',
        keywords: ['home movers Nigeria', 'residential moving Lagos', 'house moving Abuja', 'white glove movers', 'packing service Nigeria']
      },
      {
        name: 'Interstate Duplex & Apartment Transfer',
        title: 'Interstate Home Moving & Duplex Relocation Nigeria | Pyda Movers',
        description: 'Dedicated enclosed box trucks for duplex and flat relocations across Nigerian states. Professional wrapping, wardrobe boxes, appliance protection, and doorstep setup.',
        keywords: ['interstate home movers', 'duplex relocation Nigeria', 'house moving Lagos to Abuja', 'safe furniture transport']
      }
    ]
  },
  {
    id: 'haulage',
    label: 'Heavy Haulage & Freight',
    category: '3T to 30T Interstate Trucking',
    icon: Truck,
    hashPath: '#services/haulage',
    color: 'from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-400',
    badge: '30-Ton Freight',
    defaultKeywords: [
      'haulage company Nigeria',
      'interstate trucking Lagos Abuja',
      '30 ton truck rental Nigeria',
      'container haulage Lagos port',
      'heavy equipment transport',
      'logistics freight Nigeria',
      'interstate goods delivery',
      'Pan-African cargo corridors'
    ],
    smartPresets: [
      {
        name: 'Container & Port Freight Focus',
        title: 'Heavy Haulage & Interstate Freight Trucking (3T - 30T) | Pyda Logistics Nigeria',
        description: 'Long-haul freight and heavy equipment transport across all 36 Nigerian states and Pan-African corridors. Padded box vans, 10-ton flatbeds, and 30-ton container haulage rigs.',
        keywords: ['haulage company Nigeria', '30 ton truck rental', 'container haulage Lagos', 'interstate freight Nigeria']
      },
      {
        name: 'Nationwide Highway Corridors',
        title: 'Nationwide 36-State Heavy Freight Trucking Fleet | Pyda Logistics Nigeria',
        description: 'Satellite GPS-tracked freight transport across Lagos-Abuja-Kano-Port Harcourt highways. 24/7 telematics, escort support, and full Goods-In-Transit cargo insurance.',
        keywords: ['interstate trucking Lagos Abuja', 'heavy freight Nigeria', 'cargo haulage 36 states', 'satellite tracked trucks']
      }
    ]
  }
];

export const AdminSeoMetadataManager: React.FC<AdminSeoMetadataManagerProps> = ({ showToast }) => {
  const { cms, updateServiceSeo, resetServiceSeo } = useCms();
  
  const [selectedServiceId, setSelectedServiceId] = useState<ServiceType>('corporate');
  const [activeSubTab, setActiveSubTab] = useState<'form' | 'serp_preview' | 'social_preview' | 'code_export'>('form');

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [ogImage, setOgImage] = useState('');
  const [canonicalPath, setCanonicalPath] = useState('');
  const [robots, setRobots] = useState('index, follow');
  
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const activeServiceDef = SERVICE_OPTIONS.find((s) => s.id === selectedServiceId) || SERVICE_OPTIONS[0];

  // Load current values from CMS whenever selected service changes or CMS updates
  useEffect(() => {
    const serviceSeo = cms.seoMetadata?.services?.[selectedServiceId] || DEFAULT_SERVICE_SEO_CONFIGS.services[selectedServiceId];
    
    if (serviceSeo) {
      setTitle(serviceSeo.title || '');
      setDescription(serviceSeo.description || '');
      
      const kwList = serviceSeo.keywords 
        ? serviceSeo.keywords.split(',').map((k) => k.trim()).filter(Boolean)
        : activeServiceDef.defaultKeywords;
      setKeywords(kwList);

      setOgImage(serviceSeo.ogImage || DEFAULT_OG_IMAGE);
      setCanonicalPath(serviceSeo.canonicalPath || `/#services/${selectedServiceId}`);
      setRobots(serviceSeo.robots || 'index, follow');
      setHasUnsavedChanges(false);
    }
  }, [selectedServiceId, cms.seoMetadata]);

  // Handle saving changes
  const handleSave = () => {
    if (!title.trim()) {
      showToast('Page Title cannot be empty.');
      return;
    }
    if (!description.trim()) {
      showToast('Meta Description cannot be empty.');
      return;
    }

    const payload: Partial<ServiceSeoConfig> = {
      title: title.trim(),
      description: description.trim(),
      keywords: keywords.join(', '),
      ogImage: ogImage.trim() || DEFAULT_OG_IMAGE,
      canonicalPath: canonicalPath.trim() || `/#services/${selectedServiceId}`,
      robots: robots.trim() || 'index, follow',
      lastEdited: new Date().toISOString()
    };

    updateServiceSeo(selectedServiceId, payload);
    setHasUnsavedChanges(false);
    showToast(`SEO Metadata for "${activeServiceDef.label}" updated and live!`);
  };

  // Handle Resetting to baseline default
  const handleReset = () => {
    resetServiceSeo(selectedServiceId);
    const defaultData = DEFAULT_SERVICE_SEO_CONFIGS.services[selectedServiceId];
    if (defaultData) {
      setTitle(defaultData.title);
      setDescription(defaultData.description);
      setKeywords(defaultData.keywords.split(',').map((k) => k.trim()).filter(Boolean));
      setOgImage(defaultData.ogImage || DEFAULT_OG_IMAGE);
      setCanonicalPath(defaultData.canonicalPath || `/#services/${selectedServiceId}`);
      setRobots(defaultData.robots || 'index, follow');
      setHasUnsavedChanges(false);
      showToast(`Reset SEO Metadata for "${activeServiceDef.label}" to system defaults.`);
    }
  };

  // Keyword Helpers
  const handleAddKeyword = () => {
    const trimmed = keywordInput.trim().toLowerCase();
    if (!trimmed) return;
    if (keywords.map((k) => k.toLowerCase()).includes(trimmed)) {
      setKeywordInput('');
      return;
    }
    setKeywords([...keywords, trimmed]);
    setKeywordInput('');
    setHasUnsavedChanges(true);
  };

  const handleKeyDownKeyword = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddKeyword();
    }
  };

  const handleRemoveKeyword = (indexToRemove: number) => {
    setKeywords(keywords.filter((_, idx) => idx !== indexToRemove));
    setHasUnsavedChanges(true);
  };

  const handleAddSuggestedKeyword = (kw: string) => {
    const trimmed = kw.trim();
    if (!keywords.map((k) => k.toLowerCase()).includes(trimmed.toLowerCase())) {
      setKeywords([...keywords, trimmed]);
      setHasUnsavedChanges(true);
      showToast(`Added keyword: "${trimmed}"`);
    }
  };

  // Apply a smart preset
  const handleApplyPreset = (preset: { title: string; description: string; keywords: string[] }) => {
    setTitle(preset.title);
    setDescription(preset.description);
    setKeywords(preset.keywords);
    setHasUnsavedChanges(true);
    showToast(`Applied preset: ${preset.title.substring(0, 30)}...`);
  };

  // Character length metrics
  const titleLength = title.length;
  const descLength = description.length;

  const getTitleStatus = () => {
    if (titleLength === 0) return { label: 'Empty', color: 'text-red-400 border-red-500/30 bg-red-500/10' };
    if (titleLength >= 50 && titleLength <= 60) return { label: 'Optimal (50-60 chars)', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' };
    if (titleLength < 50) return { label: `${titleLength}/60 chars (A bit short)`, color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' };
    return { label: `${titleLength}/60 chars (May truncate)`, color: 'text-orange-400 border-orange-500/30 bg-orange-500/10' };
  };

  const getDescStatus = () => {
    if (descLength === 0) return { label: 'Empty', color: 'text-red-400 border-red-500/30 bg-red-500/10' };
    if (descLength >= 120 && descLength <= 160) return { label: 'Optimal (120-160 chars)', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' };
    if (descLength < 120) return { label: `${descLength}/160 chars (Short)`, color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' };
    return { label: `${descLength}/160 chars (May truncate on mobile)`, color: 'text-orange-400 border-orange-500/30 bg-orange-500/10' };
  };

  const titleStatus = getTitleStatus();
  const descStatus = getDescStatus();

  // Generated Raw Meta HTML for Code View
  const generatedMetaHtml = `<!-- Dynamic SEO Metadata for ${activeServiceDef.label} -->
<title>${title || 'Pyda Movers & Logistics'}</title>
<meta name="description" content="${description}">
<meta name="keywords" content="${keywords.join(', ')}">
<meta name="robots" content="${robots}">
<link rel="canonical" href="${BASE_URL}${canonicalPath}">

<!-- Open Graph / Facebook / LinkedIn / WhatsApp -->
<meta property="og:type" content="website">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:url" content="${BASE_URL}${canonicalPath}">
<meta property="og:image" content="${ogImage || DEFAULT_OG_IMAGE}">
<meta property="og:site_name" content="Pyda Movers & Logistics">

<!-- Twitter Cards -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${description}">
<meta name="twitter:image" content="${ogImage || DEFAULT_OG_IMAGE}">`;

  const copyHtmlCode = () => {
    navigator.clipboard.writeText(generatedMetaHtml);
    setCopiedCode(true);
    showToast('HTML Meta Tags copied to clipboard!');
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const isCustomized = Boolean(cms.seoMetadata?.services?.[selectedServiceId]?.lastEdited);

  return (
    <div className="space-y-6">
      {/* Top Description & Service Selector Bar */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-black uppercase tracking-wider">
                SEO Metadata Manager
              </span>
              {isCustomized ? (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold flex items-center gap-1">
                  <Check className="w-3 h-3" /> Custom Overrides Active
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-bold">
                  System Default Baseline
                </span>
              )}
            </div>
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              <span>Service Page Meta Titles, Keywords & Snippets</span>
            </h3>
            <p className="text-xs text-slate-400">
              Customize title tags, search descriptions, and target keywords for individual service landing pages without writing code. Changes take effect immediately across all browser tabs and crawlers.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={`/${activeServiceDef.hashPath}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-amber-400" />
              <span>Preview Live Page</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>

            <button
              onClick={handleReset}
              title="Reset this service to default SEO metadata"
              className="px-3 py-2 bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Reset Defaults</span>
            </button>

            <button
              onClick={handleSave}
              disabled={!hasUnsavedChanges && !title}
              className={`px-4 py-2 text-xs font-black rounded-xl shadow-lg flex items-center gap-2 transition-all ${
                hasUnsavedChanges
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/25 ring-2 ring-amber-400/40 animate-pulse'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{hasUnsavedChanges ? 'Save Changes' : 'Saved Live'}</span>
            </button>
          </div>
        </div>

        {/* Service Selection Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {SERVICE_OPTIONS.map((srv) => {
            const Icon = srv.icon;
            const isSelected = selectedServiceId === srv.id;
            const hasCustom = Boolean(cms.seoMetadata?.services?.[srv.id]?.lastEdited);

            return (
              <button
                key={srv.id}
                onClick={() => {
                  if (hasUnsavedChanges) {
                    if (window.confirm('You have unsaved SEO changes on this page. Switch anyway?')) {
                      setSelectedServiceId(srv.id);
                    }
                  } else {
                    setSelectedServiceId(srv.id);
                  }
                }}
                className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-800/90 border-amber-500 ring-2 ring-amber-500/30 shadow-lg'
                    : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-850 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className={`p-2 rounded-xl border ${srv.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
                    {srv.badge}
                  </span>
                </div>

                <div>
                  <div className="text-xs font-black text-white flex items-center justify-between">
                    <span>{srv.label}</span>
                    {hasCustom && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 ring-4 ring-emerald-400/20" title="Customized" />
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">{srv.category}</div>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span>{srv.hashPath}</span>
                  <span className="text-amber-400 font-bold">{isSelected ? 'Active Edit' : 'Edit SEO'}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Metadata Editor & Preview Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Editor (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Smart Preset Recommendations */}
          <div className="p-4 bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/20 rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                <Wand2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Smart Optimization Presets for {activeServiceDef.label}</span>
              </div>
              <span className="text-[10px] text-slate-400">Click to apply template</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {activeServiceDef.smartPresets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleApplyPreset(preset)}
                  className="px-3 py-1.5 bg-slate-950/80 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-500 text-amber-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Form Fields Box */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-5">
            {/* 1. Page Title Tag */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Page Title Tag (`&lt;title&gt;` & `og:title`)</span>
                  <span className="text-red-400">*</span>
                </label>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${titleStatus.color}`}>
                  {titleStatus.label}
                </span>
              </div>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setHasUnsavedChanges(true);
                }}
                placeholder="e.g. Corporate Office Relocation Services | Zero-Downtime Migration Nigeria"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors font-medium"
              />
              <p className="text-[11px] text-slate-400">
                Appears as the primary blue clickable headline in Google Search results and the browser window tab.
              </p>
            </div>

            {/* 2. Meta Description */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Meta Description (`&lt;meta name="description"&gt;`)</span>
                  <span className="text-red-400">*</span>
                </label>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${descStatus.color}`}>
                  {descStatus.label}
                </span>
              </div>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setHasUnsavedChanges(true);
                }}
                placeholder="Provide a concise, compelling summary of the service offerings, geographic coverage (Abuja, Lagos), and value guarantees."
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors resize-none font-medium leading-relaxed"
              />
              <p className="text-[11px] text-slate-400">
                Shown below the title in search engine snippets. Aim for 120–160 characters for high click-through rates.
              </p>
            </div>

            {/* 3. Target Search Keywords */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-amber-400" />
                  <span>Target SEO Keywords ({keywords.length} active)</span>
                </label>
                <span className="text-[10px] text-slate-400">Type keyword & press Enter</span>
              </div>

              {/* Keyword Chips List */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl min-h-[50px] flex flex-wrap gap-1.5 items-center">
                {keywords.map((kw, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium"
                  >
                    <span>{kw}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveKeyword(idx)}
                      className="hover:text-white text-amber-400 p-0.5 rounded transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}

                <div className="flex items-center gap-1 flex-1 min-w-[140px]">
                  <input
                    type="text"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyDown={handleKeyDownKeyword}
                    placeholder={keywords.length === 0 ? "e.g. office moving Abuja..." : "Add more..."}
                    className="w-full bg-transparent border-none text-xs text-white placeholder-slate-600 focus:outline-none py-1"
                  />
                  <button
                    type="button"
                    onClick={handleAddKeyword}
                    disabled={!keywordInput.trim()}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-200 text-[10px] font-bold rounded-lg transition-colors shrink-0"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Suggested Keywords Quick Add */}
              <div className="space-y-1.5 pt-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Recommended High-Search Nigerian Keywords (Click to add):
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {activeServiceDef.defaultKeywords.map((recKw, idx) => {
                    const isAdded = keywords.map((k) => k.toLowerCase()).includes(recKw.toLowerCase());
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleAddSuggestedKeyword(recKw)}
                        disabled={isAdded}
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium border transition-all ${
                          isAdded
                            ? 'bg-slate-900 border-slate-800 text-slate-600 opacity-60 cursor-default'
                            : 'bg-slate-900/80 hover:bg-amber-500/20 border-slate-700 hover:border-amber-500/40 text-slate-300 hover:text-amber-200 cursor-pointer'
                        }`}
                      >
                        {isAdded ? '✓ ' : '+ '}
                        {recKw}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 4. Open Graph Social Image URL */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Social Share Image URL (`og:image`)</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowMediaModal(true)}
                  className="text-[10px] text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
                >
                  Pick from Media Library
                </button>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={ogImage}
                  onChange={(e) => {
                    setOgImage(e.target.value);
                    setHasUnsavedChanges(true);
                  }}
                  placeholder="https://images.unsplash.com/..."
                  className="flex-1 px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono text-[11px]"
                />
                {ogImage && (
                  <div className="w-9 h-9 rounded-lg overflow-hidden border border-slate-700 shrink-0 bg-slate-950">
                    <img src={ogImage} alt="OG Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
              <p className="text-[10px] text-slate-500">
                Recommended aspect ratio: 1200 x 630 pixels. Used when sharing links on WhatsApp, LinkedIn, Facebook, and Twitter.
              </p>
            </div>

            {/* 5. Advanced Indexing & Canonical Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white">Canonical Route Path</label>
                <input
                  type="text"
                  value={canonicalPath}
                  onChange={(e) => {
                    setCanonicalPath(e.target.value);
                    setHasUnsavedChanges(true);
                  }}
                  placeholder="/#services/corporate"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white">Robots Directive</label>
                <select
                  value={robots}
                  onChange={(e) => {
                    setRobots(e.target.value);
                    setHasUnsavedChanges(true);
                  }}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-amber-400"
                >
                  <option value="index, follow">index, follow (Recommended - Public Search)</option>
                  <option value="index, nofollow">index, nofollow (Index page, ignore links)</option>
                  <option value="noindex, follow">noindex, follow (Hide page, follow links)</option>
                  <option value="noindex, nofollow">noindex, nofollow (Block entirely)</option>
                </select>
              </div>
            </div>

            {/* Save & Reset Actions Bar */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {hasUnsavedChanges && (
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Unsaved edits</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-colors"
                >
                  Discard / Reset
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-1.5 transition-all"
                >
                  <Check className="w-4 h-4" />
                  <span>Save SEO Metadata</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Previews (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Preview Navigation Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-2xl">
            {[
              { id: 'serp_preview', label: '🔍 Google SERP', icon: Globe },
              { id: 'social_preview', label: '📱 Social Card', icon: Share2 },
              { id: 'code_export', label: '📄 HTML Code', icon: FileCode },
            ].map((tab) => {
              const isActive = activeSubTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id as any)}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                    isActive
                      ? 'bg-slate-800 text-amber-300 shadow font-black border border-slate-700'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* VIEW 1: GOOGLE SEARCH (SERP) LIVE PREVIEW */}
          {activeSubTab === 'serp_preview' && (
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-black text-white">
                    G
                  </div>
                  <span className="text-xs font-bold text-white">Google Search Result Snippet</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">Desktop & Mobile Mock</span>
              </div>

              {/* Realistic Google Search Card */}
              <div className="p-4 bg-white dark:bg-[#202124] rounded-2xl border border-slate-300 dark:border-slate-800 shadow-sm space-y-1 font-sans text-left">
                {/* Google URL Breadcrumb */}
                <div className="flex items-center gap-2 text-xs text-[#202124] dark:text-[#dadce0] truncate">
                  <div className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center text-[9px] font-black shrink-0">
                    M
                  </div>
                  <div className="flex items-center gap-1 truncate text-[12px]">
                    <span className="font-semibold">Pyda Movers</span>
                    <span className="text-slate-400">›</span>
                    <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                      services › {selectedServiceId}
                    </span>
                  </div>
                </div>

                {/* Google Blue Link Title */}
                <h4 className="text-[17px] font-medium text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer leading-snug line-clamp-2 pt-0.5">
                  {title || `${activeServiceDef.label} | Pyda Movers & Logistics`}
                </h4>

                {/* Google Snippet Meta Description */}
                <p className="text-[13px] text-[#4d5156] dark:text-[#bdc1c6] leading-relaxed line-clamp-3 pt-0.5">
                  <span className="text-[#70757a] dark:text-[#9aa0a6] text-[12px] font-mono mr-1">
                    {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} —
                  </span>
                  {description || 'Nigeria’s premier relocation and haulage logistics partner.'}
                </p>

                {/* Sitelinks Extensions Mock */}
                <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-2 gap-2 text-[11px]">
                  <div className="text-[#1a0dab] dark:text-[#8ab4f8] font-medium truncate hover:underline">
                    • Instant CBM Rate Calculator
                  </div>
                  <div className="text-[#1a0dab] dark:text-[#8ab4f8] font-medium truncate hover:underline">
                    • Live GPS Tracking Portal
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Tip for Google Search:</strong> Ensure brand terms like <em>"Pyda Movers"</em>, city names (<em>"Abuja", "Lagos"</em>), and clear action verbs are included in your title for maximum ranking.
                </span>
              </div>
            </div>
          )}

          {/* VIEW 2: SOCIAL SHARE CARD (OPEN GRAPH) PREVIEW */}
          {activeSubTab === 'social_preview' && (
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <Share2 className="w-4 h-4 text-cyan-400" />
                  <span>WhatsApp / LinkedIn / Twitter Link Preview</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">1200 x 630 Ratio</span>
              </div>

              {/* Social Media Link Card */}
              <div className="rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 shadow-md">
                <div className="w-full h-44 bg-slate-900 relative overflow-hidden">
                  <img
                    src={ogImage || DEFAULT_OG_IMAGE}
                    alt="Social Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = DEFAULT_OG_IMAGE;
                    }}
                  />
                  <div className="absolute top-2 right-2 px-2 py-1 rounded bg-slate-950/80 backdrop-blur text-[10px] font-bold text-white">
                    {activeServiceDef.label}
                  </div>
                </div>

                <div className="p-4 space-y-1 text-left">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    pydamovers.com
                  </div>
                  <h4 className="text-sm font-bold text-white line-clamp-2 leading-snug">
                    {title || `${activeServiceDef.label} | Pyda Movers`}
                  </h4>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed pt-0.5">
                    {description || 'Explore zero-downtime relocation and heavy haulage logistics.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 3: RAW HTML META CODE EXPORT */}
          {activeSubTab === 'code_export' && (
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <FileCode className="w-4 h-4 text-amber-400" />
                  <span>Generated HTML Meta Tags</span>
                </div>
                <button
                  onClick={copyHtmlCode}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
                >
                  {copiedCode ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied!' : 'Copy HTML'}</span>
                </button>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 overflow-x-auto">
                <pre className="text-[11px] font-mono text-emerald-400 leading-relaxed whitespace-pre">
                  {generatedMetaHtml}
                </pre>
              </div>
            </div>
          )}

          {/* Quick Summary Card */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
            <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span>Dynamic Runtime Status</span>
              <span className="text-[10px] text-emerald-400 font-mono font-bold">● Active in DOM</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Any changes saved here immediately update the page's HTML document title, meta tags, OpenGraph cards, and schema definitions at runtime through the <code className="text-amber-400">DynamicMetadataManager</code>.
            </p>
          </div>
        </div>
      </div>

      {/* MEDIA LIBRARY IMAGE PICKER MODAL */}
      {showMediaModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-cyan-400" />
                <h4 className="text-sm font-bold text-white">Select Social Share Image from Media Library</h4>
              </div>
              <button
                onClick={() => setShowMediaModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-96 overflow-y-auto p-1">
              {(cms.mediaLibrary || []).map((media) => (
                <button
                  key={media.id}
                  type="button"
                  onClick={() => {
                    setOgImage(media.url);
                    setHasUnsavedChanges(true);
                    setShowMediaModal(false);
                    showToast(`Selected "${media.name}" for OG Image.`);
                  }}
                  className="group relative rounded-xl overflow-hidden border border-slate-800 hover:border-amber-500 transition-all text-left bg-slate-950 aspect-video"
                >
                  <img src={media.url} alt={media.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent p-2 flex flex-col justify-end">
                    <div className="text-[10px] font-bold text-white truncate">{media.name}</div>
                    <div className="text-[9px] text-amber-400">{media.category}</div>
                  </div>
                </button>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowMediaModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
