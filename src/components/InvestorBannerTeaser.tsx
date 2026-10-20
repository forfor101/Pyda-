import React, { useState } from 'react';
import { 
  HandCoins, 
  ArrowRight, 
  Truck, 
  CheckCircle2, 
  ShieldCheck, 
  TrendingUp, 
  Coins, 
  Calendar, 
  Send, 
  MessageCircle, 
  FileText, 
  Building2, 
  Cpu, 
  Phone,
  Sparkles,
  Download,
  Activity
} from 'lucide-react';
import { useCms } from '../context/CmsContext';
import { db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import confetti from 'canvas-confetti';
import jsPDF from 'jspdf';

interface InvestorBannerTeaserProps {
  onNavigateToInvestors: () => void;
}

export const InvestorBannerTeaser: React.FC<InvestorBannerTeaserProps> = ({
  onNavigateToInvestors,
}) => {
  const { cms } = useCms();
  const { company } = cms;

  const [formOpen, setFormOpen] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Quick Registration Form State
  const [formData, setFormData] = useState({
    ownerName: '',
    phone: '',
    email: '',
    truckCategory: '3.5_5_ton',
    truckCount: '1',
    baseCity: 'Lagos',
    partnershipModel: 'fixed_monthly_lease',
    notes: '',
  });

  const truckCategories = [
    {
      id: '3.5_5_ton',
      title: '3.5 – 5 Ton Canter / Box Van',
      payout: '₦650,000 – ₦900,000',
      period: 'Monthly Net Remittance',
      examples: 'Mitsubishi Canter, Isuzu NPR, Hyundai Mighty',
      focus: 'Intra-city FMCG, residential moves & express bank dispatch',
      annualRoi: '34% Annual ROI',
      badgeColor: 'bg-amber-400 text-slate-950',
    },
    {
      id: '10_15_ton',
      title: '10 – 15 Ton Enclosed Hauler',
      payout: '₦1,100,000 – ₦1,550,000',
      period: 'Monthly Net Remittance',
      examples: 'Mercedes-Benz Atego, DAF LF, MAN TGL',
      focus: 'Interstate corporate migrations & heavy commercial transit',
      annualRoi: '38% Annual ROI',
      badgeColor: 'bg-emerald-400 text-slate-950',
      popular: true,
    },
    {
      id: '20_30_ton',
      title: '20 – 30 Ton Articulated Trailer',
      payout: '₦1,800,000 – ₦2,600,000',
      period: 'Monthly Net Remittance',
      examples: 'Mack Granite, DAF CF/XF, Sino Truck Howo',
      focus: 'Long-haul national corridors & maritime port haulage',
      annualRoi: '42% Annual ROI',
      badgeColor: 'bg-cyan-400 text-slate-950',
    },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleQuickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.ownerName || !formData.phone) return;

    setSubmitting(true);
    const refCode = `PYDA-FLT-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      if (db) {
        await addDoc(collection(db, 'investor_truck_registrations'), {
          ...formData,
          referenceCode: refCode,
          submittedAt: new Date().toISOString(),
          status: 'pending_survey_inspection',
        });
      }
    } catch (err) {
      console.warn('Firestore fallback: Saving registration to local storage', err);
    }

    try {
      const existing = JSON.parse(localStorage.getItem('pyda_truck_registrations') || '[]');
      existing.unshift({
        ...formData,
        referenceCode: refCode,
        submittedAt: new Date().toISOString(),
      });
      localStorage.setItem('pyda_truck_registrations', JSON.stringify(existing));
    } catch (e) {
      // ignore
    }

    try {
      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {
      // ignore
    }

    setSubmitting(false);
    setSubmittedRef(refCode);
  };

  const generateQuickTermSheetPdf = (refCode: string) => {
    try {
      const doc = new jsPDF();
      doc.setFillColor(9, 14, 26);
      doc.rect(0, 0, 210, 35, 'F');

      doc.setTextColor(245, 158, 11);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('PYDA MOVERS & LOGISTICS LTD', 14, 18);

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Fleet Management & Commercial Truck Asset Partnership Division', 14, 26);

      doc.setTextColor(30, 41, 59);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('PROVISIONAL FLEET INTAKE CONFIRMATION', 14, 48);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Reference ID: ${refCode}`, 14, 56);
      doc.text(`Date of Registration: ${new Date().toLocaleDateString('en-GB')}`, 14, 62);
      doc.text(`Fleet Owner / Company: ${formData.ownerName}`, 14, 68);
      doc.text(`Contact Phone: ${formData.phone}`, 14, 74);
      doc.text(`Truck Category: ${formData.truckCategory.replace('_', ' - ').toUpperCase()} Tons`, 14, 80);
      doc.text(`Number of Units: ${formData.truckCount}`, 14, 86);
      doc.text(`Base Inspection City: ${formData.baseCity}`, 14, 92);
      doc.text(`Preferred Model: ${formData.partnershipModel === 'fixed_monthly_lease' ? 'Fixed Guaranteed Monthly Lease' : '70/30 Net Revenue Share'}`, 14, 98);

      doc.setDrawColor(226, 232, 240);
      doc.line(14, 106, 196, 106);

      doc.setFont('helvetica', 'bold');
      doc.text('NEXT STEPS FOR FLEET ONBOARDING:', 14, 116);
      doc.setFont('helvetica', 'normal');
      doc.text('1. A Pyda Senior Fleet Inspector will contact you within 24 hours to book a 42-point physical check.', 14, 124);
      doc.text('2. 24/7 Satellite GPS tracker & speed governor will be installed at the central workshop.', 14, 132);
      doc.text('3. Both parties sign the official 12-Month Fleet Management Service Level Agreement (SLA).', 14, 140);
      doc.text('4. First monthly payout is automatically remitted on the 5th of the following month.', 14, 148);

      doc.setFont('helvetica', 'bold');
      doc.text('Fleet Hotline: +234 806 246 6212 | Email: fleet@pydamovers.com', 14, 170);

      doc.save(`Pyda_Fleet_Intake_${refCode}.pdf`);
    } catch (e) {
      console.error('PDF generation error', e);
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14" id="investor-fleet-teaser-banner">
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-2 border-amber-500/40 rounded-3xl p-6 sm:p-10 lg:p-12 shadow-2xl">
        
        {/* Glow ambient decorations */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-24 -mt-24" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -ml-24 -mb-24" />

        <div className="relative z-10 space-y-8 sm:space-y-10">
          
          {/* Header & Value Proposition */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-400 text-xs font-black font-mono tracking-wider">
                <Truck className="w-4 h-4" />
                <span>COMMERCIAL TRUCK OWNER & FLEET PARTNERSHIP PROGRAM</span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
                Register Your Trucks Under <span className="text-amber-400">Pyda Fleet Management</span>
              </h2>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Turn your 3.5T Canters, 10–15T haulers, and 30-Ton articulated trailers into guaranteed monthly passive revenue. We manage corporate relocation clients, vetted drivers, fuel, routine servicing, and telematics while delivering reliable monthly returns directly to your bank account.
              </p>
            </div>

            {/* Quick CTAs */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setFormOpen(true)}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
                id="home-register-trucks-cta-btn"
              >
                <Truck className="w-4 h-4" />
                <span>Register Truck Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onNavigateToInvestors}
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm px-5 py-3.5 rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-all cursor-pointer"
                id="home-view-fleet-terms-btn"
              >
                <FileText className="w-4 h-4 text-amber-400" />
                <span>View Full Terms & ROI</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onNavigateToInvestors();
                  setTimeout(() => {
                    const el = document.getElementById('vehicle-health-monitor');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }, 250);
                }}
                className="bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-400 font-bold text-xs sm:text-sm px-4 py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                id="home-view-health-monitor-btn"
              >
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>Vehicle Health Monitor</span>
              </button>

              <a
                href={`https://wa.me/${company.whatsapp || '2348062466212'}?text=Hello%20Pyda%20Fleet%20Directorate,%20I%20am%20a%20truck%20owner%20interested%20in%20registering%20my%20trucks%20under%20Pyda%20Fleet%20Management.`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-400 font-bold text-xs sm:text-sm px-4 py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="hidden sm:inline">WhatsApp Fleet Desk</span>
              </a>
            </div>
          </div>

          {/* 3 Tonnage Monthly Returns Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {truckCategories.map((tier) => (
              <div 
                key={tier.id}
                className={`relative bg-slate-900/90 border ${tier.popular ? 'border-amber-400/60 shadow-amber-500/10' : 'border-slate-800'} rounded-2xl p-5 sm:p-6 flex flex-col justify-between space-y-4 shadow-xl hover:border-amber-500/50 transition-all`}
              >
                {tier.popular && (
                  <span className="absolute -top-3 right-5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full shadow-md">
                    Most Popular Tonnage
                  </span>
                )}

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{tier.title}</span>
                    <span className="text-[11px] font-mono font-bold text-amber-400 bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 rounded">
                      {tier.annualRoi}
                    </span>
                  </div>

                  <div className="space-y-0.5 pt-1">
                    <p className="text-2xl sm:text-3xl font-black text-white font-mono">{tier.payout}</p>
                    <p className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{tier.period}</span>
                    </p>
                  </div>

                  <p className="text-xs text-slate-300 pt-2 border-t border-slate-800/80">
                    {tier.focus}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/60 space-y-2">
                  <p className="text-[11px] text-slate-400">
                    <strong className="text-slate-300">Typical Models:</strong> {tier.examples}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, truckCategory: tier.id }));
                      setFormOpen(true);
                    }}
                    className="w-full bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-white text-xs font-bold py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Register This Tonnage</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Core Guarantees 4-Column Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            <div className="bg-slate-950/70 border border-slate-800/80 p-4 rounded-xl flex items-start gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-white">5th of Every Month</h4>
                <p className="text-[11px] text-slate-400">Automated direct bank remittance with zero delays.</p>
              </div>
            </div>

            <div className="bg-slate-950/70 border border-slate-800/80 p-4 rounded-xl flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-white">100% GIT Cargo Insurance</h4>
                <p className="text-[11px] text-slate-400">Underwritten by Leadway & AIICO Assurance.</p>
              </div>
            </div>

            <div className="bg-slate-950/70 border border-slate-800/80 p-4 rounded-xl flex items-start gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 shrink-0">
                <Cpu className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-white">24/7 Satellite Telematics</h4>
                <p className="text-[11px] text-slate-400">Live GPS tracking & remote speed governor portal.</p>
              </div>
            </div>

            <div className="bg-slate-950/70 border border-slate-800/80 p-4 rounded-xl flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-white">Zero Idle Days</h4>
                <p className="text-[11px] text-slate-400">Continuous corporate cargo contracts from banks & FMCG.</p>
              </div>
            </div>
          </div>

          {/* Quick Registration Form Modal or Embedded Accordion */}
          {formOpen && (
            <div className="bg-slate-950 border border-amber-500/40 rounded-2xl p-6 sm:p-8 space-y-6 animate-fade-in" id="quick-truck-registration-box">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <Truck className="w-5 h-5 text-amber-400" />
                    <span>Quick Truck Onboarding Application</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Fill out the preliminary details below. Our fleet team will reach out within 24 hours to schedule the 42-point physical survey.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="text-slate-400 hover:text-white text-xs px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg cursor-pointer"
                >
                  ✕ Close
                </button>
              </div>

              {submittedRef ? (
                <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-6 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-lg font-black text-white">Truck Registration Successfully Submitted!</h4>
                    <p className="text-xs text-slate-300">
                      Your Provisional Fleet Reference Code: <strong className="text-amber-400 font-mono text-sm">{submittedRef}</strong>
                    </p>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      Our Senior Fleet Manager in {formData.baseCity} will contact you at {formData.phone} within 24 hours to schedule your truck intake.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => generateQuickTermSheetPdf(submittedRef)}
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black px-5 py-2.5 rounded-xl shadow-lg flex items-center gap-2 cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Provisional Term Sheet (PDF)</span>
                    </button>

                    <a
                      href={`https://wa.me/${company.whatsapp || '2348062466212'}?text=Hello%20Pyda%20Fleet%20Directorate,%20I%20just%20registered%20my%20truck%20under%20reference%20${submittedRef}.%20Owner:%20${encodeURIComponent(formData.ownerName)},%20Phone:%20${encodeURIComponent(formData.phone)}.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Send Reference via WhatsApp</span>
                    </a>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleQuickSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Owner or Company Name *</label>
                      <input
                        type="text"
                        name="ownerName"
                        required
                        value={formData.ownerName}
                        onChange={handleInputChange}
                        placeholder="e.g. Alhaji Mustapha Danladi"
                        className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Phone & WhatsApp Number *</label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="e.g. 0806 246 6212"
                        className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Email Address (Optional)</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="owner@example.com"
                        className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Truck Tonnage Category *</label>
                      <select
                        name="truckCategory"
                        value={formData.truckCategory}
                        onChange={handleInputChange}
                        className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-amber-400"
                      >
                        <option value="3.5_5_ton">3.5 – 5 Ton Canter / Box Van (₦650k - ₦900k/mo)</option>
                        <option value="10_15_ton">10 – 15 Ton Enclosed Hauler (₦1.1M - ₦1.55M/mo)</option>
                        <option value="20_30_ton">20 – 30 Ton Articulated Trailer (₦1.8M - ₦2.6M/mo)</option>
                        <option value="hiab_crane">HIAB Crane Truck / Heavy Rigging</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Number of Units Available *</label>
                      <select
                        name="truckCount"
                        value={formData.truckCount}
                        onChange={handleInputChange}
                        className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-amber-400"
                      >
                        <option value="1">1 Unit</option>
                        <option value="2">2 Units</option>
                        <option value="3">3 Units</option>
                        <option value="4-5">4 – 5 Units</option>
                        <option value="6+">6+ Units (Fleet Portfolio)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Primary Location / Base City *</label>
                      <select
                        name="baseCity"
                        value={formData.baseCity}
                        onChange={handleInputChange}
                        className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-amber-400"
                      >
                        <option value="Lagos">Lagos State (Ikeja / Apapa / Lekki)</option>
                        <option value="Abuja">Abuja FCT (AMAC / Idu Industrial)</option>
                        <option value="Port Harcourt">Port Harcourt (Trans-Amadi)</option>
                        <option value="Kano">Kano (Bompai / Central)</option>
                        <option value="Ibadan">Ibadan (Oyo State)</option>
                        <option value="Other">Other State Corridor</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-800">
                    <p className="text-[11px] text-slate-400">
                      ✓ No registration fees • 12-Month lease with 30-day exit clause • 100% insurance backed
                    </p>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-xs px-6 py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{submitting ? 'Submitting Registration...' : 'Submit Truck for Fleet Management'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

        </div>
      </div>
    </section>
  );
};
