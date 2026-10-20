import React, { useState, useMemo } from 'react';
import { 
  X, MapPin, Search, Navigation, Building2, Truck, Check, 
  Sparkles, Compass, ArrowRight, Layers, ShieldCheck, Map
} from 'lucide-react';
import { NIGERIAN_STATES_DATA, NigerianState, NigerianLga } from '../data/nigerianStatesLgas';

interface LocationSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetField?: 'origin' | 'destination';
  targetType?: 'origin' | 'destination';
  transitMode: 'intra' | 'inter';
  currentStateId: string;
  currentLgaName: string;
  onSelectLocation: (stateId: string, lgaName: string) => void;
  onSwitchTransitMode?: (mode: 'intra' | 'inter') => void;
  pairedStateId?: string; // For intra-state awareness
}

const GEOPOLITICAL_ZONES = [
  'All',
  'South West',
  'North Central',
  'South South',
  'North West',
  'South East',
  'North East'
] as const;

// Curated high-traffic commercial moving hubs
const POPULAR_HUBS = [
  { stateId: 'lagos', stateName: 'Lagos', lga: 'Eti-Osa (Ikoyi, Victoria Island, Lekki Phase 1, Ajah, Chevron)', label: 'Lagos: Ikoyi / VI / Lekki' },
  { stateId: 'lagos', stateName: 'Lagos', lga: 'Ikeja (GRA, Alausa, Ikeja City Mall, Maryland, Allen)', label: 'Lagos: Ikeja GRA & Alausa' },
  { stateId: 'lagos', stateName: 'Lagos', lga: 'Apapa (Port Wharf, Commercial Marine Hub)', label: 'Lagos: Apapa Commercial Port' },
  { stateId: 'fct', stateName: 'Abuja (FCT)', lga: 'Abuja Municipal (AMAC - Central, Maitama, Wuse, Garki, Asokoro, Jabi, Utako, Guzape)', label: 'Abuja: Central / Maitama / Wuse' },
  { stateId: 'fct', stateName: 'Abuja (FCT)', lga: 'Bwari (Kubwa, Bwari, Dutse, Ushafa, Dawaki, Mpape)', label: 'Abuja: Kubwa / Dawaki Corridor' },
  { stateId: 'rivers', stateName: 'Rivers', lga: 'Obio/Akpor (Trans-Amadi, Rumuokoro, GRA Phase 1-3, Rumuola)', label: 'PH: Trans-Amadi & GRA' },
  { stateId: 'rivers', stateName: 'Rivers', lga: 'Port Harcourt City (Old GRA, Town, Diobu, D-Line)', label: 'PH: Old GRA & D-Line' },
  { stateId: 'kano', stateName: 'Kano', lga: 'Nassarawa (Bompai Industrial Area, Kano GRA)', label: 'Kano: Bompai Industrial / GRA' },
  { stateId: 'oyo', stateName: 'Oyo', lga: 'Ibadan North (Bodija, Agodi GRA, Secretariat)', label: 'Ibadan: Bodija & Agodi GRA' },
  { stateId: 'anambra', stateName: 'Anambra', lga: 'Onitsha North (Main Market Commercial)', label: 'Onitsha: Main Commercial Hub' },
];

export const LocationSelectorModal: React.FC<LocationSelectorModalProps> = ({
  isOpen,
  onClose,
  targetField,
  targetType,
  transitMode,
  currentStateId,
  currentLgaName,
  onSelectLocation,
  onSwitchTransitMode,
  pairedStateId
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedZone, setSelectedZone] = useState<string>('All');
  const [expandedStateId, setExpandedStateId] = useState<string | null>(currentStateId || 'lagos');

  if (!isOpen) return null;

  const resolvedTarget = targetField || targetType || 'origin';
  const isOrigin = resolvedTarget === 'origin';
  const isIntraMode = transitMode === 'intra';

  // Filter states based on Zone and Search Term
  const filteredStates = useMemo(() => {
    return NIGERIAN_STATES_DATA.filter((st) => {
      // If Intra-State mode and picking destination, filter to the paired origin state unless user changes it
      if (isIntraMode && !isOrigin && pairedStateId && st.id !== pairedStateId) {
        // Only show paired state in intra mode unless searched explicitly
        if (!searchTerm.trim()) {
          return false;
        }
      }

      const matchesZone = selectedZone === 'All' || st.zone === selectedZone;
      if (!matchesZone) return false;

      if (!searchTerm.trim()) return true;

      const q = searchTerm.toLowerCase().trim();
      const stateMatch = st.name.toLowerCase().includes(q) || 
                         st.capital.toLowerCase().includes(q) || 
                         st.code.toLowerCase().includes(q);
      const lgaMatch = st.lgas.some((l) => l.name.toLowerCase().includes(q));

      return stateMatch || lgaMatch;
    });
  }, [selectedZone, searchTerm, isIntraMode, isOrigin, pairedStateId]);

  const handleSelect = (stateId: string, lgaName: string) => {
    onSelectLocation(stateId, lgaName);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-slate-900 border border-slate-800 text-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative"
        role="dialog"
        aria-modal="true"
        aria-labelledby="location-selector-title"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/95 sticky top-0 z-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${isOrigin ? 'bg-amber-500 text-slate-950' : 'bg-emerald-500 text-slate-950'} shadow-md`}>
              {isOrigin ? <MapPin className="w-5 h-5" /> : <Navigation className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 id="location-selector-title" className="font-black text-white text-base sm:text-lg">
                  {isOrigin ? 'Pick-Up Origin Location' : 'Drop-Off Destination Location'}
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                  isIntraMode 
                    ? 'bg-blue-500/15 text-blue-300 border-blue-500/30' 
                    : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                }`}>
                  {isIntraMode ? 'Intra-State Mode' : 'Inter-State Mode'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Browse 36 Nigerian States + FCT Abuja and 774 Local Government Areas (LGAs)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close location selector"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Intra-State Notice Banner when picking destination */}
        {isIntraMode && !isOrigin && pairedStateId && (
          <div className="bg-blue-950/40 border-b border-blue-500/30 px-4 sm:px-5 py-2.5 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-blue-200">
              <Building2 className="w-4 h-4 text-blue-400 shrink-0" />
              <span>
                <strong>Intra-State Move:</strong> Filtered to LGAs within{' '}
                <strong className="text-white underline">
                  {NIGERIAN_STATES_DATA.find((s) => s.id === pairedStateId)?.name || 'Origin State'}
                </strong>.
              </span>
            </div>
            {onSwitchTransitMode && (
              <button
                type="button"
                onClick={() => onSwitchTransitMode('inter')}
                className="text-[11px] font-bold text-amber-400 hover:text-amber-300 bg-slate-900 border border-amber-500/30 px-3 py-1 rounded-lg flex items-center gap-1 transition-colors shrink-0"
              >
                <Truck className="w-3 h-3" />
                <span>Switch to Inter-State</span>
              </button>
            )}
          </div>
        )}

        {/* Search & Zone Filters */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/60 space-y-3 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by state, capital, LGA, or district (e.g. Lekki, Maitama, Ikeja, Apapa, Trans-Amadi)..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all font-medium"
              autoFocus
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Geopolitical Zone Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            <span className="text-[10px] uppercase font-bold text-slate-400 mr-1 shrink-0">
              Zone:
            </span>
            {GEOPOLITICAL_ZONES.map((zone) => (
              <button
                key={zone}
                type="button"
                onClick={() => setSelectedZone(zone)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                  selectedZone === zone
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {zone}
              </button>
            ))}
          </div>

          {/* Popular Logistics Hubs Quick Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            <span className="text-[10px] uppercase font-bold text-amber-400 mr-1 shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Quick Hubs:
            </span>
            {POPULAR_HUBS.map((hub, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelect(hub.stateId, hub.lga)}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-amber-500/20 hover:text-amber-300 border border-slate-800 text-[11px] text-slate-300 transition-all whitespace-nowrap shrink-0"
              >
                {hub.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Content: State and LGA Selection Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {filteredStates.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <MapPin className="w-8 h-8 mx-auto text-slate-600 mb-2" />
              <p className="font-bold text-slate-300">No Nigerian state or LGA matched "{searchTerm}"</p>
              <p className="text-xs">Try searching for a different commercial area, LGA, or reset your zone filter.</p>
              <button
                type="button"
                onClick={() => { setSearchTerm(''); setSelectedZone('All'); }}
                className="mt-2 text-xs font-bold text-amber-400 hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            filteredStates.map((state) => {
              const isCurrentState = state.id === currentStateId;
              const isExpanded = expandedStateId === state.id || searchTerm.trim().length > 0;
              
              // Filter LGAs if search is active
              const matchedLgas = searchTerm.trim()
                ? state.lgas.filter((lga) => lga.name.toLowerCase().includes(searchTerm.toLowerCase().trim()))
                : state.lgas;

              return (
                <div 
                  key={state.id}
                  className={`rounded-xl border transition-all overflow-hidden ${
                    isCurrentState 
                      ? 'border-amber-500/50 bg-slate-950/80' 
                      : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                  }`}
                >
                  {/* State Header Row */}
                  <div 
                    onClick={() => setExpandedStateId(isExpanded ? null : state.id)}
                    className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-800/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-mono font-black text-amber-400 text-xs">
                        {state.code}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-white text-sm">
                            {state.name}
                          </h4>
                          <span className="text-[10px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded font-mono">
                            Capital: {state.capital}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {state.zone} • {state.lgas.length} LGAs Available
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isCurrentState && (
                        <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                          <Check className="w-3 h-3" />
                          <span>Active Selection</span>
                        </span>
                      )}
                      <span className="text-xs font-bold text-slate-400 px-2 py-1 bg-slate-900 rounded-lg border border-slate-800">
                        {isExpanded ? 'Collapse ▲' : `View ${state.lgas.length} LGAs ▼`}
                      </span>
                    </div>
                  </div>

                  {/* LGAs Grid */}
                  {isExpanded && (
                    <div className="p-3.5 border-t border-slate-800/80 bg-slate-900/60">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1">
                        <Map className="w-3 h-3 text-amber-400" />
                        <span>Select Local Government Area (LGA) or Urban District:</span>
                      </p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {matchedLgas.map((lga) => {
                          const isSelectedLga = isCurrentState && currentLgaName === lga.name;

                          return (
                            <button
                              key={lga.name}
                              type="button"
                              onClick={() => handleSelect(state.id, lga.name)}
                              className={`p-2.5 rounded-xl border text-left text-xs transition-all flex flex-col justify-between group ${
                                isSelectedLga
                                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-bold'
                                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-200 border-slate-800 hover:border-amber-400/50'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-1.5">
                                <span className={`font-semibold leading-snug ${isSelectedLga ? 'text-slate-950 font-black' : 'group-hover:text-white'}`}>
                                  {lga.name}
                                </span>
                                {isSelectedLga && (
                                  <Check className="w-4 h-4 text-slate-950 shrink-0 mt-0.5" />
                                )}
                              </div>

                              {/* Badges for terrain, island toll, or industrial */}
                              <div className="flex flex-wrap gap-1 mt-1.5 pt-1 border-t border-slate-800/40">
                                {lga.isIslandOrTollArea && (
                                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                                    isSelectedLga ? 'bg-slate-950/20 text-slate-950' : 'bg-blue-500/20 text-blue-300'
                                  }`}>
                                    🏝️ Island / Toll
                                  </span>
                                )}
                                {lga.isIndustrialZone && (
                                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                                    isSelectedLga ? 'bg-slate-950/20 text-slate-950' : 'bg-amber-500/20 text-amber-300'
                                  }`}>
                                    🏭 Industrial Hub
                                  </span>
                                )}
                                {lga.isHighDensity && (
                                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                                    isSelectedLga ? 'bg-slate-950/20 text-slate-950' : 'bg-purple-500/20 text-purple-300'
                                  }`}>
                                    🏙️ High-Density
                                  </span>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Official 2026 Nigerian Postal & Freight Coordinates Registry</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold border border-slate-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
