import jsPDF from 'jspdf';
import { VaultDocument, CarHireBookingData, CustomerUser } from '../types';

export const VAULT_STORAGE_KEY = 'megatrend_customer_vault_docs';

/**
 * Creates an official VaultDocument representing a Car Hire Pro-Forma Invoice or Paid Receipt
 */
export const createCarHireVaultDocument = (
  booking: CarHireBookingData,
  isReceipt: boolean = false,
  currentUser?: CustomerUser | null
): VaultDocument => {
  const isInterState = booking.tripType === 'inter_state';
  const prefix = isReceipt ? 'CHR' : 'CHI';
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  const cleanNum = booking.invoiceOrReceiptNumber || `${prefix}-PYDA-${new Date().getFullYear()}-${randomSuffix}`;
  const docId = `DOC-${cleanNum.replace(/[^A-Za-z0-9]/g, '')}`;
  const today = new Date().toISOString().split('T')[0];

  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 30);
  const expiryDate = expiry.toISOString().split('T')[0];

  const clientName = booking.clientName || currentUser?.fullName || 'Valued Corporate Client';
  const clientCompany = booking.clientCompany || currentUser?.companyName || '';
  const clientPhone = booking.clientPhone || currentUser?.phone || '';
  const clientEmail = booking.clientEmail || currentUser?.email || '';

  const docTitle = isReceipt
    ? `Official ${isInterState ? 'Inter-State' : 'Intra-State'} Car Hire Tax Clearance Receipt - Ref #${cleanNum}`
    : `Pro-Forma ${isInterState ? 'Inter-State' : 'Intra-State'} Car Hire Commercial Invoice - Ref #${cleanNum}`;

  const summary = isReceipt
    ? `Official Settled Tax Clearance Receipt for ${booking.totalDays}-Day ${
        isInterState ? 'Inter-State Highway Transit' : 'Intra-State Metropolitan'
      } Chauffeur Charter issued to ${clientName}${clientCompany ? ` (${clientCompany})` : ''}. Vehicle: ${
        booking.vehicleName
      } (${booking.vehiclePlateNumber}). Route: ${booking.originCity} to ${booking.destinationCity}. Chauffeur: ${
        booking.chauffeurName
      }. Total Paid: NGN ₦${booking.totalAmountNaira.toLocaleString('en-NG')} (VAT 7.5% settled). Payment Ref: ${
        booking.paymentReference || 'NIP-CBN-SETTLED'
      }. Official FIRS tax verification confirmed.`
    : `Official Pro-Forma Commercial Quotation & Invoice for ${booking.totalDays}-Day ${
        isInterState ? 'Inter-State Highway Corridor' : 'Intra-State City'
      } Executive Chauffeur Charter issued to ${clientName}${clientCompany ? ` (${clientCompany})` : ''}. Vehicle: ${
        booking.vehicleName
      } (${booking.vehiclePlateNumber}). Route: ${booking.originCity} to ${booking.destinationCity}. Total Amount: NGN ₦${booking.totalAmountNaira.toLocaleString(
        'en-NG'
      )} (Includes 7.5% FIRS VAT, highway tolls, and professional driver allowance). Valid for 30 calendar days.`;

  const newDoc: VaultDocument = {
    id: docId,
    title: docTitle,
    docType: isReceipt ? 'car_hire_receipt' : 'car_hire_invoice',
    referenceNumber: cleanNum,
    issuedDate: booking.issueDate || today,
    expiryDate: isReceipt ? undefined : expiryDate,
    status: isReceipt ? 'settled' : 'active',
    fileSize: '375 KB',
    underwriterOrIssuer: isReceipt
      ? 'Pyda Finance & Treasury Directorate (FIRS Authorized)'
      : 'Pyda Executive Fleet & Logistics Directorate',
    coverageAmountNaira: booking.totalAmountNaira,
    originCity: booking.originCity,
    destinationCity: booking.destinationCity,
    signatories: isReceipt
      ? [
          'F. Ogundimu (Chief Financial Officer, Pyda Logistics)',
          `${booking.chauffeurName} (Assigned Chauffeur / Custodian)`,
          `${clientName} (Hirer / Payer)`
        ]
      : [
          'Alhaji M. Belgore (Fleet Operations Director)',
          `${clientName} (Hirer / Acceptance Representative)`
        ],
    summaryText: summary,
    verifiedStampCode: `PKI-${prefix}-SEAL-${new Date().getFullYear()}-${randomSuffix}`,
    tags: [
      'Car Hire',
      isInterState ? 'Inter-State' : 'Intra-State',
      isReceipt ? 'Receipt' : 'Invoice',
      isReceipt ? 'Tax-Cleared' : 'Pro-Forma',
      isReceipt ? 'Settled' : 'Payment-Pending',
      booking.securityEscortIncluded ? 'Armed-Escort' : 'Standard-Charter'
    ],
    clientName,
    clientEmail,
    clientPhone,
    clientCompany,
    serviceType: 'car_hire',
    carHireTripType: booking.tripType,
    carHireVehicle: booking.vehicleName,
    carHirePlateNumber: booking.vehiclePlateNumber,
    carHireChauffeurName: booking.chauffeurName,
    carHireChauffeurPhone: booking.chauffeurPhone,
    carHireTotalDays: booking.totalDays,
    carHirePickupDate: booking.pickupDate,
    carHireReturnDate: booking.returnDate,
    carHireSubtotalNaira: booking.subtotalNaira,
    carHireVatNaira: booking.vatAmountNaira,
    carHireTollNaira: booking.tollAllowanceNaira,
    carHireSecurityEscort: booking.securityEscortIncluded,
    carHireBookingData: {
      ...booking,
      documentType: isReceipt ? 'receipt' : 'invoice',
      status: isReceipt ? 'settled' : 'pending',
      invoiceOrReceiptNumber: cleanNum
    }
  };

  return newDoc;
};

/**
 * Saves Car Hire Document to localStorage Vault and syncs via window event
 */
export const saveCarHireDocumentToVault = async (
  doc: VaultDocument,
  saveToCloudFn?: (doc: VaultDocument) => Promise<void>
): Promise<VaultDocument[]> => {
  let updatedDocs: VaultDocument[] = [];

  try {
    const raw = localStorage.getItem(VAULT_STORAGE_KEY);
    const existing: VaultDocument[] = raw ? JSON.parse(raw) : [];

    // Filter duplicates
    const filtered = existing.filter(
      (d) => d.id !== doc.id && d.referenceNumber !== doc.referenceNumber
    );

    updatedDocs = [doc, ...filtered];
    localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(updatedDocs));

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('vault_document_added', {
          detail: doc
        })
      );
    }
  } catch (err) {
    console.warn('[Vault] Failed to save car hire doc to localStorage:', err);
    updatedDocs = [doc];
  }

  if (saveToCloudFn) {
    try {
      await saveToCloudFn(doc);
    } catch (err) {
      console.warn('[Vault] Cloud sync error for car hire doc:', err);
    }
  }

  return updatedDocs;
};

/**
 * Generates an official publication-quality PDF for Car Hire Invoices and Receipts
 */
export const generateCarHirePdf = (
  docData: VaultDocument,
  isReceiptParam?: boolean,
  phone: string = '+234 806 246 6212'
): jsPDF => {
  const isReceipt =
    isReceiptParam !== undefined
      ? isReceiptParam
      : docData.docType === 'car_hire_receipt' || docData.status === 'settled';

  const booking = docData.carHireBookingData;
  const isInterState = docData.carHireTripType === 'inter_state' || booking?.tripType === 'inter_state';

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  // 1. Top Minimal Accent Line (Clean 1.5mm rule)
  doc.setFillColor(isReceipt ? 5 : 30, isReceipt ? 150 : 41, isReceipt ? 105 : 59); // Emerald #059669 or Navy #1e293b
  doc.rect(0, 0, pageWidth, 2.5, 'F');

  // 2. Executive Corporate Header
  let y = 14;

  // Left Side: Brand Name & Corporate Info
  doc.setTextColor(15, 23, 42); // slate-900
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('PYDA MOVERS & LOGISTICS LTD', margin, y);

  y += 5;
  doc.setTextColor(71, 85, 105); // slate-600
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Executive Car Hire & Chauffeur Fleet Services', margin, y);

  y += 4.5;
  doc.setTextColor(100, 116, 139); // slate-500
  doc.setFontSize(7);
  doc.text('RC: 1498210 · FIRS TIN: 24891029-0001 · FMWH Reg: FMWH/RL-0892', margin, y);

  y += 4;
  doc.text(`Suite A204, AA Rano Citygate Plaza, Airport Rd, Abuja FCT · Hotline: ${phone}`, margin, y);

  y += 4;
  doc.text('Official Email: fleet@pydamovers.com · Portal: pydamovers.com', margin, y);

  // Right Side: Document Title & Reference
  const rightX = pageWidth - margin;
  doc.setTextColor(isReceipt ? 5 : 15, isReceipt ? 150 : 23, isReceipt ? 105 : 42);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(isReceipt ? 'OFFICIAL RECEIPT' : 'PRO-FORMA INVOICE', rightX, 14, { align: 'right' });

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text(`Ref: ${docData.referenceNumber}`, rightX, 20, { align: 'right' });

  doc.setTextColor(100, 116, 139);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Issued: ${docData.issuedDate}`, rightX, 25, { align: 'right' });

  doc.setTextColor(isReceipt ? 5 : 71, isReceipt ? 150 : 85, isReceipt ? 105 : 105);
  doc.setFont('helvetica', 'bold');
  doc.text(
    isReceipt ? 'STATUS: PAID & CLEARED' : 'STATUS: 30-DAY QUOTATION',
    rightX,
    30,
    { align: 'right' }
  );

  // 3. Crisp Hairline Divider
  y = 36;
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.3);
  doc.line(margin, y, margin + contentWidth, y);

  y += 6;

  // 4. Two-Column Metadata Layout (Billed To & Charter Details)
  const col1X = margin;
  const col2X = margin + 96;

  // Left Column: Client / Hirer
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text('BILLED TO / HIRER:', col1X, y);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(docData.clientName || 'Valued Corporate Client', col1X, y + 5);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  let leftY = y + 9.5;
  if (docData.clientCompany) {
    doc.text(`Company: ${docData.clientCompany}`, col1X, leftY);
    leftY += 4.5;
  }
  doc.text(`Phone: ${docData.clientPhone || 'On File'}`, col1X, leftY);
  leftY += 4.5;
  doc.text(`Email: ${docData.clientEmail || 'fleet@pydamovers.com'}`, col1X, leftY);

  // Right Column: Charter Specifications
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(148, 163, 184);
  doc.text('CHARTER SPECIFICATIONS:', col2X, y);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(docData.carHireVehicle || booking?.vehicleName || 'Executive Fleet Vehicle', col2X, y + 5);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  let rightY = y + 9.5;
  doc.text(`Plate Number: ${docData.carHirePlateNumber || booking?.vehiclePlateNumber || 'ABJ-482-XY'}`, col2X, rightY);
  rightY += 4.5;
  const originStr = booking?.originAddress || docData.originCity || 'Lagos';
  const destStr = booking?.destinationAddress || docData.destinationCity || 'Abuja';
  const daysStr = docData.carHireTotalDays || booking?.totalDays || 1;
  doc.text(`Route: ${originStr} -> ${destStr} (${daysStr} Days)`, col2X, rightY);
  rightY += 4.5;
  doc.text(
    `Chauffeur: ${docData.carHireChauffeurName || booking?.chauffeurName || 'Vetted Protocol Driver'} (${
      docData.carHireChauffeurPhone || booking?.chauffeurPhone || phone
    })`,
    col2X,
    rightY
  );

  y = Math.max(leftY, rightY) + 7;

  // 5. Itemized Table
  doc.setFillColor(248, 250, 252); // slate-50
  doc.rect(margin, y, contentWidth, 7, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(margin, y, contentWidth, 7, 'S');

  doc.setTextColor(71, 85, 105);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('LINE ITEM DESCRIPTION', margin + 3, y + 4.8);
  doc.text('QTY / DAYS', margin + 95, y + 4.8);
  doc.text('RATE (NGN)', margin + 130, y + 4.8, { align: 'right' });
  doc.text('AMOUNT (NGN)', margin + contentWidth - 3, y + 4.8, { align: 'right' });

  y += 7;

  const totalNaira = docData.coverageAmountNaira || booking?.totalAmountNaira || 150000;
  const vatAmount = docData.carHireVatNaira || booking?.vatAmountNaira || Math.round(totalNaira * 0.075 / 1.075);
  const subtotal = totalNaira - vatAmount;
  const days = docData.carHireTotalDays || booking?.totalDays || 1;
  const toll = docData.carHireTollNaira || booking?.tollAllowanceNaira || (isInterState ? 20000 : 5000);
  const escortNaira = (docData.carHireSecurityEscort || booking?.securityEscortIncluded)
    ? (booking?.securityEscortNaira || (isInterState ? 180000 : 90000))
    : 0;
  const chauffeurAllowance = booking?.chauffeurAllowanceNaira || (days * (isInterState ? 20000 : 15000));
  const baseVehicleTotal = subtotal - toll - escortNaira - chauffeurAllowance;
  const dailyBase = Math.round(baseVehicleTotal / days);

  const lineItems = [
    {
      desc: `${docData.carHireVehicle || 'Executive Fleet Vehicle'} Daily Charter`,
      detail: `${isInterState ? 'Inter-State highway transit' : 'Intra-State city charter'} with driver & AC`,
      qty: `${days} Day${days > 1 ? 's' : ''}`,
      rate: `₦${dailyBase.toLocaleString('en-NG')}`,
      amount: `₦${baseVehicleTotal.toLocaleString('en-NG')}`
    },
    {
      desc: 'Highway Corridor Toll Allowances & Transit Vouchers',
      detail: isInterState ? 'Federal expressways, bridge vouchers & tolls' : 'Metro transit & express toll vouchers',
      qty: 'Route Fixed',
      rate: `₦${toll.toLocaleString('en-NG')}`,
      amount: `₦${toll.toLocaleString('en-NG')}`
    },
    {
      desc: 'Chauffeur Subsistence & Accommodation Allowance',
      detail: 'Uniformed driver per-diem, accommodation & meal logistics',
      qty: `${days} Day${days > 1 ? 's' : ''}`,
      rate: `₦${Math.round(chauffeurAllowance / days).toLocaleString('en-NG')}`,
      amount: `₦${chauffeurAllowance.toLocaleString('en-NG')}`
    }
  ];

  if (escortNaira > 0) {
    lineItems.push({
      desc: 'Tactical Police / MOPOL Armed Escort Patrol',
      detail: 'Mobile Police personnel with tactical escort vehicle & protection',
      qty: `${days} Day${days > 1 ? 's' : ''}`,
      rate: `₦${Math.round(escortNaira / days).toLocaleString('en-NG')}`,
      amount: `₦${escortNaira.toLocaleString('en-NG')}`
    });
  }

  // Draw Line Items
  lineItems.forEach((item) => {
    doc.setDrawColor(241, 245, 249);
    doc.line(margin, y + 10, margin + contentWidth, y + 10);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(item.desc, margin + 3, y + 4.2);

    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(item.detail, margin + 3, y + 8);

    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(item.qty, margin + 95, y + 5.5);

    doc.text(item.rate, margin + 130, y + 5.5, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(item.amount, margin + contentWidth - 3, y + 5.5, { align: 'right' });

    y += 10.5;
  });

  y += 2;

  // 6. Summary / Totals Block (Clean Right-Aligned)
  const totalsBoxX = margin + 90;
  const totalsBoxW = contentWidth - 90;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Subtotal:', totalsBoxX + 4, y + 5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`₦${subtotal.toLocaleString('en-NG')}`, margin + contentWidth - 3, y + 5, { align: 'right' });

  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Federal Statutory VAT (7.5%):', totalsBoxX + 4, y + 5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`₦${vatAmount.toLocaleString('en-NG')}`, margin + contentWidth - 3, y + 5, { align: 'right' });

  y += 7;

  // Grand Total Highlight
  if (isReceipt) {
    doc.setFillColor(236, 253, 245); // emerald-50
    doc.setDrawColor(167, 243, 208); // emerald-200
  } else {
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
  }
  doc.roundedRect(totalsBoxX, y, totalsBoxW, 9, 1.5, 1.5, 'FD');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(isReceipt ? 6 : 15, isReceipt ? 95 : 23, isReceipt ? 70 : 42);
  doc.text(isReceipt ? 'TOTAL AMOUNT PAID:' : 'TOTAL AMOUNT DUE:', totalsBoxX + 4, y + 6);

  doc.setFontSize(10);
  doc.text(`₦${totalNaira.toLocaleString('en-NG')}`, margin + contentWidth - 3, y + 6, { align: 'right' });

  y += 14;

  // 7. Payment Confirmation Banner (Simple & Professional)
  if (isReceipt) {
    doc.setFillColor(240, 253, 244); // light green
    doc.setDrawColor(134, 239, 172); // green-300
    doc.roundedRect(margin, y, contentWidth, 16, 2, 2, 'FD');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(21, 128, 61); // green-700
    doc.text('✓ PAYMENT SETTLED IN FULL & OFFICIAL FIRS TAX CLEARED', margin + 4, y + 5);

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(22, 101, 52); // green-800
    const paymentRef = booking?.paymentReference || 'NIP-CBN-2026-PYDA-OK';
    const payMethod = booking?.paymentMethod === 'card' ? 'Online Card / WebPay' : 'Direct NIBSS Instant Bank Transfer (NIP)';
    doc.text(`Payment Ref: ${paymentRef}  ·  Payment Method: ${payMethod}  ·  Zero Balance Outstanding`, margin + 4, y + 9.5);
    doc.text('This receipt serves as an authentic tax invoice and clearance voucher for corporate accounting.', margin + 4, y + 13.5);
    y += 20;
  } else {
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, y, contentWidth, 16, 2, 2, 'FD');

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('BANK REMITTANCE INSTRUCTIONS:', margin + 4, y + 5);

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text('Access Bank Plc: 0192847291 (Pyda Movers & Logistics Ltd)  |  Zenith Bank: 1019283746 (Pyda Movers Nigeria Ltd)', margin + 4, y + 9.5);
    doc.text(`Quote Reference "${docData.referenceNumber}" upon remittance for instant dispatch confirmation.`, margin + 4, y + 13.5);
    y += 20;
  }

  // 8. Signatures Section (Clean & Understated)
  const sigBoxW = (contentWidth - 6) / 2;

  // Left: Authorized Fleet Directorate
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(margin, y + 8, margin + sigBoxW - 8, y + 8);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('AUTHORIZED ISSUANCE (PYDA FLEET DIRECTORATE)', margin, y + 12);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Alhaji M. Belgore / F. Ogundimu · Verified', margin, y + 15.5);

  // Right: Client Acknowledgment
  doc.line(margin + sigBoxW + 6, y + 8, margin + contentWidth, y + 8);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text(isReceipt ? 'CLIENT ACKNOWLEDGMENT' : 'HIRER ACCEPTANCE', margin + sigBoxW + 6, y + 12);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(docData.clientName || 'Authorized Hirer Representative', margin + sigBoxW + 6, y + 15.5);

  y += 20;

  // 9. Simple & Professional Single-Line Footer
  doc.setDrawColor(241, 245, 249);
  doc.line(margin, pageHeight - 12, margin + contentWidth, pageHeight - 12);

  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Pyda Movers & Logistics Nigeria Ltd  ·  ${isReceipt ? 'Official Receipt' : 'Pro-Forma Invoice'} #${docData.referenceNumber}  ·  Audit Code: ${docData.verifiedStampCode}`,
    margin,
    pageHeight - 8
  );
  doc.text(
    'FMWH Reg: FMWH/RL-0892  ·  pydamovers.com',
    margin + contentWidth,
    pageHeight - 8,
    { align: 'right' }
  );

  return doc;
};

/**
 * Downloads Car Hire PDF document directly
 */
export const downloadCarHirePdf = (
  docData: VaultDocument,
  isReceiptParam?: boolean,
  phone: string = '+234 806 246 6212'
): void => {
  const isReceipt =
    isReceiptParam !== undefined
      ? isReceiptParam
      : docData.docType === 'car_hire_receipt' || docData.status === 'settled';

  const doc = generateCarHirePdf(docData, isReceipt, phone);
  const prefix = isReceipt ? 'Pyda_CarHire_Receipt' : 'Pyda_CarHire_Invoice';
  doc.save(`${prefix}_${docData.referenceNumber}.pdf`);
};
