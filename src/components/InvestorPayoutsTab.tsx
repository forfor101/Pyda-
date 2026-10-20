import React, { useState } from 'react';
import {
  Coins,
  FileDown,
  Download,
  CheckCircle2,
  Clock,
  Building2,
  Truck,
  Calendar,
  ShieldCheck,
  Eye,
  X,
  FileText,
  AlertCircle,
  ArrowUpRight,
  Wallet,
  Scale,
  Sparkles,
  MapPin,
  ChevronRight,
  Receipt,
  Gauge
} from 'lucide-react';
import { InvestorPayoutStatement } from '../types';
import { SAMPLE_INVESTOR_STATEMENTS } from '../data/sampleInvestorStatements';
import { generateInvestorStatementPdf, generateAnnualConsolidatedStatementPdf } from '../utils/investorStatementPdf';
import { ActiveFleetPerformanceSummary } from './ActiveFleetPerformanceSummary';

interface InvestorPayoutsTabProps {
  investorName?: string;
  investorCompany?: string;
  onNavigateToInvestorRegistration?: () => void;
  onShowToast?: (msg: string, type?: 'success' | 'info') => void;
}

export const InvestorPayoutsTab: React.FC<InvestorPayoutsTabProps> = ({
  investorName = 'Chief Adebayo Alabi',
  investorCompany = 'Alabi Prime Logistics Ltd',
  onNavigateToInvestorRegistration,
  onShowToast,
}) => {
  // Statements State
  const [statements, setStatements] = useState<InvestorPayoutStatement[]>(SAMPLE_INVESTOR_STATEMENTS);
  const [subTab, setSubTab] = useState<'performance' | 'statements'>('performance');
  const [statusFilter, setStatusFilter] = useState<'all' | 'settled' | 'processing'>('all');
  const [selectedStatementForModal, setSelectedStatementForModal] = useState<InvestorPayoutStatement | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [isDownloadingAnnual, setIsDownloadingAnnual] = useState(false);

  // Filtered statements
  const filteredStatements = statements.filter((s) => {
    if (statusFilter === 'all') return true;
    return s.status === statusFilter;
  });

  // Calculate Cumulative Metrics
  const settledStatements = statements.filter((s) => s.status === 'settled');
  const totalCumulativeNetPayout = settledStatements.reduce((acc, s) => acc + s.financials.netPayoutNaira, 0);
  const activeCycleStatement = statements.find((s) => s.status === 'processing');
  const currentMonthAccrued = activeCycleStatement ? activeCycleStatement.financials.netPayoutNaira : 0;
  const uniqueTruckPlates = Array.from(
    new Set(statements.flatMap((s) => s.assignedTrucks.map((t) => t.plateNumber)))
  );

  // Handle Download Single Monthly Statement PDF
  const handleDownloadStatement = (statement: InvestorPayoutStatement) => {
    setDownloadingId(statement.id);
    try {
      generateInvestorStatementPdf(statement);
      onShowToast?.(
        `Official monthly payout statement for ${statement.periodMonth} downloaded successfully (Ref: ${statement.statementNumber})!`,
        'success'
      );
    } catch (err: any) {
      console.error('Failed to generate PDF:', err);
      onShowToast?.(`Failed to generate PDF: ${err.message || 'Unknown error'}`, 'info');
    } finally {
      setTimeout(() => setDownloadingId(null), 800);
    }
  };

  // Handle Download Consolidated Annual Statement PDF
  const handleDownloadAnnualConsolidated = () => {
    setIsDownloadingAnnual(true);
    try {
      generateAnnualConsolidatedStatementPdf(settledStatements, investorName, '2026');
      onShowToast?.(
        'Annual Consolidated Earnings & Tax Statement (2026) downloaded successfully!',
        'success'
      );
    } catch (err: any) {
      console.error('Failed to generate annual statement:', err);
      onShowToast?.(`Failed to generate annual statement: ${err.message}`, 'info');
    } finally {
      setTimeout(() => setIsDownloadingAnnual(false), 800);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* ========================================================================= */}
      {/* TOP INVESTOR SUB-NAVIGATION SWITCHER */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-between gap-4 flex-wrap bg-slate-900/90 border border-slate-800 p-2 rounded-2xl shadow-xl">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setSubTab('performance')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              subTab === 'performance'
                ? 'bg-amber-500 text-slate-950 font-black shadow-lg ring-2 ring-amber-400/20'
                : 'text-slate-400 hover:text-white bg-slate-950/60 hover:bg-slate-800'
            }`}
            id="investor-fleet-performance-subtab-btn"
          >
            <Gauge className="w-4 h-4" />
            <span>Active Fleet Performance</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
              subTab === 'performance' ? 'bg-slate-950 text-amber-400' : 'bg-slate-800 text-amber-400'
            }`}>
              Recharts Telematics
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('statements')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              subTab === 'statements'
                ? 'bg-amber-500 text-slate-950 font-black shadow-lg ring-2 ring-amber-400/20'
                : 'text-slate-400 hover:text-white bg-slate-950/60 hover:bg-slate-800'
            }`}
            id="investor-payout-statements-subtab-btn"
          >
            <Receipt className="w-4 h-4" />
            <span>Payout Statements & Remittance</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
              subTab === 'statements' ? 'bg-slate-950 text-amber-400' : 'bg-slate-800 text-slate-300'
            }`}>
              {statements.length} Statements
            </span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Partner: <strong className="text-slate-200">{investorCompany}</strong></span>
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUBTAB 1: ACTIVE FLEET PERFORMANCE TELEMETRICS */}
      {/* ========================================================================= */}
      {subTab === 'performance' && (
        <div className="space-y-6">
          <ActiveFleetPerformanceSummary
            investorName={investorName}
            investorCompany={investorCompany}
          />

          {/* Quick Remittance Teaser & Statement Switcher */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-black text-white">
                  Financial Settlement & Remittance Statements Available
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Cumulative settled earnings: <strong className="text-emerald-400 font-mono">₦{totalCumulativeNetPayout.toLocaleString('en-NG')}</strong> across {settledStatements.length} reconciled statements.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSubTab('statements')}
              className="w-full md:w-auto bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow flex items-center justify-center gap-2 transition-all active:scale-95 shrink-0"
            >
              <span>View Monthly Statements & PDF Receipts</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 2: MONTHLY PAYOUT STATEMENTS & REMITTANCE */}
      {/* ========================================================================= */}
      {subTab === 'statements' && (
        <div className="space-y-6">
      {/* Top Banner & KPI Cards */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800/80">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/10">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  Investor Fleet Commission & Payout Statements
                </h3>
                <span className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>NIBSS NIP Verified Partner</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                Review verified monthly haulage earnings, operating commission deductions (70/30 Net Split), statutory FIRS withholding tax receipts, and download official PDF remittance statements.
              </p>
            </div>
          </div>

          {/* Action Button: Annual Consolidated PDF */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={isDownloadingAnnual}
              onClick={handleDownloadAnnualConsolidated}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              id="download-annual-statement-btn"
              title="Download consolidated annual earnings report for tax filing and audits"
            >
              <FileDown className={`w-4 h-4 ${isDownloadingAnnual ? 'animate-bounce' : ''}`} />
              <span>{isDownloadingAnnual ? 'Preparing PDF...' : 'Download 2026 Annual Summary (PDF)'}</span>
            </button>
          </div>
        </div>

        {/* 4 Financial Highlight Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
          <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Cumulative Net Disbursed</span>
              <Wallet className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-black text-white mt-1.5 font-mono">
              ₦{totalCumulativeNetPayout.toLocaleString('en-NG')}
            </p>
            <div className="flex items-center gap-1.5 mt-2 text-[11px] text-emerald-400">
              <CheckCircle2 className="w-3 h-3" />
              <span>100% Settled to Access Bank PLC</span>
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Current Cycle Accrued</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl font-black text-amber-400 mt-1.5 font-mono">
              ₦{currentMonthAccrued.toLocaleString('en-NG')}
            </p>
            <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span>September 2026 in progress</span>
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Active Fleet Assets</span>
              <Truck className="w-4 h-4 text-sky-400" />
            </div>
            <p className="text-2xl font-black text-white mt-1.5">
              {uniqueTruckPlates.length} Commercial Trucks
            </p>
            <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-400 font-mono">
              <span>LSR-442-XY (15T) • KJA-883-AB (30T)</span>
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Contract Partnership Model</span>
              <Scale className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-lg font-black text-white mt-1.5">
              70 / 30 Net Rev Share
            </p>
            <div className="flex items-center gap-1.5 mt-2 text-[11px] text-purple-300">
              <span>100% Comprehensive GIT Underwritten</span>
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar: Filter Tabs & Registration Prompt */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl self-start">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              statusFilter === 'all'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Statements ({statements.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('settled')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              statusFilter === 'settled'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Settled / Paid ({settledStatements.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('processing')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              statusFilter === 'processing'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            In Progress (1)
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Statements generated in compliance with FIRS & NIBSS Instant Settlement standards</span>
        </div>
      </div>

      {/* Monthly Statements Grid */}
      <div className="space-y-4">
        {filteredStatements.map((statement) => {
          const isSettled = statement.status === 'settled';
          const isDownloading = downloadingId === statement.id;

          return (
            <div
              key={statement.id}
              className="bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 sm:p-6 transition-all duration-200 shadow-md space-y-4"
            >
              {/* Card Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isSettled
                        ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                        : 'bg-amber-500/15 border border-amber-500/30 text-amber-400'
                    }`}
                  >
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h4 className="text-base sm:text-lg font-black text-white">
                        {statement.periodMonth} Statement
                      </h4>
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                          isSettled
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isSettled ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'
                          }`}
                        />
                        <span>{isSettled ? 'Settled & Disbursed' : 'Cycle in Progress'}</span>
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        Ref: <strong className="text-slate-300">{statement.statementNumber}</strong>
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-3">
                      <span>Issued: {statement.issuedDate}</span>
                      {statement.settlementDate && (
                        <>
                          <span>•</span>
                          <span className="text-emerald-400">Settled: {statement.settlementDate}</span>
                        </>
                      )}
                      <span>•</span>
                      <span>Beneficiary: {statement.bankDetails.bankName} ({statement.bankDetails.accountNumber})</span>
                    </p>
                  </div>
                </div>

                {/* Primary Actions: Download PDF & View Details */}
                <div className="flex items-center gap-2.5 self-start md:self-center">
                  <button
                    type="button"
                    onClick={() => setSelectedStatementForModal(statement)}
                    className="bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors"
                    id={`view-details-${statement.id}`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Breakdown</span>
                  </button>

                  <button
                    type="button"
                    disabled={isDownloading}
                    onClick={() => handleDownloadStatement(statement)}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black px-4 py-2 rounded-xl shadow flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                    id={`download-pdf-${statement.id}`}
                    title="Download high-resolution official PDF remittance statement"
                  >
                    <FileDown className={`w-4 h-4 ${isDownloading ? 'animate-bounce' : ''}`} />
                    <span>{isDownloading ? 'Generating PDF...' : 'Download Statement PDF'}</span>
                  </button>
                </div>
              </div>

              {/* Financial Summary Line Items */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-1">
                <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3">
                  <span className="text-[11px] text-slate-400 block font-medium">Gross Freight Billings</span>
                  <span className="text-sm sm:text-base font-black text-white font-mono mt-0.5 block">
                    ₦{statement.financials.grossHaulageRevenueNaira.toLocaleString('en-NG')}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    {statement.tripsSummary.length} Cargo Dispatches
                  </span>
                </div>

                <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3">
                  <span className="text-[11px] text-slate-400 block font-medium">Pyda Ops Fee ({statement.financials.managementCommissionPercent}%)</span>
                  <span className="text-sm sm:text-base font-black text-red-400 font-mono mt-0.5 block">
                    -₦{statement.financials.managementCommissionNaira.toLocaleString('en-NG')}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Turnkey fleet operations
                  </span>
                </div>

                <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3">
                  <span className="text-[11px] text-slate-400 block font-medium">GIT Insurance (100% Policy)</span>
                  <span className="text-sm sm:text-base font-black text-slate-300 font-mono mt-0.5 block">
                    -₦{statement.financials.gitInsuranceDeductionNaira.toLocaleString('en-NG')}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Leadway Underwritten
                  </span>
                </div>

                <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3">
                  <span className="text-[11px] text-slate-400 block font-medium">FIRS 5% WHT Remitted</span>
                  <span className="text-sm sm:text-base font-black text-red-400 font-mono mt-0.5 block">
                    -₦{statement.financials.statutoryWhtNaira.toLocaleString('en-NG')}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Tax Credit Available
                  </span>
                </div>

                <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-3 col-span-2 sm:col-span-1">
                  <span className="text-[11px] text-emerald-400 block font-bold">Net Disbursed to Investor</span>
                  <span className="text-base sm:text-lg font-black text-emerald-400 font-mono mt-0.5 block">
                    ₦{statement.financials.netPayoutNaira.toLocaleString('en-NG')}
                  </span>
                  <span className="text-[10px] text-emerald-500/80 mt-1 block truncate">
                    {statement.bankDetails.nibssSessionRef
                      ? statement.bankDetails.nibssSessionRef.slice(0, 18) + '...'
                      : 'Pending Cycle Close'}
                  </span>
                </div>
              </div>

              {/* Quick Fleet & Corridor Summary */}
              <div className="bg-slate-950/50 border border-slate-800/60 rounded-xl px-4 py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 flex-wrap text-slate-300">
                  <Truck className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-semibold text-white">Assigned Units:</span>
                  {statement.assignedTrucks.map((truck) => (
                    <span
                      key={truck.plateNumber}
                      className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-[11px] font-mono text-slate-300"
                    >
                      {truck.plateNumber} ({truck.truckMake} {truck.truckModel} • {truck.tripsCompleted} trips)
                    </span>
                  ))}
                </div>

                <div className="text-slate-400 text-[11px] flex items-center gap-1 self-end md:self-center">
                  <span>Signatory: {statement.authorizedSignatory.name} ({statement.authorizedSignatory.title})</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      </div>
      )}

      {/* Full Statement Inspection & Itemized Cargo Manifest Modal */}
      {selectedStatementForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="bg-slate-950 px-6 py-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">
                    Payout Statement: {selectedStatementForModal.periodMonth}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Ref: {selectedStatementForModal.statementNumber} • Issued: {selectedStatementForModal.issuedDate}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadStatement(selectedStatementForModal)}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedStatementForModal(null)}
                  className="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Scrollable Content */}
            <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(92vh-140px)]">
              {/* Investor & Bank Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-2">
                  <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                    Investor & Entity Details
                  </span>
                  <p className="text-base font-black text-white">{selectedStatementForModal.investorName}</p>
                  <p className="text-xs text-slate-300">{selectedStatementForModal.companyName}</p>
                  <p className="text-xs text-slate-400 font-mono">
                    TIN: {selectedStatementForModal.taxIdentificationNumber} • Phone: {selectedStatementForModal.investorPhone}
                  </p>
                  <p className="text-xs text-amber-400/90 font-medium">
                    Contract: 70/30 Net Haulage Revenue Share
                  </p>
                </div>

                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-2">
                  <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                    Disbursement Beneficiary Bank (NIP)
                  </span>
                  <p className="text-base font-black text-white">{selectedStatementForModal.bankDetails.bankName}</p>
                  <p className="text-xs text-slate-300 font-mono">
                    Account: {selectedStatementForModal.bankDetails.accountNumber} ({selectedStatementForModal.bankDetails.accountName})
                  </p>
                  <p className="text-xs text-slate-400 font-mono">
                    NIBSS Ref: {selectedStatementForModal.bankDetails.nibssSessionRef}
                  </p>
                  <p className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Settled on {selectedStatementForModal.settlementDate || 'Processing cycle'}</span>
                  </p>
                </div>
              </div>

              {/* Financial Ledger Table */}
              <div>
                <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <span>Audited Financial Remittance Ledger</span>
                </h4>
                <div className="border border-slate-800 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold">
                      <tr>
                        <th className="py-3 px-4">Line Item Description</th>
                        <th className="py-3 px-4">Policy / Notes</th>
                        <th className="py-3 px-4 text-right">Amount (NGN)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 bg-slate-900/50">
                      <tr>
                        <td className="py-3 px-4 font-bold text-white">Gross Inter-state Freight Revenue</td>
                        <td className="py-3 px-4 text-slate-400">
                          {selectedStatementForModal.tripsSummary.length} verified corridor cargo runs
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-white">
                          ₦{selectedStatementForModal.financials.grossHaulageRevenueNaira.toLocaleString('en-NG')}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-bold text-slate-300">
                          Pyda Management & Operations Fee ({selectedStatementForModal.financials.managementCommissionPercent}%)
                        </td>
                        <td className="py-3 px-4 text-slate-400">
                          Driver dispatch, route security escorts & maintenance ops
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-red-400">
                          -₦{selectedStatementForModal.financials.managementCommissionNaira.toLocaleString('en-NG')}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-bold text-slate-300">Goods-In-Transit (GIT) 100% Policy Cover</td>
                        <td className="py-3 px-4 text-slate-400">Leadway Insurance Underwritten</td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-red-400">
                          -₦{selectedStatementForModal.financials.gitInsuranceDeductionNaira.toLocaleString('en-NG')}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-bold text-slate-300">Highway Tolls & Weighbridge Interstate Levies</td>
                        <td className="py-3 px-4 text-slate-400">Statutory highway transit permits</td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-red-400">
                          -₦{selectedStatementForModal.financials.roadTollLeviesNaira.toLocaleString('en-NG')}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-bold text-slate-300">
                          Statutory Withholding Tax ({selectedStatementForModal.financials.statutoryWhtPercent}% WHT)
                        </td>
                        <td className="py-3 px-4 text-slate-400">Remitted to Federal Inland Revenue Service (FIRS)</td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-red-400">
                          -₦{selectedStatementForModal.financials.statutoryWhtNaira.toLocaleString('en-NG')}
                        </td>
                      </tr>
                      <tr className="bg-amber-500/10 font-black">
                        <td className="py-3.5 px-4 text-amber-400 font-bold text-sm">
                          TOTAL NET DISBURSED TO INVESTOR
                        </td>
                        <td className="py-3.5 px-4 text-amber-300/80 text-xs">
                          Direct Electronic Wire via NIBSS NIP
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-base font-black text-amber-400">
                          ₦{selectedStatementForModal.financials.netPayoutNaira.toLocaleString('en-NG')}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Itemized Cargo Manifest */}
              <div>
                <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-amber-400" />
                  <span>Itemized Dispatch Runs & Waybill Manifest</span>
                </h4>
                <div className="border border-slate-800 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold">
                      <tr>
                        <th className="py-3 px-3">Date</th>
                        <th className="py-3 px-3">Waybill #</th>
                        <th className="py-3 px-3">Transit Corridor</th>
                        <th className="py-3 px-3">Truck</th>
                        <th className="py-3 px-3">Cargo</th>
                        <th className="py-3 px-3 text-right">Investor Net</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 bg-slate-900/50">
                      {selectedStatementForModal.tripsSummary.map((trip) => (
                        <tr key={trip.tripId} className="hover:bg-slate-850/50 transition-colors">
                          <td className="py-2.5 px-3 text-slate-400 font-mono">{trip.date}</td>
                          <td className="py-2.5 px-3 font-bold text-white font-mono">{trip.waybillNumber}</td>
                          <td className="py-2.5 px-3 text-slate-200">{trip.route}</td>
                          <td className="py-2.5 px-3 font-mono text-amber-400 font-bold">{trip.truckPlate}</td>
                          <td className="py-2.5 px-3 text-slate-400">{trip.cargoCategory}</td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400">
                            ₦{trip.investorNetNaira.toLocaleString('en-NG')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Signatory & Treasury Seal Info */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">
                      Certified By {selectedStatementForModal.authorizedSignatory.name}
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      {selectedStatementForModal.authorizedSignatory.title} • Seal: {selectedStatementForModal.authorizedSignatory.corporateSealNumber}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDownloadStatement(selectedStatementForModal)}
                  className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow flex items-center justify-center gap-2 transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Formatted PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
