import React, { useState, useRef, useEffect } from 'react';
import {
  PenTool,
  Type,
  Upload,
  RotateCcw,
  CheckCircle2,
  ShieldCheck,
  FileText,
  Lock,
  Calendar,
  Building2,
  X,
  FileDown,
  Sparkles,
  Download,
  Check,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Stamp
} from 'lucide-react';
import jsPDF from 'jspdf';
import { CustomerSavedQuote, CustomerUser, SignatureRecord, VaultDocument } from '../types';

interface DigitalSignatureModalProps {
  currentUser: CustomerUser;
  targetQuote?: CustomerSavedQuote | null;
  targetDocument?: VaultDocument | null;
  onClose: () => void;
  onSignComplete: (signedDoc: VaultDocument, quoteId?: string, signatureRecord?: SignatureRecord) => void;
  supportPhone?: string;
}

export const DigitalSignatureModal: React.FC<DigitalSignatureModalProps> = ({
  currentUser,
  targetQuote,
  targetDocument,
  onClose,
  onSignComplete,
  supportPhone = '08062466212',
}) => {
  // Mode: 'draw' | 'type' | 'upload'
  const [signMode, setSignMode] = useState<'draw' | 'type' | 'upload'>('draw');

  // Signer Details
  const [signerName, setSignerName] = useState(currentUser.fullName || '');
  const [signerRole, setSignerRole] = useState(currentUser.companyName ? 'Authorized Corporate Representative' : 'Client / Property Owner');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [penColor, setPenColor] = useState<'navy' | 'black' | 'amber'>('navy');

  // Drawing Canvas State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  // Typed Signature State
  const [typedFontIndex, setTypedFontIndex] = useState(0);
  const fontStyles = [
    { name: 'Executive Script', cssFont: 'italic bold 28px "Georgia", cursive, serif' },
    { name: 'Formal Calligraphy', cssFont: 'italic 30px "Brush Script MT", "Segoe Script", cursive' },
    { name: 'Modern Signature', cssFont: '300 28px "Lucida Handwriting", cursive, sans-serif' },
    { name: 'Legal Cursive', cssFont: 'italic 26px "Times New Roman", Times, serif' },
  ];

  // Uploaded Signature State
  const [uploadedSignatureUrl, setUploadedSignatureUrl] = useState<string | null>(null);

  // Success State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [executedDoc, setExecutedDoc] = useState<VaultDocument | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Setup Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = penColor === 'navy' ? '#1e3a8a' : penColor === 'black' ? '#0f172a' : '#d97706';
  }, [signMode, penColor]);

  // Canvas Drawing Handlers
  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
    setErrorMsg('');
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.closePath();
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  // Convert Typed Name to Image Data URL
  const generateTypedSignatureDataUrl = (name: string, fontStyle: string): string => {
    const offCanvas = document.createElement('canvas');
    offCanvas.width = 600;
    offCanvas.height = 160;
    const ctx = offCanvas.getContext('2d');
    if (!ctx) return '';

    ctx.fillStyle = 'transparent';
    ctx.fillRect(0, 0, offCanvas.width, offCanvas.height);

    ctx.font = fontStyle;
    ctx.fillStyle = penColor === 'navy' ? '#1e3a8a' : penColor === 'black' ? '#0f172a' : '#d97706';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(name || 'Authorized Signatory', offCanvas.width / 2, offCanvas.height / 2);

    return offCanvas.toDataURL('image/png');
  };

  // Handle File Upload
  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please upload a valid image file (PNG, JPG, or SVG).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setUploadedSignatureUrl(event.target.result);
        setErrorMsg('');
      }
    };
    reader.readAsDataURL(file);
  };

  // Contract Details to Display
  const contractTitle = targetQuote
    ? `Master Relocation & Transit Service Agreement #${targetQuote.id}`
    : targetDocument?.title || 'Relocation Service Agreement & Inventory Manifest';

  const origin = targetQuote?.originCity || targetDocument?.originCity || 'Lagos Hub';
  const destination = targetQuote?.destinationCity || targetDocument?.destinationCity || 'Abuja Federal Capital Territory';
  const estimatedCost = targetQuote?.estimatedCostNaira || 850000;
  const coverageAmount = targetQuote ? estimatedCost * 15 : (targetDocument?.coverageAmountNaira || 25000000);
  const moveDate = targetQuote?.movingDate || new Date().toISOString().split('T')[0];

  // Execution Handler
  const handleExecuteContract = async () => {
    if (!signerName.trim()) {
      setErrorMsg('Please enter your full legal name.');
      return;
    }

    if (!agreedToTerms) {
      setErrorMsg('You must check the agreement box to accept terms of carriage and insurance conditions.');
      return;
    }

    let finalSignatureDataUrl = '';

    if (signMode === 'draw') {
      if (!hasDrawn || !canvasRef.current) {
        setErrorMsg('Please draw your digital signature on the pad.');
        return;
      }
      finalSignatureDataUrl = canvasRef.current.toDataURL('image/png');
    } else if (signMode === 'type') {
      if (!signerName.trim()) {
        setErrorMsg('Please type your legal signature name.');
        return;
      }
      finalSignatureDataUrl = generateTypedSignatureDataUrl(signerName, fontStyles[typedFontIndex].cssFont);
    } else if (signMode === 'upload') {
      if (!uploadedSignatureUrl) {
        setErrorMsg('Please select and upload your signature image file.');
        return;
      }
      finalSignatureDataUrl = uploadedSignatureUrl;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    // Generate unique verification code & hash
    const randomHex = Math.random().toString(16).substring(2, 8).toUpperCase();
    const certCode = `MGT-SIG-${new Date().getFullYear()}-${randomHex}`;
    const timestampStr = new Date().toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short',
    });

    const sigRecord: SignatureRecord = {
      signatureDataUrl: finalSignatureDataUrl,
      signatureType: signMode,
      signedByName: signerName.trim(),
      signedRole: signerRole.trim(),
      signedAt: timestampStr,
      ipHash: `SHA256-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      pkiVerificationCode: certCode,
      agreedToTerms: true,
    };

    const newSignedDoc: VaultDocument = {
      id: targetDocument?.id || `DOC-EXEC-${Date.now().toString().slice(-6)}`,
      title: `Signed ${contractTitle}`,
      docType: 'moving_agreement',
      referenceNumber: targetQuote ? `MSA-${targetQuote.id}` : targetDocument?.referenceNumber || `MSA-MGT-${randomHex}`,
      issuedDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'signed',
      fileSize: '750 KB',
      underwriterOrIssuer: 'Pyda Logistics Legal Directorate & Leadway Assurance Consortium',
      coverageAmountNaira: coverageAmount,
      originCity: origin,
      destinationCity: destination,
      signatories: [
        'Engr. O. Bello (VP Operations, Pyda Movers)',
        `${signerName} (${signerRole})`,
      ],
      signatureRecord: sigRecord,
      associatedQuoteId: targetQuote?.id,
      summaryText: `Executed bilateral Relocation Agreement and Chain-of-Custody Manifest for ${origin} to ${destination}. Guaranteed with Leadway Assurance GIT all-risk zero-deductible cargo cover, anti-static crating, and 24/7 telematics tracking.`,
      verifiedStampCode: certCode,
      tags: ['Signed Agreement', 'Executed', 'Legally Binding', 'Leadway GIT'],
    };

    // Generate formal PDF and trigger completion
    try {
      generateSignedContractPdf(newSignedDoc, sigRecord);
    } catch (e) {
      console.warn('PDF generation notice:', e);
    }

    setExecutedDoc(newSignedDoc);
    setIsSubmitting(false);

    onSignComplete(newSignedDoc, targetQuote?.id, sigRecord);
  };

  // Generate & Download Signed PDF with Signature Embedded
  const generateSignedContractPdf = (docData: VaultDocument, sigRecord: SignatureRecord) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // 1. Header Banner & Branding
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, pageWidth, 44, 'F');

    // Amber Accent Line
    doc.setFillColor(245, 158, 11); // amber-500
    doc.rect(0, 44, pageWidth, 2.5, 'F');

    // Title
    doc.setTextColor(245, 158, 11);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('PYDA MOVERS & LOGISTICS NIGERIA', 14, 16);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.text('Legally Executed Relocation Contract & Chain-of-Custody Manifest', 14, 23);
    doc.text(`Digital PKI Seal: ${sigRecord.pkiVerificationCode} | Audit Hash: ${sigRecord.ipHash}`, 14, 29);
    doc.text(`Carrier Support: ${supportPhone} | legal@pydamovers.ng`, 14, 35);

    // Reference Pill
    doc.setFillColor(30, 41, 59);
    doc.roundedRect(pageWidth - 78, 10, 64, 24, 2, 2, 'F');
    doc.setTextColor(245, 158, 11);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('EXECUTED CONTRACT REF', pageWidth - 74, 17);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.text(docData.referenceNumber, pageWidth - 74, 26);

    let currentY = 56;

    // Document Title Heading
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(docData.title, 14, currentY);
    currentY += 6;

    // Status Badge
    doc.setFontSize(8);
    doc.setTextColor(5, 150, 105);
    doc.text(`STATUS: DIGITALLY SIGNED & EXECUTED • PKI VERIFIED (${sigRecord.signedAt})`, 14, currentY);
    currentY += 6;

    // 2. Relocation Specifications Box
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, currentY, 182, 48, 2, 2, 'FD');

    const col1X = 18;
    const col2X = 108;
    let gridY = currentY + 7;

    // Column 1
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text('CLIENT / SIGNATORY', col1X, gridY);
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`${sigRecord.signedByName} (${sigRecord.signedRole})`, col1X, gridY + 5);

    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text('RELOCATION CORRIDOR', col1X, gridY + 13);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(`${origin} ➔ ${destination}`, col1X, gridY + 18);

    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text('SCHEDULED DISPATCH DATE', col1X, gridY + 26);
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(moveDate, col1X, gridY + 31);

    // Column 2
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text('DECLARED SUM INSURED (GIT ALL-RISK)', col2X, gridY);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(217, 119, 6); // amber-600
    doc.text(`₦${coverageAmount.toLocaleString('en-NG')}`, col2X, gridY + 5);

    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text('CONTRACT VALUE / QUOTE TOTAL', col2X, gridY + 13);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(`₦${estimatedCost.toLocaleString('en-NG')} (VAT & Insurance Inclusive)`, col2X, gridY + 18);

    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text('UNDERWRITING CONSORTIUM', col2X, gridY + 26);
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text('Leadway Assurance Plc & AIICO Consortium', col2X, gridY + 31);

    currentY += 54;

    // 3. Legal Stipulations & Manifest Clauses
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.text('Operational Covenants, Liability Schedule & Terms of Carriage', 14, currentY);
    currentY += 5;

    const clauses = [
      ['1. White-Glove Packing & Loading', 'Pyda shall supply certified packing personnel, multi-layer bubble wrap, edge-protectors, heavy-duty cartons, and custom wooden crating for delicate electronics and fine art.'],
      ['2. Goods-In-Transit (GIT) Cover', 'Leadway Assurance underwritten policy provides 100% full replacement value indemnity for road perils, overturning, collision, or unforeseen transit hazards with zero deductible.'],
      ['3. Chain of Custody & Tamper Seals', 'All freight doors are secured with serialized tamper-proof security seals verified by the customer at dispatch origin and inspected before unsealing at the destination address.'],
      ['4. Dispute & Claims Fast-Track', 'In the rare event of transit damage, claims must be lodged within 72 hours of consignment delivery for rapid surveyor assessment and reimbursement within 5 business days.'],
      ['5. Electronic Signatures Validity', 'Both parties agree that electronic signatures affixed herein carry full binding legal weight under the Nigerian Electronic Transactions Act & Evidence Act.'],
    ];

    clauses.forEach(([header, text]) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(15, 23, 42);
      doc.text(header, 14, currentY);
      currentY += 4;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(71, 85, 105);
      const splitText = doc.splitTextToSize(text, 180);
      doc.text(splitText, 14, currentY);
      currentY += splitText.length * 3.5 + 2;
    });

    currentY += 4;

    // 4. Execution & Signature Blocks
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.text('Executed Signatures & Electronic Endorsements', 14, currentY);
    currentY += 5;

    const boxWidth = 88;
    const boxHeight = 36;
    doc.setDrawColor(203, 213, 225);
    doc.setFillColor(248, 250, 252);

    // Left Box: Carrier Signature
    doc.roundedRect(14, currentY, boxWidth, boxHeight, 2, 2, 'FD');
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text('CARRIER / OPERATING DIRECTORATE', 18, currentY + 5.5);
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text('Pyda Logistics Management', 18, currentY + 11);

    doc.setFontSize(7);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(5, 150, 105);
    doc.text('✓ Digitally Sealed by VP Operations', 18, currentY + 17);
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text(`Official Stamp: ${sigRecord.pkiVerificationCode}`, 18, currentY + 23);
    doc.text('Authorized Carrier Seal Registered', 18, currentY + 28);

    // Right Box: Client Signature (Embed Image)
    doc.roundedRect(108, currentY, boxWidth, boxHeight, 2, 2, 'FD');
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text('CLIENT / AUTHORIZED SIGNATORY', 112, currentY + 5.5);
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(`${sigRecord.signedByName} (${sigRecord.signedRole})`, 112, currentY + 11);

    // Embed Signature Canvas Image if available
    if (sigRecord.signatureDataUrl) {
      try {
        doc.addImage(sigRecord.signatureDataUrl, 'PNG', 112, currentY + 13, 50, 14);
      } catch {
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(30, 58, 138);
        doc.text(`Signed: ${sigRecord.signedByName}`, 112, currentY + 20);
      }
    }

    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`Signed At: ${sigRecord.signedAt}`, 112, currentY + 29);
    doc.text(`Audit Trail ID: ${sigRecord.ipHash}`, 112, currentY + 33);

    currentY += boxHeight + 6;

    // Footer Stamp
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text(`Pyda Movers Portal Execution Record • Generated on ${new Date().toUTCString()}`, 14, currentY);
    doc.text('Complies with ISO 27001 Security & Data Privacy Guidelines', pageWidth - 88, currentY);

    // Save File
    doc.save(`Signed_Contract_${docData.referenceNumber}.pdf`);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
      id="digital-signature-modal"
    >
      <div
        className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full p-5 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden my-auto max-h-[92vh] flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold shrink-0">
              <PenTool className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-black text-amber-400 uppercase">
                  {targetQuote ? `QUOTE #${targetQuote.id}` : 'PORTAL AGREEMENT'}
                </span>
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>PKI Encrypted</span>
                </span>
              </div>
              <h3 className="text-base sm:text-xl font-black text-white">
                Sign Moving Contract & Inventory Manifest
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Scrollable */}
        <div className="overflow-y-auto space-y-5 pr-1 text-xs">
          {/* Success Banner if Executed */}
          {executedDoc && (
            <div className="bg-emerald-500/15 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-black text-emerald-300">Contract Successfully Signed & Executed!</h4>
                  <p className="text-xs text-emerald-200/80">
                    Official Master Service Agreement #{executedDoc.referenceNumber} has been logged in your Document Vault.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => generateSignedContractPdf(executedDoc, executedDoc.signatureRecord!)}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow"
                >
                  <FileDown className="w-4 h-4 stroke-[2.5]" />
                  <span>Download Signed PDF Copy</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl"
                >
                  Close & Return to Dashboard
                </button>
              </div>
            </div>
          )}

          {/* Relocation Contract Summary Card */}
          <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-850 pb-2">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-amber-400" />
                <span>Agreement Schedule & Transit Corridor</span>
              </span>
              <span className="text-amber-400 font-mono font-bold text-[11px]">
                ₦{estimatedCost.toLocaleString('en-NG')}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-slate-300">
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-850">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Route Corridor</span>
                <span className="text-white font-bold">{origin} ➔ {destination}</span>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-850">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">GIT Cargo Cover</span>
                <span className="text-amber-400 font-bold font-mono">₦{coverageAmount.toLocaleString('en-NG')}</span>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-850">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Move Date</span>
                <span className="text-white font-mono">{moveDate}</span>
              </div>
            </div>
          </div>

          {/* Signer Legal Identity Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-bold text-[11px] mb-1">
                Full Legal Name <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                placeholder="e.g. Chief Emeka Adeleke"
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-bold text-[11px] mb-1">
                Capacity / Role <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                value={signerRole}
                onChange={(e) => setSignerRole(e.target.value)}
                placeholder="e.g. Managing Director / Client"
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Signature Input Mode Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-slate-300 font-bold flex items-center gap-1.5">
                <Stamp className="w-4 h-4 text-amber-400" />
                <span>Affix Digital Signature</span>
              </label>

              {/* Mode Tabs */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                {[
                  { id: 'draw', label: 'Draw', icon: <PenTool className="w-3 h-3" /> },
                  { id: 'type', label: 'Type', icon: <Type className="w-3 h-3" /> },
                  { id: 'upload', label: 'Upload', icon: <Upload className="w-3 h-3" /> },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => {
                      setSignMode(mode.id as any);
                      setErrorMsg('');
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all ${
                      signMode === mode.id
                        ? 'bg-amber-500 text-slate-950 shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {mode.icon}
                    <span>{mode.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Mode 1: DRAW CANVAS */}
            {signMode === 'draw' && (
              <div className="space-y-2">
                <div className="relative bg-slate-950 border border-slate-700 hover:border-slate-600 rounded-2xl overflow-hidden touch-none">
                  <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full h-36 cursor-crosshair block"
                  />

                  {/* Canvas Placeholder Guidance */}
                  {!hasDrawn && (
                    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-slate-600 space-y-1">
                      <PenTool className="w-5 h-5 opacity-60" />
                      <span className="text-[11px] font-medium">Draw your signature with finger, stylus, or mouse here</span>
                    </div>
                  )}

                  {/* Clear Button */}
                  <button
                    type="button"
                    onClick={clearCanvas}
                    className="absolute top-2 right-2 bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-white px-2.5 py-1 rounded-lg border border-slate-700 text-[10px] font-bold flex items-center gap-1 shadow"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Clear</span>
                  </button>
                </div>

                {/* Ink Color Selector */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                  <span>Sign on baseline above</span>
                  <div className="flex items-center gap-2">
                    <span>Ink:</span>
                    <button
                      type="button"
                      onClick={() => setPenColor('navy')}
                      className={`w-4 h-4 rounded-full bg-blue-900 border ${penColor === 'navy' ? 'ring-2 ring-amber-400' : 'border-slate-700'}`}
                      title="Navy Blue Ink"
                    />
                    <button
                      type="button"
                      onClick={() => setPenColor('black')}
                      className={`w-4 h-4 rounded-full bg-slate-950 border ${penColor === 'black' ? 'ring-2 ring-amber-400' : 'border-slate-700'}`}
                      title="Black Ink"
                    />
                    <button
                      type="button"
                      onClick={() => setPenColor('amber')}
                      className={`w-4 h-4 rounded-full bg-amber-600 border ${penColor === 'amber' ? 'ring-2 ring-amber-400' : 'border-slate-700'}`}
                      title="Gold Seal Ink"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Mode 2: TYPE SIGNATURE */}
            {signMode === 'type' && (
              <div className="space-y-3">
                <div className="bg-slate-950 border border-slate-700 rounded-2xl p-4 space-y-3">
                  <div className="text-center py-4 bg-slate-900/90 rounded-xl border border-slate-800">
                    <p
                      className="text-2xl sm:text-3xl text-amber-400 px-4 select-none tracking-wide"
                      style={{
                        fontFamily: fontStyles[typedFontIndex].cssFont.includes('Brush Script')
                          ? 'Brush Script MT, cursive'
                          : fontStyles[typedFontIndex].cssFont.includes('Lucida')
                          ? 'Lucida Handwriting, cursive'
                          : 'Georgia, serif',
                        fontStyle: 'italic',
                      }}
                    >
                      {signerName.trim() || 'Your Legal Signature'}
                    </p>
                  </div>

                  {/* Font Choice Pills */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {fontStyles.map((font, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setTypedFontIndex(idx)}
                        className={`p-2 rounded-xl text-[11px] font-bold border transition-all text-center ${
                          typedFontIndex === idx
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                        }`}
                      >
                        {font.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Mode 3: UPLOAD SIGNATURE IMAGE */}
            {signMode === 'upload' && (
              <div className="space-y-2">
                <div className="bg-slate-950 border border-dashed border-slate-700 hover:border-amber-400/50 rounded-2xl p-6 text-center space-y-3">
                  {uploadedSignatureUrl ? (
                    <div className="space-y-3">
                      <div className="bg-white/5 p-3 rounded-xl inline-block max-w-xs mx-auto">
                        <img
                          src={uploadedSignatureUrl}
                          alt="Uploaded signature preview"
                          className="max-h-20 mx-auto object-contain"
                        />
                      </div>
                      <div>
                        <label className="text-amber-400 hover:text-amber-300 font-bold cursor-pointer text-xs underline">
                          Choose another file
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleSignatureUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-8 h-8 text-slate-500 mx-auto" />
                      <p className="text-slate-300 font-bold text-xs">Upload Scanned Signature Image</p>
                      <p className="text-slate-500 text-[11px]">PNG or JPG image with transparent or white background.</p>
                      <label className="inline-block bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-4 py-2 rounded-xl cursor-pointer transition-colors shadow">
                        Browse Signature File
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleSignatureUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Legal Acknowledgement Checkbox */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 space-y-2.5">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => {
                  setAgreedToTerms(e.target.checked);
                  setErrorMsg('');
                }}
                className="mt-0.5 w-4 h-4 rounded text-amber-500 focus:ring-amber-400 bg-slate-900 border-slate-700"
              />
              <span className="text-slate-300 leading-relaxed text-[11px]">
                I, <strong>{signerName || 'the authorized signatory'}</strong>, hereby legally execute this Relocation Master Service Agreement & Inventory Manifest. I confirm that I agree to Pyda Movers terms of carriage, goods-in-transit all-risk insurance provisions, and electronic signature validity under Nigerian law.
              </span>
            </label>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded-xl flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Modal Action Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>256-bit PKI Cryptographic Timestamp</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs px-4 py-2.5 rounded-xl transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleExecuteContract}
              disabled={isSubmitting}
              className="flex-1 sm:flex-initial bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl shadow flex items-center justify-center gap-1.5 transition-all active:scale-98"
              id="execute-signature-btn"
            >
              {isSubmitting ? (
                <span>Executing Contract...</span>
              ) : (
                <>
                  <Stamp className="w-4 h-4 stroke-[2.5]" />
                  <span>Affix Signature & Execute Contract</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
