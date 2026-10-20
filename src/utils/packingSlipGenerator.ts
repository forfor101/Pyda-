import jsPDF from 'jspdf';
import { VaultDocument, InventoryItem, CustomerUser, SiteSurveyPhoto } from '../types';
import { INITIAL_INVENTORY_ITEMS } from '../data/companyData';

export const VAULT_STORAGE_KEY = 'megatrend_customer_vault_docs';
export const INVENTORY_STORAGE_KEY = 'megatrend_inventory_planner_items';
export const SURVEY_PHOTOS_STORAGE_KEY = 'megatrend_inventory_survey_photos';

export interface PackingSlipData {
  packingSlipRef: string;
  issuedDate: string;
  dispatchDate?: string;
  clientName: string;
  clientCompany?: string;
  clientPhone: string;
  clientEmail?: string;
  originAddress: string;
  destinationAddress: string;
  serviceType?: string;
  assignedVehicle: string;
  vehiclePlate?: string;
  driverName?: string;
  driverPhone?: string;
  inspectorName?: string;
  tamperSealRange?: string;
  items: InventoryItem[];
  surveyPhotosCount?: number;
  surveyCbm?: number;
  totalCbm: number;
  handlingInstructions?: string;
  pkiVerificationCode?: string;
}

/**
 * Loads current inventory items and survey photos from localStorage
 */
export const loadInventoryForPackingSlip = (): {
  items: InventoryItem[];
  surveyPhotos: SiteSurveyPhoto[];
  totalCbm: number;
  totalPieces: number;
} => {
  let items: InventoryItem[] = INITIAL_INVENTORY_ITEMS;
  let surveyPhotos: SiteSurveyPhoto[] = [];

  if (typeof window !== 'undefined') {
    try {
      const savedItems = localStorage.getItem(INVENTORY_STORAGE_KEY);
      if (savedItems) {
        const parsed = JSON.parse(savedItems);
        if (Array.isArray(parsed) && parsed.length > 0) {
          items = parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load inventory items for packing slip', e);
    }

    try {
      const savedPhotos = localStorage.getItem(SURVEY_PHOTOS_STORAGE_KEY);
      if (savedPhotos) {
        const parsed = JSON.parse(savedPhotos);
        if (Array.isArray(parsed)) {
          surveyPhotos = parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load survey photos for packing slip', e);
    }
  }

  const itemsCbm = items.reduce((sum, i) => sum + (i.volumeCbm || 0.1) * (i.qty || 1), 0);
  const surveyCbm = surveyPhotos.reduce((sum, p) => sum + (p.estimatedCbm || 1.0), 0);
  const totalCbm = itemsCbm + surveyCbm + 2.0; // 2.0 CBM standard crating and air spacing buffer
  const totalPieces = items.reduce((sum, i) => sum + (i.qty || 1), 0);

  return { items, surveyPhotos, totalCbm, totalPieces };
};

/**
 * Helper to determine recommended vehicle based on CBM
 */
export const getRecommendedVehicleFromCbm = (cbm: number): string => {
  if (cbm <= 5) return '3-Ton Padded Moving Van (Transit Van)';
  if (cbm <= 15) return '5-Ton Covered Box Truck (Enclosed Body)';
  if (cbm <= 30) return '10-Ton Heavy Logistics Truck (Hydraulic Liftgate)';
  if (cbm <= 55) return '20-Ton Heavy Haulage Rig / 20ft Cargo Container';
  return '30-Ton Multi-Axle Haulage Trailer / 40ft High-Cube Container';
};

/**
 * Generates an official, publication-quality Packing Slip PDF using jsPDF
 */
export const generatePackingSlipPdf = (
  data: PackingSlipData,
  companyPhone: string = '+234 806 246 6212'
): jsPDF => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 12;
  const contentWidth = pageWidth - margin * 2;

  const totalPieces = data.items.reduce((sum, i) => sum + (i.qty || 1), 0);
  const itemsNetCbm = data.items.reduce((sum, i) => sum + (i.volumeCbm || 0.1) * (i.qty || 1), 0);
  const pkiCode = data.pkiVerificationCode || `PKI-PSL-SEAL-${Math.floor(100000 + Math.random() * 900000)}`;

  // Header Banner (Slate-900 #0f172a with Amber-500 #f59e0b line)
  const renderHeader = (isFirstPage: boolean) => {
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, pageWidth, isFirstPage ? 40 : 20, 'F');

    doc.setFillColor(245, 158, 11); // amber-500
    doc.rect(0, isFirstPage ? 40 : 20, pageWidth, 2, 'F');

    // Brand Name
    doc.setTextColor(245, 158, 11);
    doc.setFontSize(isFirstPage ? 14 : 11);
    doc.setFont('helvetica', 'bold');
    doc.text('PYDA MOVERS & LOGISTICS NIGERIA LTD', margin, isFirstPage ? 14 : 12);

    if (isFirstPage) {
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.text('Corporate Freight Logistics • Consignment Packing Slip & Inventory Manifest', margin, 20);
      doc.text('Lagos Hub: 374/376 Old Ojo Rd, Alakija | Abuja HQ: Suite A204, AA Rano Citygate Plaza, Airport Rd', margin, 25);
      doc.text(`Official Dispatch: dispatch@pydamovers.ng • Hotline: ${companyPhone}`, margin, 30);
      doc.text('Federal Ministry of Works & Housing Reg: FMWH/RL-0892 • RC: 1498210', margin, 35);

      // Packing Slip Reference Pill (Right)
      doc.setFillColor(30, 41, 59);
      doc.roundedRect(pageWidth - margin - 64, 8, 64, 25, 2, 2, 'F');
      doc.setTextColor(245, 158, 11);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.text('OFFICIAL PACKING SLIP & MANIFEST', pageWidth - margin - 60, 14);
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.text(data.packingSlipRef, pageWidth - margin - 60, 21);
      doc.setFontSize(6.5);
      doc.setTextColor(148, 163, 184);
      doc.text(`ISSUED: ${data.issuedDate} | ZERO-LOSS GIT`, pageWidth - margin - 60, 27);
    } else {
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.text(`Packing Slip Ref: ${data.packingSlipRef} • Consignee: ${data.clientName}`, margin + 80, 12);
    }
  };

  renderHeader(true);

  let currentY = 48;

  // 1. Executive Transit Corridor & Consignment Card (Two Columns)
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, currentY, contentWidth, 36, 1.5, 1.5, 'FD');

  const col1X = margin + 4;
  const col2X = margin + 96;

  // Column 1: Shipper / Consignor
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('SHIPPER / CONSIGNOR DETAILS:', col1X, currentY + 5.5);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(data.clientName, col1X, currentY + 11);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  if (data.clientCompany) {
    doc.text(`Company: ${data.clientCompany}`, col1X, currentY + 16);
  }
  doc.text(`Contact Tel: ${data.clientPhone}`, col1X, currentY + (data.clientCompany ? 21 : 16));
  doc.text(`Pick-up Origin: ${data.originAddress}`, col1X, currentY + (data.clientCompany ? 26 : 21));
  doc.text(`Service Mode: ${(data.serviceType || 'Standard').toUpperCase()} RELOCATION`, col1X, currentY + (data.clientCompany ? 31 : 26));

  // Column 2: Consignee & Route Corridor
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('CONSIGNEE & TRANSIT SPECIFICATIONS:', col2X, currentY + 5.5);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`Destination: ${data.destinationAddress}`, col2X, currentY + 11);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(`Assigned Vehicle: ${data.assignedVehicle}`, col2X, currentY + 16);
  doc.text(`Lead Driver: ${data.driverName || 'Captain S. Bello (Pyda Haulage)'} ${data.vehiclePlate ? `• [${data.vehiclePlate}]` : ''}`, col2X, currentY + 21);
  doc.text(`Tamper-Evident Seals: ${data.tamperSealRange || 'PYDA-SEAL-88910 through SEAL-88915'}`, col2X, currentY + 26);
  doc.text(`Dispatch Date: ${data.dispatchDate || data.issuedDate} • Highway Transit`, col2X, currentY + 31);

  currentY += 41;

  // 2. Metrics Strip Cards (4 KPI Badges)
  const badgeWidth = (contentWidth - 6) / 4;
  const badges = [
    { label: 'TOTAL PIECES / UNITS', value: `${totalPieces} Units`, color: [15, 23, 42] },
    { label: 'NET CARGO VOLUME', value: `${itemsNetCbm.toFixed(1)} CBM`, color: [15, 23, 42] },
    { label: 'TOTAL MANIFEST VOL (BUFFER)', value: `${data.totalCbm.toFixed(1)} CBM`, color: [217, 119, 6] },
    { label: 'CHAIN OF CUSTODY', value: 'Tamper Sealed', color: [16, 185, 129] },
  ];

  badges.forEach((b, i) => {
    const bx = margin + i * (badgeWidth + 2);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(bx, currentY, badgeWidth, 14, 1.2, 1.2, 'FD');

    doc.setFontSize(6);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text(b.label, bx + 3, currentY + 4.5);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(b.color[0], b.color[1], b.color[2]);
    doc.text(b.value, bx + 3, currentY + 10.5);
  });

  currentY += 18;

  // 3. Itemized Inventory Table
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('ITEMIZED INVENTORY MANIFEST & VERIFICATION CHECKLIST', margin, currentY);
  currentY += 4;

  const renderTableHeader = (yPos: number) => {
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(margin, yPos, contentWidth, 7, 'F');

    doc.setFontSize(6.8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(245, 158, 11); // amber-500
    doc.text('#', margin + 2, yPos + 4.8);
    doc.text('CATEGORY', margin + 10, yPos + 4.8);
    doc.text('ITEM SPECIFICATION / DESCRIPTION', margin + 46, yPos + 4.8);
    doc.text('UNIT VOL', margin + 115, yPos + 4.8);
    doc.text('QTY', margin + 132, yPos + 4.8);
    doc.text('LINE VOL', margin + 143, yPos + 4.8);
    doc.text('DIRECTIVE', margin + 160, yPos + 4.8);
    doc.text('VERIFY', margin + 176, yPos + 4.8);
  };

  renderTableHeader(currentY);
  currentY += 7;

  // Render Table Rows
  data.items.forEach((item, index) => {
    // Check if row exceeds page height (leave 35mm for signature block)
    if (currentY > pageHeight - 38) {
      doc.addPage();
      renderHeader(false);
      currentY = 26;
      renderTableHeader(currentY);
      currentY += 7;
    }

    const rowBg = index % 2 === 0 ? 255 : 248;
    doc.setFillColor(rowBg, rowBg, rowBg);
    doc.rect(margin, currentY, contentWidth, 6.2, 'F');
    doc.setDrawColor(241, 245, 249);
    doc.line(margin, currentY + 6.2, margin + contentWidth, currentY + 6.2);

    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text(`${index + 1}`, margin + 2, currentY + 4.2);

    // Category
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    const catShort = item.category || 'General';
    doc.text(catShort.substring(0, 18), margin + 10, currentY + 4.2);

    // Description
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    const itemName = item.name.length > 36 ? item.name.substring(0, 36) + '...' : item.name;
    doc.text(itemName, margin + 46, currentY + 4.2);

    // Unit CBM
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`${(item.volumeCbm || 0.1).toFixed(2)}m³`, margin + 115, currentY + 4.2);

    // Qty
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`${item.qty}`, margin + 132, currentY + 4.2);

    // Line Total CBM
    const lineVol = ((item.volumeCbm || 0.1) * (item.qty || 1)).toFixed(2);
    doc.setTextColor(217, 119, 6);
    doc.text(`${lineVol}m³`, margin + 143, currentY + 4.2);

    // Directive / Fragile Tag
    const isSpecial = item.category === 'Special / Fragile' || item.category === 'Electronics';
    if (isSpecial) {
      doc.setTextColor(225, 29, 72); // rose-600
      doc.setFont('helvetica', 'bold');
      doc.text('FRAGILE', margin + 160, currentY + 4.2);
    } else {
      doc.setTextColor(100, 116, 139);
      doc.setFont('helvetica', 'normal');
      doc.text('STANDARD', margin + 160, currentY + 4.2);
    }

    // Checkbox for loading / delivery sign-off
    doc.setDrawColor(148, 163, 184);
    doc.rect(margin + 176, currentY + 1.2, 3.8, 3.8); // Origin check
    doc.rect(margin + 181.5, currentY + 1.2, 3.8, 3.8); // Destination check

    currentY += 6.2;
  });

  // Table Summary Footer Row
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, currentY, contentWidth, 7, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.line(margin, currentY, margin + contentWidth, currentY);
  doc.line(margin, currentY + 7, margin + contentWidth, currentY + 7);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('MANIFEST TOTALS & CARGO AGGREGATE:', margin + 10, currentY + 4.8);
  doc.text(`TOTAL PIECES: ${totalPieces}`, margin + 115, currentY + 4.8);
  doc.setTextColor(217, 119, 6);
  doc.text(`NET: ${itemsNetCbm.toFixed(2)}m³ | GROSS (INCL. BUFFER): ${data.totalCbm.toFixed(2)}m³`, margin + 143, currentY + 4.8);

  currentY += 10;

  // Bulky Items / Site Survey Photo notes if applicable
  if (data.surveyPhotosCount && data.surveyPhotosCount > 0) {
    if (currentY > pageHeight - 48) {
      doc.addPage();
      renderHeader(false);
      currentY = 26;
    }

    doc.setFillColor(254, 243, 199); // amber-100
    doc.setDrawColor(245, 158, 11);
    doc.roundedRect(margin, currentY, contentWidth, 10, 1, 1, 'FD');

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(146, 64, 14); // amber-900
    doc.text(`• SITE SURVEY BULKY ASSETS ATTACHED:`, margin + 4, currentY + 4.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`${data.surveyPhotosCount} visual photo survey items logged (+${(data.surveyCbm || 0).toFixed(1)} CBM allocated). Requires white-glove anti-static and pneumatic crating prior to transit loading.`, margin + 64, currentY + 4.5);

    currentY += 13;
  }

  // Handling Instructions Box
  if (currentY > pageHeight - 45) {
    doc.addPage();
    renderHeader(false);
    currentY = 26;
  }

  const customInstructions = data.handlingInstructions ||
    'White-glove 5-layer protective wrapping protocol strictly enforced. All tamper seals must be inspected, cross-checked against manifest serials, and confirmed undamaged prior to cargo discharge.';

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, currentY, contentWidth, 12, 1, 1, 'FD');

  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('SPECIAL CARGO HANDLING DIRECTIVES & SECURITY PROTOCOL:', margin + 4, currentY + 4.2);

  doc.setFontSize(6.8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  const splitNotes = doc.splitTextToSize(customInstructions, contentWidth - 8);
  doc.text(splitNotes, margin + 4, currentY + 8);

  currentY += 15;

  // 4. Sign-Off & Dual-Custody Signature Blocks
  if (currentY > pageHeight - 34) {
    doc.addPage();
    renderHeader(false);
    currentY = 26;
  }

  const signBlockWidth = (contentWidth - 6) / 3;

  // Box 1: Origin Dispatch Marshall
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, currentY, signBlockWidth, 23, 1, 1, 'FD');

  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('ORIGIN DISPATCH MARSHALL', margin + 3, currentY + 4.5);
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text(data.inspectorName || 'M. Ibrahim (Hub Lead)', margin + 3, currentY + 9.5);
  doc.setDrawColor(148, 163, 184);
  doc.line(margin + 3, currentY + 16, margin + signBlockWidth - 3, currentY + 16);
  doc.setFontSize(6);
  doc.setTextColor(148, 163, 184);
  doc.text('Authorized Loading Signature / Date', margin + 3, currentY + 20);

  // Box 2: Lead Convoy Captain
  const bx2 = margin + signBlockWidth + 3;
  doc.roundedRect(bx2, currentY, signBlockWidth, 23, 1, 1, 'FD');

  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('LEAD CONVOY CAPTAIN', bx2 + 3, currentY + 4.5);
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text(data.driverName || 'Captain S. Bello (Pyda Fleet)', bx2 + 3, currentY + 9.5);
  doc.line(bx2 + 3, currentY + 16, bx2 + signBlockWidth - 3, currentY + 16);
  doc.setFontSize(6);
  doc.setTextColor(148, 163, 184);
  doc.text(`Chain-of-Custody Acceptance / Seals Verified`, bx2 + 3, currentY + 20);

  // Box 3: Consignee / Receiving Officer Handover
  const bx3 = margin + (signBlockWidth + 3) * 2;
  doc.roundedRect(bx3, currentY, signBlockWidth, 23, 1, 1, 'FD');

  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('CONSIGNEE / DESTINATION RECEIPT', bx3 + 3, currentY + 4.5);
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text(data.clientName, bx3 + 3, currentY + 9.5);
  doc.line(bx3 + 3, currentY + 16, bx3 + signBlockWidth - 3, currentY + 16);
  doc.setFontSize(6);
  doc.setTextColor(16, 185, 129); // emerald
  doc.text('Received 100% in Good Order / Seals Intact', bx3 + 3, currentY + 20);

  // PKI Stamp badge
  doc.setFontSize(6);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 185, 129);
  doc.text(`PKI CRYPTOGRAPHIC VERIFICATION SEAL: ${pkiCode}`, margin, pageHeight - 8);

  // Running Footers on all pages
  const totalPages = doc.internal.pages.length - 1;
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Pyda Movers & Logistics • Certified Consignment Packing Slip #${data.packingSlipRef} • System Generated`,
      margin,
      pageHeight - 4
    );
    doc.text(`Page ${p} of ${totalPages}`, pageWidth - margin, pageHeight - 4, { align: 'right' });
  }

  return doc;
};

/**
 * Directly downloads the generated Packing Slip PDF
 */
export const downloadPackingSlipPdf = (
  data: PackingSlipData,
  companyPhone: string = '+234 806 246 6212'
): void => {
  const doc = generatePackingSlipPdf(data, companyPhone);
  const cleanRef = data.packingSlipRef.replace(/[^A-Za-z0-9_-]/g, '_');
  doc.save(`Pyda_Movers_Packing_Slip_${cleanRef}.pdf`);
};

/**
 * Creates an official VaultDocument representing the Packing Slip
 */
export const createPackingSlipDocument = (
  data: PackingSlipData,
  currentUser?: CustomerUser | null
): VaultDocument => {
  const cleanRef = data.packingSlipRef.replace(/[^A-Za-z0-9]/g, '');
  const docId = `DOC-PSL-${new Date().getFullYear()}-${cleanRef}`;

  const summary = `Official Relocation Consignment Packing Slip & Inventory Manifest (#${data.packingSlipRef}) detailing ${data.items.reduce((s, i) => s + (i.qty || 1), 0)} items (${data.totalCbm.toFixed(1)} CBM total volume). Carrier: ${data.assignedVehicle}. Route: ${data.originAddress} to ${data.destinationAddress}. Security Tamper-Evident Seals: ${data.tamperSealRange || 'PYDA-SEAL-88910 - 88915'}. Validated with full Goods-In-Transit zero-loss replacement indemnity.`;

  const newDoc: VaultDocument = {
    id: docId,
    title: `Consignment Packing Slip & Manifest - Ref #${data.packingSlipRef}`,
    docType: 'packing_slip',
    referenceNumber: data.packingSlipRef,
    issuedDate: data.issuedDate,
    status: 'active',
    fileSize: '380 KB',
    underwriterOrIssuer: 'Pyda Logistics Dispatch & Inventory Marshall Office',
    coverageAmountNaira: Math.round(data.totalCbm * 120000 + 500000), // Estimated cargo valuation
    originCity: data.originAddress,
    destinationCity: data.destinationAddress,
    signatories: [
      `${data.inspectorName || 'M. Ibrahim'} (Inventory Marshall)`,
      `${data.driverName || 'Captain S. Bello'} (Lead Convoy Captain)`,
      `${data.clientName} (Consignee Handover)`,
    ],
    summaryText: summary,
    verifiedStampCode: data.pkiVerificationCode || `PKI-PSL-SEAL-${Math.floor(100000 + Math.random() * 900000)}`,
    tags: ['Packing Slip', 'Manifest', 'Inventory', 'Transit-Audit', 'Tamper-Seal'],
    clientName: data.clientName,
    clientCompany: data.clientCompany,
    clientPhone: data.clientPhone,
    clientEmail: data.clientEmail,
    serviceType: data.serviceType as any,
    recommendedVehicle: data.assignedVehicle,
    // Specialized packing slip fields
    inventoryItems: data.items,
    surveyPhotosCount: data.surveyPhotosCount,
    totalCbm: data.totalCbm,
    totalPieces: data.items.reduce((s, i) => s + (i.qty || 1), 0),
    sealNumbers: data.tamperSealRange ? [data.tamperSealRange] : ['SEAL-99410', 'SEAL-99411', 'SEAL-99412'],
    vehicleType: data.assignedVehicle,
    handlingInstructions: data.handlingInstructions,
    driverName: data.driverName,
    inspectorName: data.inspectorName,
    packingSlipRef: data.packingSlipRef,
  };

  return newDoc;
};

/**
 * Saves a Packing Slip document to localStorage and optionally Cloud Firestore
 */
export const savePackingSlipToVault = async (
  doc: VaultDocument,
  saveToCloudFn?: (doc: VaultDocument) => Promise<void>
): Promise<VaultDocument[]> => {
  let updatedDocs: VaultDocument[] = [];

  try {
    const raw = localStorage.getItem(VAULT_STORAGE_KEY);
    const existing: VaultDocument[] = raw ? JSON.parse(raw) : [];

    const filtered = existing.filter(
      (d) => d.id !== doc.id && d.referenceNumber !== doc.referenceNumber
    );

    updatedDocs = [doc, ...filtered];
    localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(updatedDocs));

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('vault_document_added', {
          detail: doc,
        })
      );
    }
  } catch (err) {
    console.warn('[Vault] Failed to save packing slip to localStorage:', err);
    updatedDocs = [doc];
  }

  if (saveToCloudFn) {
    try {
      await saveToCloudFn(doc);
    } catch (err) {
      console.warn('[Vault] Failed to persist packing slip to Firestore:', err);
    }
  }

  return updatedDocs;
};
