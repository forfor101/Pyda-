import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import { ActiveFleetTruck } from '../types';
import { PYDA_FLEET_HUBS, INITIAL_REGISTERED_FLEET, FleetHubLocation } from '../data/activeFleetData';
import {
  Truck,
  MapPin,
  Compass,
  Navigation,
  Layers,
  Maximize2,
  Minimize2,
  Search,
  Filter,
  RefreshCw,
  Zap,
  ShieldCheck,
  Fuel,
  Gauge,
  Thermometer,
  Radio,
  Phone,
  MessageSquare,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Eye,
  X,
  ChevronRight,
  ChevronLeft,
  Activity,
  Layers2,
  Sliders,
  Play,
  Pause,
  ArrowUpRight
} from 'lucide-react';

interface ActiveFleetOverviewMapProps {
  onSelectShipmentToTrack?: (trackingId: string) => void;
  onOpenQuoteModal?: () => void;
}

type MapLayerType = 'dark' | 'street' | 'satellite' | 'terrain';
type StatusFilterType = 'all' | 'in_transit' | 'loading_dock' | 'customs_hold' | 'delivered';
type CategoryFilterType = 'all' | 'heavy_trailer' | 'medium_box' | 'urban_van' | 'specialized_rig';

export const ActiveFleetOverviewMap: React.FC<ActiveFleetOverviewMapProps> = ({
  onSelectShipmentToTrack,
  onOpenQuoteModal
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const truckMarkersGroupRef = useRef<L.LayerGroup | null>(null);
  const hubMarkersGroupRef = useRef<L.LayerGroup | null>(null);
  const routePolylinesGroupRef = useRef<L.LayerGroup | null>(null);
  const geofencesGroupRef = useRef<L.LayerGroup | null>(null);

  // State
  const [fleet, setFleet] = useState<ActiveFleetTruck[]>(INITIAL_REGISTERED_FLEET);
  const [selectedTruck, setSelectedTruck] = useState<ActiveFleetTruck | null>(null);
  const [activeLayer, setActiveLayer] = useState<MapLayerType>('dark');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>('all');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilterType>('all');
  const [showHubs, setShowHubs] = useState<boolean>(true);
  const [showGeofences, setShowGeofences] = useState<boolean>(true);
  const [showRoutes, setShowRoutes] = useState<boolean>(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Just now');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const containerWrapperRef = useRef<HTMLDivElement | null>(null);

  // Tile Servers
  const tileServers: Record<MapLayerType, { url: string; attribution: string }> = {
    dark: {
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      attribution: '&copy; CARTO &copy; OpenStreetMap',
    },
    street: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; OpenStreetMap contributors',
    },
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: '&copy; Esri, Maxar, Earthstar Geographics',
    },
    terrain: {
      url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      attribution: '&copy; OpenTopoMap contributors',
    },
  };

  // Filtered Fleet
  const filteredFleet = useMemo(() => {
    return fleet.filter((truck) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        truck.unitCode.toLowerCase().includes(q) ||
        truck.plateNumber.toLowerCase().includes(q) ||
        truck.makeModel.toLowerCase().includes(q) ||
        truck.driverName.toLowerCase().includes(q) ||
        truck.currentLocationName.toLowerCase().includes(q) ||
        truck.stateOrRegion.toLowerCase().includes(q) ||
        (truck.activeConsignment &&
          (truck.activeConsignment.clientName.toLowerCase().includes(q) ||
            truck.activeConsignment.origin.toLowerCase().includes(q) ||
            truck.activeConsignment.destination.toLowerCase().includes(q) ||
            (truck.activeConsignment.trackingId && truck.activeConsignment.trackingId.toLowerCase().includes(q))));

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'in_transit' && (truck.status === 'in_transit' || truck.status === 'out_for_delivery')) ||
        truck.status === statusFilter;

      const matchesCategory =
        categoryFilter === 'all' || truck.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [fleet, searchQuery, statusFilter, categoryFilter]);

  // Telematics Summary Stats
  const stats = useMemo(() => {
    const total = fleet.length;
    const inMotion = fleet.filter((t) => t.speedKmh > 0).length;
    const atHubs = fleet.filter((t) => t.status === 'loading_dock' || t.status === 'standby').length;
    const avgSpeed = Math.round(
      fleet.reduce((acc, curr) => acc + curr.speedKmh, 0) / (inMotion || 1)
    );
    const avgFuel = Math.round(
      fleet.reduce((acc, curr) => acc + curr.telematics.fuelPercent, 0) / total
    );
    return { total, inMotion, atHubs, avgSpeed, avgFuel };
  }, [fleet]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Center on central Nigeria (Lokoja / Abuja corridor)
    const map = L.map(mapContainerRef.current, {
      center: [8.5, 7.1],
      zoom: 6,
      zoomControl: false,
      attributionControl: false,
    });

    L.control.zoom({ position: 'topright' }).addTo(map);

    // Initial Tile Layer
    const tileLayer = L.tileLayer(tileServers[activeLayer].url, {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);
    tileLayerRef.current = tileLayer;

    // Layer Groups
    const routePolylinesGroup = L.layerGroup().addTo(map);
    const geofencesGroup = L.layerGroup().addTo(map);
    const hubMarkersGroup = L.layerGroup().addTo(map);
    const truckMarkersGroup = L.layerGroup().addTo(map);

    routePolylinesGroupRef.current = routePolylinesGroup;
    geofencesGroupRef.current = geofencesGroup;
    hubMarkersGroupRef.current = hubMarkersGroup;
    truckMarkersGroupRef.current = truckMarkersGroup;

    mapInstanceRef.current = map;

    // ResizeObserver to handle container size changes
    const resizeObserver = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Layer when layer changes
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    mapInstanceRef.current.removeLayer(tileLayerRef.current);
    const newLayer = L.tileLayer(tileServers[activeLayer].url, {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(mapInstanceRef.current);
    tileLayerRef.current = newLayer;
  }, [activeLayer]);

  // Render Hubs and Geofences
  useEffect(() => {
    if (!mapInstanceRef.current || !hubMarkersGroupRef.current || !geofencesGroupRef.current) return;

    const hubGroup = hubMarkersGroupRef.current;
    const geoGroup = geofencesGroupRef.current;
    hubGroup.clearLayers();
    geoGroup.clearLayers();

    if (showHubs) {
      PYDA_FLEET_HUBS.forEach((hub) => {
        const isHq = hub.type === 'headquarters';
        const hubIcon = L.divIcon({
          className: 'custom-hub-icon',
          html: `
            <div class="relative flex items-center justify-center cursor-pointer group">
              <div class="w-8 h-8 rounded-xl ${
                isHq ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-500/30' : 'bg-slate-900 text-amber-400 border border-amber-500/50'
              } shadow-xl flex items-center justify-center font-black transition-transform group-hover:scale-110">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/>
                  <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/>
                  <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/>
                  <path d="M10 6h4"/>
                  <path d="M10 10h4"/>
                  <path d="M10 14h4"/>
                  <path d="M10 18h4"/>
                </svg>
              </div>
              <div class="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-950/95 text-amber-300 text-[9px] font-extrabold px-1.5 py-0.5 rounded border border-amber-500/30 shadow pointer-events-none">
                ${hub.city}
              </div>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker([hub.coordinates.lat, hub.coordinates.lng], { icon: hubIcon });
        marker.bindPopup(`
          <div class="p-3 text-xs space-y-2 min-w-[200px]">
            <div class="flex items-center gap-1.5 text-amber-400 font-extrabold uppercase">
              <span class="w-2 h-2 rounded-full ${isHq ? 'bg-amber-400 animate-ping' : 'bg-blue-400'}"></span>
              <span>${isHq ? 'Abuja Corporate HQ' : `${hub.city} Regional Hub`}</span>
            </div>
            <p class="font-bold text-white text-sm leading-snug">${hub.name}</p>
            <p class="text-slate-300 text-[11px]">${hub.address}</p>
            <div class="bg-slate-950 p-2 rounded-lg border border-slate-800 space-y-1 text-[10px]">
              <div class="flex justify-between text-slate-400">
                <span>Staging Capacity:</span>
                <strong class="text-amber-400 font-bold">${hub.capacityTrucks} Heavy Freight Units</strong>
              </div>
              <div class="flex justify-between text-slate-400">
                <span>Dispatch Base:</span>
                <strong class="text-slate-200">${hub.phone}</strong>
              </div>
            </div>
          </div>
        `);
        hubGroup.addLayer(marker);

        // Geofence perimeter ring
        if (showGeofences) {
          const circle = L.circle([hub.coordinates.lat, hub.coordinates.lng], {
            radius: isHq ? 8000 : 5000,
            color: isHq ? '#f59e0b' : '#0284c7',
            fillColor: isHq ? '#f59e0b' : '#0284c7',
            fillOpacity: 0.06,
            weight: 1.5,
            dashArray: '4, 6',
          });
          geoGroup.addLayer(circle);
        }
      });
    }
  }, [showHubs, showGeofences]);

  // Render Routes and Truck Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !truckMarkersGroupRef.current || !routePolylinesGroupRef.current) return;

    const truckGroup = truckMarkersGroupRef.current;
    const routeGroup = routePolylinesGroupRef.current;
    truckGroup.clearLayers();
    routeGroup.clearLayers();

    // 1. Draw highway polylines for active routes
    if (showRoutes) {
      filteredFleet.forEach((truck) => {
        if (truck.routePolyline && truck.routePolyline.length > 1) {
          const isTruckSelected = selectedTruck?.id === truck.id;
          const polyline = L.polyline(truck.routePolyline, {
            color: isTruckSelected ? '#f59e0b' : '#38bdf8',
            weight: isTruckSelected ? 4 : 2.5,
            opacity: isTruckSelected ? 0.9 : 0.45,
            dashArray: isTruckSelected ? '8, 6' : '5, 8',
            className: isTruckSelected ? 'route-flow-animated-fast' : 'route-flow-animated',
          });
          routeGroup.addLayer(polyline);
        }
      });
    }

    // 2. Draw Truck Markers with dynamic telemetry HTML icons
    filteredFleet.forEach((truck) => {
      const isSelected = selectedTruck?.id === truck.id;
      const isMoving = truck.speedKmh > 0;

      // Status Colors
      let ringColor = 'border-amber-400 bg-amber-500/20 text-amber-300';
      let statusBadge = 'bg-amber-500 text-slate-950';

      if (truck.status === 'out_for_delivery') {
        ringColor = 'border-cyan-400 bg-cyan-500/20 text-cyan-300';
        statusBadge = 'bg-cyan-500 text-slate-950';
      } else if (truck.status === 'loading_dock') {
        ringColor = 'border-blue-400 bg-blue-500/20 text-blue-300';
        statusBadge = 'bg-blue-500 text-white';
      } else if (truck.status === 'customs_hold') {
        ringColor = 'border-rose-400 bg-rose-500/20 text-rose-300';
        statusBadge = 'bg-rose-500 text-white';
      } else if (truck.status === 'delivered') {
        ringColor = 'border-emerald-400 bg-emerald-500/20 text-emerald-300';
        statusBadge = 'bg-emerald-500 text-slate-950';
      }

      const truckIcon = L.divIcon({
        className: 'custom-truck-fleet-icon',
        html: `
          <div class="relative flex flex-col items-center justify-center cursor-pointer group" style="transform: translate(-50%, -50%);">
            ${
              isMoving
                ? `<div class="absolute w-12 h-12 rounded-full radar-ping ${
                    isSelected ? 'bg-amber-400/40' : 'bg-emerald-400/30'
                  }"></div>`
                : ''
            }
            <div class="relative z-10 w-9 h-9 rounded-2xl bg-slate-950 border-2 ${
              isSelected ? 'border-amber-400 scale-125 shadow-2xl ring-4 ring-amber-500/40' : 'border-slate-700 group-hover:border-amber-400/80 shadow-lg'
            } flex items-center justify-center transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${
                isSelected ? '#f59e0b' : '#ffffff'
              }" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
                <path d="M15 18H9"/>
                <path d="M19 18h2a1 1 0 0 0 1-1v-5l-3-4h-4v10"/>
                <circle cx="7" cy="18" r="2"/>
                <circle cx="17" cy="18" r="2"/>
              </svg>

              <!-- Heading Direction Arrow -->
              ${
                isMoving
                  ? `<div class="absolute -top-2 -right-1 w-4 h-4 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow" style="transform: rotate(${truck.headingDegrees}deg);">
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L4 20l8-4 8 4L12 2z"/></svg>
                    </div>`
                  : ''
              }
            </div>

            <!-- Unit Code & Live Speed Tag -->
            <div class="mt-1 flex items-center gap-1 bg-slate-950/95 px-2 py-0.5 rounded-md border border-slate-800 shadow-md whitespace-nowrap">
              <span class="text-[10px] font-mono font-black ${isSelected ? 'text-amber-400' : 'text-slate-200'}">
                ${truck.unitCode}
              </span>
              <span class="text-[9px] font-bold ${isMoving ? 'text-emerald-400' : 'text-slate-500'}">
                ${isMoving ? `${truck.speedKmh} km/h` : 'Docked'}
              </span>
            </div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      const marker = L.marker([truck.coordinates.lat, truck.coordinates.lng], {
        icon: truckIcon,
        zIndexOffset: isSelected ? 1000 : 100,
      });

      marker.on('click', () => {
        setSelectedTruck(truck);
      });

      marker.bindPopup(`
        <div class="p-3 text-xs space-y-2 min-w-[240px]">
          <div class="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
            <div>
              <span class="font-mono text-xs font-black text-amber-400 block">${truck.unitCode}</span>
              <span class="text-[10px] text-slate-400 font-bold">${truck.plateNumber}</span>
            </div>
            <span class="text-[9px] font-bold px-2 py-0.5 rounded-full ${statusBadge} uppercase">
              ${truck.status.replace('_', ' ')}
            </span>
          </div>

          <div class="space-y-1">
            <p class="font-extrabold text-white text-sm">${truck.makeModel}</p>
            <p class="text-slate-300 text-xs flex items-center gap-1">
              <span class="text-amber-400 font-bold">📍</span> ${truck.currentLocationName}
            </p>
          </div>

          <!-- Telematics mini bar -->
          <div class="grid grid-cols-3 gap-1 bg-slate-950 p-2 rounded-xl border border-slate-800 text-center font-mono">
            <div>
              <span class="text-[9px] text-slate-500 block">SPEED</span>
              <strong class="${truck.speedKmh > 0 ? 'text-emerald-400' : 'text-slate-400'} font-black text-[11px]">
                ${truck.speedKmh} km/h
              </strong>
            </div>
            <div>
              <span class="text-[9px] text-slate-500 block">FUEL</span>
              <strong class="text-amber-400 font-black text-[11px]">${truck.telematics.fuelPercent}%</strong>
            </div>
            <div>
              <span class="text-[9px] text-slate-500 block">TEMP</span>
              <strong class="text-slate-200 font-black text-[11px]">
                ${truck.telematics.cargoTempCelsius !== undefined ? `${truck.telematics.cargoTempCelsius}°C` : 'N/A'}
              </strong>
            </div>
          </div>

          ${
            truck.activeConsignment
              ? `
              <div class="bg-slate-900/90 p-2 rounded-xl border border-slate-800/80 space-y-1">
                <span class="text-[9px] text-slate-400 uppercase font-black block">Active Consignment</span>
                <p class="text-white font-bold truncate">${truck.activeConsignment.clientName}</p>
                <p class="text-[10px] text-slate-300">${truck.activeConsignment.origin} ➔ ${truck.activeConsignment.destination}</p>
              </div>
            `
              : ''
          }

          <div class="flex items-center gap-1.5 pt-1">
            <button
              id="popup-inspect-btn-${truck.id}"
              class="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs py-1.5 rounded-lg transition-colors shadow flex items-center justify-center gap-1"
            >
              <span>View Live Telematics</span>
            </button>
          </div>
        </div>
      `);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`popup-inspect-btn-${truck.id}`);
        if (btn) {
          btn.onclick = () => {
            setSelectedTruck(truck);
          };
        }
      });

      truckGroup.addLayer(marker);
    });
  }, [filteredFleet, selectedTruck, showRoutes]);

  // Real-time GPS Telematics Simulation Engine
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setFleet((prevFleet) =>
        prevFleet.map((truck) => {
          if (truck.status !== 'in_transit' && truck.status !== 'out_for_delivery') {
            return truck;
          }

          // Generate slight realistic GPS wander along heading
          const headingRad = (truck.headingDegrees * Math.PI) / 180;
          const speedFactor = (truck.speedKmh / 3600) * 0.009; // simulated coordinate delta
          const latDelta = Math.cos(headingRad) * speedFactor;
          const lngDelta = Math.sin(headingRad) * speedFactor;

          // Speed fluctuation +/- 3 km/h
          const speedDelta = (Math.random() - 0.48) * 3;
          const newSpeed = Math.min(85, Math.max(30, Math.round(truck.speedKmh + speedDelta)));

          // Fuel slow consumption
          const fuelDrop = Math.random() < 0.15 ? 0.1 : 0;
          const newFuel = Math.max(15, Number((truck.telematics.fuelPercent - fuelDrop).toFixed(1)));

          return {
            ...truck,
            coordinates: {
              lat: Number((truck.coordinates.lat + latDelta).toFixed(6)),
              lng: Number((truck.coordinates.lng + lngDelta).toFixed(6)),
            },
            speedKmh: newSpeed,
            telematics: {
              ...truck.telematics,
              fuelPercent: newFuel,
              odometerKm: Math.round(truck.telematics.odometerKm + 0.05),
              lastPingTimestamp: 'Just now (Simulated live link)',
            },
          };
        })
      );
      setLastSyncTime(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 3500);

    return () => clearInterval(interval);
  }, [isSimulating]);

  // Fly to selected truck
  const handleSelectAndFlyToTruck = (truck: ActiveFleetTruck) => {
    setSelectedTruck(truck);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([truck.coordinates.lat, truck.coordinates.lng], 12, {
        duration: 1.5,
      });
    }
  };

  // Fit all fleet bounds
  const handleFitAllFleet = () => {
    if (!mapInstanceRef.current || filteredFleet.length === 0) return;
    const bounds = L.latLngBounds(filteredFleet.map((t) => [t.coordinates.lat, t.coordinates.lng]));
    // Include Abuja HQ
    bounds.extend([9.0765, 7.3986]);
    bounds.extend([6.4674, 3.2831]);
    mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
  };

  // Toggle Fullscreen on map container
  const handleToggleFullscreen = () => {
    if (!containerWrapperRef.current) return;
    if (!document.fullscreenElement) {
      containerWrapperRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={containerWrapperRef}
      className={`space-y-4 ${isFullscreen ? 'p-6 bg-slate-950 overflow-y-auto h-screen' : ''}`}
      id="active-fleet-overview-component"
    >
      {/* Header Bar with Live Telematics Ticker */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black shrink-0 shadow">
              <Navigation className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold text-[10px] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  <span>100% SATELLITE TELEMATICS ONLINE</span>
                </span>
                <span className="text-slate-500 text-xs hidden sm:inline">•</span>
                <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                  Sync: {lastSyncTime}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
                Active Fleet Real-Time Overview
              </h2>
              <p className="text-xs text-slate-400">
                Live telematics, GPS satellite radar, speeds, cargo temp & highway corridors for registered Pyda Movers haulers.
              </p>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
            {/* Simulation Toggle */}
            <button
              type="button"
              onClick={() => setIsSimulating(!isSimulating)}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow ${
                isSimulating
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
              }`}
              id="fleet-simulation-toggle-btn"
              title={isSimulating ? 'Pause Live GPS Telematics Stream' : 'Resume Live GPS Telematics Stream'}
            >
              {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isSimulating ? 'Live Telematics Active' : 'Simulation Paused'}</span>
            </button>

            {/* Fit All Fleet Bounds */}
            <button
              type="button"
              onClick={handleFitAllFleet}
              className="bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 border border-slate-700 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
              id="fit-all-fleet-btn"
              title="Zoom out to encompass all registered trucks"
            >
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              <span>Fit Nationwide Fleet</span>
            </button>

            {/* Fullscreen Button */}
            <button
              type="button"
              onClick={handleToggleFullscreen}
              className="bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white p-2 rounded-xl border border-slate-700 transition-all"
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
              id="fleet-fullscreen-btn"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Telematics Ribbon Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-2 border-t border-slate-800/80 text-xs">
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-0.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Registered Fleet</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-white font-mono">{stats.total}</span>
              <span className="text-[11px] text-amber-400 font-bold">Heavy Units</span>
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-0.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Active On Highway</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-emerald-400 font-mono">{stats.inMotion}</span>
              <span className="text-[11px] text-emerald-500/80 font-bold">In Motion</span>
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-0.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">At Logistics Hubs</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-blue-400 font-mono">{stats.atHubs}</span>
              <span className="text-[11px] text-blue-400/80 font-bold">Staging / Dock</span>
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-0.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Avg Transit Speed</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-white font-mono">{stats.avgSpeed}</span>
              <span className="text-[11px] text-slate-400 font-mono">km/h</span>
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-0.5 col-span-2 sm:col-span-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Fleet Fuel Health</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-amber-400 font-mono">{stats.avgFuel}%</span>
              <span className="text-[11px] text-slate-400">Avg Level</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Map + Sidebar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Leaflet Map Column */}
        <div className={`${isSidebarOpen ? 'lg:col-span-8 xl:col-span-9' : 'lg:col-span-12'} space-y-3 transition-all`}>
          {/* Map Controls Floating Strip */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-2.5 sm:p-3 flex flex-wrap items-center justify-between gap-2.5 shadow-md">
            {/* Layer Selection Chips */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase mr-1 hidden sm:inline flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>Layer:</span>
              </span>
              {(['dark', 'street', 'satellite', 'terrain'] as MapLayerType[]).map((layer) => (
                <button
                  key={layer}
                  type="button"
                  onClick={() => setActiveLayer(layer)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition-all active:scale-95 ${
                    activeLayer === layer
                      ? 'bg-amber-500 text-slate-950 font-black shadow'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {layer}
                </button>
              ))}
            </div>

            {/* Overlays Toggle Toggles */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowHubs(!showHubs)}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all active:scale-95 flex items-center gap-1 ${
                  showHubs
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-slate-950 text-slate-500 border-slate-800'
                }`}
                title="Toggle Regional Hubs & Physical Depots"
              >
                <Building2 className="w-3 h-3" />
                <span>Hubs ({PYDA_FLEET_HUBS.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setShowGeofences(!showGeofences)}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all active:scale-95 flex items-center gap-1 ${
                  showGeofences
                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                    : 'bg-slate-950 text-slate-500 border-slate-800'
                }`}
                title="Toggle Geofence Perimeter Rings"
              >
                <Radio className="w-3 h-3" />
                <span>Geofences</span>
              </button>

              <button
                type="button"
                onClick={() => setShowRoutes(!showRoutes)}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all active:scale-95 flex items-center gap-1 ${
                  showRoutes
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-slate-950 text-slate-500 border-slate-800'
                }`}
                title="Toggle Highway Route Corridor Dashlines"
              >
                <Navigation className="w-3 h-3" />
                <span>Corridors</span>
              </button>

              {/* Toggle Sidebar Collapse Button */}
              <button
                type="button"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white px-2.5 py-1 rounded-lg border border-slate-700 text-[11px] font-bold flex items-center gap-1 transition-all"
                id="toggle-fleet-sidebar-btn"
              >
                {isSidebarOpen ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{isSidebarOpen ? 'Hide Panel' : 'Show Roster'}</span>
              </button>
            </div>
          </div>

          {/* Leaflet Map Canvas */}
          <div className="relative rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950 h-[480px] sm:h-[580px]">
            <div ref={mapContainerRef} className="w-full h-full" id="active-fleet-leaflet-map-canvas" />

            {/* Map Floating Legend */}
            <div className="absolute bottom-4 left-4 z-[400] bg-slate-950/90 backdrop-blur-md border border-slate-800 rounded-2xl p-2.5 text-[10px] space-y-1.5 shadow-xl hidden sm:block">
              <span className="text-slate-400 font-bold uppercase tracking-wider block">Live Status Legend</span>
              <div className="flex items-center gap-2 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>In Transit / Cruising</span>
              </div>
              <div className="flex items-center gap-2 text-cyan-400">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                <span>Out for Delivery Approach</span>
              </div>
              <div className="flex items-center gap-2 text-blue-400">
                <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                <span>Loading Dock / Terminal</span>
              </div>
              <div className="flex items-center gap-2 text-rose-400">
                <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                <span>Customs / Border Clearance</span>
              </div>
            </div>
          </div>
        </div>

        {/* Fleet Roster Sidebar Column */}
        {isSidebarOpen && (
          <div className="lg:col-span-4 xl:col-span-3 space-y-3">
            {/* Search & Quick Filter Controls */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 space-y-3 shadow-xl">
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-amber-400 absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search unit, plate, driver, city..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 text-white placeholder-slate-500 text-xs rounded-xl pl-9 pr-8 py-2.5 outline-none transition-colors"
                  id="fleet-search-input"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 text-slate-500 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Status Filter Chips */}
              <div className="flex flex-wrap items-center gap-1 text-[10px]">
                {[
                  { id: 'all', label: 'All Units' },
                  { id: 'in_transit', label: 'In Transit' },
                  { id: 'loading_dock', label: 'Dock/Hub' },
                  { id: 'customs_hold', label: 'Customs' },
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setStatusFilter(st.id as any)}
                    className={`px-2 py-1 rounded-lg font-bold transition-all active:scale-95 ${
                      statusFilter === st.id
                        ? 'bg-amber-500 text-slate-950 font-black'
                        : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              {/* Category Tonnage Filter Chips */}
              <div className="flex flex-wrap items-center gap-1 text-[10px]">
                {[
                  { id: 'all', label: 'All Tonnages' },
                  { id: 'heavy_trailer', label: '30-40T' },
                  { id: 'medium_box', label: '10-15T' },
                  { id: 'urban_van', label: '5-7.5T' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryFilter(cat.id as any)}
                    className={`px-2 py-0.5 rounded-lg font-bold transition-all active:scale-95 ${
                      categoryFilter === cat.id
                        ? 'bg-slate-700 text-amber-400 border border-amber-500/50'
                        : 'bg-slate-950 text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                <span>Roster Count:</span>
                <strong className="text-amber-400 font-mono font-bold">
                  {filteredFleet.length} of {fleet.length} Trucks
                </strong>
              </div>
            </div>

            {/* Scrollable Trucks Cards List */}
            <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1 scrollbar-thin">
              {filteredFleet.map((truck) => {
                const isSelected = selectedTruck?.id === truck.id;
                const isMoving = truck.speedKmh > 0;

                return (
                  <div
                    key={truck.id}
                    onClick={() => handleSelectAndFlyToTruck(truck)}
                    className={`p-3.5 rounded-2xl border transition-all active:scale-[0.98] cursor-pointer space-y-2 ${
                      isSelected
                        ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/20 border-amber-500/70 shadow-lg ring-1 ring-amber-500/30'
                        : 'bg-slate-900/80 hover:bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                    id={`fleet-truck-card-${truck.unitCode}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs ${
                            isSelected
                              ? 'bg-amber-500 text-slate-950 font-black'
                              : 'bg-slate-950 text-slate-300 border border-slate-800'
                          }`}
                        >
                          <Truck className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs font-black text-amber-400">{truck.unitCode}</span>
                            {isMoving ? (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                            ) : null}
                          </div>
                          <span className="text-[10px] text-slate-400 block font-mono">{truck.plateNumber}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`text-[9px] font-black px-2 py-0.5 rounded-full capitalize block font-mono ${
                            isMoving ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {isMoving ? `${truck.speedKmh} km/h` : 'At Dock'}
                        </span>
                      </div>
                    </div>

                    {/* Location & Consignment Summary */}
                    <div className="text-xs space-y-1">
                      <p className="text-white font-extrabold text-[12px] truncate">{truck.makeModel}</p>
                      <p className="text-slate-400 text-[11px] truncate flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                        <span>{truck.currentLocationName}</span>
                      </p>
                    </div>

                    {/* Footer bar with driver & fuel */}
                    <div className="flex items-center justify-between pt-1.5 border-t border-slate-800/80 text-[10px] text-slate-400 font-mono">
                      <span>Captain: {truck.driverName.split(' ')[0]}</span>
                      <span className="text-amber-400 font-bold">Fuel: {truck.telematics.fuelPercent}%</span>
                    </div>
                  </div>
                );
              })}

              {filteredFleet.length === 0 && (
                <div className="text-center py-8 bg-slate-900/50 border border-dashed border-slate-800 rounded-2xl p-4 space-y-2">
                  <Truck className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs font-bold text-slate-400">No matching trucks found</p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('all');
                      setCategoryFilter('all');
                    }}
                    className="text-[11px] text-amber-400 font-bold hover:underline active:scale-95 transition-all inline-block"
                  >
                    Reset Roster Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Selected Truck Live Telematics Detail Drawer / Modal */}
      {selectedTruck && (
        <div className="bg-slate-900/95 border border-amber-500/50 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5 animate-in slide-in-from-bottom-3 relative overflow-hidden">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-lg">
                <Truck className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-black text-amber-400">{selectedTruck.unitCode}</span>
                  <span className="text-xs text-slate-400 font-mono font-bold">• {selectedTruck.plateNumber}</span>
                  <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono font-bold text-[10px] px-2 py-0.5 rounded-full capitalize">
                    {selectedTruck.status.replace('_', ' ')}
                  </span>
                </div>
                <h3 className="text-lg font-black text-white">{selectedTruck.makeModel}</h3>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => handleSelectAndFlyToTruck(selectedTruck)}
                className="bg-slate-800 hover:bg-slate-700 active:scale-95 text-amber-400 font-bold text-xs px-3 py-2 rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all"
                title="Center map on this vehicle"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Center On Map</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTruck(null)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 active:scale-95 transition-all"
                title="Close detail panel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Telematics Gauges Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {/* Speedometer */}
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                <Gauge className="w-3 h-3 text-amber-400" />
                <span>Speedometer</span>
              </span>
              <div className="flex items-baseline gap-1">
                <span className={`text-2xl font-black font-mono ${selectedTruck.speedKmh > 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {selectedTruck.speedKmh}
                </span>
                <span className="text-xs text-slate-500 font-mono">km/h</span>
              </div>
              <span className="text-[10px] text-slate-400 block font-mono">
                Heading: {selectedTruck.headingDegrees}°
              </span>
            </div>

            {/* Fuel Level */}
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                <Fuel className="w-3 h-3 text-amber-400" />
                <span>Diesel Tank</span>
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-amber-400 font-mono">
                  {selectedTruck.telematics.fuelPercent}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all"
                  style={{ width: `${selectedTruck.telematics.fuelPercent}%` }}
                />
              </div>
            </div>

            {/* Battery Voltage */}
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400" />
                <span>Battery Volts</span>
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-white font-mono">
                  {selectedTruck.telematics.batteryVolts}
                </span>
                <span className="text-xs text-slate-500 font-mono">V DC</span>
              </div>
              <span className="text-[10px] text-emerald-400 block font-bold">Alternator Healthy</span>
            </div>

            {/* Cargo Temperature */}
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                <Thermometer className="w-3 h-3 text-amber-400" />
                <span>Cargo Temp</span>
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-cyan-400 font-mono">
                  {selectedTruck.telematics.cargoTempCelsius !== undefined
                    ? `${selectedTruck.telematics.cargoTempCelsius}°C`
                    : 'Ambient'}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 block">Digital Thermistor</span>
            </div>

            {/* Satellite Locks */}
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                <Radio className="w-3 h-3 text-amber-400" />
                <span>GPS Lock</span>
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-white font-mono">
                  {selectedTruck.telematics.satelliteCount}/12
                </span>
                <span className="text-xs text-slate-500">Sats</span>
              </div>
              <span className="text-[10px] text-emerald-400 block font-bold">4G eSIM Link Live</span>
            </div>

            {/* Odometer */}
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                <Activity className="w-3 h-3 text-amber-400" />
                <span>Odometer</span>
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-white font-mono">
                  {selectedTruck.telematics.odometerKm.toLocaleString('en-NG')}
                </span>
                <span className="text-xs text-slate-500 font-mono">km</span>
              </div>
              <span className="text-[10px] text-slate-400 block">Fleet Serviced</span>
            </div>
          </div>

          {/* Consignment & Driver Detail Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Consignment Card */}
            <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Freight & Consignment Dossier</span>
                </span>
                {selectedTruck.activeConsignment?.tamperSealCode && (
                  <span className="bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                    SEAL: {selectedTruck.activeConsignment.tamperSealCode}
                  </span>
                )}
              </div>

              {selectedTruck.activeConsignment ? (
                <div className="space-y-2.5 text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px]">Consignment Client:</span>
                    <p className="text-white font-extrabold text-sm">{selectedTruck.activeConsignment.clientName}</p>
                  </div>

                  <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-850">
                    <span>Route Transit:</span>
                    <strong className="text-slate-200">
                      {selectedTruck.activeConsignment.origin} ➔ {selectedTruck.activeConsignment.destination}
                    </strong>
                  </div>

                  <div className="flex justify-between text-slate-400">
                    <span>Cargo Specification:</span>
                    <span className="text-slate-300">{selectedTruck.activeConsignment.cargoDescription}</span>
                  </div>

                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400">Transit Progress:</span>
                      <strong className="text-amber-400 font-mono font-bold">
                        {selectedTruck.activeConsignment.progressPercent}%
                      </strong>
                    </div>
                    <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full"
                        style={{ width: `${selectedTruck.activeConsignment.progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {selectedTruck.activeConsignment.trackingId && onSelectShipmentToTrack && (
                    <button
                      type="button"
                      onClick={() => onSelectShipmentToTrack(selectedTruck.activeConsignment!.trackingId!)}
                      className="w-full bg-slate-900 hover:bg-slate-800 active:scale-95 text-amber-400 font-bold text-xs py-2 rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 transition-all mt-2"
                    >
                      <span>Open in Detailed Shipment Tracker</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-500 py-4">No active client cargo currently assigned to this vehicle unit.</p>
              )}
            </div>

            {/* Driver & Convoy Captain Card */}
            <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 space-y-3">
              <span className="text-[11px] font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-amber-400" />
                <span>Assigned Convoy Captain & Comms</span>
              </span>

              <div className="flex items-center gap-3.5 pt-1">
                {selectedTruck.driverAvatar ? (
                  <img
                    src={selectedTruck.driverAvatar}
                    alt={selectedTruck.driverName}
                    className="w-12 h-12 rounded-2xl object-cover border border-amber-500/40 shadow"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black">
                    {selectedTruck.driverName.charAt(0)}
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-black text-white">{selectedTruck.driverName}</h4>
                  <p className="text-xs text-slate-400 font-mono">{selectedTruck.driverPhone}</p>
                  <span className="text-[10px] text-emerald-400 font-bold">FRSC & Defensive Driving Certified</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <a
                  href={`tel:${selectedTruck.driverPhone}`}
                  className="bg-slate-900 hover:bg-slate-850 active:scale-95 text-white font-bold text-xs py-2 px-3 rounded-xl border border-slate-800 flex items-center justify-center gap-1.5 transition-all shadow"
                >
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                  <span>Call Driver</span>
                </a>

                <a
                  href={`https://wa.me/234${selectedTruck.driverPhone.replace(/\D/g, '').replace(/^0/, '')}?text=${encodeURIComponent(
                    `Hello Captain ${selectedTruck.driverName}, this is Pyda Logistics Dispatch requesting a live telematics status check on Unit ${selectedTruck.unitCode} (${selectedTruck.plateNumber}).`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp Link</span>
                </a>
              </div>

              {/* Highway Corridor note */}
              {selectedTruck.routeCorridor && (
                <div className="pt-2 text-[11px] text-slate-400 border-t border-slate-850">
                  <span className="text-slate-500 block">Assigned Corridor:</span>
                  <span className="text-slate-300 font-medium">{selectedTruck.routeCorridor}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
