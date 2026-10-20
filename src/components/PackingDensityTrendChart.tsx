import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Legend
} from 'recharts';
import {
  TrendingUp,
  Gauge,
  Box,
  Minimize2,
  Sparkles,
  RotateCcw,
  Zap,
  Info,
  CheckCircle2,
  Layers,
  ArrowUpRight,
  Sliders,
  History
} from 'lucide-react';
import { PackingDensityTrendPoint } from '../types';

interface PackingDensityTrendChartProps {
  trendHistory: PackingDensityTrendPoint[];
  currentScore: number;
  currentVoidCbm: number;
  totalCbm: number;
  onResetTrend?: () => void;
  onSimulateStep?: () => void;
  title?: string;
  subtitle?: string;
  className?: string;
}

export const PackingDensityTrendChart: React.FC<PackingDensityTrendChartProps> = ({
  trendHistory,
  currentScore,
  currentVoidCbm,
  totalCbm,
  onResetTrend,
  onSimulateStep,
  title = "Packing Density Trend & Session Efficiency",
  subtitle = "Real-time telematics tracking how your space utilization and void-fill compaction improve across this planning session.",
  className = ""
}) => {
  const [viewMode, setViewMode] = useState<'density' | 'void' | 'combined'>('combined');
  const [showLogModal, setShowLogModal] = useState<boolean>(false);

  // Baseline is first point in history
  const baselinePoint = trendHistory[0] || {
    densityScore: 72,
    voidSpaceCbm: 1.65,
    totalCbm: 10.4,
    action: 'Initial Standard Manifest'
  };

  const initialScore = baselinePoint.densityScore;
  const initialVoidCbm = baselinePoint.voidSpaceCbm;
  
  const scoreDiff = currentScore - initialScore;
  const voidSavedCbm = Math.max(0, parseFloat((initialVoidCbm - currentVoidCbm).toFixed(2)));

  // Custom Recharts Tooltip
  const CustomTrendTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data: PackingDensityTrendPoint = payload[0].payload;
      return (
        <div className="bg-slate-950/95 border border-emerald-500/40 p-3.5 rounded-2xl shadow-2xl backdrop-blur-md text-xs space-y-2 max-w-xs animate-fade-in">
          <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
            <span className="text-[10px] font-black uppercase text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              Step {data.step} • {data.timestamp}
            </span>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">
              {data.efficiencyGain >= 0 ? `+${data.efficiencyGain}% Boost` : `${data.efficiencyGain}%`}
            </span>
          </div>

          <div>
            <h5 className="font-bold text-white text-xs leading-snug">
              {data.action}
            </h5>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Milestone: {data.label}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-900 text-[11px]">
            <div className="bg-slate-900/90 p-2 rounded-xl">
              <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-bold">Density Score</span>
              <span className="font-mono font-black text-[#83b735] text-sm">
                {data.densityScore}%
              </span>
            </div>

            <div className="bg-slate-900/90 p-2 rounded-xl">
              <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-bold">Void Space</span>
              <span className="font-mono font-black text-sky-400 text-sm">
                ~{data.voidSpaceCbm} CBM
              </span>
            </div>
          </div>

          {data.cbmSaved > 0 && (
            <div className="text-[10px] text-amber-300 flex items-center gap-1 font-medium bg-amber-500/10 p-1.5 rounded-lg border border-amber-500/20">
              <Zap className="w-3 h-3 text-amber-400 shrink-0" />
              <span>Cumulative ~{data.cbmSaved} CBM air pockets eliminated</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`bg-gradient-to-br from-[#0c2415] via-slate-900 to-slate-950 border border-emerald-600/40 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-6 relative overflow-hidden ${className}`}>
      
      {/* Decorative ambient aura */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header & Session Telematics Summary */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-[#83b735] bg-[#83b735]/15 border border-[#83b735]/30 px-2.5 py-0.5 rounded-full">
              <TrendingUp className="w-3 h-3 text-[#83b735]" />
              <span>Session Telematics</span>
            </span>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700/80">
              {trendHistory.length} Optimization {trendHistory.length === 1 ? 'Milestone' : 'Milestones'} Logged
            </span>
            {scoreDiff > 0 && (
              <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 rounded-full animate-pulse">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>+{scoreDiff}% Efficiency Gain</span>
              </span>
            )}
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>{title}</span>
          </h3>

          <p className="text-xs text-slate-300 leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* View Switcher Tabs & Simulation Trigger */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <div className="bg-slate-950/90 border border-slate-800 p-1 rounded-2xl flex items-center gap-1 shadow-inner">
            <button
              type="button"
              onClick={() => setViewMode('combined')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'combined'
                  ? 'bg-gradient-to-r from-amber-500 to-[#83b735] text-slate-950 font-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Tri-Metric</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('density')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'density'
                  ? 'bg-[#83b735] text-slate-950 font-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Gauge className="w-3.5 h-3.5" />
              <span>Density Curve (%)</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('void')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'void'
                  ? 'bg-sky-400 text-slate-950 font-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Minimize2 className="w-3.5 h-3.5" />
              <span>Void Space (CBM)</span>
            </button>
          </div>

          {onSimulateStep && (
            <button
              type="button"
              onClick={onSimulateStep}
              className="bg-slate-900 hover:bg-slate-800 border border-emerald-500/40 text-emerald-300 hover:text-white font-bold text-xs px-3.5 py-2 rounded-2xl transition-all shadow-md flex items-center gap-1.5 active:scale-95"
              title="Test a simulated carton compaction step"
            >
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span>Simulate Step</span>
            </button>
          )}

          {onResetTrend && (
            <button
              type="button"
              onClick={onResetTrend}
              className="p-2 text-slate-400 hover:text-white bg-slate-950 border border-slate-800 hover:bg-slate-800 rounded-2xl transition-colors"
              title="Reset session trend baseline"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs relative z-10">
        {/* Metric 1: Starting Baseline */}
        <div className="bg-slate-950/80 border border-slate-800/90 rounded-2xl p-3.5 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Session Baseline</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-slate-300 font-mono">{initialScore}%</span>
            <span className="text-[10px] text-slate-400">Score</span>
          </div>
          <span className="text-[10px] text-slate-400 truncate block">
            Initial Void: ~{initialVoidCbm} CBM
          </span>
        </div>

        {/* Metric 2: Current Score */}
        <div className="bg-slate-950/80 border border-emerald-600/40 rounded-2xl p-3.5 space-y-1">
          <span className="text-[10px] uppercase font-bold text-[#83b735] block tracking-wider">Current Score</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-[#83b735] font-mono">{currentScore}%</span>
            <span className="text-[10px] font-bold text-emerald-400">
              {currentScore >= 88 ? 'Optimal' : currentScore >= 78 ? 'Balanced' : 'Suboptimal'}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 truncate block">
            Remaining Void: ~{currentVoidCbm} CBM
          </span>
        </div>

        {/* Metric 3: Net Compaction Gain */}
        <div className="bg-slate-950/80 border border-amber-500/40 rounded-2xl p-3.5 space-y-1">
          <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wider">Net Efficiency Gain</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
              {scoreDiff >= 0 ? `+${scoreDiff}%` : `${scoreDiff}%`}
            </span>
            <ArrowUpRight className="w-4 h-4 text-amber-400 self-center" />
          </div>
          <span className="text-[10px] text-slate-400 truncate block">
            Cumulative improvement
          </span>
        </div>

        {/* Metric 4: Void Air Pockets Compressed */}
        <div className="bg-slate-950/80 border border-sky-500/40 rounded-2xl p-3.5 space-y-1">
          <span className="text-[10px] uppercase font-bold text-sky-400 block tracking-wider">Void Compressed</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-sky-400 font-mono">
              ~{voidSavedCbm}
            </span>
            <span className="text-[10px] font-bold text-sky-300">CBM Saved</span>
          </div>
          <span className="text-[10px] text-slate-400 truncate block">
            Air pocket dead space eliminated
          </span>
        </div>
      </div>

      {/* Recharts Trend Chart Container */}
      <div className="bg-slate-950/90 border border-slate-800/90 rounded-2xl p-4 sm:p-5 relative z-10 space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-900 pb-2.5">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5 text-slate-300 font-bold">
              <span className="w-3 h-3 rounded-full bg-[#83b735]" />
              <span>Packing Density Score (%)</span>
            </span>

            {(viewMode === 'void' || viewMode === 'combined') && (
              <span className="flex items-center gap-1.5 text-sky-400 font-bold">
                <span className="w-3 h-3 rounded-full bg-sky-400" />
                <span>Void Space Air Pockets (CBM)</span>
              </span>
            )}

            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-3 h-0.5 bg-emerald-400 border-t border-dashed" />
              <span>ISO High-Density Target (88%)</span>
            </span>
          </div>

          <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
            Active Session Timeline
          </span>
        </div>

        <div className="h-64 sm:h-72 w-full pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={trendHistory}
              margin={{ top: 12, right: viewMode === 'combined' ? 24 : 16, left: -10, bottom: 4 }}
            >
              <defs>
                {/* Density Area Gradient */}
                <linearGradient id="densityScoreGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#83b735" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#0f2e1b" stopOpacity={0.02} />
                </linearGradient>

                {/* Void Space Area Gradient */}
                <linearGradient id="voidCbmGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#0369a1" stopOpacity={0.02} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />

              <XAxis
                dataKey="label"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
              />

              {/* Primary Left Y-Axis: Density Score % */}
              <YAxis
                yAxisId="left"
                stroke="#94a3b8"
                fontSize={11}
                domain={[55, 100]}
                tickFormatter={(val) => `${val}%`}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
              />

              {/* Secondary Right Y-Axis: Void CBM (in combined mode) */}
              {viewMode === 'combined' && (
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#38bdf8"
                  fontSize={11}
                  domain={[0, 2.5]}
                  tickFormatter={(val) => `${val.toFixed(1)}m³`}
                  tickLine={false}
                  axisLine={{ stroke: '#0369a1' }}
                />
              )}

              <Tooltip content={<CustomTrendTooltip />} />

              {/* Reference Benchmarks */}
              <ReferenceLine
                yAxisId="left"
                y={88}
                stroke="#83b735"
                strokeDasharray="4 4"
                label={{
                  value: 'ISO Target 88%',
                  position: 'insideTopRight',
                  fill: '#83b735',
                  fontSize: 10,
                  fontWeight: 'bold'
                }}
              />

              <ReferenceLine
                yAxisId="left"
                y={75}
                stroke="#f59e0b"
                strokeDasharray="4 4"
                opacity={0.6}
                label={{
                  value: 'Baseline 75%',
                  position: 'insideBottomLeft',
                  fill: '#f59e0b',
                  fontSize: 9
                }}
              />

              {/* Series 1: Packing Density Score (%) */}
              {(viewMode === 'density' || viewMode === 'combined') && (
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="densityScore"
                  name="Packing Density (%)"
                  stroke="#83b735"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#densityScoreGrad)"
                  dot={{ r: 4, fill: '#83b735', stroke: '#0f2e1b', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#fef08a', stroke: '#83b735', strokeWidth: 2 }}
                />
              )}

              {/* Series 2: Void Air Space (CBM) */}
              {viewMode === 'combined' && (
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="voidSpaceCbm"
                  name="Void Air Pockets (CBM)"
                  stroke="#38bdf8"
                  strokeWidth={2.5}
                  strokeDasharray="4 4"
                  dot={{ r: 3, fill: '#38bdf8' }}
                  activeDot={{ r: 5, fill: '#bae6fd' }}
                />
              )}

              {viewMode === 'void' && (
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="voidSpaceCbm"
                  name="Void Air Pockets (CBM)"
                  stroke="#38bdf8"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#voidCbmGrad)"
                  dot={{ r: 4, fill: '#38bdf8', stroke: '#0284c7', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#bae6fd', stroke: '#0284c7', strokeWidth: 2 }}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Milestone Steps Timeline Pill Strip */}
        <div className="pt-2 border-t border-slate-900 flex items-center justify-between gap-2 overflow-x-auto text-[11px] text-slate-400">
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 whitespace-nowrap">Session Trail:</span>
            {trendHistory.map((pt, idx) => (
              <span
                key={pt.id || idx}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-bold whitespace-nowrap border transition-all ${
                  idx === trendHistory.length - 1
                    ? 'bg-[#83b735]/20 text-[#83b735] border-[#83b735]/40 font-black'
                    : 'bg-slate-900/90 text-slate-300 border-slate-800'
                }`}
                title={`${pt.action} (${pt.timestamp})`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                <span>{pt.label}</span>
                <span className="font-mono text-white">({pt.densityScore}%)</span>
              </span>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowLogModal(!showLogModal)}
            className="text-amber-400 hover:text-amber-300 font-bold whitespace-nowrap text-[11px] flex items-center gap-1 shrink-0 ml-2"
          >
            <History className="w-3.5 h-3.5" />
            <span>{showLogModal ? 'Hide Log' : 'View Action Log'}</span>
          </button>
        </div>

        {/* Expandable Action Audit Log */}
        {showLogModal && (
          <div className="mt-3 p-4 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-2.5 animate-fade-in text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-white flex items-center gap-1.5">
                <History className="w-4 h-4 text-amber-400" />
                <span>Optimization Sequence History</span>
              </span>
              <span className="text-[10px] text-slate-400">Timestamped chronologically</span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {trendHistory.map((step) => (
                <div
                  key={step.id}
                  className="bg-slate-950 p-2.5 rounded-xl border border-slate-850 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-mono font-bold text-amber-400 shrink-0">
                      {step.step}
                    </span>
                    <div className="min-w-0">
                      <p className="font-bold text-white truncate text-xs">{step.action}</p>
                      <p className="text-[10px] text-slate-400">{step.timestamp} • {step.label}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 font-mono text-xs">
                    <span className="text-[#83b735] font-bold">{step.densityScore}% Density</span>
                    <span className="text-sky-400">~{step.voidSpaceCbm} CBM</span>
                    <span className="text-amber-400 font-bold">
                      {step.efficiencyGain >= 0 ? `+${step.efficiencyGain}%` : `${step.efficiencyGain}%`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
