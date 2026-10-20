import jsPDF from 'jspdf';
import { VaultDocument, CustomerUser } from '../types';

export interface PackageGenerationOptions {
  packageTitle?: string;
  notes?: string;
  companyPhone?: string;
}

/**
 * Generates a unified, multi-page consolidated PDF package
 * containing an official dossier cover/manifest followed by each selected document.
 */
export const generateConsolidatedDocumentPackage = (
  documents: VaultDocument[],
  currentUser: CustomerUser,
  options?: PackageGenerationOptions
): { doc: jsPDF; packageRef: string; fileName: string } => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 12;
  const contentWidth = pageWidth - margin * 2;

  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  const packageRef = `PKG-MGT-2026-${randomSuffix}`;
  const timestamp = new Date().toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  const dateOnly = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const phone = options?.companyPhone || '08062466212';
  const packageTitle = options?.packageTitle || 'Official Transit Compliance & Legal Document Package';

  // Calculate Combined Insured / Cargo Valuation
  const totalValuation = documents.reduce((sum, d) => sum + (d.coverageAmountNaira || 0), 0);

  // ==========================================
  // PAGE 1: COVER MANIFEST & COMPLIANCE DOSSIER
  // ==========================================

  // 1. Header Banner (Slate-900 with Amber Stripe)
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 40, 'F');

  doc.setFillColor(245, 158, 11); // amber-500
  doc.rect(0, 40, pageWidth, 2.5, 'F');

  // Brand Name & Subtitle
  doc.setTextColor(245, 158, 11);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('MEGATREND MOVERS & LOGISTICS NIGERIA', margin, 15);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Certified Client Document Vault • Multi-Document Compliance Dossier', margin, 22);
  doc.text(`Federal Ministry of Works & Housing Reg: FMWH/RL-0892 • RC: 1498210`, margin, 28);
  doc.text(`Corporate Hotline: +234 ${phone.replace(/^0/, '')} | legal@megatrendmovers.ng`, margin, 34);

  // Package Reference Pill (Right)
  doc.setFillColor(30, 41, 59);
  doc.roundedRect(pageWidth - margin - 62, 9, 62, 23, 2, 2, 'F');
  doc.setTextColor(245, 158, 11);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('CONSOLIDATED DOSSIER REF', pageWidth - margin - 58, 16);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9.5);
  doc.text(packageRef, pageWidth - margin - 58, 24);
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text(`Compiled: ${dateOnly}`, pageWidth - margin - 58, 29);

  let currentY = 50;

  // Title Section
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(packageTitle, margin, currentY);
  currentY += 5.5;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Certified compilation of ${documents.length} official documents verified under Megatrend PKI Security Architecture.`,
    margin,
    currentY
  );
  currentY += 8;

  // 2. Executive Overview Specification Card
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, currentY, contentWidth, 34, 2, 2, 'FD');

  const col1X = margin + 4;
  const col2X = margin + contentWidth / 2 + 4;
  let rowY = currentY + 6;

  // Column 1
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('PRIMARY CLIENT / BENEFICIARY', col1X, rowY);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(currentUser.fullName, col1X, rowY + 5);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('VERIFIED CONTACT & REGISTRATION', col1X, rowY + 12);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(`${currentUser.email || 'corporate@client.ng'} | ${currentUser.phone || '08062466212'}`, col1X, rowY + 17);

  // Column 2
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('TOTAL ENCLOSED DOCUMENTS', col2X, rowY);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${documents.length} Certified Documents Included`, col2X, rowY + 5);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('COMBINED INSURED / CARGO VALUATION', col2X, rowY + 12);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(217, 119, 6); // amber-600
  doc.text(
    totalValuation > 0
      ? `₦${totalValuation.toLocaleString('en-NG')} (NGN)`
      : 'Full Replacement Indemnity',
    col2X,
    rowY + 17
  );

  currentY += 41;

  // 3. Enclosed Documents Manifest Table
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Enclosed Document Schedule & Verification Manifest', margin, currentY);
  currentY += 4.5;

  // Table Header
  const tableX = margin;
  const tableW = contentWidth;
  const thHeight = 6.5;

  doc.setFillColor(241, 245, 249);
  doc.rect(tableX, currentY, tableW, thHeight, 'F');
  doc.setFontSize(6.8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);

  doc.text('#', tableX + 2, currentY + 4.5);
  doc.text('DOCUMENT REF / ID', tableX + 8, currentY + 4.5);
  doc.text('CATEGORY', tableX + 44, currentY + 4.5);
  doc.text('TITLE & SCOPE', tableX + 78, currentY + 4.5);
  doc.text('VALUATION / SUM', tableX + 140, currentY + 4.5);
  doc.text('STATUS', tableX + 168, currentY + 4.5);

  currentY += thHeight;

  // Table Rows
  const rowHeight = 7.5;
  documents.forEach((item, idx) => {
    const isEven = idx % 2 === 0;
    doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
    doc.rect(tableX, currentY, tableW, rowHeight, 'F');
    doc.setDrawColor(241, 245, 249);
    doc.line(tableX, currentY + rowHeight, tableX + tableW, currentY + rowHeight);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(15, 23, 42);

    // #
    doc.text(`${idx + 1}`, tableX + 2, currentY + 5);

    // Ref
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(30, 41, 59);
    const refDisplay = doc.splitTextToSize(item.referenceNumber, 34)[0];
    doc.text(refDisplay, tableX + 8, currentY + 5);

    // Category
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(71, 85, 105);
    const categoryLabel =
      item.docType === 'insurance_certificate'
        ? 'Insurance Cert'
        : item.docType === 'bill_of_lading' || (item.tags && item.tags.some(t => t.toLowerCase().includes('lading')))
        ? 'Bill of Lading'
        : item.docType === 'waybill_manifest'
        ? 'Waybill Manifest'
        : item.docType === 'moving_agreement'
        ? 'Moving Contract'
        : 'Payment Receipt';
    doc.text(categoryLabel, tableX + 44, currentY + 5);

    // Title (truncated if needed)
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(15, 23, 42);
    const safeTitle = item.title.length > 36 ? `${item.title.substring(0, 34)}...` : item.title;
    doc.text(safeTitle, tableX + 78, currentY + 5);

    // Valuation
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(item.coverageAmountNaira ? 217 : 100, item.coverageAmountNaira ? 119 : 116, item.coverageAmountNaira ? 6 : 139);
    const valText = item.coverageAmountNaira ? `₦${item.coverageAmountNaira.toLocaleString('en-NG')}` : 'Included';
    doc.text(valText, tableX + 140, currentY + 5);

    // Status
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(5, 150, 105); // emerald
    doc.text(`✓ ${item.status.toUpperCase()}`, tableX + 168, currentY + 5);

    currentY += rowHeight;
  });

  currentY += 5;

  // 4. Custom Package Notes (if user specified in modal)
  if (options?.notes && options.notes.trim().length > 0) {
    doc.setFillColor(254, 243, 199); // amber-100
    doc.setDrawColor(245, 158, 11);
    doc.roundedRect(margin, currentY, contentWidth, 14, 1.5, 1.5, 'FD');

    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(180, 83, 9);
    doc.text('PACKAGE ISSUANCE & AUDIT PURPOSE NOTES:', margin + 3, currentY + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(120, 53, 15);
    const splitNotes = doc.splitTextToSize(options.notes, contentWidth - 6);
    doc.text(splitNotes, margin + 3, currentY + 9.5);

    currentY += 18;
  }

  // 5. Legal Certification & Chain of Custody Warranty
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, currentY, contentWidth, 24, 1.5, 1.5, 'FD');

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('LEGAL WARRANTY & REGULATORY COMPLIANCE CERTIFICATION', margin + 3, currentY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(71, 85, 105);
  const legalText =
    'This consolidated dossier constitutes an official certified compilation of executed logistics agreements, Goods-In-Transit indemnities, and transport manifests issued by Megatrend Movers & Logistics Ltd under the Carriage of Goods by Road Act and Nigerian Insurers Association (NIA) oversight. All documents herein bear active digital verification hashes and are valid across all Nigerian interstate transit corridors.';
  const splitLegal = doc.splitTextToSize(legalText, contentWidth - 6);
  doc.text(splitLegal, margin + 3, currentY + 10);

  currentY += 30;

  // 6. Master Package Signatures & Seals
  const sigBoxW = (contentWidth - 6) / 2;
  const sigBoxH = 22;

  // Left Signatory (Megatrend Directorate)
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin, currentY, sigBoxW, sigBoxH, 1.5, 1.5, 'FD');

  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('CERTIFIED LOGISTICS CARRIER & ISSUING AUTHORITY', margin + 3, currentY + 4.5);
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Engr. O. Bello (VP Operations & Legal Compliance)', margin + 3, currentY + 11);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(5, 150, 105);
  doc.text('✓ Authenticated & Electronically Sealed by Megatrend Movers', margin + 3, currentY + 17);

  // Right Signatory (Client / Beneficiary)
  const rightX = margin + sigBoxW + 6;
  doc.roundedRect(rightX, currentY, sigBoxW, sigBoxH, 1.5, 1.5, 'FD');

  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('REGISTERED CLIENT / PRIMARY BENEFICIARY', rightX + 3, currentY + 4.5);
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(currentUser.fullName, rightX + 3, currentY + 11);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(5, 150, 105);
  doc.text('✓ Verified Account Endorsement Recorded', rightX + 3, currentY + 17);

  // ==========================================
  // SUBSEQUENT PAGES: EACH SELECTED DOCUMENT
  // ==========================================

  documents.forEach((item, docIdx) => {
    doc.addPage();
    let pageY = margin;

    // Running Top Sub-Header (Slate-900)
    doc.setFillColor(15, 23, 42);
    doc.rect(margin, pageY, contentWidth, 12, 'F');
    doc.setFillColor(245, 158, 11);
    doc.rect(margin, pageY + 12, contentWidth, 1, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text('MEGATREND MOVERS & LOGISTICS • CONSOLIDATED DOSSIER', margin + 4, pageY + 7.5);

    doc.setTextColor(245, 158, 11);
    doc.setFontSize(7.5);
    doc.text(
      `DOCUMENT ${docIdx + 1} OF ${documents.length} • REF: ${item.referenceNumber}`,
      pageWidth - margin - 4,
      pageY + 7.5,
      { align: 'right' }
    );

    pageY += 17;

    const isBOL =
      item.docType === 'bill_of_lading' ||
      (item.tags && item.tags.some((t) => t.toLowerCase().includes('lading') || t.toLowerCase().includes('bol'))) ||
      item.title.toLowerCase().includes('bill of lading') ||
      item.title.toLowerCase().includes('bol');

    const isInsurance =
      item.docType === 'insurance_certificate' ||
      (item.tags && item.tags.some((t) => t.toLowerCase().includes('insurance'))) ||
      item.title.toLowerCase().includes('insurance') ||
      item.title.toLowerCase().includes('git');

    if (isBOL) {
      // ----------------------------------------
      // RENDER OFFICIAL BILL OF LADING DOCUMENT
      // ----------------------------------------
      renderBillOfLadingPage(doc, item, currentUser, pageY, contentWidth, margin, pageWidth);
    } else if (isInsurance) {
      // ----------------------------------------
      // RENDER GOODS-IN-TRANSIT INSURANCE POLICY
      // ----------------------------------------
      renderInsuranceCertificatePage(doc, item, currentUser, pageY, contentWidth, margin, pageWidth);
    } else {
      // ----------------------------------------
      // RENDER GENERAL CONTRACT / WAYBILL / RECEIPT
      // ----------------------------------------
      renderGeneralVaultDocPage(doc, item, currentUser, pageY, contentWidth, margin, pageWidth);
    }
  });

  // ==========================================
  // RUNNING FOOTERS ON ALL PAGES
  // ==========================================
  const totalPages = doc.internal.pages.length - 1; // jsPDF 1-based indexing
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFontSize(6.8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);

    const footerText = `Megatrend Certified Package Ref: ${packageRef} • Generated: ${timestamp}`;
    doc.text(footerText, margin, pageHeight - 6);

    const pageCountText = `Page ${p} of ${totalPages}`;
    doc.text(pageCountText, pageWidth - margin, pageHeight - 6, { align: 'right' });
  }

  const fileName = `Megatrend_Consolidated_Package_${packageRef}.pdf`;

  return { doc, packageRef, fileName };
};

/**
 * Helper to render an official Bill of Lading page
 */
function renderBillOfLadingPage(
  doc: jsPDF,
  item: VaultDocument,
  currentUser: CustomerUser,
  startY: number,
  contentWidth: number,
  margin: number,
  pageWidth: number
) {
  let y = startY;

  // Title Banner
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 18, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('OFFICIAL STRAIGHT BILL OF LADING (NON-NEGOTIABLE)', margin + 4, y + 7.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Highway Freight Manifest • Issued under the Carriage of Goods by Road Act', margin + 4, y + 13.5);

  // Status Badge
  doc.setFillColor(16, 185, 129); // emerald-500
  doc.roundedRect(pageWidth - margin - 32, y + 4.5, 28, 9, 1, 1, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.text('AUTHENTICATED', pageWidth - margin - 18, y + 10.5, { align: 'center' });

  y += 22;

  // Metadata Bar
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, contentWidth, 12, 'F');

  const colW = contentWidth / 4;
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);

  doc.text('BOL REFERENCE NO.', margin + 3, y + 4);
  doc.text('CONSIGNMENT ID', margin + colW + 3, y + 4);
  doc.text('DISPATCH DATE', margin + colW * 2 + 3, y + 4);
  doc.text('TAMPER-EVIDENT SEAL', margin + colW * 3 + 3, y + 4);

  doc.setFontSize(7.8);
  doc.setTextColor(15, 23, 42);
  doc.text(item.referenceNumber, margin + 3, y + 9);
  doc.text(item.associatedQuoteId || 'MGT-EXP-CONV-889', margin + colW + 3, y + 9);
  doc.text(item.issuedDate, margin + colW * 2 + 3, y + 9);

  doc.setTextColor(5, 150, 105);
  doc.setFont('helvetica', 'bold');
  doc.text(item.verifiedStampCode || 'SEAL-OK-99482', margin + colW * 3 + 3, y + 9);

  y += 16;

  // Shipper & Consignee Boxes
  const boxW = (contentWidth - 4) / 2;
  const boxH = 34;

  // Shipper (Left)
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, boxW, boxH, 1.5, 1.5, 'FD');

  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, y, boxW, 6, 1.5, 1.5, 'F');
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('1. SHIPPER / CONSIGNOR (ORIGIN)', margin + 3, y + 4.5);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(currentUser.fullName, margin + 3, y + 11.5);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Origin Facility: ${item.originCity || 'Plot 14, Victoria Island, Lagos'}`, margin + 3, y + 16.5);
  doc.text(`Phone: ${currentUser.phone || '08062466212'}`, margin + 3, y + 21.5);
  doc.text(`Account Status: Verified Enterprise Client`, margin + 3, y + 26.5);

  // Consignee (Right)
  const consigneeX = margin + boxW + 4;
  doc.roundedRect(consigneeX, y, boxW, boxH, 1.5, 1.5, 'FD');

  doc.setFillColor(241, 245, 249);
  doc.roundedRect(consigneeX, y, boxW, 6, 1.5, 1.5, 'F');
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('2. CONSIGNEE / DESTINATION RECEIVING HUB', consigneeX + 3, y + 4.5);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(currentUser.fullName, consigneeX + 3, y + 11.5);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Delivery Location: ${item.destinationCity || 'Maitama District, Abuja, FCT'}`, consigneeX + 3, y + 16.5);
  doc.text('Receiving Protocol: White-Glove Uncrating & Assembly', consigneeX + 3, y + 21.5);
  doc.text('Delivery Clearance: Pre-Cleared by Highway Escort', consigneeX + 3, y + 26.5);

  y += boxH + 4;

  // Carrier & Transport Equipment Details
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 24, 1.5, 1.5, 'FD');

  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('3. AUTHORIZED FREIGHT CARRIER & FLEET ESCORT SPECIFICATIONS', margin + 3, y + 4.5);

  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text('Carrier:', margin + 3, y + 10.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Megatrend Movers & Logistics Ltd (National Road Transport License #NRT-884)', margin + 18, y + 10.5);

  doc.setFont('helvetica', 'bold');
  doc.text('Vehicle Fleet Plate:', margin + 3, y + 16);
  doc.setFont('helvetica', 'normal');
  doc.text('Heavy-Duty Air-Ride Van (Plate: KJA-892-XY • Speed-Governed at 70 km/h)', margin + 32, y + 16);

  doc.setFont('helvetica', 'bold');
  doc.text('Security Escort:', margin + 3, y + 21);
  doc.setFont('helvetica', 'normal');
  doc.text('24/7 Satellite Transponder #MGT-SAT-889 • Tamper-Lock Dual Inspection Enforced', margin + 28, y + 21);

  y += 28;

  // Consignment Description & Cargo Details
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, contentWidth, 46, 1.5, 1.5, 'FD');

  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, y, contentWidth, 6.5, 1.5, 1.5, 'F');
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('4. CARGO SCHEDULE, PIECE COUNT & DECLARED INDEMNITY', margin + 3, y + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  const splitSummary = doc.splitTextToSize(item.summaryText, contentWidth - 6);
  doc.text(splitSummary, margin + 3, y + 11.5);

  const cargoValuationY = y + 11.5 + splitSummary.length * 4 + 2;

  doc.setDrawColor(241, 245, 249);
  doc.line(margin + 2, cargoValuationY, margin + contentWidth - 2, cargoValuationY);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('DECLARED CARGO VALUE:', margin + 3, cargoValuationY + 5);

  doc.setFontSize(10);
  doc.setTextColor(217, 119, 6); // amber-600
  doc.text(
    item.coverageAmountNaira
      ? `₦${item.coverageAmountNaira.toLocaleString('en-NG')} NGN`
      : 'Full Valuation Declared',
    margin + 42,
    cargoValuationY + 5.5
  );

  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('TRANSIT ROUTE:', margin + 98, cargoValuationY + 5);

  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text(`${item.originCity || 'Lagos'} ➔ ${item.destinationCity || 'Abuja'}`, margin + 122, cargoValuationY + 5);

  y += 50;

  // Bilateral Signatures & Chain of Custody
  const sigW = (contentWidth - 4) / 2;
  const sigH = 24;

  // Carrier Signature (Left)
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, sigW, sigH, 1.5, 1.5, 'FD');

  doc.setFontSize(6.8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('CARRIER DISPATCH SIGNATURE & BADGE', margin + 3, y + 4.5);
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text(item.signatories?.[0] || 'Captain Bello (Lead Convoy Captain)', margin + 3, y + 11);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(5, 150, 105);
  doc.text('✓ Signed via Megatrend Telematics Mobile App', margin + 3, y + 17);

  // Shipper Acceptance (Right)
  const sigRightX = margin + sigW + 4;
  doc.roundedRect(sigRightX, y, sigW, sigH, 1.5, 1.5, 'FD');

  doc.setFontSize(6.8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('SHIPPER / CONSIGNOR ACCEPTANCE', sigRightX + 3, y + 4.5);
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text(item.signatories?.[1] || currentUser.fullName, sigRightX + 3, y + 11);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(5, 150, 105);
  doc.text('✓ Execution Timestamp Recorded & PKI Sealed', sigRightX + 3, y + 17);
}

/**
 * Helper to render an official Insurance Certificate page
 */
function renderInsuranceCertificatePage(
  doc: jsPDF,
  item: VaultDocument,
  currentUser: CustomerUser,
  startY: number,
  contentWidth: number,
  margin: number,
  pageWidth: number
) {
  let y = startY;

  // Title Banner with Gold Accent
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 18, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11.5);
  doc.setTextColor(15, 23, 42);
  doc.text('GOODS-IN-TRANSIT (GIT) ALL-RISK INSURANCE CERTIFICATE', margin + 4, y + 7.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Underwritten by ${item.underwriterOrIssuer || 'Leadway Assurance Plc & AIICO Consortium'} • Zero Deductible Guarantee`,
    margin + 4,
    y + 13.5
  );

  // Certificate Pill (Right)
  doc.setFillColor(245, 158, 11);
  doc.roundedRect(pageWidth - margin - 36, y + 4.5, 32, 9, 1, 1, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(15, 23, 42);
  doc.text('NIA CERTIFIED', pageWidth - margin - 20, y + 10.5, { align: 'center' });

  y += 22;

  // Executive Specification Card
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin, y, contentWidth, 48, 1.5, 1.5, 'FD');

  const col1 = margin + 4;
  const col2 = margin + contentWidth / 2 + 4;
  let row = y + 6;

  // Col 1
  doc.setFontSize(6.8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('PRIMARY BENEFICIARY / INSURED PARTY', col1, row);
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(currentUser.fullName, col1, row + 5);

  doc.setFontSize(6.8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('ISSUING CONSORTIUM & BROKER', col1, row + 12);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(item.underwriterOrIssuer || 'Leadway Assurance & AIICO Consortium', col1, row + 17);

  doc.setFontSize(6.8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('TRANSIT ROUTE & TERRITORIAL LIMIT', col1, row + 24);
  doc.setFontSize(7.8);
  doc.setTextColor(15, 23, 42);
  doc.text(`${item.originCity || 'Lagos Central Hub'} ➔ ${item.destinationCity || 'Abuja Capital'}`, col1, row + 29);

  // Col 2
  doc.setFontSize(6.8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('POLICY INDEMNITY & COVER LIMIT', col2, row);
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(217, 119, 6);
  doc.text(
    item.coverageAmountNaira
      ? `₦${item.coverageAmountNaira.toLocaleString('en-NG')} NGN`
      : 'Full Replacement Valuation',
    col2,
    row + 5
  );

  doc.setFontSize(6.8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('POLICY VALIDITY DURATION', col2, row + 12);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(`From: ${item.issuedDate} ${item.expiryDate ? `to ${item.expiryDate}` : '(Active Transit)'}`, col2, row + 17);

  doc.setFontSize(6.8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('DIGITAL NIA SECURITY REGISTRATION', col2, row + 24);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(5, 150, 105);
  doc.text(`VERIFIED: ${item.verifiedStampCode}`, col2, row + 29);

  y += 52;

  // Policy Provisions & Legal Stipulations
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.text('Policy Provisions & Scope of Indemnity', margin, y);
  y += 4.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  const splitSummary = doc.splitTextToSize(item.summaryText, contentWidth);
  doc.text(splitSummary, margin, y);
  y += splitSummary.length * 4.2 + 4;

  // Legal Clauses Grid
  const clauses = [
    ['Zero-Loss Guarantee', 'Full replacement indemnity without depreciation or sub-limits on insured high-value cargo.'],
    ['Chain of Custody', 'Strict driver telematics and dual-custody verification at both origin loading and destination uncrating.'],
    ['48-Hour Claim Settlement', 'Expedited claims resolution protocol underwritten directly with Leadway & AIICO Consortium.'],
    ['Interstate Regulatory Licensing', 'Certified compliance under the Nigerian Insurers Association (NIA) code.'],
  ];

  clauses.forEach(([title, desc], idx) => {
    const isEven = idx % 2 === 0;
    doc.setFillColor(isEven ? 248 : 255, isEven ? 250 : 255, isEven ? 252 : 255);
    doc.rect(margin, y, contentWidth, 6, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(15, 23, 42);
    doc.text(`• ${title}:`, margin + 3, y + 4.2);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(71, 85, 105);
    doc.text(desc, margin + 46, y + 4.2);

    y += 6;
  });

  y += 6;

  // Signatures & Endorsements
  const sigW = (contentWidth - 4) / 2;
  const sigH = 24;

  // Left (Underwriter)
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin, y, sigW, sigH, 1.5, 1.5, 'FD');

  doc.setFontSize(6.8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('AUTHORIZED LEAD UNDERWRITER', margin + 3, y + 4.5);
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text(item.signatories?.[0] || 'Dr. B. Sanusi (Chief Underwriter, Leadway)', margin + 3, y + 11);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(5, 150, 105);
  doc.text('✓ Digitally Executed & Underwritten (Zero Deductible)', margin + 3, y + 17);

  // Right (Client)
  const sigRightX = margin + sigW + 4;
  doc.roundedRect(sigRightX, y, sigW, sigH, 1.5, 1.5, 'FD');

  doc.setFontSize(6.8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('PRIMARY CLIENT / BENEFICIARY', sigRightX + 3, y + 4.5);
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text(item.signatories?.[1] || currentUser.fullName, sigRightX + 3, y + 11);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(5, 150, 105);
  doc.text('✓ Certified Beneficiary Policyholder Endorsement', sigRightX + 3, y + 17);
}

/**
 * Helper to render general contracts, service agreements, or receipts
 */
function renderGeneralVaultDocPage(
  doc: jsPDF,
  item: VaultDocument,
  currentUser: CustomerUser,
  startY: number,
  contentWidth: number,
  margin: number,
  pageWidth: number
) {
  let y = startY;

  // Title Banner
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 18, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11.5);
  doc.setTextColor(15, 23, 42);
  doc.text(item.title.toUpperCase(), margin + 4, y + 7.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Official Document Category: ${item.docType.replace('_', ' ').toUpperCase()} • Ref: ${item.referenceNumber}`, margin + 4, y + 13.5);

  y += 22;

  // Metadata Card
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin, y, contentWidth, 38, 1.5, 1.5, 'FD');

  const col1 = margin + 4;
  const col2 = margin + contentWidth / 2 + 4;
  let row = y + 6;

  doc.setFontSize(6.8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('CLIENT / BENEFICIARY', col1, row);
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(currentUser.fullName, col1, row + 5);

  doc.setFontSize(6.8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('ISSUING AUTHORITY / CARRIER', col1, row + 12);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(item.underwriterOrIssuer || 'Megatrend Movers Legal Directorate', col1, row + 17);

  doc.setFontSize(6.8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('TRANSACTION / TRANSIT VALUE', col2, row);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(217, 119, 6);
  doc.text(
    item.coverageAmountNaira
      ? `₦${item.coverageAmountNaira.toLocaleString('en-NG')} NGN`
      : 'Executed Standard Schedule',
    col2,
    row + 5
  );

  doc.setFontSize(6.8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('VALIDITY PERIOD & REGISTRATION', col2, row + 12);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(`Issued: ${item.issuedDate} | Seal: ${item.verifiedStampCode}`, col2, row + 17);

  y += 42;

  // Provisions Body
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.text('Provisions, Scope & Executed Conditions', margin, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  const splitSummary = doc.splitTextToSize(item.summaryText, contentWidth);
  doc.text(splitSummary, margin, y);
  y += splitSummary.length * 4.2 + 8;

  // Signatures
  const sigW = (contentWidth - 4) / 2;
  const sigH = 24;

  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin, y, sigW, sigH, 1.5, 1.5, 'FD');

  doc.setFontSize(6.8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('AUTHORIZED ISSUER', margin + 3, y + 4.5);
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text(item.signatories?.[0] || 'Megatrend Legal Directorate', margin + 3, y + 11);

  const sigRightX = margin + sigW + 4;
  doc.roundedRect(sigRightX, y, sigW, sigH, 1.5, 1.5, 'FD');

  doc.setFontSize(6.8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('CLIENT / RECIPIENT', sigRightX + 3, y + 4.5);
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text(item.signatories?.[1] || currentUser.fullName, sigRightX + 3, y + 11);
}

/**
 * Downloads the consolidated PDF package
 */
export const downloadConsolidatedPackage = (
  documents: VaultDocument[],
  currentUser: CustomerUser,
  options?: PackageGenerationOptions
): { packageRef: string; fileName: string } => {
  const { doc, packageRef, fileName } = generateConsolidatedDocumentPackage(documents, currentUser, options);
  doc.save(fileName);
  return { packageRef, fileName };
};

/**
 * Generates and opens the consolidated PDF in a printable view or triggers auto-print
 */
export const printConsolidatedPackage = (
  documents: VaultDocument[],
  currentUser: CustomerUser,
  options?: PackageGenerationOptions
): { packageRef: string; fileName: string } => {
  const { doc, packageRef, fileName } = generateConsolidatedDocumentPackage(documents, currentUser, options);
  
  // Create blob and open in new tab with print trigger
  try {
    const blob = doc.output('blob');
    const blobUrl = URL.createObjectURL(blob);
    const printWindow = window.open(blobUrl, '_blank');
    if (printWindow) {
      printWindow.focus();
      // Optional print hook after load
      setTimeout(() => {
        try {
          printWindow.print();
        } catch {
          // If browser restricts print on blob window, user has standard print toolbar in PDF viewer
        }
      }, 500);
    } else {
      // Fallback: download the file
      doc.save(fileName);
    }
  } catch (e) {
    // Fallback directly to save
    doc.save(fileName);
  }

  return { packageRef, fileName };
};
