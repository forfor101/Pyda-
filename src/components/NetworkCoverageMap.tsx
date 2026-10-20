import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  Navigation, 
  MapPin, 
  Truck, 
  ShieldCheck, 
  Zap, 
  Layers, 
  Maximize2, 
  Minimize2,
  Compass, 
  RotateCw, 
  Info,
  Clock,
  ArrowRight,
  Globe2,
  CheckCircle2,
  Sparkles,
  Radio,
  Phone,
  MessageSquare,
  Mail,
  Building,
  UserCheck,
  ExternalLink,
  X,
  ChevronRight,
  Shield,
  Calculator
} from 'lucide-react';
import { OfficeLocation } from '../types';

export interface RouteCorridor {
  id: string;
  name: string;
  originHub: string;
  destinationHub: string;
  category: 'core-domestic' | 'cross-border' | 'interstate' | 'pan-africa';
  distanceKm: number;
  durationHours: string;
  frequency: string;
  color: string;
  glowClass: string;
  securityRating: string;
  customsNote?: string;
  waypoints: [number, number][];
  waypointNames: string[];
  vehicleTypes: string[];
}

export const LOGISTICS_CORRIDORS: RouteCorridor[] = [
  {
    id: 'lagos-abuja',
    name: 'Lagos ⇄ Abuja Core Arterial',
    originHub: 'Lagos (Satellite Town Hub)',
    destinationHub: 'Abuja (Corporate HQ)',
    category: 'core-domestic',
    distanceKm: 755,
    durationHours: '24 - 36 Hours',
    frequency: 'Daily Departures (Twice Daily)',
    color: '#e5a738', // Sahara Ochre
    glowClass: 'route-glow-amber',
    securityRating: 'Armed Escort + Dual Telematics Lock',
    waypoints: [
      [6.4523, 3.2568], // Lagos Satellite Hub
      [6.6018, 3.3515], // Ikeja Exit
      [6.8485, 3.6465], // Sagamu Interchange
      [6.8041, 4.3128], // Ijebu Ode
      [6.7469, 4.8767], // Ore Bypass
      [6.3350, 5.6037], // Benin City Bypass
      [7.0673, 6.2731], // Auchi
      [7.5504, 6.2366], // Okene Highway
      [7.8023, 6.7412], // Lokoja Confluence Hub
      [8.4735, 6.9458], // Abaji FCT Transit Gate
      [8.9431, 7.0792], // Gwagwalada
      [9.0062, 7.4281], // Abuja Citygate HQ
    ],
    waypointNames: ['Lagos Hub', 'Sagamu', 'Ore', 'Benin Bypass', 'Auchi', 'Lokoja', 'Abaji FCT', 'Abuja HQ'],
    vehicleTypes: ['30-Ton Enclosed Heavy Box', '10-Ton Air-Ride Van', '40ft Container Chassis'],
  },
  {
    id: 'lagos-accra',
    name: 'Lagos ⇄ Accra West Africa Coastal Corridor',
    originHub: 'Lagos (Old Ojo Road Terminal)',
    destinationHub: 'Accra (Heavy Industrial Park, Ghana)',
    category: 'cross-border',
    distanceKm: 470,
    durationHours: '3 - 4 Days',
    frequency: '3x Weekly Dedicated Service',
    color: '#14b8a6', // Atlantic Deep Teal
    glowClass: 'route-glow-cyan',
    securityRating: 'ECOWAS Seal + Biometric Transit Log',
    customsNote: 'Fast-Track Seme & Aflao Border Customs Clearance',
    waypoints: [
      [6.4523, 3.2568], // Lagos Alakija Terminal
      [6.4167, 2.8833], // Badagry
      [6.3833, 2.7167], // Seme Border (Nigeria / Benin)
      [6.3703, 2.3912], // Cotonou Port Terminal, Benin
      [6.4969, 1.7911], // Ouidah / Grand-Popo
      [6.1375, 1.2125], // Lome / Aflao Border (Togo / Ghana)
      [5.6983, -0.0166], // Tema Maritime Port
      [5.6037, -0.1870], // Accra Logistics Park, Ghana
    ],
    waypointNames: ['Lagos Hub', 'Badagry', 'Seme Border (NG/BJ)', 'Cotonou', 'Lome Border (TG/GH)', 'Tema Port', 'Accra Ghana'],
    vehicleTypes: ['30-Ton Cross-Border Box Trailer', 'Air-Suspension Van', 'Customs Bonded Carrier'],
  },
  {
    id: 'lagos-kano',
    name: 'Lagos ⇄ Kano Northern Heavy Freight Spine',
    originHub: 'Lagos (Apapa Maritime & Alakija)',
    destinationHub: 'Kano (Sharada Industrial Estate)',
    category: 'core-domestic',
    distanceKm: 1040,
    durationHours: '48 - 72 Hours',
    frequency: 'Daily Scheduled Convoys',
    color: '#1f7ecc', // Maritime Azure
    glowClass: 'route-glow-indigo',
    securityRating: 'Satellite Geofence + Lead Vehicle Escort',
    waypoints: [
      [6.4523, 3.2568], // Lagos
      [7.3775, 3.9470], // Ibadan Terminal
      [7.8322, 3.9312], // Ogbomoso
      [8.4966, 4.5421], // Ilorin
      [9.1412, 4.8211], // Jebba Niger Crossing
      [9.6177, 6.5569], // Minna Junction
      [10.5105, 7.4165], // Kaduna South Freight Yard
      [11.0775, 7.7144], // Zaria
      [12.0022, 8.5920], // Kano Distribution Hub
    ],
    waypointNames: ['Lagos', 'Ibadan', 'Ilorin', 'Jebba Crossing', 'Minna', 'Kaduna', 'Zaria', 'Kano Hub'],
    vehicleTypes: ['40-Ton Flatbed Freight Tractor', '30-Ton Heavy Hauler', 'Covered Box Truck'],
  },
  {
    id: 'lagos-ph',
    name: 'Lagos ⇄ Port Harcourt Oil & Maritime Link',
    originHub: 'Lagos (Maritime Logistics Hub)',
    destinationHub: 'Port Harcourt (Trans-Amadi Terminal)',
    category: 'interstate',
    distanceKm: 615,
    durationHours: '24 - 48 Hours',
    frequency: 'Daily Freight Dispatch',
    color: '#0fa168', // Calabar Viridian Jade
    glowClass: 'route-glow-emerald',
    securityRating: 'Convoy Tracking + Level-3 Cargo Insurance',
    waypoints: [
      [6.4523, 3.2568], // Lagos
      [6.7469, 4.8767], // Ore
      [6.3350, 5.6037], // Benin City
      [6.1982, 6.7214], // Asaba River Niger Bridge
      [6.1432, 6.7865], // Onitsha Commercial Hub
      [5.5324, 7.0345], // Owerri
      [4.8156, 7.0498], // Port Harcourt Trans-Amadi
    ],
    waypointNames: ['Lagos', 'Ore', 'Benin City', 'Asaba', 'Onitsha', 'Owerri', 'Port Harcourt Hub'],
    vehicleTypes: ['Oil & Industrial Equipment Carrier', '15-Ton Box Truck', '20ft/40ft Chassis'],
  },
  {
    id: 'abuja-kano',
    name: 'Abuja ⇄ Kano North-Central Expressway',
    originHub: 'Abuja (Citygate Corporate HQ)',
    destinationHub: 'Kano (Regional Depot)',
    category: 'interstate',
    distanceKm: 420,
    durationHours: '8 - 12 Hours',
    frequency: 'Daily Express Shuttle',
    color: '#ec4899', // Pink
    glowClass: 'route-glow-amber',
    securityRating: 'Express Highway Transit Escort',
    waypoints: [
      [9.0062, 7.4281], // Abuja HQ
      [9.5932, 7.3912], // Jere / Katari
      [10.5105, 7.4165], // Kaduna
      [11.0775, 7.7144], // Zaria
      [12.0022, 8.5920], // Kano Hub
    ],
    waypointNames: ['Abuja HQ', 'Kaduna Express', 'Zaria', 'Kano Terminal'],
    vehicleTypes: ['10-Ton Relocation Van', '5-Ton Express Shuttle'],
  },
  {
    id: 'abuja-ph',
    name: 'Abuja ⇄ Port Harcourt / Eastern Corridor',
    originHub: 'Abuja (Corporate HQ)',
    destinationHub: 'Port Harcourt (Trans-Amadi)',
    category: 'interstate',
    distanceKm: 640,
    durationHours: '18 - 24 Hours',
    frequency: '4x Weekly Scheduled Route',
    color: '#8b5cf6', // Violet
    glowClass: 'route-glow-indigo',
    securityRating: 'Dedicated Inter-State Telematics',
    waypoints: [
      [9.0062, 7.4281], // Abuja
      [7.7322, 8.5391], // Makurdi Benue Crossing
      [6.8567, 7.4091], // Nsukka
      [6.4584, 7.5464], // Enugu Depot
      [5.5324, 7.0345], // Owerri
      [4.8156, 7.0498], // Port Harcourt
    ],
    waypointNames: ['Abuja HQ', 'Makurdi Crossing', 'Enugu', 'Owerri', 'Port Harcourt'],
    vehicleTypes: ['Full-Household Moving Vans', 'Heavy Freight Box Truck'],
  },
];

interface NetworkCoverageMapProps {
  branches: OfficeLocation[];
  activeOfficeId?: string;
  onSelectOffice?: (officeId: string) => void;
  onOpenQuoteModal?: (service?: any, origin?: string, destination?: string) => void;
}

export const NetworkCoverageMap: React.FC<NetworkCoverageMapProps> = ({
  branches,
  activeOfficeId,
  onSelectOffice,
  onOpenQuoteModal,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const polylinesLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const markersLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const movingVehiclesGroupRef = useRef<L.LayerGroup | null>(null);
  const markerMapRef = useRef<Map<string, L.Marker>>(new Map());
  const animationFrameRef = useRef<number | null>(null);

  const [selectedCorridorId, setSelectedCorridorId] = useState<string>('all');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isPlayingSimulation, setIsPlayingSimulation] = useState<boolean>(true);
  const [selectedOfficeModal, setSelectedOfficeModal] = useState<OfficeLocation | null>(null);
  const [hubCategoryFilter, setHubCategoryFilter] = useState<'all' | 'hq' | 'nigeria' | 'pan-africa'>('all');

  const activeCorridor = LOGISTICS_CORRIDORS.find((c) => c.id === selectedCorridorId);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Centered over Nigeria and West Africa
    const map = L.map(mapContainerRef.current, {
      center: [8.2, 5.0],
      zoom: 6,
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: true,
      minZoom: 4,
      maxZoom: 14,
    });

    L.control.zoom({ position: 'topright' }).addTo(map);

    // Dark matter tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    const polylinesLayer = L.layerGroup().addTo(map);
    const markersLayer = L.layerGroup().addTo(map);
    const vehiclesLayer = L.layerGroup().addTo(map);

    polylinesLayerGroupRef.current = polylinesLayer;
    markersLayerGroupRef.current = markersLayer;
    movingVehiclesGroupRef.current = vehiclesLayer;
    mapInstanceRef.current = map;

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Listen for clicks on the Leaflet popup "Calculate Price" button
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    const handleClick = (e: MouseEvent) => {
      const btn = (e.target as HTMLElement).closest('[data-action="calculate-price"]');
      if (!btn) return;
      const city = btn.getAttribute('data-city');
      if (city && onOpenQuoteModal) {
        onOpenQuoteModal('corporate', city);
      }
    };

    container.addEventListener('click', handleClick);
    return () => {
      container.removeEventListener('click', handleClick);
    };
  }, [onOpenQuoteModal]);

  // Update Popups and Markers whenever branches, filter, or activeOfficeId changes
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerGroupRef.current) return;

    const markersGroup = markersLayerGroupRef.current;
    markersGroup.clearLayers();
    markerMapRef.current.clear();

    const filteredBranches = branches.filter(b => {
      if (hubCategoryFilter === 'hq') return b.type === 'headquarters';
      if (hubCategoryFilter === 'nigeria') return b.region === 'Nigeria';
      if (hubCategoryFilter === 'pan-africa') return b.region === 'Pan-Africa';
      return true;
    });

    filteredBranches.forEach((branch) => {
      const isHQ = branch.type === 'headquarters';
      const isMainHub = branch.isMainHub;
      const isSelected = branch.id === activeOfficeId;

      const markerColor = isHQ 
        ? '#f59e0b' 
        : isMainHub 
          ? '#3b82f6' 
          : branch.region === 'Pan-Africa' 
            ? '#06b6d4' 
            : '#10b981';

      const iconHtml = `
        <div class="relative flex items-center justify-center cursor-pointer group" id="marker-pin-${branch.id}">
          <!-- Pulse Radar Ring -->
          <div class="absolute w-10 h-10 rounded-full ${isHQ ? 'bg-amber-400/40' : isSelected ? 'bg-amber-400/50' : 'bg-blue-400/30'} ${isSelected || isHQ ? 'animate-ping' : 'radar-ping'}"></div>
          
          <!-- Core Icon Pin with Clickable Animation -->
          <div class="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-white shadow-2xl flex items-center justify-center text-slate-950 font-black transition-all duration-300 transform group-hover:scale-125 group-hover:-translate-y-1 ${
            isHQ 
              ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-500/40' 
              : isSelected
                ? 'bg-amber-400 text-slate-950 ring-4 ring-white/60 scale-125 -translate-y-1'
                : isMainHub
                  ? 'bg-blue-500 text-white ring-2 ring-blue-400/40'
                  : branch.region === 'Pan-Africa'
                    ? 'bg-cyan-500 text-slate-950 ring-2 ring-cyan-400/40'
                    : 'bg-emerald-500 text-slate-950 ring-2 ring-emerald-400/40'
          }">
            <svg xmlns="http://www.w3.org/2000/svg" width="${isHQ ? 18 : 16}" height="${isHQ ? 18 : 16}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round">
              ${isHQ 
                ? '<path d="M3 21h18"/><path d="M5 21V7l8-4v18"/><path d="M19 21V11l-6-3"/><path d="M9 9h1"/><path d="M9 13h1"/><path d="M9 17h1"/>'
                : '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>'
              }
            </svg>
          </div>

          <!-- Label Tooltip Tag -->
          <div class="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-950/95 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-slate-700 shadow-2xl pointer-events-none group-hover:border-amber-400 group-hover:text-amber-300 transition-colors flex items-center gap-1">
            <span>${branch.city}</span>
            ${isHQ ? '<span class="text-amber-400 font-black">★ HQ</span>' : ''}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-hub-icon',
        html: iconHtml,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -22],
      });

      if (!branch || !branch.coordinates || typeof branch.coordinates.lat !== 'number' || typeof branch.coordinates.lng !== 'number' || !Number.isFinite(branch.coordinates.lat) || !Number.isFinite(branch.coordinates.lng)) {
        return;
      }

      const marker = L.marker([branch.coordinates.lat, branch.coordinates.lng], { icon: customIcon });

      const managerName = branch.managerName || 'Regional Dispatch Officer';
      const managerTitle = branch.managerTitle || (isHQ ? 'Corporate Logistics Lead' : 'Terminal Dispatcher');
      const managerPhone = branch.managerPhone || (branch.phones && branch.phones[0]) || '08062466212';
      const branchPhone = (branch.phones && branch.phones[0]) || managerPhone;
      const branchHours = branch.hours ? branch.hours.split('(')[0].trim() : 'Mon - Sat: 7am - 7pm';
      const managerEmail = branch.managerEmail || branch.email || 'info@megatrendmovers.com';
      const whatsapp = branch.whatsappPhone || '2348062466212';
      const avatarUrl = branch.managerAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80';

      const popupHtml = `
        <div class="p-3.5 sm:p-4 text-xs space-y-3 min-w-[280px] max-w-[320px] font-sans text-slate-100 bg-slate-950 rounded-2xl border border-slate-700/80 shadow-2xl">
          
          <!-- Header Bar with Location & Badge -->
          <div class="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div class="flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded-full ${isHQ ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}" style="background-color: ${markerColor};"></span>
              <span class="font-black uppercase tracking-wider text-[11px] ${isHQ ? 'text-amber-400' : 'text-slate-200'}">
                ${isHQ ? 'Abuja Corporate HQ' : isMainHub ? 'Primary Maritime Hub' : `${branch.city} Regional Depot`}
              </span>
            </div>
            <span class="text-[9px] uppercase bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono font-bold border border-slate-700">
              ${branch.region}
            </span>
          </div>

          <!-- Regional Manager Profile Card in Popup -->
          <div class="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl flex items-center gap-3">
            <img 
              src="${avatarUrl}" 
              alt="${managerName}" 
              class="w-11 h-11 rounded-full object-cover border-2 border-amber-400/80 shadow-md shrink-0" 
              referrerPolicy="no-referrer"
            />
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-1">
                <span class="text-[9px] font-bold text-amber-400 uppercase tracking-wider">Local Branch Manager</span>
              </div>
              <h5 class="text-white font-black text-xs sm:text-sm truncate">${managerName}</h5>
              <p class="text-slate-400 text-[10px] truncate leading-tight">${managerTitle}</p>
            </div>
          </div>

          <!-- Physical Address & Landmarks -->
          <div class="space-y-1 text-[11px] leading-relaxed text-slate-300">
            <div class="flex items-start gap-1.5">
              <span class="text-amber-400 shrink-0 font-bold">📍</span>
              <div>
                <span class="text-slate-200 font-medium">${branch.address}</span>
                ${branch.landmark ? `<div class="text-[10px] text-slate-400 mt-0.5">Near: ${branch.landmark}</div>` : ''}
              </div>
            </div>
          </div>

          <!-- Quick Interactive Contact Buttons -->
          <div class="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800">
            <a 
              href="tel:${managerPhone}" 
              class="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px] py-2 px-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow transition-all active:scale-95 text-center no-underline"
              target="_blank"
            >
              <span>📞</span>
              <span>Call Manager</span>
            </a>
            <a 
              href="https://wa.me/${whatsapp}?text=Hello%20${encodeURIComponent(managerName)},%20I%20am%20contacting%20Megatrend%20Movers%20regarding%20the%20${encodeURIComponent(branch.city)}%20regional%20office." 
              class="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] py-2 px-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow transition-all active:scale-95 text-center no-underline"
              target="_blank"
            >
              <span>💬</span>
              <span>WhatsApp</span>
            </a>
          </div>

          <!-- Pre-fill Quote Calculator from this Regional Office Origin -->
          <div class="pt-1">
            <button 
              type="button" 
              data-action="calculate-price" 
              data-city="${branch.city}"
              class="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-[11px] py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95 text-center cursor-pointer border border-amber-400/40"
            >
              <span>🧮</span>
              <span>Calculate Price (Origin: ${branch.city})</span>
            </button>
          </div>

          <!-- Direct Line & Operating Hours -->
          <div class="flex items-center justify-between text-[10px] text-slate-400 pt-1">
            <span class="font-mono text-slate-300">Direct: ${branchPhone}</span>
            <span>${branchHours}</span>
          </div>

        </div>
      `;

      marker.bindPopup(popupHtml, {
        maxWidth: 340,
        className: 'custom-leaflet-office-popup',
      });

      marker.on('click', () => {
        setSelectedOfficeModal(branch);
        if (onSelectOffice) {
          onSelectOffice(branch.id);
        }
      });

      markersGroup.addLayer(marker);
      markerMapRef.current.set(branch.id, marker);
    });
  }, [branches, activeOfficeId, onSelectOffice, hubCategoryFilter]);

  // Synchronize when activeOfficeId changes from parent selection
  useEffect(() => {
    if (!activeOfficeId || !mapInstanceRef.current) return;
    const targetBranch = branches.find(b => b.id === activeOfficeId);
    if (
      targetBranch &&
      targetBranch.coordinates &&
      typeof targetBranch.coordinates.lat === 'number' &&
      typeof targetBranch.coordinates.lng === 'number' &&
      Number.isFinite(targetBranch.coordinates.lat) &&
      Number.isFinite(targetBranch.coordinates.lng)
    ) {
      try {
        mapInstanceRef.current.flyTo([targetBranch.coordinates.lat, targetBranch.coordinates.lng], 9, {
          duration: 1.2,
        });
      } catch {
        // Ignore flyTo errors
      }

      const marker = markerMapRef.current.get(targetBranch.id);
      if (marker) {
        setTimeout(() => {
          try {
            marker.openPopup();
          } catch {
            // Ignore popup error
          }
        }, 600);
      }
      setSelectedOfficeModal(targetBranch);
    }
  }, [activeOfficeId, branches]);

  // Render Routes and Flow Polylines
  useEffect(() => {
    if (!mapInstanceRef.current || !polylinesLayerGroupRef.current) return;

    const polylinesGroup = polylinesLayerGroupRef.current;
    polylinesGroup.clearLayers();

    const corridorsToRender = selectedCorridorId === 'all'
      ? LOGISTICS_CORRIDORS
      : LOGISTICS_CORRIDORS.filter((c) => c.id === selectedCorridorId);

    corridorsToRender.forEach((corridor) => {
      const validWaypoints: [number, number][] = (corridor.waypoints || []).filter(
        (wp): wp is [number, number] => Array.isArray(wp) && wp.length >= 2 && typeof wp[0] === 'number' && typeof wp[1] === 'number' && Number.isFinite(wp[0]) && Number.isFinite(wp[1])
      );
      if (validWaypoints.length < 2) return;

      const isHighlighted = selectedCorridorId === corridor.id || selectedCorridorId === 'all';
      const isCrossBorder = corridor.id === 'lagos-accra';

      // 1. Background Route Path (Glow & Base stroke)
      const baseLine = L.polyline(validWaypoints, {
        color: corridor.color || '#f59e0b',
        weight: isHighlighted && selectedCorridorId === corridor.id ? 6 : 4,
        opacity: isHighlighted ? 0.35 : 0.15,
        lineCap: 'round',
        lineJoin: 'round',
      });
      polylinesGroup.addLayer(baseLine);

      // 2. Animated Flowing Dashed Foreground Line
      const animatedLine = L.polyline(validWaypoints, {
        color: corridor.color || '#f59e0b',
        weight: isHighlighted && selectedCorridorId === corridor.id ? 4 : 3,
        opacity: 0.95,
        className: isCrossBorder ? 'route-flow-animated-fast' : 'route-flow-animated',
        lineCap: 'round',
        lineJoin: 'round',
      });

      // Click behavior on line
      animatedLine.on('click', () => {
        setSelectedCorridorId(corridor.id);
      });

      animatedLine.bindTooltip(`
        <div class="text-xs p-1 font-sans">
          <strong class="text-amber-400 font-bold block">${corridor.name}</strong>
          <span class="text-slate-300 text-[10px]">${corridor.distanceKm} km • ${corridor.durationHours}</span>
        </div>
      `, { sticky: true, opacity: 0.95, className: 'leaflet-popup-content-wrapper' });

      polylinesGroup.addLayer(animatedLine);

      // 3. Render Waypoint Dots along the route
      validWaypoints.forEach((wp, idx) => {
        if (idx > 0 && idx < validWaypoints.length - 1) {
          const wpDot = L.circleMarker(wp, {
            radius: 3.5,
            color: '#020617',
            weight: 1.5,
            fillColor: corridor.color || '#f59e0b',
            fillOpacity: 0.8,
          });
          polylinesGroup.addLayer(wpDot);
        }
      });
    });

    // If a specific corridor is chosen, fit map bounds to it
    if (selectedCorridorId !== 'all' && activeCorridor && mapInstanceRef.current) {
      const validWps: [number, number][] = (activeCorridor.waypoints || []).filter(
        (wp): wp is [number, number] => Array.isArray(wp) && wp.length >= 2 && typeof wp[0] === 'number' && typeof wp[1] === 'number' && Number.isFinite(wp[0]) && Number.isFinite(wp[1])
      );
      if (validWps.length > 0) {
        try {
          const bounds = L.latLngBounds(validWps);
          if (bounds.isValid()) {
            mapInstanceRef.current.fitBounds(bounds, { padding: [60, 60], maxZoom: 8 });
          }
        } catch (err) {
          console.warn('fitBounds error ignored', err);
        }
      }
    }
  }, [selectedCorridorId, activeCorridor]);

  // Moving Convoy Vehicle Simulator along Active Routes
  useEffect(() => {
    if (!mapInstanceRef.current || !movingVehiclesGroupRef.current) return;

    const vehiclesGroup = movingVehiclesGroupRef.current;
    vehiclesGroup.clearLayers();

    if (!isPlayingSimulation) return;

    const activeCorridors = selectedCorridorId === 'all' 
      ? LOGISTICS_CORRIDORS 
      : LOGISTICS_CORRIDORS.filter(c => c.id === selectedCorridorId);

    // Track progressive position (0 to 1) for each corridor
    const progressMap = new Map<string, number>();
    const vehicleMarkers = new Map<string, L.Marker>();

    activeCorridors.forEach((corr, idx) => {
      const validWps: [number, number][] = (corr.waypoints || []).filter(
        (wp): wp is [number, number] => Array.isArray(wp) && wp.length >= 2 && typeof wp[0] === 'number' && typeof wp[1] === 'number' && Number.isFinite(wp[0]) && Number.isFinite(wp[1])
      );
      if (validWps.length === 0) return;
      const initialPt = validWps[0];
      if (!initialPt || !Number.isFinite(initialPt[0]) || !Number.isFinite(initialPt[1])) return;

      progressMap.set(corr.id, (idx * 0.25) % 1);

      const vehicleIcon = L.divIcon({
        className: 'custom-moving-truck',
        html: `
          <div class="relative flex items-center justify-center pointer-events-none">
            <!-- Pulsing Halo -->
            <div class="absolute w-7 h-7 rounded-full bg-amber-400/40 animate-ping"></div>
            <!-- Small Truck Badge -->
            <div class="relative w-6 h-6 rounded-lg bg-amber-500 text-slate-950 border border-white shadow-lg flex items-center justify-center font-black">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>
              </svg>
            </div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker(initialPt, { icon: vehicleIcon, zIndexOffset: 800 });
      vehiclesGroup.addLayer(marker);
      vehicleMarkers.set(corr.id, marker);
    });

    let lastTime = performance.now();

    const animateVehicles = (now: number) => {
      if (!Number.isFinite(now)) {
        animationFrameRef.current = requestAnimationFrame(animateVehicles);
        return;
      }
      const rawDelta = (now - lastTime) / 1000;
      const delta = Number.isFinite(rawDelta) && rawDelta > 0 && rawDelta < 1 ? rawDelta : 0.016;
      lastTime = now;

      activeCorridors.forEach((corr) => {
        const wps: [number, number][] = (corr.waypoints || []).filter(
          (wp): wp is [number, number] => Array.isArray(wp) && wp.length >= 2 && typeof wp[0] === 'number' && typeof wp[1] === 'number' && Number.isFinite(wp[0]) && Number.isFinite(wp[1])
        );
        if (wps.length === 0) return;

        let p = progressMap.get(corr.id);
        if (typeof p !== 'number' || !Number.isFinite(p)) p = 0;
        // Move ~3% to 6% per second based on distance
        const distance = typeof corr.distanceKm === 'number' && Number.isFinite(corr.distanceKm) && corr.distanceKm > 0 ? corr.distanceKm : 600;
        const speedFactor = (1000 / distance) * 0.025;
        p += delta * speedFactor;
        if (p > 1 || !Number.isFinite(p)) p = 0;
        progressMap.set(corr.id, p);

        // Interpolate position along polyline waypoints
        if (wps.length === 1) {
          const pt = wps[0];
          if (pt && Number.isFinite(pt[0]) && Number.isFinite(pt[1])) {
            const marker = vehicleMarkers.get(corr.id);
            if (marker) {
              try {
                marker.setLatLng(pt);
              } catch {
                // Ignore setLatLng error
              }
            }
          }
          return;
        }

        const totalSegments = wps.length - 1;
        const targetSeg = p * totalSegments;
        const segIndex = Math.max(0, Math.min(Math.floor(targetSeg), totalSegments - 1));
        const segFrac = Math.max(0, Math.min(1, targetSeg - segIndex));

        const p1 = wps[segIndex];
        const p2 = wps[segIndex + 1] || p1;

        if (!p1 || !p2 || !Number.isFinite(p1[0]) || !Number.isFinite(p1[1]) || !Number.isFinite(p2[0]) || !Number.isFinite(p2[1])) {
          return;
        }

        const currentLat = p1[0] + (p2[0] - p1[0]) * segFrac;
        const currentLng = p1[1] + (p2[1] - p1[1]) * segFrac;

        if (Number.isFinite(currentLat) && Number.isFinite(currentLng)) {
          const marker = vehicleMarkers.get(corr.id);
          if (marker) {
            try {
              marker.setLatLng([currentLat, currentLng]);
            } catch {
              // Ignore setLatLng error
            }
          }
        }
      });

      animationFrameRef.current = requestAnimationFrame(animateVehicles);
    };

    animationFrameRef.current = requestAnimationFrame(animateVehicles);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [selectedCorridorId, isPlayingSimulation]);

  const handleResetView = () => {
    setSelectedCorridorId('all');
    setSelectedOfficeModal(null);
    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.setView([8.2, 5.0], 6, { animate: true });
      } catch {
        // Ignore setView error
      }
    }
  };

  const handleFocusOffice = (branch: OfficeLocation) => {
    if (onSelectOffice) {
      onSelectOffice(branch.id);
    }
    setSelectedOfficeModal(branch);
    if (
      mapInstanceRef.current &&
      branch?.coordinates &&
      typeof branch.coordinates.lat === 'number' &&
      typeof branch.coordinates.lng === 'number' &&
      Number.isFinite(branch.coordinates.lat) &&
      Number.isFinite(branch.coordinates.lng)
    ) {
      try {
        mapInstanceRef.current.flyTo([branch.coordinates.lat, branch.coordinates.lng], 9, {
          duration: 1.2,
        });
      } catch {
        // Ignore flyTo error
      }
      const marker = markerMapRef.current.get(branch.id);
      if (marker) {
        setTimeout(() => {
          try {
            marker.openPopup();
          } catch {
            // Ignore popup error
          }
        }, 600);
      }
    }
  };

  return (
    <div className={`relative bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl transition-all ${
      isFullscreen ? 'fixed inset-4 z-50 rounded-2xl' : 'w-full'
    }`}>
      
      {/* Map Header Toolbar */}
      <div className="p-4 sm:p-5 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-extrabold text-white text-sm sm:text-base">
                Interactive Logistics Route Network & Regional Offices
              </h3>
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Click Any Pin for Local Manager
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-0.5">
              Click pins to inspect terminal dispatchers, hotlines, coverage zones, and live highway corridors
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsPlayingSimulation(!isPlayingSimulation)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 border ${
              isPlayingSimulation
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
            title="Toggle active convoy simulation animation"
          >
            <Zap className={`w-3.5 h-3.5 ${isPlayingSimulation ? 'text-amber-400 fill-amber-400' : ''}`} />
            <span>{isPlayingSimulation ? 'Simulating' : 'Paused'}</span>
          </button>

          <button
            onClick={handleResetView}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white rounded-xl text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-all"
            title="Reset Map Zoom & Network Overview"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset View</span>
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-all"
            title={isFullscreen ? 'Exit Fullscreen' : 'Expand Map View'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Regional Office Quick Jump Selector & Pin Navigation Bar */}
      <div className="px-4 py-2.5 bg-slate-900/60 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto scrollbar-thin">
        <span className="text-[11px] font-extrabold text-amber-400 whitespace-nowrap uppercase tracking-wider pl-1 flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5" />
          Click Office Pin:
        </span>
        
        {branches.map((b) => {
          const isSelected = (activeOfficeId === b.id) || (selectedOfficeModal?.id === b.id);
          const isHQ = b.type === 'headquarters';
          return (
            <button
              key={b.id}
              onClick={() => handleFocusOffice(b)}
              className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all active:scale-95 border flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg scale-105 font-black'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800 hover:border-slate-700'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isHQ ? 'bg-amber-400' : 'bg-emerald-400'}`} />
              <span>{b.city}</span>
              {isHQ && <span className="text-[9px] bg-slate-950 text-amber-400 px-1 py-0.2 rounded font-black">HQ</span>}
            </button>
          );
        })}
      </div>

      {/* Corridor Quick Filter Buttons */}
      <div className="px-4 py-2 bg-slate-950 border-b border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-thin">
        <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap uppercase tracking-wider pl-1">
          Route Highway:
        </span>
        <button
          onClick={() => handleResetView()}
          className={`px-2.5 py-0.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all active:scale-95 border ${
            selectedCorridorId === 'all'
              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
              : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
          }`}
        >
          🌐 All 6 Corridors
        </button>

        {LOGISTICS_CORRIDORS.map((corr) => (
          <button
            key={corr.id}
            onClick={() => setSelectedCorridorId(corr.id)}
            className={`px-2.5 py-0.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all active:scale-95 border flex items-center gap-1.5 ${
              selectedCorridorId === corr.id
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-black'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
            }`}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: corr.color }} />
            <span>{corr.name.split('⇄')[0]} ⇄ {corr.name.split('⇄')[1]?.trim().split(' ')[0]}</span>
          </button>
        ))}
      </div>

      {/* Map View Canvas Container */}
      <div className="relative w-full h-[460px] sm:h-[520px] lg:h-[560px]">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Floating Selected Regional Office Pop-up Card (Integrated Overlay) */}
        {selectedOfficeModal && (
          <div className="absolute top-4 right-4 max-w-sm w-[calc(100%-2rem)] sm:w-80 bg-slate-950/95 backdrop-blur-md border border-amber-500/40 p-4 rounded-2xl shadow-2xl z-[500] space-y-3 pointer-events-auto animate-in fade-in slide-in-from-top-3 duration-200">
            <div className="flex items-start justify-between border-b border-slate-800 pb-2.5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                    {selectedOfficeModal.type === 'headquarters' ? 'Corporate HQ' : selectedOfficeModal.isMainHub ? 'Main Hub' : 'Regional Branch'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{selectedOfficeModal.region}</span>
                </div>
                <h4 className="text-white font-black text-base mt-1">
                  {selectedOfficeModal.city} Regional Office
                </h4>
              </div>
              <button
                onClick={() => setSelectedOfficeModal(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-900 hover:bg-slate-800 active:scale-95 border border-slate-800 transition-all"
                title="Close overlay"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Local Manager Highlight */}
            <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center gap-3">
              <img 
                src={selectedOfficeModal.managerAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'} 
                alt={selectedOfficeModal.managerName || 'Regional Manager'} 
                className="w-12 h-12 rounded-full object-cover border-2 border-amber-400 shrink-0" 
                referrerPolicy="no-referrer"
              />
              <div className="min-w-0 flex-1 text-xs">
                <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider block">Assigned Station Lead</span>
                <p className="text-white font-extrabold text-sm truncate">{selectedOfficeModal.managerName || 'Regional Dispatch Lead'}</p>
                <p className="text-slate-400 text-[11px] truncate">{selectedOfficeModal.managerTitle || 'Terminal Operations Head'}</p>
              </div>
            </div>

            {/* Address & Contact Info */}
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-white font-medium block">{selectedOfficeModal.address}</span>
                  {selectedOfficeModal.landmark && (
                    <span className="text-[10px] text-amber-400/90 font-medium">Near: {selectedOfficeModal.landmark}</span>
                  )}
                </div>
              </div>

              {selectedOfficeModal.fleetCapacity && (
                <div className="flex items-center gap-2 text-[11px] bg-slate-900/60 p-2 rounded-lg border border-slate-800 text-slate-300">
                  <Truck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Stationed Fleet: <strong className="text-white">{selectedOfficeModal.fleetCapacity}</strong></span>
                </div>
              )}
            </div>

            {/* Direct Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <a
                href={`tel:${selectedOfficeModal.managerPhone || selectedOfficeModal.phones[0]}`}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow transition-all active:scale-95 text-center"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Branch</span>
              </a>
              <a
                href={`https://wa.me/${selectedOfficeModal.whatsappPhone || '2348062466212'}?text=Hello%20${encodeURIComponent(selectedOfficeModal.managerName || 'Manager')},%20I%20am%20inquiring%20about%20a%20relocation/haulage%20dispatch%20from%20${encodeURIComponent(selectedOfficeModal.city)}.`}
                target="_blank"
                rel="noreferrer"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow transition-all active:scale-95 text-center"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
            </div>

            {onOpenQuoteModal && (
              <button
                onClick={() => onOpenQuoteModal('corporate', selectedOfficeModal.city)}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs py-2.5 px-3 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 border border-amber-400/40"
              >
                <Calculator className="w-4 h-4 text-slate-950 stroke-[2.5]" />
                <span>Calculate Price (Origin: {selectedOfficeModal.city})</span>
              </button>
            )}
          </div>
        )}

        {/* Floating Route Legend & Specs Overlay (Bottom-Left) */}
        <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-md bg-slate-950/90 backdrop-blur-md border border-slate-800 p-4 rounded-2xl shadow-2xl z-[500] space-y-3 pointer-events-auto">
          {activeCorridor ? (
            <div className="space-y-2.5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: activeCorridor.color }} />
                  <h4 className="font-extrabold text-white text-xs sm:text-sm">{activeCorridor.name}</h4>
                </div>
                <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  {activeCorridor.category === 'cross-border' ? 'Cross-Border ECOWAS' : 'Interstate Express'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 block font-semibold">Total Distance</span>
                  <span className="text-white font-mono font-black text-sm">{activeCorridor.distanceKm} KM</span>
                </div>
                <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 block font-semibold">Transit Time</span>
                  <span className="text-amber-400 font-bold text-xs">{activeCorridor.durationHours}</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-300 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                  <span>{activeCorridor.securityRating}</span>
                </div>
                {activeCorridor.customsNote && (
                  <p className="text-cyan-400 text-[10px] bg-cyan-500/10 p-1.5 rounded border border-cyan-500/20">
                    🌍 {activeCorridor.customsNote}
                  </p>
                )}
                <p className="text-slate-400 text-[10px] pt-1">
                  <strong>Key Corridors:</strong> {activeCorridor.waypointNames.join(' ➔ ')}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Pin Telematics & Contact Network
                </span>
                <span className="text-[10px] text-emerald-400 font-mono font-bold">● {branches.length} Active Depots</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span>Abuja Corporate HQ</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span>Lagos Maritime Hub</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>State Regional Depots</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                  <span>Pan-African Corridors</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 italic pt-1">
                Click any map pin or branch button above to open direct manager contacts and terminal details.
              </p>
            </div>
          )}
        </div>

        {/* Live Network Telematics Badge top-left */}
        <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-xl z-[500] hidden sm:flex items-center gap-2 text-[11px]">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-300 font-medium">GPS Telematics: <strong className="text-white">Live Regional Dispatch Streaming</strong></span>
        </div>
      </div>

    </div>
  );
};

