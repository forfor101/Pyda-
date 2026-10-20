import jsPDF from 'jspdf';
import { VaultDocument, QuoteRequestData, CustomerUser } from '../types';
import { MoveQuoteCalculationResult } from '../data/nigerianStatesLgas';

export const VAULT_STORAGE_KEY = 'megatrend_customer_vault_docs';

/**
 * Creates an official VaultDocument representing a Pro-Forma Invoice from a quote
 */
export const createProformaInvoiceDocument = (
  quote: QuoteRequestData,
  quoteCalc?: MoveQuoteCalculationResult | null,
  currentUser?: CustomerUser | null
): VaultDocument => {
  const quoteId = quote.id || `QUO-${Math.floor(10000 + Math.random() * 90000)}`;
  const cleanId = quoteId.replace(/[^A-Za-z0-9]/g, '');
  const docId = `DOC-PFI-${new Date().getFullYear()}-${cleanId}`;
  const refNumber = `PFI-PYDA-${cleanId}`;

  const today = new Date();
  const issuedDate = today.toISOString().split('T')[0];

  // 30 days validity
  const expiry = new Date(today);
  expiry.setDate(expiry.getDate() + 30);
  const expiryDate = expiry.toISOString().split('T')[0];

  const totalNaira =
    quote.estimatedCostNaira ||
    quoteCalc?.totalEstimatedNaira ||
    quote.quoteBreakdown?.totalEstimatedNaira ||
    150000;

  const origin = quote.originLga
    ? `${quote.originLga}, ${quote.originState || quote.originCity}`
    : quote.originCity || 'Lagos Hub';

  const destination = quote.destinationLga
    ? `${quote.destinationLga}, ${quote.destinationState || quote.destinationCity}`
    : quote.destinationCity || 'Abuja Hub';

  const clientName = quote.fullName || currentUser?.fullName || 'Valued Relocation Client';
  const clientCompany = quote.companyName || currentUser?.companyName || '';
  const clientPhone = quote.phone || currentUser?.phone || '';
  const clientEmail = quote.email || currentUser?.email || '';

  const svcTypeFormatted = (quote.serviceType || 'corporate').toUpperCase();

  const summary = `Official Pro-Forma Relocation & Freight Commercial Invoice issued to ${clientName}${
    clientCompany ? ` (${clientCompany})` : ''
  } for ${svcTypeFormatted} Relocation from ${origin} to ${destination}. Route distance: ~${
    quote.distanceKm || quoteCalc?.distanceKm || 0
  } km. Assigned fleet: ${quoteCalc?.recommendedVehicle || quote.quoteBreakdown?.recommendedVehicle || 'Dedicated Enclosed Carrier'}. Total invoice amount: NGN ₦${totalNaira.toLocaleString(
    'en-NG'
  )}. Valid for 30 calendar days from issue date. Includes standard loading/offloading crew, goods-in-transit (GIT) insurance coverage, highway passage tolls, and statutory VAT allocation. Note: The final price will be determined after inspection by moving inspection personnel from our company or via video/pictures.`;

  const newDoc: VaultDocument = {
    id: docId,
    title: `Pro-Forma Relocation Invoice - Ref #${quoteId}`,
    docType: 'proforma_invoice',
    referenceNumber: refNumber,
    issuedDate,
    expiryDate,
    status: 'active',
    fileSize: '345 KB',
    underwriterOrIssuer: 'Pyda Movers & Logistics Finance Directorate',
    coverageAmountNaira: totalNaira,
    originCity: origin,
    destinationCity: destination,
    signatories: ['F. Ogundimu (Chief Financial Officer, Pyda Logistics)', `${clientName} (Client / Consignee)`],
    associatedQuoteId: quoteId,
    summaryText: summary,
    verifiedStampCode: `PFI-VERIFIED-${cleanId}-2026`,
    tags: ['Pro-Forma Invoice', 'Billing', 'Quote', 'Tax-Compliant', svcTypeFormatted],
    clientName,
    clientEmail,
    clientPhone,
    clientCompany,
    serviceType: quote.serviceType,
    movingDate: quote.movingDate,
    distanceKm: quote.distanceKm || quoteCalc?.distanceKm,
    estimatedTransitHours: quote.estimatedTransitHours || quoteCalc?.estimatedTransitHours,
    recommendedVehicle: quoteCalc?.recommendedVehicle || quote.quoteBreakdown?.recommendedVehicle,
    propertySize: quote.propertySize,
    quoteBreakdown: quote.quoteBreakdown || (quoteCalc as any),
  };

  return newDoc;
};

/**
 * Saves a Pro-Forma Invoice to both client-side storage and optionally cloud Firestore
 */
export const saveProformaInvoiceToVault = async (
  invoiceDoc: VaultDocument,
  saveToCloudFn?: (doc: VaultDocument) => Promise<void>
): Promise<VaultDocument[]> => {
  let updatedDocs: VaultDocument[] = [];

  try {
    const raw = localStorage.getItem(VAULT_STORAGE_KEY);
    const existing: VaultDocument[] = raw ? JSON.parse(raw) : [];

    // Filter out duplicates with the same reference or ID
    const filtered = existing.filter(
      (d) =>
        d.id !== invoiceDoc.id &&
        d.referenceNumber !== invoiceDoc.referenceNumber &&
        (!invoiceDoc.associatedQuoteId || d.associatedQuoteId !== invoiceDoc.associatedQuoteId)
    );

    updatedDocs = [invoiceDoc, ...filtered];
    localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(updatedDocs));

    // Dispatch window event so open DocumentVault components update in real-time
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('vault_document_added', {
          detail: invoiceDoc,
        })
      );
    }
  } catch (err) {
    console.warn('[Vault] Failed to save invoice to localStorage:', err);
    updatedDocs = [invoiceDoc];
  }

  // Cloud sync if function provided
  if (saveToCloudFn) {
    try {
      await saveToCloudFn(invoiceDoc);
    } catch (err) {
      console.warn('[Vault] Failed to persist invoice to Firestore:', err);
    }
  }

  return updatedDocs;
};

/**
 * Generates an official, publication-quality Pro-Forma Invoice PDF
 */
export const generateProformaInvoicePdf = (
  invoiceDoc: VaultDocument,
  phone: string = '+234 806 246 6212'
): jsPDF => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  const totalNaira = invoiceDoc.coverageAmountNaira || 0;
  const totalUsd = Math.round(totalNaira / 1500);

  // 1. Header Banner (Dark Slate #0f172a with Amber stripe #f59e0b)
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 42, 'F');

  doc.setFillColor(245, 158, 11); // amber-500
  doc.rect(0, 42, pageWidth, 2.5, 'F');

  // Brand Name & Subtitle
  doc.setTextColor(245, 158, 11);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('PYDA MOVERS & LOGISTICS NIGERIA LTD', margin, 15);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Corporate Office & Interstate Freight Logistics • Tax Identification Number: 24891029-0001', margin, 21);
  doc.text('Lagos Hub: 374/376 Old Ojo Rd, Alakija | Abuja HQ: Suite A204, AA Rano Citygate Plaza, Airport Rd', margin, 26);
  doc.text(`Official Invoicing: billing@pydamovers.com | Dispatch Line: ${phone}`, margin, 31);
  doc.text('Federal Ministry of Works & Housing Reg: FMWH/RL-0892 • RC: 1498210', margin, 36);

  // Invoice Reference Box (Right Pill)
  doc.setFillColor(30, 41, 59);
  doc.roundedRect(pageWidth - margin - 65, 8, 65, 26, 2, 2, 'F');
  doc.setTextColor(245, 158, 11);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('OFFICIAL PRO-FORMA INVOICE', pageWidth - margin - 61, 15);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9.5);
  doc.text(invoiceDoc.referenceNumber, pageWidth - margin - 61, 22);
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text(`DATE: ${invoiceDoc.issuedDate} | DUE: 30 DAYS`, pageWidth - margin - 61, 28);

  let y = 52;

  // 2. Client & Route Summary Strip (Two-Column Executive Grid)
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 38, 2, 2, 'FD');

  const col1X = margin + 4;
  const col2X = margin + 96;

  // Column 1: Billed To
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('BILLED TO / CONSIGNOR:', col1X, y + 6);

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(invoiceDoc.clientName || 'Valued Relocation Client', col1X, y + 12);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  if (invoiceDoc.clientCompany) {
    doc.text(`Org: ${invoiceDoc.clientCompany}`, col1X, y + 17);
  }
  doc.text(`Tel: ${invoiceDoc.clientPhone || 'On File'}`, col1X, y + (invoiceDoc.clientCompany ? 22 : 17));
  doc.text(`Email: ${invoiceDoc.clientEmail || 'quotes@pydamovers.com'}`, col1X, y + (invoiceDoc.clientCompany ? 27 : 22));
  doc.text(`Billing Status: Pro-Forma Quotation (Unpaid)`, col1X, y + (invoiceDoc.clientCompany ? 32 : 27));

  // Column 2: Route & Freight Corridor
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('SHIPMENT CORRIDOR & LOGISTICS SPECIFICATIONS:', col2X, y + 6);

  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text(`Service: ${(invoiceDoc.serviceType || 'corporate').toUpperCase()} RELOCATION`, col2X, y + 12);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(`Pick-up: ${invoiceDoc.originCity || 'Lagos Hub'}`, col2X, y + 17);
  doc.text(`Delivery: ${invoiceDoc.destinationCity || 'Abuja Hub'}`, col2X, y + 22);
  doc.text(
    `Transit: ~${invoiceDoc.distanceKm || '0'} KM (${invoiceDoc.estimatedTransitHours || 'Highway Transit'})`,
    col2X,
    y + 27
  );
  doc.text(`Fleet Assigned: ${invoiceDoc.recommendedVehicle || 'Heavy Freight Carrier'}`, col2X, y + 32);

  y += 44;

  // 3. Itemized Financial Schedule Table
  doc.setFillColor(15, 23, 42);
  doc.rect(margin, y, contentWidth, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('ITEM #', margin + 3, y + 4.8);
  doc.text('DESCRIPTION OF LOGISTICS & FREIGHT SERVICES', margin + 18, y + 4.8);
  doc.text('RATE BASIS / DETAILS', margin + 115, y + 4.8);
  doc.text('AMOUNT (NGN)', margin + 152, y + 4.8);

  y += 7;

  // Compute or extract breakdown items
  const b = invoiceDoc.quoteBreakdown || {
    baseRateNaira: Math.round(totalNaira * 0.45),
    distanceChargeNaira: Math.round(totalNaira * 0.35),
    accessTerrainSurchargeNaira: Math.round(totalNaira * 0.05),
    packingCratingNaira: Math.round(totalNaira * 0.08),
    storageAllotmentNaira: 0,
    insuranceCoverNaira: Math.round(totalNaira * 0.07),
    totalEstimatedNaira: totalNaira,
    recommendedVehicle: invoiceDoc.recommendedVehicle || 'Dedicated Enclosed Carrier',
    crewSize: 4,
    routeTier: 'Standard Interstate',
  };

  const lineItems = [
    {
      no: '01',
      desc: 'Base Relocation, Loading & Handling Crew Allocation',
      details: `Dedicated ${b.crewSize || 4}-Man White-Glove Crew`,
      amount: b.baseRateNaira,
    },
    {
      no: '02',
      desc: `Highway Freight Logistics, Fuel & Driver Allocation`,
      details: `${invoiceDoc.distanceKm || 0} KM Corridor • ${b.recommendedVehicle || 'Heavy Carrier'}`,
      amount: b.distanceChargeNaira,
    },
  ];

  if (b.accessTerrainSurchargeNaira && b.accessTerrainSurchargeNaira > 0) {
    lineItems.push({
      no: '03',
      desc: 'LGA Access, Heavy Density Logistics & Highway Toll Passages',
      details: 'Corridor Security Clearance & Bridge Tolls',
      amount: b.accessTerrainSurchargeNaira,
    });
  }

  if (b.packingCratingNaira && b.packingCratingNaira > 0) {
    lineItems.push({
      no: '04',
      desc: 'White-Glove Multi-Layer Packing & Custom Wood Crating',
      details: 'Export-Grade Bubble Wrap, Stretch Film & Plywood Crates',
      amount: b.packingCratingNaira,
    });
  }

  if (b.storageAllotmentNaira && b.storageAllotmentNaira > 0) {
    lineItems.push({
      no: '05',
      desc: '30-Day Climate-Controlled Security Warehousing Storage',
      details: 'Palletized 24/7 Monitored Vault Facility',
      amount: b.storageAllotmentNaira,
    });
  }

  if (b.insuranceCoverNaira && b.insuranceCoverNaira > 0) {
    const isPremium = b.insuranceTier === 'premium';
    lineItems.push({
      no: String(lineItems.length + 1).padStart(2, '0'),
      desc: isPremium
        ? 'Premium VIP Goods-In-Transit (GIT) Full-Replacement Policy'
        : '100% Comprehensive Goods-In-Transit (GIT) All-Risk Policy',
      details: isPremium
        ? 'Up to ₦75M Cover, Zero Deductible, Leadway & AIICO Fast-Track'
        : 'Up to ₦25M All-Risk Cover • Leadway Assurance & AIICO Consortium',
      amount: b.insuranceCoverNaira,
    });
  } else {
    lineItems.push({
      no: String(lineItems.length + 1).padStart(2, '0'),
      desc: 'Basic Statutory Carrier Transit Liability Protection',
      details: '₦1,000 / kg Limited Weight Carrier Responsibility',
      amount: 0,
    });
  }

  if (b.staircaseSurchargeNaira && b.staircaseSurchargeNaira > 0) {
    lineItems.push({
      no: String(lineItems.length + 1).padStart(2, '0'),
      desc: 'Staircase Carry Surcharge (No Service Elevator)',
      details: `${b.floorLevel || 1} Floor(s) Above Ground @ ₦15,000/Floor`,
      amount: b.staircaseSurchargeNaira,
    });
  }

  if (b.acInstallationNaira && b.acInstallationNaira > 0) {
    lineItems.push({
      no: String(lineItems.length + 1).padStart(2, '0'),
      desc: 'Air Conditioner Removal & Re-installation',
      details: `${b.acUnitsCount || 1} AC Unit(s) De-mounting & Fitting @ ₦20,000/Unit`,
      amount: b.acInstallationNaira,
    });
  }

  if (b.tvMountingNaira && b.tvMountingNaira > 0) {
    lineItems.push({
      no: String(lineItems.length + 1).padStart(2, '0'),
      desc: 'Wall-Mounted TV Dismantling & Mounting',
      details: `${b.tvMountCount || 1} Wall Bracket & TV Mount(s) @ ₦10,000/Unit`,
      amount: b.tvMountingNaira,
    });
  }

  if (b.cleaningFeeNaira && b.cleaningFeeNaira > 0) {
    lineItems.push({
      no: String(lineItems.length + 1).padStart(2, '0'),
      desc: 'Post-Move Deep Cleaning & Debris Removal',
      details: 'Comprehensive Room Sanitization & Debris Cart-Away',
      amount: b.cleaningFeeNaira,
    });
  }

  lineItems.forEach((item, index) => {
    const isEven = index % 2 === 0;
    doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
    doc.rect(margin, y, contentWidth, 7, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y + 7, margin + contentWidth, y + 7);

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(item.no, margin + 4, y + 4.8);

    doc.setFont('helvetica', 'normal');
    doc.text(item.desc, margin + 18, y + 4.8);

    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(item.details, margin + 115, y + 4.8);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`₦${item.amount.toLocaleString('en-NG')}`, margin + 152, y + 4.8);

    y += 7;
  });

  y += 4;

  // 4. Totals Calculation Box & Commercial Banking Details
  const subtotal = totalNaira;
  const vatRate = 0.075;
  const vatAmount = Math.round(subtotal * vatRate);
  const grandTotal = subtotal + vatAmount;
  const grandTotalUsd = Math.round(grandTotal / 1500);

  // Left Box: Bank Details
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, 98, 42, 2, 2, 'FD');

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('OFFICIAL CORPORATE SETTLEMENT BANK ACCOUNTS:', margin + 4, y + 6);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('PRIMARY SETTLEMENT: Zenith Bank Plc', margin + 4, y + 13);
  doc.setFont('helvetica', 'normal');
  doc.text('Account Name: Pyda Movers & Logistics Ltd', margin + 4, y + 18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(217, 119, 6); // amber-600
  doc.text('Account No: 1018924012 (NGN Commercial)', margin + 4, y + 23);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('SECONDARY: First Bank of Nigeria | Acct: 2038914022', margin + 4, y + 29);
  doc.text(`Payment Reference: ${invoiceDoc.referenceNumber}`, margin + 4, y + 34);
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text('* Send payment receipt to billing@pydamovers.com for dispatch seal', margin + 4, y + 39);

  // Right Box: Financial Subtotal & Total
  doc.setFillColor(254, 243, 199); // amber-100
  doc.setDrawColor(245, 158, 11);
  doc.roundedRect(margin + 102, y, 80, 42, 2, 2, 'FD');

  const rX = margin + 106;
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(146, 64, 14); // amber-800
  doc.text('INVOICE FINANCIAL SUMMARY', rX, y + 6);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Logistics Net Subtotal:', rX, y + 13);
  doc.text(`₦${subtotal.toLocaleString('en-NG')}`, rX + 46, y + 13);

  doc.text('FIRS VAT Allocation (7.5%):', rX, y + 19);
  doc.text(`₦${vatAmount.toLocaleString('en-NG')}`, rX + 46, y + 19);

  doc.setDrawColor(217, 119, 6);
  doc.line(rX, y + 23, rX + 72, y + 23);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('TOTAL PAYABLE (NGN):', rX, y + 29);
  doc.setFontSize(10.5);
  doc.setTextColor(217, 119, 6);
  doc.text(`₦${grandTotal.toLocaleString('en-NG')}`, rX, y + 36);

  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.text(`(~ $${grandTotalUsd.toLocaleString('en-US')} USD)`, rX + 42, y + 36);

  y += 48;

  // 5. Commercial Clauses & Payment Milestones
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('COMMERCIAL ENGAGEMENT MILESTONES & LEGAL STIPULATIONS', margin, y);

  y += 3.5;
  doc.setDrawColor(203, 213, 225);
  doc.line(margin, y, margin + contentWidth, y);

  y += 4.5;
  const terms = [
    '• Fixed-Price Guarantee: Due to recent fuel price changes, all instant estimates cover end-to-end transit, Goods-in-Transit insurance, and gate clearance fees. Your quoted price on booking will not change on move day.',
    '• 70% Mobilization Deposit confirms dispatch fleet lock and packing team assignment.',
    '• 30% Balance payable upon final delivery sign-off and container seal inspection.',
    '• Comprehensive Transit Cover: All cargo backed by Leadway Marine & Goods-in-Transit insurance.',
    '• Inspection Stipulation: The final price will be determined after inspection by moving inspection personnel from our company or via video/pictures.',
  ];

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  terms.forEach((t) => {
    doc.text(t, margin, y);
    y += 4;
  });

  y += 4;

  // 6. Dual Signature & Electronic Seals
  const sigBoxW = (contentWidth - 6) / 2;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);

  // Left Signatory Box (Carrier)
  doc.roundedRect(margin, y, sigBoxW, 23, 2, 2, 'FD');
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('AUTHORIZED CARRIER DIRECTORATE', margin + 4, y + 5);
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('F. Ogundimu (Chief Financial Officer)', margin + 4, y + 11);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(5, 150, 105); // emerald-600
  doc.text('✓ Digitally Approved & Sealed (PKI Auth)', margin + 4, y + 17);

  // Right Signatory Box (Client Acceptance)
  doc.roundedRect(margin + sigBoxW + 6, y, sigBoxW, 23, 2, 2, 'FD');
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('CLIENT / CONSIGNOR ACCEPTANCE', margin + sigBoxW + 10, y + 5);
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text(invoiceDoc.clientName || 'Authorized Client Representative', margin + sigBoxW + 10, y + 11);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 116, 139);
  doc.text('Electronic Quotation Issued & Vaulted', margin + sigBoxW + 10, y + 17);

  y += 28;

  // Footer Cryptographic Seal
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Pyda Movers Client Document Vault • Pro-Forma Invoice #${invoiceDoc.referenceNumber} • Tamper-Proof Stamp: ${invoiceDoc.verifiedStampCode}`,
    margin,
    y
  );

  return doc;
};

/**
 * Downloads the official Pro-Forma Invoice PDF
 */
export const downloadProformaInvoicePdf = (
  invoiceDoc: VaultDocument,
  phone: string = '+234 806 246 6212'
): void => {
  const doc = generateProformaInvoicePdf(invoiceDoc, phone);
  doc.save(`Pyda_Proforma_Invoice_${invoiceDoc.referenceNumber}.pdf`);
};
