import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { ShipmentTrackStatus } from '../types';
import { 
  Navigation, 
  Layers, 
  Maximize2, 
  Compass, 
  MapPin, 
  Truck, 
  Zap, 
  ShieldCheck, 
  RotateCw,
  LocateFixed
} from 'lucide-react';

interface InteractiveGpsMapProps {
  shipment: ShipmentTrackStatus;
  isSimulating?: boolean;
  onToggleSimulation?: () => void;
  onAdvanceSimulation?: () => void;
}

type MapLayerType = 'dark' | 'street' | 'satellite' | 'terrain';

export const InteractiveGpsMap: React.FC<InteractiveGpsMapProps> = ({
  shipment,
  isSimulating = false,
  onToggleSimulation,
  onAdvanceSimulation,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markerGroupRef = useRef<L.LayerGroup | null>(null);
  const polylineLayerRef = useRef<L.Polyline | null>(null);
  const completedPolylineRef = useRef<L.Polyline | null>(null);
  const truckMarkerRef = useRef<L.Marker | null>(null);

  const [activeLayer, setActiveLayer] = useState<MapLayerType>('dark');
  const [showGeofence, setShowGeofence] = useState<boolean>(true);
  const [autoCenter, setAutoCenter] = useState<boolean>(true);

  const tileServers: Record<MapLayerType, { url: string; attribution: string }> = {
    dark: {
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
    },
    street: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>',
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

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Default center (Lagos / Abuja Corridor)
    const latCandidate = shipment?.currentCoordinates?.lat;
    const lngCandidate = shipment?.currentCoordinates?.lng;
    const initialLat = typeof latCandidate === 'number' && Number.isFinite(latCandidate) ? latCandidate : 7.8023;
    const initialLng = typeof lngCandidate === 'number' && Number.isFinite(lngCandidate) ? lngCandidate : 6.7412;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 7,
      zoomControl: false,
      attributionControl: false,
    });

    // Add zoom control top right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Add Tile Layer
    const tileLayer = L.tileLayer(tileServers[activeLayer].url, {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    tileLayerRef.current = tileLayer;

    // Layer Group for markers & routes
    const markerGroup = L.layerGroup().addTo(map);
    markerGroupRef.current = markerGroup;

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Layer when user switches layers
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    mapInstanceRef.current.removeLayer(tileLayerRef.current);
    const newLayer = L.tileLayer(tileServers[activeLayer].url, {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(mapInstanceRef.current);
    tileLayerRef.current = newLayer;
  }, [activeLayer]);

  // Render Markers, Routes, and Truck Position
  useEffect(() => {
    if (!mapInstanceRef.current || !markerGroupRef.current) return;

    const map = mapInstanceRef.current;
    const markerGroup = markerGroupRef.current;
    markerGroup.clearLayers();

    const routeCoords: [number, number][] = (shipment?.routeCoordinates || []).filter(
      (c): c is [number, number] => Array.isArray(c) && c.length >= 2 && typeof c[0] === 'number' && typeof c[1] === 'number' && Number.isFinite(c[0]) && Number.isFinite(c[1])
    );

    const rawOriginLat = shipment?.originCoordinates?.lat;
    const rawOriginLng = shipment?.originCoordinates?.lng;
    const originLat = typeof rawOriginLat === 'number' && Number.isFinite(rawOriginLat)
      ? rawOriginLat
      : (routeCoords.length > 0 && Number.isFinite(routeCoords[0][0]) ? routeCoords[0][0] : 6.4674);
    const originLng = typeof rawOriginLng === 'number' && Number.isFinite(rawOriginLng)
      ? rawOriginLng
      : (routeCoords.length > 0 && Number.isFinite(routeCoords[0][1]) ? routeCoords[0][1] : 3.2831);
    
    const rawDestLat = shipment?.destinationCoordinates?.lat;
    const rawDestLng = shipment?.destinationCoordinates?.lng;
    const destLat = typeof rawDestLat === 'number' && Number.isFinite(rawDestLat)
      ? rawDestLat
      : (routeCoords.length > 0 && Number.isFinite(routeCoords[routeCoords.length - 1][0]) ? routeCoords[routeCoords.length - 1][0] : 9.0765);
    const destLng = typeof rawDestLng === 'number' && Number.isFinite(rawDestLng)
      ? rawDestLng
      : (routeCoords.length > 0 && Number.isFinite(routeCoords[routeCoords.length - 1][1]) ? routeCoords[routeCoords.length - 1][1] : 7.3986);

    const rawCurrentLat = shipment?.currentCoordinates?.lat;
    const rawCurrentLng = shipment?.currentCoordinates?.lng;
    const currentLat = typeof rawCurrentLat === 'number' && Number.isFinite(rawCurrentLat)
      ? rawCurrentLat
      : originLat;
    const currentLng = typeof rawCurrentLng === 'number' && Number.isFinite(rawCurrentLng)
      ? rawCurrentLng
      : originLng;

    // 1. Origin Marker
    if (Number.isFinite(originLat) && Number.isFinite(originLng)) {
      const originIcon = L.divIcon({
        className: 'custom-map-icon',
        html: `
          <div class="relative flex items-center justify-center">
            <div class="w-8 h-8 rounded-full bg-blue-600 border-2 border-white shadow-xl flex items-center justify-center text-white font-black text-xs">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
            <div class="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-950 text-blue-400 text-[10px] font-black px-2 py-0.5 rounded border border-blue-500/30 shadow-lg">
              ORIGIN
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const originMarker = L.marker([originLat, originLng], { icon: originIcon })
        .bindPopup(`
          <div class="p-2 text-xs space-y-1">
            <strong class="text-blue-400 font-extrabold uppercase block">Dispatch Origin</strong>
            <p class="text-white font-bold">${shipment?.originCoordinates?.label || shipment?.origin || 'Lagos Hub'}</p>
            <span class="text-slate-400 text-[10px]">Loaded & Sealed Under Escort</span>
          </div>
        `);
      markerGroup.addLayer(originMarker);
    }

    // 2. Destination Marker
    if (Number.isFinite(destLat) && Number.isFinite(destLng)) {
      const destIcon = L.divIcon({
        className: 'custom-map-icon',
        html: `
          <div class="relative flex items-center justify-center">
            <div class="w-8 h-8 rounded-full bg-emerald-500 border-2 border-white shadow-xl flex items-center justify-center text-slate-950 font-black text-xs">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg>
            </div>
            <div class="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-950 text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded border border-emerald-500/30 shadow-lg">
              DESTINATION
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const destMarker = L.marker([destLat, destLng], { icon: destIcon })
        .bindPopup(`
          <div class="p-2 text-xs space-y-1">
            <strong class="text-emerald-400 font-extrabold uppercase block">Delivery Destination</strong>
            <p class="text-white font-bold">${shipment?.destinationCoordinates?.label || shipment?.destination || 'Abuja HQ'}</p>
            <span class="text-slate-400 text-[10px]">Estimated Arrival: ${shipment?.estimatedArrival || 'Scheduled'}</span>
          </div>
        `);
      markerGroup.addLayer(destMarker);
    }

    // 3. Geofence Perimeter Rings
    if (showGeofence) {
      if (Number.isFinite(originLat) && Number.isFinite(originLng)) {
        const originCircle = L.circle([originLat, originLng], {
          radius: 3500, // 3.5km geofence
          color: '#3b82f6',
          fillColor: '#3b82f6',
          fillOpacity: 0.08,
          weight: 1.5,
          dashArray: '4, 6',
        });
        markerGroup.addLayer(originCircle);
      }

      if (Number.isFinite(destLat) && Number.isFinite(destLng)) {
        const destCircle = L.circle([destLat, destLng], {
          radius: 4000,
          color: '#10b981',
          fillColor: '#10b981',
          fillOpacity: 0.1,
          weight: 1.5,
          dashArray: '4, 6',
        });
        markerGroup.addLayer(destCircle);
      }
    }

    // 4. Draw Full Planned Route Polyline
    if (routeCoords.length > 1) {
      const fullRoutePolyline = L.polyline(routeCoords, {
        color: '#64748b',
        weight: 4,
        opacity: 0.6,
        dashArray: '6, 8',
      });
      markerGroup.addLayer(fullRoutePolyline);

      if (Number.isFinite(currentLat) && Number.isFinite(currentLng)) {
        // Find closest index for completed route slice
        let closestIdx = 0;
        let minDistance = Infinity;
        routeCoords.forEach((pt, i) => {
          const d = Math.hypot(pt[0] - currentLat, pt[1] - currentLng);
          if (d < minDistance) {
            minDistance = d;
            closestIdx = i;
          }
        });

        const rawCompleted = [...routeCoords.slice(0, closestIdx + 1), [currentLat, currentLng]];
        const completedCoords = rawCompleted.filter(
          (c): c is [number, number] => Array.isArray(c) && c.length >= 2 && typeof c[0] === 'number' && typeof c[1] === 'number' && Number.isFinite(c[0]) && Number.isFinite(c[1])
        );
        if (completedCoords.length > 1) {
          const completedPolyline = L.polyline(completedCoords, {
            color: '#f59e0b',
            weight: 5,
            opacity: 0.95,
          });
          markerGroup.addLayer(completedPolyline);
          completedPolylineRef.current = completedPolyline;
        }
      }
    }

    // 5. Moving Vehicle / Convoy Marker with Animated Radar Pulse
    if (Number.isFinite(currentLat) && Number.isFinite(currentLng)) {
      const heading = shipment?.headingDegrees || 45;
      const speed = shipment?.speedKmh ?? 65;

      const truckIcon = L.divIcon({
        className: 'custom-truck-icon',
        html: `
          <div class="relative flex items-center justify-center">
            <!-- Animated Radar Ping -->
            <div class="absolute w-12 h-12 rounded-full bg-amber-400/30 radar-ping"></div>
            <div class="absolute w-8 h-8 rounded-full bg-amber-500/40 animate-ping"></div>
            
            <!-- Truck Body Badge -->
            <div class="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-950 via-slate-900 to-amber-500 border-2 border-amber-400 shadow-2xl flex items-center justify-center text-amber-300 transform transition-transform" style="transform: rotate(${heading}deg);">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>
            </div>

            <!-- Speed Flag Label -->
            <div class="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg border border-amber-300 flex items-center gap-1">
              <span>${speed} km/h</span>
            </div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      const truckMarker = L.marker([currentLat, currentLng], { icon: truckIcon, zIndexOffset: 1000 })
        .bindPopup(`
          <div class="p-2.5 text-xs space-y-1.5 min-w-[200px]">
            <div class="flex items-center justify-between border-b border-slate-800 pb-1">
              <span class="text-amber-400 font-black uppercase text-[11px]">${shipment?.vehicleUnit || 'MTM FLEET'}</span>
              <span class="text-emerald-400 font-bold bg-emerald-500/15 px-1.5 py-0.2 rounded text-[10px]">${shipment?.status || 'In Transit'}</span>
            </div>
            <p class="text-white font-bold">${shipment?.clientName || 'Pyda Consignment'}</p>
            <div class="text-[11px] text-slate-300 space-y-0.5">
              <p>📍 <strong>Position:</strong> ${shipment?.currentLocation || 'En Route'}</p>
              <p>⚡ <strong>Speed:</strong> ${speed} km/h (Bearing ${heading}°)</p>
              <p>👤 <strong>Driver:</strong> ${shipment?.driverName || 'Convoy Lead'}</p>
              <p>🔒 <strong>Tamper Seal:</strong> ${shipment?.tamperSealCode || 'Intact'}</p>
            </div>
          </div>
        `);

      markerGroup.addLayer(truckMarker);
      truckMarkerRef.current = truckMarker;

      // If autoCenter enabled, center on truck
      if (autoCenter && Number.isFinite(currentLat) && Number.isFinite(currentLng)) {
        try {
          map.panTo([currentLat, currentLng], { animate: true });
        } catch {
          // Ignore panTo error
        }
      }
    }
  }, [shipment, showGeofence, autoCenter]);

  const fitBoundsToRoute = () => {
    if (!mapInstanceRef.current) return;
    const routeCoords = (shipment?.routeCoordinates || []).filter(
      (c): c is [number, number] => Array.isArray(c) && c.length >= 2 && typeof c[0] === 'number' && typeof c[1] === 'number' && Number.isFinite(c[0]) && Number.isFinite(c[1])
    );
    if (routeCoords.length > 0) {
      try {
        const bounds = L.latLngBounds(routeCoords);
        if (bounds.isValid()) {
          mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
        }
      } catch (err) {
        console.warn('fitBounds error ignored', err);
      }
    }
  };

  const centerOnTruck = () => {
    if (!mapInstanceRef.current) return;
    const rawLat = shipment?.currentCoordinates?.lat;
    const rawLng = shipment?.currentCoordinates?.lng;
    const lat = typeof rawLat === 'number' && Number.isFinite(rawLat) ? rawLat : 7.8023;
    const lng = typeof rawLng === 'number' && Number.isFinite(rawLng) ? rawLng : 6.7412;
    try {
      mapInstanceRef.current.setView([lat, lng], 10, { animate: true });
    } catch {
      // Ignore setView error
    }
    setAutoCenter(true);
  };

  return (
    <div className="relative w-full h-[460px] sm:h-[540px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
      
      {/* Map DOM Container */}
      <div ref={mapContainerRef} className="w-full h-full" id="gps-leaflet-container" />

      {/* Top Floating Telemetry Overlay Banner */}
      <div className="absolute top-3 left-3 right-3 z-[400] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        
        {/* Live Radar Status Pill */}
        <div className="pointer-events-auto bg-slate-950/90 backdrop-blur-md border border-slate-800/90 rounded-xl px-3 py-2 shadow-xl flex items-center gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="font-black text-white text-[11px] uppercase tracking-wider">
              {isSimulating ? 'SIMULATING MOVEMENT' : 'SATELLITE GPS ACTIVE'}
            </span>
          </div>

          <span className="text-slate-600 hidden sm:inline">|</span>

          <div className="hidden sm:flex items-center gap-2 text-slate-300 text-[11px]">
            <span className="text-amber-400 font-bold">{shipment.satelliteCount || 11}/12 Satellites</span>
            <span className="text-slate-500">•</span>
            <span>Fix: <strong className="text-white">GLONASS+WAAS</strong></span>
          </div>
        </div>

        {/* Live Coordinates Pill */}
        <div className="pointer-events-auto bg-slate-950/90 backdrop-blur-md border border-slate-800/90 rounded-xl px-3 py-2 shadow-xl hidden md:flex items-center gap-2 text-xs font-mono text-amber-400">
          <LocateFixed className="w-3.5 h-3.5 text-amber-400" />
          <span>
            {shipment.currentCoordinates?.lat.toFixed(4)}° N, {shipment.currentCoordinates?.lng.toFixed(4)}° E
          </span>
        </div>

        {/* Layer Selector & Controls */}
        <div className="pointer-events-auto flex items-center gap-1.5 bg-slate-950/90 backdrop-blur-md border border-slate-800/90 p-1 rounded-xl shadow-xl">
          <button
            onClick={() => setActiveLayer(activeLayer === 'dark' ? 'street' : activeLayer === 'street' ? 'satellite' : 'dark')}
            className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-amber-400 active:scale-95 rounded-lg transition-all flex items-center gap-1 text-[11px] font-bold"
            title="Switch Map Theme (Dark Radar / Street / Satellite)"
          >
            <Layers className="w-4 h-4 text-amber-400" />
            <span className="uppercase text-[10px] hidden sm:inline">{activeLayer}</span>
          </button>

          <button
            onClick={() => setShowGeofence(!showGeofence)}
            className={`p-1.5 rounded-lg transition-all active:scale-95 text-[10px] font-bold flex items-center gap-1 ${
              showGeofence ? 'bg-amber-500/20 text-amber-400' : 'text-slate-400 hover:bg-slate-800'
            }`}
            title="Toggle Hub Geofence Perimeter Rings"
          >
            <ShieldCheck className="w-4 h-4" />
            <span className="hidden sm:inline">Geofence</span>
          </button>

          <button
            onClick={centerOnTruck}
            className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-amber-400 active:scale-95 rounded-lg transition-all"
            title="Center Camera on Moving Convoy"
          >
            <Truck className="w-4 h-4" />
          </button>

          <button
            onClick={fitBoundsToRoute}
            className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-amber-400 active:scale-95 rounded-lg transition-all"
            title="Fit Entire Interstate Route"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Bottom Live Highway HUD Overlay */}
      <div className="absolute bottom-3 left-3 right-3 z-[400] bg-slate-950/95 backdrop-blur-md border border-slate-800 rounded-xl p-3 shadow-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Position Description */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Navigation className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400">
                Live Highway Position:
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded font-mono">
                {shipment.vehiclePlate || 'ABC-492-XJ'}
              </span>
            </div>
            <p className="text-white font-black text-sm line-clamp-1 mt-0.5">
              {shipment.currentLocation}
            </p>
          </div>
        </div>

        {/* Simulation / Playback Controls */}
        <div className="flex items-center gap-2">
          {onToggleSimulation && (
            <button
              onClick={onToggleSimulation}
              className={`px-3 py-1.5 rounded-lg font-extrabold text-[11px] flex items-center gap-1.5 shadow transition-all active:scale-95 ${
                isSimulating 
                  ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 animate-pulse' 
                  : 'bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{isSimulating ? 'Pause Movement' : 'Simulate GPS Live'}</span>
            </button>
          )}

          {onAdvanceSimulation && (
            <button
              onClick={onAdvanceSimulation}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 hover:text-white rounded-lg text-[11px] font-bold border border-slate-700 flex items-center gap-1 transition-all"
              title="Advance truck to next waypoint"
            >
              <RotateCw className="w-3.5 h-3.5 text-amber-400" />
              <span>Step ➔</span>
            </button>
          )}
        </div>

      </div>

    </div>
  );
};
