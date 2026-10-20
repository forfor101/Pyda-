import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  LineChart,
  BarChart,
  AreaChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Cell
} from 'recharts';
import {
  Truck,
  Gauge,
  Fuel,
  TrendingUp,
  Calendar,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  RotateCw,
  Navigation,
  Info,
  Layers,
  Sparkles,
  MapPin,
  Clock,
  Compass
} from 'lucide-react';

interface ActiveFleetPerformanceSummaryProps {
  investorName?: string;
  investorCompany?: string;
}

// Managed trucks data structure
interface ManagedTruckTelemetry {
  plateNumber: string;
  makeModel: string;
  tonnage: number;
  category: string;
  driverName: string;
  currentOdometerKm: number;
  lastServiceKm: number;
  nextServiceKm: number;
  status: 'in_transit' | 'scheduled_loading' | 'maintenance_bay' | 'ready_standby';
  currentCorridor: string;
  healthScore: number;
  avgUtilizationPercent: number;
  totalKmCovered: number;
  avgFuelEconomyKmL: number;
  fuelBenchmarkKmL: number;
}

const MANAGED_TRUCKS: ManagedTruckTelemetry[] = [
  {
    plateNumber: 'LSR-442-XY',
    makeModel: 'Mercedes-Benz Atego 1523 Box Body',
    tonnage: 15,
    category: 'Medium-Heavy Freight Box',
    driverName: 'Ibrahim Danladi (Class-A Heavy Haul Certified)',
    currentOdometerKm: 144820,
    lastServiceKm: 140000,
    nextServiceKm: 150000,
    status: 'in_transit',
    currentCorridor: 'Lagos ➔ Abuja Corridor (Approaching Lokoja Expressway)',
    healthScore: 98,
    avgUtilizationPercent: 91.4,
    totalKmCovered: 29850,
    avgFuelEconomyKmL: 4.22,
    fuelBenchmarkKmL: 4.0,
  },
  {
    plateNumber: 'KJA-883-AB',
    makeModel: 'Mack Granite Semi-Trailer (40ft High Cube)',
    tonnage: 30,
    category: 'Heavy Articulated Hauler',
    driverName: 'Emmanuel Okafor (Trans-Nigeria Interstate Lead)',
    currentOdometerKm: 198420,
    lastServiceKm: 195000,
    nextServiceKm: 205000,
    status: 'scheduled_loading',
    currentCorridor: 'Apapa Port Pier 4 Terminal (Lagos South-West Hub)',
    healthScore: 96,
    avgUtilizationPercent: 86.8,
    totalKmCovered: 23970,
    avgFuelEconomyKmL: 2.74,
    fuelBenchmarkKmL: 2.6,
  },
];

// Historical monthly trend data (April - September 2026)
const MONTHLY_FLEET_DATA = [
  {
    month: 'Apr 26',
    kmTotal: 8450,
    kmLsr: 4750,
    kmKja: 3700,
    utilizationTotal: 82.5,
    utilizationLsr: 86.0,
    utilizationKja: 79.0,
    targetUtilization: 85.0,
    fuelEconomyTotal: 3.38,
    fuelEconomyLsr: 4.10,
    fuelEconomyKja: 2.65,
    benchmarkFuel: 3.30,
    dieselConsumedLiters: 2500,
    dieselCostNaira: 3250000,
    tripsCount: 11,
  },
  {
    month: 'May 26',
    kmTotal: 9200,
    kmLsr: 5200,
    kmKja: 4000,
    utilizationTotal: 85.0,
    utilizationLsr: 88.5,
    utilizationKja: 81.5,
    targetUtilization: 85.0,
    fuelEconomyTotal: 3.42,
    fuelEconomyLsr: 4.15,
    fuelEconomyKja: 2.68,
    benchmarkFuel: 3.30,
    dieselConsumedLiters: 2690,
    dieselCostNaira: 3497000,
    tripsCount: 12,
  },
  {
    month: 'Jun 26',
    kmTotal: 9940,
    kmLsr: 5640,
    kmKja: 4300,
    utilizationTotal: 88.2,
    utilizationLsr: 92.0,
    utilizationKja: 84.4,
    targetUtilization: 85.0,
    fuelEconomyTotal: 3.46,
    fuelEconomyLsr: 4.20,
    fuelEconomyKja: 2.72,
    benchmarkFuel: 3.30,
    dieselConsumedLiters: 2872,
    dieselCostNaira: 3733600,
    tripsCount: 13,
  },
  {
    month: 'Jul 26',
    kmTotal: 10850,
    kmLsr: 6150,
    kmKja: 4700,
    utilizationTotal: 91.5,
    utilizationLsr: 94.0,
    utilizationKja: 89.0,
    targetUtilization: 85.0,
    fuelEconomyTotal: 3.51,
    fuelEconomyLsr: 4.26,
    fuelEconomyKja: 2.76,
    benchmarkFuel: 3.30,
    dieselConsumedLiters: 3091,
    dieselCostNaira: 4018300,
    tripsCount: 14,
  },
  {
    month: 'Aug 26',
    kmTotal: 11220,
    kmLsr: 6420,
    kmKja: 4800,
    utilizationTotal: 92.8,
    utilizationLsr: 95.2,
    utilizationKja: 90.4,
    targetUtilization: 85.0,
    fuelEconomyTotal: 3.55,
    fuelEconomyLsr: 4.30,
    fuelEconomyKja: 2.80,
    benchmarkFuel: 3.30,
    dieselConsumedLiters: 3160,
    dieselCostNaira: 4108000,
    tripsCount: 15,
  },
  {
    month: 'Sep 26 (MTD)',
    kmTotal: 4160,
    kmLsr: 2390,
    kmKja: 1770,
    utilizationTotal: 89.6,
    utilizationLsr: 92.5,
    utilizationKja: 86.7,
    targetUtilization: 85.0,
    fuelEconomyTotal: 3.53,
    fuelEconomyLsr: 4.28,
    fuelEconomyKja: 2.78,
    benchmarkFuel: 3.30,
    dieselConsumedLiters: 1178,
    dieselCostNaira: 1531400,
    tripsCount: 6,
  },
];

// Weekly breakdown for the latest 30 days
const RECENT_WEEKS_DATA = [
  { week: 'Week 1 (Aug 15-21)', kmTotal: 2780, kmLsr: 1590, kmKja: 1190, utilization: 93.4, fuelEconomy: 3.54 },
  { week: 'Week 2 (Aug 22-28)', kmTotal: 2840, kmLsr: 1630, kmKja: 1210, utilization: 94.2, fuelEconomy: 3.56 },
  { week: 'Week 3 (Aug 29-Sep 4)', kmTotal: 2910, kmLsr: 1680, kmKja: 1230, utilization: 95.0, fuelEconomy: 3.58 },
  { week: 'Week 4 (Sep 5-11)', kmTotal: 2650, kmLsr: 1520, kmKja: 1130, utilization: 90.8, fuelEconomy: 3.52 },
];

// Corridor haulage performance
const CORRIDOR_PERFORMANCE = [
  { route: 'Lagos ➔ Abuja (Idu Corridor)', trips: 16, distanceKm: 12160, sharePercent: 32, avgFuel: 3.65, onTime: 99.4 },
  { route: 'Lagos ➔ Kano (Sharada Terminal)', trips: 10, distanceKm: 10400, sharePercent: 27, avgFuel: 3.38, onTime: 98.8 },
  { route: 'Lagos ➔ Port Harcourt (Trans-Amadi)', trips: 9, distanceKm: 5490, sharePercent: 15, avgFuel: 3.44, onTime: 99.0 },
  { route: 'Ibadan ➔ Abuja Express', trips: 8, distanceKm: 4960, sharePercent: 14, avgFuel: 3.72, onTime: 100.0 },
  { route: 'Onitsha ➔ Kaduna Railhead', trips: 6, distanceKm: 4620, sharePercent: 12, avgFuel: 3.30, onTime: 98.5 },
];

export const ActiveFleetPerformanceSummary: React.FC<ActiveFleetPerformanceSummaryProps> = ({
  investorName = 'Chief Adebayo Alabi',
  investorCompany = 'Alabi Prime Logistics Ltd',
}) => {
  // Filter States
  const [selectedTruck, setSelectedTruck] = useState<'all' | 'LSR-442-XY' | 'KJA-883-AB'>('all');
  const [timeRange, setTimeRange] = useState<'6months' | 'recent_weeks'>('6months');
  const [chartFocus, setChartFocus] = useState<'all' | 'utilization' | 'kilometers' | 'fuel'>('all');

  // Aggregated Totals
  const totalKmCombined = useMemo(() => {
    if (selectedTruck === 'LSR-442-XY') return 29850;
    if (selectedTruck === 'KJA-883-AB') return 23970;
    return 53820;
  }, [selectedTruck]);

  const avgUtilizationCombined = useMemo(() => {
    if (selectedTruck === 'LSR-442-XY') return 91.4;
    if (selectedTruck === 'KJA-883-AB') return 86.8;
    return 89.1;
  }, [selectedTruck]);

  const avgFuelCombined = useMemo(() => {
    if (selectedTruck === 'LSR-442-XY') return 4.22;
    if (selectedTruck === 'KJA-883-AB') return 2.74;
    return 3.48;
  }, [selectedTruck]);

  // Chart datasets adjusted based on selected truck
  const displayMonthlyData = useMemo(() => {
    return MONTHLY_FLEET_DATA.map((d) => {
      let km = d.kmTotal;
      let util = d.utilizationTotal;
      let fuel = d.fuelEconomyTotal;
      let benchmark = 3.30;

      if (selectedTruck === 'LSR-442-XY') {
        km = d.kmLsr;
        util = d.utilizationLsr;
        fuel = d.fuelEconomyLsr;
        benchmark = 4.00;
      } else if (selectedTruck === 'KJA-883-AB') {
        km = d.kmKja;
        util = d.utilizationKja;
        fuel = d.fuelEconomyKja;
        benchmark = 2.60;
      }

      return {
        ...d,
        activeKm: km,
        activeUtilization: util,
        activeFuel: fuel,
        activeBenchmark: benchmark,
      };
    });
  }, [selectedTruck]);

  // Tooltip Styler
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-950/95 border border-slate-700/80 rounded-2xl p-3.5 shadow-2xl backdrop-blur-md text-xs space-y-1.5 min-w-[200px]">
          <div className="font-extrabold text-white border-b border-slate-800 pb-1 flex items-center justify-between">
            <span>{label}</span>
            <span className="text-[10px] text-amber-400 font-mono">Telematics Verified</span>
          </div>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span
                  className="w-2.5 h-2.5 rounded-sm inline-block"
                  style={{ backgroundColor: entry.color || entry.fill || entry.stroke }}
                />
                <span>{entry.name}:</span>
              </span>
              <span className="font-bold font-mono text-white">
                {typeof entry.value === 'number'
                  ? entry.name.toLowerCase().includes('rate') || entry.name.toLowerCase().includes('utilization')
                    ? `${entry.value.toFixed(1)}%`
                    : entry.name.toLowerCase().includes('km')
                    ? `${entry.value.toLocaleString()} km`
                    : entry.name.toLowerCase().includes('fuel') || entry.name.toLowerCase().includes('efficiency')
                    ? `${entry.value.toFixed(2)} km/L`
                    : entry.value.toLocaleString()
                  : entry.value}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6" id="active-fleet-performance-summary">
      {/* ========================================================================= */}
      {/* SECTION HEADER & CONTROL BAR */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-slate-800/90 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Title & Metadata */}
          <div className="flex items-start gap-4">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-slate-950 flex items-center justify-center shrink-0 shadow-xl shadow-amber-500/20 ring-4 ring-amber-500/10">
              <Gauge className="w-7 h-7 stroke-[2.4]" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Active Fleet Performance & Telematics
                </h3>
                <span className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Live GPS Geofence Synchronized</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                Real-time operational summary for <strong className="text-slate-200">{investorCompany}</strong> ({investorName}). Telematics feed monitoring active truck utilization, cumulative kilometers covered across Nigerian corridors, and fuel efficiency trends.
              </p>
            </div>
          </div>

          {/* Interactive Truck & Range Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-center">
            {/* Truck Selector Pill */}
            <div className="bg-slate-900 border border-slate-800 p-1 rounded-xl flex items-center gap-1 shadow-inner">
              <button
                type="button"
                onClick={() => setSelectedTruck('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedTruck === 'all'
                    ? 'bg-amber-500 text-slate-950 font-black shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All Fleet (2 Trucks)
              </button>
              <button
                type="button"
                onClick={() => setSelectedTruck('LSR-442-XY')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedTruck === 'LSR-442-XY'
                    ? 'bg-amber-500 text-slate-950 font-black shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Mercedes-Benz Atego 1523 (15 Ton)"
              >
                LSR-442-XY (15T)
              </button>
              <button
                type="button"
                onClick={() => setSelectedTruck('KJA-883-AB')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedTruck === 'KJA-883-AB'
                    ? 'bg-amber-500 text-slate-950 font-black shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Mack Granite Heavy Hauler (30 Ton)"
              >
                KJA-883-AB (30T)
              </button>
            </div>

            {/* Time Period Filter */}
            <div className="bg-slate-900 border border-slate-800 p-1 rounded-xl flex items-center gap-1 shadow-inner">
              <button
                type="button"
                onClick={() => setTimeRange('6months')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  timeRange === '6months'
                    ? 'bg-slate-800 text-amber-400 shadow-sm border border-amber-400/30 font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                6-Month Trend
              </button>
              <button
                type="button"
                onClick={() => setTimeRange('recent_weeks')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  timeRange === 'recent_weeks'
                    ? 'bg-slate-800 text-amber-400 shadow-sm border border-amber-400/30 font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Last 30 Days (Weekly)
              </button>
            </div>
          </div>
        </div>

        {/* 4 Telematics High-Impact KPI Stat Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/80">
          {/* Card 1: Utilization Rate */}
          <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 relative group hover:border-amber-500/40 transition-all">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Avg Utilization Rate</span>
              <Gauge className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-black text-white font-mono">
                {avgUtilizationCombined}%
              </span>
              <span className="text-xs font-extrabold text-emerald-400 flex items-center gap-0.5">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>+4.1%</span>
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] mt-2 text-slate-400">
              <span>Target: 85.0% threshold</span>
              <span className="text-emerald-400 font-bold font-mono">Optimal</span>
            </div>
            {/* Visual Progress Bar */}
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(avgUtilizationCombined, 100)}%` }}
              />
            </div>
          </div>

          {/* Card 2: Total Kilometers */}
          <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 relative group hover:border-sky-500/40 transition-all">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Total Distance Traversed</span>
              <Navigation className="w-4 h-4 text-sky-400" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-black text-white font-mono">
                {totalKmCombined.toLocaleString()}
              </span>
              <span className="text-xs font-extrabold text-sky-400">KM</span>
            </div>
            <div className="flex items-center justify-between text-[11px] mt-2 text-slate-400">
              <span>100% Commercial Haulage</span>
              <span className="text-sky-400 font-bold">52 Completed Trips</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-sky-400 h-full rounded-full transition-all duration-500"
                style={{ width: '92%' }}
              />
            </div>
          </div>

          {/* Card 3: Fuel Efficiency */}
          <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 relative group hover:border-emerald-500/40 transition-all">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Composite Fuel Economy</span>
              <Fuel className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-black text-emerald-400 font-mono">
                {avgFuelCombined}
              </span>
              <span className="text-xs font-bold text-slate-300">KM / Liter</span>
            </div>
            <div className="flex items-center justify-between text-[11px] mt-2 text-slate-400">
              <span>Benchmark: 3.30 km/L</span>
              <span className="text-emerald-400 font-bold font-mono">+5.4% Eco-Score</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: '88%' }}
              />
            </div>
          </div>

          {/* Card 4: Fleet Health & Maintenance Compliance */}
          <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 relative group hover:border-purple-500/40 transition-all">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Fleet Health & Compliance</span>
              <ShieldCheck className="w-4 h-4 text-purple-400" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-black text-white font-mono">
                97.2%
              </span>
              <span className="text-xs font-bold text-purple-300">Certified</span>
            </div>
            <div className="flex items-center justify-between text-[11px] mt-2 text-slate-400">
              <span>Next PM: ~3,180 km</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> 0 Faults
              </span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-purple-400 h-full rounded-full transition-all duration-500"
                style={{ width: '97%' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CHART FOCUS NAVIGATOR (TABS TO HIGHLIGHT UTILIZATION, KM, OR FUEL) */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1.5 rounded-2xl">
          <button
            type="button"
            onClick={() => setChartFocus('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              chartFocus === 'all'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Full Tri-Metric Overview</span>
          </button>
          <button
            type="button"
            onClick={() => setChartFocus('utilization')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              chartFocus === 'utilization'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Gauge className="w-3.5 h-3.5" />
            <span>Utilization Rates (%)</span>
          </button>
          <button
            type="button"
            onClick={() => setChartFocus('kilometers')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              chartFocus === 'kilometers'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Kilometers Traversed</span>
          </button>
          <button
            type="button"
            onClick={() => setChartFocus('fuel')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              chartFocus === 'fuel'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Fuel className="w-3.5 h-3.5" />
            <span>Fuel Efficiency (km/L)</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Showing data for: <strong className="text-white font-mono">{selectedTruck === 'all' ? 'All Managed Trucks' : selectedTruck}</strong></span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* RECHARTS VISUALIZATION 1: TRUCK UTILIZATION RATE TRENDS (%) */}
      {/* ========================================================================= */}
      {(chartFocus === 'all' || chartFocus === 'utilization') && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-400 animate-pulse" />
                <h4 className="text-base sm:text-lg font-black text-white">
                  Truck Utilization Rate vs Target Benchmark (85%)
                </h4>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Evaluates active transit & revenue cargo days vs scheduled loading and idle capacity. Target threshold is 85%.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-3 h-3 rounded bg-amber-400" />
                <span>Actual Utilization (%)</span>
              </span>
              <span className="flex items-center gap-1.5 text-rose-400">
                <span className="w-3.5 h-0.5 bg-rose-400 inline-block border-t border-dashed" />
                <span>Target (85%)</span>
              </span>
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={displayMonthlyData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="utilizationGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                <XAxis
                  dataKey="month"
                  stroke="#94A3B8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#475569' }}
                />
                <YAxis
                  stroke="#94A3B8"
                  fontSize={11}
                  domain={[60, 100]}
                  tickFormatter={(val) => `${val}%`}
                  tickLine={false}
                  axisLine={{ stroke: '#475569' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine
                  y={85}
                  stroke="#EF4444"
                  strokeDasharray="4 4"
                  label={{ value: 'Target 85%', position: 'insideTopRight', fill: '#EF4444', fontSize: 10, fontWeight: 'bold' }}
                />
                <Area
                  type="monotone"
                  dataKey="activeUtilization"
                  name="Utilization Rate"
                  stroke="#F59E0B"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#utilizationGrad)"
                />
                {selectedTruck === 'all' && (
                  <>
                    <Line
                      type="monotone"
                      dataKey="utilizationLsr"
                      name="LSR-442-XY (15T)"
                      stroke="#38BDF8"
                      strokeWidth={2}
                      dot={{ r: 3, fill: '#38BDF8' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="utilizationKja"
                      name="KJA-883-AB (30T)"
                      stroke="#A855F7"
                      strokeWidth={2}
                      dot={{ r: 3, fill: '#A855F7' }}
                    />
                  </>
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between">
              <span className="text-slate-400">Peak Month:</span>
              <span className="font-bold text-white font-mono">August 2026 (92.8%)</span>
            </div>
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between">
              <span className="text-slate-400">Average Turnaround:</span>
              <span className="font-bold text-emerald-400 font-mono">2.8 Days / Interstate Loop</span>
            </div>
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between">
              <span className="text-slate-400">Downtime Index:</span>
              <span className="font-bold text-emerald-400 font-mono">2.4% (Scheduled Lube Only)</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* RECHARTS VISUALIZATION 2: TOTAL KILOMETERS COVERED */}
      {/* ========================================================================= */}
      {(chartFocus === 'all' || chartFocus === 'kilometers') && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-sky-400 animate-pulse" />
                <h4 className="text-base sm:text-lg font-black text-white">
                  Total Kilometers Covered (Interstate Corridor Transit)
                </h4>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Monthly distance logged across interstate haulage routes, tracked with live geofenced telemetry.
              </p>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="bg-sky-500/10 text-sky-400 border border-sky-500/30 px-2.5 py-1 rounded-lg font-bold">
                Cumulative: {totalKmCombined.toLocaleString()} KM
              </span>
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              {selectedTruck === 'all' ? (
                <BarChart data={displayMonthlyData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                  <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickFormatter={(val) => `${val.toLocaleString()} km`} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar dataKey="kmLsr" name="LSR-442-XY (15T Atego)" fill="#38BDF8" radius={[4, 4, 0, 0]} stackId="a" />
                  <Bar dataKey="kmKja" name="KJA-883-AB (30T Mack)" fill="#A855F7" radius={[4, 4, 0, 0]} stackId="a" />
                </BarChart>
              ) : (
                <BarChart data={displayMonthlyData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                  <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickFormatter={(val) => `${val.toLocaleString()} km`} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="activeKm" name="Monthly Kilometers" fill="#0284C7" radius={[6, 6, 0, 0]}>
                    {displayMonthlyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === displayMonthlyData.length - 2 ? '#38BDF8' : '#0284C7'} />
                    ))}
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Corridor Distribution Quick Tags */}
          <div className="pt-2 border-t border-slate-800/80">
            <p className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-sky-400" />
              <span>Primary Interstate Corridor Distribution</span>
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
              {CORRIDOR_PERFORMANCE.map((c) => (
                <div key={c.route} className="bg-slate-950/60 border border-slate-800 rounded-xl p-2.5 space-y-1">
                  <p className="text-[11px] font-bold text-white truncate" title={c.route}>{c.route}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>{c.distanceKm.toLocaleString()} km</span>
                    <span className="text-sky-400 font-bold">{c.sharePercent}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* RECHARTS VISUALIZATION 3: FUEL EFFICIENCY TRENDS (KM/L) */}
      {/* ========================================================================= */}
      {(chartFocus === 'all' || chartFocus === 'fuel') && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                <h4 className="text-base sm:text-lg font-black text-white">
                  Fuel Efficiency Trends (Kilometers per Liter - km/L)
                </h4>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Diesel consumption telemetry benchmarked against speed governor caps (75-80 km/h) and load weight curves.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-emerald-400 font-mono font-bold">
                Fleet Average: {avgFuelCombined} km/L
              </span>
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full text-[10px] font-bold">
                +4.8% vs Standard Envelope
              </span>
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={displayMonthlyData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#94A3B8"
                  fontSize={11}
                  domain={[2.0, 5.0]}
                  tickFormatter={(val) => `${val.toFixed(1)}`}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                
                {selectedTruck === 'all' ? (
                  <>
                    <ReferenceLine
                      y={3.30}
                      stroke="#94A3B8"
                      strokeDasharray="4 4"
                      label={{ value: 'Fleet Benchmark 3.30 km/L', position: 'insideBottomRight', fill: '#94A3B8', fontSize: 10 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="fuelEconomyTotal"
                      name="Fleet Composite (km/L)"
                      stroke="#10B981"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#10B981' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="fuelEconomyLsr"
                      name="LSR-442-XY (15T Atego)"
                      stroke="#38BDF8"
                      strokeWidth={2}
                      strokeDasharray="2 2"
                      dot={{ r: 3, fill: '#38BDF8' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="fuelEconomyKja"
                      name="KJA-883-AB (30T Mack)"
                      stroke="#F59E0B"
                      strokeWidth={2}
                      strokeDasharray="2 2"
                      dot={{ r: 3, fill: '#F59E0B' }}
                    />
                  </>
                ) : (
                  <>
                    <ReferenceLine
                      y={selectedTruck === 'LSR-442-XY' ? 4.0 : 2.6}
                      stroke="#94A3B8"
                      strokeDasharray="4 4"
                      label={{
                        value: `Target ${selectedTruck === 'LSR-442-XY' ? '4.00' : '2.60'} km/L`,
                        position: 'insideBottomRight',
                        fill: '#94A3B8',
                        fontSize: 10,
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="activeFuel"
                      name={`${selectedTruck} Economy (km/L)`}
                      stroke="#10B981"
                      strokeWidth={3}
                      dot={{ r: 5, fill: '#10B981' }}
                    />
                  </>
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
              <span className="text-slate-400">Total Diesel Consumed (6 Mo):</span>
              <span className="font-bold text-white font-mono">15,491 Liters</span>
            </div>
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
              <span className="text-slate-400">Speed Governor Compliance:</span>
              <span className="font-bold text-emerald-400 font-mono">99.8% (Capped at 80 km/h)</span>
            </div>
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
              <span className="text-slate-400">Fuel Savings vs Baseline:</span>
              <span className="font-bold text-emerald-400 font-mono">₦1,142,000 Saved</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* INDIVIDUAL TRUCK ASSET TELEMETRY CARDS (MANAGEMENT OVERVIEW) */}
      {/* ========================================================================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
            <Truck className="w-5 h-5 text-amber-400" />
            <span>Assigned Trucks Under Management ({MANAGED_TRUCKS.length})</span>
          </h4>
          <span className="text-xs text-slate-400 font-mono">Live In-Cab Telematics Node</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {MANAGED_TRUCKS.map((truck) => {
            const isSelected = selectedTruck === truck.plateNumber || selectedTruck === 'all';
            return (
              <div
                key={truck.plateNumber}
                onClick={() => setSelectedTruck(truck.plateNumber as any)}
                className={`bg-slate-900/95 border rounded-2xl p-5 transition-all cursor-pointer space-y-4 ${
                  selectedTruck === truck.plateNumber
                    ? 'border-amber-400 ring-2 ring-amber-400/20 shadow-xl'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Truck Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-black flex items-center justify-center shrink-0 shadow-md">
                      <Truck className="w-6 h-6 stroke-[2.4]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-black text-white font-mono tracking-wider">
                          {truck.plateNumber}
                        </span>
                        <span className="bg-slate-800 text-amber-400 border border-amber-400/30 text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                          {truck.tonnage} Ton
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 font-semibold">{truck.makeModel}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                        truck.status === 'in_transit'
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          truck.status === 'in_transit' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                        }`}
                      />
                      <span>{truck.status === 'in_transit' ? 'Active In Transit' : 'Scheduled Loading'}</span>
                    </span>
                  </div>
                </div>

                {/* Metrics 3-Col Bar */}
                <div className="grid grid-cols-3 gap-2 bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 text-xs text-center font-mono">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">Utilization</span>
                    <span className="text-sm font-black text-amber-400">{truck.avgUtilizationPercent}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">Distance (6 Mo)</span>
                    <span className="text-sm font-black text-white">{truck.totalKmCovered.toLocaleString()} km</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">Fuel Economy</span>
                    <span className="text-sm font-black text-emerald-400">{truck.avgFuelEconomyKmL} km/L</span>
                  </div>
                </div>

                {/* Corridor and Driver info */}
                <div className="space-y-1.5 text-xs text-slate-400 pt-1 border-t border-slate-800/80">
                  <div className="flex items-center gap-2 truncate">
                    <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="truncate text-slate-200">{truck.currentCorridor}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className="truncate text-slate-400">Driver: {truck.driverName}</span>
                    <span className="text-purple-300 font-bold font-mono">Odometer: {truck.currentOdometerKm.toLocaleString()} km</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
