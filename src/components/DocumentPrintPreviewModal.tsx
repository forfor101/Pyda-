import React, { useState, useEffect, useRef } from 'react';
import {
  Printer,
  FileDown,
  X,
  CheckCircle2,
  ShieldCheck,
  FileText,
  Receipt,
  RotateCcw,
  Sliders,
  Building,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  QrCode,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  ChevronDown,
  Eye,
  Check,
  AlertCircle,
  Truck,
  Car,
  Sparkles,
  Info,
  ClipboardList
} from 'lucide-react';
import { VaultDocument, CustomerUser } from '../types';
import { downloadProformaInvoicePdf } from '../utils/proformaInvoiceGenerator';
import { downloadPackingSlipPdf } from '../utils/packingSlipGenerator';
import { downloadCarHirePdf } from '../utils/carHireInvoiceGenerator';
import jsPDF from 'jspdf';

export type PrintColorMode = 'full_color' | 'monochrome' | 'minimal_eco';
export type PrintMarginSize = 'compact' | 'standard' | 'expanded';
export type PrintWatermark = 'none' | 'vault_copy' | 'transit_original' | 'confidential' | 'specimen';

export interface PrintSettings {
  orientation: 'portrait' | 'landscape';
  colorMode: PrintColorMode;
  marginSize: PrintMarginSize;
  includeLetterhead: boolean;
  includePkiSeal: boolean;
  watermark: PrintWatermark;
  includeSignatures: boolean;
  includeBankDetails: boolean;
  includeQrBarcode: boolean;
  includePrintTimestamp: boolean;
  zoomLevel: number; // 75, 90, 100, 125
}

interface DocumentPrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: VaultDocument | null;
  allDocuments?: VaultDocument[];
  onSelectDocument?: (doc: VaultDocument) => void;
  currentUser: CustomerUser;
  companyPhone?: string;
  onDownloadPdf?: (doc: VaultDocument) => void;
}

export const DocumentPrintPreviewModal: React.FC<DocumentPrintPreviewModalProps> = ({
  isOpen,
  onClose,
  document: initialDoc,
  allDocuments = [],
  onSelectDocument,
  currentUser,
  companyPhone = '08062466212',
  onDownloadPdf,
}) => {
  const [activeDoc, setActiveDoc] = useState<VaultDocument | null>(initialDoc);
  const [isPrinting, setIsPrinting] = useState(false);
  const [printFeedback, setPrintFeedback] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Print Configuration State
  const [settings, setSettings] = useState<PrintSettings>({
    orientation: 'portrait',
    colorMode: 'full_color',
    marginSize: 'standard',
    includeLetterhead: true,
    includePkiSeal: true,
    watermark: 'vault_copy',
    includeSignatures: true,
    includeBankDetails: true,
    includeQrBarcode: true,
    includePrintTimestamp: true,
    zoomLevel: 100,
  });

  const printSheetRef = useRef<HTMLDivElement>(null);

  // Sync active document when initialDoc changes
  useEffect(() => {
    if (initialDoc) {
      setActiveDoc(initialDoc);
    }
  }, [initialDoc]);

  // Keyboard shortcut listener for Ctrl+P / Cmd+P while modal is open
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        handleCommitPrint();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeDoc, settings]);

  if (!isOpen || !activeDoc) return null;

  const doc = activeDoc;
  const isCarHire =
    doc.docType === 'car_hire_invoice' ||
    doc.docType === 'car_hire_receipt' ||
    doc.serviceType === 'car_hire' ||
    Boolean(doc.carHireTripType);
  const isInvoice =
    doc.docType === 'proforma_invoice' ||
    doc.docType === 'car_hire_invoice' ||
    doc.title.toLowerCase().includes('invoice') ||
    doc.title.toLowerCase().includes('pro-forma');
  const isPackingSlip = doc.docType === 'packing_slip' || doc.title.toLowerCase().includes('packing slip');
  const isInsurance = doc.docType === 'insurance_certificate' || doc.title.toLowerCase().includes('insurance');
  const isBol = doc.docType === 'bill_of_lading' || doc.title.toLowerCase().includes('lading') || doc.title.toLowerCase().includes('bol');
  const isWaybill = doc.docType === 'waybill_manifest';
  const isAgreement = doc.docType === 'moving_agreement';
  const isReceipt =
    doc.docType === 'payment_receipt' ||
    doc.docType === 'car_hire_receipt' ||
    doc.title.toLowerCase().includes('receipt');

  // Handle Document Selection
  const handleSwitchDoc = (newDoc: VaultDocument) => {
    setActiveDoc(newDoc);
    if (onSelectDocument) {
      onSelectDocument(newDoc);
    }
  };

  // Zoom Helpers
  const handleZoomIn = () => {
    setSettings((prev) => ({
      ...prev,
      zoomLevel: Math.min(prev.zoomLevel + 15, 140),
    }));
  };

  const handleZoomOut = () => {
    setSettings((prev) => ({
      ...prev,
      zoomLevel: Math.max(prev.zoomLevel - 15, 60),
    }));
  };

  const handleResetZoom = () => {
    setSettings((prev) => ({
      ...prev,
      zoomLevel: 100,
    }));
  };

  // Trigger Print Execution
  const handleCommitPrint = () => {
    if (!printSheetRef.current) return;
    setIsPrinting(true);
    setPrintFeedback('Preparing print spooler...');

    try {
      // Approach A: Hidden iframe print for pristine, isolated layout
      const printSheetElement = printSheetRef.current;
      const iframe = window.document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.top = '-10000px';
      iframe.style.left = '-10000px';
      iframe.style.width = '210mm';
      iframe.style.height = '297mm';
      iframe.style.border = 'none';
      iframe.id = 'hidden-vault-print-iframe';

      window.document.body.appendChild(iframe);

      const iframeDoc = iframe.contentWindow?.document || iframe.contentDocument;
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${doc.title} - ${doc.referenceNumber} - Pyda Movers Vault</title>
              <meta charset="utf-8">
              <style>
                @page {
                  size: ${settings.orientation === 'landscape' ? 'A4 landscape' : 'A4 portrait'};
                  margin: ${
                    settings.marginSize === 'compact'
                      ? '8mm'
                      : settings.marginSize === 'expanded'
                      ? '20mm'
                      : '12mm'
                  };
                }
                * {
                  box-sizing: border-box;
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
                body {
                  margin: 0;
                  padding: 0;
                  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                  background: #ffffff;
                  color: #0c131d;
                  font-size: 11pt;
                  line-height: 1.4;
                }
                ${settings.colorMode === 'monochrome' ? `
                  * {
                    filter: grayscale(100%) contrast(110%) !important;
                    color: #000000 !important;
                    border-color: #000000 !important;
                  }
                ` : ''}
                ${settings.colorMode === 'minimal_eco' ? `
                  .eco-hide-fill {
                    background: transparent !important;
                    color: #000000 !important;
                    border: 1px solid #94a3b8 !important;
                  }
                ` : ''}
                table {
                  width: 100%;
                  border-collapse: collapse;
                }
                th, td {
                  padding: 6px 8px;
                  text-align: left;
                }
                .print-page-break {
                  page-break-inside: avoid;
                  break-inside: avoid;
                }
              </style>
            </head>
            <body>
              ${printSheetElement.outerHTML}
            </body>
          </html>
        `);
        iframeDoc.close();

        setTimeout(() => {
          try {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
            setPrintFeedback('Sent to system print dialog');
            setTimeout(() => {
              try {
                window.document.body.removeChild(iframe);
              } catch {
                // Ignore cleanup if already detached
              }
              setIsPrinting(false);
              setPrintFeedback(null);
            }, 1000);
          } catch (err) {
            // Fallback to window.print with active body class
            fallbackWindowPrint();
          }
        }, 300);
      } else {
        fallbackWindowPrint();
      }
    } catch (err) {
      fallbackWindowPrint();
    }
  };

  const fallbackWindowPrint = () => {
    window.document.body.classList.add('vault-print-active');
    setTimeout(() => {
      window.print();
      window.document.body.classList.remove('vault-print-active');
      setIsPrinting(false);
      setPrintFeedback(null);
    }, 150);
  };

  // Handle direct PDF download
  const handleDownload = () => {
    if (onDownloadPdf) {
      onDownloadPdf(doc);
      return;
    }
    if (isCarHire) {
      downloadCarHirePdf(doc, isReceipt, companyPhone);
      return;
    }
    if (isInvoice) {
      downloadProformaInvoicePdf(doc, companyPhone);
      return;
    }
    if (isPackingSlip) {
      downloadPackingSlipPdf(
        {
          packingSlipRef: doc.packingSlipRef || doc.referenceNumber,
          issuedDate: doc.issuedDate,
          clientName: doc.clientName || currentUser.fullName || 'Valued Consignee',
          clientPhone: doc.clientPhone || currentUser.phone || companyPhone,
          originAddress: doc.originCity || 'Plot 14, Victoria Island, Lagos Hub',
          destinationAddress: doc.destinationCity || 'Maitama District, Abuja FCT',
          serviceType: doc.serviceType || 'Corporate Executive Relocation',
          assignedVehicle: doc.recommendedVehicle || doc.vehicleType || '10-Ton Logistics Truck',
          items: doc.inventoryItems || [],
          totalCbm: doc.totalCbm || 14.8,
        },
        companyPhone
      );
      return;
    }
    // Generic fallback PDF
    const pdf = new jsPDF({
      orientation: settings.orientation,
      unit: 'mm',
      format: 'a4',
    });
    pdf.setFontSize(16);
    pdf.text(doc.title, 15, 20);
    pdf.setFontSize(10);
    pdf.text(`Reference: ${doc.referenceNumber}`, 15, 28);
    pdf.text(`Issued: ${doc.issuedDate} | Authority: ${doc.underwriterOrIssuer || 'Pyda Movers'}`, 15, 34);
    pdf.text(doc.summaryText, 15, 44, { maxWidth: 180 });
    pdf.save(`${doc.referenceNumber}.pdf`);
  };

  // Watermark text mapping
  const getWatermarkText = () => {
    switch (settings.watermark) {
      case 'vault_copy':
        return 'OFFICIAL VAULT COPY';
      case 'transit_original':
        return 'ORIGINAL TRANSIT DOCUMENT';
      case 'confidential':
        return 'STRICTLY CONFIDENTIAL';
      case 'specimen':
        return 'VERIFIED SPECIMEN';
      default:
        return null;
    }
  };

  // Margin CSS mapping
  const getMarginClass = () => {
    switch (settings.marginSize) {
      case 'compact':
        return 'p-6 sm:p-8';
      case 'expanded':
        return 'p-10 sm:p-14';
      default:
        return 'p-8 sm:p-10';
    }
  };

  const watermarkText = getWatermarkText();

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col items-stretch overflow-hidden select-none"
      id="document-print-preview-modal"
      role="dialog"
      aria-modal="true"
    >
      {/* Top Header Navigation & Action Bar */}
      <header className="h-16 bg-slate-900 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0 shadow-lg">
        {/* Left: Title, Ref & Switcher */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
            <Printer className="w-5 h-5" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-black text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-md uppercase tracking-wider">
                {doc.referenceNumber}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden sm:inline-block">
                • Print-Friendly Live Staging
              </span>
            </div>
            <h2 className="text-sm sm:text-base font-black text-white truncate max-w-xs sm:max-w-md md:max-w-xl">
              {doc.title}
            </h2>
          </div>

          {/* Document switcher if multiple vault documents available */}
          {allDocuments.length > 1 && (
            <div className="hidden lg:flex items-center ml-2 border-l border-slate-800 pl-3">
              <label htmlFor="doc-switcher" className="sr-only">Switch Document</label>
              <select
                id="doc-switcher"
                value={doc.id}
                onChange={(e) => {
                  const target = allDocuments.find((d) => d.id === e.target.value);
                  if (target) handleSwitchDoc(target);
                }}
                className="bg-slate-950 border border-slate-700 text-slate-200 text-xs font-bold rounded-lg px-2.5 py-1.5 focus:border-amber-400 focus:outline-none"
              >
                {allDocuments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.referenceNumber} - {d.title.slice(0, 32)}...
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Right: Zoom controls, Commit Print Button, Close */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Zoom controls */}
          <div className="hidden md:flex items-center bg-slate-950 border border-slate-800 rounded-xl p-0.5">
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-850 rounded-lg transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-mono font-bold text-slate-300 px-2 min-w-[42px] text-center">
              {settings.zoomLevel}%
            </span>
            <button
              type="button"
              onClick={handleZoomIn}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-850 rounded-lg transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleResetZoom}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-850 rounded-lg transition-colors text-[10px] font-bold px-1.5"
              title="Reset Zoom to 100%"
            >
              100%
            </button>
          </div>

          {/* Toggle sidebar button (mobile/tablet) */}
          <button
            type="button"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
              isSidebarOpen
                ? 'bg-slate-800 border-slate-700 text-amber-400'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Toggle Print Customizer Settings"
          >
            <Sliders className="w-4 h-4" />
            <span className="hidden sm:inline">Settings</span>
          </button>

          {/* Secondary: Download PDF */}
          <button
            type="button"
            onClick={handleDownload}
            className="bg-slate-850 hover:bg-slate-800 border border-slate-750 text-slate-200 font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow active:scale-95"
            title="Download standalone PDF document"
          >
            <FileDown className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Save PDF</span>
          </button>

          {/* Primary: Commit to Print (Browser Print Dialog) */}
          <button
            type="button"
            onClick={handleCommitPrint}
            disabled={isPrinting}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-amber-950/40 hover:shadow-amber-950/60 transition-all active:scale-95 cursor-pointer"
            id="commit-browser-print-btn"
            title="Commit and send this live document to the browser's native print spooler (Ctrl+P / ⌘P)"
          >
            <Printer className="w-4 h-4 stroke-[2.5]" />
            <span>Commit to Print</span>
            <span className="hidden lg:inline-block bg-slate-950/20 text-slate-950 font-mono text-[10px] px-1.5 py-0.5 rounded font-bold ml-1">
              Ctrl+P
            </span>
          </button>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors ml-1"
            title="Close Print Preview"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Workspace: Left Settings Sidebar + Center Live A4 Canvas */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Left Drawer: Print Staging Controls & Toggles */}
        {isSidebarOpen && (
          <aside
            className="w-full md:w-80 lg:w-88 bg-slate-900/95 border-b md:border-b-0 md:border-r border-slate-800 p-4 sm:p-5 overflow-y-auto shrink-0 space-y-5 z-20"
            id="print-settings-drawer"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-amber-400" />
                  <span>Print Staging Parameters</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                  Live Sync
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Adjust typography, color mode, and security seals prior to dispatching to your physical printer or PDF driver.
              </p>
            </div>

            {/* Section 1: Color Mode */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block">Print Rendering Mode</label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'full_color', label: 'Full Color', desc: 'Corporate' },
                  { id: 'monochrome', label: 'Monochrome', desc: 'Laser B&W' },
                  { id: 'minimal_eco', label: 'Eco Toner', desc: 'Light Ink' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setSettings((s) => ({ ...s, colorMode: mode.id as PrintColorMode }))}
                    className={`p-2 rounded-xl text-left border transition-all ${
                      settings.colorMode === mode.id
                        ? 'bg-amber-500/15 border-amber-500/60 text-amber-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="font-bold text-xs block truncate">{mode.label}</span>
                    <span className="text-[10px] text-slate-500 block truncate">{mode.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Section 2: Page Margins & Orientation */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">Paper Margins</label>
                <select
                  value={settings.marginSize}
                  onChange={(e) => setSettings((s) => ({ ...s, marginSize: e.target.value as PrintMarginSize }))}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs font-bold rounded-xl px-2.5 py-2 focus:border-amber-400 focus:outline-none"
                >
                  <option value="compact">Compact (8mm)</option>
                  <option value="standard">Standard (12mm)</option>
                  <option value="expanded">Expanded (20mm)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">Orientation</label>
                <select
                  value={settings.orientation}
                  onChange={(e) => setSettings((s) => ({ ...s, orientation: e.target.value as 'portrait' | 'landscape' }))}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs font-bold rounded-xl px-2.5 py-2 focus:border-amber-400 focus:outline-none"
                >
                  <option value="portrait">Portrait (A4)</option>
                  <option value="landscape">Landscape</option>
                </select>
              </div>
            </div>

            {/* Section 3: Watermark Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">Document Security Watermark</label>
              <select
                value={settings.watermark}
                onChange={(e) => setSettings((s) => ({ ...s, watermark: e.target.value as PrintWatermark }))}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs font-bold rounded-xl px-2.5 py-2 focus:border-amber-400 focus:outline-none"
              >
                <option value="none">No Watermark (Clean)</option>
                <option value="vault_copy">OFFICIAL VAULT COPY</option>
                <option value="transit_original">ORIGINAL TRANSIT DOCUMENT</option>
                <option value="confidential">STRICTLY CONFIDENTIAL</option>
                <option value="specimen">VERIFIED SPECIMEN</option>
              </select>
            </div>

            {/* Section 4: Document Inclusions Toggles */}
            <div className="space-y-2.5 pt-2 border-t border-slate-800">
              <span className="text-xs font-bold text-slate-300 block">Print Element Controls</span>

              <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer p-2 rounded-xl bg-slate-950/70 hover:bg-slate-950 border border-slate-850">
                <span className="flex items-center gap-2">
                  <Building className="w-3.5 h-3.5 text-amber-400" />
                  <span>Corporate Letterhead & Hotlines</span>
                </span>
                <input
                  type="checkbox"
                  checked={settings.includeLetterhead}
                  onChange={(e) => setSettings((s) => ({ ...s, includeLetterhead: e.target.checked }))}
                  className="rounded border-slate-700 text-amber-500 focus:ring-amber-400 bg-slate-900 h-4 w-4"
                />
              </label>

              <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer p-2 rounded-xl bg-slate-950/70 hover:bg-slate-950 border border-slate-850">
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Digital PKI Tamper-Proof Stamp</span>
                </span>
                <input
                  type="checkbox"
                  checked={settings.includePkiSeal}
                  onChange={(e) => setSettings((s) => ({ ...s, includePkiSeal: e.target.checked }))}
                  className="rounded border-slate-700 text-amber-500 focus:ring-amber-400 bg-slate-900 h-4 w-4"
                />
              </label>

              <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer p-2 rounded-xl bg-slate-950/70 hover:bg-slate-950 border border-slate-850">
                <span className="flex items-center gap-2">
                  <QrCode className="w-3.5 h-3.5 text-blue-400" />
                  <span>QR / Barcode Verification Matrix</span>
                </span>
                <input
                  type="checkbox"
                  checked={settings.includeQrBarcode}
                  onChange={(e) => setSettings((s) => ({ ...s, includeQrBarcode: e.target.checked }))}
                  className="rounded border-slate-700 text-amber-500 focus:ring-amber-400 bg-slate-900 h-4 w-4"
                />
              </label>

              <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer p-2 rounded-xl bg-slate-950/70 hover:bg-slate-950 border border-slate-850">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Signatory Blocks & Endorsements</span>
                </span>
                <input
                  type="checkbox"
                  checked={settings.includeSignatures}
                  onChange={(e) => setSettings((s) => ({ ...s, includeSignatures: e.target.checked }))}
                  className="rounded border-slate-700 text-amber-500 focus:ring-amber-400 bg-slate-900 h-4 w-4"
                />
              </label>

              {isInvoice && (
                <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer p-2 rounded-xl bg-slate-950/70 hover:bg-slate-950 border border-slate-850">
                  <span className="flex items-center gap-2">
                    <Receipt className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Corporate Bank Settlement Details</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={settings.includeBankDetails}
                    onChange={(e) => setSettings((s) => ({ ...s, includeBankDetails: e.target.checked }))}
                    className="rounded border-slate-700 text-amber-500 focus:ring-amber-400 bg-slate-900 h-4 w-4"
                  />
                </label>
              )}
            </div>

            {/* Print Specification Banner */}
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2 text-[11px]">
              <div className="flex items-center justify-between text-slate-400">
                <span>Output Media:</span>
                <span className="font-mono text-slate-200 font-bold">Standard A4 Sheet</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Print Driver:</span>
                <span className="text-slate-200 font-bold">System Default Spooler</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Verification ID:</span>
                <span className="font-mono text-amber-400 font-bold">{doc.verifiedStampCode}</span>
              </div>
            </div>
          </aside>
        )}

        {/* Center: Interactive Scrollable Viewport with Scaled Photorealistic Print Sheet */}
        <main
          className="flex-1 overflow-auto bg-slate-950 p-4 sm:p-8 flex items-start justify-center"
          id="print-sheet-viewport"
        >
          <div
            style={{
              transform: `scale(${settings.zoomLevel / 100})`,
              transformOrigin: 'top center',
              transition: 'transform 0.15s ease-out',
            }}
            className="w-full flex justify-center py-2"
          >
            {/* The Actual A4 Sheet */}
            <div
              ref={printSheetRef}
              id="printable-vault-document-sheet"
              className={`w-full max-w-[210mm] min-h-[297mm] bg-white text-slate-900 shadow-2xl rounded-sm relative flex flex-col justify-between select-text border border-slate-300 font-sans ${getMarginClass()} ${
                settings.colorMode === 'monochrome' ? 'grayscale contrast-125' : ''
              }`}
            >
              {/* Optional Semitransparent Centered Watermark */}
              {watermarkText && (
                <div
                  className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-0"
                  aria-hidden="true"
                >
                  <div className="transform -rotate-45 text-slate-950/[0.045] font-black text-5xl sm:text-6xl tracking-widest uppercase select-none text-center leading-tight">
                    {watermarkText}
                  </div>
                </div>
              )}

              {/* SHEET CONTENT CONTAINER */}
              <div className="relative z-10 space-y-6">
                {/* 1. Official Header & Letterhead */}
                {settings.includeLetterhead && (
                  <div
                    className={`border-b pb-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 ${
                      settings.colorMode === 'minimal_eco'
                        ? 'border-slate-400'
                        : 'border-slate-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center font-black text-sm">
                          P
                        </div>
                        <div>
                          <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-950 uppercase leading-none">
                            Pyda Movers & Megatrend Logistics
                          </h1>
                          <p className="text-[10px] font-bold text-slate-600 tracking-wide mt-0.5">
                            National Heavy Haulage & Corporate Interstate Relocation Division
                          </p>
                        </div>
                      </div>

                      <div className="text-[9.5px] text-slate-500 mt-2.5 space-y-0.5 leading-tight">
                        <p>RC No: 1849204 • FIRS TIN: 24892019-0001 • NAICOM Transit Brokerage Cert: TB-9042</p>
                        <p>Corporate HQs: Sabo-Yaba Logistics Terminal, Lagos • CBD Central Hub, Abuja FCT</p>
                        <p>Emergency Dispatch Hotline: {companyPhone} • Email: dispatch@pydamovers.ng</p>
                      </div>
                    </div>

                    {/* Top Right Reference & Barcode Pill */}
                    <div className="text-right shrink-0">
                      {settings.includeQrBarcode && (
                        <div className="inline-block bg-slate-100 border border-slate-300 p-1.5 rounded-lg mb-1 text-center">
                          {/* Stylized Barcode Graphic */}
                          <div className="h-6 flex items-center gap-0.5 justify-center px-1">
                            <span className="w-0.5 h-full bg-slate-900"></span>
                            <span className="w-1 h-full bg-slate-900"></span>
                            <span className="w-0.5 h-full bg-slate-900"></span>
                            <span className="w-1.5 h-full bg-slate-900"></span>
                            <span className="w-0.5 h-full bg-slate-900"></span>
                            <span className="w-1 h-full bg-slate-900"></span>
                            <span className="w-2 h-full bg-slate-900"></span>
                            <span className="w-0.5 h-full bg-slate-900"></span>
                            <span className="w-1.5 h-full bg-slate-900"></span>
                            <span className="w-1 h-full bg-slate-900"></span>
                          </div>
                          <span className="font-mono text-[8px] tracking-widest text-slate-600 block mt-0.5">
                            *{doc.referenceNumber}*
                          </span>
                        </div>
                      )}

                      <div className="space-y-0.5">
                        <div className="text-[10px] font-bold text-slate-400 uppercase">Document Reference</div>
                        <div className="font-mono font-black text-sm text-slate-900">{doc.referenceNumber}</div>
                        <div className="text-[10px] text-slate-600">Issued: {doc.issuedDate}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Document Title Heading & Category Banner */}
                <div
                  className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                    settings.colorMode === 'minimal_eco'
                      ? 'bg-slate-50 border-slate-300'
                      : 'bg-slate-900 text-white border-slate-800'
                  }`}
                >
                  <div>
                    <span
                      className={`text-[9.5px] font-black uppercase tracking-wider block ${
                        settings.colorMode === 'minimal_eco' ? 'text-amber-700' : 'text-amber-400'
                      }`}
                    >
                      {doc.docType.replace('_', ' ').toUpperCase()} • LEGAL ARCHIVE COPY
                    </span>
                    <h2
                      className={`text-base sm:text-lg font-black tracking-tight ${
                        settings.colorMode === 'minimal_eco' ? 'text-slate-950' : 'text-white'
                      }`}
                    >
                      {doc.title}
                    </h2>
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <span
                      className={`inline-block text-[10px] font-mono font-bold px-2.5 py-1 rounded-md border ${
                        settings.colorMode === 'minimal_eco'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      }`}
                    >
                      STATUS: {doc.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* 3. Primary Metadata Grid (Parties, Origin, Destination) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 block uppercase">Client / Consignor</span>
                    <span className="font-black text-slate-900 block truncate">
                      {doc.clientName || currentUser.fullName}
                    </span>
                    <span className="text-[10px] text-slate-600 block truncate">
                      {doc.clientPhone || currentUser.phone}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-500 block uppercase">Issuing Carrier / Authority</span>
                    <span className="font-bold text-slate-900 block truncate">
                      {doc.underwriterOrIssuer || 'Pyda Movers Fleet'}
                    </span>
                    <span className="text-[10px] text-slate-600 block truncate">Logistics Terminal Division</span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-500 block uppercase">Route / Transit Corridor</span>
                    <span className="font-bold text-slate-900 block truncate">
                      {doc.originCity || 'Lagos Terminal'}
                    </span>
                    <span className="text-[10px] text-slate-600 block truncate">
                      ➔ {doc.destinationCity || 'Federal Capital, Abuja'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-500 block uppercase">
                      {isInsurance ? 'Total Sum Insured' : isInvoice ? 'Commercial Total' : 'Security Level'}
                    </span>
                    <span className="font-mono font-black text-slate-900 text-sm block">
                      {doc.coverageAmountNaira
                        ? `₦${doc.coverageAmountNaira.toLocaleString('en-NG')}`
                        : 'Certified Full Cover'}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-bold block">
                      {isInsurance ? 'Zero Deductible' : 'Tax-Compliant'}
                    </span>
                  </div>
                </div>

                {/* 4. Document Specific Body Content */}

                {/* A1. Executive Car Hire Commercial Schedule & Chauffeur Specification */}
                {isCarHire ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xs font-black text-slate-950 uppercase tracking-wider mb-2 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Car className="w-3.5 h-3.5 text-emerald-600" />
                          <span>
                            {doc.carHireTripType === 'inter_state' ? 'Inter-State Highway Charter' : 'Intra-State City Charter'} • Specification
                          </span>
                        </span>
                        <span className="font-mono text-[10px] text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 uppercase font-bold">
                          {doc.docType === 'car_hire_receipt' || doc.status === 'settled'
                            ? 'PAID • OFFICIAL RECEIPT'
                            : 'PRO-FORMA COMMERCIAL TARIFF'}
                        </span>
                      </h3>

                      <table className="w-full text-xs border border-slate-200 rounded-lg overflow-hidden">
                        <thead className="bg-slate-100 text-slate-700 text-[10px] font-black uppercase border-b border-slate-200">
                          <tr>
                            <th className="py-2 px-3 text-left">Charter Description / Vehicle Particulars</th>
                            <th className="py-2 px-3 text-left">Chauffeur & Fleet Details</th>
                            <th className="py-2 px-3 text-right">Daily Rate</th>
                            <th className="py-2 px-3 text-right">Total (NGN)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 text-[11px]">
                          <tr>
                            <td className="py-2 px-3 font-medium">
                              {doc.carHireVehicle || 'Executive Fleet Vehicle'}
                              <div className="text-[10px] text-slate-500 font-mono">
                                Plate: {doc.carHirePlateNumber || 'ABJ-891-AA'} • {doc.carHireTotalDays || 1} Day(s) Charter
                              </div>
                            </td>
                            <td className="py-2 px-3 text-slate-600">
                              Chauffeur: {doc.carHireChauffeurName || 'Certified Protocol Driver'}
                              {doc.carHireChauffeurPhone && (
                                <span className="block text-[10px] text-slate-500">{doc.carHireChauffeurPhone}</span>
                              )}
                            </td>
                            <td className="py-2 px-3 text-right font-mono">
                              ₦{Math.round(((doc.carHireSubtotalNaira || (doc.coverageAmountNaira || 120000) / 1.075) / (doc.carHireTotalDays || 1))).toLocaleString('en-NG')}
                            </td>
                            <td className="py-2 px-3 text-right font-mono font-bold">
                              ₦{Math.round(doc.carHireSubtotalNaira || ((doc.coverageAmountNaira || 120000) / 1.075)).toLocaleString('en-NG')}
                            </td>
                          </tr>

                          {doc.carHireSecurityEscort && (
                            <tr>
                              <td className="py-2 px-3 font-medium">Armed Mobile Police Escort Patrol</td>
                              <td className="py-2 px-3 text-slate-500">2 Armed Tactical Operatives in Gun-Truck</td>
                              <td className="py-2 px-3 text-right font-mono">₦180,000</td>
                              <td className="py-2 px-3 text-right font-mono font-bold">
                                ₦{(180000 * (doc.carHireTotalDays || 1)).toLocaleString('en-NG')}
                              </td>
                            </tr>
                          )}

                          {doc.carHireAirportProtocol && (
                            <tr>
                              <td className="py-2 px-3 font-medium">VIP Airport Protocol & Tarmac Reception</td>
                              <td className="py-2 px-3 text-slate-500">Fast-track baggage & FAAN protocol clearance</td>
                              <td className="py-2 px-3 text-right font-mono">₦35,000</td>
                              <td className="py-2 px-3 text-right font-mono font-bold">₦35,000</td>
                            </tr>
                          )}

                          <tr>
                            <td className="py-2 px-3 font-medium">
                              {doc.carHireTripType === 'inter_state' ? 'Interstate Highway Tolls & GPS Telematics' : 'Intra-City Fuel & Maintenance Guarantee'}
                            </td>
                            <td className="py-2 px-3 text-slate-500">Dedicated GPS satellite tracking and fuel allowance</td>
                            <td className="py-2 px-3 text-right font-mono">Included</td>
                            <td className="py-2 px-3 text-right font-mono font-bold">₦0</td>
                          </tr>
                        </tbody>
                        <tfoot className="bg-slate-50 font-bold border-t border-slate-300 text-xs">
                          <tr>
                            <td colSpan={3} className="py-2 px-3 text-right text-slate-600">
                              Net Charter Subtotal:
                            </td>
                            <td className="py-2 px-3 text-right font-mono">
                              ₦{Math.round(doc.carHireSubtotalNaira || ((doc.coverageAmountNaira || 120000) / 1.075)).toLocaleString('en-NG')}
                            </td>
                          </tr>
                          <tr>
                            <td colSpan={3} className="py-1.5 px-3 text-right text-slate-600">
                              Statutory Federal VAT (7.5% FIRS):
                            </td>
                            <td className="py-1.5 px-3 text-right font-mono text-emerald-700">
                              ₦{Math.round(doc.carHireVatNaira || ((doc.coverageAmountNaira || 120000) - (doc.coverageAmountNaira || 120000) / 1.075)).toLocaleString('en-NG')}
                            </td>
                          </tr>
                          <tr className="border-t-2 border-slate-900 bg-slate-100 text-slate-950 font-black text-sm">
                            <td colSpan={3} className="py-2.5 px-3 text-right">
                              {doc.docType === 'car_hire_receipt' || doc.status === 'settled'
                                ? 'TOTAL CHARTER AMOUNT PAID (CLEARED):'
                                : 'TOTAL PRO-FORMA CHARTER PAYABLE:'}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-base text-emerald-800">
                              ₦{(doc.coverageAmountNaira || 120000).toLocaleString('en-NG')}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    {/* Corporate Settlement / Clearance Box */}
                    {settings.includeBankDetails && (
                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                        {doc.docType === 'car_hire_receipt' || doc.status === 'settled' ? (
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <span className="text-[10px] font-black text-emerald-800 uppercase tracking-wider block">
                                Payment Settled • Official Tax Clearance Confirmed
                              </span>
                              <p className="text-[11px] text-slate-600 mt-1">
                                Electronic fund settlement confirmed via NIBSS Instant Payments. This receipt serves as an authentic tax invoice and receipt for corporate tax clearance and accounting records.
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-[9px] font-mono text-slate-400 block">FIRS TIN: 23891048-0001</span>
                              <span className="text-[10px] font-mono font-bold text-emerald-800 block">STATUS: TAX CLEARED</span>
                            </div>
                          </div>
                        ) : (
                          <>
                            <span className="text-[10px] font-black text-slate-900 uppercase tracking-wider block mb-2">
                              Charter Remittance Account (NIBSS Direct Deposit)
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                                <span className="text-[10px] text-slate-500 font-bold block">Zenith Bank Plc</span>
                                <span className="font-mono font-black text-slate-950 text-sm block">1014928014</span>
                                <span className="text-[10px] text-slate-600 block">Pyda Movers & Logistics Ltd</span>
                              </div>
                              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                                <span className="text-[10px] text-slate-500 font-bold block">First Bank of Nigeria</span>
                                <span className="font-mono font-black text-slate-950 text-sm block">2039481029</span>
                                <span className="text-[10px] text-slate-600 block">Megatrend Freight Services</span>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ) : isInvoice ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xs font-black text-slate-950 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Receipt className="w-3.5 h-3.5 text-amber-600" />
                        <span>Itemized Commercial Schedule & Logistics Tariff</span>
                      </h3>

                      <table className="w-full text-xs border border-slate-200 rounded-lg overflow-hidden">
                        <thead className="bg-slate-100 text-slate-700 text-[10px] font-black uppercase border-b border-slate-200">
                          <tr>
                            <th className="py-2 px-3 text-left">Item / Logistics Service Description</th>
                            <th className="py-2 px-3 text-left">Scope / Spec</th>
                            <th className="py-2 px-3 text-right">Rate (NGN)</th>
                            <th className="py-2 px-3 text-right">Total (NGN)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 text-[11px]">
                          <tr>
                            <td className="py-2 px-3 font-medium">Base Relocation Crew, Loading & Rigging</td>
                            <td className="py-2 px-3 text-slate-500">Certified White-Glove Movers</td>
                            <td className="py-2 px-3 text-right font-mono">
                              ₦{(doc.quoteBreakdown?.baseRateNaira || 180000).toLocaleString('en-NG')}
                            </td>
                            <td className="py-2 px-3 text-right font-mono font-bold">
                              ₦{(doc.quoteBreakdown?.baseRateNaira || 180000).toLocaleString('en-NG')}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2 px-3 font-medium">Inter-State Distance Haulage Freight</td>
                            <td className="py-2 px-3 text-slate-500">Dedicated GPS Heavy Fleet</td>
                            <td className="py-2 px-3 text-right font-mono">
                              ₦{(doc.quoteBreakdown?.distanceCostNaira || 345000).toLocaleString('en-NG')}
                            </td>
                            <td className="py-2 px-3 text-right font-mono font-bold">
                              ₦{(doc.quoteBreakdown?.distanceCostNaira || 345000).toLocaleString('en-NG')}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2 px-3 font-medium">Terrain & Access Difficulty Handling</td>
                            <td className="py-2 px-3 text-slate-500">Hydraulic Tail-Lift Transfer</td>
                            <td className="py-2 px-3 text-right font-mono">
                              ₦{(doc.quoteBreakdown?.accessSurchargeNaira || 45000).toLocaleString('en-NG')}
                            </td>
                            <td className="py-2 px-3 text-right font-mono font-bold">
                              ₦{(doc.quoteBreakdown?.accessSurchargeNaira || 45000).toLocaleString('en-NG')}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2 px-3 font-medium">Export Crating & Heavy Packing Materials</td>
                            <td className="py-2 px-3 text-slate-500">5-Layer Corrugated Blankets</td>
                            <td className="py-2 px-3 text-right font-mono">
                              ₦{(doc.quoteBreakdown?.packingMaterialsNaira || 120000).toLocaleString('en-NG')}
                            </td>
                            <td className="py-2 px-3 text-right font-mono font-bold">
                              ₦{(doc.quoteBreakdown?.packingMaterialsNaira || 120000).toLocaleString('en-NG')}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2 px-3 font-medium">Goods-In-Transit (GIT) Comprehensive Insurance</td>
                            <td className="py-2 px-3 text-slate-500">Leadway Assurance Policy</td>
                            <td className="py-2 px-3 text-right font-mono">
                              ₦{(doc.quoteBreakdown?.insuranceCostNaira || 65000).toLocaleString('en-NG')}
                            </td>
                            <td className="py-2 px-3 text-right font-mono font-bold">
                              ₦{(doc.quoteBreakdown?.insuranceCostNaira || 65000).toLocaleString('en-NG')}
                            </td>
                          </tr>
                        </tbody>
                        <tfoot className="bg-slate-50 font-bold border-t border-slate-300 text-xs">
                          <tr>
                            <td colSpan={3} className="py-2 px-3 text-right text-slate-600">
                              Subtotal (Net Commercial Logistics):
                            </td>
                            <td className="py-2 px-3 text-right font-mono">
                              ₦{((doc.coverageAmountNaira || 755000) * 0.93).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            </td>
                          </tr>
                          <tr>
                            <td colSpan={3} className="py-1.5 px-3 text-right text-slate-600">
                              Statutory Federal VAT (7.5%):
                            </td>
                            <td className="py-1.5 px-3 text-right font-mono">
                              ₦{((doc.coverageAmountNaira || 755000) * 0.07).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            </td>
                          </tr>
                          <tr className="border-t-2 border-slate-900 bg-slate-100 text-slate-950 font-black text-sm">
                            <td colSpan={3} className="py-2.5 px-3 text-right">
                              TOTAL COMMERCIAL INVOICE PAYABLE:
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-base">
                              ₦{(doc.coverageAmountNaira || 755000).toLocaleString('en-NG')}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    {/* Corporate Bank Settlement Box */}
                    {settings.includeBankDetails && (
                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                        <span className="text-[10px] font-black text-slate-900 uppercase tracking-wider block mb-2">
                          Corporate Bank Settlement Instructions (NIBSS Direct Settlement)
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                            <span className="text-[10px] text-slate-500 font-bold block">Option 1: Primary Corporate Account</span>
                            <span className="font-bold text-slate-900 text-xs block">Zenith Bank Plc</span>
                            <span className="font-mono font-black text-slate-950 text-sm block">1014928014</span>
                            <span className="text-[10px] text-slate-600 block">Account: Pyda Movers & Logistics Ltd</span>
                          </div>
                          <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                            <span className="text-[10px] text-slate-500 font-bold block">Option 2: Secondary Corporate Account</span>
                            <span className="font-bold text-slate-900 text-xs block">First Bank of Nigeria</span>
                            <span className="font-mono font-black text-slate-950 text-sm block">2039481029</span>
                            <span className="text-[10px] text-slate-600 block">Account: Megatrend Freight Services</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}

                {/* B. Insurance Certificate Specific Clauses */}
                {isInsurance && (
                  <div className="space-y-3 text-xs">
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                      <span className="text-[10px] font-black text-slate-900 uppercase tracking-wider block mb-1">
                        Goods-In-Transit (GIT) Comprehensive Scope of Cover
                      </span>
                      <p className="text-slate-700 leading-relaxed text-[11px]">
                        {doc.summaryText}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[10px]">
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                        <span className="font-bold text-slate-900 block">Covered Transit Perils:</span>
                        <span className="text-slate-600 block mt-0.5">
                          Overturn, collision, armed hijack, highway piracy, storm water ingress, and cargo collapse.
                        </span>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                        <span className="font-bold text-slate-900 block">Deductible / Excess:</span>
                        <span className="text-emerald-700 font-bold block mt-0.5">
                          0% NIL Excess on White-Glove packaged consignments.
                        </span>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                        <span className="font-bold text-slate-900 block">Claim Settlement Timeline:</span>
                        <span className="text-slate-600 block mt-0.5">
                          Fast-track 48-hour certified claim processing via Leadway Consortium.
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* C. Bill of Lading & Waybill Manifest Specifics */}
                {(isBol || isWaybill) && (
                  <div className="space-y-3 text-xs">
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                      <span className="text-[10px] font-black text-slate-900 uppercase tracking-wider block mb-1">
                        Carrier Transit Manifest & Cargo Particulars
                      </span>
                      <p className="text-slate-700 leading-relaxed text-[11px]">
                        {doc.summaryText}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <div>
                        <span className="font-bold text-slate-500 block">Assigned Truck:</span>
                        <span className="font-mono text-slate-900 font-bold block">MGT-30T-HYD-902</span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-500 block">Container Tamper Seal:</span>
                        <span className="font-mono text-emerald-800 font-bold block">PYDA-SL-94021</span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-500 block">Security Convoy:</span>
                        <span className="text-slate-900 font-bold block">Armed Escort Alpha</span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-500 block">Estimated Hours:</span>
                        <span className="text-slate-900 font-bold block">24 - 36 Hours</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Packing Slip Inventory Manifest Table */}
                {isPackingSlip && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xs font-black text-slate-950 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <ClipboardList className="w-3.5 h-3.5 text-amber-600" />
                        <span>Certified Consignment Packing Manifest & Transit Inventory</span>
                      </h3>

                      <table className="w-full text-xs border border-slate-200 rounded-lg overflow-hidden">
                        <thead className="bg-slate-100 text-slate-700 text-[10px] font-black uppercase border-b border-slate-200">
                          <tr>
                            <th className="py-2 px-3 text-left w-12">#</th>
                            <th className="py-2 px-3 text-left">Item Description</th>
                            <th className="py-2 px-3 text-left">Category</th>
                            <th className="py-2 px-3 text-center">Qty</th>
                            <th className="py-2 px-3 text-right">Volume (CBM)</th>
                            <th className="py-2 px-3 text-right">Handling Spec</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 text-[11px]">
                          {(doc.inventoryItems && doc.inventoryItems.length > 0 ? doc.inventoryItems : [
                            { id: '1', name: 'Executive Teak Office Desk (L-Shape)', category: 'Office', quantity: 2, cbm: 1.45, fragile: false, disassemblyRequired: true },
                            { id: '2', name: 'Ergonomic Mesh Task Chairs (High-Back)', category: 'Office', quantity: 8, cbm: 0.35, fragile: false },
                            { id: '3', name: 'Server Rack Enclosure & UPS Battery Cabinet', category: 'IT / Server', quantity: 1, cbm: 2.1, fragile: true },
                            { id: '4', name: 'Tempered Glass Conference Table (10-Seater)', category: 'Office', quantity: 1, cbm: 2.8, fragile: true, disassemblyRequired: true },
                            { id: '5', name: 'Steel Fireproof Filing Safes (4-Drawer)', category: 'Storage', quantity: 3, cbm: 0.95, fragile: false },
                          ]).map((item: any, index: number) => (
                            <tr key={item.id || index} className="hover:bg-slate-50">
                              <td className="py-2 px-3 font-mono text-slate-400 text-[10px]">{index + 1}</td>
                              <td className="py-2 px-3 font-semibold text-slate-900">{item.name}</td>
                              <td className="py-2 px-3 text-slate-500 uppercase text-[10px]">{item.category}</td>
                              <td className="py-2 px-3 text-center font-bold font-mono">{item.quantity}</td>
                              <td className="py-2 px-3 text-right font-mono">{(item.cbm * item.quantity).toFixed(2)}</td>
                              <td className="py-2 px-3 text-right">
                                {item.fragile ? (
                                  <span className="text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded font-bold text-[9px] border border-rose-200">
                                    FRAGILE
                                  </span>
                                ) : item.disassemblyRequired ? (
                                  <span className="text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded font-bold text-[9px] border border-blue-200">
                                    DISASSEMBLE
                                  </span>
                                ) : (
                                  <span className="text-slate-500 text-[10px]">Standard</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-slate-50 font-bold border-t border-slate-300 text-xs">
                          <tr>
                            <td colSpan={3} className="py-2 px-3 text-slate-600">
                              Total Manifest Volume & Units:
                            </td>
                            <td className="py-2 px-3 text-center font-mono font-bold text-slate-900">
                              {doc.totalPieces || (doc.inventoryItems ? doc.inventoryItems.reduce((acc: number, i: any) => acc + i.quantity, 0) : 52)}
                            </td>
                            <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                              {doc.totalCbm ? `${doc.totalCbm.toFixed(2)} CBM` : '14.80 CBM'}
                            </td>
                            <td></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[10px]">
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                        <span className="font-bold text-slate-900 block">Assigned Transport Fleet:</span>
                        <span className="text-slate-700 font-mono block mt-0.5">
                          {doc.recommendedVehicle || doc.vehicleType || '10-Ton Heavy Logistics Truck'}
                        </span>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                        <span className="font-bold text-slate-900 block">Security Tamper Seals:</span>
                        <span className="text-amber-800 font-mono font-bold block mt-0.5">
                          {doc.sealNumbers?.join(', ') || 'PYDA-SL-88910 - 88915'}
                        </span>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                        <span className="font-bold text-slate-900 block">Certified Marshall:</span>
                        <span className="text-slate-700 block mt-0.5">
                          {doc.inspectorName || 'M. Ibrahim (Senior Marshall)'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* D. Generic Summary Text for other documents */}
                {!isInvoice && !isInsurance && !isBol && !isWaybill && !isPackingSlip && (
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-wider block mb-1">
                      Legal Covenant & Executive Scope
                    </span>
                    <p className="text-slate-700 leading-relaxed text-[11px]">
                      {doc.summaryText}
                    </p>
                  </div>
                )}

                {/* 5. Signatory & Digital Execution Block */}
                {settings.includeSignatures && (
                  <div className="pt-4 border-t border-slate-300">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Left Signature: Pyda Movers Officer */}
                      <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50">
                        <span className="text-[9.5px] font-black text-slate-500 uppercase tracking-wider block">
                          Carrier / Authorized Registrar
                        </span>
                        <div className="h-10 flex items-center mt-1">
                          <span className="font-serif italic text-base text-slate-800 tracking-wider">
                            Capt. B. Alade, Leadway Registrar
                          </span>
                        </div>
                        <div className="border-t border-slate-300 pt-1 text-[9.5px] text-slate-600">
                          <span className="font-bold text-slate-900 block">Head of Marine & Road Transit Underwriting</span>
                          <span>Pyda Movers & Megatrend Logistics Nigeria</span>
                        </div>
                      </div>

                      {/* Right Signature: Client or Signee */}
                      <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50">
                        <span className="text-[9.5px] font-black text-slate-500 uppercase tracking-wider block">
                          Client / Consignee Acknowledgment
                        </span>
                        <div className="h-10 flex items-center mt-1">
                          {doc.signatureRecord ? (
                            <img
                              src={doc.signatureRecord.signatureDataUrl}
                              alt="Client Signature"
                              className="h-8 max-w-[140px] object-contain"
                            />
                          ) : (
                            <span className="font-serif italic text-base text-emerald-800 tracking-wider">
                              {doc.clientName || currentUser.fullName}
                            </span>
                          )}
                        </div>
                        <div className="border-t border-slate-300 pt-1 text-[9.5px] text-slate-600">
                          <span className="font-bold text-slate-900 block">
                            {doc.clientName || currentUser.fullName}
                          </span>
                          <span>Verified Client / Authorized Representative</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 6. Security Stamp & PKI Verification Seal */}
                {settings.includePkiSeal && (
                  <div className="p-3 rounded-xl border border-emerald-300 bg-emerald-50/40 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-[10px] font-black text-emerald-900 uppercase tracking-wider">
                          Cryptographic PKI Tamper-Evident Stamp
                        </div>
                        <div className="font-mono text-[10px] text-emerald-700">
                          Verification Code: <span className="font-black">{doc.verifiedStampCode}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="inline-block text-[9px] font-mono font-bold bg-white px-2 py-0.5 rounded border border-emerald-200 text-emerald-900">
                        LEGAL INTEGRITY ASSURED
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* SHEET FOOTER */}
              <div className="pt-4 mt-6 border-t border-slate-200 text-[9px] text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span>Pyda Movers Document Vault System • Certified Physical Print Copy</span>
                  <span className="mx-1.5">•</span>
                  <span>Document Hash: {doc.id}</span>
                </div>
                <div>
                  <span>Printed: {new Date().toLocaleString('en-GB')}</span>
                  <span className="mx-1.5">•</span>
                  <span>Page 1 of 1</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Floating Status / Print Feedback Pill */}
      {printFeedback && (
        <div className="fixed bottom-4 right-4 z-50 bg-slate-900 border border-amber-500 text-amber-300 text-xs font-bold px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-3">
          <div className="w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
          <span>{printFeedback}</span>
        </div>
      )}
    </div>
  );
};
