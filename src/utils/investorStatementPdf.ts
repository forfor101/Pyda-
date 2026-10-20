import jsPDF from 'jspdf';
import { InvestorPayoutStatement } from '../types';

/**
 * Generates and triggers the download of a professional, executive-grade PDF
 * statement for monthly investor commissions and payout remittances.
 */
export function generateInvestorStatementPdf(statement: InvestorPayoutStatement): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  // 1. TOP HEADER BANNER (Dark Slate & Amber Accent)
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 42, 'F');

  // Amber Accent Line
  doc.setFillColor(245, 158, 11); // amber-500
  doc.rect(0, 42, pageWidth, 2.5, 'F');

  // Company Brand Name
  doc.setTextColor(245, 158, 11);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('MEGATREND MOVERS & LOGISTICS', margin, 14);

  // Subtitle & Accreditations
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Fleet Asset Management Division • Investor Payout & Remittance Advisory', margin, 20);

  doc.setTextColor(148, 163, 184); // slate-400
  doc.setFontSize(7.5);
  doc.text('RC: 1849204 | FRSC Licensed Fleet Operator: FRSC/FLT/2026/0891 | FIRS TIN: 2490192-0001', margin, 26);
  doc.text('Headquarters: 14B Admiralty Way, Lekki Phase 1, Lagos | 24/7 Investor Relations: +234 806 246 6212', margin, 32);
  doc.text('Portal: megatrend.ng | Official Treasury: fleet.investors@megatrend.ng', margin, 37);

  // Statement Ref Badge (Top Right)
  doc.setFillColor(30, 41, 59); // slate-800
  doc.roundedRect(pageWidth - 72, 8, 58, 26, 2, 2, 'F');

  doc.setTextColor(245, 158, 11); // amber-500
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('PAYOUT STATEMENT REF', pageWidth - 68, 14);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(statement.statementNumber, pageWidth - 68, 20);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text(`Period: ${statement.periodMonth}`, pageWidth - 68, 25);
  doc.text(`Issued: ${statement.issuedDate}`, pageWidth - 68, 30);

  let currentY = 51;

  // 2. STATEMENT TITLE & SETTLEMENT STATUS PILL
  doc.setTextColor(15, 23, 42); // slate-900
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('MONTHLY FLEET COMMISSION & PAYOUT REMITTANCE', margin, currentY);

  // Status Badge
  const isSettled = statement.status === 'settled';
  if (isSettled) {
    doc.setFillColor(236, 253, 245); // emerald-50
    doc.setDrawColor(16, 185, 129); // emerald-500
    doc.roundedRect(pageWidth - 52, currentY - 5, 38, 7.5, 1.5, 1.5, 'FD');
    doc.setTextColor(5, 150, 105); // emerald-600
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text('● SETTLED / DISBURSED', pageWidth - 50, currentY);
  } else {
    doc.setFillColor(254, 243, 199); // amber-50
    doc.setDrawColor(245, 158, 11); // amber-500
    doc.roundedRect(pageWidth - 52, currentY - 5, 38, 7.5, 1.5, 1.5, 'FD');
    doc.setTextColor(180, 83, 9); // amber-700
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text('● CYCLE IN PROGRESS', pageWidth - 50, currentY);
  }

  currentY += 6;

  // 3. INVESTOR & BANK SETTLEMENT PROFILE (2 Columns Box)
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setFillColor(248, 250, 252); // slate-50
  doc.roundedRect(margin, currentY, contentWidth, 34, 2, 2, 'FD');

  // Col 1: Investor Details
  doc.setTextColor(100, 116, 139); // slate-500
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('INVESTOR / FLEET ASSET OWNER', margin + 4, currentY + 6);

  doc.setTextColor(15, 23, 42); // slate-900
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(statement.investorName, margin + 4, currentY + 11);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(statement.companyName ? `${statement.companyName}` : 'Private Fleet Investor', margin + 4, currentY + 16);
  doc.text(`Email: ${statement.investorEmail} | Tel: ${statement.investorPhone}`, margin + 4, currentY + 21);
  doc.text(`FIRS TIN: ${statement.taxIdentificationNumber || 'Verified Individual TIN'}`, margin + 4, currentY + 26);
  doc.text(`Contract Model: ${statement.partnershipModel === 'revenue_share_management' ? '70/30 Net Revenue Share' : 'Fixed Guaranteed Monthly Lease'}`, margin + 4, currentY + 31);

  // Col 2: Bank Settlement Details
  const col2X = margin + 98;
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('DISBURSEMENT BENEFICIARY BANK (NIBSS NIP)', col2X, currentY + 6);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(statement.bankDetails.bankName, col2X, currentY + 11);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(`Account Name: ${statement.bankDetails.accountName}`, col2X, currentY + 16);
  doc.text(`Account Number: ${statement.bankDetails.accountNumber}`, col2X, currentY + 21);
  doc.text(`NIBSS Session Ref: ${statement.bankDetails.nibssSessionRef || 'Pending Batch'}`, col2X, currentY + 26);
  doc.text(`Settlement Date: ${statement.settlementDate || 'Pending Cycle Close'}`, col2X, currentY + 31);

  currentY += 40;

  // 4. FINANCIAL BREAKDOWN SUMMARY TABLE
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('1. Financial Remittance & Commission Breakdown', margin, currentY);

  currentY += 4;

  const fin = statement.financials;
  const items = [
    {
      desc: 'Gross Inter-state Haulage & Freight Revenue (Consolidated)',
      detail: `${statement.tripsSummary.length} verified cargo corridor dispatches completed`,
      amount: `₦${fin.grossHaulageRevenueNaira.toLocaleString('en-NG')}`,
      isDeduction: false,
    },
    {
      desc: `Megatrend Fleet Operations Management Fee (${fin.managementCommissionPercent}%)`,
      detail: 'Dispatch logistics, driver recruitment, telematics & enterprise cargo brokerage',
      amount: `-₦${fin.managementCommissionNaira.toLocaleString('en-NG')}`,
      isDeduction: true,
    },
    {
      desc: 'Goods-In-Transit (GIT) 100% Comprehensive Cargo Underwriting Reserve',
      detail: 'Underwritten by Leadway / AIICO Insurance for zero investor cargo liability',
      amount: `-₦${fin.gitInsuranceDeductionNaira.toLocaleString('en-NG')}`,
      isDeduction: true,
    },
    {
      desc: 'Federal Highway Corridors Tolls & Inter-state Interstate Levies',
      detail: 'FRSC weighbridges, state haulage permits & Lekki/Ore/Lokoja toll plazas',
      amount: `-₦${fin.roadTollLeviesNaira.toLocaleString('en-NG')}`,
      isDeduction: true,
    },
    {
      desc: `Statutory Withholding Tax (${fin.statutoryWhtPercent}% WHT Remitted to FIRS)`,
      detail: 'Federal Inland Revenue Service statutory credit note generated on investor behalf',
      amount: `-₦${fin.statutoryWhtNaira.toLocaleString('en-NG')}`,
      isDeduction: true,
    },
  ];

  // Table Header
  doc.setFillColor(30, 41, 59); // slate-800
  doc.rect(margin, currentY, contentWidth, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('ACCOUNTING LINE ITEM', margin + 3, currentY + 4.2);
  doc.text('SUB-LEDGER SPECIFICATIONS', margin + 70, currentY + 4.2);
  doc.text('AMOUNT (NAIRA)', pageWidth - margin - 30, currentY + 4.2);

  currentY += 6;

  items.forEach((row, idx) => {
    const isEven = idx % 2 === 0;
    doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
    doc.rect(margin, currentY, contentWidth, 7, 'F');

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(row.desc, margin + 3, currentY + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(row.detail, margin + 70, currentY + 4.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    if (row.isDeduction) {
      doc.setTextColor(220, 38, 38); // red-600
    } else {
      doc.setTextColor(15, 23, 42);
    }
    doc.text(row.amount, pageWidth - margin - 30, currentY + 4.5);

    currentY += 7;
  });

  // Net Payout Highlight Bar
  doc.setFillColor(254, 243, 199); // amber-100
  doc.setDrawColor(245, 158, 11); // amber-500
  doc.rect(margin, currentY, contentWidth, 10, 'FD');

  doc.setTextColor(120, 53, 15); // amber-900
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL NET PAYOUT DISBURSED TO INVESTOR', margin + 3, currentY + 6.5);

  doc.setTextColor(180, 83, 9); // amber-700
  doc.setFontSize(12);
  doc.text(`₦${fin.netPayoutNaira.toLocaleString('en-NG')}`, pageWidth - margin - 36, currentY + 7);

  currentY += 16;

  // 5. REGISTERED FLEET TRUCKS AUDIT
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('2. Assigned Fleet Trucks Performance', margin, currentY);

  currentY += 4;

  // Header
  doc.setFillColor(30, 41, 59);
  doc.rect(margin, currentY, contentWidth, 5.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.text('VEHICLE REGISTRATION / VIN', margin + 3, currentY + 3.8);
  doc.text('MAKE & MODEL SPECIFICATION', margin + 46, currentY + 3.8);
  doc.text('TONNAGE / BODY', margin + 98, currentY + 3.8);
  doc.text('TRIPS', margin + 126, currentY + 3.8);
  doc.text('KM LOGGED', margin + 140, currentY + 3.8);
  doc.text('GROSS YIELD', pageWidth - margin - 22, currentY + 3.8);

  currentY += 5.5;

  statement.assignedTrucks.forEach((truck, idx) => {
    const isEven = idx % 2 === 0;
    doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
    doc.rect(margin, currentY, contentWidth, 6.5, 'F');

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(truck.plateNumber, margin + 3, currentY + 4.2);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(51, 65, 85);
    doc.text(`${truck.truckMake} ${truck.truckModel}`, margin + 46, currentY + 4.2);

    doc.text(`${truck.tonnageCapacity} Tons • ${truck.cargoLengthFt || 'Dry Box'}`, margin + 98, currentY + 4.2);
    doc.text(`${truck.tripsCompleted}`, margin + 128, currentY + 4.2);
    doc.text(`${truck.totalDistanceKm.toLocaleString()} km`, margin + 140, currentY + 4.2);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(5, 150, 105); // emerald-600
    doc.text(`₦${truck.grossContributionNaira.toLocaleString('en-NG')}`, pageWidth - margin - 24, currentY + 4.2);

    currentY += 6.5;
  });

  currentY += 6;

  // 6. ITEMIZED TRIP DISPATCH MANIFEST (Up to 5 on Page 1)
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('3. Verified Dispatch Runs & Cargo Manifest', margin, currentY);

  currentY += 4;

  doc.setFillColor(30, 41, 59);
  doc.rect(margin, currentY, contentWidth, 5.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.text('DATE', margin + 3, currentY + 3.8);
  doc.text('WAYBILL #', margin + 20, currentY + 3.8);
  doc.text('TRANSIT CORRIDOR / ROUTE', margin + 50, currentY + 3.8);
  doc.text('TRUCK', margin + 112, currentY + 3.8);
  doc.text('CARGO TYPE', margin + 130, currentY + 3.8);
  doc.text('NET TO INVESTOR', pageWidth - margin - 24, currentY + 3.8);

  currentY += 5.5;

  const displayTrips = statement.tripsSummary.slice(0, 5);
  displayTrips.forEach((trip, idx) => {
    const isEven = idx % 2 === 0;
    doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
    doc.rect(margin, currentY, contentWidth, 6, 'F');

    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(trip.date, margin + 3, currentY + 4);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(trip.waybillNumber, margin + 20, currentY + 4);

    doc.setFont('helvetica', 'normal');
    doc.text(trip.route.length > 36 ? trip.route.slice(0, 34) + '...' : trip.route, margin + 50, currentY + 4);

    doc.setFont('helvetica', 'bold');
    doc.text(trip.truckPlate, margin + 112, currentY + 4);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(trip.cargoCategory.length > 25 ? trip.cargoCategory.slice(0, 23) + '...' : trip.cargoCategory, margin + 130, currentY + 4);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(5, 150, 105);
    doc.text(`₦${trip.investorNetNaira.toLocaleString('en-NG')}`, pageWidth - margin - 24, currentY + 4);

    currentY += 6;
  });

  currentY += 8;

  // 7. AUTHORIZATION SEAL & VERIFICATION SIGNATURE BLOCK
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, currentY, contentWidth, 24, 2, 2, 'FD');

  // Official Stamp Box
  doc.setDrawColor(16, 185, 129); // emerald-500
  doc.setFillColor(236, 253, 245); // emerald-50
  doc.roundedRect(margin + 4, currentY + 3, 48, 18, 1.5, 1.5, 'FD');

  doc.setTextColor(5, 150, 105);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.text('MEGATREND TREASURY AUDIT', margin + 6, currentY + 7.5);
  doc.setFontSize(5.5);
  doc.setFont('helvetica', 'normal');
  doc.text('VERIFIED & DISBURSED VIA CBN NIP', margin + 6, currentY + 11.5);
  doc.text(`SEAL: ${statement.authorizedSignatory.corporateSealNumber}`, margin + 6, currentY + 15);
  doc.text(`TIMESTAMP: ${statement.settlementDate || statement.issuedDate} 10:00 GMT+1`, margin + 6, currentY + 18.5);

  // Signatory Details
  const sigX = margin + 60;
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('AUTHORIZED DISBURSEMENT OFFICER', sigX, currentY + 7);

  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(statement.authorizedSignatory.name, sigX, currentY + 12);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(statement.authorizedSignatory.title, sigX, currentY + 16.5);
  doc.text(`Signed & Released: ${statement.authorizedSignatory.signatureDate}`, sigX, currentY + 20.5);

  // QR / Barcode Verification Ref
  const qrX = pageWidth - margin - 58;
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.text('ELECTRONIC SETTLEMENT PROOF', qrX, currentY + 7);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.text(`Session ID: ${statement.bankDetails.nibssSessionRef || 'BATCH-AUTO'}`, qrX, currentY + 11.5);
  doc.text(`TRX Ref: ${statement.financials.disbursementReference}`, qrX, currentY + 15.5);
  doc.text('Verify authenticity at verify.megatrend.ng/payouts', qrX, currentY + 19.5);

  // 8. BOTTOM COMPLIANCE FOOTER
  doc.setFillColor(15, 23, 42);
  doc.rect(0, pageHeight - 8, pageWidth, 8, 'F');
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Megatrend Movers & Logistics Ltd • Nigeria Corporate Headquarters • This statement is an official financial legal record.', margin, pageHeight - 3);
  doc.text(`Statement Ref: ${statement.statementNumber} • Page 1 of 1`, pageWidth - margin - 42, pageHeight - 3);

  // Save the document
  const fileName = `Megatrend_Payout_Statement_${statement.periodCode}_${statement.statementNumber}.pdf`;
  doc.save(fileName);
}

/**
 * Generates and triggers the download of an Annual Consolidated Earnings
 * and Tax Withholding Summary Statement for Fleet Investors.
 */
export function generateAnnualConsolidatedStatementPdf(
  statements: InvestorPayoutStatement[],
  investorName: string,
  year = '2026'
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  // Header Banner
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 40, 'F');
  doc.setFillColor(245, 158, 11);
  doc.rect(0, 40, pageWidth, 2.5, 'F');

  doc.setTextColor(245, 158, 11);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('MEGATREND MOVERS & LOGISTICS', margin, 14);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Fleet Investor Annual Consolidated Earnings & Tax Statement — Calendar Year ${year}`, margin, 20);

  doc.setTextColor(148, 163, 184);
  doc.setFontSize(7.5);
  doc.text(`Investor: ${investorName} | FIRS Corporate Tax Schedule | Certified Treasury Copy`, margin, 26);
  doc.text('24/7 Investor Hotline: +234 806 246 6212 | fleet.investors@megatrend.ng', margin, 32);

  let currentY = 50;

  // Totals
  const totalGross = statements.reduce((acc, s) => acc + s.financials.grossHaulageRevenueNaira, 0);
  const totalComm = statements.reduce((acc, s) => acc + s.financials.managementCommissionNaira, 0);
  const totalGit = statements.reduce((acc, s) => acc + s.financials.gitInsuranceDeductionNaira, 0);
  const totalWht = statements.reduce((acc, s) => acc + s.financials.statutoryWhtNaira, 0);
  const totalNet = statements.reduce((acc, s) => acc + s.financials.netPayoutNaira, 0);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`Annual Fleet Performance Ledger (${year})`, margin, currentY);

  currentY += 6;

  // Summary Metrics Cards (3 Cards)
  const cardW = (contentWidth - 8) / 3;
  
  // Card 1: Gross
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, currentY, cardW, 20, 2, 2, 'FD');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('TOTAL GROSS FREIGHT REVENUE', margin + 3, currentY + 6);
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`₦${totalGross.toLocaleString('en-NG')}`, margin + 3, currentY + 14);

  // Card 2: WHT
  doc.roundedRect(margin + cardW + 4, currentY, cardW, 20, 2, 2, 'FD');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('TOTAL 5% WHT REMITTED (FIRS)', margin + cardW + 7, currentY + 6);
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(220, 38, 38);
  doc.text(`₦${totalWht.toLocaleString('en-NG')}`, margin + cardW + 7, currentY + 14);

  // Card 3: Net Disbursed
  doc.setFillColor(254, 243, 199);
  doc.setDrawColor(245, 158, 11);
  doc.roundedRect(margin + (cardW + 4) * 2, currentY, cardW, 20, 2, 2, 'FD');
  doc.setFontSize(7);
  doc.setTextColor(120, 53, 15);
  doc.text('TOTAL NET REMITTED TO INVESTOR', margin + (cardW + 4) * 2 + 3, currentY + 6);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(180, 83, 9);
  doc.text(`₦${totalNet.toLocaleString('en-NG')}`, margin + (cardW + 4) * 2 + 3, currentY + 14);

  currentY += 28;

  // Monthly breakdown table
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Monthly Settlement History', margin, currentY);

  currentY += 4;

  doc.setFillColor(30, 41, 59);
  doc.rect(margin, currentY, contentWidth, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('PERIOD', margin + 3, currentY + 4.2);
  doc.text('STATEMENT #', margin + 30, currentY + 4.2);
  doc.text('GROSS REVENUE', margin + 74, currentY + 4.2);
  doc.text('MGMT COMM (30%)', margin + 110, currentY + 4.2);
  doc.text('WHT (5%)', margin + 142, currentY + 4.2);
  doc.text('NET DISBURSED', pageWidth - margin - 26, currentY + 4.2);

  currentY += 6;

  statements.forEach((s, idx) => {
    const isEven = idx % 2 === 0;
    doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
    doc.rect(margin, currentY, contentWidth, 7, 'F');

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(s.periodMonth, margin + 3, currentY + 4.8);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(s.statementNumber, margin + 30, currentY + 4.8);

    doc.setTextColor(15, 23, 42);
    doc.text(`₦${s.financials.grossHaulageRevenueNaira.toLocaleString('en-NG')}`, margin + 74, currentY + 4.8);

    doc.setTextColor(220, 38, 38);
    doc.text(`-₦${s.financials.managementCommissionNaira.toLocaleString('en-NG')}`, margin + 110, currentY + 4.8);
    doc.text(`-₦${s.financials.statutoryWhtNaira.toLocaleString('en-NG')}`, margin + 142, currentY + 4.8);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(5, 150, 105);
    doc.text(`₦${s.financials.netPayoutNaira.toLocaleString('en-NG')}`, pageWidth - margin - 26, currentY + 4.8);

    currentY += 7;
  });

  // Footer
  doc.setFillColor(15, 23, 42);
  doc.rect(0, pageHeight - 8, pageWidth, 8, 'F');
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Megatrend Movers & Logistics Ltd • Annual Fiscal Statement • Generated for Official Tax Reporting & FIRS Clearance.', margin, pageHeight - 3);

  doc.save(`Megatrend_Annual_Consolidated_Statements_${year}.pdf`);
}
