import React, { useState, useMemo } from 'react';
import {
  Activity,
  Gauge,
  AlertTriangle,
  CheckCircle2,
  Wrench,
  ShieldAlert,
  Cpu,
  Truck,
  Calendar,
  Flame,
  Download,
  RefreshCw,
  Bell,
  Droplets,
  CircleDot,
  Zap,
  Thermometer,
  Clock,
  ArrowRight,
  Search,
  FileText,
  Check,
  PhoneCall,
  MapPin,
  HelpCircle,
  ExternalLink,
  Sliders,
  Radio,
  Share2,
  X,
  Mail,
  Send,
  Inbox,
  Eye,
  Settings,
  CalendarDays
} from 'lucide-react';
import { 
  REGISTERED_PYDA_FLEET_HEALTH, 
  VehicleHealthRecord, 
  TireSensorData, 
  DiagnosticTroubleCode 
} from '../data/vehicleHealthData';
import { FleetMaintenanceCalendar } from './FleetMaintenanceCalendar';
import { useCms } from '../context/CmsContext';
import jsPDF from 'jspdf';
import confetti from 'canvas-confetti';

interface VehicleHealthMonitorProps {
  onNavigateToContact?: () => void;
  onOpenBookingModal?: () => void;
}

export const VehicleHealthMonitor: React.FC<VehicleHealthMonitorProps> = ({
  onNavigateToContact,
}) => {
  const { cms } = useCms();
  const { company } = cms;

  // Selected Truck & Filter State
  const [selectedTruckId, setSelectedTruckId] = useState<string>('health-fl-108');
  const [statusFilter, setStatusFilter] = useState<'all' | 'alerts' | 'nominal'>('all');
  const [activeTab, setActiveTab] = useState<'overview' | 'calendar' | 'maintenance' | 'oil_pressure' | 'tpms' | 'vitals'>('overview');

  // Monitored fleet vehicles state with local storage persistence
  const [fleetVehicles, setFleetVehicles] = useState<VehicleHealthRecord[]>(() => {
    try {
      const saved = localStorage.getItem('pyda_fleet_vehicles_schedule_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not load cached fleet maintenance schedule:', e);
    }
    return REGISTERED_PYDA_FLEET_HEALTH;
  });

  // Handler to reschedule a fleet vehicle maintenance deadline
  const handleUpdateVehicleSchedule = (truckId: string, newDateISO: string, notes?: string) => {
    const targetDate = new Date(newDateISO + 'T00:00:00');
    const formattedDate = targetDate.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
    // calculate due in days relative to Sept 21, 2026
    const simulatedToday = new Date(2026, 8, 21);
    const diffDays = Math.round((targetDate.getTime() - simulatedToday.getTime()) / (1000 * 60 * 60 * 24));
    const newStatus = diffDays < 0 ? 'overdue' : diffDays <= 5 ? 'due_soon' : 'on_schedule';

    setFleetVehicles((prev) => {
      const updated = prev.map((truck) => {
        if (truck.id === truckId) {
          return {
            ...truck,
            maintenanceSchedule: {
              ...truck.maintenanceSchedule,
              scheduledDate: formattedDate,
              dueInDays: diffDays,
              serviceStatus: newStatus as any,
            },
          };
        }
        return truck;
      });
      try {
        localStorage.setItem('pyda_fleet_vehicles_schedule_v1', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });

    // Notify backend server for synchronization
    fetch('/api/fleet/maintenance/reschedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        truckId,
        newDate: formattedDate,
        newDateISO,
        dueInDays: diffDays,
        notes,
        updatedAt: new Date().toISOString(),
      }),
    }).catch((err) => console.warn('[VehicleHealthMonitor] Server sync notice:', err));
  };

  // Interactive Action States
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [lastScanTime, setLastScanTime] = useState<string>('Just now');
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState<string[]>([]);
  
  // Booking Modal State
  const [bookingModalOpen, setBookingModalOpen] = useState<boolean>(false);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);
  const [bookingForm, setBookingForm] = useState({
    preferredDate: '2026-09-25',
    workshopBay: 'Pyda Central Heavy Maintenance Bay, Idu Industrial Yard, Abuja',
    serviceLevel: 'Service B (15,000 km Brake Overhaul & Filter Service)',
    notes: 'Please verify oil pressure sensor calibration & check right rear inner drive tire for bead leak.',
  });

  // Emergency Van Dispatch State
  const [dispatchModalOpen, setDispatchModalOpen] = useState<boolean>(false);
  const [dispatchedTruckCode, setDispatchedTruckCode] = useState<string | null>(null);

  // Automated Maintenance Milestone Email Notification State
  const [emailModalOpen, setEmailModalOpen] = useState<boolean>(false);
  const [activeEmailTab, setActiveEmailTab] = useState<'dispatcher' | 'logs' | 'audit' | 'preview' | 'settings'>('dispatcher');
  const [sendingAlertId, setSendingAlertId] = useState<string | null>(null);
  const [alertStatusFeedback, setAlertStatusFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [ownerRecipientEmail, setOwnerRecipientEmail] = useState<string>('yerimaforfor@gmail.com');
  const [alertLogs, setAlertLogs] = useState<any[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState<boolean>(false);
  const [isAuditingFleet, setIsAuditingFleet] = useState<boolean>(false);
  const [auditSummary, setAuditSummary] = useState<any | null>(null);
  const [alertThresholdKm, setAlertThresholdKm] = useState<number>(500);
  const [selectedPreviewTruckId, setSelectedPreviewTruckId] = useState<string>('health-fl-108');

  const fetchAlertLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const res = await fetch('/api/fleet/maintenance-alerts/logs');
      const data = await res.json();
      if (data?.logs) {
        setAlertLogs(data.logs);
      }
    } catch (err) {
      console.warn('[VehicleHealthMonitor] Could not fetch alert logs:', err);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const handleTriggerEmailAlert = async (truckId: string, customEmail?: string) => {
    setSendingAlertId(truckId);
    setAlertStatusFeedback(null);
    try {
      const targetEmail = customEmail || ownerRecipientEmail || 'yerimaforfor@gmail.com';
      const res = await fetch('/api/fleet/maintenance-alerts/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          truckId,
          recipientEmail: targetEmail,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAlertStatusFeedback({
          type: 'success',
          message: `Automated maintenance milestone email dispatched to ${targetEmail} for unit ${data.alert?.unitCode || truckId}!`,
        });
        try {
          confetti({ particleCount: 35, spread: 60, origin: { y: 0.75 } });
        } catch {
          // ignore
        }
        fetchAlertLogs();
      } else {
        setAlertStatusFeedback({
          type: 'error',
          message: data.message || 'Failed to dispatch email alert.',
        });
      }
    } catch (err: any) {
      setAlertStatusFeedback({
        type: 'error',
        message: err.message || 'Network error triggering email alert.',
      });
    } finally {
      setSendingAlertId(null);
    }
  };

  const handleRunFleetAudit = async () => {
    setIsAuditingFleet(true);
    setAuditSummary(null);
    try {
      const res = await fetch('/api/fleet/maintenance-alerts/check-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.success) {
        setAuditSummary(data.summary);
        fetchAlertLogs();
        try {
          confetti({ particleCount: 45, spread: 70, origin: { y: 0.7 } });
        } catch {
          // ignore
        }
      }
    } catch (err) {
      console.warn('[VehicleHealthMonitor] Audit check error:', err);
    } finally {
      setIsAuditingFleet(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      await fetch('/api/fleet/maintenance-alerts/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          defaultOwnerEmail: ownerRecipientEmail,
          thresholdKm: alertThresholdKm,
          autoAlertsEnabled: true,
        }),
      });
      setAlertStatusFeedback({
        type: 'success',
        message: 'Notification settings & threshold updated successfully!',
      });
    } catch (err) {
      console.warn('Failed to save settings:', err);
    }
  };

  // Filter trucks based on status
  const filteredTrucks = useMemo(() => {
    return fleetVehicles.filter((truck) => {
      if (statusFilter === 'alerts') return truck.overallStatus === 'warning' || truck.overallStatus === 'critical';
      if (statusFilter === 'nominal') return truck.overallStatus === 'nominal';
      return true;
    });
  }, [fleetVehicles, statusFilter]);

  // Selected Truck Object
  const currentTruck = useMemo(() => {
    return fleetVehicles.find((t) => t.id === selectedTruckId) || fleetVehicles[0];
  }, [fleetVehicles, selectedTruckId]);

  // Earliest deadline vehicle in fleet
  const earliestVehicle = useMemo(() => {
    return [...fleetVehicles].sort((a, b) => a.maintenanceSchedule.dueInDays - b.maintenanceSchedule.dueInDays)[0] || currentTruck;
  }, [fleetVehicles, currentTruck]);

  // Handle CAN-bus Rescan simulation
  const handleRescan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setLastScanTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      try {
        confetti({
          particleCount: 25,
          spread: 45,
          origin: { y: 0.7 },
        });
      } catch (e) {
        // ignore
      }
    }, 1200);
  };

  // Acknowledge alert
  const toggleAcknowledge = (code: string) => {
    if (acknowledgedAlerts.includes(code)) {
      setAcknowledgedAlerts(prev => prev.filter(c => c !== code));
    } else {
      setAcknowledgedAlerts(prev => [...prev, code]);
    }
  };

  // Book Service Slot
  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const confirmId = `PYDA-MAINT-${Math.floor(100000 + Math.random() * 900000)}`;
    setBookingSuccess(confirmId);
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (e) {
      // ignore
    }
  };

  // Dispatch Emergency Maintenance Van
  const handleDispatchEmergencyVan = (truck: VehicleHealthRecord) => {
    setDispatchedTruckCode(truck.unitCode);
    setDispatchModalOpen(true);
    try {
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.5 },
      });
    } catch (e) {
      // ignore
    }
  };

  // Generate Official PDF Technical Health Audit
  const generateHealthAuditPdf = (truck: VehicleHealthRecord) => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // Top Header Banner
      doc.setFillColor(9, 14, 26);
      doc.rect(0, 0, pageWidth, 40, 'F');

      doc.setTextColor(245, 158, 11);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('PYDA MOVERS & LOGISTICS LTD', 14, 18);

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('Fleet Engineering Directorate • 24/7 CAN-Bus Telematics & OBD-II Health Audit', 14, 26);
      doc.text(`Official Diagnostic Report • Generated: ${new Date().toLocaleString('en-GB')}`, 14, 32);

      // Document Title Box
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text(`VEHICLE HEALTH AUDIT: ${truck.unitCode} (${truck.plateNumber})`, 14, 52);

      // Metadata Table
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Make & Model: ${truck.makeModel}`, 14, 60);
      doc.text(`Tonnage / Category: ${truck.tonnage} (${truck.category.replace('_', ' ').toUpperCase()})`, 14, 66);
      doc.text(`Assigned Captain: ${truck.driverName} (${truck.driverPhone})`, 14, 72);
      doc.text(`Current Corridor: ${truck.routeCorridor}`, 14, 78);
      doc.text(`Active Location: ${truck.currentLocation}`, 14, 84);
      doc.text(`Odometer: ${truck.engineVitals.odometerKm.toLocaleString()} KM | Engine Hours: ${truck.engineVitals.engineHours.toLocaleString()} Hrs`, 14, 90);
      doc.text(`Overall Diagnostic Health Score: ${truck.overallHealthScore}/100 (${truck.overallStatus.toUpperCase()})`, 14, 96);

      doc.setDrawColor(226, 232, 240);
      doc.line(14, 102, pageWidth - 14, 102);

      // SECTION 1: OIL PRESSURE & LUBRICATION TELEMETRY
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text('1. REAL-TIME OIL PRESSURE & LUBRICATION TELEMETRY', 14, 112);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(`• Engine Oil Galley Pressure: ${truck.oilDiagnostics.pressurePsi} PSI (Target Range: ${truck.oilDiagnostics.targetRangePsi[0]} - ${truck.oilDiagnostics.targetRangePsi[1]} PSI)`, 14, 120);
      doc.text(`• Oil Status: ${truck.oilDiagnostics.status.toUpperCase()} | Life Remaining: ${truck.oilDiagnostics.oilLifePercent}%`, 14, 126);
      doc.text(`• Oil Temperature: ${truck.oilDiagnostics.oilTempCelsius}°C | Filter Diff. Pressure: ${truck.oilDiagnostics.filterDiffPressurePsi} PSI`, 14, 132);
      doc.text(`• Sump Level: ${truck.oilDiagnostics.sumpLevelStatus} | Approved Fluid: ${truck.oilDiagnostics.viscosityGrade}`, 14, 138);

      if (truck.oilDiagnostics.warningMessage) {
        doc.setTextColor(185, 28, 28);
        doc.setFont('helvetica', 'bold');
        doc.text(`⚠️ Active Alert: ${truck.oilDiagnostics.warningMessage}`, 14, 144, { maxWidth: pageWidth - 28 });
        doc.setTextColor(30, 41, 59);
      }

      // SECTION 2: TPMS TIRE PRESSURE MONITORING MATRIX
      doc.setDrawColor(226, 232, 240);
      doc.line(14, 154, pageWidth - 14, 154);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('2. TIRE PRESSURE MONITORING SYSTEM (TPMS) STATUS', 14, 164);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      let tireY = 172;
      truck.tpmsDiagnostics.tires.slice(0, 6).forEach((tire) => {
        const flag = tire.status !== 'optimal' ? `[ALERT: ${tire.currentPsi} PSI / Target ${tire.targetPsi} PSI]` : `[OK: ${tire.currentPsi} PSI]`;
        doc.text(`• ${tire.positionName}: ${flag} • Temp: ${tire.tempCelsius}°C • Tread: ${tire.treadDepthMm} mm`, 14, tireY);
        tireY += 6;
      });

      // SECTION 3: UPCOMING SCHEDULED MAINTENANCE
      doc.setDrawColor(226, 232, 240);
      doc.line(14, 212, pageWidth - 14, 212);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('3. UPCOMING PREVENTATIVE MAINTENANCE SCHEDULE', 14, 222);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(`• Scheduled Service: ${truck.maintenanceSchedule.serviceType}`, 14, 230);
      doc.text(`• Due In: ${truck.maintenanceSchedule.dueInKm} KM (Estimated: ${truck.maintenanceSchedule.dueInDays} Days) • Target: ${truck.maintenanceSchedule.scheduledDate}`, 14, 236);
      doc.text(`• Designated Facility: ${truck.maintenanceSchedule.workshopFacility}`, 14, 242);
      doc.text(`• Supervising Master Engineer: ${truck.maintenanceSchedule.leadTechnician} (${truck.maintenanceSchedule.technicianPhone})`, 14, 248);
      doc.text(`• Status: 100% Fully Covered Under Pyda Master Fleet Management Contract (Zero Investor Charge)`, 14, 254);

      // Official Stamp & Footer
      doc.setDrawColor(245, 158, 11);
      doc.rect(14, 264, pageWidth - 28, 20);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(180, 83, 9);
      doc.text('CERTIFIED TECHNICAL AUDIT • PYDA FLEET TELEMATICS & ENGINEERING DIVISION', 18, 272);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text('This diagnostic report is automatically derived from J1939 ECU CAN-bus telematics. Leadway & AIICO insurance compliance certified.', 18, 278);

      doc.save(`Pyda_Vehicle_Health_${truck.unitCode}.pdf`);
    } catch (err) {
      console.error('Failed to generate health PDF', err);
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8" id="vehicle-health-monitor">
      
      {/* 1. Header Banner & Live Telematics Stats */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-2 border-emerald-500/40 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl">
        {/* Glow ambient background accents */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -ml-16 -mb-16" />

        <div className="relative z-10 space-y-6">
          
          {/* Top Label & Actions */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs font-black font-mono tracking-wider">
                <Activity className="w-4 h-4 animate-pulse" />
                <span>24/7 CAN-BUS FLEET TELEMATICS & DIAGNOSTICS</span>
              </div>
              
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                Pyda <span className="text-emerald-400">Vehicle Health Monitor</span> & Preventive Portal
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
                Complete real-time telematics oversight for commercial trucks registered under Pyda Fleet Management. Track oil pressure thresholds, tire pressure monitoring (TPMS), diagnostic trouble codes (DTCs), and scheduled preventive maintenance to guarantee zero roadside breakdowns and protect your capital asset.
              </p>
            </div>

            {/* Live Scan & Technical Actions */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('calendar')}
                className={`text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow border ${
                  activeTab === 'calendar'
                    ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-amber-500/20'
                    : 'bg-slate-800 hover:bg-slate-700 text-amber-400 border-amber-500/30'
                }`}
                title="Open Interactive Fleet Maintenance Deadline Calendar with Drag & Drop Rescheduling"
              >
                <CalendarDays className="w-3.5 h-3.5" />
                <span>Maintenance Calendar</span>
              </button>

              <button
                type="button"
                onClick={handleRescan}
                disabled={isScanning}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow"
                title="Poll live CAN-bus telemetry from registered fleet"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isScanning ? 'animate-spin' : ''}`} />
                <span>{isScanning ? 'Polling CAN-bus...' : 'Re-Scan Fleet Telematics'}</span>
              </button>

              <button
                type="button"
                onClick={() => generateHealthAuditPdf(currentTruck)}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg cursor-pointer"
                title="Download comprehensive PDF Diagnostic & Health Audit Certificate"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Audit PDF</span>
              </button>

              <a
                href={`https://wa.me/${company.whatsapp || '2348062466212'}?text=Hello%20Pyda%20Fleet%20Engineering%20Desk,%20I%20am%20reviewing%20the%20Vehicle%20Health%20Monitor%20for%20truck%20${currentTruck.unitCode}%20(${currentTruck.plateNumber})%20and%20require%20diagnostic%20support.`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-400 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Tech Hotline</span>
              </a>
            </div>
          </div>

          {/* 4 Telematics High-Impact KPI Stat Tiles */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2">
            <div className="bg-slate-950/80 border border-slate-800/90 rounded-2xl p-4 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">Registered Trucks</span>
                <Truck className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-2xl font-black text-white font-mono">{fleetVehicles.length} Units</p>
              <p className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
                <Check className="w-3 h-3" />
                <span>100% CAN-bus Equipped</span>
              </p>
            </div>

            <div className="bg-slate-950/80 border border-slate-800/90 rounded-2xl p-4 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">Diagnostic Alerts</span>
                <AlertTriangle className="w-4 h-4 text-rose-400" />
              </div>
              <p className="text-2xl font-black text-rose-400 font-mono">2 Flagged</p>
              <p className="text-[11px] text-slate-400">
                1 Low Oil Pressure • 1 TPMS Bead Leak
              </p>
            </div>

            <div className="bg-slate-950/80 border border-slate-800/90 rounded-2xl p-4 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">TPMS Status</span>
                <CircleDot className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-black text-emerald-400 font-mono">96.7%</p>
              <p className="text-[11px] text-slate-400">
                46 of 48 Tires in Nominal Range
              </p>
            </div>

            <div 
              onClick={() => setActiveTab('calendar')}
              className="bg-slate-950/80 border border-slate-800/90 hover:border-amber-500/60 rounded-2xl p-4 space-y-1 cursor-pointer transition-all group"
              title="Click to open interactive maintenance calendar"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 group-hover:text-amber-400 transition-colors">Next Service Due</span>
                <CalendarDays className="w-4 h-4 text-blue-400 group-hover:text-amber-400 transition-colors" />
              </div>
              <p className="text-2xl font-black text-white font-mono">
                {earliestVehicle.maintenanceSchedule.dueInDays <= 0 ? (
                  <span className="text-rose-400">Critical / Due</span>
                ) : (
                  `In ${earliestVehicle.maintenanceSchedule.dueInDays} Days`
                )}
              </p>
              <p className="text-[11px] text-amber-400 font-semibold truncate">
                {earliestVehicle.unitCode} • {earliestVehicle.maintenanceSchedule.dueInKm} KM left
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* 2. Registered Trucks Horizontal Switcher & Filter Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Monitored Truck:</span>
            <span className="text-[11px] text-slate-500 font-mono">({lastScanTime} update)</span>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                statusFilter === 'all' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Trucks ({fleetVehicles.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('alerts')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                statusFilter === 'alerts' ? 'bg-rose-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Active Alerts (2)
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('nominal')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                statusFilter === 'nominal' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Nominal (4)
            </button>
          </div>
        </div>

        {/* Horizontal Truck Cards Carousel */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {filteredTrucks.map((truck) => {
            const isSelected = truck.id === selectedTruckId;
            const hasAlert = truck.overallStatus === 'warning' || truck.overallStatus === 'critical';

            return (
              <div
                key={truck.id}
                onClick={() => setSelectedTruckId(truck.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 relative ${
                  isSelected
                    ? 'bg-slate-900 border-amber-400 shadow-lg shadow-amber-500/10'
                    : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                {hasAlert && (
                  <span className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full bg-rose-500 animate-ping" />
                )}

                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-white font-mono">{truck.unitCode}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    truck.overallStatus === 'critical' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' :
                    truck.overallStatus === 'warning' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                    'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  }`}>
                    {truck.overallHealthScore}%
                  </span>
                </div>

                <div className="space-y-0.5">
                  <p className="text-[11px] font-bold text-slate-300 truncate">{truck.makeModel}</p>
                  <p className="text-[10px] text-slate-400 truncate">{truck.plateNumber}</p>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                  <span>{truck.tonnage}</span>
                  <span className={hasAlert ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                    {hasAlert ? 'Alert Flagged' : 'Nominal'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Selected Truck Detailed Telematics Cockpit */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        
        {/* Selected Truck Identity Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="flex items-start sm:items-center gap-4">
            <img
              src={currentTruck.driverAvatar}
              alt={currentTruck.driverName}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-700 shrink-0"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-lg sm:text-xl font-black text-white font-mono">
                  {currentTruck.unitCode} • {currentTruck.plateNumber}
                </h3>
                <span className="text-xs bg-slate-800 text-slate-300 font-bold px-2.5 py-0.5 rounded-lg border border-slate-700">
                  {currentTruck.tonnage} ({currentTruck.makeModel})
                </span>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 ${
                  currentTruck.overallStatus === 'critical' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' :
                  currentTruck.overallStatus === 'warning' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                  'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${
                    currentTruck.overallStatus === 'critical' ? 'bg-rose-400 animate-ping' :
                    currentTruck.overallStatus === 'warning' ? 'bg-amber-400' :
                    'bg-emerald-400'
                  }`} />
                  <span>Health Score: {currentTruck.overallHealthScore}/100 • {currentTruck.overallStatus.toUpperCase()}</span>
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>{currentTruck.currentLocation}</span>
                </span>
                <span className="text-slate-600">•</span>
                <span>Driver: <strong className="text-slate-200">{currentTruck.driverName}</strong> ({currentTruck.driverPhone})</span>
                <span className="text-slate-600">•</span>
                <span>Odometer: <strong className="text-slate-200">{currentTruck.engineVitals.odometerKm.toLocaleString()} KM</strong></span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons for Selected Truck */}
          <div className="flex items-center gap-2 self-start lg:self-center shrink-0">
            <button
              type="button"
              onClick={() => setBookingModalOpen(true)}
              className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-4 py-2 rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Wrench className="w-3.5 h-3.5 text-amber-400" />
              <span>Book Maintenance Slot</span>
            </button>

            {(currentTruck.overallStatus === 'warning' || currentTruck.overallStatus === 'critical') && (
              <button
                type="button"
                onClick={() => handleDispatchEmergencyVan(currentTruck)}
                className="bg-rose-500 hover:bg-rose-400 text-white font-black text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow cursor-pointer animate-pulse"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Dispatch Support Van</span>
              </button>
            )}
          </div>
        </div>

        {/* Sub-Navigation Tabs within Monitor */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-amber-500 text-slate-950 font-black'
                : 'text-slate-400 hover:text-white bg-slate-950/60'
            }`}
          >
            <Gauge className="w-4 h-4" />
            <span>Overview & Alerts ({currentTruck.activeDtcCodes.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'calendar'
                ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20'
                : 'text-amber-400 hover:text-amber-300 bg-amber-500/10 border border-amber-500/30'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            <span>Fleet Calendar (Drag & Drop)</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
              activeTab === 'calendar' ? 'bg-slate-950 text-amber-400' : 'bg-amber-500/20 text-amber-300'
            }`}>
              {fleetVehicles.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('oil_pressure')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'oil_pressure'
                ? 'bg-amber-500 text-slate-950 font-black'
                : 'text-slate-400 hover:text-white bg-slate-950/60'
            }`}
          >
            <Droplets className="w-4 h-4" />
            <span>Oil Pressure ({currentTruck.oilDiagnostics.pressurePsi} PSI)</span>
            {currentTruck.oilDiagnostics.status !== 'optimal' && (
              <span className="w-2 h-2 rounded-full bg-rose-400" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tpms')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'tpms'
                ? 'bg-amber-500 text-slate-950 font-black'
                : 'text-slate-400 hover:text-white bg-slate-950/60'
            }`}
          >
            <CircleDot className="w-4 h-4" />
            <span>TPMS Pressure ({currentTruck.tpmsDiagnostics.tires.length} Tires)</span>
            {currentTruck.tpmsDiagnostics.overallStatus !== 'optimal' && (
              <span className="w-2 h-2 rounded-full bg-amber-400" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('maintenance')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'maintenance'
                ? 'bg-amber-500 text-slate-950 font-black'
                : 'text-slate-400 hover:text-white bg-slate-950/60'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Service Details ({currentTruck.maintenanceSchedule.dueInDays}d)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('vitals')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'vitals'
                ? 'bg-amber-500 text-slate-950 font-black'
                : 'text-slate-400 hover:text-white bg-slate-950/60'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>Engine & Air Brake Vitals</span>
          </button>
        </div>

        {/* TAB 1: OVERVIEW & DIAGNOSTIC ALERTS */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            
            {/* Active Critical or Warning Alert Banners */}
            {currentTruck.oilDiagnostics.warningMessage && (
              <div className="bg-rose-950/40 border-2 border-rose-500/50 rounded-2xl p-5 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 shrink-0 mt-0.5">
                      <AlertTriangle className="w-5 h-5 animate-pulse" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-black uppercase text-rose-400 tracking-wider bg-rose-500/10 px-2.5 py-0.5 rounded border border-rose-500/30">
                          OIL PRESSURE DIAGNOSTIC ALERT
                        </span>
                        <span className="text-xs font-mono font-bold text-white">
                          Current: {currentTruck.oilDiagnostics.pressurePsi} PSI (Min Safe: {currentTruck.oilDiagnostics.targetRangePsi[0]} PSI)
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">
                        {currentTruck.oilDiagnostics.warningMessage}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => toggleAcknowledge('oil-alert')}
                      className={`text-xs px-3 py-1.5 rounded-lg border font-bold transition-colors cursor-pointer ${
                        acknowledgedAlerts.includes('oil-alert')
                          ? 'bg-slate-800 text-slate-400 border-slate-700'
                          : 'bg-rose-500 hover:bg-rose-400 text-white border-rose-400'
                      }`}
                    >
                      {acknowledgedAlerts.includes('oil-alert') ? '✓ Acknowledged' : 'Acknowledge Alert'}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-rose-900/40">
                  <span>Corridor Checkpoint: <strong>Lokoja AA Rano Staging Yard (Km 184)</strong></span>
                  <span>Lead Technician on Standby: <strong>Engr. Taiwo Adeleke (0806 246 6212)</strong></span>
                </div>
              </div>
            )}

            {/* Active TPMS Alert Banner */}
            {currentTruck.tpmsDiagnostics.summaryAlert && (
              <div className="bg-amber-950/40 border-2 border-amber-500/50 rounded-2xl p-5 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
                      <CircleDot className="w-5 h-5 animate-pulse" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-black uppercase text-amber-400 tracking-wider bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/30">
                          TPMS PRESSURE SENSOR ALERT
                        </span>
                        <span className="text-xs text-slate-300">
                          Total Tires: {currentTruck.tpmsDiagnostics.totalTires} Units
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">
                        {currentTruck.tpmsDiagnostics.summaryAlert}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab('tpms')}
                    className="text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg shrink-0 cursor-pointer"
                  >
                    View Axle Matrix →
                  </button>
                </div>
              </div>
            )}

            {/* 3 Overview Quick Panels */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              {/* Quick Oil Card */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Engine Oil Status</span>
                  <Droplets className="w-4 h-4 text-amber-400" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-baseline justify-between">
                    <span className="text-3xl font-black text-white font-mono">{currentTruck.oilDiagnostics.pressurePsi} PSI</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                      currentTruck.oilDiagnostics.status === 'optimal' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                    }`}>
                      {currentTruck.oilDiagnostics.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">Target: {currentTruck.oilDiagnostics.targetRangePsi[0]} - {currentTruck.oilDiagnostics.targetRangePsi[1]} PSI</p>
                </div>

                {/* Progress bar for oil life */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Oil Usability Remaining</span>
                    <span className="text-white font-mono font-bold">{currentTruck.oilDiagnostics.oilLifePercent}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        currentTruck.oilDiagnostics.oilLifePercent < 25 ? 'bg-rose-500' :
                        currentTruck.oilDiagnostics.oilLifePercent < 50 ? 'bg-amber-500' :
                        'bg-emerald-500'
                      }`}
                      style={{ width: `${currentTruck.oilDiagnostics.oilLifePercent}%` }}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('oil_pressure')}
                  className="w-full text-xs text-center text-amber-400 hover:text-amber-300 font-bold py-1 transition-colors cursor-pointer"
                >
                  View Full Oil Diagnostics →
                </button>
              </div>

              {/* Quick TPMS Card */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">TPMS Status</span>
                  <CircleDot className="w-4 h-4 text-emerald-400" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-baseline justify-between">
                    <span className="text-3xl font-black text-white font-mono">{currentTruck.tpmsDiagnostics.totalTires} Tires</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                      currentTruck.tpmsDiagnostics.overallStatus === 'optimal' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {currentTruck.tpmsDiagnostics.overallStatus.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{currentTruck.tpmsDiagnostics.axleCount} Heavy Commercial Axles</p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-800 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Average Steer PSI:</span>
                    <span className="text-white font-mono font-bold">110 PSI (Optimal)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Tread Depth Avg:</span>
                    <span className="text-white font-mono font-bold">12.8 mm (Good)</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('tpms')}
                  className="w-full text-xs text-center text-amber-400 hover:text-amber-300 font-bold py-1 transition-colors cursor-pointer"
                >
                  View Interactive Axle Visualizer →
                </button>
              </div>

              {/* Quick Next Service Card */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Upcoming Maintenance</span>
                  <Wrench className="w-4 h-4 text-blue-400" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-baseline justify-between">
                    <span className="text-3xl font-black text-white font-mono">{currentTruck.maintenanceSchedule.dueInDays} Days</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                      currentTruck.maintenanceSchedule.serviceStatus === 'on_schedule' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {currentTruck.maintenanceSchedule.serviceStatus.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">Due in {currentTruck.maintenanceSchedule.dueInKm} KM ({currentTruck.maintenanceSchedule.scheduledDate})</p>
                </div>

                <div className="space-y-1 pt-2 border-t border-slate-800 text-xs text-slate-300">
                  <p className="truncate font-semibold">{currentTruck.maintenanceSchedule.serviceType}</p>
                  <p className="text-[11px] text-slate-400 truncate">{currentTruck.maintenanceSchedule.workshopCity}</p>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('maintenance')}
                  className="w-full text-xs text-center text-amber-400 hover:text-amber-300 font-bold py-1 transition-colors cursor-pointer"
                >
                  View Checklist & Technicians →
                </button>
              </div>

            </div>

            {/* Diagnostic Trouble Codes (DTCs / CAN-bus faults) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-white flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-amber-400" />
                  <span>Active CAN-Bus Diagnostic Trouble Codes (DTC / J1939)</span>
                </h4>
                <span className="text-xs text-slate-400 font-mono">
                  {currentTruck.activeDtcCodes.length} Active Codes
                </span>
              </div>

              {currentTruck.activeDtcCodes.length === 0 ? (
                <div className="bg-slate-950/60 border border-slate-800 p-6 rounded-2xl text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-bold text-white">All Systems Nominal — Zero CAN-bus DTC Faults</p>
                  <p className="text-xs text-slate-400">Engine, transmission, TPMS, and air brake controllers report 100% healthy sensor telemetry.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {currentTruck.activeDtcCodes.map((dtc, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        dtc.severity === 'critical' ? 'bg-rose-950/30 border-rose-500/40' : 'bg-amber-950/30 border-amber-500/40'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded ${
                            dtc.severity === 'critical' ? 'bg-rose-500 text-white' : 'bg-amber-500 text-slate-950'
                          }`}>
                            {dtc.code}
                          </span>
                          <span className="text-xs font-bold text-white">{dtc.title}</span>
                          <span className="text-[10px] text-slate-400">({dtc.system})</span>
                        </div>
                        <p className="text-xs text-slate-300">{dtc.description}</p>
                        <p className="text-[11px] text-slate-400">
                          <strong className="text-amber-400">Recommended Action:</strong> {dtc.recommendedAction}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] text-slate-500 font-mono">{dtc.timestamp}</span>
                        <button
                          type="button"
                          onClick={() => toggleAcknowledge(dtc.code)}
                          className="text-xs px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
                        >
                          {acknowledgedAlerts.includes(dtc.code) ? 'Dismissed' : 'Acknowledge'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 2: OIL PRESSURE & LUBRICATION TELEMATICS */}
        {activeTab === 'oil_pressure' && (
          <div className="space-y-6">
            <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div className="space-y-1">
                  <h4 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                    <Droplets className="w-5 h-5 text-amber-400" />
                    <span>Real-Time Oil Pressure & Lubrication Telemetry</span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    Live digital sensor readings from the engine main galley, oil cooler, and spin-on bypass filters.
                  </p>
                </div>

                <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase ${
                  currentTruck.oilDiagnostics.status === 'optimal' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
                  'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                }`}>
                  Status: {currentTruck.oilDiagnostics.status.replace('_', ' ')}
                </span>
              </div>

              {/* Oil Pressure Gauge Visualizer */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                
                {/* Main Gauge Dial Graphic */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Engine Oil Galley Pressure</span>
                  
                  <div className="relative w-44 h-44 mx-auto flex items-center justify-center">
                    {/* SVG Gauge Arc */}
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        className="stroke-slate-800"
                        strokeWidth="8"
                        fill="transparent"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        className={currentTruck.oilDiagnostics.pressurePsi < 30 ? 'stroke-rose-500' : 'stroke-emerald-400'}
                        strokeWidth="8"
                        strokeDasharray={251.2}
                        strokeDashoffset={251.2 - (251.2 * Math.min(currentTruck.oilDiagnostics.pressurePsi, 60)) / 60}
                        strokeLinecap="round"
                        fill="transparent"
                      />
                    </svg>

                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-0.5">
                      <span className="text-3xl sm:text-4xl font-black text-white font-mono">
                        {currentTruck.oilDiagnostics.pressurePsi}
                      </span>
                      <span className="text-xs font-bold text-slate-400 uppercase">PSI</span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-400">
                    Target Operating Window: <strong className="text-amber-400">{currentTruck.oilDiagnostics.targetRangePsi[0]} – {currentTruck.oilDiagnostics.targetRangePsi[1]} PSI</strong>
                  </div>
                </div>

                {/* Oil Breakdown Statistics */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
                      <span className="text-[11px] text-slate-400 font-bold">Oil Life Remaining</span>
                      <p className="text-xl font-black text-white font-mono">{currentTruck.oilDiagnostics.oilLifePercent}%</p>
                      <p className="text-[10px] text-slate-500">Synthetic service cycle</p>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
                      <span className="text-[11px] text-slate-400 font-bold">Oil Temperature</span>
                      <p className="text-xl font-black text-white font-mono">{currentTruck.oilDiagnostics.oilTempCelsius}°C</p>
                      <p className="text-[10px] text-slate-500">Normal: 85°C – 105°C</p>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
                      <span className="text-[11px] text-slate-400 font-bold">Filter Diff. Pressure</span>
                      <p className="text-xl font-black text-white font-mono">{currentTruck.oilDiagnostics.filterDiffPressurePsi} PSI</p>
                      <p className="text-[10px] text-slate-500">Bypass threshold &gt; 8 PSI</p>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
                      <span className="text-[11px] text-slate-400 font-bold">Oil Sump Level</span>
                      <p className="text-base font-black text-white">{currentTruck.oilDiagnostics.sumpLevelStatus}</p>
                      <p className="text-[10px] text-slate-500">Ultrasonic dipstick sensor</p>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1 col-span-2">
                      <span className="text-[11px] text-slate-400 font-bold">Approved Lubricant Specification</span>
                      <p className="text-xs font-black text-amber-400 font-mono truncate">{currentTruck.oilDiagnostics.viscosityGrade}</p>
                      <p className="text-[10px] text-slate-500">Exclusively supplied at Pyda central workshops</p>
                    </div>
                  </div>

                  {/* Operational Note */}
                  <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-1 text-xs text-slate-300">
                    <p className="font-bold text-white flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-emerald-400" />
                      <span>Pyda Preventive Lubrication Guarantee</span>
                    </p>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Every truck registered under Pyda receives automated high-grade synthetic engine flushes every 5,000 km. If oil pressure drops below 28 PSI on long-haul transit, telematics alerts dispatch an emergency lube van to replenish or inspect the crankcase before bearing damage can occur.
                    </p>
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* TAB 3: TPMS TIRE PRESSURE MONITORING */}
        {activeTab === 'tpms' && (
          <div className="space-y-6">
            <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div className="space-y-1">
                  <h4 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                    <CircleDot className="w-5 h-5 text-emerald-400" />
                    <span>Tire Pressure Monitoring System (TPMS) Axle Visualizer</span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    Continuous wireless valve cap telemetry measuring tire pressure (PSI), internal air temperature (°C), and laser tread depth.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs bg-slate-900 text-slate-300 border border-slate-800 px-3 py-1 rounded-xl font-mono">
                    Baseline: 110 PSI Steer / Drive
                  </span>
                </div>
              </div>

              {/* Visual Axle & Tire Pods */}
              <div className="space-y-6 max-w-4xl mx-auto py-2">
                
                {/* Steer Axle Group */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-black text-amber-400 uppercase tracking-wider font-mono">
                      AXLE 1: FRONT STEER AXLE (2 TIRES)
                    </span>
                    <span className="text-[11px] text-slate-400">Recommended Cold PSI: 110 PSI</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {currentTruck.tpmsDiagnostics.tires.filter(t => t.axleGroup === 'steer').map((tire) => (
                      <div
                        key={tire.positionId}
                        className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
                          tire.status === 'optimal' ? 'bg-slate-950 border-slate-800' : 'bg-rose-950/40 border-rose-500/50'
                        }`}
                      >
                        <div className="space-y-1">
                          <span className="text-xs font-bold text-white block">{tire.positionName}</span>
                          <p className="text-2xl font-black text-white font-mono">{tire.currentPsi} <span className="text-xs text-slate-400">PSI</span></p>
                          <div className="flex items-center gap-3 text-[10px] text-slate-400">
                            <span>Temp: <strong className="text-slate-300">{tire.tempCelsius}°C</strong></span>
                            <span>•</span>
                            <span>Tread: <strong className="text-slate-300">{tire.treadDepthMm} mm</strong></span>
                          </div>
                        </div>

                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded uppercase ${
                          tire.status === 'optimal' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500 text-white font-black'
                        }`}>
                          {tire.status === 'optimal' ? 'Nominal' : 'Low Pressure'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Drive Axle 1 Group (Dual Wheels) */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-black text-amber-400 uppercase tracking-wider font-mono">
                      AXLE 2: INTERMEDIATE DRIVE DUALS (4 TIRES)
                    </span>
                    <span className="text-[11px] text-slate-400">Heavy Dual Configuration</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {currentTruck.tpmsDiagnostics.tires.filter(t => t.axleGroup === 'drive1').map((tire) => {
                      const isAlert = tire.status !== 'optimal';
                      return (
                        <div
                          key={tire.positionId}
                          className={`p-3.5 rounded-xl border flex flex-col justify-between space-y-2 ${
                            !isAlert ? 'bg-slate-950 border-slate-800' : 'bg-rose-950/40 border-rose-500/60 shadow-lg shadow-rose-500/20 animate-pulse'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-300 truncate">{tire.positionName}</span>
                            <span className={`w-2 h-2 rounded-full ${isAlert ? 'bg-rose-400' : 'bg-emerald-400'}`} />
                          </div>

                          <div>
                            <p className="text-xl font-black text-white font-mono">{tire.currentPsi} <span className="text-xs text-slate-400">PSI</span></p>
                            <span className="text-[10px] text-slate-400">Target: {tire.targetPsi} PSI</span>
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/80">
                            <span>{tire.tempCelsius}°C</span>
                            <span>{tire.treadDepthMm} mm</span>
                          </div>

                          {tire.alert && (
                            <p className="text-[10px] text-rose-300 font-bold bg-rose-500/10 p-1.5 rounded border border-rose-500/30">
                              {tire.alert}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Drive Axle 2 Group if present */}
                {currentTruck.tpmsDiagnostics.tires.some(t => t.axleGroup === 'drive2') && (
                  <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-xs font-black text-amber-400 uppercase tracking-wider font-mono">
                        AXLE 3: REAR DRIVE DUALS (4 TIRES)
                      </span>
                      <span className="text-[11px] text-slate-400">Traction Bogie</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {currentTruck.tpmsDiagnostics.tires.filter(t => t.axleGroup === 'drive2').map((tire) => (
                        <div
                          key={tire.positionId}
                          className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl flex flex-col justify-between space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-300 truncate">{tire.positionName}</span>
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                          </div>

                          <div>
                            <p className="text-xl font-black text-white font-mono">{tire.currentPsi} <span className="text-xs text-slate-400">PSI</span></p>
                            <span className="text-[10px] text-slate-400">Target: {tire.targetPsi} PSI</span>
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/80">
                            <span>{tire.tempCelsius}°C</span>
                            <span>{tire.treadDepthMm} mm</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

            </div>
          </div>
        )}

        {/* TAB: INTERACTIVE FLEET MAINTENANCE CALENDAR */}
        {activeTab === 'calendar' && (
          <FleetMaintenanceCalendar
            vehicles={fleetVehicles}
            onUpdateVehicleSchedule={handleUpdateVehicleSchedule}
            onSelectTruck={(truckId) => {
              setSelectedTruckId(truckId);
              setActiveTab('maintenance');
            }}
            selectedTruckId={selectedTruckId}
          />
        )}

        {/* TAB 4: UPCOMING MAINTENANCE SCHEDULE */}
        {activeTab === 'maintenance' && (
          <div className="space-y-6">
            <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div className="space-y-1">
                  <h4 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-400" />
                    <span>Scheduled Preventive Maintenance & Engineering SLAs</span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    100% managed by Pyda certified master technicians. Every service is covered under your fleet management agreement with zero investor charges.
                  </p>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveTab('calendar')}
                    className="bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/40 font-bold text-xs px-4 py-2.5 rounded-xl shadow cursor-pointer transition-all flex items-center gap-1.5"
                  >
                    <CalendarDays className="w-3.5 h-3.5" />
                    <span>Open Drag & Drop Calendar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBookingModalOpen(true)}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow cursor-pointer transition-all"
                  >
                    Reschedule / Book Service Bay
                  </button>
                </div>
              </div>

              {/* Maintenance Highlight Card */}
              <div className="bg-slate-900 border-2 border-amber-500/30 rounded-2xl p-6 space-y-6">
                
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-mono font-black text-amber-400 uppercase tracking-wider bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/30">
                      NEXT REQUIRED PITSTOP: {currentTruck.maintenanceSchedule.serviceCode}
                    </span>
                    <h3 className="text-xl font-black text-white">
                      {currentTruck.maintenanceSchedule.serviceType}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Scheduled Date: <strong className="text-slate-200">{currentTruck.maintenanceSchedule.scheduledDate}</strong> • Estimated Turnaround: <strong className="text-slate-200">{currentTruck.maintenanceSchedule.estimatedDowntimeHours} Hours</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-2xl font-black text-white font-mono">{currentTruck.maintenanceSchedule.dueInKm} KM</span>
                      <span className="text-xs text-slate-400 block">Distance Remaining</span>
                    </div>
                    <div className="w-px h-10 bg-slate-800" />
                    <div className="text-right">
                      <span className="text-2xl font-black text-emerald-400 font-mono">{currentTruck.maintenanceSchedule.dueInDays} Days</span>
                      <span className="text-xs text-slate-400 block">Time to Pitstop</span>
                    </div>
                  </div>
                </div>

                {/* Facility & Assigned Lead Technician */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-800 text-xs">
                  <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-slate-400 font-bold">Authorized Fleet Workshop Facility:</span>
                    <p className="font-bold text-white">{currentTruck.maintenanceSchedule.workshopFacility}</p>
                    <p className="text-[11px] text-amber-400">Location: {currentTruck.maintenanceSchedule.workshopCity}</p>
                  </div>

                  <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-slate-400 font-bold">Assigned Lead Master Diagnostician:</span>
                    <p className="font-bold text-white">{currentTruck.maintenanceSchedule.leadTechnician}</p>
                    <p className="text-[11px] text-slate-400">Direct Workshop Line: {currentTruck.maintenanceSchedule.technicianPhone}</p>
                  </div>
                </div>

                {/* Mandatory Maintenance Checklist */}
                <div className="space-y-3 pt-2">
                  <span className="text-xs font-black text-white uppercase tracking-wider">
                    Service Checklist Items ({currentTruck.maintenanceSchedule.checklist.length} Tasks)
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {currentTruck.maintenanceSchedule.checklist.map((item, idx) => (
                      <div key={idx} className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div className="space-y-0.5">
                          <span className="text-slate-200 font-medium">{item.task}</span>
                          <span className="text-[10px] text-slate-500 block">Estimated: {item.estimatedMinutes} Mins • OEM Genuine Part</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Last Completed Record */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span>
                    Previous Service: <strong>{currentTruck.maintenanceSchedule.lastCompletedService.serviceCode}</strong> completed on {currentTruck.maintenanceSchedule.lastCompletedService.completedDate} ({currentTruck.maintenanceSchedule.lastCompletedService.odometerKm.toLocaleString()} KM)
                  </span>
                  <span className="text-emerald-400 font-bold">✓ Zero Investor Billing</span>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* TAB 5: ENGINE VITALS & CAN-BUS AUXILIARY */}
        {activeTab === 'vitals' && (
          <div className="space-y-6">
            <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
              
              <div className="border-b border-slate-800 pb-4">
                <h4 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-purple-400" />
                  <span>Real-Time Engine CAN-bus & Auxiliary Pneumatics</span>
                </h4>
                <p className="text-xs text-slate-400">
                  Dual pneumatic air brake reservoir pressures, 24V commercial alternator charging status, coolant temperature, and speed geofence caps.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
                  <span className="text-xs font-bold text-slate-400">Air Brake Reservoir</span>
                  <p className="text-2xl font-black text-white font-mono">{currentTruck.engineVitals.airBrakePressurePsi} PSI</p>
                  <p className="text-[11px] text-emerald-400 font-semibold">Dual Tank Nominal (110-128 PSI)</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
                  <span className="text-xs font-bold text-slate-400">Engine Coolant</span>
                  <p className="text-2xl font-black text-white font-mono">{currentTruck.engineVitals.coolantTempCelsius}°C</p>
                  <p className="text-[11px] text-slate-400">Thermostat: 82°C – 96°C</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
                  <span className="text-xs font-bold text-slate-400">Battery / Alternator</span>
                  <p className="text-2xl font-black text-white font-mono">{currentTruck.engineVitals.batteryVolts} V</p>
                  <p className="text-[11px] text-emerald-400 font-semibold">24V Commercial Heavy Bus</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
                  <span className="text-xs font-bold text-slate-400">Transmission Temp</span>
                  <p className="text-2xl font-black text-white font-mono">{currentTruck.engineVitals.transmissionTempCelsius}°C</p>
                  <p className="text-[11px] text-slate-400">ZF TraXon Automatic Box</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
                  <span className="text-xs font-bold text-slate-400">AdBlue / DEF Fluid</span>
                  <p className="text-2xl font-black text-white font-mono">{currentTruck.engineVitals.defLevelPercent}%</p>
                  <p className="text-[11px] text-slate-400">Euro 5 Emission Fluid</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
                  <span className="text-xs font-bold text-slate-400">Water-in-Fuel Sensor</span>
                  <p className="text-lg font-black text-emerald-400">
                    {currentTruck.engineVitals.waterInFuelSensor ? 'Water Detected!' : 'Clear (0.0% Water)'}
                  </p>
                  <p className="text-[10px] text-slate-500">Racor pre-filter float</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
                  <span className="text-xs font-bold text-slate-400">Engine Running Hours</span>
                  <p className="text-2xl font-black text-white font-mono">{currentTruck.engineVitals.engineHours.toLocaleString()} Hrs</p>
                  <p className="text-[10px] text-slate-500">CAN ECM log</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
                  <span className="text-xs font-bold text-slate-400">Speed Governor Cap</span>
                  <p className="text-2xl font-black text-amber-400 font-mono">{currentTruck.engineVitals.governedSpeedCapKmh} KM/H</p>
                  <p className="text-[10px] text-slate-500">FRSC statutory limit</p>
                </div>

              </div>

            </div>
          </div>
        )}

      </div>

      {/* 4. BOOKING SERVICE SLOT MODAL */}
      {bookingModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-amber-500/50 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl relative">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="space-y-1">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-amber-400" />
                  <span>Schedule Workshop Maintenance Slot</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Target Truck: <strong className="text-white font-mono">{currentTruck.unitCode}</strong> ({currentTruck.plateNumber})
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setBookingModalOpen(false);
                  setBookingSuccess(null);
                }}
                className="text-slate-400 hover:text-white text-xs px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {bookingSuccess ? (
              <div className="bg-emerald-950/50 border border-emerald-500/50 rounded-2xl p-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-black text-white">Workshop Slot Reserved!</h4>
                <p className="text-xs text-slate-300">
                  Confirmation Code: <strong className="text-amber-400 font-mono text-sm">{bookingSuccess}</strong>
                </p>
                <p className="text-xs text-slate-400">
                  A dedicated bay at {bookingForm.workshopBay} has been locked for {bookingForm.preferredDate}. The fleet captain has received route dispatch directives.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setBookingModalOpen(false);
                    setBookingSuccess(null);
                  }}
                  className="mt-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl cursor-pointer"
                >
                  Close & Return to Health Monitor
                </button>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Preferred Service Date *</label>
                  <input
                    type="date"
                    required
                    value={bookingForm.preferredDate}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, preferredDate: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Pyda Workshop Facility Bay *</label>
                  <select
                    value={bookingForm.workshopBay}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, workshopBay: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="Pyda Central Heavy Maintenance Bay, Idu Industrial Yard, Abuja">Abuja: Idu Industrial Heavy Yard (Headquarters)</option>
                    <option value="Pyda Maritime Depot, Amuwo Odofin Industrial Estate, Lagos">Lagos: Amuwo Odofin Maritime Depot</option>
                    <option value="Trans-Amadi Fleet Base, Trans-Amadi Industrial Layout, Port Harcourt">Port Harcourt: Trans-Amadi Fleet Base</option>
                    <option value="Kano Sharada Railhead Terminal Depot, Kano State">Kano: Sharada Industrial Phase 2 Terminal</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Required Maintenance Scope *</label>
                  <select
                    value={bookingForm.serviceLevel}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, serviceLevel: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="Service A (5,000 km Preventative Lube & Filter Replacement)">Service A (5,000 km Preventative Lube & Filter Replacement)</option>
                    <option value="Service B (15,000 km Brake Overhaul, Air Dryer & Suspension Torquing)">Service B (15,000 km Brake Overhaul, Air Dryer & Suspension Torquing)</option>
                    <option value="TPMS Wheel Alignment, Tire Balancing & Bead Seal Repair">TPMS Wheel Alignment, Tire Balancing & Bead Seal Repair</option>
                    <option value="Oil Pressure Manometer Diagnostic & High-Pressure Flush">Oil Pressure Manometer Diagnostic & High-Pressure Flush</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Diagnostic Notes for Lead Engineer</label>
                  <textarea
                    rows={3}
                    value={bookingForm.notes}
                    onChange={(e) => setBookingForm(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-emerald-400 font-bold">
                    ✓ 100% Covered by Pyda Agreement
                  </span>
                  <button
                    type="submit"
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl cursor-pointer"
                  >
                    Confirm Booking Slot
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

      {/* 5. EMERGENCY MAINTENANCE VAN DISPATCH MODAL */}
      {dispatchModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-rose-500/50 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400">
                  <ShieldAlert className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white">Emergency Mobile Workshop Dispatched!</h3>
                  <p className="text-xs text-slate-400">Support for Truck: <strong className="text-amber-400 font-mono">{dispatchedTruckCode}</strong></p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDispatchModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Dispatched Van Unit:</span>
                <strong className="text-white">Pyda Rapid Response Van #03 (Hi-Tech Mobile Bay)</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Dispatched From:</span>
                <strong className="text-white">Lokoja / Ore Express Transit Depot</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Estimated Highway Arrival:</span>
                <strong className="text-emerald-400 font-mono font-bold">25 – 35 Minutes</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Mobile Equipment Onboard:</span>
                <strong className="text-slate-200">Heavy Sump Flush Rig, High-PSI Air Compressor & Bead Resealer</strong>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setDispatchModalOpen(false)}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl cursor-pointer"
              >
                Done • Track Van Telematics
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
};
