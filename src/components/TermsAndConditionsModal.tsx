import React, { useEffect, useState } from 'react';
import {
  X,
  Scale,
  ShieldAlert,
  Lock,
  AlertTriangle,
  FileText,
  Truck,
  Printer,
  Download,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import {
  PYDA_TERMS_METADATA,
  KEY_PROTECTIVE_DISCLOSURES,
  TERMS_ARTICLES
} from '../data/termsAndConditionsData';
import { PageView } from '../types';

interface TermsAndConditionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToFullPage?: () => void;
  onAccept?: () => void;
}

export const TermsAndConditionsModal: React.FC<TermsAndConditionsModalProps> = ({
  isOpen,
  onClose,
  onNavigateToFullPage,
  onAccept
}) => {
  const [activeTab, setActiveTab] = useState<'disclosures' | 'clauses'>('disclosures');
  const [selectedArticleIndex, setSelectedArticleIndex] = useState<number>(0);

  // Handle ESC key to dismiss modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-[130] flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="terms-modal-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 p-5 sm:p-6 border-b border-slate-800 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20">
              <Scale className="w-3.5 h-3.5 text-amber-400" />
              <span>PYDA MOVERS & LOGISTICS LTD • LEGAL CODE</span>
            </div>
            <h2 id="terms-modal-title" className="text-lg sm:text-xl font-black text-white">
              Terms & Conditions & Carrier Protective Disclosures
            </h2>
            <p className="text-xs text-slate-400">
              RC: 1842091 · {PYDA_TERMS_METADATA.version} · Nigerian Commercial Carriage Law
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handlePrint}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white border border-slate-800 transition-colors hidden sm:flex"
              title="Print Terms"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="bg-slate-900/90 border-b border-slate-800 px-5 sm:px-6 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('disclosures')}
              className={`py-3 px-3 font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'disclosures'
                  ? 'border-amber-400 text-amber-400 bg-amber-500/5'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Core Protective Disclosures</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('clauses')}
              className={`py-3 px-3 font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'clauses'
                  ? 'border-amber-400 text-amber-400 bg-amber-500/5'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Full Contract Articles (1–12)</span>
            </button>
          </div>

          {onNavigateToFullPage && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigateToFullPage();
              }}
              className="text-[11px] font-bold text-amber-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              <span>Open Dedicated Page</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-grow text-xs leading-relaxed max-h-[60vh]">
          {activeTab === 'disclosures' ? (
            <div className="space-y-4">
              <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-200 text-xs">
                <strong className="block text-amber-400 font-bold mb-0.5">
                  Protective Carrier Disclosure Notice:
                </strong>
                The following six statutory clauses govern every consignment handled by Pyda Movers & Logistics Ltd. They define customer packing duties, cargo exclusions, and our statutory carrier’s lien.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {KEY_PROTECTIVE_DISCLOSURES.map((item) => (
                  <div
                    key={item.id}
                    className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2 flex flex-col justify-between"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          {item.badge}
                        </span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                      <h4 className="text-sm font-black text-white">{item.title}</h4>
                      <p className="text-slate-300 font-medium text-xs">{item.summary}</p>
                    </div>
                    <div className="pt-2 text-[11px] text-slate-400 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 mt-2">
                      {item.protectiveScope}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              {/* Article Selector Column */}
              <div className="md:col-span-4 space-y-1.5 border-b md:border-b-0 md:border-r border-slate-800 pb-4 md:pb-0 md:pr-4">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Select Article (1–12):
                </span>
                <div className="space-y-1 max-h-[45vh] overflow-y-auto pr-1">
                  {TERMS_ARTICLES.map((art, idx) => (
                    <button
                      key={art.slug}
                      type="button"
                      onClick={() => setSelectedArticleIndex(idx)}
                      className={`w-full text-left p-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                        selectedArticleIndex === idx
                          ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                          : 'bg-slate-900 hover:bg-slate-850 text-slate-300'
                      }`}
                    >
                      <span className="truncate">{art.number}: {art.title}</span>
                      <ChevronRight className="w-3 h-3 shrink-0 ml-1" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Article Clauses Column */}
              <div className="md:col-span-8 space-y-4">
                {TERMS_ARTICLES[selectedArticleIndex] && (
                  <div className="space-y-4 animate-in fade-in">
                    <div>
                      <span className="font-mono text-xs font-bold text-amber-400">
                        {TERMS_ARTICLES[selectedArticleIndex].number}
                      </span>
                      <h3 className="text-base font-black text-white">
                        {TERMS_ARTICLES[selectedArticleIndex].title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Principle: {TERMS_ARTICLES[selectedArticleIndex].keyTakeaway}
                      </p>
                    </div>

                    <div className="space-y-3.5">
                      {TERMS_ARTICLES[selectedArticleIndex].clauses.map((c) => (
                        <div key={c.clauseNumber} className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                              § {c.clauseNumber}
                            </span>
                            <span className="font-bold text-white text-xs">{c.subtitle}</span>
                          </div>
                          <p className="text-slate-300 text-[11px] leading-relaxed">{c.content}</p>
                          {c.strictWarning && (
                            <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300 text-[10px] leading-relaxed mt-1">
                              <strong>CRITICAL STATUTORY NOTICE: </strong>
                              {c.strictWarning}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Binding Carriage Agreement under Laws of Federal Republic of Nigeria</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2 rounded-xl transition-colors"
            >
              Close
            </button>
            {onAccept && (
              <button
                type="button"
                onClick={() => {
                  onAccept();
                  onClose();
                }}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black px-5 py-2 rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>I Acknowledge & Agree</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
