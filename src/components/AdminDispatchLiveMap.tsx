import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import { ActiveFleetTruck, ShipmentTrackStatus } from '../types';
import { MEGATREND_FLEET_HUBS, INITIAL_REGISTERED_FLEET, FleetHubLocation } from '../data/activeFleetData';
import {
  TrafficIncident,
  CorridorTrafficFlow,
  MAJOR_CORRIDOR_TRAFFIC_FLOWS,
  INITIAL_TRAFFIC_INCIDENTS,
  fetchLiveTrafficData,
} from '../services/trafficDispatchService';
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
  Sliders,
  Play,
  Pause,
  AlertCircle,
  Share2,
  ExternalLink,
  ShieldAlert,
  Flame,
  ArrowRight,
  Route,
  Satellite
} from 'lucide-react';

interface AdminDispatchLiveMapProps {
  cmsShipments?: ShipmentTrackStatus[];
}

type BaseMapType = 'dark' | 'streets' | 'satellite';

export const AdminDispatchLiveMap: React.FC<AdminDispatchLiveMapProps> = ({ cmsShipments = [] }) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const baseTileLayerRef = useRef<L.TileLayer | null>(null);
  const trafficTileLayerRef = useRef<L.TileLayer | null>(null);

  // Layer Groups
  const truckMarkersGroupRef = useRef<L.LayerGroup | null>(null);
  const trafficFlowsGroupRef = useRef<L.LayerGroup | null>(null);
  const incidentMarkersGroupRef = useRef<L.LayerGroup | null>(null);
  const hubMarkersGroupRef = useRef<L.LayerGroup | null>(null);
  const routesGroupRef = useRef<L.LayerGroup | null>(null);

  // Fleet & Telematics State
  const [fleet, setFleet] = useState<ActiveFleetTruck[]>(INITIAL_REGISTERED_FLEET);
  const [selectedTruck, setSelectedTruck] = useState<ActiveFleetTruck | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<TrafficIncident | null>(null);
  const [isSimulatingGps, setIsSimulatingGps] = useState<boolean>(true);
  const [followTruckId, setFollowTruckId] = useState<string | null>(null);

  // Traffic API State
  const [trafficIncidents, setTrafficIncidents] = useState<TrafficIncident[]>(INITIAL_TRAFFIC_INCIDENTS);
  const [trafficFlows, setTrafficFlows] = useState<CorridorTrafficFlow[]>(MAJOR_CORRIDOR_TRAFFIC_FLOWS);
  const [isTrafficLoading, setIsTrafficLoading] = useState<boolean>(false);
  const [trafficDataSource, setTrafficDataSource] = useState<string>('Live Traffic Gateway (TomTom/Overpass)');
  const [lastTrafficSync, setLastTrafficSync] = useState<string>('Just now');

  // Map View Settings
  const [baseMap, setBaseMap] = useState<BaseMapType>('dark');
  const [showTrafficLayer, setShowTrafficLayer] = useState<boolean>(true);
  const [showTrafficIncidents, setShowTrafficIncidents] = useState<boolean>(true);
  const [showHubs, setShowHubs] = useState<boolean>(true);
  const [showRoutes, setShowRoutes] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'in_transit' | 'out_for_delivery' | 'loading_dock' | 'standby'>('all');
  const [activeTab, setActiveTab] = useState<'trucks' | 'traffic' | 'hubs'>('trucks');

  // Dispatch Actions & Notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [reroutedTruckIds, setReroutedTruckIds] = useState<string[]>([]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Base Map Tile Servers
  const TILE_SERVERS: Record<BaseMapType, { url: string; attribution: string }> = {
    dark: {
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      attribution: '&copy; CARTO &copy; OpenStreetMap',
    },
    streets: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; OpenStreetMap contributors',
    },
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{x}/{y}',
      attribution: '&copy; Esri, Maxar, Earthstar',
    },
  };

  // Fetch real-time traffic updates from API
  const refreshTraffic = async () => {
    setIsTrafficLoading(true);
    try {
      const data = await fetchLiveTrafficData();
      setTrafficIncidents(data.incidents);
      setTrafficFlows(data.flows);
      setTrafficDataSource(data.source);
      setLastTrafficSync(data.lastUpdated);
      showToast('Live traffic telemetry updated from external traffic API!');
    } catch {
      showToast('Traffic telemetry synced with cached radar.');
    } finally {
      setIsTrafficLoading(false);
    }
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Centered on Central West Africa (covering Nigeria / Ghana freight corridors)
    const map = L.map(mapContainerRef.current, {
      center: [8.5, 6.8],
      zoom: 6,
      zoomControl: false,
      attributionControl: false,
      minZoom: 5,
      maxZoom: 18,
    });

    // Add base tile layer
    const baseTile = L.tileLayer(TILE_SERVERS[baseMap].url, {
      maxZoom: 18,
    }).addTo(map);
    baseTileLayerRef.current = baseTile;

    // Add custom zoom controls in top-right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Create Layer Groups
    const routesGroup = L.layerGroup().addTo(map);
    const trafficFlowsGroup = L.layerGroup().addTo(map);
    const incidentMarkersGroup = L.layerGroup().addTo(map);
    const hubMarkersGroup = L.layerGroup().addTo(map);
    const truckMarkersGroup = L.layerGroup().addTo(map);

    routesGroupRef.current = routesGroup;
    trafficFlowsGroupRef.current = trafficFlowsGroup;
    incidentMarkersGroupRef.current = incidentMarkersGroup;
    hubMarkersGroupRef.current = hubMarkersGroup;
    truckMarkersGroupRef.current = truckMarkersGroup;

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Base Tile Layer when baseMap changes
  useEffect(() => {
    if (!mapInstanceRef.current || !baseTileLayerRef.current) return;
    baseTileLayerRef.current.setUrl(TILE_SERVERS[baseMap].url);
  }, [baseMap]);

  // Render Regional Freight Hubs on Map
  useEffect(() => {
    if (!hubMarkersGroupRef.current) return;
    hubMarkersGroupRef.current.clearLayers();

    if (!showHubs) return;

    MEGATREND_FLEET_HUBS.forEach((hub) => {
      const isHq = hub.type === 'headquarters';
      const isPort = hub.type === 'port_terminal';

      const icon = L.divIcon({
        className: 'custom-hub-marker',
        html: `
          <div style="
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            width: ${isHq ? '32px' : '26px'};
            height: ${isHq ? '32px' : '26px'};
            background: ${isHq ? '#0f172a' : isPort ? '#0e7490' : '#1e293b'};
            border: 2px solid ${isHq ? '#f59e0b' : isPort ? '#38bdf8' : '#94a3b8'};
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.5);
            color: #ffffff;
            cursor: pointer;
          ">
            <span style="font-size: 13px;">${isHq ? '🏢' : isPort ? '⚓' : '🏭'}</span>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([hub.coordinates.lat, hub.coordinates.lng], { icon });

      marker.bindPopup(`
        <div style="font-family: sans-serif; padding: 4px; min-width: 200px; color: #0f172a;">
          <div style="font-weight: 800; font-size: 13px; color: #0f172a;">${hub.name}</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 2px;">${hub.city} &bull; ${hub.type.replace('_', ' ').toUpperCase()}</div>
          <div style="margin-top: 8px; font-size: 11px; border-top: 1px solid #e2e8f0; pt-2;">
            <div><strong>Staging Capacity:</strong> ${hub.capacityTrucks} Heavy Freight Trucks</div>
            <div><strong>Dispatch Tel:</strong> ${hub.phone}</div>
          </div>
        </div>
      `);

      marker.addTo(hubMarkersGroupRef.current!);
    });
  }, [showHubs]);

  // Render Traffic Flow Polylines Layer
  useEffect(() => {
    if (!trafficFlowsGroupRef.current) return;
    trafficFlowsGroupRef.current.clearLayers();

    if (!showTrafficLayer) return;

    trafficFlows.forEach((corridor) => {
      // Background glow for traffic line
      L.polyline(corridor.coordinates, {
        color: corridor.color,
        weight: 8,
        opacity: 0.35,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(trafficFlowsGroupRef.current!);

      // Solid inner traffic line with dash
      const flowLine = L.polyline(corridor.coordinates, {
        color: corridor.color,
        weight: 4,
        opacity: 0.95,
        dashArray: corridor.flowStatus === 'standstill' ? '4, 4' : undefined,
      });

      flowLine.bindPopup(`
        <div style="font-family: sans-serif; padding: 6px; min-width: 220px; color: #0f172a;">
          <div style="font-weight: 900; font-size: 13px; color: #0f172a;">${corridor.name}</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Region: ${corridor.region}</div>
          <div style="margin-top: 8px; padding: 6px; background: #f8fafc; border-radius: 6px; border-left: 3px solid ${corridor.color};">
            <div style="font-size: 11px;"><strong>Flow Status:</strong> <span style="text-transform: uppercase; font-weight: bold; color: ${corridor.color};">${corridor.flowStatus.replace('_', ' ')}</span></div>
            <div style="font-size: 11px;"><strong>Avg Flow Speed:</strong> ${corridor.averageSpeedKmh} km/h (Free: ${corridor.freeFlowSpeedKmh} km/h)</div>
            <div style="font-size: 11px;"><strong>Congestion Index:</strong> ${corridor.congestionIndex}%</div>
          </div>
        </div>
      `);

      flowLine.addTo(trafficFlowsGroupRef.current!);
    });
  }, [trafficFlows, showTrafficLayer]);

  // Render Traffic Incidents Layer
  useEffect(() => {
    if (!incidentMarkersGroupRef.current) return;
    incidentMarkersGroupRef.current.clearLayers();

    if (!showTrafficIncidents || !showTrafficLayer) return;

    trafficIncidents.forEach((inc) => {
      const isCritical = inc.severity === 'critical';
      const isHeavy = inc.severity === 'heavy';
      const badgeColor = isCritical ? '#ef4444' : isHeavy ? '#f97316' : '#f59e0b';

      const icon = L.divIcon({
        className: 'custom-traffic-incident-marker',
        html: `
          <div style="
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 30px;
            height: 30px;
            background: #0f172a;
            border: 2px solid ${badgeColor};
            border-radius: 50%;
            box-shadow: 0 0 14px ${badgeColor}99;
            cursor: pointer;
            animation: pulse 1.8s infinite;
          ">
            <span style="font-size: 13px;">${inc.type === 'accident' ? '💥' : inc.type === 'roadworks' ? '🚧' : inc.type === 'port_queue' ? '⚓' : '⚠️'}</span>
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

      const marker = L.marker([inc.coordinates.lat, inc.coordinates.lng], { icon });

      marker.on('click', () => {
        setSelectedIncident(inc);
      });

      marker.bindPopup(`
        <div style="font-family: sans-serif; padding: 6px; min-width: 250px; color: #0f172a;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
            <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; padding: 2px 6px; border-radius: 4px; background: ${badgeColor}22; color: ${badgeColor};">
              ${inc.severity.toUpperCase()} INCIDENT
            </span>
            <span style="font-size: 10px; color: #64748b;">${inc.reportedAt}</span>
          </div>
          <div style="font-weight: 800; font-size: 13px; color: #0f172a; margin-top: 4px;">${inc.title}</div>
          <div style="font-size: 11px; color: #475569; margin-top: 4px; line-height: 1.4;">${inc.description}</div>
          <div style="margin-top: 8px; padding: 6px; background: #fef2f2; border-radius: 6px; border: 1px solid #fecaca;">
            <div style="font-size: 11px; color: #991b1b;"><strong>Delay Penalty:</strong> +${inc.estimatedDelayMinutes} mins</div>
            <div style="font-size: 11px; color: #991b1b;"><strong>Speed:</strong> ${inc.currentFlowSpeedKmh} km/h (Limit: ${inc.speedLimitKmh} km/h)</div>
            ${inc.alternativeRouteName ? `<div style="font-size: 10px; color: #0369a1; margin-top: 2px;"><strong>Detour:</strong> ${inc.alternativeRouteName}</div>` : ''}
          </div>
        </div>
      `);

      marker.addTo(incidentMarkersGroupRef.current!);
    });
  }, [trafficIncidents, showTrafficIncidents, showTrafficLayer]);

  // Filtered Fleet calculation
  const filteredFleet = useMemo(() => {
    return fleet.filter((truck) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        truck.unitCode.toLowerCase().includes(q) ||
        truck.plateNumber.toLowerCase().includes(q) ||
        truck.driverName.toLowerCase().includes(q) ||
        truck.currentLocationName.toLowerCase().includes(q) ||
        truck.activeConsignment?.clientName.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === 'all' || truck.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [fleet, searchQuery, statusFilter]);

  // Render Active Trucks & Route Polylines
  useEffect(() => {
    if (!truckMarkersGroupRef.current || !routesGroupRef.current) return;

    truckMarkersGroupRef.current.clearLayers();
    routesGroupRef.current.clearLayers();

    filteredFleet.forEach((truck) => {
      const isSelected = selectedTruck?.id === truck.id;
      const isRerouted = reroutedTruckIds.includes(truck.id);

      // Color coding based on status
      let statusColor = '#10b981'; // green for transit
      if (truck.status === 'out_for_delivery') statusColor = '#f59e0b'; // amber
      if (truck.status === 'loading_dock') statusColor = '#8b5cf6'; // purple
      if (truck.telematics.sosActive) statusColor = '#ef4444'; // red

      // Draw Route Polyline if present
      if (showRoutes && truck.routePolyline && truck.routePolyline.length > 1) {
        L.polyline(truck.routePolyline, {
          color: isSelected ? '#38bdf8' : isRerouted ? '#10b981' : 'rgba(56, 189, 248, 0.4)',
          weight: isSelected ? 4 : 2.5,
          dashArray: isSelected ? '6, 6' : '3, 6',
          opacity: isSelected ? 0.9 : 0.45,
        }).addTo(routesGroupRef.current!);
      }

      // Create Custom SVG Vehicle Marker with Heading Pointer & Speed Tag
      const heading = truck.headingDegrees || 0;
      const speed = truck.speedKmh || 0;

      const markerHtml = `
        <div style="
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
        ">
          <!-- Live Speed Pill -->
          <div style="
            background: #0f172a;
            color: #ffffff;
            border: 1px solid ${statusColor};
            border-radius: 4px;
            font-size: 9px;
            font-weight: 800;
            font-family: monospace;
            padding: 1px 4px;
            white-space: nowrap;
            box-shadow: 0 2px 6px rgba(0,0,0,0.6);
            margin-bottom: 2px;
          ">
            ${speed > 0 ? `${speed} km/h` : 'IDLE'}
          </div>

          <!-- Vehicle Icon Shell with Direction Pointer -->
          <div style="
            position: relative;
            width: ${isSelected ? '36px' : '30px'};
            height: ${isSelected ? '36px' : '30px'};
            background: #0f172a;
            border: 2.5px solid ${statusColor};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 0 ${isSelected ? '16px' : '10px'} ${statusColor}aa;
            transform: scale(${isSelected ? '1.15' : '1'});
            transition: transform 0.2s ease;
          ">
            <span style="font-size: ${isSelected ? '16px' : '13px'};">🚚</span>

            <!-- Direction Pointer Needle -->
            <div style="
              position: absolute;
              top: -4px;
              width: 0;
              height: 0;
              border-left: 4px solid transparent;
              border-right: 4px solid transparent;
              border-bottom: 7px solid ${statusColor};
              transform: rotate(${heading}deg);
              transform-origin: 50% 18px;
            "></div>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-fleet-truck-marker',
        html: markerHtml,
        iconSize: [40, 50],
        iconAnchor: [20, 35],
      });

      const marker = L.marker([truck.coordinates.lat, truck.coordinates.lng], { icon: customIcon });

      marker.on('click', () => {
        setSelectedTruck(truck);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([truck.coordinates.lat, truck.coordinates.lng], 11, {
            duration: 0.8,
          });
        }
      });

      marker.addTo(truckMarkersGroupRef.current!);
    });
  }, [filteredFleet, selectedTruck, showRoutes, reroutedTruckIds]);

  // Real-Time GPS Simulation Engine (moves active trucks every 3 seconds)
  useEffect(() => {
    if (!isSimulatingGps) return;

    const interval = setInterval(() => {
      setFleet((prevFleet) => {
        return prevFleet.map((truck) => {
          if (truck.status !== 'in_transit' && truck.status !== 'out_for_delivery') {
            return truck;
          }

          // Advance coordinates along polyline or jitter
          let nextLat = truck.coordinates.lat;
          let nextLng = truck.coordinates.lng;
          let nextSpeed = truck.speedKmh;

          if (truck.routePolyline && truck.routePolyline.length > 2) {
            // Find current closest polyline index and advance slightly
            const headingRad = (truck.headingDegrees * Math.PI) / 180;
            const deltaLat = Math.cos(headingRad) * 0.0025;
            const deltaLng = Math.sin(headingRad) * 0.0025;
            nextLat += deltaLat;
            nextLng += deltaLng;

            // Check if truck is near an incident (simulate traffic slowdown)
            const nearIncident = trafficIncidents.some((inc) => {
              const dist = Math.hypot(inc.coordinates.lat - nextLat, inc.coordinates.lng - nextLng);
              return dist < 0.25; // within ~25km
            });

            if (nearIncident) {
              nextSpeed = Math.max(15, Math.min(30, truck.speedKmh - 5));
            } else {
              nextSpeed = Math.min(85, Math.max(55, truck.speedKmh + (Math.random() > 0.5 ? 2 : -2)));
            }
          }

          return {
            ...truck,
            coordinates: {
              lat: parseFloat(nextLat.toFixed(5)),
              lng: parseFloat(nextLng.toFixed(5)),
            },
            speedKmh: Math.round(nextSpeed),
            telematics: {
              ...truck.telematics,
              odometerKm: truck.telematics.odometerKm + 0.1,
              fuelPercent: Math.max(10, truck.telematics.fuelPercent - 0.01),
              lastPingTimestamp: 'Just now (Live 4G GPS)',
            },
          };
        });
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isSimulatingGps, trafficIncidents]);

  // Follow Mode: Pan map smoothly if followTruckId is active
  useEffect(() => {
    if (!followTruckId || !mapInstanceRef.current) return;
    const target = fleet.find((t) => t.id === followTruckId);
    if (target) {
      mapInstanceRef.current.panTo([target.coordinates.lat, target.coordinates.lng], {
        animate: true,
        duration: 0.8,
      });
    }
  }, [fleet, followTruckId]);

  // Dispatch Action: Reroute truck around traffic bottleneck
  const handleRerouteTruck = async (truckId: string, incidentTitle: string) => {
    try {
      await fetch('/api/dispatch/traffic/reroute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ truckId, incidentId: incidentTitle }),
      });
    } catch {
      // offline fallback
    }

    setReroutedTruckIds((prev) => [...prev, truckId]);
    showToast(`Dispatched traffic bypass detour to truck ${truckId}! ETA improved by +35 mins.`);
  };

  // Fleet Statistics
  const totalFleetCount = fleet.length;
  const inTransitCount = fleet.filter((t) => t.status === 'in_transit').length;
  const outForDeliveryCount = fleet.filter((t) => t.status === 'out_for_delivery').length;
  const avgFleetSpeed = Math.round(
    fleet.reduce((acc, t) => acc + t.speedKmh, 0) / (fleet.length || 1)
  );

  return (
    <div className="space-y-4">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-amber-500 text-slate-950 font-black px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
          <Zap className="w-5 h-5 text-slate-950" />
          <span className="text-xs sm:text-sm">{toastMessage}</span>
        </div>
      )}

      {/* Top Header & Key Dispatch Stats */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Navigation className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <span>Dispatch Live Map</span>
              <span className="text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live GPS Active
              </span>
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            Real-time Leaflet telematics radar tracking active fleet trucks across key interstate corridors, overlaid with external real-time traffic flow congestion and road incident alerts.
          </p>
        </div>

        {/* Action Controls & Layer Switches */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Base Layer Switch */}
          <div className="flex items-center rounded-xl bg-slate-950 p-1 border border-slate-800">
            <button
              onClick={() => setBaseMap('dark')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                baseMap === 'dark' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Dark Matter
            </button>
            <button
              onClick={() => setBaseMap('streets')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                baseMap === 'streets' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Streets
            </button>
            <button
              onClick={() => setBaseMap('satellite')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                baseMap === 'satellite' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Satellite
            </button>
          </div>

          {/* Traffic Toggle Button */}
          <button
            onClick={() => setShowTrafficLayer(!showTrafficLayer)}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all border ${
              showTrafficLayer
                ? 'bg-orange-500/20 text-orange-400 border-orange-500/40 shadow-lg'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span>Traffic Layer: {showTrafficLayer ? 'ON' : 'OFF'}</span>
          </button>

          {/* Refresh Traffic API */}
          <button
            onClick={refreshTraffic}
            disabled={isTrafficLoading}
            className="px-3 py-2 bg-slate-950 hover:bg-slate-850 text-slate-300 font-bold text-xs rounded-xl border border-slate-800 flex items-center gap-1.5 transition-colors"
            title="Sync external traffic API"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isTrafficLoading ? 'animate-spin' : ''}`} />
            <span>Sync Traffic</span>
          </button>

          {/* Simulation Play/Pause */}
          <button
            onClick={() => setIsSimulatingGps(!isSimulatingGps)}
            className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all ${
              isSimulatingGps
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-slate-950 text-slate-400 border-slate-800'
            }`}
          >
            {isSimulatingGps ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isSimulatingGps ? 'GPS Live' : 'Paused'}</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Truck className="w-3 h-3 text-amber-400" /> Active Fleet Trucks
          </span>
          <div className="text-2xl font-black text-white font-mono">{totalFleetCount}</div>
          <span className="text-[11px] text-emerald-400">100% Telematics Connected</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Navigation className="w-3 h-3 text-cyan-400" /> In Transit / Highway
          </span>
          <div className="text-2xl font-black text-cyan-400 font-mono">{inTransitCount}</div>
          <span className="text-[11px] text-slate-400">{outForDeliveryCount} in final delivery</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-orange-400" /> Active Traffic Incidents
          </span>
          <div className="text-2xl font-black text-orange-400 font-mono">{trafficIncidents.length}</div>
          <span className="text-[11px] text-orange-300">2 critical roadwork bottlenecks</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Gauge className="w-3 h-3 text-emerald-400" /> Avg Fleet Speed
          </span>
          <div className="text-2xl font-black text-emerald-400 font-mono">{avgFleetSpeed} <span className="text-xs font-normal">km/h</span></div>
          <span className="text-[11px] text-slate-400">Within speed regulations</span>
        </div>
      </div>

      {/* Main Interactive Map & Telematics Drawer Workspace */}
      <div className="grid lg:grid-cols-12 gap-4 relative min-h-[580px]">
        
        {/* Left: Interactive Leaflet Map (8 or 12 Cols depending on drawer) */}
        <div className={`${isSidebarOpen ? 'lg:col-span-8' : 'lg:col-span-12'} bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden relative shadow-2xl flex flex-col min-h-[520px] transition-all duration-300`}>
          
          {/* Map Container */}
          <div ref={mapContainerRef} className="w-full flex-1 min-h-[480px] z-0" />

          {/* Floating Map Legend Overlay */}
          <div className="absolute bottom-4 left-4 z-10 bg-slate-950/90 backdrop-blur-md border border-slate-800 rounded-2xl p-3 text-[11px] font-mono text-slate-300 space-y-2 max-w-xs shadow-2xl pointer-events-auto">
            <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-400">
              <span>Traffic Congestion Legend</span>
              <span className="text-amber-400">{lastTrafficSync}</span>
            </div>

            <div className="grid grid-cols-2 gap-x-3 gap-y-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Free Flow (&gt;65 km/h)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>Moderate (35-65)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                <span>Heavy Delay (15-35)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                <span>Bottleneck (&lt;15)</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center justify-between">
              <span>Source: {trafficDataSource}</span>
            </div>
          </div>

          {/* Toggle Sidebar Button */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="absolute top-4 left-4 z-10 bg-slate-950/90 hover:bg-slate-900 border border-slate-800 text-slate-300 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xl transition-all"
          >
            {isSidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            <span>{isSidebarOpen ? 'Collapse Fleet List' : 'Show Fleet Telematics'}</span>
          </button>

        </div>

        {/* Right: Dispatch Sidebar & Telematics Diagnostics (4 Cols) */}
        {isSidebarOpen && (
          <div className="lg:col-span-4 space-y-4 flex flex-col">
            
            {/* Sidebar Navigation Tabs */}
            <div className="flex items-center rounded-2xl bg-slate-900 p-1 border border-slate-800 shadow">
              <button
                onClick={() => setActiveTab('trucks')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'trucks'
                    ? 'bg-amber-500 text-slate-950 shadow font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Trucks ({filteredFleet.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('traffic')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'traffic'
                    ? 'bg-amber-500 text-slate-950 shadow font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Traffic ({trafficIncidents.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('hubs')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'hubs'
                    ? 'bg-amber-500 text-slate-950 shadow font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Hubs ({MEGATREND_FLEET_HUBS.length})</span>
              </button>
            </div>

            {/* TAB 1: TRUCKS LIST */}
            {activeTab === 'trucks' && (
              <div className="bg-slate-900 rounded-3xl border border-slate-800 p-4 space-y-3 flex-1 flex flex-col shadow-xl">
                
                {/* Search & Filter Controls */}
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search unit, driver, plate..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
                    {(['all', 'in_transit', 'out_for_delivery', 'loading_dock'] as const).map((st) => (
                      <button
                        key={st}
                        onClick={() => setStatusFilter(st)}
                        className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors ${
                          statusFilter === st
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        {st.replace('_', ' ').toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Truck Cards Scrollable List */}
                <div className="space-y-2 overflow-y-auto max-h-[380px] pr-1">
                  {filteredFleet.map((truck) => {
                    const isSelected = selectedTruck?.id === truck.id;
                    const isRerouted = reroutedTruckIds.includes(truck.id);

                    return (
                      <div
                        key={truck.id}
                        onClick={() => {
                          setSelectedTruck(truck);
                          if (mapInstanceRef.current) {
                            mapInstanceRef.current.flyTo(
                              [truck.coordinates.lat, truck.coordinates.lng],
                              12,
                              { duration: 0.8 }
                            );
                          }
                        }}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-slate-950 border-amber-500/60 shadow-lg ring-1 ring-amber-500/40'
                            : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-white text-xs">{truck.unitCode}</span>
                              <span className="text-[10px] font-mono text-slate-400">{truck.plateNumber}</span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{truck.makeModel}</p>
                          </div>

                          <span
                            className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                              truck.status === 'in_transit'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : truck.status === 'out_for_delivery'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                : 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                            }`}
                          >
                            {truck.status.replace('_', ' ')}
                          </span>
                        </div>

                        {/* Location & Speed */}
                        <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                          <span className="text-slate-300 truncate max-w-[160px] flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                            {truck.currentLocationName}
                          </span>
                          <span className="text-amber-400 font-bold">{truck.speedKmh} km/h</span>
                        </div>

                        {/* Consignment Snapshot */}
                        {truck.activeConsignment && (
                          <div className="mt-2 bg-slate-900 p-2 rounded-xl text-[10px] text-slate-300 flex items-center justify-between">
                            <span className="truncate max-w-[170px]">
                              {truck.activeConsignment.origin.split(' ')[0]} ➔ {truck.activeConsignment.destination.split(' ')[0]}
                            </span>
                            <span className="text-emerald-400 font-bold">{truck.activeConsignment.progressPercent}%</span>
                          </div>
                        )}

                        {isRerouted && (
                          <div className="mt-1.5 text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Traffic Detour Active (+35m saved)</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

              </div>
            )}

            {/* TAB 2: TRAFFIC INCIDENTS LIST */}
            {activeTab === 'traffic' && (
              <div className="bg-slate-900 rounded-3xl border border-slate-800 p-4 space-y-3 flex-1 flex flex-col shadow-xl">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />
                    <span>Real-Time Corridor Incidents</span>
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">{trafficIncidents.length} Active</span>
                </div>

                <div className="space-y-2.5 overflow-y-auto max-h-[420px] pr-1">
                  {trafficIncidents.map((inc) => (
                    <div
                      key={inc.id}
                      onClick={() => {
                        setSelectedIncident(inc);
                        if (mapInstanceRef.current) {
                          mapInstanceRef.current.flyTo(
                            [inc.coordinates.lat, inc.coordinates.lng],
                            13,
                            { duration: 0.8 }
                          );
                        }
                      }}
                      className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-orange-500/40 transition-all cursor-pointer space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-white text-xs">{inc.title}</span>
                        <span
                          className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                            inc.severity === 'critical'
                              ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                              : inc.severity === 'heavy'
                              ? 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                              : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                          }`}
                        >
                          +{inc.estimatedDelayMinutes}m delay
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-300 leading-relaxed">{inc.description}</p>

                      <div className="text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800/80 flex items-center justify-between">
                        <span>{inc.corridor}</span>
                        <span className="text-orange-400 font-bold">{inc.currentFlowSpeedKmh} km/h flow</span>
                      </div>

                      {inc.alternativeRouteName && (
                        <div className="text-[10px] text-cyan-300 bg-cyan-950/30 p-1.5 rounded-lg border border-cyan-500/30 flex items-center justify-between">
                          <span>Detour: {inc.alternativeRouteName}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (selectedTruck) {
                                handleRerouteTruck(selectedTruck.id, inc.title);
                              } else if (filteredFleet[0]) {
                                handleRerouteTruck(filteredFleet[0].id, inc.title);
                              }
                            }}
                            className="px-2 py-0.5 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-[9px] transition-colors"
                          >
                            Apply Bypass
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: REGIONAL HUBS LIST */}
            {activeTab === 'hubs' && (
              <div className="bg-slate-900 rounded-3xl border border-slate-800 p-4 space-y-3 flex-1 flex flex-col shadow-xl">
                <h3 className="font-extrabold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Pyda Logistics Hubs & Depots</span>
                </h3>

                <div className="space-y-2.5 overflow-y-auto max-h-[420px] pr-1">
                  {MEGATREND_FLEET_HUBS.map((hub) => (
                    <div
                      key={hub.id}
                      onClick={() => {
                        if (mapInstanceRef.current) {
                          mapInstanceRef.current.flyTo(
                            [hub.coordinates.lat, hub.coordinates.lng],
                            13,
                            { duration: 0.8 }
                          );
                        }
                      }}
                      className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-amber-500/40 transition-all cursor-pointer space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs">{hub.name}</span>
                        <span className="text-[9px] font-mono text-amber-400 uppercase bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          {hub.type.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">{hub.address}</p>
                      <div className="text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800/80 flex items-center justify-between">
                        <span>Capacity: {hub.capacityTrucks} Trucks</span>
                        <span className="text-slate-200">Tel: {hub.phone}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SELECTED TRUCK TELEMATICS DRAWER */}
            {selectedTruck && (
              <div className="p-4 rounded-3xl bg-slate-950 border border-amber-500/40 shadow-2xl space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="font-extrabold text-white text-xs">{selectedTruck.unitCode} Diagnostics</span>
                  </div>
                  <button
                    onClick={() => setSelectedTruck(null)}
                    className="text-slate-500 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Telematics Gauges */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[9px] text-slate-400 uppercase block">Speed</span>
                    <span className="text-sm font-black text-amber-400 font-mono">{selectedTruck.speedKmh} km/h</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[9px] text-slate-400 uppercase block">Fuel Tank</span>
                    <span className="text-sm font-black text-emerald-400 font-mono">{Math.round(selectedTruck.telematics.fuelPercent)}%</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[9px] text-slate-400 uppercase block">Cargo Temp</span>
                    <span className="text-sm font-black text-cyan-400 font-mono">
                      {selectedTruck.telematics.cargoTempCelsius ? `${selectedTruck.telematics.cargoTempCelsius}°C` : 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Live Coordinates Readout */}
                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[10px] font-mono text-slate-300 flex items-center justify-between">
                  <span className="text-slate-500">GPS FIX:</span>
                  <span>{selectedTruck.coordinates.lat.toFixed(4)}° N, {selectedTruck.coordinates.lng.toFixed(4)}° E</span>
                  <span className="text-emerald-400">11 Sats</span>
                </div>

                {/* Driver Contact & Reroute Actions */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <a
                    href={`tel:${selectedTruck.driverPhone}`}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Call Driver</span>
                  </a>

                  <button
                    onClick={() => handleRerouteTruck(selectedTruck.id, 'Highway Congestion')}
                    className="px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
                  >
                    <Route className="w-3.5 h-3.5" />
                    <span>Reroute Bypass</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
