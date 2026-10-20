import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Truck, 
  MapPin, 
  Clock, 
  Phone, 
  ShieldCheck, 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  ChevronRight,
  Navigation,
  Gauge,
  Compass,
  Radio,
  Share2,
  Download,
  Zap,
  Play,
  Pause,
  RotateCw,
  Copy,
  Check,
  Fuel,
  BatteryCharging,
  Thermometer,
  Lock,
  MessageCircle,
  ExternalLink,
  Sliders,
  Bell,
  RefreshCw,
  QrCode
} from 'lucide-react';
import { ShipmentTrackStatus } from '../types';
import { useCms } from '../context/CmsContext';
import { InteractiveGpsMap } from './InteractiveGpsMap';
import { QrCodeShareModal } from './QrCodeShareModal';
import jsPDF from 'jspdf';

export const ShipmentTracker: React.FC = () => {
  const { cms, advanceShipmentSimulation, updateShipment } = useCms();
  const shipments = cms.shipments || [];

  const [searchCode, setSearchCode] = useState('TEMA-84920');
  const [currentShipment, setCurrentShipment] = useState<ShipmentTrackStatus | null>(() => {
    return shipments.find((s) => s.trackingId.toLowerCase() === 'tema-84920') || shipments[0] || null;
  });
  
  const [errorText, setErrorText] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simSpeed, setSimSpeed] = useState<number>(1); // 1x, 2x, 5x
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCoords, setCopiedCoords] = useState(false);
  const [smsAlertEnabled, setSmsAlertEnabled] = useState(true);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'telematics' | 'timeline' | 'vehicle' | 'security'>('telematics');

  const simIntervalRef = useRef<any>(null);

  // Auto-detect tracking ID from URL parameters or hash (e.g. scanned from QR code)
  useEffect(() => {
    if (typeof window === 'undefined' || shipments.length === 0) return;
    
    let queryParamId: string | null = null;
    try {
      const urlParams = new URLSearchParams(window.location.search);
      queryParamId = urlParams.get('id') || urlParams.get('trackingId');
      
      if (!queryParamId && window.location.hash.includes('?')) {
        const hashQuery = window.location.hash.split('?')[1];
        if (hashQuery) {
          const hashParams = new URLSearchParams(hashQuery);
          queryParamId = hashParams.get('id') || hashParams.get('trackingId');
        }
      }
    } catch {
      // Ignore URL parsing errors
    }

    if (queryParamId) {
      const cleanId = queryParamId.trim().toLowerCase();
      const match = shipments.find((s) => s.trackingId.toLowerCase() === cleanId);
      if (match) {
        setSearchCode(match.trackingId);
        setCurrentShipment(match);
      }
    }
  }, [shipments]);

  // Synchronize currentShipment with CMS updates
  useEffect(() => {
    if (currentShipment) {
      const updated = shipments.find(
        (s) => s.trackingId.toLowerCase() === currentShipment.trackingId.toLowerCase()
      );
      if (updated) {
        setCurrentShipment(updated);
      }
    } else if (shipments.length > 0) {
      setCurrentShipment(shipments[0]);
    }
  }, [shipments]);

  // Simulation Interval Handler
  useEffect(() => {
    if (isSimulating && currentShipment) {
      const intervalTime = Math.max(800, 2500 / simSpeed);
      simIntervalRef.current = setInterval(() => {
        advanceShipmentSimulation(currentShipment.trackingId, 1);
      }, intervalTime);
    } else {
      if (simIntervalRef.current) {
        clearInterval(simIntervalRef.current);
      }
    }

    return () => {
      if (simIntervalRef.current) {
        clearInterval(simIntervalRef.current);
      }
    };
  }, [isSimulating, simSpeed, currentShipment?.trackingId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');
    const code = searchCode.trim().toLowerCase();
    const found = shipments.find(
      (s) => s.trackingId.toLowerCase() === code || s.clientName.toLowerCase().includes(code)
    );
    if (found) {
      setCurrentShipment(found);
    } else {
      setErrorText(`No active dispatch record found for '${searchCode}'. Try one of the sample tracking codes below.`);
    }
  };

  const handleSelectShipment = (s: ShipmentTrackStatus) => {
    setSearchCode(s.trackingId);
    setCurrentShipment(s);
    setErrorText('');
    setIsSimulating(false);
  };

  const handleCopyShareLink = () => {
    if (!currentShipment) return;
    const url = `${window.location.origin}/#tracking?id=${currentShipment.trackingId}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyCoords = () => {
    if (!currentShipment?.currentCoordinates) return;
    const lat = typeof currentShipment.currentCoordinates.lat === 'number' && Number.isFinite(currentShipment.currentCoordinates.lat) ? currentShipment.currentCoordinates.lat : 7.8023;
    const lng = typeof currentShipment.currentCoordinates.lng === 'number' && Number.isFinite(currentShipment.currentCoordinates.lng) ? currentShipment.currentCoordinates.lng : 6.7412;
    const coordsStr = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    navigator.clipboard.writeText(coordsStr);
    setCopiedCoords(true);
    setTimeout(() => setCopiedCoords(false), 2000);
  };

  // Generate and Download Official Telematics Waybill PDF
  const handleDownloadWaybill = () => {
    if (!currentShipment) return;

    const doc = new jsPDF();
    
    // Header brand background
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, 210, 40, 'F');

    // Logo & Header text
    doc.setTextColor(245, 158, 11); // amber-500
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('MEGATREND MOVERS & LOGISTICS', 14, 18);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Real-Time GPS Telematics & Official Consignment Waybill', 14, 25);
    doc.text(`Generated: ${new Date().toLocaleString('en-GB')}`, 14, 31);

    // Tracking Reference Box
    doc.setFillColor(245, 158, 11);
    doc.roundedRect(140, 10, 56, 20, 2, 2, 'F');
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('WAYBILL / TRACKING REF', 144, 17);
    doc.setFontSize(11);
    doc.text(currentShipment.trackingId, 144, 25);

    // Consignment Overview Box
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('1. Consignment & Dispatch Summary', 14, 52);

    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, 56, 182, 38, 2, 2, 'FD');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Client / Organization:', 18, 64);
    doc.setFont('helvetica', 'normal');
    doc.text(currentShipment.clientName, 65, 64);

    doc.setFont('helvetica', 'bold');
    doc.text('Service Classification:', 18, 72);
    doc.setFont('helvetica', 'normal');
    doc.text(currentShipment.serviceType, 65, 72);

    doc.setFont('helvetica', 'bold');
    doc.text('Route Corridor:', 18, 80);
    doc.setFont('helvetica', 'normal');
    doc.text(`${currentShipment.origin}  ➔  ${currentShipment.destination}`, 65, 80);

    doc.setFont('helvetica', 'bold');
    doc.text('Current Transit Status:', 18, 88);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(16, 185, 129); // emerald-500
    doc.text(`${currentShipment.status} (${currentShipment.progressPercent}% Completed)`, 65, 88);

    // Telematics & Fleet Details
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('2. Satellite GPS Telematics & Convoy Specs', 14, 106);

    doc.roundedRect(14, 110, 182, 45, 2, 2, 'FD');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Current GPS Position:', 18, 118);
    doc.setFont('helvetica', 'normal');
    doc.text(currentShipment.currentLocation, 65, 118);

    doc.setFont('helvetica', 'bold');
    doc.text('GPS Lat/Lng Coordinates:', 18, 126);
    doc.setFont('helvetica', 'normal');
    const lat = currentShipment.currentCoordinates?.lat.toFixed(5) || '7.80230';
    const lng = currentShipment.currentCoordinates?.lng.toFixed(5) || '6.74120';
    doc.text(`${lat}° N, ${lng}° E (Satellite Fix: 11 Satellites Lock)`, 65, 126);

    doc.setFont('helvetica', 'bold');
    doc.text('Assigned Convoy Vehicle:', 18, 134);
    doc.setFont('helvetica', 'normal');
    doc.text(`${currentShipment.vehicleType || 'Heavy Hauler'} (Plate: ${currentShipment.vehiclePlate || 'ABC-492-XJ'})`, 65, 134);

    doc.setFont('helvetica', 'bold');
    doc.text('Lead Driver / Escort:', 18, 142);
    doc.setFont('helvetica', 'normal');
    doc.text(`${currentShipment.driverName || 'Lead Musa Ibrahim'} (${currentShipment.driverPhone || '08036249911'})`, 65, 142);

    doc.setFont('helvetica', 'bold');
    doc.text('Tamper Seal Security:', 18, 150);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(217, 119, 6);
    doc.text(currentShipment.tamperSealCode || 'MTM-SEAL-88392-LOK (INTACT)', 65, 150);

    // Milestones Table
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('3. Verified Checkpoint Audit Trail', 14, 168);

    let yPos = 175;
    currentShipment.updates.slice(0, 5).forEach((up, i) => {
      doc.setFillColor(i % 2 === 0 ? 255 : 248, i % 2 === 0 ? 255 : 250, i % 2 === 0 ? 255 : 252);
      doc.rect(14, yPos - 4, 182, 12, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.line(14, yPos + 8, 196, yPos + 8);

      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(`${up.date} ${up.time}`, 18, yPos + 2);

      doc.setTextColor(217, 119, 6);
      doc.text(up.location, 60, yPos + 2);

      doc.setTextColor(71, 85, 105);
      doc.setFont('helvetica', 'normal');
      doc.text(up.note.substring(0, 70), 105, yPos + 2);

      yPos += 14;
    });

    // Footer Sign-off
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 275, 210, 22, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Megatrend Movers & Logistics Ltd • Abuja HQ: Citygate Plaza • Lagos Hub: Satellite Town', 14, 283);
    doc.text('24/7 Operations Hotline: 0806 246 6212 • info@megatrendmovers.com • www.megatrendmovers.com', 14, 289);

    doc.save(`Megatrend-GPS-Waybill-${currentShipment.trackingId}.pdf`);
  };

  const filteredShipments = shipments.filter((s) => {
    if (filterCategory === 'all') return true;
    if (filterCategory === 'transit') return s.status === 'In Transit';
    if (filterCategory === 'delivery') return s.status === 'Out for Delivery';
    if (filterCategory === 'customs') return s.status === 'Customs Clearance';
    return true;
  });

  return (
    <section id="tracking-portal" className="py-12 sm:py-16 bg-slate-950 text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Title Section */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 font-extrabold text-xs uppercase tracking-widest px-4 py-1.5 rounded-full">
            <Radio className="w-3.5 h-3.5 animate-pulse text-amber-400" />
            <span>Active Satellite Fleet Telematics & GPS Radar</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Live GPS Consignment Tracking
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Monitor real-time highway telemetry, convoy coordinates, verified checkpoint logs, and tamper seal integrity across Nigeria & Pan-Africa.
          </p>
        </div>

        {/* Search Bar & Quick Filters */}
        <div className="max-w-3xl mx-auto space-y-4">
          <form onSubmit={handleSearch} className="relative">
            <div className="flex items-center bg-slate-900 border-2 border-slate-800 focus-within:border-amber-400 rounded-2xl p-2 shadow-2xl transition-all">
              <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
              <input
                type="text"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                placeholder="Enter 10-digit Waybill or Tracking Code (e.g. TEMA-84920)..."
                className="w-full bg-transparent border-none text-white px-3 py-2 text-sm font-bold focus:outline-none placeholder-slate-500"
                id="gps-search-input"
              />
              <button
                type="submit"
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 transition-all transform active:scale-95 shrink-0"
                id="gps-search-btn"
              >
                <span>Track Live</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {errorText && (
              <p className="text-xs text-rose-400 text-center mt-2 flex items-center justify-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                <span>{errorText}</span>
              </p>
            )}
          </form>

          {/* Quick Filter Badges / Active Shipments Selector */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 shadow-lg flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto">
              <span className="text-slate-400 font-bold text-[11px] whitespace-nowrap">Active Dispatches:</span>
              {shipments.map((s) => {
                const isSelected = currentShipment?.trackingId === s.trackingId;
                return (
                  <button
                    key={s.trackingId}
                    type="button"
                    onClick={() => handleSelectShipment(s)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all active:scale-95 flex items-center gap-1.5 whitespace-nowrap ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold scale-105'
                        : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                    id={`gps-shipment-pill-${s.trackingId}`}
                  >
                    <span>{s.trackingId}</span>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      s.status === 'Out for Delivery' ? 'bg-emerald-400' : s.status === 'Customs Clearance' ? 'bg-blue-400' : 'bg-amber-400'
                    }`} />
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-400 w-full sm:w-auto justify-end">
              <span>Status Filter:</span>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2 py-1 font-bold focus:outline-none"
              >
                <option value="all">All Fleets</option>
                <option value="transit">In Transit</option>
                <option value="delivery">Out for Delivery</option>
                <option value="customs">Customs</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Active Tracking Dashboard */}
        {currentShipment && (
          <div className="space-y-6">
            
            {/* Top Overview Header Banner */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl flex flex-wrap items-center justify-between gap-6">
              
              {/* Left: Client & Tracking Meta */}
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-black uppercase px-3 py-0.5 rounded-lg">
                    {currentShipment.serviceType}
                  </span>
                  <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2.5 py-0.5 rounded border border-slate-800">
                    Ref #{currentShipment.trackingId}
                  </span>
                  <span className="text-xs text-slate-400 font-bold hidden sm:inline">
                    Unit: <strong className="text-white">{currentShipment.vehicleUnit || 'MTM-FL-108'}</strong>
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white">{currentShipment.clientName}</h2>
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <span className="font-bold text-amber-400">{currentShipment.origin}</span>
                  <span className="text-slate-500">➔</span>
                  <span className="font-bold text-emerald-400">{currentShipment.destination}</span>
                </div>
              </div>

              {/* Right: Quick Action Buttons & Status */}
              <div className="flex flex-wrap items-center gap-3">
                
                {/* Live Status Badge */}
                <div className="bg-slate-950 border border-slate-800 px-4 py-2 rounded-xl flex items-center gap-3 shadow-inner">
                  <div className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Status</span>
                    <span className="text-xs font-black text-emerald-400">{currentShipment.status}</span>
                  </div>
                </div>

                {/* PDF Waybill Download */}
                <button
                  onClick={handleDownloadWaybill}
                  className="bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl border border-slate-700 shadow flex items-center gap-1.5 transition-all"
                  title="Download Official Telematics Waybill PDF"
                  id="gps-download-waybill-btn"
                >
                  <Download className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline">Waybill PDF</span>
                </button>

                {/* Share Live Link */}
                <button
                  onClick={handleCopyShareLink}
                  className="bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl border border-slate-700 shadow flex items-center gap-1.5 transition-all"
                  title="Copy Tracking Share Link"
                  id="gps-share-link-btn"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-amber-400" />}
                  <span className="hidden sm:inline">{copiedLink ? 'Link Copied!' : 'Share'}</span>
                </button>

                {/* Share via QR Code */}
                <button
                  onClick={() => setQrModalOpen(true)}
                  className="bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black text-xs px-3.5 py-2.5 rounded-xl shadow-lg flex items-center gap-1.5 transition-all"
                  title="Scan & Share Tracking via QR Code"
                  id="gps-qr-share-btn"
                >
                  <QrCode className="w-4 h-4 text-slate-950" />
                  <span>Share QR</span>
                </button>

              </div>
            </div>

            {/* Main Interactive Leaflet GPS Map with Live Controls */}
            <div className="space-y-3">
              <InteractiveGpsMap
                shipment={currentShipment}
                isSimulating={isSimulating}
                onToggleSimulation={() => setIsSimulating(!isSimulating)}
                onAdvanceSimulation={() => advanceShipmentSimulation(currentShipment.trackingId, 1)}
              />

              {/* Simulation Toolbar & Speed Selector */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                
                <div className="flex items-center gap-3">
                  <span className="text-slate-400 font-bold flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>GPS Telematics Live Engine:</span>
                  </span>
                  
                  <button
                    onClick={() => setIsSimulating(!isSimulating)}
                    className={`px-3 py-1.5 rounded-lg font-black flex items-center gap-1.5 text-xs transition-all active:scale-95 ${
                      isSimulating 
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md animate-pulse' 
                        : 'bg-slate-800 text-amber-400 hover:bg-slate-700 border border-slate-700'
                    }`}
                    id="gps-toggle-simulation-btn"
                  >
                    {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{isSimulating ? 'Pause Movement' : 'Start Highway Run'}</span>
                  </button>

                  <button
                    onClick={() => advanceShipmentSimulation(currentShipment.trackingId, 1)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white rounded-lg border border-slate-700 flex items-center gap-1 text-[11px] font-bold transition-all"
                    title="Jump to Next Waypoint"
                  >
                    <RotateCw className="w-3.5 h-3.5 text-amber-400" />
                    <span>Step Waypoint</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-[11px] font-bold">Sim Speed:</span>
                  {[1, 2, 5].map((speed) => (
                    <button
                      key={speed}
                      onClick={() => setSimSpeed(speed)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-black transition-all active:scale-95 ${
                        simSpeed === speed
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}

                  <button
                    onClick={handleCopyCoords}
                    className="ml-2 px-2.5 py-1 bg-slate-950 border border-slate-800 text-slate-300 hover:text-amber-400 active:scale-95 rounded-lg text-[11px] font-mono flex items-center gap-1 transition-all"
                    title="Copy precise GPS coordinates"
                  >
                    {copiedCoords ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCoords ? 'Copied!' : 'Copy GPS Lat/Lng'}</span>
                  </button>
                </div>

              </div>
            </div>

            {/* Route Progress Bar & Distance Counters */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-bold">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Origin Depot</span>
                  <span className="text-white text-sm">{currentShipment.origin}</span>
                </div>

                <div className="text-center">
                  <span className="text-amber-400 text-base font-black">{currentShipment.progressPercent}%</span>
                  <span className="text-slate-400 text-[10px] block uppercase">Route Completed</span>
                </div>

                <div className="text-right">
                  <span className="text-slate-400 block text-[10px] uppercase">Destination Terminal</span>
                  <span className="text-white text-sm">{currentShipment.destination}</span>
                </div>
              </div>

              {/* Visual Progress Bar */}
              <div className="w-full bg-slate-950 rounded-full h-3.5 p-0.5 border border-slate-800 relative overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 h-full rounded-full transition-all duration-500 shadow-lg"
                  style={{ width: `${currentShipment.progressPercent}%` }}
                />
              </div>

              {/* Estimated Metrics Counters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Estimated Arrival</span>
                  <p className="text-white font-black text-sm mt-0.5">{currentShipment.estimatedArrival}</p>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Distance Covered</span>
                  <p className="text-amber-400 font-black text-sm mt-0.5 font-mono">
                    {currentShipment.distanceTraveledKm || 512} / {currentShipment.totalDistanceKm || 750} km
                  </p>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Current Speed</span>
                  <p className="text-emerald-400 font-black text-sm mt-0.5 font-mono">
                    {currentShipment.speedKmh ?? 68} km/h (Bearing {currentShipment.headingDegrees || 42}°)
                  </p>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Geofence Status</span>
                  <p className="text-sky-400 font-black text-sm mt-0.5">{currentShipment.geofenceStatus || 'On Highway Route'}</p>
                </div>
              </div>
            </div>

            {/* Navigation Tabs for Deep Telematics, Timeline, Driver, and Security */}
            <div className="space-y-4">
              
              <div className="flex border-b border-slate-800 gap-2 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('telematics')}
                  className={`pb-3 px-4 font-bold text-xs uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all active:scale-95 whitespace-nowrap ${
                    activeTab === 'telematics'
                      ? 'border-amber-400 text-amber-400 font-black'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Gauge className="w-4 h-4" />
                  <span>Convoy Telemetry Gauges</span>
                </button>

                <button
                  onClick={() => setActiveTab('timeline')}
                  className={`pb-3 px-4 font-bold text-xs uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all active:scale-95 whitespace-nowrap ${
                    activeTab === 'timeline'
                      ? 'border-amber-400 text-amber-400 font-black'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span>Transit Log & Milestones</span>
                </button>

                <button
                  onClick={() => setActiveTab('vehicle')}
                  className={`pb-3 px-4 font-bold text-xs uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all active:scale-95 whitespace-nowrap ${
                    activeTab === 'vehicle'
                      ? 'border-amber-400 text-amber-400 font-black'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Truck className="w-4 h-4" />
                  <span>Fleet Vehicle & Driver Contact</span>
                </button>

                <button
                  onClick={() => setActiveTab('security')}
                  className={`pb-3 px-4 font-bold text-xs uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all active:scale-95 whitespace-nowrap ${
                    activeTab === 'security'
                      ? 'border-amber-400 text-amber-400 font-black'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Cargo Vault & Tamper Seal</span>
                </button>
              </div>

              {/* Tab 1: Live Telemetry Gauges */}
              {activeTab === 'telematics' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-200">
                  
                  {/* Speedometer Card */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase">Speed Telemetry</span>
                      <Gauge className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-white font-mono">{currentShipment.speedKmh ?? 68}</span>
                      <span className="text-xs text-slate-400 font-bold">km/h</span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                      <div
                        className="bg-amber-400 h-full rounded-full transition-all"
                        style={{ width: `${Math.min(100, ((currentShipment.speedKmh ?? 68) / 100) * 100)}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-400">Cruising speed locked under speed governor threshold.</p>
                  </div>

                  {/* Fuel & Power Card */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase">Fuel & Power Level</span>
                      <Fuel className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-white font-mono">{currentShipment.fuelLevelPercent ?? 74}%</span>
                      <span className="text-xs text-slate-400 font-bold">Diesel</span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                      <div
                        className="bg-emerald-400 h-full rounded-full transition-all"
                        style={{ width: `${currentShipment.fuelLevelPercent ?? 74}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-400">Aux Inverter: <strong className="text-white">{currentShipment.batteryVolts ?? 27.8}V</strong> (Optimal)</p>
                  </div>

                  {/* Cargo Climate Card */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase">Cargo Temperature</span>
                      <Thermometer className="w-4 h-4 text-sky-400" />
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-white font-mono">{currentShipment.cargoTempCelsius ?? 24.5}°C</span>
                      <span className="text-xs text-slate-400 font-bold">Vault Internal</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Insulated & Climate Safe</span>
                    </div>
                    <p className="text-[11px] text-slate-400">Zero moisture or humidity threshold detected.</p>
                  </div>

                  {/* Satellite Fix Card */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase">Satellite Signal</span>
                      <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-white font-mono">{currentShipment.satelliteCount ?? 11}</span>
                      <span className="text-xs text-slate-400 font-bold">/ 12 Locked</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span>Differential GPS Active</span>
                    </div>
                    <p className="text-[11px] text-slate-400">Position accuracy within &plusmn;1.2 meters radius.</p>
                  </div>

                </div>
              )}

              {/* Tab 2: Verified Checkpoints & Transit Milestones */}
              {activeTab === 'timeline' && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>Verified Transit Checkpoints & Telematics Log</span>
                    </h3>
                    <span className="text-xs text-slate-400 font-bold">
                      {currentShipment.updates.length} Recorded Checkpoints
                    </span>
                  </div>

                  <div className="space-y-3">
                    {currentShipment.updates.map((up, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-950 p-4 rounded-xl border border-slate-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shrink-0 mt-0.5">
                            <CheckCircle className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-black text-white text-sm">{up.location}</span>
                              <span className="text-slate-500">•</span>
                              <span className="text-amber-400 font-mono text-xs">{up.date} at {up.time}</span>
                            </div>
                            <p className="text-slate-300 mt-1">{up.note}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono self-end sm:self-auto shrink-0 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                          <MapPin className="w-3 h-3 text-amber-400" />
                          <span>Checkpoint #{currentShipment.updates.length - idx} Verified</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 3: Fleet Vehicle & Driver Contact */}
              {activeTab === 'vehicle' && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 animate-in fade-in duration-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Vehicle Details */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
                        <Truck className="w-4 h-4" />
                        <span>Convoy Unit Specifications</span>
                      </h3>

                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                        <div className="flex justify-between py-1 border-b border-slate-800/80">
                          <span className="text-slate-400">Fleet Unit ID:</span>
                          <strong className="text-white font-mono">{currentShipment.vehicleUnit || 'MTM-FL-108'}</strong>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-800/80">
                          <span className="text-slate-400">Registration Plate:</span>
                          <strong className="text-amber-400 font-mono">{currentShipment.vehiclePlate || 'KJA-842-XB (Lagos)'}</strong>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-800/80">
                          <span className="text-slate-400">Vehicle Category:</span>
                          <strong className="text-white">{currentShipment.vehicleType || '30-Ton Heavy Hauler'}</strong>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-slate-400">Insurance & GIT Policy:</span>
                          <strong className="text-emerald-400">Comprehensive Goods-In-Transit Active</strong>
                        </div>
                      </div>
                    </div>

                    {/* Driver & Convoy Escort Contact */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span>Assigned Convoy Lead</span>
                      </h3>

                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={currentShipment.driverPhoto || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'}
                            alt={currentShipment.driverName || 'Lead Musa Ibrahim'}
                            className="w-12 h-12 rounded-xl object-cover border border-amber-500/40"
                          />
                          <div>
                            <p className="font-black text-white text-sm">{currentShipment.driverName || 'Lead Musa Ibrahim'}</p>
                            <p className="text-xs text-slate-400 font-bold">Certified Master Transport Lead</p>
                            <p className="text-[11px] text-amber-400 font-mono mt-0.5">{currentShipment.driverPhone || '08036249911'}</p>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <a
                            href={`tel:${currentShipment.driverPhone || '08036249911'}`}
                            className="bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow transition-all"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>Call Lead</span>
                          </a>

                          <a
                            href={`https://wa.me/${(currentShipment.driverPhone || '2348062466212').replace(/[^0-9]/g, '')}?text=Hello%20Lead%20Driver,%20inquiring%20about%20Shipment%20Ref%20${currentShipment.trackingId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-emerald-500/20 hover:bg-emerald-500/30 active:scale-95 text-emerald-400 border border-emerald-500/40 font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </a>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* Tab 4: Cargo Vault & Electronic Tamper Seal */}
              {activeTab === 'security' && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      <span>Electronic Tamper Seal & Cargo Security Audit</span>
                    </h3>
                    <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full font-bold">
                      100% Secure & Unbroken
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-slate-400 font-bold uppercase text-[10px]">Tamper Seal Serial</span>
                      <p className="text-amber-400 font-mono font-black text-sm">{currentShipment.tamperSealCode || 'MTM-SEAL-88392-LOK'}</p>
                      <p className="text-slate-500 text-[11px]">RFID & Barcode scanned at origin loading depot.</p>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-slate-400 font-bold uppercase text-[10px]">Vault Latch Sensor</span>
                      <p className="text-emerald-400 font-black text-sm">LOCKED & ARMED</p>
                      <p className="text-slate-500 text-[11px]">Real-time door breach sensor armed with siren ping.</p>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-slate-400 font-bold uppercase text-[10px]">Emergency Escort Channel</span>
                      <p className="text-white font-black text-sm">24/7 Rapid Response Unit</p>
                      <p className="text-slate-500 text-[11px]">Police & Highway patrol backup standing by.</p>
                    </div>
                  </div>
                </div>
              )}

            </div>

          </div>
        )}

        {/* QR Code Share Modal */}
        <QrCodeShareModal
          isOpen={qrModalOpen}
          onClose={() => setQrModalOpen(false)}
          type="tracking"
          shipment={currentShipment}
          title={currentShipment ? `Share Tracking #${currentShipment.trackingId}` : 'Share Tracking via QR Code'}
        />

      </div>
    </section>
  );
};
