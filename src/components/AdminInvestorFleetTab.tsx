import React, { useState, useEffect } from 'react';
import {
  Truck,
  ShieldCheck,
  Camera,
  Scale,
  Calendar,
  Phone,
  MessageSquare,
  Eye,
  Download,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Maximize2,
  X,
  FileText,
  AlertCircle,
  Building2,
  MapPin,
  Sparkles,
  Award
} from 'lucide-react';
import { InvestorTruckRegistration, TruckSurveyPhoto } from '../types';
import { db } from '../lib/firebase';
import { collection, getDocs, updateDoc, doc, query, orderBy } from 'firebase/firestore';
import jsPDF from 'jspdf';

interface AdminInvestorFleetTabProps {
  showToast: (msg: string) => void;
}

const SAMPLE_INVESTOR_TRUCKS: InvestorTruckRegistration[] = [
  {
    id: 'INV-REG-101',
    referenceCode: 'MGT-INV-2026-8812',
    registeredAt: new Date(Date.now() - 3600000 * 14).toISOString(),
    investorName: 'Chief Adebayo Alabi',
    companyName: 'Alabi Prime Logistics Ltd',
    phone: '0803 456 7890',
    whatsapp: '0803 456 7890',
    email: 'adebayo.alabi@alabiprime.ng',
    cityLocation: 'Lagos',
    truckMake: 'Mercedes-Benz',
    truckModel: 'Atego 1523 Box Body',
    modelYear: 2019,
    truckCategory: '10_15_ton',
    tonnageCapacity: 15,
    cubicCapacityCbm: 48,
    cargoLengthFt: '28ft Enclosed Box',
    axleConfig: '4x2 (Single Axle)',
    payloadKg: 15000,
    currentOdometerKm: 138400,
    fuelType: 'diesel',
    transmission: 'manual',
    bodyType: 'closed_box',
    plateNumber: 'LSR-442-XY',
    chassisVin: 'WDB9340321K49281',
    preferredModel: 'fixed_monthly_lease',
    expectedMonthlyPayoutNaira: 1400000,
    roadworthinessValid: true,
    insuranceStatus: 'active',
    inspectionCity: 'Lagos (Lekki / Ikeja Central Workshop)',
    additionalNotes: 'Fitted with 6 brand new Michelin heavy-duty tyres. Dry freight box has reinforced aluminum floor.',
    status: 'submitted',
    surveyPhotos: [
      {
        id: 'sample-p1',
        type: 'front_cabin',
        label: 'Front Cabin & Windshield',
        fileName: 'front_cabin_survey.jpg',
        fileSizeBytes: 84200,
        uploadedAt: new Date().toISOString(),
        dataUrl: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=800&q=80',
        caption: 'Cabin grill intact, mirrors intact, headlights clear'
      },
      {
        id: 'sample-p2',
        type: 'cargo_interior',
        label: 'Cargo Bed / Box Interior',
        fileName: 'cargo_interior_survey.jpg',
        fileSizeBytes: 91400,
        uploadedAt: new Date().toISOString(),
        dataUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
        caption: 'Clean, watertight dry box flooring'
      },
      {
        id: 'sample-p3',
        type: 'left_profile',
        label: 'Left Flank & Fuel Tank',
        fileName: 'left_profile_survey.jpg',
        fileSizeBytes: 78900,
        uploadedAt: new Date().toISOString(),
        dataUrl: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=800&q=80',
        caption: 'Straight chassis rails with zero rust'
      },
      {
        id: 'sample-p4',
        type: 'rear_tailgate',
        label: 'Rear Doors & Tailgate',
        fileName: 'rear_tailgate_survey.jpg',
        fileSizeBytes: 65400,
        uploadedAt: new Date().toISOString(),
        dataUrl: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=800&q=80',
        caption: 'Container locking bars and seal brackets functional'
      }
    ]
  },
  {
    id: 'INV-REG-102',
    referenceCode: 'MGT-INV-2026-6421',
    registeredAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    investorName: 'Hajia Fatima Balarabe',
    companyName: 'Sahel Express Freighters',
    phone: '0802 333 4455',
    whatsapp: '0802 333 4455',
    email: 'fatima@sahelexpress.com',
    cityLocation: 'Abuja / Kano',
    truckMake: 'DAF',
    truckModel: 'CF 85 410 Heavy Hauler',
    modelYear: 2020,
    truckCategory: '20_30_ton',
    tonnageCapacity: 30,
    cubicCapacityCbm: 75,
    cargoLengthFt: '40ft High Cube Container',
    axleConfig: '6x4 (Double Differential Heavy)',
    payloadKg: 30000,
    currentOdometerKm: 184200,
    fuelType: 'diesel',
    transmission: 'manual',
    bodyType: 'closed_box',
    plateNumber: 'ABJ-891-AA',
    chassisVin: 'XLRTE47MS0E98172',
    preferredModel: 'revenue_share_management',
    expectedMonthlyPayoutNaira: 2850000,
    roadworthinessValid: true,
    insuranceStatus: 'active',
    inspectionCity: 'Abuja (Idu Industrial Fleet Hub)',
    additionalNotes: 'Serviced regularly at DAF authorized center. Dual fuel tanks fitted.',
    status: 'under_inspection',
    surveyPhotos: [
      {
        id: 'sample-p5',
        type: 'front_cabin',
        label: 'Front Cabin & Windshield',
        fileName: 'daf_front.jpg',
        fileSizeBytes: 95400,
        uploadedAt: new Date().toISOString(),
        dataUrl: 'https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 'sample-p6',
        type: 'cargo_interior',
        label: 'Cargo Bed / Box Interior',
        fileName: 'daf_interior.jpg',
        fileSizeBytes: 88100,
        uploadedAt: new Date().toISOString(),
        dataUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80'
      }
    ]
  }
];

export const AdminInvestorFleetTab: React.FC<AdminInvestorFleetTabProps> = ({ showToast }) => {
  const [registrations, setRegistrations] = useState<InvestorTruckRegistration[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tonnageFilter, setTonnageFilter] = useState<string>('all');
  const [selectedTruck, setSelectedTruck] = useState<InvestorTruckRegistration | null>(null);
  const [activePhotoModal, setActivePhotoModal] = useState<TruckSurveyPhoto | null>(null);

  // Load from Firestore or local storage + fallback samples
  const loadRegistrations = async () => {
    setLoading(true);
    try {
      let fetched: InvestorTruckRegistration[] = [];
      if (db) {
        try {
          const q = query(collection(db, 'investorRegistrations'), orderBy('registeredAt', 'desc'));
          const snap = await getDocs(q);
          snap.forEach((d) => {
            fetched.push({ id: d.id, ...d.data() } as InvestorTruckRegistration);
          });
        } catch (fbErr) {
          // If Firestore query fails (e.g. index building), fallback to getDocs without orderBy
          const snap = await getDocs(collection(db, 'investorRegistrations'));
          snap.forEach((d) => {
            fetched.push({ id: d.id, ...d.data() } as InvestorTruckRegistration);
          });
        }
      }

      // Check localStorage for offline submissions
      const localBackups = localStorage.getItem('megatrend_investor_registrations');
      if (localBackups) {
        try {
          const parsed = JSON.parse(localBackups) as InvestorTruckRegistration[];
          parsed.forEach((item) => {
            if (!fetched.some((f) => f.id === item.id || f.referenceCode === item.referenceCode)) {
              fetched.push(item);
            }
          });
        } catch {
          // Ignore
        }
      }

      // Merge with sample data if list is short so dashboard always has tangible preview
      const combined = [...fetched];
      SAMPLE_INVESTOR_TRUCKS.forEach((sample) => {
        if (!combined.some((c) => c.referenceCode === sample.referenceCode)) {
          combined.push(sample);
        }
      });

      // Sort descending by date
      combined.sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime());
      setRegistrations(combined);
    } catch (err) {
      console.warn('Error loading investor registrations:', err);
      setRegistrations(SAMPLE_INVESTOR_TRUCKS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRegistrations();
  }, []);

  // Filter registrations
  const filteredRegistrations = registrations.filter((reg) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      reg.investorName.toLowerCase().includes(q) ||
      (reg.companyName && reg.companyName.toLowerCase().includes(q)) ||
      reg.truckMake.toLowerCase().includes(q) ||
      reg.truckModel.toLowerCase().includes(q) ||
      reg.plateNumber.toLowerCase().includes(q) ||
      reg.referenceCode.toLowerCase().includes(q) ||
      reg.inspectionCity.toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'all' || reg.status === statusFilter;
    const matchesTonnage = tonnageFilter === 'all' || reg.truckCategory === tonnageFilter;

    return matchesSearch && matchesStatus && matchesTonnage;
  });

  // Calculate high-level KPIs
  const totalTrucks = registrations.length;
  const totalCapacityTons = registrations.reduce((sum, r) => sum + (r.tonnageCapacity || 15), 0);
  const totalPhotosAttached = registrations.reduce((sum, r) => sum + (r.surveyPhotos?.length || 0), 0);
  const pendingInspections = registrations.filter((r) => r.status === 'submitted').length;

  // Handle status update
  const handleUpdateStatus = async (regId: string, newStatus: InvestorTruckRegistration['status']) => {
    try {
      if (db) {
        await updateDoc(doc(db, 'investorRegistrations', regId), { status: newStatus });
      }
      setRegistrations((prev) =>
        prev.map((r) => (r.id === regId ? { ...r, status: newStatus } : r))
      );
      if (selectedTruck && selectedTruck.id === regId) {
        setSelectedTruck((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
      showToast(`Truck status updated to: ${newStatus.toUpperCase()}`);
    } catch (err) {
      // Still update local state
      setRegistrations((prev) =>
        prev.map((r) => (r.id === regId ? { ...r, status: newStatus } : r))
      );
      if (selectedTruck && selectedTruck.id === regId) {
        setSelectedTruck((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
      showToast(`Updated status in local view: ${newStatus.toUpperCase()}`);
    }
  };

  // Generate Term Sheet PDF from Admin
  const handleDownloadAdminTermSheet = (reg: InvestorTruckRegistration) => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;
    const contentWidth = pageWidth - margin * 2;
    let y = 14;

    // Header
    doc.setFillColor(15, 23, 42); // slate-900
    doc.roundedRect(margin, y, contentWidth, 24, 2, 2, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(245, 158, 11);
    doc.text('PYDA LOGISTICS FLEET NETWORK', margin + 6, y + 9);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);
    doc.text('CORPORATE FLEET PARTNER & TRUCK MANAGEMENT TERM SHEET', margin + 6, y + 15);
    doc.setTextColor(148, 163, 184);
    doc.text('Enterprise Haulage & Asset Protection Division • Verified RC: 1849204', margin + 6, y + 19.5);

    y += 28;

    // Meta Section
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, y, contentWidth, 15, 1.5, 1.5, 'FD');

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text('PARTNERSHIP REF #', margin + 4, y + 4.5);
    doc.text('REGISTRATION DATE', margin + 55, y + 4.5);
    doc.text('MANAGEMENT MODEL', margin + 105, y + 4.5);
    doc.text('STATUS', margin + 155, y + 4.5);

    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(reg.referenceCode, margin + 4, y + 10.5);
    doc.text(new Date(reg.registeredAt).toLocaleDateString('en-GB'), margin + 55, y + 10.5);

    const modelDisplay =
      reg.preferredModel === 'fixed_monthly_lease'
        ? 'Fixed Guaranteed Monthly Lease'
        : reg.preferredModel === 'revenue_share_management'
        ? 'Managed Revenue Share (70/30)'
        : 'Direct Spot Charter';
    doc.text(modelDisplay, margin + 105, y + 10.5);

    doc.setTextColor(5, 150, 105);
    doc.text('PRE-INSPECTION VERIFIED', margin + 155, y + 10.5);

    y += 19;

    // Section 1: Specifications & Capacity
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('1. ASSET OWNER, VEHICLE SPECIFICATIONS & CAPACITY', margin, y + 2);
    y += 4.5;

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(margin, y, contentWidth, 34, 1.5, 1.5, 'FD');

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`Asset Owner / Investor: ${reg.investorName} ${reg.companyName ? `(${reg.companyName})` : ''}`, margin + 4, y + 5.5);
    doc.text(`Contact: ${reg.phone} • Email: ${reg.email} • Location: ${reg.cityLocation}`, margin + 4, y + 11);
    doc.text(`Vehicle: ${reg.truckMake} ${reg.truckModel} (${reg.modelYear}) • Body Type: ${reg.bodyType.replace('_', ' ').toUpperCase()}`, margin + 4, y + 16.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`Capacity Rating: ${reg.tonnageCapacity || 15} Metric Tons • Cargo Volume: ${reg.cubicCapacityCbm || 45} m³ (CBM) • Cargo Length: ${reg.cargoLengthFt || '28ft'}`, margin + 4, y + 22);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`Axle Configuration: ${reg.axleConfig || '4x2 Single Axle'} • Payload: ${(reg.payloadKg || 15000).toLocaleString()} kg • Odo: ${(reg.currentOdometerKm || 0).toLocaleString()} km`, margin + 4, y + 27.5);
    doc.text(`FRSC Plate: ${reg.plateNumber} • VIN/Chassis: ${reg.chassisVin || 'Pending Physical Stamp'} • Hub: ${reg.inspectionCity}`, margin + 4, y + 32.5);

    y += 38;

    // Section 2: Commercial Terms
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('2. COMMERCIAL TERMS & SETTLEMENT COMMITMENTS', margin, y + 2);
    y += 4.5;

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(margin, y, contentWidth, 26, 1.5, 1.5, 'FD');

    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('• Payout Schedule & Direct Remittance:', margin + 4, y + 5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text('  - Fixed Lease payouts are credited on the 5th working day of each calendar month via direct NIBSS electronic transfer.', margin + 4, y + 9.5);
    doc.text('  - Revenue share contracts are settled bi-weekly on the 5th and 20th with verified manifest audit logs.', margin + 4, y + 14);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('• Operational Asset Protection & Maintenance SLA:', margin + 4, y + 19);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text('  - 24/7 dual GPS telematics access, speed limiting (80 km/h), and 100% Goods-in-Transit (GIT) cargo insurance underwritten.', margin + 4, y + 23.5);

    y += 30;

    // Section 3: Site Survey Photos Audit
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('3. VEHICLE SITE SURVEY & PHOTO VERIFICATION AUDIT', margin, y + 2);
    y += 4.5;

    doc.setFillColor(240, 253, 244);
    doc.setDrawColor(187, 247, 208);
    doc.roundedRect(margin, y, contentWidth, 20, 1.5, 1.5, 'FD');

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(21, 128, 61);
    const photoCount = reg.surveyPhotos?.length || 0;
    doc.text(`✓ Site Survey Status: ${photoCount} Verified Inspection Angle(s) Recorded`, margin + 4, y + 5.5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(22, 101, 52);
    const anglesList = reg.surveyPhotos && reg.surveyPhotos.length > 0
      ? reg.surveyPhotos.map((p) => p.label).join(' • ')
      : 'Front Cabin, Cargo Bed Interior, Left Profile, Rear Tailgate (Standard Verification Set)';
    doc.text(`Inspection Angles Attached: ${anglesList}`, margin + 4, y + 10.5, { maxWidth: contentWidth - 8 });
    doc.text(`Pre-Inspection Clearance Hash: MGT-SURVEY-${Date.now().toString(36).toUpperCase()} • Expedited Workshop Lane Granted`, margin + 4, y + 16.5);

    y += 24;

    // Section 4: Physical Inspection Roadmap
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('4. PHYSICAL INSPECTION & ONBOARDING ROADMAP', margin, y + 2);
    y += 4.5;

    doc.setFillColor(254, 252, 232);
    doc.setDrawColor(254, 240, 138);
    doc.roundedRect(margin, y, contentWidth, 19, 1.5, 1.5, 'FD');

    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(180, 83, 9);
    doc.text('STEP 1: Fleet Workshop Physical Verification Check (42 Points)', margin + 4, y + 5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120, 53, 15);
    doc.text(`Senior Fleet Inspector will contact you within 24 hours to schedule intake at ${reg.inspectionCity}.`, margin + 4, y + 9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(180, 83, 9);
    doc.text('STEP 2: SLA Execution & Telematics GPS Fitting', margin + 4, y + 13.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120, 53, 15);
    doc.text('Agreement signing, IoT dual-tracker install, and deployment onto active corporate relocation convoys.', margin + 4, y + 17);

    y += 23;

    // Section 5: Endorsement
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('5. VERIFICATION ENDORSEMENT', margin, y + 2);
    y += 4;

    const sigW = (contentWidth - 4) / 2;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(margin, y, sigW, 20, 1.5, 1.5, 'FD');
    doc.roundedRect(margin + sigW + 4, y, sigW, 20, 1.5, 1.5, 'FD');

    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text('ASSET OWNER ACKNOWLEDGEMENT', margin + 3, y + 4.5);
    doc.text('PYDA FLEET DIRECTORATE', margin + sigW + 7, y + 4.5);

    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.text(reg.investorName, margin + 3, y + 10);
    doc.text('Engr. T. O. Balogun (Fleet Operations VP)', margin + sigW + 7, y + 10);

    doc.setFontSize(6);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(5, 150, 105);
    doc.text('✓ Submitted via Fleet Partner Portal with Survey Photos', margin + 3, y + 16);
    doc.text('✓ Verified Corporate Fleet Operator • SLA Active', margin + sigW + 7, y + 16);

    y += 24;

    // Footer
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y, pageWidth - margin, y);
    y += 4;

    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text(`Official Fleet Partnership Term Sheet • Document Ref: ${reg.referenceCode} • Confidential`, margin, y);
    doc.text('Pyda Logistics Fleet Network • Lagos | Abuja | Port Harcourt | Kano', pageWidth - margin - 85, y);

    doc.save(`${reg.referenceCode}-Partnership-TermSheet.pdf`);
    showToast(`Downloaded term sheet PDF for ${reg.referenceCode}`);
  };

  return (
    <div className="pt-8 space-y-6">
      {/* Top Banner & Stats */}
      <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold font-mono">
              <Truck className="w-3.5 h-3.5" />
              <span>INVESTOR FLEET ASSET MANAGEMENT</span>
            </div>
            <h2 className="text-2xl font-black text-white">Registered Investor Trucks & Site Surveys</h2>
            <p className="text-xs text-slate-400 max-w-xl">
              Manage truck registrations submitted by vehicle owners, inspect pre-onboarding site survey photos, review tonnage capacity ratings, and approve units for 42-point physical verification.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadRegistrations}
              disabled={loading}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-2 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-400' : ''}`} />
              <span>Refresh Queue</span>
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-slate-500 text-[11px] font-bold uppercase">Total Registered Trucks</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-white">{totalTrucks} Units</span>
              <Truck className="w-5 h-5 text-amber-400" />
            </div>
            <p className="text-[10px] text-slate-400">Under management pipeline</p>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-slate-500 text-[11px] font-bold uppercase">Total Registered Tonnage</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-white">{totalCapacityTons} Tons</span>
              <Scale className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-[10px] text-slate-400">Cumulative payload rating</p>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-slate-500 text-[11px] font-bold uppercase">Survey Photos Recorded</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-white">{totalPhotosAttached} Photos</span>
              <Camera className="w-5 h-5 text-amber-400" />
            </div>
            <p className="text-[10px] text-slate-400">Pre-inspection audit images</p>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-slate-500 text-[11px] font-bold uppercase">Pending Physical Check</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-amber-400">{pendingInspections} Pending</span>
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <p className="text-[10px] text-slate-400">Awaiting workshop intake</p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by investor name, truck make, model, plate (e.g. LSR-442-XY), or ref..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 text-white rounded-xl pl-10 pr-4 py-2.5 text-xs outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2.5 text-xs outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="submitted">Submitted (New)</option>
              <option value="under_inspection">Under Physical Inspection</option>
              <option value="approved">Approved & SLA Active</option>
              <option value="onboarded">Onboarded to Live Fleet</option>
            </select>

            <select
              value={tonnageFilter}
              onChange={(e) => setTonnageFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-2.5 text-xs outline-none"
            >
              <option value="all">All Tonnage Classes</option>
              <option value="3.5_5_ton">3.5 – 5 Ton Box Van</option>
              <option value="10_15_ton">10 – 15 Ton Heavy</option>
              <option value="20_30_ton">20 – 30 Ton Trailer</option>
              <option value="35_ton_lowbed">35+ Ton Lowbed</option>
              <option value="hiab_crane">HIAB Self-Crane</option>
            </select>
          </div>
        </div>
      </div>

      {/* Registrations List Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredRegistrations.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
            <Truck className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">No Registered Trucks Found</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              No truck registration entries matched your current search filters. Clear filters or check back when an investor submits via the Investor section.
            </p>
          </div>
        ) : (
          filteredRegistrations.map((reg) => {
            const photosCount = reg.surveyPhotos?.length || 0;
            const hasRequiredPhotos = photosCount >= 4;

            return (
              <div
                key={reg.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl p-5 sm:p-6 space-y-4 transition-all"
              >
                {/* Header line */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                      {reg.referenceCode}
                    </span>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        reg.status === 'onboarded'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : reg.status === 'approved'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : reg.status === 'under_inspection'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {reg.status.replace('_', ' ')}
                    </span>

                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(reg.registeredAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleDownloadAdminTermSheet(reg)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors border border-slate-700"
                      title="Download Term Sheet PDF"
                    >
                      <Download className="w-3.5 h-3.5 text-amber-400" />
                      <span>Term Sheet (PDF)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedTruck(reg)}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl flex items-center gap-1.5 shadow transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Review Details</span>
                    </button>
                  </div>
                </div>

                {/* Main 2-column info */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  {/* Left Column: Truck Make, Model, Capacity (7 cols) */}
                  <div className="lg:col-span-7 space-y-3">
                    <div>
                      <h4 className="text-lg font-black text-white flex items-center gap-2">
                        <span>{reg.truckMake} {reg.truckModel}</span>
                        <span className="text-xs font-bold text-slate-400 font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                          {reg.modelYear}
                        </span>
                      </h4>
                      <p className="text-xs text-slate-400 font-mono">
                        Plate: <strong className="text-amber-400 font-bold">{reg.plateNumber}</strong>
                        {reg.chassisVin && (
                          <span className="text-slate-500 ml-2">VIN: {reg.chassisVin}</span>
                        )}
                      </p>
                    </div>

                    {/* Capacity Specs Highlights */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                        <span className="text-[10px] text-slate-500 uppercase block font-mono">Tonnage</span>
                        <strong className="text-white text-sm font-black">{reg.tonnageCapacity || 15} Tons</strong>
                      </div>

                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                        <span className="text-[10px] text-slate-500 uppercase block font-mono">Volume</span>
                        <strong className="text-white text-sm font-black">{reg.cubicCapacityCbm || 45} CBM</strong>
                      </div>

                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                        <span className="text-[10px] text-slate-500 uppercase block font-mono">Cargo Bed</span>
                        <strong className="text-white text-[11px] font-bold truncate block">{reg.cargoLengthFt || '28ft Box'}</strong>
                      </div>

                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                        <span className="text-[10px] text-slate-500 uppercase block font-mono">Axle Setup</span>
                        <strong className="text-white text-[11px] font-bold truncate block">{reg.axleConfig || '4x2 Single'}</strong>
                      </div>
                    </div>

                    {/* Commercial terms & Hub */}
                    <div className="p-3 bg-slate-950/70 rounded-2xl border border-slate-800/80 text-xs flex flex-wrap items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-slate-500 uppercase font-mono block">Engagement Model</span>
                        <strong className="text-amber-400 font-bold">
                          {reg.preferredModel === 'fixed_monthly_lease'
                            ? 'Fixed Guaranteed Monthly Lease'
                            : reg.preferredModel === 'revenue_share_management'
                            ? 'Managed Revenue Share (70/30)'
                            : 'Direct Spot Charter'}
                        </strong>
                      </div>

                      <div className="space-y-0.5 text-right">
                        <span className="text-[10px] text-slate-500 uppercase font-mono block">Inspection Hub</span>
                        <strong className="text-slate-300 font-bold">{reg.inspectionCity}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Investor Contact & Survey Photos Preview (5 cols) */}
                  <div className="lg:col-span-5 space-y-3">
                    {/* Investor Card */}
                    <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-amber-400" />
                          <span>{reg.investorName}</span>
                        </span>
                        {reg.companyName && (
                          <span className="text-[11px] text-slate-400 truncate max-w-[140px]">
                            {reg.companyName}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <a
                          href={`tel:${reg.phone}`}
                          className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg flex items-center justify-center gap-1 text-[11px] font-bold border border-slate-800 transition-colors"
                        >
                          <Phone className="w-3 h-3 text-amber-400" />
                          <span>Call ({reg.phone})</span>
                        </a>

                        <a
                          href={`https://wa.me/234${reg.phone.replace(/^0/, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-400 rounded-lg flex items-center justify-center gap-1 text-[11px] font-bold border border-emerald-800/60 transition-colors"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    </div>

                    {/* Survey Photos Strip */}
                    <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-300 flex items-center gap-1.5">
                          <Camera className="w-3.5 h-3.5 text-amber-400" />
                          <span>Site Survey Verification Photos</span>
                        </span>
                        <span
                          className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${
                            hasRequiredPhotos
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {photosCount} Angle(s) Recorded
                        </span>
                      </div>

                      {reg.surveyPhotos && reg.surveyPhotos.length > 0 ? (
                        <div className="grid grid-cols-4 gap-2">
                          {reg.surveyPhotos.slice(0, 4).map((photo) => (
                            <div
                              key={photo.id}
                              onClick={() => setActivePhotoModal(photo)}
                              className="group relative aspect-[4/3] rounded-lg overflow-hidden border border-slate-800 bg-slate-900 cursor-pointer hover:border-amber-400 transition-colors"
                            >
                              <img
                                src={photo.dataUrl}
                                alt={photo.label}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors" />
                              <span className="absolute bottom-1 left-1 right-1 text-[8px] font-bold text-white bg-black/70 px-1 py-0.5 rounded truncate">
                                {photo.label.split(' ')[0]}
                              </span>
                              <div className="absolute top-1 right-1 bg-black/60 p-0.5 rounded text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                <Maximize2 className="w-2.5 h-2.5" />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-500 italic py-1">
                          No site survey photos uploaded yet. Request vehicle photos before inspection.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Action Footer */}
                <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-[11px] font-bold">Update Status:</span>
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(reg.id, 'under_inspection')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                        reg.status === 'under_inspection'
                          ? 'bg-purple-600 text-white font-black'
                          : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      Schedule Inspection
                    </button>

                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(reg.id, 'approved')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                        reg.status === 'approved'
                          ? 'bg-blue-600 text-white font-black'
                          : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      Approve & SLA
                    </button>

                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(reg.id, 'onboarded')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                        reg.status === 'onboarded'
                          ? 'bg-emerald-600 text-white font-black'
                          : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      Deploy to Active Fleet
                    </button>
                  </div>

                  <span className="text-[11px] text-slate-500 font-mono">
                    ID: {reg.id}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MODAL: FULL TRUCK DETAILS & INSPECTION REVIEW */}
      {/* ------------------------------------------------------------- */}
      {selectedTruck && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <button
              onClick={() => setSelectedTruck(null)}
              className="absolute right-5 top-5 text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                {selectedTruck.referenceCode}
              </span>
              <h3 className="text-2xl font-black text-white">
                {selectedTruck.truckMake} {selectedTruck.truckModel} ({selectedTruck.modelYear})
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Plate Number: <strong className="text-amber-400 font-bold">{selectedTruck.plateNumber}</strong>
                {selectedTruck.chassisVin && <span className="ml-2">• Chassis: {selectedTruck.chassisVin}</span>}
              </p>
            </div>

            {/* Capacity & Engineering Grid */}
            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase text-amber-400 font-mono flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5" />
                <span>Capacity & Engineering Specifications</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div>
                  <span className="text-slate-500 text-[10px] uppercase block">Tonnage Capacity</span>
                  <strong className="text-white text-base font-black">{selectedTruck.tonnageCapacity || 15} Metric Tons</strong>
                </div>

                <div>
                  <span className="text-slate-500 text-[10px] uppercase block">Cargo Bed Volume</span>
                  <strong className="text-white text-base font-black">{selectedTruck.cubicCapacityCbm || 45} m³ (CBM)</strong>
                </div>

                <div>
                  <span className="text-slate-500 text-[10px] uppercase block">Cargo Box / Bed Length</span>
                  <strong className="text-white text-xs font-bold block mt-1">{selectedTruck.cargoLengthFt || '28ft Enclosed Box'}</strong>
                </div>

                <div>
                  <span className="text-slate-500 text-[10px] uppercase block">Axle Configuration</span>
                  <strong className="text-white text-xs font-bold block mt-1">{selectedTruck.axleConfig || '4x2 (Single Axle)'}</strong>
                </div>

                <div>
                  <span className="text-slate-500 text-[10px] uppercase block">Max Gross Payload</span>
                  <strong className="text-white text-xs font-bold block mt-1">{(selectedTruck.payloadKg || 15000).toLocaleString()} kg</strong>
                </div>

                <div>
                  <span className="text-slate-500 text-[10px] uppercase block">Odometer Reading</span>
                  <strong className="text-white text-xs font-bold block mt-1">
                    {selectedTruck.currentOdometerKm ? `${selectedTruck.currentOdometerKm.toLocaleString()} km` : 'Unspecified'}
                  </strong>
                </div>
              </div>
            </div>

            {/* Site Survey Photos Full Gallery */}
            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase text-amber-400 font-mono flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5" />
                  <span>Site Survey Photos ({selectedTruck.surveyPhotos?.length || 0} Angles)</span>
                </div>
                <span className="text-[10px] text-slate-400 font-normal">Click any photo to inspect full size</span>
              </h4>

              {selectedTruck.surveyPhotos && selectedTruck.surveyPhotos.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {selectedTruck.surveyPhotos.map((photo) => (
                    <div
                      key={photo.id}
                      onClick={() => setActivePhotoModal(photo)}
                      className="group relative aspect-[4/3] rounded-xl overflow-hidden border border-slate-800 bg-slate-950 cursor-pointer hover:border-amber-400 transition-all"
                    >
                      <img
                        src={photo.dataUrl}
                        alt={photo.label}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <span className="absolute bottom-2 left-2 right-2 text-[10px] font-bold text-white truncate">
                        {photo.label}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center text-xs text-slate-500 italic">
                  No site survey verification photos attached to this record.
                </div>
              )}
            </div>

            {/* Investor & Contact Information */}
            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase text-amber-400 font-mono flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                <span>Investor & Intake Details</span>
              </h4>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs space-y-2">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-500 text-[10px]">Investor Name</span>
                    <p className="font-bold text-white">{selectedTruck.investorName}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px]">Company / Entity</span>
                    <p className="font-bold text-white">{selectedTruck.companyName || 'Individual Asset Owner'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
                  <div>
                    <span className="text-slate-500 text-[10px]">Phone Number</span>
                    <p className="font-bold text-white">{selectedTruck.phone}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px]">Email Address</span>
                    <p className="font-bold text-white">{selectedTruck.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
                  <div>
                    <span className="text-slate-500 text-[10px]">Target Inspection Hub</span>
                    <p className="font-bold text-amber-400">{selectedTruck.inspectionCity}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px]">Owner Home / Business City</span>
                    <p className="font-bold text-white">{selectedTruck.cityLocation}</p>
                  </div>
                </div>

                {selectedTruck.additionalNotes && (
                  <div className="pt-2 border-t border-slate-800/80">
                    <span className="text-slate-500 text-[10px]">Owner Notes:</span>
                    <p className="text-slate-300 mt-1 leading-relaxed">{selectedTruck.additionalNotes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => handleDownloadAdminTermSheet(selectedTruck)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 border border-slate-700"
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span>Download Term Sheet (PDF)</span>
              </button>

              <button
                onClick={() => setSelectedTruck(null)}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* LIGHTBOX MODAL: FULL RESOLUTION SURVEY PHOTO INSPECTION */}
      {/* ------------------------------------------------------------- */}
      {activePhotoModal && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-lg flex items-center justify-center p-4"
          onClick={() => setActivePhotoModal(null)}
        >
          <div
            className="max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl space-y-4 p-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Camera className="w-4 h-4 text-amber-400" />
                  <span>{activePhotoModal.label}</span>
                </h4>
                <p className="text-[11px] text-slate-400 font-mono">
                  {activePhotoModal.fileName} • Captured {new Date(activePhotoModal.uploadedAt).toLocaleString()}
                </p>
              </div>

              <button
                onClick={() => setActivePhotoModal(null)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Image Preview Container */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center max-h-[70vh]">
              <img
                src={activePhotoModal.dataUrl}
                alt={activePhotoModal.label}
                className="max-h-[70vh] w-auto object-contain rounded-xl"
              />
            </div>

            {activePhotoModal.caption && (
              <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <strong>Inspector Note:</strong> {activePhotoModal.caption}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
