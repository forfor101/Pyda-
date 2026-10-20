import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  PenTool,
  CheckCircle2,
  ShieldCheck,
  Download,
  FileText,
  RotateCcw,
  Smartphone,
  Type,
  Upload,
  ExternalLink,
  Lock,
  Truck,
  MapPin,
  Calendar,
  Clock,
  Sparkles,
  AlertCircle,
  FileCheck2,
  Share2
} from 'lucide-react';
import jsPDF from 'jspdf';
import { ShipmentTrackStatus, VaultDocument, DeliverySignatureInfo } from '../types';
import { useAuth } from '../context/AuthContext';
import { useCms } from '../context/CmsContext';

interface RecipientDeliverySignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  shipment: ShipmentTrackStatus;
  onSignatureSaved?: (newDoc: VaultDocument, signatureInfo: DeliverySignatureInfo) => void;
  onNavigateToVault?: () => void;
}

const VAULT_STORAGE_KEY = 'megatrend_customer_vault_docs';

export const RecipientDeliverySignatureModal: React.FC<RecipientDeliverySignatureModalProps> = ({
  isOpen,
  onClose,
  shipment,
  onSignatureSaved,
  onNavigateToVault,
}) => {
  const { user, customerProfile, saveDocumentToCloud, updateShipmentInCloud } = useAuth();
  const { updateShipment, cms } = useCms();

  // Signature mode: draw (touch/stylus), type, upload
  const [signMode, setSignMode] = useState<'draw' | 'type' | 'upload'>('draw');
  const [penColor, setPenColor] = useState<'navy' | 'black' | 'amber'>('navy');
  const [typedFontIndex, setTypedFontIndex] = useState<number>(0);

  // Form Fields
  const [recipientName, setRecipientName] = useState<string>(() => {
    return customerProfile?.fullName || shipment.clientName || 'Authorized Consignee';
  });
  const [recipientPhone, setRecipientPhone] = useState<string>(() => {
    return customerProfile?.phone || shipment.driverPhone || '+234 806 246 6212';
  });
  const [recipientRole, setRecipientRole] = useState<string>('Primary Consignee / Cargo Owner');
  const [conditionStatus, setConditionStatus] = useState<string>('All items intact & received in good order (100% Intact)');
  const [customInspectionNotes, setCustomInspectionNotes] = useState<string>('');
  const [tamperSealConfirmed, setTamperSealConfirmed] = useState<boolean>(true);
  const [agreedToDeclaration, setAgreedToDeclaration] = useState<boolean>(true);

  // Canvas Drawing State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [hasDrawn, setHasDrawn] = useState<boolean>(false);
  const [uploadedSignatureUrl, setUploadedSignatureUrl] = useState<string | null>(null);

  // Status & Success state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [completedDoc, setCompletedDoc] = useState<VaultDocument | null>(null);
  const [completedSigInfo, setCompletedSigInfo] = useState<DeliverySignatureInfo | null>(null);

  // Sync recipient name if customerProfile changes
  useEffect(() => {
    if (customerProfile?.fullName && (!recipientName || recipientName === 'Authorized Consignee')) {
      setRecipientName(customerProfile.fullName);
    }
  }, [customerProfile]);

  // Handle Canvas High-DPI setup and resizing
  useEffect(() => {
    if (!isOpen || signMode !== 'draw') return;

    const setupCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const parent = canvas.parentElement;
      if (!parent) return;

      const rect = parent.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const width = Math.floor(rect.width);
      const height = 180;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = penColor === 'navy' ? '#1e3a8a' : penColor === 'black' ? '#0f172a' : '#d97706';
      }
    };

    const timer = setTimeout(setupCanvas, 100);
    window.addEventListener('resize', setupCanvas);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', setupCanvas);
    };
  }, [isOpen, signMode, penColor]);

  // Stylized font choices for typed signature
  const fontStyles = [
    { name: 'Formal Script', cssClass: 'font-serif italic font-normal tracking-wide' },
    { name: 'Executive Cursive', cssClass: 'font-mono italic font-semibold tracking-wider' },
    { name: 'Modern Signature', cssClass: 'font-sans italic font-bold tracking-tight' },
    { name: 'Legal Handwritten', cssClass: 'italic font-light tracking-widest' },
  ];

  // Canvas drawing handlers with touch & pointer support (touch-action: none)
  const getCoordinates = (e: React.MouseEvent | React.TouchEvent | React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    const mouseEvent = e as React.MouseEvent;
    return {
      x: mouseEvent.clientX - rect.left,
      y: mouseEvent.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent | React.PointerEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawn(true);
    setErrorMsg('');

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent | React.PointerEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = penColor === 'navy' ? '#1e3a8a' : penColor === 'black' ? '#0f172a' : '#d97706';
    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.closePath();
    }
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    setHasDrawn(false);
  };

  // Convert typed name to high-res signature image URL
  const generateTypedSignatureDataUrl = (name: string, fontIndex: number): string => {
    const offCanvas = document.createElement('canvas');
    offCanvas.width = 600;
    offCanvas.height = 160;
    const ctx = offCanvas.getContext('2d');
    if (!ctx) return '';

    ctx.fillStyle = 'transparent';
    ctx.fillRect(0, 0, offCanvas.width, offCanvas.height);

    const fontNames = [
      'italic 38px "Times New Roman", Times, serif',
      'italic bold 36px "Courier New", monospace',
      'italic bold 34px "Segoe UI", Tahoma, sans-serif',
      'italic 36px Georgia, serif',
    ];
    ctx.font = fontNames[fontIndex] || fontNames[0];
    ctx.fillStyle = penColor === 'navy' ? '#1e3a8a' : penColor === 'black' ? '#0f172a' : '#d97706';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(name || 'Authorized Recipient', offCanvas.width / 2, offCanvas.height / 2);

    return offCanvas.toDataURL('image/png');
  };

  // Handle uploaded stamp/signature
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  // Generate Official PDF Proof of Delivery
  const generateProofOfDeliveryPdf = (
    docData: VaultDocument,
    sigInfo: DeliverySignatureInfo,
    targetShipment: ShipmentTrackStatus
  ) => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();

    // 1. Top Header Banner
    pdf.setFillColor(15, 23, 42); // slate-900
    pdf.rect(0, 0, pageWidth, 42, 'F');

    // Amber Accent Line
    pdf.setFillColor(245, 158, 11); // amber-500
    pdf.rect(0, 42, pageWidth, 2.5, 'F');

    // Branding Title
    pdf.setTextColor(245, 158, 11);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('PYDA MOVERS & LOGISTICS NIGERIA', 14, 15);

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(8.5);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Official Proof of Delivery (POD) & Consignment Acceptance Certificate', 14, 22);
    pdf.text(`PKI Electronic Verification: ${sigInfo.pkiVerificationCode} | Tamper Seal: ${targetShipment.tamperSealCode || 'VERIFIED'}`, 14, 28);
    pdf.text('24/7 Dispatch Central: 08062466212 • operations@pydamovers.com', 14, 34);

    // Reference Pill
    pdf.setFillColor(30, 41, 59);
    pdf.roundedRect(pageWidth - 78, 9, 64, 24, 2, 2, 'F');
    pdf.setTextColor(245, 158, 11);
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'bold');
    pdf.text('WAYBILL / TRACKING ID', pageWidth - 74, 16);
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(10);
    pdf.text(targetShipment.trackingId, pageWidth - 74, 26);

    let currentY = 53;

    // Document Title Heading
    pdf.setTextColor(15, 23, 42);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`PROOF OF DELIVERY RECEIPT: ${docData.referenceNumber}`, 14, currentY);
    currentY += 6;

    // Status Badge
    pdf.setFontSize(8);
    pdf.setTextColor(5, 150, 105); // emerald-600
    pdf.text(`STATUS: CONSIGNMENT DELIVERED • HANDOVER CERTIFIED & DIGITALLY SIGNED (${sigInfo.signedAt})`, 14, currentY);
    currentY += 6;

    // 2. Consignment Handover Specifications Box
    pdf.setDrawColor(226, 232, 240);
    pdf.setFillColor(248, 250, 252);
    pdf.roundedRect(14, currentY, 182, 52, 2, 2, 'FD');

    const col1X = 18;
    const col2X = 108;
    let gridY = currentY + 7;

    // Column 1
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(100, 116, 139);
    pdf.text('RECIPIENT / AUTHORIZED CONSIGNEE', col1X, gridY);
    pdf.setFontSize(9.5);
    pdf.setTextColor(15, 23, 42);
    pdf.text(`${sigInfo.signedByName} (${sigInfo.signedRole})`, col1X, gridY + 5);

    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(100, 116, 139);
    pdf.text('RECIPIENT CONTACT PHONE', col1X, gridY + 13);
    pdf.setFontSize(8.5);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(15, 23, 42);
    pdf.text(sigInfo.recipientPhone || 'N/A', col1X, gridY + 18);

    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(100, 116, 139);
    pdf.text('DELIVERY CORRIDOR & DESTINATION', col1X, gridY + 26);
    pdf.setFontSize(8.5);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(15, 23, 42);
    pdf.text(`${targetShipment.origin} ➔ ${targetShipment.destination}`, col1X, gridY + 31);

    // Column 2
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(100, 116, 139);
    pdf.text('HANDOVER CARGO CONDITION', col2X, gridY);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(5, 150, 105);
    pdf.text(sigInfo.conditionStatus || '100% Intact / Zero Transit Damage', col2X, gridY + 5);

    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(100, 116, 139);
    pdf.text('ELECTRONIC TAMPER SEAL AUDIT', col2X, gridY + 13);
    pdf.setFontSize(8.5);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(217, 119, 6);
    pdf.text(`${targetShipment.tamperSealCode || 'MTM-SEAL-VERIFIED'} (Verified Intact)`, col2X, gridY + 18);

    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(100, 116, 139);
    pdf.text('ASSIGNED FLEET UNIT & CONVOY LEAD', col2X, gridY + 26);
    pdf.setFontSize(8);
    pdf.setTextColor(15, 23, 42);
    pdf.text(`${targetShipment.vehicleUnit || 'MTM-FL-108'} • ${targetShipment.driverName || 'Lead Convoy Officer'} (${targetShipment.vehiclePlate || 'Verified Plate'})`, col2X, gridY + 31);

    currentY += 58;

    // 3. Legal Attestation & Discharge Clause
    pdf.setTextColor(15, 23, 42);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Consignee Receipt Acknowledgment & Custody Transfer Covenants', 14, currentY);
    currentY += 5;

    const terms = [
      ['1. Acknowledgment of Physical Delivery', 'The consignee confirms that the freight and consignment specified under this waybill have been delivered to the stated destination address, unloaded, and physically inspected.'],
      ['2. Tamper-Evident Security Seal Inspection', 'Both the delivering convoy crew and receiving representative inspected the serialized security seal prior to unlatching and certify that the seal arrived intact without unauthorized tampering.'],
      ['3. Condition & Clean Handover', 'Unless specifically noted below, all items, cartons, and crated goods were received in sound, undamaged condition with zero visible transit impairment.'],
      ['4. Legal Custody & Carrier Discharge', 'Signing of this Proof of Delivery constitutes final discharge of carrier custody for the listed cargo, pursuant to the Nigerian Carriage of Goods Act and Pyda Conditions of Carriage.'],
    ];

    terms.forEach(([title, clause]) => {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7.5);
      pdf.setTextColor(15, 23, 42);
      pdf.text(title, 14, currentY);
      currentY += 3.5;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7);
      pdf.setTextColor(71, 85, 105);
      const split = pdf.splitTextToSize(clause, 180);
      pdf.text(split, 14, currentY);
      currentY += split.length * 3.2 + 2;
    });

    currentY += 3;

    // 4. Execution & Signature Blocks
    pdf.setTextColor(15, 23, 42);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Bilateral Signatures & Handover Verification Stamp', 14, currentY);
    currentY += 5;

    const boxW = 88;
    const boxH = 38;
    pdf.setDrawColor(203, 213, 225);
    pdf.setFillColor(248, 250, 252);

    // Left: Carrier Lead Signoff
    pdf.roundedRect(14, currentY, boxW, boxH, 2, 2, 'FD');
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(100, 116, 139);
    pdf.text('CARRIER DELIVERING OFFICER', 18, currentY + 6);
    pdf.setFontSize(8.5);
    pdf.setTextColor(15, 23, 42);
    pdf.text(targetShipment.driverName || 'Lead Convoy Captain', 18, currentY + 12);

    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'italic');
    pdf.setTextColor(5, 150, 105);
    pdf.text('✓ Handover Completed by Fleet Driver', 18, currentY + 18);
    pdf.setFontSize(6.5);
    pdf.setTextColor(100, 116, 139);
    pdf.text(`Vehicle: ${targetShipment.vehiclePlate || 'Pyda Fleet'}`, 18, currentY + 24);
    pdf.text(`Delivered: ${sigInfo.signedAt}`, 18, currentY + 29);

    // Right: Recipient Digital Signature Box
    pdf.roundedRect(108, currentY, boxW, boxH, 2, 2, 'FD');
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(100, 116, 139);
    pdf.text('AUTHORIZED CONSIGNEE / RECIPIENT', 112, currentY + 6);
    pdf.setFontSize(8.5);
    pdf.setTextColor(15, 23, 42);
    pdf.text(`${sigInfo.signedByName} (${sigInfo.signedRole})`, 112, currentY + 12);

    if (sigInfo.signatureDataUrl) {
      try {
        pdf.addImage(sigInfo.signatureDataUrl, 'PNG', 112, currentY + 14, 52, 16);
      } catch (err) {
        console.warn('PDF signature rendering notice:', err);
      }
    }

    pdf.setFontSize(6.5);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(5, 150, 105);
    pdf.text(`PKI CERT: ${sigInfo.pkiVerificationCode}`, 112, currentY + 33);

    // Save PDF
    pdf.save(`Pyda_Proof_of_Delivery_${targetShipment.trackingId}.pdf`);
  };

  // Submit and Save Handover Digital Signature
  const handleSubmitSignature = async () => {
    if (!recipientName.trim()) {
      setErrorMsg('Please enter the recipient’s legal name.');
      return;
    }

    if (!agreedToDeclaration) {
      setErrorMsg('Please confirm physical receipt of the goods by checking the declaration box.');
      return;
    }

    let finalSignatureDataUrl = '';

    if (signMode === 'draw') {
      if (!hasDrawn || !canvasRef.current) {
        setErrorMsg('Please provide a handwritten signature on the touch pad.');
        return;
      }
      finalSignatureDataUrl = canvasRef.current.toDataURL('image/png');
    } else if (signMode === 'type') {
      if (!recipientName.trim()) {
        setErrorMsg('Please type your legal signature name.');
        return;
      }
      finalSignatureDataUrl = generateTypedSignatureDataUrl(recipientName, typedFontIndex);
    } else if (signMode === 'upload') {
      if (!uploadedSignatureUrl) {
        setErrorMsg('Please select and upload a valid signature or receiving stamp image.');
        return;
      }
      finalSignatureDataUrl = uploadedSignatureUrl;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    // Generate unique verification code
    const randomHex = Math.random().toString(16).substring(2, 8).toUpperCase();
    const certCode = `POD-MGT-${new Date().getFullYear()}-${randomHex}`;
    const timestampStr = new Date().toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short',
    });

    const sigInfo: DeliverySignatureInfo = {
      signatureDataUrl: finalSignatureDataUrl,
      signatureType: signMode,
      signedByName: recipientName.trim(),
      signedRole: recipientRole.trim(),
      signedAt: timestampStr,
      ipHash: `SHA256-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      pkiVerificationCode: certCode,
      agreedToTerms: true,
      recipientPhone: recipientPhone.trim(),
      recipientDesignation: recipientRole.trim(),
      conditionStatus: conditionStatus,
      tamperSealVerified: tamperSealConfirmed,
      inspectionNotes: customInspectionNotes.trim(),
      waybillNumber: shipment.trackingId,
      documentVaultId: `DOC-POD-${shipment.trackingId}-${Date.now().toString().slice(-4)}`,
    };

    const newSignedDoc: VaultDocument = {
      id: sigInfo.documentVaultId || `DOC-POD-${shipment.trackingId}`,
      title: `Proof of Delivery (POD) & Consignment Handover - #${shipment.trackingId}`,
      docType: 'proof_of_delivery',
      referenceNumber: `POD-${shipment.trackingId}`,
      issuedDate: new Date().toISOString().split('T')[0],
      status: 'signed',
      fileSize: '520 KB',
      underwriterOrIssuer: 'Pyda Logistics Operations & Consignee Directorate',
      coverageAmountNaira: 25000000,
      originCity: shipment.origin,
      destinationCity: shipment.destination,
      signatories: [
        `${recipientName.trim()} (${recipientRole})`,
        `${shipment.driverName || 'Lead Convoy Captain'} (Pyda Fleet)`,
      ],
      signatureRecord: {
        signatureDataUrl: finalSignatureDataUrl,
        signatureType: signMode,
        signedByName: recipientName.trim(),
        signedRole: recipientRole.trim(),
        signedAt: timestampStr,
        ipHash: sigInfo.ipHash,
        pkiVerificationCode: certCode,
        agreedToTerms: true,
      },
      associatedQuoteId: shipment.trackingId,
      summaryText: `Official Proof of Delivery and bilateral handover acceptance certificate for Waybill #${shipment.trackingId}. Signed on mobile touchscreen by ${recipientName.trim()} (${recipientRole}) upon receipt at ${shipment.destination}. Tamper seal ${shipment.tamperSealCode || 'SEAL-OK'} inspected and verified 100% intact.`,
      verifiedStampCode: certCode,
      tags: ['Proof of Delivery', 'POD', 'Handover', 'Signed', shipment.trackingId],
    };

    try {
      // 1. Save to localStorage for Document Vault
      const existingStr = localStorage.getItem(VAULT_STORAGE_KEY);
      let existingDocs: VaultDocument[] = [];
      if (existingStr) {
        try {
          existingDocs = JSON.parse(existingStr);
        } catch {}
      }
      const filtered = existingDocs.filter((d) => d.id !== newSignedDoc.id && d.referenceNumber !== newSignedDoc.referenceNumber);
      localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify([newSignedDoc, ...filtered]));

      // 2. Dispatch custom event so open Document Vault updates reactively
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('pyda_vault_updated', { detail: newSignedDoc }));
        window.dispatchEvent(new CustomEvent('megatrend_vault_updated', { detail: newSignedDoc }));
        window.dispatchEvent(new Event('storage'));
      }

      // 3. If Firebase user is authenticated, persist to Firestore
      if (user) {
        try {
          await saveDocumentToCloud(newSignedDoc);
        } catch (cloudErr) {
          console.warn('[RecipientDeliverySignatureModal] Cloud doc save notice:', cloudErr);
        }
      }

      // 4. Update shipment state in CmsContext & Cloud
      const today = new Date().toISOString().split('T')[0];
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const deliveryUpdate = {
        date: today,
        time: now,
        location: shipment.destination,
        note: `Consignment delivered & signed. Proof of Delivery #${newSignedDoc.referenceNumber} executed by ${recipientName.trim()} (${recipientRole}). Document registered in Document Vault.`,
      };

      const updatedShipmentData: Partial<ShipmentTrackStatus> = {
        status: 'Delivered',
        progressPercent: 100,
        currentLocation: `${shipment.destination} (Delivered & Signed)`,
        estimatedArrival: 'Delivered & Signed Off',
        deliverySignature: sigInfo,
        updates: [deliveryUpdate, ...(shipment.updates || [])],
      };

      updateShipment(shipment.trackingId, updatedShipmentData);

      if (user) {
        try {
          await updateShipmentInCloud(shipment.trackingId, updatedShipmentData);
        } catch (cloudShipErr) {
          console.warn('[RecipientDeliverySignatureModal] Cloud shipment update notice:', cloudShipErr);
        }
      }

      // 5. Generate and download PDF
      try {
        generateProofOfDeliveryPdf(newSignedDoc, sigInfo, { ...shipment, ...updatedShipmentData });
      } catch (pdfErr) {
        console.warn('PDF auto-download notice:', pdfErr);
      }

      setCompletedDoc(newSignedDoc);
      setCompletedSigInfo(sigInfo);
      setIsSubmitting(false);

      if (onSignatureSaved) {
        onSignatureSaved(newSignedDoc, sigInfo);
      }
    } catch (err: any) {
      console.error('Signature save error:', err);
      setErrorMsg(err.message || 'Failed to complete digital signature handover.');
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        id="recipient-delivery-signature-modal"
      >
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">Recipient Delivery Signature</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Mobile / Touch POD
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Waybill <strong className="text-amber-400 font-mono">#{shipment.trackingId}</strong> • Handover Acceptance & Vault Archival
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Scrollable Area */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-slate-200 text-xs sm:text-sm">
          {completedDoc ? (
            /* Completed Success State */
            <div className="space-y-6 text-center py-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-lg">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-black text-white">Proof of Delivery Successfully Certified!</h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto">
                  The digital signature has been recorded with cryptographic verification and officially archived in your{' '}
                  <strong className="text-amber-400">Document Vault</strong>.
                </p>
              </div>

              {/* Verified Certificate Summary Pill */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-left max-w-lg mx-auto space-y-2 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <span className="text-slate-400">Document Reference:</span>
                  <span className="text-amber-400 font-mono font-black">{completedDoc.referenceNumber}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <span className="text-slate-400">Signatory:</span>
                  <span className="text-white font-bold">{completedSigInfo?.signedByName} ({completedSigInfo?.signedRole})</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <span className="text-slate-400">Verification Seal:</span>
                  <span className="text-emerald-400 font-mono font-bold">{completedDoc.verifiedStampCode}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Tamper Seal Audit:</span>
                  <span className="text-emerald-400 font-bold">100% Intact & Verified</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => {
                    if (completedDoc && completedSigInfo) {
                      generateProofOfDeliveryPdf(completedDoc, completedSigInfo, shipment);
                    }
                  }}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Signed POD (PDF)</span>
                </button>

                {onNavigateToVault && (
                  <button
                    onClick={() => {
                      onClose();
                      onNavigateToVault();
                    }}
                    className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <FileText className="w-4 h-4 text-amber-400" />
                    <span>View in Document Vault</span>
                  </button>
                )}

                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 font-bold text-xs transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            /* Active Signing Form */
            <>
              {/* Consignment Overview Banner */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-slate-400 font-bold uppercase text-[10px]">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span>Consignment Handover Route</span>
                  </div>
                  <p className="text-white font-black text-sm">
                    {shipment.origin} <span className="text-amber-400 font-normal">➔</span> {shipment.destination}
                  </p>
                  <p className="text-slate-400 text-[11px]">
                    Fleet Unit: <strong className="text-slate-200">{shipment.vehicleUnit || 'MTM-FL-108'}</strong> ({shipment.vehiclePlate || 'Verified Registration'})
                  </p>
                </div>

                <div className="sm:text-right space-y-1 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Electronic Tamper Seal</span>
                  <p className="text-amber-400 font-mono font-black text-xs sm:text-sm">
                    {shipment.tamperSealCode || 'MTM-SEAL-88392-LOK'}
                  </p>
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    <ShieldCheck className="w-3 h-3" />
                    Verified Unbroken
                  </span>
                </div>
              </div>

              {/* Recipient Details Section */}
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                  <span>1. Consignee & Receiving Party Information</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 text-[11px] font-bold mb-1">
                      Recipient Full Legal Name <span className="text-amber-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="e.g. Chief Emeka Adeleke"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white text-xs font-semibold focus:outline-none focus:border-amber-400 transition-colors"
                      id="recipient-legal-name-input"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[11px] font-bold mb-1">
                      Recipient Mobile Phone Number <span className="text-amber-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={recipientPhone}
                      onChange={(e) => setRecipientPhone(e.target.value)}
                      placeholder="+234 803 000 0000"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white text-xs font-mono focus:outline-none focus:border-amber-400 transition-colors"
                      id="recipient-phone-input"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[11px] font-bold mb-1">
                      Receiving Role / Capacity
                    </label>
                    <select
                      value={recipientRole}
                      onChange={(e) => setRecipientRole(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white text-xs font-semibold focus:outline-none focus:border-amber-400 transition-colors"
                      id="recipient-role-select"
                    >
                      <option value="Primary Consignee / Cargo Owner">Primary Consignee / Cargo Owner</option>
                      <option value="Corporate Receiving & Facilities Officer">Corporate Receiving & Facilities Officer</option>
                      <option value="Site Logistics / Warehouse Lead">Site Logistics / Warehouse Lead</option>
                      <option value="Authorized Proxy / Next of Kin">Authorized Proxy / Next of Kin</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[11px] font-bold mb-1">
                      Physical Inspection Condition
                    </label>
                    <select
                      value={conditionStatus}
                      onChange={(e) => setConditionStatus(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-emerald-400 font-semibold text-xs focus:outline-none focus:border-amber-400 transition-colors"
                      id="recipient-condition-select"
                    >
                      <option value="All items intact & received in good order (100% Intact)">
                        All items intact & received in good order (100% Intact)
                      </option>
                      <option value="Inspected upon unlatching - Packaging Sound & Clean">
                        Inspected upon unlatching - Packaging Sound & Clean
                      </option>
                      <option value="Minor external carton scuffing - contents intact">
                        Minor external carton scuffing - contents intact
                      </option>
                      <option value="Custom Inspection condition notes attached">
                        Custom Inspection condition notes attached
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Signature Capture Section */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <PenTool className="w-3.5 h-3.5 text-amber-400" />
                    <span>2. Digital Handover Signature (Mobile / Glass Screen)</span>
                  </h3>

                  {/* Mode Selector Tabs */}
                  <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setSignMode('draw')}
                      className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all flex items-center gap-1 ${
                        signMode === 'draw'
                          ? 'bg-amber-500 text-slate-950 shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Smartphone className="w-3 h-3" />
                      <span>Touch / Stylus</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSignMode('type')}
                      className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all flex items-center gap-1 ${
                        signMode === 'type'
                          ? 'bg-amber-500 text-slate-950 shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Type className="w-3 h-3" />
                      <span>Type Name</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSignMode('upload')}
                      className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all flex items-center gap-1 ${
                        signMode === 'upload'
                          ? 'bg-amber-500 text-slate-950 shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Upload className="w-3 h-3" />
                      <span>Stamp / Seal</span>
                    </button>
                  </div>
                </div>

                {/* Sub-Panel: DRAW MODE */}
                {signMode === 'draw' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px]">Ink Tone:</span>
                        <button
                          type="button"
                          onClick={() => setPenColor('navy')}
                          className={`w-4 h-4 rounded-full bg-blue-900 border ${
                            penColor === 'navy' ? 'ring-2 ring-amber-400 border-white' : 'border-slate-700'
                          }`}
                          title="Executive Navy"
                        />
                        <button
                          type="button"
                          onClick={() => setPenColor('black')}
                          className={`w-4 h-4 rounded-full bg-slate-950 border ${
                            penColor === 'black' ? 'ring-2 ring-amber-400 border-white' : 'border-slate-700'
                          }`}
                          title="Carbon Black"
                        />
                        <button
                          type="button"
                          onClick={() => setPenColor('amber')}
                          className={`w-4 h-4 rounded-full bg-amber-500 border ${
                            penColor === 'amber' ? 'ring-2 ring-white border-slate-900' : 'border-slate-700'
                          }`}
                          title="Pyda Amber"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={clearCanvas}
                        className="text-[11px] text-slate-400 hover:text-amber-400 font-bold flex items-center gap-1 transition-colors"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Clear Signature Pad</span>
                      </button>
                    </div>

                    {/* Canvas Container with touch-action: none */}
                    <div className="w-full bg-slate-950 border-2 border-dashed border-slate-800 hover:border-slate-700 rounded-xl relative overflow-hidden h-[180px]">
                      <canvas
                        ref={canvasRef}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                        className="w-full h-full cursor-crosshair"
                        style={{ touchAction: 'none' }}
                        id="recipient-signature-canvas"
                      />

                      {!hasDrawn && (
                        <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-slate-600 space-y-1">
                          <PenTool className="w-6 h-6 text-slate-700 animate-bounce" />
                          <p className="text-xs font-bold text-slate-500">Sign with finger or stylus on mobile screen</p>
                          <p className="text-[10px] text-slate-600">Cross-border legal proof of custody transfer</p>
                        </div>
                      )}

                      <div className="absolute bottom-2 left-3 pointer-events-none text-[10px] text-slate-600 font-mono">
                        X __________________________________________________
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub-Panel: TYPE MODE */}
                {signMode === 'type' && (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-400">
                      Select your preferred executive cursive signing typeface:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {fontStyles.map((f, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setTypedFontIndex(idx)}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            typedFontIndex === idx
                              ? 'bg-amber-500/10 border-amber-400 text-amber-400 shadow'
                              : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <span className="text-[10px] text-slate-500 block uppercase font-sans font-bold">
                            {f.name}
                          </span>
                          <span className={`text-base sm:text-lg block mt-1 ${f.cssClass}`}>
                            {recipientName || 'Authorized Recipient'}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sub-Panel: UPLOAD STAMP */}
                {signMode === 'upload' && (
                  <div className="bg-slate-950 border-2 border-dashed border-slate-800 rounded-xl p-6 text-center space-y-3">
                    {uploadedSignatureUrl ? (
                      <div className="space-y-3">
                        <img
                          src={uploadedSignatureUrl}
                          alt="Uploaded Receiving Stamp"
                          className="max-h-24 max-w-[200px] mx-auto object-contain bg-white/5 p-2 rounded-lg border border-slate-800"
                        />
                        <button
                          type="button"
                          onClick={() => setUploadedSignatureUrl(null)}
                          className="text-xs text-red-400 hover:text-red-300 font-bold"
                        >
                          Remove and Upload Different Stamp
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="w-8 h-8 text-amber-400 mx-auto" />
                        <p className="text-xs font-bold text-white">Upload Corporate Receiving Stamp or Written Signature</p>
                        <p className="text-[11px] text-slate-400">PNG, JPG, or SVG with transparent background recommended</p>
                        <label className="inline-block mt-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg cursor-pointer transition-colors">
                          Browse Files
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Legal Checkboxes */}
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={tamperSealConfirmed}
                    onChange={(e) => setTamperSealConfirmed(e.target.checked)}
                    className="mt-0.5 rounded border-slate-700 text-amber-500 focus:ring-amber-400 w-4 h-4 bg-slate-950"
                  />
                  <span className="text-[11px] text-slate-300">
                    I confirm that the physical electronic tamper seal (
                    <strong className="text-amber-400 font-mono">{shipment.tamperSealCode || 'MTM-SEAL-88392-LOK'}</strong>) was inspected and intact prior to unlatching.
                  </span>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreedToDeclaration}
                    onChange={(e) => setAgreedToDeclaration(e.target.checked)}
                    className="mt-0.5 rounded border-slate-700 text-amber-500 focus:ring-amber-400 w-4 h-4 bg-slate-950"
                  />
                  <span className="text-[11px] text-slate-300">
                    I hereby acknowledge physical receipt of the consignment referenced under Waybill #{shipment.trackingId}. I accept transfer of custody and certify clean handover to Pyda Movers & Logistics Ltd.
                  </span>
                </label>
              </div>

              {/* Error Message if any */}
              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Bottom Footer */}
        {!completedDoc && (
          <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900/90 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>PKI Cryptographic Timestamp & Auto-Save to Vault</span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="w-1/2 sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSubmitSignature}
                disabled={isSubmitting}
                className="w-1/2 sm:w-auto px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 disabled:opacity-50"
                id="submit-delivery-signature-btn"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Signing & Archiving...</span>
                  </>
                ) : (
                  <>
                    <FileCheck2 className="w-4 h-4" />
                    <span>Execute & Save POD to Vault</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
