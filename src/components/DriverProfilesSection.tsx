import React, { useState, useMemo } from 'react';
import {
  UserCheck,
  ShieldCheck,
  Star,
  CheckCircle2,
  Truck,
  Search,
  FileText,
  X,
  Gauge,
  Clock,
  MapPin,
  BadgeCheck,
  Award,
  Activity,
  HeartPulse,
  Sparkles
} from 'lucide-react';
import { DRIVER_PROFILES } from '../data/driverProfilesData';
import { DriverProfile, TruckTonnageCategory } from '../types';

interface DriverProfilesSectionProps {
  onRegisterTruckClick?: () => void;
}

export const DriverProfilesSection: React.FC<DriverProfilesSectionProps> = ({
  onRegisterTruckClick
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | TruckTonnageCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [auditModalDriver, setAuditModalDriver] = useState<DriverProfile | null>(null);

  // Filtered drivers based on category and search
  const filteredDrivers = useMemo(() => {
    return DRIVER_PROFILES.filter((driver) => {
      const matchesCategory = selectedCategory === 'all' || driver.assignedTonnage === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        driver.name.toLowerCase().includes(q) ||
        driver.title.toLowerCase().includes(q) ||
        driver.assignedTruckExample.toLowerCase().includes(q) ||
        driver.licenseCertifications.licenseClass.toLowerCase().includes(q) ||
        driver.licenseCertifications.defensiveDrivingCert.toLowerCase().includes(q) ||
        driver.specializationRoutes.some((r) => r.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8" id="investor-driver-profiles">
      {/* Section Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3.5 py-1 rounded-full">
          <UserCheck className="w-3.5 h-3.5 text-amber-400" />
          <span>Vetted Fleet Captains & Safety Assurance</span>
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
          Verified Driver Profiles & Operational Track Records
        </h2>
        <p className="text-slate-400 text-sm sm:text-base max-w-3xl leading-relaxed">
          The safety and lifespan of your ₦35M–₦80M truck asset depend entirely on who sits behind the wheel. Every Pyda fleet captain undergoes a rigorous 5-stage background check, biometric police clearance, FRSC heavy-vehicle licensing, and real-time IoT speed telematics monitoring.
        </p>

        {/* Quiet Unboxed Trust Guarantees */}
        <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
          <span className="flex items-center gap-1.5 text-slate-300 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>100% Force CID Biometric Clearances</span>
          </span>
          <span className="text-slate-600">·</span>
          <span className="flex items-center gap-1.5 text-slate-300 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>LASDRI & FRSC Class G / E Certified</span>
          </span>
          <span className="text-slate-600">·</span>
          <span className="flex items-center gap-1.5 text-slate-300 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Quarterly Toxicology & Vision Testing</span>
          </span>
          <span className="text-slate-600">·</span>
          <span className="flex items-center gap-1.5 text-slate-300 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Live Speed Governors Capped @ 80 km/h</span>
          </span>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Segmented Filter Controls */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-thin">
            {[
              { id: 'all', label: `All Captains (${DRIVER_PROFILES.length})` },
              { id: '20_30_ton', label: '20–30 Ton Semi-Trailers' },
              { id: '10_15_ton', label: '10–15 Ton Enclosed' },
              { id: '3.5_5_ton', label: '3.5–5 Ton Box Vans' }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedCategory(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === tab.id
                    ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, route, license..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-400 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Driver Profiles Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredDrivers.map((driver) => {
          const latestReview = driver.clientReviews[0];

          return (
            <div
              key={driver.id}
              className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-3xl p-6 sm:p-7 space-y-6 transition-all shadow-xl flex flex-col justify-between group"
            >
              <div className="space-y-5">
                {/* Driver Identity Card Top */}
                <div className="flex items-start gap-4">
                  <div className="relative shrink-0">
                    <img
                      src={driver.photoUrl}
                      alt={driver.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-slate-700 group-hover:border-amber-400/50 transition-colors shadow-lg"
                    />
                    <div
                      className="absolute -bottom-1.5 -right-1.5 bg-emerald-500 text-slate-950 p-1 rounded-lg shadow-md"
                      title="Verified Level-5 Captain"
                    >
                      <BadgeCheck className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        {driver.badgeNumber}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {driver.verificationBadge}
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-white group-hover:text-amber-400 transition-colors mt-1 truncate">
                      {driver.name}
                    </h3>

                    <p className="text-xs text-slate-300 font-medium leading-tight">
                      {driver.title}
                    </p>

                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-2">
                      <span className="font-semibold text-slate-300">
                        {driver.experienceYears} Years Exp.
                      </span>
                      <span>·</span>
                      <span className="truncate text-slate-400">
                        {driver.assignedTruckExample.split('(')[0].trim()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Performance Metrics Highlights */}
                <div className="grid grid-cols-4 gap-2 bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-center">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">
                      Safety Log
                    </span>
                    <span className="font-mono font-black text-xs sm:text-sm text-emerald-400">
                      {driver.metrics.accidentFreeKm}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">
                      Rating
                    </span>
                    <span className="font-mono font-black text-xs sm:text-sm text-amber-400 flex items-center justify-center gap-0.5">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400 inline" />
                      <span>{driver.metrics.rating}</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">
                      On-Time
                    </span>
                    <span className="font-mono font-black text-xs sm:text-sm text-white">
                      {driver.metrics.onTimeDeliveryRate}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">
                      Eco-Score
                    </span>
                    <span className="font-mono font-black text-xs sm:text-sm text-[#83b735]">
                      {driver.metrics.ecoDrivingScore}/100
                    </span>
                  </div>
                </div>

                {/* Verified License & Accreditations Pill Island Banned -> Clean Key-Value Roster */}
                <div className="space-y-2 text-xs">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    <span>Verified License & Regulatory Badges</span>
                  </div>

                  <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/80 space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Commercial License:</span>
                      <span className="font-mono font-bold text-white">
                        {driver.licenseCertifications.licenseClass}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">LASDRI / State Institute:</span>
                      <span className="font-mono font-bold text-emerald-400">
                        {driver.licenseCertifications.lasdriBadgeNo}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Defensive Protocol:</span>
                      <span className="text-slate-300 truncate max-w-[220px]" title={driver.licenseCertifications.defensiveDrivingCert}>
                        {driver.licenseCertifications.defensiveDrivingCert}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Biometric Police CID:</span>
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-400" />
                        <span>Force CID Verified Clean</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Positive Client Feedback Quote */}
                {latestReview && (
                  <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {[...Array(latestReview.rating)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {latestReview.date}
                      </span>
                    </div>
                    <p className="text-slate-300 text-xs italic leading-relaxed">
                      "{latestReview.comment}"
                    </p>
                    <div className="text-[11px] text-slate-400 font-medium pt-1 border-t border-slate-800/60 flex items-center justify-between">
                      <span className="font-bold text-white">{latestReview.clientName}</span>
                      <span className="text-slate-400">{latestReview.clientCompany}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer Action */}
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
                <span className="text-[11px] text-slate-400">
                  {driver.isAvailableForNewInvestorTruck ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Ready for Assignment to New Investor Truck</span>
                    </span>
                  ) : (
                    <span className="text-slate-400">Currently Active on Interstate Route</span>
                  )}
                </span>

                <button
                  type="button"
                  onClick={() => setAuditModalDriver(driver)}
                  className="bg-slate-950 hover:bg-slate-800 text-amber-400 hover:text-amber-300 border border-amber-500/40 rounded-xl px-4 py-2 text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 shrink-0 shadow-sm"
                  id={`view-audit-file-${driver.id}`}
                >
                  <FileText className="w-3.5 h-3.5 text-amber-400" />
                  <span>Full Audit File</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* No results fallback */}
      {filteredDrivers.length === 0 && (
        <div className="bg-slate-950 p-8 rounded-3xl border border-slate-800 text-center space-y-3">
          <p className="text-slate-400 text-sm">
            No driver profiles found matching "{searchQuery}".
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
            }}
            className="text-xs text-amber-400 font-bold underline"
          >
            Clear filters and reset search
          </button>
        </div>
      )}

      {/* Investor Trust Callout Box */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-amber-500/30 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-2 text-center md:text-left">
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-md border border-amber-500/20">
            Dedicated Asset Custodianship
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-white">
            Have a Commercial Truck? We Assign Level-5 Captains to It
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            When you register your truck under the Pyda Managed Lease or 70/30 Revenue Share model, we assign a pre-vetted senior captain with minimum 8+ years highway experience, full bond guarantors, and telematics liability coverage.
          </p>
        </div>

        {onRegisterTruckClick && (
          <button
            type="button"
            onClick={onRegisterTruckClick}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-xl flex items-center gap-2 transition-all shrink-0 active:scale-95"
            id="driver-section-register-truck-cta"
          >
            <Truck className="w-4 h-4 stroke-[2.5]" />
            <span>Register Your Truck Now</span>
          </button>
        )}
      </div>

      {/* Detailed Driver Audit File Modal */}
      {auditModalDriver && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setAuditModalDriver(null)}
        >
          <div
            className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6 text-white shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
            id="driver-audit-file-modal"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <img
                  src={auditModalDriver.photoUrl}
                  alt={auditModalDriver.name}
                  className="w-14 h-14 rounded-2xl object-cover border border-amber-400/40"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-white">{auditModalDriver.name}</h3>
                    <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      {auditModalDriver.badgeNumber}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{auditModalDriver.title}</p>
                  <p className="text-[11px] text-emerald-400 font-semibold mt-0.5">
                    ✓ Official Driver Audit & Compliance File (PKI Verified)
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setAuditModalDriver(null)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Regulatory Credentials & Certifications */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>1. Regulatory License & Identity Verification</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Commercial License</span>
                  <span className="font-bold text-white block mt-0.5">{auditModalDriver.licenseCertifications.licenseClass}</span>
                  <span className="text-[10px] font-mono text-slate-400">No: {auditModalDriver.licenseCertifications.licenseNumberMasked}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">State Drivers Institute</span>
                  <span className="font-bold text-emerald-400 block mt-0.5">LASDRI Verified</span>
                  <span className="text-[10px] font-mono text-slate-400">Badge: {auditModalDriver.licenseCertifications.lasdriBadgeNo}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Defensive Driving Certification</span>
                  <span className="font-medium text-slate-300 block mt-0.5">{auditModalDriver.licenseCertifications.defensiveDrivingCert}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Police Biometric Criminal Record</span>
                  <span className="font-bold text-emerald-400 block mt-0.5">Clear / Zero Infractions</span>
                  <span className="text-[10px] text-slate-400">{auditModalDriver.licenseCertifications.policeClearance}</span>
                </div>
                <div className="sm:col-span-2 border-t border-slate-800/80 pt-2 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Medical & Toxicology Status:</span>
                  <span className="text-emerald-400 font-bold">{auditModalDriver.licenseCertifications.medicalFitnessDate}</span>
                </div>
              </div>
            </div>

            {/* Specialization Corridors */}
            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span>2. Certified Highway Corridors & Route Familiarity</span>
              </h4>
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1.5 text-xs text-slate-300">
                {auditModalDriver.specializationRoutes.map((route, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#83b735] shrink-0" />
                    <span>{route}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* All Client Reviews */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-400" />
                <span>3. Client Feedback & Consignor Reviews ({auditModalDriver.clientReviews.length})</span>
              </h4>
              <div className="space-y-2.5">
                {auditModalDriver.clientReviews.map((rev, idx) => (
                  <div key={idx} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {[...Array(rev.rating)].map((_, s) => (
                          <Star key={s} className="w-3 h-3 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">{rev.date}</span>
                    </div>
                    <p className="text-slate-300 italic leading-relaxed">
                      "{rev.comment}"
                    </p>
                    <div className="text-[11px] font-bold text-white pt-1 flex items-center justify-between">
                      <span>{rev.clientName}</span>
                      <span className="text-slate-400 font-normal">{rev.clientCompany}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-mono">
                Asset Protection Guarantee: Driver Bonded under Pyda SLA
              </span>
              <button
                type="button"
                onClick={() => setAuditModalDriver(null)}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl transition-all"
              >
                Close Audit File
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
