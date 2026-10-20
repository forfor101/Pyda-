import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Wrench, 
  Clock, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  Phone, 
  Truck, 
  Filter, 
  RotateCcw, 
  GripVertical,
  Layers,
  Sparkles,
  Info,
  CalendarDays,
  ListFilter
} from 'lucide-react';
import { VehicleHealthRecord, UpcomingMaintenanceSchedule } from '../data/vehicleHealthData';
import confetti from 'canvas-confetti';

interface FleetMaintenanceCalendarProps {
  vehicles: VehicleHealthRecord[];
  onUpdateVehicleSchedule: (truckId: string, newDateISO: string, notes?: string) => void;
  onSelectTruck?: (truckId: string) => void;
  selectedTruckId?: string;
}

// Current simulated operations date: September 21, 2026
const SIMULATED_TODAY = new Date(2026, 8, 21); // Month is 0-indexed: 8 = September

export const parseDateStringToDate = (dateStr: string): Date => {
  if (!dateStr || dateStr.toLowerCase().includes('immediate') || dateStr.toLowerCase().includes('dispatch')) {
    return new Date(SIMULATED_TODAY);
  }
  // Try standard parsing
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    return parsed;
  }
  return new Date(SIMULATED_TODAY);
};

export const formatDateToISO = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const formatDateDisplay = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
};

export const FleetMaintenanceCalendar: React.FC<FleetMaintenanceCalendarProps> = ({
  vehicles,
  onUpdateVehicleSchedule,
  onSelectTruck,
  selectedTruckId,
}) => {
  // Calendar View State: default to September 2026
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(8); // September (0-indexed)
  const [viewMode, setViewMode] = useState<'month' | 'agenda'>('month');

  // Filters
  const [selectedWorkshop, setSelectedWorkshop] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Drag-and-Drop state
  const [draggedTruckId, setDraggedTruckId] = useState<string | null>(null);
  const [dragOverDateKey, setDragOverDateKey] = useState<string | null>(null);

  // Selected Service Detail Modal
  const [detailModalTruck, setDetailModalTruck] = useState<VehicleHealthRecord | null>(null);
  const [manualRescheduleDate, setManualRescheduleDate] = useState<string>('');
  const [rescheduleNotes, setRescheduleNotes] = useState<string>('');

  // Toast / Feedback Notification
  const [feedbackToast, setFeedbackToast] = useState<{
    type: 'success' | 'info';
    message: string;
    subMessage?: string;
  } | null>(null);

  const showToast = (message: string, subMessage?: string) => {
    setFeedbackToast({ type: 'success', message, subMessage });
    try {
      confetti({ particleCount: 30, spread: 55, origin: { y: 0.8 } });
    } catch {
      // ignore
    }
    setTimeout(() => {
      setFeedbackToast(null);
    }, 4500);
  };

  // Map of dateKey -> vehicles scheduled on that date
  const vehiclesByDate = useMemo(() => {
    const map = new Map<string, VehicleHealthRecord[]>();

    vehicles.forEach((truck) => {
      // Check filters
      if (selectedWorkshop !== 'all' && truck.maintenanceSchedule.workshopCity !== selectedWorkshop) {
        return;
      }
      if (selectedStatus !== 'all' && truck.maintenanceSchedule.serviceStatus !== selectedStatus) {
        return;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchUnit = truck.unitCode.toLowerCase().includes(q);
        const matchPlate = truck.plateNumber.toLowerCase().includes(q);
        const matchModel = truck.makeModel.toLowerCase().includes(q);
        const matchDriver = truck.driverName.toLowerCase().includes(q);
        const matchService = truck.maintenanceSchedule.serviceType.toLowerCase().includes(q);
        if (!matchUnit && !matchPlate && !matchModel && !matchDriver && !matchService) {
          return;
        }
      }

      const scheduledDate = parseDateStringToDate(truck.maintenanceSchedule.scheduledDate);
      const key = formatDateToISO(scheduledDate);
      const existing = map.get(key) || [];
      existing.push(truck);
      map.set(key, existing);
    });

    return map;
  }, [vehicles, selectedWorkshop, selectedStatus, searchQuery]);

  // Calendar matrix calculations
  const daysInMonth = useMemo(() => {
    return new Date(currentYear, currentMonth + 1, 0).getDate();
  }, [currentYear, currentMonth]);

  const firstDayOfWeek = useMemo(() => {
    return new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun, 1 = Mon ...
  }, [currentYear, currentMonth]);

  // Previous month trailing days
  const daysInPrevMonth = useMemo(() => {
    return new Date(currentYear, currentMonth, 0).getDate();
  }, [currentYear, currentMonth]);

  // Navigation handlers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleGoToToday = () => {
    setCurrentYear(SIMULATED_TODAY.getFullYear());
    setCurrentMonth(SIMULATED_TODAY.getMonth());
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, truck: VehicleHealthRecord) => {
    e.dataTransfer.setData('text/plain', truck.id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedTruckId(truck.id);
  };

  const handleDragEnd = () => {
    setDraggedTruckId(null);
    setDragOverDateKey(null);
  };

  const handleDragOver = (e: React.DragEvent, dateKey: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverDateKey !== dateKey) {
      setDragOverDateKey(dateKey);
    }
  };

  const handleDragLeave = (e: React.DragEvent, dateKey: string) => {
    // Only clear if actually leaving the cell
    if (dragOverDateKey === dateKey) {
      setDragOverDateKey(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetDateKey: string) => {
    e.preventDefault();
    const truckId = e.dataTransfer.getData('text/plain') || draggedTruckId;
    setDraggedTruckId(null);
    setDragOverDateKey(null);

    if (!truckId) return;

    const truck = vehicles.find((v) => v.id === truckId);
    if (!truck) return;

    const targetDate = new Date(targetDateKey + 'T00:00:00');
    const formattedDate = formatDateDisplay(targetDate);

    onUpdateVehicleSchedule(truckId, targetDateKey, `Rescheduled via Interactive Fleet Calendar drag-and-drop to ${formattedDate}`);
    showToast(
      `Service rescheduled for unit ${truck.unitCode}!`,
      `New maintenance deadline: ${formattedDate} (${truck.maintenanceSchedule.workshopFacility})`
    );
  };

  // Open modal for click / inspection / manual date picking
  const handleOpenDetailModal = (truck: VehicleHealthRecord) => {
    setDetailModalTruck(truck);
    const parsed = parseDateStringToDate(truck.maintenanceSchedule.scheduledDate);
    setManualRescheduleDate(formatDateToISO(parsed));
    setRescheduleNotes('');
  };

  const handleSaveManualReschedule = () => {
    if (!detailModalTruck || !manualRescheduleDate) return;
    const targetDate = new Date(manualRescheduleDate + 'T00:00:00');
    const formattedDate = formatDateDisplay(targetDate);

    onUpdateVehicleSchedule(
      detailModalTruck.id, 
      manualRescheduleDate, 
      rescheduleNotes || `Manual calendar adjustment to ${formattedDate}`
    );
    showToast(
      `Service rescheduled for unit ${detailModalTruck.unitCode}!`,
      `New maintenance deadline: ${formattedDate}`
    );
    setDetailModalTruck(null);
  };

  const handleQuickPostpone = (days: number) => {
    if (!manualRescheduleDate) return;
    const curr = new Date(manualRescheduleDate + 'T00:00:00');
    curr.setDate(curr.getDate() + days);
    setManualRescheduleDate(formatDateToISO(curr));
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentMonthLabel = `${monthNames[currentMonth]} ${currentYear}`;
  const todayISO = formatDateToISO(SIMULATED_TODAY);

  // Total scheduled counts
  const totalFleetEvents = vehicles.length;
  const overdueCount = vehicles.filter(v => v.maintenanceSchedule.serviceStatus === 'overdue').length;
  const dueSoonCount = vehicles.filter(v => v.maintenanceSchedule.serviceStatus === 'due_soon').length;

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-3xl p-4 sm:p-6 lg:p-8 space-y-6 shadow-2xl">
      
      {/* Toast Feedback Notification */}
      {feedbackToast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-slate-900 border-2 border-emerald-500 rounded-2xl p-4 shadow-2xl shadow-emerald-500/20 flex items-start gap-3.5 animate-in fade-in slide-in-from-bottom-5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="space-y-1 flex-1 pr-2">
            <p className="text-sm font-bold text-white">{feedbackToast.message}</p>
            {feedbackToast.subMessage && (
              <p className="text-xs text-slate-300 leading-relaxed">{feedbackToast.subMessage}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => setFeedbackToast(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Calendar Header & Instruction Banner */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-xs font-mono font-black text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-md flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>INTERACTIVE FLEET SCHEDULER</span>
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Fleet Maintenance Deadline Calendar
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-3xl">
              Drag-and-drop vehicle service tags between dates to reschedule workshop pitstops. Deadlines automatically synchronize with diagnostic mileage timers and workshop bay capacity.
            </p>
          </div>

          {/* Quick Metrics Pills */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs">
              <Truck className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-400">Tracked:</span>
              <strong className="text-white font-mono">{totalFleetEvents} Units</strong>
            </div>

            {overdueCount > 0 && (
              <div className="bg-rose-500/15 border border-rose-500/40 text-rose-400 px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-bold animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{overdueCount} Overdue Pitstop</span>
              </div>
            )}

            <div className="bg-amber-500/15 border border-amber-500/40 text-amber-400 px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-bold">
              <Clock className="w-3.5 h-3.5" />
              <span>{dueSoonCount} Due Soon</span>
            </div>
          </div>
        </div>

        {/* Drag-and-Drop Interactive Help Tip */}
        <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-slate-300">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <GripVertical className="w-4 h-4" />
            </div>
            <span>
              <strong className="text-white">Pro-Tip for Fleet Managers:</strong> Grab any truck badge by its handle and drop onto another day cell to update its authorized workshop slot. You can also click any card for detailed checklist inspection.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <button
              type="button"
              onClick={handleGoToToday}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg font-bold transition-all border border-slate-700 cursor-pointer"
            >
              Jump to Current Date (Sept 21)
            </button>
          </div>
        </div>
      </div>

      {/* Control Toolbar: Month Switcher, Filters, and View Mode */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        
        {/* Month Navigation */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 shadow-inner">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="px-4 py-1 text-sm sm:text-base font-black text-white font-mono min-w-[160px] text-center">
              {currentMonthLabel}
            </div>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1">
            <button
              type="button"
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'month'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Month Grid</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('agenda')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'agenda'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Fleet Agenda</span>
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Workshop City Filter */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <select
              value={selectedWorkshop}
              onChange={(e) => setSelectedWorkshop(e.target.value)}
              className="bg-transparent text-slate-200 font-bold focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900">All Workshop Bays</option>
              <option value="Abuja (Idu)" className="bg-slate-900">Abuja (Idu Industrial Bay)</option>
              <option value="Lagos (Amuwo)" className="bg-slate-900">Lagos (Amuwo Odofin Bay)</option>
              <option value="Port Harcourt (Trans-Amadi)" className="bg-slate-900">Port Harcourt (Trans-Amadi)</option>
              <option value="Kano (Sharada)" className="bg-slate-900">Kano (Sharada Railhead)</option>
            </select>
          </div>

          {/* Urgency Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent text-slate-200 font-bold focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900">All Statuses</option>
              <option value="overdue" className="bg-slate-900">Critical / Overdue</option>
              <option value="due_soon" className="bg-slate-900">Due Soon (&lt; 5 Days)</option>
              <option value="on_schedule" className="bg-slate-900">On Schedule</option>
            </select>
          </div>

          {/* Quick Search */}
          <input
            type="text"
            placeholder="Search unit, driver, model..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400 w-44 sm:w-56"
          />

          {/* Reset Filters */}
          {(selectedWorkshop !== 'all' || selectedStatus !== 'all' || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setSelectedWorkshop('all');
                setSelectedStatus('all');
                setSearchQuery('');
              }}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs transition-colors cursor-pointer"
              title="Clear Filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>

      {/* QUICK DRAG TRAY: Standby Units Quick Launcher */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>Active Fleet Standby Tray (Drag any truck to any calendar date):</span>
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            {vehicles.length} Units Ready to Slot
          </span>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
          {vehicles.map((truck) => {
            const isSelected = truck.id === selectedTruckId;
            const isDragging = draggedTruckId === truck.id;
            const scheduledDate = parseDateStringToDate(truck.maintenanceSchedule.scheduledDate);
            const formattedDate = formatDateDisplay(scheduledDate);

            return (
              <div
                key={truck.id}
                draggable
                onDragStart={(e) => handleDragStart(e, truck)}
                onDragEnd={handleDragEnd}
                onClick={() => handleOpenDetailModal(truck)}
                className={`shrink-0 p-2.5 rounded-xl border flex items-center gap-2.5 cursor-grab active:cursor-grabbing transition-all select-none ${
                  isDragging ? 'opacity-40 scale-95 border-amber-400' :
                  isSelected ? 'bg-slate-800 border-amber-400 shadow-md shadow-amber-500/10' :
                  'bg-slate-950/90 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="text-slate-500 hover:text-amber-400">
                  <GripVertical className="w-4 h-4" />
                </div>
                <div className="space-y-0.5 text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-mono font-black text-white">{truck.unitCode}</span>
                    <span className={`w-2 h-2 rounded-full ${
                      truck.maintenanceSchedule.serviceStatus === 'overdue' ? 'bg-rose-500 animate-ping' :
                      truck.maintenanceSchedule.serviceStatus === 'due_soon' ? 'bg-amber-400' :
                      'bg-emerald-400'
                    }`} />
                  </div>
                  <p className="text-[10px] text-slate-400 max-w-[140px] truncate">
                    {formattedDate} • {truck.maintenanceSchedule.dueInKm} KM
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* VIEW MODE 1: MONTH GRID CALENDAR */}
      {viewMode === 'month' && (
        <div className="space-y-2">
          {/* Day of week headers */}
          <div className="grid grid-cols-7 gap-1.5 text-center">
            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((dayName, idx) => (
              <div
                key={dayName}
                className="py-2.5 text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-900/80 rounded-xl border border-slate-800/60"
              >
                <span className="hidden sm:inline">{dayName}</span>
                <span className="sm:hidden">{dayName.slice(0, 3)}</span>
              </div>
            ))}
          </div>

          {/* Calendar Grid Cells */}
          <div className="grid grid-cols-7 gap-1.5">
            {/* 1. Trailing days from previous month */}
            {Array.from({ length: firstDayOfWeek }).map((_, idx) => {
              const dayNum = daysInPrevMonth - firstDayOfWeek + idx + 1;
              const prevMonthIndex = currentMonth === 0 ? 11 : currentMonth - 1;
              const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
              const prevDate = new Date(prevYear, prevMonthIndex, dayNum);
              const dateKey = formatDateToISO(prevDate);
              const dayVehicles = vehiclesByDate.get(dateKey) || [];
              const isDragOver = dragOverDateKey === dateKey;

              return (
                <div
                  key={`prev-${dayNum}`}
                  onDragOver={(e) => handleDragOver(e, dateKey)}
                  onDragLeave={(e) => handleDragLeave(e, dateKey)}
                  onDrop={(e) => handleDrop(e, dateKey)}
                  className={`min-h-[110px] sm:min-h-[135px] p-2 rounded-2xl border transition-all flex flex-col justify-between ${
                    isDragOver
                      ? 'bg-amber-500/15 border-dashed border-2 border-amber-400 ring-2 ring-amber-400/40'
                      : 'bg-slate-950/40 border-slate-900 opacity-45'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs text-slate-600 font-mono font-bold">
                    <span>{dayNum}</span>
                    <span className="text-[10px] text-slate-600">Prev</span>
                  </div>

                  <div className="space-y-1.5 my-1 flex-1 overflow-y-auto max-h-[90px] scrollbar-thin">
                    {dayVehicles.map((truck) => (
                      <div
                        key={truck.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, truck)}
                        onDragEnd={handleDragEnd}
                        onClick={() => handleOpenDetailModal(truck)}
                        className="bg-slate-900 border border-slate-800 p-1.5 rounded-lg text-[10px] font-bold text-slate-300 cursor-grab active:cursor-grabbing hover:border-amber-400 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-white">{truck.unitCode}</span>
                          <span className="text-[9px] text-amber-400">{truck.maintenanceSchedule.dueInKm}k</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {isDragOver && (
                    <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 py-1 px-1.5 rounded text-center block">
                      Drop here
                    </span>
                  )}
                </div>
              );
            })}

            {/* 2. Days of current month */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const currentDate = new Date(currentYear, currentMonth, dayNum);
              const dateKey = formatDateToISO(currentDate);
              const dayVehicles = vehiclesByDate.get(dateKey) || [];
              const isToday = dateKey === todayISO;
              const isDragOver = dragOverDateKey === dateKey;
              const isPast = currentDate < SIMULATED_TODAY && !isToday;

              return (
                <div
                  key={`curr-${dayNum}`}
                  onDragOver={(e) => handleDragOver(e, dateKey)}
                  onDragLeave={(e) => handleDragLeave(e, dateKey)}
                  onDrop={(e) => handleDrop(e, dateKey)}
                  className={`min-h-[110px] sm:min-h-[135px] p-2 rounded-2xl border transition-all flex flex-col justify-between relative group ${
                    isDragOver
                      ? 'bg-amber-500/20 border-2 border-dashed border-amber-400 ring-4 ring-amber-400/20 shadow-xl'
                      : isToday
                      ? 'bg-slate-900/95 border-2 border-amber-500/70 shadow-lg shadow-amber-500/10'
                      : isPast
                      ? 'bg-slate-950/70 border-slate-850 hover:border-slate-700'
                      : 'bg-slate-900/70 hover:bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Top Day Header */}
                  <div className="flex items-center justify-between text-xs font-mono font-bold">
                    <span className={`px-1.5 py-0.5 rounded-md ${
                      isToday ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-300'
                    }`}>
                      {dayNum}
                    </span>

                    {isToday && (
                      <span className="text-[9px] font-black text-amber-400 uppercase tracking-wider bg-amber-500/10 px-1 rounded border border-amber-500/30">
                        TODAY
                      </span>
                    )}

                    {!isToday && dayVehicles.length > 0 && (
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-1.5 py-0.2 rounded-full">
                        {dayVehicles.length} {dayVehicles.length === 1 ? 'Truck' : 'Trucks'}
                      </span>
                    )}
                  </div>

                  {/* Drag Over Visual Indicator */}
                  {isDragOver && (
                    <div className="my-auto py-3 text-center space-y-1 bg-amber-500/10 border border-amber-400/40 rounded-xl animate-pulse">
                      <Wrench className="w-5 h-5 text-amber-400 mx-auto" />
                      <p className="text-[11px] font-black text-amber-300">Drop to Reschedule</p>
                      <p className="text-[9px] text-slate-400">{formatDateDisplay(currentDate)}</p>
                    </div>
                  )}

                  {/* Scheduled Trucks for this day */}
                  {!isDragOver && (
                    <div className="space-y-1.5 my-1 flex-1 overflow-y-auto max-h-[105px] scrollbar-thin">
                      {dayVehicles.map((truck) => {
                        const isTruckSelected = truck.id === selectedTruckId;
                        const isDragging = draggedTruckId === truck.id;
                        const status = truck.maintenanceSchedule.serviceStatus;

                        return (
                          <div
                            key={truck.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, truck)}
                            onDragEnd={handleDragEnd}
                            onClick={() => handleOpenDetailModal(truck)}
                            title={`Drag to reschedule ${truck.unitCode}. Click to view maintenance details.`}
                            className={`p-1.5 rounded-xl border text-[11px] cursor-grab active:cursor-grabbing transition-all select-none relative group/card ${
                              isDragging ? 'opacity-30 scale-95 border-amber-400' :
                              status === 'overdue' ? 'bg-rose-950/70 border-rose-500/80 text-rose-200 hover:border-rose-400 shadow-md shadow-rose-950/30' :
                              status === 'due_soon' ? 'bg-amber-950/60 border-amber-500/80 text-amber-200 hover:border-amber-400 shadow-md shadow-amber-950/30' :
                              'bg-slate-950 border-slate-750 text-slate-200 hover:border-amber-400'
                            } ${isTruckSelected ? 'ring-2 ring-amber-400' : ''}`}
                          >
                            <div className="flex items-center justify-between gap-1">
                              <div className="flex items-center gap-1 truncate">
                                <GripVertical className="w-3 h-3 text-slate-500 shrink-0 group-hover/card:text-amber-400" />
                                <span className="font-mono font-black text-white truncate">{truck.unitCode}</span>
                              </div>
                              <span className={`text-[9px] font-bold px-1 py-0.2 rounded shrink-0 ${
                                status === 'overdue' ? 'bg-rose-500 text-white' :
                                status === 'due_soon' ? 'bg-amber-500 text-slate-950' :
                                'bg-emerald-500/20 text-emerald-400'
                              }`}>
                                {status === 'overdue' ? 'OVERDUE' : status === 'due_soon' ? 'SOON' : 'OK'}
                              </span>
                            </div>

                            <p className="text-[10px] text-slate-400 truncate mt-0.5 font-medium">
                              {truck.maintenanceSchedule.serviceCode}
                            </p>

                            <div className="flex items-center justify-between text-[9px] text-slate-400 mt-1 pt-1 border-t border-white/5">
                              <span className="truncate">{truck.maintenanceSchedule.workshopCity.split(' ')[0]}</span>
                              <span className="font-mono text-amber-400">{truck.maintenanceSchedule.dueInKm} KM</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Empty day prompt on hover */}
                  {!isDragOver && dayVehicles.length === 0 && (
                    <div className="h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[10px] text-slate-600 font-medium">+ Drop truck here</span>
                    </div>
                  )}

                </div>
              );
            })}

            {/* 3. Trailing days for next month to complete the 7-col grid */}
            {Array.from({
              length: (7 - ((firstDayOfWeek + daysInMonth) % 7)) % 7
            }).map((_, idx) => {
              const dayNum = idx + 1;
              const nextMonthIndex = currentMonth === 11 ? 0 : currentMonth + 1;
              const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
              const nextDate = new Date(nextYear, nextMonthIndex, dayNum);
              const dateKey = formatDateToISO(nextDate);
              const dayVehicles = vehiclesByDate.get(dateKey) || [];
              const isDragOver = dragOverDateKey === dateKey;

              return (
                <div
                  key={`next-${dayNum}`}
                  onDragOver={(e) => handleDragOver(e, dateKey)}
                  onDragLeave={(e) => handleDragLeave(e, dateKey)}
                  onDrop={(e) => handleDrop(e, dateKey)}
                  className={`min-h-[110px] sm:min-h-[135px] p-2 rounded-2xl border transition-all flex flex-col justify-between ${
                    isDragOver
                      ? 'bg-amber-500/15 border-dashed border-2 border-amber-400 ring-2 ring-amber-400/40'
                      : 'bg-slate-950/40 border-slate-900 opacity-45'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs text-slate-600 font-mono font-bold">
                    <span>{dayNum}</span>
                    <span className="text-[10px] text-slate-600">Next</span>
                  </div>

                  <div className="space-y-1.5 my-1 flex-1 overflow-y-auto max-h-[90px] scrollbar-thin">
                    {dayVehicles.map((truck) => (
                      <div
                        key={truck.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, truck)}
                        onDragEnd={handleDragEnd}
                        onClick={() => handleOpenDetailModal(truck)}
                        className="bg-slate-900 border border-slate-800 p-1.5 rounded-lg text-[10px] font-bold text-slate-300 cursor-grab active:cursor-grabbing hover:border-amber-400 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-white">{truck.unitCode}</span>
                          <span className="text-[9px] text-amber-400">{truck.maintenanceSchedule.dueInKm}k</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {isDragOver && (
                    <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 py-1 px-1.5 rounded text-center block">
                      Drop here
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW MODE 2: FLEET AGENDA LIST VIEW */}
      {viewMode === 'agenda' && (
        <div className="space-y-3">
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 text-xs text-slate-400 flex items-center justify-between">
            <span>Chronological list of all upcoming fleet preventive service milestones.</span>
            <span className="text-slate-300 font-bold">{vehicles.length} Scheduled Pitstops</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {vehicles.map((truck) => {
              const scheduledDate = parseDateStringToDate(truck.maintenanceSchedule.scheduledDate);
              const formattedDate = formatDateDisplay(scheduledDate);
              const status = truck.maintenanceSchedule.serviceStatus;

              return (
                <div
                  key={truck.id}
                  onClick={() => handleOpenDetailModal(truck)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                    status === 'overdue' ? 'bg-rose-950/40 border-rose-500/60 hover:border-rose-400' :
                    status === 'due_soon' ? 'bg-amber-950/40 border-amber-500/60 hover:border-amber-400' :
                    'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-black text-white font-mono">{truck.unitCode}</span>
                        <span className="text-xs text-slate-400">({truck.plateNumber})</span>
                      </div>
                      <p className="text-xs text-slate-300 font-medium">{truck.makeModel} • {truck.tonnage}</p>
                    </div>

                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase ${
                      status === 'overdue' ? 'bg-rose-500 text-white font-black' :
                      status === 'due_soon' ? 'bg-amber-500 text-slate-950 font-black' :
                      'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    }`}>
                      {status === 'overdue' ? 'Critical Overdue' : status === 'due_soon' ? 'Due Soon' : 'On Schedule'}
                    </span>
                  </div>

                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 space-y-1 text-xs">
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="font-bold text-amber-400">{truck.maintenanceSchedule.serviceCode}:</span>
                      <span className="font-mono text-white font-bold">{formattedDate}</span>
                    </div>
                    <p className="text-slate-400 text-[11px] truncate">{truck.maintenanceSchedule.serviceType}</p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span>{truck.maintenanceSchedule.workshopCity}</span>
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-white font-bold">{truck.maintenanceSchedule.dueInKm} KM left</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDetailModal(truck);
                        }}
                        className="text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
                      >
                        Reschedule
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DETAIL & RESCHEDULE MODAL */}
      {detailModalTruck && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border-2 border-slate-700 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-xl font-black text-white font-mono">
                    {detailModalTruck.unitCode} • {detailModalTruck.plateNumber}
                  </h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    detailModalTruck.maintenanceSchedule.serviceStatus === 'overdue' ? 'bg-rose-500 text-white' :
                    detailModalTruck.maintenanceSchedule.serviceStatus === 'due_soon' ? 'bg-amber-500 text-slate-950 font-black' :
                    'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {detailModalTruck.maintenanceSchedule.serviceStatus.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  {detailModalTruck.makeModel} ({detailModalTruck.tonnage}) • Assigned to driver {detailModalTruck.driverName}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setDetailModalTruck(null)}
                className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Service Highlight */}
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-2">
              <span className="text-xs font-mono font-black text-amber-400 uppercase tracking-wider">
                {detailModalTruck.maintenanceSchedule.serviceCode}
              </span>
              <h4 className="text-base font-black text-white">
                {detailModalTruck.maintenanceSchedule.serviceType}
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 text-xs text-slate-400">
                <div>
                  <span className="block text-[10px] text-slate-500">Currently Scheduled:</span>
                  <strong className="text-white font-mono">{detailModalTruck.maintenanceSchedule.scheduledDate}</strong>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-500">Distance Remaining:</span>
                  <strong className="text-amber-400 font-mono">{detailModalTruck.maintenanceSchedule.dueInKm} KM</strong>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-500">Estimated Downtime:</span>
                  <strong className="text-emerald-400 font-mono">{detailModalTruck.maintenanceSchedule.estimatedDowntimeHours} Hours</strong>
                </div>
              </div>
            </div>

            {/* Workshop & Lead Diagnostician */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 font-bold block">Assigned Workshop Bay:</span>
                <p className="font-bold text-white">{detailModalTruck.maintenanceSchedule.workshopFacility}</p>
                <p className="text-amber-400 text-[11px]">{detailModalTruck.maintenanceSchedule.workshopCity}</p>
              </div>

              <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 font-bold block">Master Lead Diagnostician:</span>
                <p className="font-bold text-white">{detailModalTruck.maintenanceSchedule.leadTechnician}</p>
                <a
                  href={`tel:${detailModalTruck.maintenanceSchedule.technicianPhone}`}
                  className="text-emerald-400 text-[11px] flex items-center gap-1 hover:underline"
                >
                  <Phone className="w-3 h-3" />
                  <span>Call Bay: {detailModalTruck.maintenanceSchedule.technicianPhone}</span>
                </a>
              </div>
            </div>

            {/* Service Checklist Preview */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Mandatory Checklist Tasks ({detailModalTruck.maintenanceSchedule.checklist.length}):
              </span>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {detailModalTruck.maintenanceSchedule.checklist.map((item, idx) => (
                  <div key={idx} className="bg-slate-950 p-2 rounded-lg border border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-300">{item.task}</span>
                    <span className="text-[10px] text-slate-500 font-mono shrink-0 ml-2">{item.estimatedMinutes} mins</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reschedule Date Control Form */}
            <div className="bg-slate-950 border-2 border-amber-500/30 p-4 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CalendarIcon className="w-4 h-4" />
                  <span>Reschedule Maintenance Date</span>
                </label>
                <span className="text-[11px] text-slate-400">Zero fee policy under Pyda SLA</span>
              </div>

              {/* Date Input */}
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="date"
                  value={manualRescheduleDate}
                  onChange={(e) => setManualRescheduleDate(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 text-white font-mono text-sm px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-amber-400"
                />

                {/* Quick Postpone Buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleQuickPostpone(2)}
                    className="px-2.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-bold border border-slate-700 transition-colors"
                  >
                    +2 Days
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPostpone(7)}
                    className="px-2.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-bold border border-slate-700 transition-colors"
                  >
                    +1 Week
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPostpone(14)}
                    className="px-2.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-bold border border-slate-700 transition-colors"
                  >
                    +2 Weeks
                  </button>
                </div>
              </div>

              {/* Reason / Notes */}
              <input
                type="text"
                placeholder="Reason for reschedule (optional, e.g. Long-haul return trip delayed)..."
                value={rescheduleNotes}
                onChange={(e) => setRescheduleNotes(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-white text-xs px-3.5 py-2 rounded-xl focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDetailModalTruck(null)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveManualReschedule}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm & Reschedule Date</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
