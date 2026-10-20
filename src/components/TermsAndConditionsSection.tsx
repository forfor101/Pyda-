import React, { useState, useMemo } from 'react';
import {
  Scale,
  ShieldAlert,
  Lock,
  AlertTriangle,
  FileText,
  Truck,
  CheckCircle2,
  Search,
  Printer,
  Download,
  Share2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Phone,
  Mail,
  Building2,
  Check,
  AlertCircle,
  HelpCircle,
  Clock,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import {
  PYDA_TERMS_METADATA,
  KEY_PROTECTIVE_DISCLOSURES,
  TERMS_ARTICLES,
  LegalArticle,
  LegalDisclosurePoint
} from '../data/termsAndConditionsData';
import { PageView } from '../types';

interface TermsAndConditionsSectionProps {
  onOpenQuoteModal?: () => void;
  onNavigatePage?: (page: PageView) => void;
  initialArticleSlug?: string;
}

export const TermsAndConditionsSection: React.FC<TermsAndConditionsSectionProps> = ({
  onOpenQuoteModal,
  onNavigatePage,
  initialArticleSlug
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'disclosures' | 'contract'>('all');
  const [expandedArticles, setExpandedArticles] = useState<Record<string, boolean>>(() => {
    // By default expand first two or specific initial article
    const initial: Record<string, boolean> = {};
    TERMS_ARTICLES.forEach((art, idx) => {
      initial[art.slug] = initialArticleSlug ? art.slug === initialArticleSlug : idx < 2;
    });
    return initial;
  });
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const toggleArticle = (slug: string) => {
    setExpandedArticles((prev) => ({
      ...prev,
      [slug]: !prev[slug],
    }));
  };

  const expandAll = () => {
    const allExpanded: Record<string, boolean> = {};
    TERMS_ARTICLES.forEach((art) => {
      allExpanded[art.slug] = true;
    });
    setExpandedArticles(allExpanded);
  };

  const collapseAll = () => {
    setExpandedArticles({});
  };

  const handleCopyLink = (slug: string) => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}${window.location.pathname}#terms?clause=${slug}`;
      navigator.clipboard.writeText(url).then(() => {
        setCopiedSlug(slug);
        setTimeout(() => setCopiedSlug(null), 2500);
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadText = () => {
    const textContent = `
========================================================================
${PYDA_TERMS_METADATA.companyName.toUpperCase()}
STANDARD TRADING CONDITIONS & PROTECTIVE CARRIER DISCLOSURES
${PYDA_TERMS_METADATA.registrationNumber} · ${PYDA_TERMS_METADATA.taxIdentificationNumber}
Effective Date: ${PYDA_TERMS_METADATA.effectiveDate} | Version: ${PYDA_TERMS_METADATA.version}
Headquarters: ${PYDA_TERMS_METADATA.headquartersAddress}
Lagos Terminal: ${PYDA_TERMS_METADATA.lagosTerminalAddress}
Legal Department: ${PYDA_TERMS_METADATA.officialLegalEmail} | Hotline: ${PYDA_TERMS_METADATA.complianceHotline}
========================================================================

KEY PROTECTIVE DISCLOSURES:
${KEY_PROTECTIVE_DISCLOSURES.map(
  (d, idx) => `
[${idx + 1}] ${d.title.toUpperCase()} (${d.badge})
Summary: ${d.summary}
Protective Scope: ${d.protectiveScope}
`
).join('\n')}

========================================================================
FULL CONTRACTUAL CODE & ARTICLES:
========================================================================
${TERMS_ARTICLES.map(
  (art) => `
${art.number}: ${art.title.toUpperCase()}
Key Principle: ${art.keyTakeaway}

${art.clauses
  .map(
    (c) => `
Clause ${c.clauseNumber} - ${c.subtitle}:
${c.content}
${c.strictWarning ? `[CRITICAL NOTICE]: ${c.strictWarning}` : ''}
`
  )
  .join('\n')}
`
).join('\n------------------------------------------------------------------------\n')}

(c) ${new Date().getFullYear()} ${PYDA_TERMS_METADATA.companyName}. All Rights Reserved.
    `.trim();

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Pyda_Movers_Terms_And_Protective_Disclosures_${new Date().getFullYear()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Filtered articles based on search query
  const filteredArticles = useMemo(() => {
    if (!searchQuery.trim()) return TERMS_ARTICLES;
    const q = searchQuery.toLowerCase().trim();
    return TERMS_ARTICLES.filter((art) => {
      const matchTitle = art.title.toLowerCase().includes(q);
      const matchTakeaway = art.keyTakeaway.toLowerCase().includes(q);
      const matchClause = art.clauses.some(
        (c) =>
          c.subtitle.toLowerCase().includes(q) ||
          c.content.toLowerCase().includes(q) ||
          (c.strictWarning && c.strictWarning.toLowerCase().includes(q))
      );
      return matchTitle || matchTakeaway || matchClause;
    });
  }, [searchQuery]);

  // Filtered disclosures
  const filteredDisclosures = useMemo(() => {
    if (!searchQuery.trim()) return KEY_PROTECTIVE_DISCLOSURES;
    const q = searchQuery.toLowerCase().trim();
    return KEY_PROTECTIVE_DISCLOSURES.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.summary.toLowerCase().includes(q) ||
        d.protectiveScope.toLowerCase().includes(q) ||
        d.badge.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const renderDisclosureIcon = (iconName: string) => {
    switch (iconName) {
      case 'Lock':
        return <Lock className="w-5 h-5 text-amber-400" />;
      case 'AlertTriangle':
        return <AlertTriangle className="w-5 h-5 text-amber-400" />;
      case 'ShieldAlert':
        return <ShieldAlert className="w-5 h-5 text-rose-400" />;
      case 'Scale':
        return <Scale className="w-5 h-5 text-emerald-400" />;
      case 'Truck':
        return <Truck className="w-5 h-5 text-sky-400" />;
      default:
        return <FileText className="w-5 h-5 text-amber-400" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12" id="terms-conditions-page">
      {/* 1. Executive Banner & Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        {/* Subtle Watermark Badge */}
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 opacity-5 pointer-events-none select-none">
          <Scale className="w-96 h-96 text-amber-400" />
        </div>

        <div className="relative z-10 space-y-4 max-w-4xl">
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold font-mono">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Scale className="w-3.5 h-3.5 text-amber-400" />
              <span>LEGAL FRAMEWORK & PROTECTIVE DISCLOSURES</span>
            </span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-400">RC: 1842091</span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-400">TIN: 24891029-0001</span>
            <span className="text-slate-500">·</span>
            <span className="text-emerald-400 font-semibold">{PYDA_TERMS_METADATA.version}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            Standard Trading Conditions & Carrier Protective Disclosures
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            These comprehensive contractual terms and carrier disclosures govern all relocation, freight haulage,
            executive car hire, and logistics operations performed by <strong className="text-white">Pyda Movers & Logistics Ltd</strong>.
            They establish transparent operational guidelines, delineate client and carrier duties, establish our statutory
            carrier’s lien, define Owner-Packed (PBO) exclusions, and protect the corporate integrity of Pyda Movers under the laws of the Federal Republic of Nigeria.
          </p>

          {/* Corporate Metadata Pill Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-slate-800/80 text-xs">
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Abuja Headquarters:</span>
              <span className="text-slate-300 font-medium text-[11px] leading-tight block mt-0.5">
                Suite A204, AA Rano Citygate Plaza, Airport Rd
              </span>
            </div>
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Lagos Logistics Hub:</span>
              <span className="text-slate-300 font-medium text-[11px] leading-tight block mt-0.5">
                Old Ojo Rd, Satellite Town Logistics Terminal
              </span>
            </div>
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Legal & Claims Unit:</span>
              <a
                href={`mailto:${PYDA_TERMS_METADATA.officialLegalEmail}`}
                className="text-amber-400 font-semibold text-[11px] hover:underline block mt-0.5"
              >
                {PYDA_TERMS_METADATA.officialLegalEmail}
              </a>
            </div>
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Compliance Hotline:</span>
              <a
                href={`tel:${PYDA_TERMS_METADATA.complianceHotline}`}
                className="text-emerald-400 font-semibold text-[11px] hover:underline block mt-0.5"
              >
                {PYDA_TERMS_METADATA.complianceHotline}
              </a>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-3 pt-3">
            <button
              type="button"
              onClick={handlePrint}
              className="bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-bold text-xs px-4 py-2.5 rounded-xl border border-slate-700 flex items-center gap-2 transition-all shadow-md"
              id="terms-print-btn"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>Print Official Terms</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadText}
              className="bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-bold text-xs px-4 py-2.5 rounded-xl border border-slate-700 flex items-center gap-2 transition-all shadow-md"
              id="terms-download-txt-btn"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Download Plaintext (.TXT)</span>
            </button>

            {onOpenQuoteModal && (
              <button
                type="button"
                onClick={onOpenQuoteModal}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl shadow-lg flex items-center gap-2 transition-all active:scale-95 sm:ml-auto"
                id="terms-quote-cta-btn"
              >
                <span>Calculate Guaranteed Quote</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Key Protective Disclosures (Executive Summary Cards) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
              <ShieldAlert className="w-6 h-6 text-amber-400" />
              <span>Essential Protective Disclosures at a Glance</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Critical operational rules and statutory carrier protections every consignor must know prior to booking.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-amber-400/80 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 self-start sm:self-auto">
            6 Enforceable Caveats
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDisclosures.map((d) => (
            <div
              key={d.id}
              className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-5 flex flex-col justify-between transition-all hover:shadow-xl group"
              id={`disclosure-card-${d.id}`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 group-hover:border-amber-500/30 transition-colors">
                    {renderDisclosureIcon(d.iconName)}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {d.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-black text-white group-hover:text-amber-400 transition-colors">
                    {d.title}
                  </h3>
                  <p className="text-xs text-slate-300 font-semibold mt-1">
                    {d.summary}
                  </p>
                </div>

                <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 leading-relaxed font-sans">
                  {d.protectiveScope}
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500">
                <span className="font-mono">Legally Binding</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Enforceable Code</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Search Bar, Controls & Filter Navigation */}
      <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Live Search Input */}
          <div className="relative flex-grow max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search clauses (e.g. 'carrier lien', 'PBO', 'prohibited', 'insurance', 'arbitration')..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Expand / Collapse All */}
          <div className="flex items-center gap-2 self-end md:self-auto text-xs">
            <button
              type="button"
              onClick={expandAll}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800 text-[11px] font-bold transition-all"
            >
              Expand All Articles
            </button>
            <button
              type="button"
              onClick={collapseAll}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800 text-[11px] font-bold transition-all"
            >
              Collapse All
            </button>
          </div>
        </div>

        {/* Quick Clause Jumper Links */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin text-xs">
          <span className="text-[10px] text-slate-500 uppercase font-black shrink-0 mr-1">
            Jump to Article:
          </span>
          {TERMS_ARTICLES.map((art) => (
            <button
              key={art.slug}
              type="button"
              onClick={() => {
                setExpandedArticles((prev) => ({ ...prev, [art.slug]: true }));
                const el = document.getElementById(`article-${art.slug}`);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="shrink-0 px-2.5 py-1 rounded-md bg-slate-900 hover:bg-amber-500/20 hover:text-amber-400 text-slate-400 text-[10px] font-mono font-bold border border-slate-800 transition-all"
            >
              {art.number}
            </button>
          ))}
        </div>
      </div>

      {/* 4. The 12 Comprehensive Legal Articles */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" />
            <span>Complete Contractual Code ({filteredArticles.length} Articles)</span>
          </h2>
          {searchQuery && (
            <span className="text-xs text-slate-400">
              Showing results matching &ldquo;{searchQuery}&rdquo;
            </span>
          )}
        </div>

        <div className="space-y-4">
          {filteredArticles.map((article) => {
            const isExpanded = !!expandedArticles[article.slug];

            return (
              <div
                key={article.slug}
                id={`article-${article.slug}`}
                className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden transition-all shadow-md scroll-mt-28"
              >
                {/* Article Header Accordion Button */}
                <button
                  type="button"
                  onClick={() => toggleArticle(article.slug)}
                  className="w-full text-left p-4 sm:p-5 flex items-start sm:items-center justify-between gap-4 hover:bg-slate-850/60 transition-colors"
                  aria-expanded={isExpanded}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black uppercase text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20">
                        {article.number}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        ({article.clauses.length} Clauses)
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                      {article.title}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">
                      Key Takeaway: {article.keyTakeaway}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 pt-1 sm:pt-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyLink(article.slug);
                      }}
                      className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition-colors"
                      title="Copy link to this article"
                    >
                      {copiedSlug === article.slug ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Share2 className="w-4 h-4" />
                      )}
                    </button>
                    <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-amber-400">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                </button>

                {/* Article Detailed Clauses */}
                {isExpanded && (
                  <div className="p-4 sm:p-6 bg-slate-950/80 border-t border-slate-800/80 space-y-5 animate-in fade-in duration-200">
                    <div className="space-y-4">
                      {article.clauses.map((clause) => (
                        <div
                          key={clause.clauseNumber}
                          className="bg-slate-900/70 border border-slate-800/90 rounded-xl p-4 sm:p-5 space-y-2.5"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-extrabold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">
                              Clause {clause.clauseNumber}
                            </span>
                            <h4 className="text-sm font-black text-white">
                              {clause.subtitle}
                            </h4>
                          </div>

                          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                            {clause.content}
                          </p>

                          {clause.strictWarning && (
                            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-start gap-2.5 text-xs text-amber-200 mt-2">
                              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                              <div className="leading-relaxed text-[11px]">
                                <strong className="text-amber-400 font-bold block mb-0.5">
                                  CRITICAL STATUTORY NOTICE & CLIENT COVENANT:
                                </strong>
                                {clause.strictWarning}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {filteredArticles.length === 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-3">
              <HelpCircle className="w-8 h-8 text-slate-500 mx-auto" />
              <h4 className="text-base font-bold text-white">No clauses found</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                No articles or protective clauses match &ldquo;{searchQuery}&rdquo;. Try searching for general terms like &ldquo;lien&rdquo;, &ldquo;PBO&rdquo;, &ldquo;cash&rdquo;, or &ldquo;arbitration&rdquo;.
              </p>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-xs font-bold text-amber-400 underline hover:text-white"
              >
                Clear Search Filter
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 5. Contact Legal & Claims Desk Bottom Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-2 text-xs font-bold font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>CORPORATE COMPLIANCE & LEGAL AFFAIRS</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white">
            Questions on Cargo Risk, Insurance Tiers, or Contractual Terms?
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Our in-house legal counsel and cargo claims adjusters are available to assist corporate procurement teams with bespoke master service agreements, SLA sign-offs, and specialized high-value consignment endorsements.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
          <a
            href={`mailto:${PYDA_TERMS_METADATA.officialLegalEmail}`}
            className="bg-slate-800 hover:bg-slate-750 text-white font-bold text-xs px-4 py-3 rounded-xl border border-slate-700 flex items-center gap-2 transition-all active:scale-95"
            id="terms-contact-legal-email"
          >
            <Mail className="w-4 h-4 text-amber-400" />
            <span>Email Legal Unit</span>
          </a>

          <a
            href={`tel:${PYDA_TERMS_METADATA.complianceHotline}`}
            className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 transition-all active:scale-95"
            id="terms-call-compliance-hotline"
          >
            <Phone className="w-4 h-4" />
            <span>Call {PYDA_TERMS_METADATA.complianceHotline}</span>
          </a>
        </div>
      </div>
    </div>
  );
};
