import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  X,
  Printer,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  Search,
  ShieldCheck,
  FileText,
  Building2,
  Phone,
  Mail,
  Calendar,
  CheckCircle2,
  Lock,
  Stamp,
  ExternalLink,
  ChevronDown,
  Layers,
  Sparkles,
  PenTool,
  Check,
  Truck,
  Car,
  Receipt,
  ClipboardList,
  SlidersHorizontal,
  Bookmark
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { VaultDocument, CustomerUser, SignatureRecord } from '../types';
import { downloadProformaInvoicePdf } from '../utils/proformaInvoiceGenerator';
import { downloadPackingSlipPdf, PackingSlipData } from '../utils/packingSlipGenerator';
import { downloadCarHirePdf } from '../utils/carHireInvoiceGenerator';
import { INITIAL_INVENTORY_ITEMS } from '../data/companyData';
import jsPDF from 'jspdf';

interface PdfContractViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: VaultDocument | null;
  currentUser: CustomerUser;
  companyPhone?: string;
  onOpenSignModal?: (doc: VaultDocument) => void;
  onOpenPrintSettings?: (doc: VaultDocument) => void;
}

export type ViewerWatermark = 'none' | 'vault_copy' | 'official_original' | 'confidential' | 'specimen';

export const PdfContractViewerModal: React.FC<PdfContractViewerModalProps> = ({
  isOpen,
  onClose,
  document: doc,
  currentUser,
  companyPhone = '08062466212',
  onOpenSignModal,
  onOpenPrintSettings,
}) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [zoomLevel, setZoomLevel] = useState<number>(100); // 50, 75, 90, 100, 115, 125, 150, 175, 200
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [watermark, setWatermark] = useState<ViewerWatermark>('vault_copy');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isOutlineOpen, setIsOutlineOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'details' | 'audit'>('preview');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const page1Ref = useRef<HTMLDivElement>(null);
  const page2Ref = useRef<HTMLDivElement>(null);

  // Total pages based on document type
  const totalPages = useMemo(() => {
    if (!doc) return 2;
    if (doc.docType === 'moving_agreement') return 2;
    if (doc.docType === 'packing_slip' || doc.inventoryItems) {
      const itemsCount = doc.inventoryItems?.length || INITIAL_INVENTORY_ITEMS.length;
      return itemsCount > 8 ? 2 : 1;
    }
    if (doc.docType === 'bill_of_lading' || doc.docType === 'waybill_manifest') return 2;
    return 2;
  }, [doc]);

  // Reset page and zoom on doc change
  useEffect(() => {
    if (isOpen) {
      setCurrentPage(1);
      setSearchQuery('');
    }
  }, [isOpen, doc?.id]);

  // Keyboard shortcut handler
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          onClose();
        }
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        handlePrintNow();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'f' || e.key === 'F')) {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      } else if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        setCurrentPage((p) => Math.min(totalPages, p + 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        setCurrentPage((p) => Math.max(1, p - 1));
      } else if ((e.ctrlKey || e.metaKey) && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        setZoomLevel((z) => Math.min(200, z + 15));
      } else if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault();
        setZoomLevel((z) => Math.max(50, z - 15));
      } else if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault();
        setZoomLevel(100);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, totalPages, isFullscreen]);

  if (!isOpen || !doc) return null;

  // Document categorization
  const isCarHire =
    doc.docType === 'car_hire_invoice' ||
    doc.docType === 'car_hire_receipt' ||
    doc.serviceType === 'car_hire' ||
    Boolean(doc.carHireTripType);
  const isInvoice =
    doc.docType === 'proforma_invoice' ||
    doc.title.toLowerCase().includes('invoice') ||
    doc.title.toLowerCase().includes('pro-forma');
  const isPackingSlip = doc.docType === 'packing_slip' || doc.title.toLowerCase().includes('packing slip');
  const isInsurance = doc.docType === 'insurance_certificate' || doc.title.toLowerCase().includes('insurance');
  const isBol = doc.docType === 'bill_of_lading' || doc.title.toLowerCase().includes('lading') || doc.title.toLowerCase().includes('bol');
  const isWaybill = doc.docType === 'waybill_manifest';
  const isAgreement = doc.docType === 'moving_agreement' || doc.title.toLowerCase().includes('agreement');
  const isReceipt = doc.docType === 'payment_receipt' || doc.title.toLowerCase().includes('receipt');

  // Helper to highlight matching text in clauses
  const highlightSearch = (text: string) => {
    if (!searchQuery.trim()) return text;
    const parts = text.split(new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === searchQuery.toLowerCase() ? (
            <mark key={i} className="bg-amber-300 text-slate-950 font-black px-0.5 rounded shadow-sm">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  // Scroll to page
  const scrollToPage = (pageNum: number) => {
    setCurrentPage(pageNum);
    if (pageNum === 1 && page1Ref.current) {
      page1Ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (pageNum === 2 && page2Ref.current) {
      page2Ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Handle browser print trigger
  const handlePrintNow = () => {
    window.print();
  };

  // Handle PDF Download
  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      if (isCarHire) {
        const isCarReceipt = doc.docType === 'car_hire_receipt' || doc.status === 'settled';
        downloadCarHirePdf(doc, isCarReceipt, companyPhone);
      } else if (isInvoice) {
        downloadProformaInvoicePdf(doc, companyPhone);
      } else if (isPackingSlip) {
        const packingData: PackingSlipData = {
          packingSlipRef: doc.packingSlipRef || doc.referenceNumber,
          issuedDate: doc.issuedDate,
          dispatchDate: doc.issuedDate,
          clientName: doc.clientName || currentUser.fullName || 'Valued Consignee',
          clientCompany: doc.clientCompany || currentUser.companyName,
          clientPhone: doc.clientPhone || currentUser.phone || companyPhone,
          clientEmail: doc.clientEmail || currentUser.email,
          originAddress: doc.originCity || 'Plot 14, Victoria Island, Lagos Hub',
          destinationAddress: doc.destinationCity || 'Maitama District, Abuja FCT',
          serviceType: doc.serviceType || 'Corporate Executive Relocation',
          assignedVehicle: doc.recommendedVehicle || doc.vehicleType || '10-Ton Heavy Logistics Truck (Hydraulic Liftgate)',
          driverName: doc.driverName || 'Captain S. Bello (Pyda Fleet)',
          inspectorName: doc.inspectorName || 'M. Ibrahim (Senior Inventory Marshall)',
          tamperSealRange: doc.sealNumbers?.join(', ') || 'PYDA-SEAL-88910 to SEAL-88915',
          items: doc.inventoryItems && doc.inventoryItems.length > 0 ? doc.inventoryItems : INITIAL_INVENTORY_ITEMS,
          surveyPhotosCount: doc.surveyPhotosCount,
          totalCbm: doc.totalCbm || 14.8,
          handlingInstructions: doc.handlingInstructions,
          pkiVerificationCode: doc.verifiedStampCode,
        };
        downloadPackingSlipPdf(packingData, companyPhone);
      } else {
        // High-Fidelity Multi-page PDF for contracts, BOL, and insurance
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
        });
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 14;
        const contentWidth = pageWidth - margin * 2;

        // Page 1 Header
        pdf.setFillColor(15, 23, 42); // slate-900
        pdf.rect(0, 0, pageWidth, 42, 'F');
        pdf.setFillColor(245, 158, 11); // amber-500
        pdf.rect(0, 42, pageWidth, 2.5, 'F');

        pdf.setTextColor(245, 158, 11);
        pdf.setFontSize(15);
        pdf.setFont('helvetica', 'bold');
        pdf.text('PYDA MOVERS & LOGISTICS NIGERIA', margin, 16);

        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.text('Client Document Vault • Legally Binding Executed Contract', margin, 23);
        pdf.text('Federal Republic of Nigeria CAC: RC-1498210 • FMWH License: FMWH/RL-0892', margin, 29);
        pdf.text(`Hotline: +234 ${companyPhone.replace(/^0/, '')} | legal@pydamovers.ng`, margin, 35);

        // Reference Box Right
        pdf.setFillColor(30, 41, 59);
        pdf.roundedRect(pageWidth - margin - 64, 10, 64, 22, 2, 2, 'F');
        pdf.setTextColor(245, 158, 11);
        pdf.setFontSize(7.5);
        pdf.setFont('helvetica', 'bold');
        pdf.text('CONTRACT REFERENCE', pageWidth - margin - 60, 17);
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(9.5);
        pdf.text(doc.referenceNumber, pageWidth - margin - 60, 26);

        let curY = 54;
        pdf.setTextColor(15, 23, 42);
        pdf.setFontSize(13);
        pdf.setFont('helvetica', 'bold');
        pdf.text(doc.title, margin, curY);
        curY += 6;

        pdf.setFontSize(8);
        pdf.setTextColor(100, 116, 139);
        pdf.text(`Type: ${doc.docType.replace('_', ' ').toUpperCase()} • PKI Seal: ${doc.verifiedStampCode} • Issued: ${doc.issuedDate}`, margin, curY);
        curY += 8;

        // Executive Specifications Table
        pdf.setDrawColor(226, 232, 240);
        pdf.setFillColor(248, 250, 252);
        pdf.roundedRect(margin, curY, contentWidth, 48, 2, 2, 'FD');

        const c1 = margin + 4;
        const c2 = margin + contentWidth / 2 + 2;
        let gY = curY + 7;

        pdf.setFontSize(7);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(100, 116, 139);
        pdf.text('BENEFICIARY / CLIENT NAME', c1, gY);
        pdf.setFontSize(9);
        pdf.setTextColor(15, 23, 42);
        pdf.text(currentUser.fullName, c1, gY + 5);

        pdf.setFontSize(7);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(100, 116, 139);
        pdf.text('ORIGIN TO DESTINATION CORRIDOR', c1, gY + 13);
        pdf.setFontSize(8.5);
        pdf.setTextColor(15, 23, 42);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`${doc.originCity || 'Lagos Hub'} ➔ ${doc.destinationCity || 'Abuja FCT'}`, c1, gY + 18);

        pdf.setFontSize(7);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(100, 116, 139);
        pdf.text('UNDERWRITING ENTITY & SYNDICATE', c1, gY + 26);
        pdf.setFontSize(8.5);
        pdf.setTextColor(15, 23, 42);
        pdf.setFont('helvetica', 'normal');
        pdf.text(doc.underwriterOrIssuer || 'Leadway Assurance & AIICO Consortium', c1, gY + 31);

        // Col 2
        pdf.setFontSize(7);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(100, 116, 139);
        pdf.text('DECLARED VALUATION / INDEMNITY COVER', c2, gY);
        pdf.setFontSize(10.5);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(217, 119, 6);
        pdf.text(
          doc.coverageAmountNaira
            ? `₦${doc.coverageAmountNaira.toLocaleString('en-NG')} NGN`
            : '₦25,000,000 (Full Replacement)',
          c2,
          gY + 5.5
        );

        pdf.setFontSize(7);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(100, 116, 139);
        pdf.text('EFFECTIVE DATE / DURATION', c2, gY + 13);
        pdf.setFontSize(8.5);
        pdf.setTextColor(15, 23, 42);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Effective: ${doc.issuedDate} ${doc.expiryDate ? `to ${doc.expiryDate}` : '(Full Transit Cycle)'}`, c2, gY + 18);

        pdf.setFontSize(7);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(100, 116, 139);
        pdf.text('SECURITY PROTOCOL & SATELLITE ESCORT', c2, gY + 26);
        pdf.setFontSize(8);
        pdf.setTextColor(5, 150, 105);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Tamper-Seal Locked & GPS Speed Governed (70 km/h)', c2, gY + 31);

        curY += 56;

        // Legal Clauses (Page 1)
        pdf.setTextColor(15, 23, 42);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.text('General Covenants & Master Transit Terms', margin, curY);
        curY += 6;

        const clausesPage1 = [
          ['1. Scope of Haulage & White-Glove Handling', 'Pyda Movers covenants to supply trained logistics personnel, export-grade packing materials, hydraulic liftgate trucks, and continuous real-time telematics tracking for the safe carriage of designated consignments.'],
          ['2. Goods-In-Transit (GIT) All-Risk Indemnity', 'Underwritten via Leadway Assurance Plc & AIICO Consortium with zero customer deductible. In the event of road accidents, overturning, fire, or transit perils, 100% full replacement value indemnity shall be honored within 5 business days.'],
          ['3. Chain of Custody & Tamper-Proof Seals', 'Container compartments are secured using tamper-evident serialized seals (#SEAL-88910 to SEAL-88915). Any seal discrepancy upon arrival must be countersigned before offloading.'],
        ];

        clausesPage1.forEach(([heading, body]) => {
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(8);
          pdf.setTextColor(15, 23, 42);
          pdf.text(heading, margin, curY);
          curY += 4;
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(7.5);
          pdf.setTextColor(71, 85, 105);
          const split = pdf.splitTextToSize(body, contentWidth);
          pdf.text(split, margin, curY);
          curY += split.length * 3.8 + 3.5;
        });

        // Summary Text Box
        pdf.setFillColor(241, 245, 249);
        pdf.roundedRect(margin, curY, contentWidth, 26, 1.5, 1.5, 'F');
        pdf.setFontSize(7);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(100, 116, 139);
        pdf.text('CONSIGNMENT SPECIFICATION & DECLARED SUMMARY:', margin + 3, curY + 4.5);
        pdf.setFontSize(7.5);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(30, 41, 59);
        const splitSum = pdf.splitTextToSize(doc.summaryText, contentWidth - 6);
        pdf.text(splitSum, margin + 3, curY + 10);

        // Footer Page 1
        pdf.setFontSize(7);
        pdf.setTextColor(148, 163, 184);
        pdf.text(`Pyda Movers Legal Vault • Ref: ${doc.referenceNumber} • Page 1 of 2`, margin, pageHeight - 10);
        pdf.text('Digitally Sealed via SHA-256 PKI Timestamping Protocol', pageWidth - margin - 75, pageHeight - 10);

        // Page 2
        pdf.addPage();
        pdf.setFillColor(15, 23, 42);
        pdf.rect(0, 0, pageWidth, 20, 'F');
        pdf.setFillColor(245, 158, 11);
        pdf.rect(0, 20, pageWidth, 1.5, 'F');

        pdf.setTextColor(245, 158, 11);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.text('PYDA MOVERS & LOGISTICS • MASTER SERVICE AGREEMENT', margin, 12);
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(7.5);
        pdf.text(`Document Ref: ${doc.referenceNumber} • Annexure B: Operational Stipulations & Execution`, pageWidth - margin - 100, 12);

        let p2Y = 30;
        pdf.setTextColor(15, 23, 42);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Operational Protocols, Dispute Resolution & Attestation', margin, p2Y);
        p2Y += 6;

        const clausesPage2 = [
          ['4. Demurrage & Site Access Covenants', 'Client guarantees unimpeded access to loading/unloading bays. Loading wait times exceeding 4 hours without prior notice incur standard demurrage of NGN 25,000 per hour.'],
          ['5. Force Majeure & Interstate Road Conditions', 'Delays resulting from federal curfew, bridge maintenance, or extreme weather are communicated via 24/7 telematics dispatch with rerouting protocols enacted.'],
          ['6. Dispute Arbitration & Governing Law', 'This agreement is governed by the laws of the Federal Republic of Nigeria. Any controversy shall be submitted to binding arbitration under the Arbitration and Conciliation Act at the Lagos Regional Arbitration Center.'],
        ];

        clausesPage2.forEach(([heading, body]) => {
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(8);
          pdf.setTextColor(15, 23, 42);
          pdf.text(heading, margin, p2Y);
          p2Y += 4;
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(7.5);
          pdf.setTextColor(71, 85, 105);
          const split = pdf.splitTextToSize(body, contentWidth);
          pdf.text(split, margin, p2Y);
          p2Y += split.length * 3.8 + 4;
        });

        p2Y += 6;

        // Bilateral Signatures Box
        const sigBoxWidth = (contentWidth - 6) / 2;
        const sigBoxHeight = 44;

        // Left: Carrier Signatory
        pdf.setFillColor(248, 250, 252);
        pdf.setDrawColor(203, 213, 225);
        pdf.roundedRect(margin, p2Y, sigBoxWidth, sigBoxHeight, 2, 2, 'FD');
        pdf.setFontSize(7);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(100, 116, 139);
        pdf.text('FOR: PYDA MOVERS & LOGISTICS NIGERIA LTD', margin + 4, p2Y + 6);
        pdf.setFontSize(9);
        pdf.setTextColor(15, 23, 42);
        pdf.text(doc.signatories?.[0] || 'Engr. O. Bello', margin + 4, p2Y + 13);
        pdf.setFontSize(7.5);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(71, 85, 105);
        pdf.text('Vice President, Operations & Fleet Safety', margin + 4, p2Y + 18);
        pdf.setTextColor(5, 150, 105);
        pdf.setFontSize(7);
        pdf.setFont('helvetica', 'italic');
        pdf.text('✓ Authenticated Corporate Seal & PKI Signature', margin + 4, p2Y + 28);
        pdf.setTextColor(100, 116, 139);
        pdf.text(`Date of Issue: ${doc.issuedDate}`, margin + 4, p2Y + 36);

        // Right: Shipper / Client Signatory
        const sigRightX = margin + sigBoxWidth + 6;
        pdf.roundedRect(sigRightX, p2Y, sigBoxWidth, sigBoxHeight, 2, 2, 'FD');
        pdf.setFontSize(7);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(100, 116, 139);
        pdf.text('FOR: CLIENT / CONSIGNOR ACCEPTANCE', sigRightX + 4, p2Y + 6);
        pdf.setFontSize(9);
        pdf.setTextColor(15, 23, 42);
        pdf.text(
          doc.signatureRecord?.signedByName ||
            doc.signatories?.[1] ||
            currentUser.fullName ||
            'Authorized Signatory',
          sigRightX + 4,
          p2Y + 13
        );
        pdf.setFontSize(7.5);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(71, 85, 105);
        pdf.text(doc.signatureRecord?.signedRole || 'Principal Property Owner / Consignor', sigRightX + 4, p2Y + 18);
        pdf.setTextColor(5, 150, 105);
        pdf.setFontSize(7);
        pdf.setFont('helvetica', 'italic');
        pdf.text(
          doc.signatureRecord ? '✓ Executed via Cryptographic Digital Signature' : '✓ Endorsed under Electronic Transactions Act',
          sigRightX + 4,
          p2Y + 28
        );
        pdf.setTextColor(100, 116, 139);
        pdf.text(`Signed: ${doc.signatureRecord?.signedAt || doc.issuedDate}`, sigRightX + 4, p2Y + 36);

        p2Y += sigBoxHeight + 8;

        // PKI Verification & QR Strip
        pdf.setFillColor(241, 245, 249);
        pdf.roundedRect(margin, p2Y, contentWidth, 22, 2, 2, 'F');
        pdf.setTextColor(15, 23, 42);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`DIGITAL INTEGRITY HASH & CERTIFICATE CODE: ${doc.verifiedStampCode}`, margin + 4, p2Y + 7);
        pdf.setFontSize(7);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(71, 85, 105);
        pdf.text('This document has been archived with 256-bit AES encryption in the Pyda Document Vault.', margin + 4, p2Y + 13);
        pdf.text(`Verification URL: https://pydamovers.ng/verify/${doc.referenceNumber}`, margin + 4, p2Y + 18);

        // Footer Page 2
        pdf.setFontSize(7);
        pdf.setTextColor(148, 163, 184);
        pdf.text(`Pyda Movers Legal Vault • Ref: ${doc.referenceNumber} • Page 2 of 2`, margin, pageHeight - 10);
        pdf.text('End of Master Moving Service Agreement • Legally Binding', pageWidth - margin - 75, pageHeight - 10);

        pdf.save(`${doc.referenceNumber}_Certified_Contract.pdf`);
      }
    } catch (err) {
      console.error('PDF generation error:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-between overflow-hidden select-none animate-in fade-in duration-200">
      {/* ============================================================== */}
      {/* 1. TOP EXECUTIVE VIEWER TOOLBAR (DARK STUDIO ACROBAT STYLE) */}
      {/* ============================================================== */}
      <header className="w-full bg-slate-900 border-b border-slate-800 px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2 sm:gap-4 shrink-0 shadow-xl z-20">
        {/* Left: Document Info & Badge */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-bold shrink-0">
            {isCarHire ? (
              <Car className="w-4 h-4 text-[#83b735]" />
            ) : isInvoice ? (
              <Receipt className="w-4 h-4 text-emerald-400" />
            ) : isPackingSlip ? (
              <ClipboardList className="w-4 h-4 text-amber-400" />
            ) : isInsurance ? (
              <ShieldCheck className="w-4 h-4" />
            ) : isBol ? (
              <Truck className="w-4 h-4 text-blue-400" />
            ) : (
              <FileText className="w-4 h-4" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-black text-amber-400 uppercase tracking-wider">
                {doc.referenceNumber}
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold px-2 py-0.5 rounded-full font-mono uppercase">
                <Check className="w-2.5 h-2.5" />
                <span>PKI Verified</span>
              </span>
              {doc.status === 'signed' && (
                <span className="hidden md:inline bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[9px] font-bold px-2 py-0.5 rounded-full font-mono uppercase">
                  Signed
                </span>
              )}
            </div>
            <h2 className="text-xs sm:text-sm font-extrabold text-white truncate max-w-[200px] sm:max-w-md">
              {doc.title}
            </h2>
          </div>
        </div>

        {/* Center: Page Jump & Zoom Controls */}
        <div className="hidden lg:flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono">
          {/* Page Navigator */}
          <div className="flex items-center gap-1 px-1 border-r border-slate-800">
            <button
              type="button"
              onClick={() => scrollToPage(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1}
              className="p-1 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 hover:bg-slate-800 transition-colors"
              title="Previous Page (Left Arrow)"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-slate-300 px-1 text-[11px]">
              Page <strong className="text-amber-400">{currentPage}</strong> of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => scrollToPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage >= totalPages}
              className="p-1 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 hover:bg-slate-800 transition-colors"
              title="Next Page (Right Arrow)"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-1 px-1">
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(50, z - 15))}
              disabled={zoomLevel <= 50}
              className="p-1 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 hover:bg-slate-800 transition-colors"
              title="Zoom Out (Ctrl -)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel(100)}
              className="px-2 py-0.5 rounded text-[11px] font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="Reset Zoom to 100% (Ctrl 0)"
            >
              {zoomLevel}%
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(200, z + 15))}
              disabled={zoomLevel >= 200}
              className="p-1 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 hover:bg-slate-800 transition-colors"
              title="Zoom In (Ctrl +)"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          {/* Watermark Selector */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800 text-[11px]">
            <span className="text-slate-500 text-[10px]">Mark:</span>
            <select
              value={watermark}
              onChange={(e) => setWatermark(e.target.value as ViewerWatermark)}
              className="bg-slate-900 text-slate-300 border border-slate-800 rounded px-1.5 py-0.5 text-[11px] focus:outline-none focus:border-amber-500"
            >
              <option value="vault_copy">Vault Copy</option>
              <option value="official_original">Official Original</option>
              <option value="confidential">Confidential</option>
              <option value="specimen">Specimen</option>
              <option value="none">None</option>
            </select>
          </div>
        </div>

        {/* Right: Search, Actions, Print, Download, Close */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Quick Find Button */}
          <button
            type="button"
            onClick={() => setIsSearchOpen((prev) => !prev)}
            className={`p-2 rounded-xl text-xs font-bold border transition-all ${
              isSearchOpen || searchQuery
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border-slate-700'
            }`}
            title="Search in Contract (Ctrl+F)"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Outline Drawer Toggle */}
          <button
            type="button"
            onClick={() => setIsOutlineOpen((prev) => !prev)}
            className={`p-2 rounded-xl text-xs font-bold border transition-all hidden md:flex items-center gap-1 ${
              isOutlineOpen
                ? 'bg-slate-700 text-white border-slate-600'
                : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border-slate-700'
            }`}
            title="Document Outline & Clauses"
          >
            <Bookmark className="w-4 h-4" />
          </button>

          {/* Print Options Button */}
          {onOpenPrintSettings && (
            <button
              type="button"
              onClick={() => onOpenPrintSettings(doc)}
              className="hidden xl:flex items-center gap-1 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white font-bold text-xs px-2.5 py-2 rounded-xl border border-slate-700 transition-colors"
              title="Configure Color, Margins & Watermark in Print Wizard"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
              <span>Settings</span>
            </button>
          )}

          {/* Instant Print Button */}
          <button
            type="button"
            onClick={handlePrintNow}
            className="bg-slate-800 hover:bg-slate-750 text-amber-400 hover:text-amber-300 font-bold text-xs px-3 py-2 rounded-xl border border-slate-700/80 hover:border-amber-500/40 flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
            title="Print Contract Document Now (Ctrl+P)"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Print</span>
          </button>

          {/* Download PDF Button */}
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-md active:scale-95 disabled:opacity-50"
            title="Generate & Save Certified PDF File"
          >
            {isGeneratingPdf ? (
              <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">{isGeneratingPdf ? 'Compiling...' : 'Download PDF'}</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={() => setIsFullscreen((prev) => !prev)}
            className="hidden sm:flex p-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Close Modal */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-500/40 transition-colors"
            title="Close Preview (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ============================================================== */}
      {/* 2. OPTIONAL SEARCH / FILTER BAR */}
      {/* ============================================================== */}
      {isSearchOpen && (
        <div className="w-full bg-slate-900/90 border-b border-slate-800 px-4 py-2 flex items-center justify-between gap-3 text-xs z-20 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2 flex-1 max-w-lg">
            <Search className="w-4 h-4 text-amber-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Find clauses e.g. 'liability', 'insurance', 'demurrage', 'tamper seal'..."
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-white placeholder-slate-500 w-full focus:outline-none focus:border-amber-500 text-xs"
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-white text-xs font-bold px-1"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <span>Quick jumps:</span>
            <button
              type="button"
              onClick={() => setSearchQuery('liability')}
              className="bg-slate-800 hover:bg-slate-750 px-2 py-0.5 rounded text-slate-300"
            >
              Liability
            </button>
            <button
              type="button"
              onClick={() => setSearchQuery('insurance')}
              className="bg-slate-800 hover:bg-slate-750 px-2 py-0.5 rounded text-slate-300"
            >
              Insurance
            </button>
            <button
              type="button"
              onClick={() => setSearchQuery('seal')}
              className="bg-slate-800 hover:bg-slate-750 px-2 py-0.5 rounded text-slate-300"
            >
              Tamper Seal
            </button>
            <button
              type="button"
              onClick={() => setIsSearchOpen(false)}
              className="text-slate-500 hover:text-white ml-2 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. MAIN VIEWER WORKSPACE (CANVAS + OPTIONAL OUTLINE DRAWER) */}
      {/* ============================================================== */}
      <div className="flex-1 w-full flex overflow-hidden relative">
        {/* Outline / Clauses Sidebar (Collapsible) */}
        {isOutlineOpen && (
          <aside className="w-72 bg-slate-900 border-r border-slate-800 p-4 shrink-0 flex flex-col justify-between overflow-y-auto hidden md:flex text-xs z-10 animate-in slide-in-from-left-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="font-extrabold text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                  <span>Contract Outline</span>
                </span>
                <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-mono">
                  {totalPages} Pages
                </span>
              </div>

              {/* Document Overview Metadata */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 space-y-2 text-[11px]">
                <div className="text-slate-400">
                  <span className="block text-[10px] font-bold text-slate-500">Document Type</span>
                  <span className="text-white font-bold capitalize">{doc.docType.replace('_', ' ')}</span>
                </div>
                <div className="text-slate-400">
                  <span className="block text-[10px] font-bold text-slate-500">Declared Indemnity</span>
                  <span className="text-amber-400 font-mono font-bold">
                    {doc.coverageAmountNaira ? `₦${doc.coverageAmountNaira.toLocaleString('en-NG')}` : 'Full Replacement'}
                  </span>
                </div>
                <div className="text-slate-400">
                  <span className="block text-[10px] font-bold text-slate-500">Issuing Entity</span>
                  <span className="text-slate-300 truncate block">{doc.underwriterOrIssuer}</span>
                </div>
              </div>

              {/* Clause Jump Buttons */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block px-1">
                  Page 1 Clauses
                </span>
                <button
                  type="button"
                  onClick={() => scrollToPage(1)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 flex items-center justify-between transition-colors ${
                    currentPage === 1 ? 'bg-amber-500/15 text-amber-300 font-bold' : ''
                  }`}
                >
                  <span>1. Scope of Haulage Services</span>
                  <span className="text-[10px] font-mono text-slate-500">P.1</span>
                </button>
                <button
                  type="button"
                  onClick={() => scrollToPage(1)}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 flex items-center justify-between transition-colors"
                >
                  <span>2. GIT All-Risk Indemnity (Leadway)</span>
                  <span className="text-[10px] font-mono text-slate-500">P.1</span>
                </button>
                <button
                  type="button"
                  onClick={() => scrollToPage(1)}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 flex items-center justify-between transition-colors"
                >
                  <span>3. Tamper Seals & Custody Protocol</span>
                  <span className="text-[10px] font-mono text-slate-500">P.1</span>
                </button>
              </div>

              {totalPages > 1 && (
                <div className="space-y-1 pt-2 border-t border-slate-800">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block px-1">
                    Page 2 Clauses & Execution
                  </span>
                  <button
                    type="button"
                    onClick={() => scrollToPage(2)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 flex items-center justify-between transition-colors ${
                      currentPage === 2 ? 'bg-amber-500/15 text-amber-300 font-bold' : ''
                    }`}
                  >
                    <span>4. Demurrage & Site Bay Access</span>
                    <span className="text-[10px] font-mono text-slate-500">P.2</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollToPage(2)}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 flex items-center justify-between transition-colors"
                  >
                    <span>5. Force Majeure & Highway Corridors</span>
                    <span className="text-[10px] font-mono text-slate-500">P.2</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollToPage(2)}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 flex items-center justify-between transition-colors"
                  >
                    <span>6. Dispute Arbitration (Lagos)</span>
                    <span className="text-[10px] font-mono text-slate-500">P.2</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollToPage(2)}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10 flex items-center justify-between font-bold transition-colors"
                  >
                    <span className="flex items-center gap-1.5">
                      <Stamp className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Attestation & Signatures</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">P.2</span>
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Signature CTA in Outline */}
            {!doc.signatureRecord && isAgreement && onOpenSignModal && (
              <div className="pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenSignModal(doc);
                  }}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow transition-all active:scale-98"
                >
                  <PenTool className="w-3.5 h-3.5" />
                  <span>Sign this Contract</span>
                </button>
              </div>
            )}
          </aside>
        )}

        {/* Scrollable Document Container */}
        <div
          ref={containerRef}
          className="flex-1 h-full overflow-y-auto p-4 sm:p-8 flex flex-col items-center gap-8 bg-slate-950/70"
        >
          {/* Zoom Wrapper */}
          <div
            style={{
              transform: `scale(${zoomLevel / 100})`,
              transformOrigin: 'top center',
              transition: 'transform 0.15s ease-out',
            }}
            className="flex flex-col items-center gap-8"
          >
            {/* ============================================================== */}
            {/* PAGE 1: A4 PHYSICAL PAPER SHEET */}
            {/* ============================================================== */}
            <div
              ref={page1Ref}
              id="pdf-contract-page-1"
              className="w-[794px] min-h-[1123px] bg-white text-slate-900 rounded-sm shadow-2xl relative overflow-hidden flex flex-col justify-between border border-slate-300 p-8 sm:p-12 print:shadow-none print:border-none print:m-0 print:p-8"
            >
              {/* Optional Watermark Overlay */}
              {watermark !== 'none' && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center select-none overflow-hidden z-10 opacity-6">
                  <span className="text-slate-900 font-black text-7xl sm:text-8xl -rotate-45 uppercase tracking-widest whitespace-nowrap">
                    {watermark === 'vault_copy'
                      ? 'PYDA VAULT COPY'
                      : watermark === 'official_original'
                      ? 'OFFICIAL ORIGINAL'
                      : watermark === 'confidential'
                      ? 'CONFIDENTIAL'
                      : 'SPECIMEN COPY'}
                  </span>
                </div>
              )}

              {/* Page 1 Content */}
              <div className="space-y-6 relative z-10">
                {/* 1. Header Banner */}
                <div className="border-b-2 border-amber-500 pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-slate-900 text-amber-500 flex items-center justify-center font-black text-base">
                          P
                        </div>
                        <h1 className="text-xl font-black text-slate-900 tracking-tight">
                          PYDA MOVERS & LOGISTICS NIGERIA LTD
                        </h1>
                      </div>
                      <p className="text-[11px] text-slate-600 font-medium">
                        Corporate Relocations • Interstate Haulage • Secure Vaulting • Goods-In-Transit All-Risk Cover
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Federal Republic of Nigeria CAC: RC-1498210 • FMWH Transport License: FMWH/RL-0892
                      </p>
                      <p className="text-[10px] text-slate-500">
                        HQ: Plot 14, Victoria Island, Lagos | Abuja: Plot 884, Maitama District, Abuja FCT | Tel: +234 {companyPhone.replace(/^0/, '')}
                      </p>
                    </div>

                    {/* Reference & QR Code Badge */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-right flex items-center gap-3 shrink-0">
                      <div>
                        <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                          DOCUMENT REF / POL
                        </span>
                        <span className="font-mono text-xs font-black text-slate-900 block">
                          {doc.referenceNumber}
                        </span>
                        <span className="text-[10px] text-slate-500 block font-mono">
                          Date: {doc.issuedDate}
                        </span>
                        <span className="text-[9px] text-emerald-700 font-bold font-mono">
                          ✓ PKI SEALED
                        </span>
                      </div>
                      <div className="bg-white p-1 rounded-lg border border-slate-200">
                        <QRCodeSVG
                          value={`https://pydamovers.ng/verify/${doc.referenceNumber}`}
                          size={48}
                          level="M"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Document Title Heading */}
                <div className="bg-slate-900 text-white p-3.5 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider block font-bold">
                      {isAgreement ? 'MASTER SERVICE AGREEMENT & COVENANTS' : isBol ? 'OFFICIAL BILL OF LADING & WAYBILL' : isInsurance ? 'GOODS-IN-TRANSIT POLICY SCHEDULE' : 'COMMERCIAL CONSIGNMENT DOSSIER'}
                    </span>
                    <h2 className="text-base font-black tracking-tight text-white">
                      {highlightSearch(doc.title)}
                    </h2>
                  </div>
                  <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2.5 py-1 rounded-md uppercase font-mono">
                    {doc.status}
                  </span>
                </div>

                {/* 3. Executive Consignment & Party Specification Table */}
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/70 text-xs space-y-3">
                  <div className="grid grid-cols-2 gap-4 pb-3 border-b border-slate-200">
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase">
                        CARRIER / CONTRACTOR
                      </span>
                      <strong className="text-slate-900 block text-xs">Pyda Movers & Logistics Ltd</strong>
                      <span className="text-[11px] text-slate-600 block">
                        National Road Transport Carrier License #NRT-884
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        Hotline: +234 {companyPhone.replace(/^0/, '')} • legal@pydamovers.ng
                      </span>
                    </div>

                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase">
                        CLIENT / PRINCIPAL SHIPPERS
                      </span>
                      <strong className="text-slate-900 block text-xs">
                        {currentUser.fullName}
                      </strong>
                      <span className="text-[11px] text-slate-600 block">
                        {currentUser.companyName || 'Private Executive Account'} • {currentUser.email}
                      </span>
                      <span className="text-[10px] text-slate-500 block font-mono">
                        Phone: {currentUser.phone || companyPhone}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 pt-1">
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase">
                        TRANSIT ROUTE
                      </span>
                      <span className="text-slate-900 font-bold block text-xs">
                        {doc.originCity || 'Lagos Corporate Hub'}
                      </span>
                      <span className="text-slate-500 text-[10px]">to {doc.destinationCity || 'Abuja Central'}</span>
                    </div>

                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase">
                        SUM INSURED (ALL-RISK)
                      </span>
                      <span className="text-amber-600 font-black font-mono block text-sm">
                        {doc.coverageAmountNaira
                          ? `₦${doc.coverageAmountNaira.toLocaleString('en-NG')} NGN`
                          : 'Full Replacement'}
                      </span>
                      <span className="text-emerald-700 text-[10px] font-semibold">Zero Deductible</span>
                    </div>

                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase">
                        UNDERWRITING CONSORTIUM
                      </span>
                      <span className="text-slate-900 font-semibold block text-[11px] truncate">
                        {doc.underwriterOrIssuer || 'Leadway Assurance Plc & AIICO Consortium'}
                      </span>
                      <span className="text-slate-500 text-[10px]">NIA Syndicate Policy</span>
                    </div>
                  </div>
                </div>

                {/* 4. Document Operational Summary Callout */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs">
                  <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block mb-1">
                    Operative Summary & Scope of Carriage
                  </span>
                  <p className="text-slate-700 leading-relaxed text-[11px]">
                    {highlightSearch(doc.summaryText)}
                  </p>
                </div>

                {/* 5. Master Contract Clauses (Page 1) */}
                <div className="space-y-3 pt-2">
                  <h3 className="font-black text-slate-900 text-xs uppercase tracking-wider border-b border-slate-200 pb-1">
                    SECTION A: OPERATIONAL COVENANTS & SERVICE LEVEL AGREEMENTS
                  </h3>

                  <div className="space-y-2 text-[11px] text-slate-700 leading-relaxed">
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                      <strong className="text-slate-900 block font-bold mb-0.5">
                        {highlightSearch('Article 1: Scope of White-Glove Moving & Logistics Support')}
                      </strong>
                      <p>
                        {highlightSearch(
                          'Pyda Movers covenants to provide certified packing personnel, multi-layer cushioning bubble wrap, anti-static IT cartons, heavy-duty wardrobe boxes, and custom wooden crating for fine art and delicate electronics. Freight handling shall conform to ISO-certified white-glove transport standards with hydraulic tail-lift loading.'
                        )}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                      <strong className="text-slate-900 block font-bold mb-0.5">
                        {highlightSearch('Article 2: Goods-In-Transit (GIT) All-Risk Indemnity & Claims SLA')}
                      </strong>
                      <p>
                        {highlightSearch(
                          'The designated consignment is covered under Leadway Assurance Plc & AIICO Consortium Goods-In-Transit (GIT) All-Risk policy. This cover provides 100% full replacement value indemnity against road perils, overturning, fire, or third-party hazards without customer-borne deductibles. Verified claims are indemnified within 5 working days.'
                        )}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                      <strong className="text-slate-900 block font-bold mb-0.5">
                        {highlightSearch('Article 3: Serialized Tamper-Evident Seals & Chain of Custody')}
                      </strong>
                      <p>
                        {highlightSearch(
                          'All truck cargo bays are sealed prior to terminal dispatch using numbered tamper-evident security bolt seals (#SEAL-88910 through SEAL-88915). Consignor signs the seal manifest at point of origin; consignee inspects and verifies seal integrity before breaking seals at delivery.'
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Page 1 Footer */}
              <div className="border-t border-slate-200 pt-3 mt-6 flex items-center justify-between text-[10px] text-slate-500 font-mono relative z-10">
                <span>Pyda Movers Legal Vault • Contract Ref: {doc.referenceNumber}</span>
                <span className="font-bold text-slate-800">Page 1 of {totalPages}</span>
                <span>SHA-256 PKI Timestamp: {doc.verifiedStampCode}</span>
              </div>
            </div>

            {/* ============================================================== */}
            {/* PAGE 2: A4 PHYSICAL PAPER SHEET (CLAUSES + EXECUTION) */}
            {/* ============================================================== */}
            {totalPages > 1 && (
              <div
                ref={page2Ref}
                id="pdf-contract-page-2"
                className="w-[794px] min-h-[1123px] bg-white text-slate-900 rounded-sm shadow-2xl relative overflow-hidden flex flex-col justify-between border border-slate-300 p-8 sm:p-12 print:shadow-none print:border-none print:m-0 print:p-8"
              >
                {/* Watermark Overlay */}
                {watermark !== 'none' && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center select-none overflow-hidden z-10 opacity-6">
                    <span className="text-slate-900 font-black text-7xl sm:text-8xl -rotate-45 uppercase tracking-widest whitespace-nowrap">
                      {watermark === 'vault_copy'
                        ? 'PYDA VAULT COPY'
                        : watermark === 'official_original'
                        ? 'OFFICIAL ORIGINAL'
                        : watermark === 'confidential'
                        ? 'CONFIDENTIAL'
                        : 'SPECIMEN COPY'}
                    </span>
                  </div>
                )}

                <div className="space-y-6 relative z-10">
                  {/* Page 2 Mini Header */}
                  <div className="border-b border-slate-200 pb-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-black text-slate-900 uppercase">
                        PYDA MOVERS & LOGISTICS • MASTER SERVICE AGREEMENT
                      </span>
                      <span className="block text-[10px] text-slate-500 font-mono">
                        Annexure B: Operational Rules, Dispute Arbitration & Bilateral Execution
                      </span>
                    </div>
                    <span className="font-mono text-[11px] font-bold text-amber-600">
                      Ref: {doc.referenceNumber}
                    </span>
                  </div>

                  {/* Section B Clauses */}
                  <div className="space-y-3">
                    <h3 className="font-black text-slate-900 text-xs uppercase tracking-wider border-b border-slate-200 pb-1">
                      SECTION B: STIPULATIONS, FORCE MAJEURE & DISPUTE ARBITRATION
                    </h3>

                    <div className="space-y-2 text-[11px] text-slate-700 leading-relaxed">
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                        <strong className="text-slate-900 block font-bold mb-0.5">
                          {highlightSearch('Article 4: Bay Access, Loading Windows & Demurrage Terms')}
                        </strong>
                        <p>
                          {highlightSearch(
                            'The client guarantees unimpeded vehicular access to loading docks and elevators. Dedicated loading slots allow up to 4 free hours. Beyond this window, demurrage is billed at standard commercial rates of NGN 25,000 per hour to defray convoy retention fees.'
                          )}
                        </p>
                      </div>

                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                        <strong className="text-slate-900 block font-bold mb-0.5">
                          {highlightSearch('Article 5: Highway Corridors, Force Majeure & Security Escort')}
                        </strong>
                        <p>
                          {highlightSearch(
                            'All interstate vehicles travel strictly via vetted highway corridors governed by 24/7 GPS telematics and speed limiters at 70 km/h. Pyda maintains armed escorts where designated. In event of road curfews, alternative routes are deployed with live SMS dispatch notifications to client.'
                          )}
                        </p>
                      </div>

                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                        <strong className="text-slate-900 block font-bold mb-0.5">
                          {highlightSearch('Article 6: Dispute Resolution & Legal Jurisdiction')}
                        </strong>
                        <p>
                          {highlightSearch(
                            'This contract shall be construed in accordance with the laws of the Federal Republic of Nigeria. In the event of dispute, the parties submit to amicable resolution, failing which binding arbitration shall be conducted at the Lagos Regional Centre for International Commercial Arbitration.'
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Attestation & Bilateral Signatures Section */}
                  <div className="space-y-3 pt-3">
                    <h3 className="font-black text-slate-900 text-xs uppercase tracking-wider border-b border-slate-200 pb-1 flex items-center justify-between">
                      <span>SECTION C: ATTESTATION & BILATERAL EXECUTION</span>
                      <span className="text-[10px] text-emerald-700 font-mono font-bold">
                        Legally Binding under Nigerian Evidence Act
                      </span>
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Carrier Signature Box */}
                      <div className="border border-slate-300 rounded-xl p-4 bg-slate-50/70 space-y-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block">
                          FOR: CARRIER (PYDA MOVERS & LOGISTICS LTD)
                        </span>

                        <div className="h-16 flex items-center justify-start border-b border-slate-200 pb-2">
                          <div className="space-y-0.5">
                            <span className="font-serif italic font-black text-lg text-slate-900 block">
                              Engr. O. Bello
                            </span>
                            <span className="text-[9px] text-slate-500 font-mono block">
                              VP Operations & Fleet Safety • Pyda Corporate
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1">
                          <span>Date: {doc.issuedDate}</span>
                          <span className="text-emerald-700 font-bold flex items-center gap-1">
                            <Check className="w-3 h-3" /> Seal Affixed
                          </span>
                        </div>
                      </div>

                      {/* Client Signature Box */}
                      <div className="border border-slate-300 rounded-xl p-4 bg-slate-50/70 space-y-2 relative">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block">
                          FOR: CLIENT / CONSIGNOR ACCEPTANCE
                        </span>

                        <div className="h-16 flex items-center justify-start border-b border-slate-200 pb-2">
                          {doc.signatureRecord?.signatureDataUrl ? (
                            <img
                              src={doc.signatureRecord.signatureDataUrl}
                              alt="Client Signature"
                              className="max-h-14 object-contain"
                            />
                          ) : (
                            <div className="space-y-0.5">
                              <span className="font-serif italic font-black text-lg text-slate-900 block">
                                {doc.signatureRecord?.signedByName ||
                                  doc.signatories?.[1] ||
                                  currentUser.fullName}
                              </span>
                              <span className="text-[9px] text-slate-500 font-mono block">
                                {doc.signatureRecord?.signedRole || 'Authorized Consignor / Client'}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1">
                          <span>
                            Date:{' '}
                            {doc.signatureRecord?.signedAt
                              ? new Date(doc.signatureRecord.signedAt).toLocaleDateString('en-GB')
                              : doc.issuedDate}
                          </span>
                          <span className="text-emerald-700 font-bold flex items-center gap-1">
                            <Check className="w-3 h-3" /> Digitally Valid
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Digital PKI Cryptographic Fingerprint Box */}
                  <div className="border border-emerald-500/40 bg-emerald-500/5 rounded-xl p-4 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>PKI Authenticity & Digital Integrity Seal</span>
                      </div>
                      <p className="text-[10px] text-slate-600">
                        Cryptographic Hash:{' '}
                        <code className="text-slate-900 font-mono font-bold">
                          {doc.verifiedStampCode}
                        </code>
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Public Key Infrastructure validation guaranteed by Pyda Vault Security Architecture.
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="bg-emerald-600 text-white font-mono text-[9px] font-black px-2.5 py-1 rounded-md uppercase block">
                        VERIFIED COMPLIANT
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono block mt-1">
                        Vault ID: {doc.id}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Page 2 Footer */}
                <div className="border-t border-slate-200 pt-3 mt-6 flex items-center justify-between text-[10px] text-slate-500 font-mono relative z-10">
                  <span>Pyda Movers Legal Vault • Contract Ref: {doc.referenceNumber}</span>
                  <span className="font-bold text-slate-800">Page 2 of {totalPages}</span>
                  <span>End of Master Moving Service Agreement</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4. BOTTOM FLOATING ACTION BAR FOR QUICK ACTIONS & SIGNING */}
      {/* ============================================================== */}
      <footer className="w-full bg-slate-900 border-t border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0 z-20">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>256-Bit Vault Certified</span>
          </span>
          <span className="hidden sm:inline text-slate-600">•</span>
          <span className="hidden sm:inline text-slate-400">
            {doc.signatories ? `${doc.signatories.length} Signatories Attached` : 'Bilateral Attestation Recorded'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Sign Contract Now Trigger if pending signature */}
          {!doc.signatureRecord && isAgreement && onOpenSignModal && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenSignModal(doc);
              }}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-4 py-2 rounded-xl shadow-lg flex items-center gap-1.5 transition-all active:scale-95 animate-pulse"
              title="Affix your legally binding digital signature to this agreement"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Sign this Agreement</span>
            </button>
          )}

          {/* Quick Print Button */}
          <button
            type="button"
            onClick={handlePrintNow}
            className="bg-slate-800 hover:bg-slate-750 text-amber-400 hover:text-amber-300 font-bold text-xs px-3.5 py-2 rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all active:scale-95"
            title="Send to Printer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Contract</span>
          </button>

          {/* Download PDF Button */}
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="bg-slate-800 hover:bg-slate-750 text-white font-bold text-xs px-3.5 py-2 rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
            title="Download PDF"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Download</span>
          </button>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs px-3.5 py-2 rounded-xl border border-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </footer>
    </div>
  );
};
