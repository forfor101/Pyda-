import React, { useState } from 'react';
import {
  Printer,
  FileDown,
  X,
  CheckCircle2,
  ShieldCheck,
  FileText,
  FileBadge,
  Layers,
  Sparkles,
  Info,
  CheckSquare,
  Square,
  AlertCircle,
  Truck,
  ExternalLink
} from 'lucide-react';
import { VaultDocument, CustomerUser } from '../types';
import { downloadConsolidatedPackage, printConsolidatedPackage } from '../utils/vaultPdfPackage';

interface BulkPrintPackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  allDocuments: VaultDocument[];
  selectedDocIds: string[];
  onToggleDoc: (id: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onSelectCategory: (category: 'insurance' | 'bol' | 'all') => void;
  currentUser: CustomerUser;
  companyPhone?: string;
  onPackageExported?: (packageRef: string, count: number, mode: 'download' | 'print') => void;
  onPreviewDocument?: (doc: VaultDocument) => void;
}

export const BulkPrintPackageModal: React.FC<BulkPrintPackageModalProps> = ({
  isOpen,
  onClose,
  allDocuments,
  selectedDocIds,
  onToggleDoc,
  onSelectAll,
  onClearSelection,
  onSelectCategory,
  currentUser,
  companyPhone,
  onPackageExported,
  onPreviewDocument,
}) => {
  const [packageTitle, setPackageTitle] = useState('Official Transit Compliance & Legal Document Package');
  const [packageNotes, setPackageNotes] = useState('Certified for Highway Transit Verification, Insurance Audit & Corporate Compliance');
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  // Selected Documents
  const selectedDocs = allDocuments.filter((doc) => selectedDocIds.includes(doc.id));

  // Categorize
  const insuranceDocs = selectedDocs.filter(
    (d) =>
      d.docType === 'insurance_certificate' ||
      (d.tags && d.tags.some((t) => t.toLowerCase().includes('insurance'))) ||
      d.title.toLowerCase().includes('insurance')
  );

  const bolDocs = selectedDocs.filter(
    (d) =>
      d.docType === 'bill_of_lading' ||
      (d.tags && d.tags.some((t) => t.toLowerCase().includes('lading') || t.toLowerCase().includes('bol'))) ||
      d.title.toLowerCase().includes('bill of lading') ||
      d.title.toLowerCase().includes('bol') ||
      d.docType === 'waybill_manifest'
  );

  const totalValuation = selectedDocs.reduce((sum, d) => sum + (d.coverageAmountNaira || 0), 0);

  const handleDownload = () => {
    if (selectedDocs.length === 0) return;
    setIsGenerating(true);
    try {
      const { packageRef } = downloadConsolidatedPackage(selectedDocs, currentUser, {
        packageTitle,
        notes: packageNotes,
        companyPhone,
      });
      if (onPackageExported) {
        onPackageExported(packageRef, selectedDocs.length, 'download');
      }
      onClose();
    } catch (err) {
      console.error('Failed to export consolidated package', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    if (selectedDocs.length === 0) return;
    setIsGenerating(true);
    try {
      const { packageRef } = printConsolidatedPackage(selectedDocs, currentUser, {
        packageTitle,
        notes: packageNotes,
        companyPhone,
      });
      if (onPackageExported) {
        onPackageExported(packageRef, selectedDocs.length, 'print');
      }
      onClose();
    } catch (err) {
      console.error('Failed to print consolidated package', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full p-5 sm:p-7 space-y-5 shadow-2xl relative overflow-hidden max-h-[92vh] flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
        id="bulk-print-package-modal"
      >
        {/* Modal Top Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold shrink-0 shadow-lg">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">Bulk Print & Consolidated Document Package</h3>
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 font-mono">
                  <ShieldCheck className="w-3 h-3" />
                  <span>PKI Certified</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Compile multiple Insurance Certificates, Bill of Lading (BOL) manifests, and transit contracts into a single multi-page PDF package.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            id="close-bulk-print-modal-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="space-y-4 overflow-y-auto pr-1 text-xs max-h-[58vh]">
          {/* Summary KPI Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-slate-500 text-[10px] font-bold uppercase block">Selected Documents</span>
              <span className="text-lg font-black text-white font-mono flex items-center gap-1.5">
                <span>{selectedDocs.length}</span>
                <span className="text-xs text-slate-500 font-normal">/ {allDocuments.length}</span>
              </span>
            </div>

            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-slate-500 text-[10px] font-bold uppercase block">Insurance Certs</span>
              <span className="text-lg font-black text-amber-400 font-mono">
                {insuranceDocs.length}
              </span>
            </div>

            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-slate-500 text-[10px] font-bold uppercase block">Bill of Lading / BOL</span>
              <span className="text-lg font-black text-blue-400 font-mono">
                {bolDocs.length}
              </span>
            </div>

            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-slate-500 text-[10px] font-bold uppercase block">Combined Valuation</span>
              <span className="text-sm font-black text-emerald-400 font-mono truncate block" title={`₦${totalValuation.toLocaleString('en-NG')}`}>
                ₦{totalValuation > 0 ? totalValuation.toLocaleString('en-NG') : '0'}
              </span>
            </div>
          </div>

          {/* Quick Selection Filter Shortcuts */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-950 p-2.5 rounded-2xl border border-slate-850">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-400 mr-1">Quick Select:</span>
              <button
                type="button"
                onClick={() => onSelectCategory('insurance')}
                className="bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all"
              >
                + All Insurance Certs
              </button>
              <button
                type="button"
                onClick={() => onSelectCategory('bol')}
                className="bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-300 px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all"
              >
                + All Bill of Lading (BOL)
              </button>
              <button
                type="button"
                onClick={onSelectAll}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all"
              >
                Select All
              </button>
            </div>

            {selectedDocIds.length > 0 && (
              <button
                type="button"
                onClick={onClearSelection}
                className="text-slate-400 hover:text-rose-400 text-[11px] font-bold transition-colors"
              >
                Clear Selection
              </button>
            )}
          </div>

          {/* Document Checklist Selection Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-white text-xs uppercase tracking-wide">
                Enclosed Documents in Consolidated Package ({selectedDocs.length})
              </h4>
              <span className="text-[11px] text-slate-500">
                Check / uncheck to adjust package contents
              </span>
            </div>

            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {allDocuments.map((doc) => {
                const isSelected = selectedDocIds.includes(doc.id);
                const isInsurance =
                  doc.docType === 'insurance_certificate' ||
                  (doc.tags && doc.tags.some((t) => t.toLowerCase().includes('insurance'))) ||
                  doc.title.toLowerCase().includes('insurance');
                const isBol =
                  doc.docType === 'bill_of_lading' ||
                  (doc.tags && doc.tags.some((t) => t.toLowerCase().includes('lading') || t.toLowerCase().includes('bol'))) ||
                  doc.title.toLowerCase().includes('bill of lading') ||
                  doc.title.toLowerCase().includes('bol') ||
                  doc.docType === 'waybill_manifest';

                return (
                  <div
                    key={doc.id}
                    onClick={() => onToggleDoc(doc.id)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500/40 shadow-sm'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="text-amber-400 shrink-0">
                        {isSelected ? (
                          <CheckSquare className="w-5 h-5 text-amber-400 fill-amber-400/20" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-600" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-bold text-amber-400">
                            {doc.referenceNumber}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                              isInsurance
                                ? 'bg-amber-500/20 text-amber-300'
                                : isBol
                                ? 'bg-blue-500/20 text-blue-300'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {isInsurance ? 'Insurance' : isBol ? 'Bill of Lading' : doc.docType.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="font-bold text-white text-xs truncate max-w-md">
                          {doc.title}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">
                          {doc.originCity && doc.destinationCity ? `${doc.originCity} ➔ ${doc.destinationCity}` : doc.summaryText}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0 flex items-center gap-2">
                      <div>
                        {doc.coverageAmountNaira ? (
                          <span className="font-mono font-bold text-xs text-amber-400 block">
                            ₦{doc.coverageAmountNaira.toLocaleString('en-NG')}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-medium block">Standard Cover</span>
                        )}
                        <span className="text-[10px] text-slate-500 font-mono">{doc.issuedDate}</span>
                      </div>

                      {onPreviewDocument && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onPreviewDocument(doc);
                          }}
                          className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-700"
                          title="Preview in live print-friendly viewer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Package Customization Inputs */}
          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
              <FileBadge className="w-4 h-4 text-amber-400" />
              <span>Package Cover Manifest Customization</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 text-[11px] font-bold mb-1">
                  Consolidated Dossier Title
                </label>
                <input
                  type="text"
                  value={packageTitle}
                  onChange={(e) => setPackageTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 outline-none focus:border-amber-400"
                  placeholder="e.g. Interstate Highway Transit Dossier"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-[11px] font-bold mb-1">
                  Issuance / Audit Purpose Note
                </label>
                <input
                  type="text"
                  value={packageNotes}
                  onChange={(e) => setPackageNotes(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 outline-none focus:border-amber-400"
                  placeholder="e.g. For Highway Escort & Insurance Audit"
                />
              </div>
            </div>
          </div>

          {/* Structure Preview Callout */}
          <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 flex items-start gap-3">
            <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div className="text-[11px] text-slate-400 space-y-0.5">
              <p className="font-bold text-slate-200">
                Package Structure ({selectedDocs.length + 1} Pages Total):
              </p>
              <p>
                • <strong>Page 1:</strong> Official Cover Manifest listing all enclosed documents, combined insured valuation, client credentials, and PKI security seal.
              </p>
              <p>
                • <strong>Pages 2 to {selectedDocs.length + 1}:</strong> Full executed copies of each selected document formatted in high-resolution A4 with running headers and page indices.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              {selectedDocs.length} document{selectedDocs.length !== 1 ? 's' : ''} ready to compile
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs px-4 py-2.5 rounded-xl transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handlePrint}
              disabled={selectedDocs.length === 0 || isGenerating}
              className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
              id="bulk-print-trigger-btn"
              title="Compile and open consolidated package in print window"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>Print Package</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              disabled={selectedDocs.length === 0 || isGenerating}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
              id="bulk-download-package-btn"
            >
              {isGenerating ? (
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <FileDown className="w-4 h-4 stroke-[2.5]" />
              )}
              <span>Export Consolidated PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
