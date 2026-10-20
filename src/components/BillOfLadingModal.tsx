import React, { useState } from 'react';
import {
  X,
  Printer,
  Download,
  FileText,
  ShieldCheck,
  Truck,
  Building2,
  Calendar,
  MapPin,
  User,
  CheckCircle2,
  FolderLock,
  QrCode,
  PenTool,
  Save,
  Phone,
  Shield,
  Layers,
  ArrowRight,
  Sparkles,
  Barcode
} from 'lucide-react';
import { ShipmentTrackStatus, CustomerUser, VaultDocument } from '../types';
import jsPDF from 'jspdf';

interface BillOfLadingModalProps {
  isOpen: boolean;
  onClose: () => void;
  shipment: ShipmentTrackStatus | null;
  currentUser: CustomerUser;
  onSaveToVault?: (doc: VaultDocument) => void;
}

export const generateBillOfLadingPdf = (
  shipment: ShipmentTrackStatus,
  currentUser: CustomerUser,
  customCargo?: {
    declaredValuationNaira?: number;
    consigneeName?: string;
    consigneePhone?: string;
    cargoDescription?: string;
    specialInstructions?: string;
    tamperSeal?: string;
  }
) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 12;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const bolNumber = `BOL-MGT-${shipment.trackingId.replace(/[^A-Za-z0-9]/g, '')}-${new Date().getFullYear()}`;
  const issueDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  // 1. TOP HEADER BAR
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(margin, y, contentWidth, 22, 'F');

  // Brand Name & Subtitle
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(245, 158, 11); // amber-500
  doc.text('PYDA MOVERS & LOGISTICS LTD', margin + 4, y + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text('Federal Ministry of Works & Housing Reg: FMWH/RL-0892 • RC: 1498210', margin + 4, y + 13);
  doc.text('HQ: 14B Admiralty Way, Lekki Phase 1, Lagos | 24/7 Dispatch: +234 806 246 6212', margin + 4, y + 18);

  // Document Title Pill
  doc.setFillColor(245, 158, 11); // amber-500
  doc.roundedRect(pageWidth - margin - 52, y + 3.5, 48, 15, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('BILL OF LADING', pageWidth - margin - 47, y + 9);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.text('STRAIGHT / NON-NEGOTIABLE', pageWidth - margin - 50, y + 14);

  y += 26;

  // 2. META DETAILS BAR (BOL #, Tracking, Date, Seal)
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 14, 1.5, 1.5, 'FD');

  const colWidth = contentWidth / 4;
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);

  doc.text('BOL REFERENCE NO.', margin + 3, y + 4.5);
  doc.text('CONSIGNMENT / TRACKING #', margin + colWidth + 3, y + 4.5);
  doc.text('DATE OF DISPATCH', margin + colWidth * 2 + 3, y + 4.5);
  doc.text('TAMPER-EVIDENT SEAL', margin + colWidth * 3 + 3, y + 4.5);

  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(bolNumber, margin + 3, y + 10.5);
  doc.text(shipment.trackingId, margin + colWidth + 3, y + 10.5);
  doc.text(issueDate, margin + colWidth * 2 + 3, y + 10.5);

  doc.setTextColor(5, 150, 105); // emerald-600
  doc.setFont('helvetica', 'bold');
  doc.text(customCargo?.tamperSeal || shipment.tamperSealCode || 'MGT-SEAL-99482', margin + colWidth * 3 + 3, y + 10.5);

  y += 18;

  // 3. SHIPPER (CONSIGNOR) & CONSIGNEE BOXES
  const boxWidth = (contentWidth - 4) / 2;
  const boxHeight = 36;

  // SHIPPER BOX (Left)
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, boxWidth, boxHeight, 1.5, 1.5, 'FD');

  // Shipper Header
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, y, boxWidth, 6.5, 1.5, 1.5, 'F');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('1. SHIPPER / CONSIGNOR (ORIGIN)', margin + 3, y + 4.5);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(currentUser.fullName || shipment.clientName || 'Chief Client', margin + 3, y + 12);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  if (currentUser.companyName) {
    doc.text(`Company: ${currentUser.companyName}`, margin + 3, y + 16.5);
  }
  doc.text(`Origin City/Hub: ${shipment.origin}`, margin + 3, y + (currentUser.companyName ? 21 : 17));
  doc.text(`Contact: ${currentUser.phone || '+234 803 555 0192'}`, margin + 3, y + (currentUser.companyName ? 25.5 : 21.5));
  doc.text(`Email: ${currentUser.email || 'client@pyda.ng'}`, margin + 3, y + (currentUser.companyName ? 30 : 26));

  // CONSIGNEE BOX (Right)
  const rightX = margin + boxWidth + 4;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(rightX, y, boxWidth, boxHeight, 1.5, 1.5, 'FD');

  // Consignee Header
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(rightX, y, boxWidth, 6.5, 1.5, 1.5, 'F');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('2. CONSIGNEE / RECEIVING PARTY (DESTINATION)', rightX + 3, y + 4.5);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(customCargo?.consigneeName || currentUser.fullName || 'Authorized Receiver', rightX + 3, y + 12);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Destination City/Site: ${shipment.destination}`, rightX + 3, y + 16.5);
  doc.text(`Delivery Window / ETA: ${shipment.estimatedArrival || 'Scheduled Direct Convoy'}`, rightX + 3, y + 21);
  doc.text(`Receiver Phone: ${customCargo?.consigneePhone || currentUser.phone || '+234 803 555 0192'}`, rightX + 3, y + 25.5);
  doc.text('Delivery Protocol: Site Inspection & Offloading Team Included', rightX + 3, y + 30);

  y += boxHeight + 4;

  // 4. CARRIER & CONVOY TELEMATICS TABLE
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, contentWidth, 18, 1.5, 1.5, 'FD');

  const carrierCols = contentWidth / 4;
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('CARRIER VEHICLE PLATE', margin + 3, y + 4.5);
  doc.text('CONVOY / TRUCK UNIT', margin + carrierCols + 3, y + 4.5);
  doc.text('LEAD CONVOY CAPTAIN', margin + carrierCols * 2 + 3, y + 4.5);
  doc.text('CARGO BAY TEMP / COND.', margin + carrierCols * 3 + 3, y + 4.5);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(shipment.vehiclePlate || 'KJA-892-XY (Lagos)', margin + 3, y + 10.5);
  doc.text(shipment.vehicleType || '30T Heavy-Duty Van / Escort', margin + carrierCols + 3, y + 10.5);
  doc.text(shipment.driverName || 'Captain Bello (Verified)', margin + carrierCols * 2 + 3, y + 10.5);
  doc.text(`${shipment.cargoTempCelsius || 24}°C (Weather-Sealed)`, margin + carrierCols * 3 + 3, y + 10.5);

  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`GPS Status: ${shipment.status} • Current: ${shipment.currentLocation}`, margin + 3, y + 15);

  y += 22;

  // 5. CARGO MANIFEST & DESCRIPTION
  doc.setFillColor(15, 23, 42);
  doc.rect(margin, y, contentWidth, 6, 'F');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(245, 158, 11);
  doc.text('3. CARGO MANIFEST & GOODS DESCRIPTION', margin + 3, y + 4.2);

  y += 6;

  // Manifest Table Headers
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.rect(margin, y, contentWidth, 6, 'FD');

  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('ITEM / DESCRIPTION', margin + 3, y + 4);
  doc.text('PACKAGE TYPE', margin + 95, y + 4);
  doc.text('EST. WEIGHT / CBM', margin + 130, y + 4);
  doc.text('DECLARED VALUE (NGN)', margin + 160, y + 4);

  y += 6;

  // Manifest Row 1
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.rect(margin, y, contentWidth, 8, 'FD');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(
    customCargo?.cargoDescription ||
      `Consignment of ${shipment.serviceType || 'Relocation Goods'} (Furniture, Electronics, Secure Containers)`,
    margin + 3,
    y + 5
  );
  doc.setFont('helvetica', 'normal');
  doc.text('Heavy-Duty Crates / Wrap', margin + 95, y + 5);
  doc.text('~1,850 kg / 42 CBM', margin + 130, y + 5);
  const declaredVal = customCargo?.declaredValuationNaira || 25000000;
  doc.setFont('helvetica', 'bold');
  doc.text(`₦${Number(declaredVal).toLocaleString('en-NG')}`, margin + 160, y + 5);

  y += 8;

  // Special Handling Notes
  doc.setFillColor(254, 252, 232); // amber-50
  doc.setDrawColor(254, 240, 138); // amber-200
  doc.rect(margin, y, contentWidth, 10, 'FD');
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(180, 83, 9);
  doc.text('SPECIAL HANDLING / ESCORT INSTRUCTIONS:', margin + 3, y + 4);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120, 53, 15);
  doc.text(
    customCargo?.specialInstructions ||
      'Fragile items crated with shock absorption layers. Dual armed highway escort on interstate corridor. Tamper seal must match at delivery.',
    margin + 3,
    y + 8
  );

  y += 14;

  // 6. INSURANCE & STATUTORY FREIGHT TERMS
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, contentWidth, 18, 1.5, 1.5, 'FD');

  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('4. FREIGHT CHARGES & GOODS-IN-TRANSIT (GIT) INSURANCE DECLARATION', margin + 3, y + 4.5);

  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(
    '• Freight Class: Pre-paid / Guaranteed Corporate Tariff under Pyda Master Relocation Agreement.',
    margin + 3,
    y + 8.5
  );
  doc.text(
    `• Underwritten Insurance: Covered up to ₦${Number(declaredVal).toLocaleString('en-NG')} via Leadway Assurance & AIICO Marine Underwriters.`,
    margin + 3,
    y + 12
  );
  doc.text(
    '• Limitation of Liability: Carrier acknowledges receipt of cargo in apparent good condition, subject to standard transit regulations.',
    margin + 3,
    y + 15.5
  );

  y += 22;

  // 7. SIGNATURE AND ACCEPTANCE BLOCKS
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('5. EXECUTION SIGNATURES & VERIFICATION ENDORSEMENT', margin, y + 3);

  y += 5;

  const sigBoxW = (contentWidth - 6) / 3;
  const sigBoxH = 26;

  // Shipper Signature Box
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, sigBoxW, sigBoxH, 1.5, 1.5, 'FD');
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('SHIPPER / CONSIGNOR CERTIFICATION', margin + 2.5, y + 4);
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text(currentUser.fullName || 'Chief Client', margin + 2.5, y + 10);
  doc.setFontSize(6);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(5, 150, 105);
  doc.text('✓ Signed & Loaded in Good Order', margin + 2.5, y + 16);
  doc.setTextColor(100, 116, 139);
  doc.text(`Timestamp: ${issueDate}`, margin + 2.5, y + 21);

  // Carrier Driver Signature Box
  const middleX = margin + sigBoxW + 3;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(middleX, y, sigBoxW, sigBoxH, 1.5, 1.5, 'FD');
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('CARRIER / LEAD DRIVER RECEIPT', middleX + 2.5, y + 4);
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text(shipment.driverName || 'Captain Bello (Pyda Fleet)', middleX + 2.5, y + 10);
  doc.setFontSize(6);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(5, 150, 105);
  doc.text(`✓ Tamper Seal Verified: ${customCargo?.tamperSeal || shipment.tamperSealCode || 'SEAL-99482'}`, middleX + 2.5, y + 16);
  doc.setTextColor(100, 116, 139);
  doc.text('Telemetry Monitored & Dispatched', middleX + 2.5, y + 21);

  // Consignee Delivery Signature Box
  const lastX = middleX + sigBoxW + 3;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(lastX, y, sigBoxW, sigBoxH, 1.5, 1.5, 'FD');
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('CONSIGNEE DELIVERY RECEIPT', lastX + 2.5, y + 4);
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text(customCargo?.consigneeName || 'Destination Site Receiver', lastX + 2.5, y + 10);
  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('Signature at Offload: _________________', lastX + 2.5, y + 16);
  doc.text('Date Received: ____ / ____ / 2026', lastX + 2.5, y + 21);

  y += sigBoxH + 4;

  // 8. SECURITY FOOTER & BARCODE STRIP
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y, pageWidth - margin, y);
  y += 3.5;

  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Official Straight Bill of Lading • Generated on Pyda Telematics Portal • Security Checksum: ${bolNumber}`,
    margin,
    y
  );
  doc.text('Page 1 of 1 • Valid for Federal Highway Inspection', pageWidth - margin - 58, y);

  // Download PDF
  doc.save(`${bolNumber}.pdf`);
  return bolNumber;
};

export const BillOfLadingModal: React.FC<BillOfLadingModalProps> = ({
  isOpen,
  onClose,
  shipment,
  currentUser,
  onSaveToVault,
}) => {
  const [consigneeName, setConsigneeName] = useState<string>(currentUser.fullName || 'Chief Client');
  const [consigneePhone, setConsigneePhone] = useState<string>(currentUser.phone || '+234 803 555 0192');
  const [declaredValue, setDeclaredValue] = useState<number>(25000000);
  const [cargoDesc, setCargoDesc] = useState<string>(
    shipment ? `High-Value ${shipment.serviceType || 'Corporate Relocation'} Consignment & Secure Fragile Freight` : 'Household Goods & Office Assets'
  );
  const [specialNotes, setSpecialNotes] = useState<string>(
    'Fragile cargo crated with shock absorption. Tamper seal verified prior to highway departure.'
  );
  const [tamperSealCode, setTamperSealCode] = useState<string>(
    shipment?.tamperSealCode || 'MGT-SEAL-99482'
  );
  const [isSavedInVault, setIsSavedInVault] = useState<boolean>(false);
  const [showEditForm, setShowEditForm] = useState<boolean>(false);

  if (!isOpen || !shipment) return null;

  const bolRef = `BOL-MGT-${shipment.trackingId.replace(/[^A-Za-z0-9]/g, '')}-2026`;
  const issueDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const handleDownloadPdf = () => {
    generateBillOfLadingPdf(shipment, currentUser, {
      declaredValuationNaira: declaredValue,
      consigneeName,
      consigneePhone,
      cargoDescription: cargoDesc,
      specialInstructions: specialNotes,
      tamperSeal: tamperSealCode,
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSaveToDocumentVault = () => {
    const newDoc: VaultDocument = {
      id: `DOC-BOL-${Date.now()}`,
      title: `Official Bill of Lading (BOL) - ${shipment.trackingId}`,
      docType: 'waybill_manifest',
      referenceNumber: bolRef,
      issuedDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'active',
      fileSize: '520 KB',
      underwriterOrIssuer: 'Pyda Movers & Logistics Ltd',
      coverageAmountNaira: declaredValue,
      originCity: shipment.origin,
      destinationCity: shipment.destination,
      signatories: [
        `Carrier: ${shipment.driverName || 'Captain Bello'}`,
        `Shipper: ${currentUser.fullName}`,
      ],
      summaryText: `Official Straight Bill of Lading for consignment #${shipment.trackingId} from ${shipment.origin} to ${shipment.destination}. Carrier Plate: ${shipment.vehiclePlate || 'KJA-892-XY'}, Tamper Seal: ${tamperSealCode}.`,
      verifiedStampCode: `MGT-BOL-STAMP-${Math.floor(1000 + Math.random() * 9000)}`,
      tags: ['Bill of Lading', 'Waybill', 'Highway Transit', 'Verified'],
    };

    if (onSaveToVault) {
      onSaveToVault(newDoc);
      setIsSavedInVault(true);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in"
      id="bill-of-lading-modal"
    >
      <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* MODAL ACTION BAR */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between gap-3 bg-slate-950/90 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">Official Bill of Lading (BOL)</h3>
                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Ready for Print / PDF
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Consignment #{shipment.trackingId} • Ref: <span className="font-mono text-amber-400">{bolRef}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowEditForm(!showEditForm)}
              className="p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-xl transition-colors text-xs font-bold flex items-center gap-1.5"
              title="Customize Cargo Details"
            >
              <PenTool className="w-4 h-4" />
              <span className="hidden sm:inline">{showEditForm ? 'Hide Editor' : 'Edit Details'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
              title="Print Document"
              id="bol-modal-print-btn"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
              aria-label="Close modal"
              id="bol-modal-close-btn"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* CUSTOMIZATION DRAWER (OPTIONAL) */}
        {showEditForm && (
          <div className="p-4 bg-slate-950/70 border-b border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs shrink-0">
            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">Consignee (Receiver) Name</label>
              <input
                type="text"
                value={consigneeName}
                onChange={(e) => setConsigneeName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">Consignee Phone</label>
              <input
                type="text"
                value={consigneePhone}
                onChange={(e) => setConsigneePhone(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">Declared Cargo Value (₦)</label>
              <input
                type="number"
                value={declaredValue}
                onChange={(e) => setDeclaredValue(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2.5 outline-none focus:border-amber-400"
              />
            </div>
          </div>
        )}

        {/* DOCUMENT PREVIEW CONTAINER (SCROLLABLE & PRINTABLE) */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-950/40 space-y-6 print:p-0 print:bg-white print:text-black">
          {/* THE PAPER SHEET PREVIEW */}
          <div
            className="bg-white text-slate-900 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 max-w-3xl mx-auto space-y-6 font-sans text-xs print:border-none print:shadow-none print:max-w-none print:w-full"
            id="printable-bill-of-lading"
          >
            {/* 1. DOCUMENT HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b-2 border-slate-900 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black text-sm">
                    M
                  </div>
                  <div>
                    <h1 className="text-base sm:text-lg font-black text-slate-950 tracking-tight leading-tight">
                      PYDA MOVERS & LOGISTICS LTD
                    </h1>
                    <p className="text-[10px] text-slate-500 font-medium">
                      RC: 1498210 • Federal Ministry of Works & Housing Reg: FMWH/RL-0892
                    </p>
                  </div>
                </div>
                <p className="text-[10px] text-slate-600 mt-1">
                  14B Admiralty Way, Lekki Phase 1, Lagos | Toll-Free: 0806 246 6212 | dispatch@pyda.ng
                </p>
              </div>

              <div className="text-left sm:text-right bg-slate-100 p-2.5 rounded-xl border border-slate-200 shrink-0">
                <span className="text-[10px] font-black uppercase text-amber-700 block tracking-wider">
                  STRAIGHT BILL OF LADING
                </span>
                <span className="text-[9px] text-slate-500 font-bold block">NON-NEGOTIABLE WAYBILL</span>
                <span className="font-mono text-xs font-black text-slate-900 block mt-0.5">{bolRef}</span>
              </div>
            </div>

            {/* 2. META BAR */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px]">
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Tracking / Manifest #</span>
                <span className="font-mono font-bold text-slate-900">{shipment.trackingId}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Issue Date</span>
                <span className="font-bold text-slate-900">{issueDate}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Tamper Seal Code</span>
                <span className="font-mono font-bold text-emerald-700">{tamperSealCode}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Transit Status</span>
                <span className="font-bold text-amber-700">{shipment.status}</span>
              </div>
            </div>

            {/* 3. SHIPPER & CONSIGNEE DETAILS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Shipper (Origin) */}
              <div className="border border-slate-200 rounded-xl p-3.5 space-y-1.5 bg-slate-50/50">
                <div className="flex items-center gap-1.5 text-xs font-black text-slate-900 border-b border-slate-200 pb-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-600" />
                  <span>1. SHIPPER / CONSIGNOR (ORIGIN)</span>
                </div>
                <div className="text-[11px] space-y-0.5 pt-1">
                  <p className="font-bold text-slate-900">{currentUser.fullName}</p>
                  {currentUser.companyName && <p className="text-slate-600">{currentUser.companyName}</p>}
                  <p className="text-slate-700">
                    <strong>Origin Hub:</strong> {shipment.origin}
                  </p>
                  <p className="text-slate-600">
                    <strong>Contact Phone:</strong> {currentUser.phone || '+234 803 555 0192'}
                  </p>
                  <p className="text-slate-600">
                    <strong>Email:</strong> {currentUser.email}
                  </p>
                </div>
              </div>

              {/* Consignee (Destination) */}
              <div className="border border-slate-200 rounded-xl p-3.5 space-y-1.5 bg-slate-50/50">
                <div className="flex items-center gap-1.5 text-xs font-black text-slate-900 border-b border-slate-200 pb-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>2. CONSIGNEE / RECEIVER (DESTINATION)</span>
                </div>
                <div className="text-[11px] space-y-0.5 pt-1">
                  <p className="font-bold text-slate-900">{consigneeName}</p>
                  <p className="text-slate-700">
                    <strong>Destination City:</strong> {shipment.destination}
                  </p>
                  <p className="text-slate-600">
                    <strong>Receiver Phone:</strong> {consigneePhone}
                  </p>
                  <p className="text-slate-600">
                    <strong>Delivery Window / ETA:</strong> {shipment.estimatedArrival}
                  </p>
                  <p className="text-emerald-700 font-medium">Offloading & Inside Delivery Included</p>
                </div>
              </div>
            </div>

            {/* 4. CARRIER VEHICLE & TELEMATICS */}
            <div className="border border-slate-200 rounded-xl p-3.5 space-y-2 bg-slate-50/50">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1 text-xs font-black text-slate-900">
                <span className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-slate-700" />
                  <span>3. CARRIER & CONVOY TELEMATICS</span>
                </span>
                <span className="text-[10px] text-emerald-700 font-bold">24/7 Live GPS Monitored</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block">Vehicle Plate</span>
                  <span className="font-mono font-bold text-slate-900">{shipment.vehiclePlate || 'KJA-892-XY'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block">Convoy Type</span>
                  <span className="font-bold text-slate-800">{shipment.vehicleType || 'Heavy-Duty Hauler'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block">Lead Driver</span>
                  <span className="font-bold text-slate-800">{shipment.driverName || 'Captain Bello'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block">Cargo Temp</span>
                  <span className="font-bold text-slate-800">{shipment.cargoTempCelsius || 24}°C (Weather-Sealed)</span>
                </div>
              </div>
            </div>

            {/* 5. CARGO MANIFEST & VALUATION */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-black text-slate-900">
                <span>4. CARGO MANIFEST & DESCRIPTION OF GOODS</span>
                <span className="text-[10px] text-slate-500">Subject to standard carriage tariff</span>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-[10px]">
                    <tr>
                      <th className="p-2.5">Item / Manifest Description</th>
                      <th className="p-2.5">Packaging</th>
                      <th className="p-2.5">Weight / CBM</th>
                      <th className="p-2.5 text-right">Declared Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-2.5 font-medium text-slate-900">{cargoDesc}</td>
                      <td className="p-2.5 text-slate-600">Reinforced Crates / Protective Wrap</td>
                      <td className="p-2.5 font-mono text-slate-700">~1,850 kg (42 CBM)</td>
                      <td className="p-2.5 text-right font-black text-amber-700 font-mono">
                        ₦{Number(declaredValue).toLocaleString('en-NG')}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[10px] text-amber-900 space-y-0.5">
                <span className="font-bold block">Handling & Transit Directives:</span>
                <p>{specialNotes}</p>
              </div>
            </div>

            {/* 6. INSURANCE UNDERWRITING STATEMENT */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[10px] text-slate-600 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Goods-In-Transit (GIT) Comprehensive Insurance Warranty</span>
              </div>
              <p>
                Cargo is fully indemnified up to the declared valuation of{' '}
                <strong className="text-slate-900">₦{Number(declaredValue).toLocaleString('en-NG')}</strong> under
                Pyda Master Cargo Policy #NIA-GIT-POL-84920 issued by Leadway Assurance & AIICO Consortium.
              </p>
            </div>

            {/* 7. SIGNATURE BLOCKS */}
            <div className="pt-2">
              <span className="text-xs font-black text-slate-900 block mb-2">5. FORMAL EXECUTION & ACCEPTANCE</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50 space-y-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Shipper Certification</span>
                  <div className="h-8 flex items-end">
                    <span className="text-xs font-serif italic text-emerald-800 font-bold">{currentUser.fullName}</span>
                  </div>
                  <div className="border-t border-slate-300 pt-1 text-[9px] text-slate-500">
                    <p>✓ Certified loaded in good order</p>
                    <p>{issueDate}</p>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50 space-y-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Carrier Driver Receipt</span>
                  <div className="h-8 flex items-end">
                    <span className="text-xs font-serif italic text-slate-800 font-bold">{shipment.driverName || 'Captain Bello'}</span>
                  </div>
                  <div className="border-t border-slate-300 pt-1 text-[9px] text-slate-500">
                    <p>✓ Seal #{tamperSealCode}</p>
                    <p>Pyda Fleet Dispatch</p>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50 space-y-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Consignee Delivery</span>
                  <div className="h-8 flex items-end">
                    <span className="text-[10px] text-slate-400 italic">Signature on Site</span>
                  </div>
                  <div className="border-t border-slate-300 pt-1 text-[9px] text-slate-500">
                    <p>Date: ____ / ____ / 2026</p>
                    <p>Inspection at destination</p>
                  </div>
                </div>
              </div>
            </div>

            {/* FOOTER BARCODE */}
            <div className="border-t border-slate-200 pt-3 flex flex-col sm:flex-row items-center justify-between text-[9px] text-slate-400 gap-2">
              <div className="flex items-center gap-2">
                <Barcode className="w-8 h-4 text-slate-700" />
                <span>Security Stamp: MGT-SECURE-{shipment.trackingId}-VERIFIED</span>
              </div>
              <span>Compliant with Federal Road Safety Corps (FRSC) Highway Directives</span>
            </div>
          </div>
        </div>

        {/* MODAL FOOTER ACTIONS */}
        <div className="p-4 sm:p-5 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950/90 shrink-0">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Ready for Federal Highway Checkpoints & Insurance Audits</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleSaveToDocumentVault}
              disabled={isSavedInVault}
              className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all border ${
                isSavedInVault
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 cursor-default'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
              }`}
              id="bol-save-to-vault-btn"
            >
              {isSavedInVault ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Saved to Vault ✓</span>
                </>
              ) : (
                <>
                  <FolderLock className="w-4 h-4 text-amber-400" />
                  <span>Save to Document Vault</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              className="flex-1 sm:flex-none bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-98"
              id="bol-download-pdf-btn"
            >
              <Download className="w-4 h-4" />
              <span>Download Official PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
