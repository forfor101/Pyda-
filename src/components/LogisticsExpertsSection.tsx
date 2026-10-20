import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Award,
  Users,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  Quote,
  Search,
  ExternalLink,
  ChevronRight,
  Briefcase,
  Radio,
  Truck,
  Box,
  Globe2,
  HardHat,
  X,
  FileCheck,
  Send,
  MessageSquare,
  Calendar,
  Clock,
  Info
} from 'lucide-react';
import { useCms } from '../context/CmsContext';
import { LogisticsExpert, ServiceType } from '../types';

interface LogisticsExpertsSectionProps {
  onOpenQuoteModal?: (service?: ServiceType, origin?: string, destination?: string) => void;
  onNavigateToContact?: () => void;
}

type DepartmentFilter = 'all' | 'executive' | 'corporate' | 'fleet_safety' | 'white_glove' | 'cross_border' | 'heavy_rigging';

export const LogisticsExpertsSection: React.FC<LogisticsExpertsSectionProps> = ({
  onOpenQuoteModal,
  onNavigateToContact
}) => {
  const { cms } = useCms();
  const experts = cms.logisticsExperts || [];

  const [activeCategory, setActiveCategory] = useState<DepartmentFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExpert, setSelectedExpert] = useState<LogisticsExpert | null>(null);
  const [consultExpert, setConsultExpert] = useState<LogisticsExpert | null>(null);

  // Consultation form state inside modal
  const [consultForm, setConsultForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    company: '',
    serviceType: 'corporate' as ServiceType,
    route: '',
    targetDate: '',
    notes: ''
  });
  const [consultSubmitted, setConsultSubmitted] = useState(false);

  // Categories config
  const categories: { id: DepartmentFilter; label: string; icon: React.ReactNode; count: number }[] = useMemo(() => {
    return [
      { id: 'all', label: 'All Specialists', icon: <Users className="w-4 h-4" />, count: experts.length },
      { id: 'executive', label: 'Executive Directorate', icon: <Award className="w-4 h-4" />, count: experts.filter(e => e.department === 'executive').length },
      { id: 'corporate', label: 'Corporate Relocations', icon: <Briefcase className="w-4 h-4" />, count: experts.filter(e => e.department === 'corporate').length },
      { id: 'fleet_safety', label: 'Fleet Safety & Telematics', icon: <Radio className="w-4 h-4" />, count: experts.filter(e => e.department === 'fleet_safety').length },
      { id: 'white_glove', label: 'White-Glove & Fragile', icon: <Box className="w-4 h-4" />, count: experts.filter(e => e.department === 'white_glove').length },
      { id: 'cross_border', label: 'Pan-African & Customs', icon: <Globe2 className="w-4 h-4" />, count: experts.filter(e => e.department === 'cross_border').length },
      { id: 'heavy_rigging', label: 'Heavy Rigging & Machinery', icon: <HardHat className="w-4 h-4" />, count: experts.filter(e => e.department === 'heavy_rigging').length }
    ];
  }, [experts]);

  // Filtered list
  const filteredExperts = useMemo(() => {
    return experts.filter(exp => {
      const matchesCategory = activeCategory === 'all' || exp.department === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesCategory;

      const matchesSearch =
        exp.name.toLowerCase().includes(q) ||
        exp.role.toLowerCase().includes(q) ||
        exp.departmentLabel.toLowerCase().includes(q) ||
        exp.location.toLowerCase().includes(q) ||
        exp.bio.toLowerCase().includes(q) ||
        exp.certifications.some(c => c.toLowerCase().includes(q)) ||
        (exp.specialties && exp.specialties.some(s => s.toLowerCase().includes(q)));

      return matchesCategory && matchesSearch;
    });
  }, [experts, activeCategory, searchQuery]);

  const handleOpenConsultation = (expert: LogisticsExpert) => {
    setConsultExpert(expert);
    setConsultSubmitted(false);
    let mappedSvc: ServiceType = 'corporate';
    if (expert.department === 'white_glove') mappedSvc = 'residential';
    else if (expert.department === 'fleet_safety' || expert.department === 'heavy_rigging') mappedSvc = 'haulage';
    else if (expert.department === 'cross_border') mappedSvc = 'commercial';

    setConsultForm({
      fullName: '',
      phone: '',
      email: '',
      company: '',
      serviceType: mappedSvc,
      route: '',
      targetDate: '',
      notes: `Requesting direct specialist guidance with ${expert.name} (${expert.role}).`
    });
  };

  const handleConsultSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setConsultSubmitted(true);
  };

  return (
    <section id="meet-our-logistics-experts" className="py-16 sm:py-20 bg-slate-900 border-t border-b border-slate-800 text-white relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <Users className="w-3.5 h-3.5 text-amber-400" />
              <span>Humanizing Logistics • Verified Personnel</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              Meet Our Logistics Experts
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Every relocation, heavy freight haul, and cross-border transit is managed by seasoned logistics specialists with certified industry credentials, strict safety vetting, and decades of field experience.
            </p>
          </div>

          {/* Quick CTA */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {onOpenQuoteModal && (
              <button
                id="experts-get-quote-btn"
                onClick={() => onOpenQuoteModal('corporate')}
                className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-2"
              >
                <Truck className="w-4 h-4" />
                <span>Request Free Survey</span>
              </button>
            )}
            <a
              id="experts-call-hq-btn"
              href="tel:+2348062466212"
              className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition-all flex items-center gap-2"
            >
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>0806 246 6212</span>
            </a>
          </div>
        </div>

        {/* High-Trust Verification Pillars Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 bg-slate-950/80 p-4 sm:p-6 rounded-2xl border border-slate-800 shadow-xl">
          <div className="flex items-center gap-3.5 p-2">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl shrink-0 text-amber-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-base sm:text-lg font-black text-white">100+ Specialists</p>
              <p className="text-[11px] text-slate-400">Vetted logistics coordinators</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-2">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl shrink-0 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-base sm:text-lg font-black text-white">100% Vetted</p>
              <p className="text-[11px] text-slate-400">Guarantors & background verified</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-2">
            <div className="p-2.5 bg-sky-500/10 border border-sky-500/30 rounded-xl shrink-0 text-sky-400">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <p className="text-base sm:text-lg font-black text-white">24/7 Telematics</p>
              <p className="text-[11px] text-slate-400">Active satellite control desk</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-2">
            <div className="p-2.5 bg-purple-500/10 border border-purple-500/30 rounded-xl shrink-0 text-purple-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-base sm:text-lg font-black text-white">15-Min Response</p>
              <p className="text-[11px] text-slate-400">Senior coordinator callback</p>
            </div>
          </div>
        </div>

        {/* Filter Controls & Search Bar */}
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
            {/* Horizontal scrolling department pill tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {categories.map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    id={`expert-filter-${cat.id}`}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                        : 'bg-slate-950/70 text-slate-300 border border-slate-800 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    {cat.icon}
                    <span>{cat.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                      isActive ? 'bg-slate-950/20 text-slate-950 font-black' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {cat.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative min-w-[260px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="experts-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, role, certification..."
                className="w-full pl-9 pr-8 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {searchQuery && (
            <p className="text-xs text-slate-400">
              Showing {filteredExperts.length} expert{filteredExperts.length === 1 ? '' : 's'} matching "{searchQuery}"
            </p>
          )}
        </div>

        {/* Experts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExperts.map((expert) => {
            const isExecutive = expert.department === 'executive';

            return (
              <div
                key={expert.id}
                id={`expert-card-${expert.id}`}
                className={`group bg-slate-950 rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-xl ${
                  isExecutive
                    ? 'border-amber-500/40 hover:border-amber-400 ring-1 ring-amber-500/20'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Top Banner & Header */}
                <div className="p-6 space-y-5">
                  {/* Avatar & Key Badges Header */}
                  <div className="flex items-start gap-4">
                    {/* Portrait Avatar */}
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shrink-0 bg-slate-900 border-2 border-slate-700 group-hover:border-amber-500/60 transition-colors shadow-lg">
                      <img
                        src={expert.avatar}
                        alt={expert.name}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                      {/* Verified Badge */}
                      <div className="absolute bottom-1 right-1 bg-amber-500 text-slate-950 p-1 rounded-md shadow-md">
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    {/* Metadata Header */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="inline-flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md">
                          {expert.departmentLabel}
                        </span>
                        <span className="bg-slate-800 text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-md">
                          {expert.experienceYears}
                        </span>
                      </div>

                      <h3 className="text-base sm:text-lg font-black text-white truncate group-hover:text-amber-400 transition-colors">
                        {expert.name}
                      </h3>

                      <p className="text-xs font-semibold text-amber-400 leading-tight">
                        {expert.role}
                      </p>

                      <div className="flex items-center gap-1 text-[11px] text-slate-400 pt-0.5">
                        <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                        <span className="truncate">{expert.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Bio Description */}
                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                    {expert.bio}
                  </p>

                  {/* Personal Commitment Quote Box */}
                  <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl space-y-1.5 relative">
                    <Quote className="w-4 h-4 text-amber-500/40 absolute top-3 right-3" />
                    <p className="text-[11px] text-slate-200 italic font-serif leading-relaxed pr-5">
                      "{expert.quote}"
                    </p>
                  </div>

                  {/* Certifications Pills */}
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <FileCheck className="w-3 h-3 text-emerald-400" />
                      <span>Key Certifications & Credentials:</span>
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {expert.certifications.map((cert, cIdx) => (
                        <span
                          key={cIdx}
                          className="text-[10px] font-semibold bg-slate-900 border border-slate-800 text-slate-300 px-2 py-0.5 rounded-md"
                        >
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Track Record Badge */}
                  <div className="bg-amber-500/5 border border-amber-500/20 p-2.5 rounded-xl flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="text-[11px] font-bold text-amber-300">
                      {expert.trackRecord}
                    </span>
                  </div>
                </div>

                {/* Card Action Buttons Footer */}
                <div className="p-4 bg-slate-950/80 border-t border-slate-800/90 grid grid-cols-2 gap-2">
                  <button
                    id={`view-dossier-btn-${expert.id}`}
                    onClick={() => setSelectedExpert(expert)}
                    className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Info className="w-3.5 h-3.5 text-amber-400" />
                    <span>View Dossier</span>
                  </button>

                  <button
                    id={`consult-expert-btn-${expert.id}`}
                    onClick={() => handleOpenConsultation(expert)}
                    className="py-2.5 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl transition-all shadow flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-slate-950" />
                    <span>Consult Expert</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty state if search has no results */}
        {filteredExperts.length === 0 && (
          <div className="text-center py-12 bg-slate-950/50 rounded-2xl border border-slate-800 space-y-3">
            <Users className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-lg font-bold text-white">No personnel matched your search criteria</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Try adjusting your keyword or reset filters to explore our full roster of logistics directors and field masters.
            </p>
            <button
              onClick={() => {
                setActiveCategory('all');
                setSearchQuery('');
              }}
              className="px-4 py-2 bg-slate-800 text-amber-400 text-xs font-bold rounded-xl hover:bg-slate-700 border border-slate-700"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 1. EXPERT DOSSIER MODAL (Detailed credentials, career history & verification) */}
      {/* ========================================================================= */}
      {selectedExpert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div
            className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative text-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Close Button */}
            <button
              id="close-expert-dossier-modal"
              onClick={() => setSelectedExpert(null)}
              className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-full transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6 sm:p-8 space-y-6">
              {/* Dossier Header */}
              <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left">
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden shrink-0 border-2 border-amber-500/60 shadow-xl bg-slate-950">
                  <img
                    src={selectedExpert.avatar}
                    alt={selectedExpert.name}
                    className="w-full h-full object-cover object-top"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-2 right-2 bg-amber-500 text-slate-950 p-1.5 rounded-lg shadow-lg">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                </div>

                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
                    <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full">
                      {selectedExpert.departmentLabel}
                    </span>
                    <span className="bg-slate-800 text-slate-300 text-xs font-bold px-3 py-1 rounded-full">
                      {selectedExpert.experienceYears} Track Record
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-black text-white">
                    {selectedExpert.name}
                  </h3>

                  <p className="text-sm font-bold text-amber-400">
                    {selectedExpert.role}
                  </p>

                  <div className="flex items-center gap-1.5 text-xs text-slate-400 justify-center sm:justify-start">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span>{selectedExpert.location}</span>
                  </div>
                </div>
              </div>

              {/* Full Bio */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
                <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider">
                  Professional Profile & Career Background
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {selectedExpert.bio}
                </p>
              </div>

              {/* Personal Commitment Statement */}
              <div className="bg-amber-500/5 border border-amber-500/20 p-5 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                  <Quote className="w-4 h-4" />
                  <span>Personal Operational Covenant</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 italic font-serif leading-relaxed">
                  "{selectedExpert.quote}"
                </p>
              </div>

              {/* Grid of Certifications & Core Specialties */}
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Certifications */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2.5">
                  <p className="text-xs font-black text-white flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-400" />
                    <span>Accreditations & Licenses</span>
                  </p>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {selectedExpert.certifications.map((c, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Specialized Capabilities */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2.5">
                  <p className="text-xs font-black text-white flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-sky-400" />
                    <span>Domain Specialties</span>
                  </p>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {selectedExpert.specialties && selectedExpert.specialties.map((s, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Direct Actions in Dossier */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  id="dossier-request-consultation-btn"
                  onClick={() => {
                    const exp = selectedExpert;
                    setSelectedExpert(null);
                    handleOpenConsultation(exp);
                  }}
                  className="flex-1 py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Request Dedicated Consultation</span>
                </button>

                {onOpenQuoteModal && (
                  <button
                    id="dossier-open-quote-btn"
                    onClick={() => {
                      setSelectedExpert(null);
                      onOpenQuoteModal('corporate');
                    }}
                    className="py-3 px-5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Truck className="w-4 h-4 text-amber-400" />
                    <span>Calculate Custom Quote</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. DIRECT SPECIALIST CONSULTATION MODAL */}
      {/* ========================================================================= */}
      {consultExpert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div
            className="bg-slate-900 border border-slate-700 rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              id="close-expert-consult-modal"
              onClick={() => setConsultExpert(null)}
              className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-full transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6 sm:p-8 space-y-6">
              {/* Header */}
              <div className="flex items-center gap-4 border-b border-slate-800 pb-5">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-amber-500/60 shrink-0 bg-slate-950">
                  <img
                    src={consultExpert.avatar}
                    alt={consultExpert.name}
                    className="w-full h-full object-cover object-top"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    Direct Specialist Consultation
                  </span>
                  <h3 className="text-lg font-black text-white mt-1">{consultExpert.name}</h3>
                  <p className="text-xs text-slate-400">{consultExpert.role}</p>
                </div>
              </div>

              {consultSubmitted ? (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-xl">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-black text-white">Consultation Request Dispatched!</h4>
                  <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                    Thank you, <strong>{consultForm.fullName || 'Valued Client'}</strong>. Your consultation request has been forwarded directly to <strong>{consultExpert.name}</strong> and our senior dispatch desk. We will call you on <strong>{consultForm.phone || 'your phone'}</strong> within 15 minutes during business hours.
                  </p>

                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-left space-y-1.5 text-xs text-slate-300">
                    <p><strong>Specialist Assigned:</strong> {consultExpert.name}</p>
                    <p><strong>Department:</strong> {consultExpert.departmentLabel}</p>
                    <p><strong>Target Corridor / Route:</strong> {consultForm.route || 'Nationwide / Interstate'}</p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <a
                      href={`https://wa.me/2348062466212?text=Hello%20Megatrend%20Movers,%20I%20have%20submitted%20a%20consultation%20request%20for%20${encodeURIComponent(consultExpert.name)}.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Chat on WhatsApp Instantly</span>
                    </a>
                    <button
                      onClick={() => setConsultExpert(null)}
                      className="py-3 px-5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleConsultSubmit} className="space-y-4">
                  <p className="text-xs text-slate-300">
                    Provide your relocation or freight details below. Our senior specialist will review your cargo profile and conduct a rapid survey or call you back.
                  </p>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">Your Full Name *</label>
                      <input
                        id="consult-fullname"
                        type="text"
                        required
                        value={consultForm.fullName}
                        onChange={(e) => setConsultForm({ ...consultForm, fullName: e.target.value })}
                        placeholder="e.g. Dr. Emeka Okafor"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">Phone Number / WhatsApp *</label>
                      <input
                        id="consult-phone"
                        type="tel"
                        required
                        value={consultForm.phone}
                        onChange={(e) => setConsultForm({ ...consultForm, phone: e.target.value })}
                        placeholder="e.g. 0803 123 4567"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">Email Address</label>
                      <input
                        id="consult-email"
                        type="email"
                        value={consultForm.email}
                        onChange={(e) => setConsultForm({ ...consultForm, email: e.target.value })}
                        placeholder="you@company.com"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">Company / Organization</label>
                      <input
                        id="consult-company"
                        type="text"
                        value={consultForm.company}
                        onChange={(e) => setConsultForm({ ...consultForm, company: e.target.value })}
                        placeholder="e.g. Zenith Bank / Private Move"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">Relocation / Freight Corridor</label>
                      <input
                        id="consult-route"
                        type="text"
                        value={consultForm.route}
                        onChange={(e) => setConsultForm({ ...consultForm, route: e.target.value })}
                        placeholder="e.g. Lagos (VI) ⇄ Abuja (Maitama)"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">Estimated Target Date</label>
                      <input
                        id="consult-target-date"
                        type="date"
                        value={consultForm.targetDate}
                        onChange={(e) => setConsultForm({ ...consultForm, targetDate: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">Specific Scope or Fragile Asset Requirements</label>
                    <textarea
                      id="consult-notes"
                      rows={3}
                      value={consultForm.notes}
                      onChange={(e) => setConsultForm({ ...consultForm, notes: e.target.value })}
                      placeholder="Mention any delicate servers, 30-ton containers, fragile glassware, or zero-downtime weekend deadlines..."
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="pt-2 flex gap-3">
                    <button
                      id="consult-submit-btn"
                      type="submit"
                      className="flex-1 py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                      <Send className="w-4 h-4" />
                      <span>Submit Consultation to {consultExpert.name}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setConsultExpert(null)}
                      className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
