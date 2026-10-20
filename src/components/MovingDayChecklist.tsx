import React, { useState, useEffect } from 'react';
import {
  ListChecks,
  CheckCircle2,
  Circle,
  Clock,
  Calendar,
  Plus,
  RotateCcw,
  Search,
  Sparkles,
  Share2,
  Trash2,
  AlertCircle,
  Truck,
  Box,
  FileText,
  KeyRound,
  Home,
  Printer,
  X,
  CheckSquare,
  Square,
  Phone,
  ShieldCheck,
  User,
  MapPin,
  CalendarDays,
  SlidersHorizontal,
  Download
} from 'lucide-react';

export interface ChecklistItem {
  id: string;
  category: '4 Weeks Out' | '2 Weeks Out' | '1 Week Out' | 'Moving Day' | 'Post-Move';
  title: string;
  description: string;
  completed: boolean;
  isCustom?: boolean;
}

const DEFAULT_CHECKLIST: ChecklistItem[] = [
  // 4 Weeks Out
  {
    id: 'chk-1',
    category: '4 Weeks Out',
    title: 'Request Formal Relocation Quote',
    description: 'Use the Megatrend Movers online cost estimator to calculate cubic volume and request official dispatch pricing.',
    completed: false,
  },
  {
    id: 'chk-2',
    category: '4 Weeks Out',
    title: 'Audit & Declutter Inventory',
    description: 'Categorize room-by-room items. Donate or discard unwanted furniture and appliances before packing.',
    completed: false,
  },
  {
    id: 'chk-3',
    category: '4 Weeks Out',
    title: 'Gather Important Documents & Records',
    description: 'Keep property title deeds, passports, contracts, and medical records in a dedicated personal binder.',
    completed: false,
  },
  {
    id: 'chk-4',
    category: '4 Weeks Out',
    title: 'Notify Facility & Estate Management',
    description: 'Obtain exit permits, settle estate dues, and schedule loading dock access with current building managers.',
    completed: false,
  },

  // 2 Weeks Out
  {
    id: 'chk-5',
    category: '2 Weeks Out',
    title: 'Confirm Move Date with Megatrend Dispatch',
    description: 'Lock in truck capacity, crew assignment, and preferred loading window with your Megatrend account lead.',
    completed: false,
  },
  {
    id: 'chk-6',
    category: '2 Weeks Out',
    title: 'Begin Packing Non-Essential Items',
    description: 'Box seasonal clothing, decorative art, books, and secondary kitchenware. Label each box clearly with room name.',
    completed: false,
  },
  {
    id: 'chk-7',
    category: '2 Weeks Out',
    title: 'Arrange Utilities Transfer',
    description: 'Schedule disconnection & reconnection for electricity meters, internet/fiber, and water supply at both sites.',
    completed: false,
  },
  {
    id: 'chk-8',
    category: '2 Weeks Out',
    title: 'Dismantle Heavy Modular Furniture',
    description: 'Optionally disassemble large wardrobes, bed frames, or conference tables (or request Megatrend crew service).',
    completed: false,
  },

  // 1 Week Out
  {
    id: 'chk-9',
    category: '1 Week Out',
    title: 'Pack the "First Night / Essentials" Box',
    description: 'Set aside toiletries, phone chargers, bedsheets, fresh clothing, water, and basic tools for immediate access.',
    completed: false,
  },
  {
    id: 'chk-10',
    category: '1 Week Out',
    title: 'Defrost Fridges & Drain Appliances',
    description: 'Empty and dry refrigerators, freezers, and washing machines 24-48 hours before loading day.',
    completed: false,
  },
  {
    id: 'chk-11',
    category: '1 Week Out',
    title: 'Label Fragile & High-Value Items',
    description: 'Apply high-visibility FRAGILE tags on electronics, glass, and artwork for special crate positioning.',
    completed: false,
  },
  {
    id: 'chk-12',
    category: '1 Week Out',
    title: 'Confirm New Property Access Keys & Gate Pass',
    description: 'Ensure keys, security clearance, and elevator booking at the destination property are active.',
    completed: false,
  },

  // Moving Day
  {
    id: 'chk-13',
    category: 'Moving Day',
    title: 'Early Morning Walk-Through with Megatrend Lead',
    description: 'Review item inventory, verify specialized padding for fragile items, and point out priority loading boxes.',
    completed: false,
  },
  {
    id: 'chk-14',
    category: 'Moving Day',
    title: 'Conduct Final Property Sweep',
    description: 'Check all closets, cabinets, drawers, and balconies to ensure no personal items are left behind.',
    completed: false,
  },
  {
    id: 'chk-15',
    category: 'Moving Day',
    title: 'Secure Valuables & Personal Hand Luggage',
    description: 'Carry jewelry, laptops, cash, and sensitive legal documents in your personal vehicle.',
    completed: false,
  },
  {
    id: 'chk-16',
    category: 'Moving Day',
    title: 'Record Meter Readings & Lock Premises',
    description: 'Take photos of electricity/water meters, switch off main circuit breakers, and hand off property keys.',
    completed: false,
  },

  // Post-Move
  {
    id: 'chk-17',
    category: 'Post-Move',
    title: 'Inspect Delivered Freight & Furniture Placement',
    description: 'Verify all numbered boxes and furniture pieces against the serialized dispatch manifest during offloading.',
    completed: false,
  },
  {
    id: 'chk-18',
    category: 'Post-Move',
    title: 'Unpack the Essentials Box & Set Up Bedding',
    description: 'Assemble primary bed frames, plug in essential devices, and set up main bathroom essentials first.',
    completed: false,
  },
  {
    id: 'chk-19',
    category: 'Post-Move',
    title: 'Dispose or Recyle Packing Materials',
    description: 'Flatten cardboard boxes and bubble wrap. Request Megatrend crate retrieval if using reusable plastic bins.',
    completed: false,
  },
  {
    id: 'chk-20',
    category: 'Post-Move',
    title: 'Complete Delivery Sign-Off & Leave Review',
    description: 'Sign the job completion form with your dispatch supervisor and share feedback on your relocation experience.',
    completed: false,
  },
];

const CATEGORIES: ('All' | '4 Weeks Out' | '2 Weeks Out' | '1 Week Out' | 'Moving Day' | 'Post-Move')[] = [
  'All',
  '4 Weeks Out',
  '2 Weeks Out',
  '1 Week Out',
  'Moving Day',
  'Post-Move',
];

interface MovingDayChecklistProps {
  onOpenQuoteModal?: () => void;
}

const STORAGE_KEY = 'megatrend_moving_checklist';
const FILTERS_STORAGE_KEY = 'megatrend_moving_checklist_filters';
const META_STORAGE_KEY = 'megatrend_moving_checklist_meta';

interface ChecklistMeta {
  clientName?: string;
  moveDate?: string;
  originAddress?: string;
  destinationAddress?: string;
  includeHotlines?: boolean;
  includeNotesSection?: boolean;
  includeSignOff?: boolean;
  lastSaved?: string;
}

function loadChecklistItems(): ChecklistItem[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed: ChecklistItem[] = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Map of saved status by ID
        const savedStatusMap = new Map<string, boolean>();
        const customItems: ChecklistItem[] = [];

        parsed.forEach((item) => {
          if (item && item.id) {
            savedStatusMap.set(item.id, Boolean(item.completed));
            if (item.isCustom) {
              customItems.push(item);
            }
          }
        });

        // Hydrate default checklist items preserving user completion state
        const hydratedDefaults = DEFAULT_CHECKLIST.map((defItem) => {
          if (savedStatusMap.has(defItem.id)) {
            return { ...defItem, completed: savedStatusMap.get(defItem.id)! };
          }
          return defItem;
        });

        return [...hydratedDefaults, ...customItems];
      }
    }
  } catch (e) {
    console.error('Failed to load checklist from localStorage', e);
  }
  return DEFAULT_CHECKLIST;
}

export const MovingDayChecklist: React.FC<MovingDayChecklistProps> = ({ onOpenQuoteModal }) => {
  const [items, setItems] = useState<ChecklistItem[]>(loadChecklistItems);

  // Load saved filters if available
  const [selectedCategory, setSelectedCategory] = useState<string>(() => {
    try {
      const savedFilters = localStorage.getItem(FILTERS_STORAGE_KEY);
      if (savedFilters) {
        const parsed = JSON.parse(savedFilters);
        if (parsed.selectedCategory) return parsed.selectedCategory;
      }
    } catch {}
    return 'All';
  });

  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>(() => {
    try {
      const savedFilters = localStorage.getItem(FILTERS_STORAGE_KEY);
      if (savedFilters) {
        const parsed = JSON.parse(savedFilters);
        if (parsed.statusFilter) return parsed.statusFilter;
      }
    } catch {}
    return 'all';
  });

  const [searchQuery, setSearchQuery] = useState<string>('');

  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'4 Weeks Out' | '2 Weeks Out' | '1 Week Out' | 'Moving Day' | 'Post-Move'>('4 Weeks Out');
  const [newDescription, setNewDescription] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [savedNotification, setSavedNotification] = useState(false);

  // Print Modal & Customization State with localStorage persistence
  const [savedMeta] = useState<ChecklistMeta>(() => {
    try {
      const meta = localStorage.getItem(META_STORAGE_KEY);
      if (meta) return JSON.parse(meta);
    } catch {}
    return {};
  });

  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printMode, setPrintMode] = useState<'progress' | 'blank'>('progress');
  const [printCategory, setPrintCategory] = useState<string>('All');
  const [clientName, setClientName] = useState(savedMeta.clientName || '');
  const [moveDate, setMoveDate] = useState(savedMeta.moveDate || '');
  const [originAddress, setOriginAddress] = useState(savedMeta.originAddress || '');
  const [destinationAddress, setDestinationAddress] = useState(savedMeta.destinationAddress || '');
  const [includeHotlines, setIncludeHotlines] = useState(savedMeta.includeHotlines !== undefined ? savedMeta.includeHotlines : true);
  const [includeNotesSection, setIncludeNotesSection] = useState(savedMeta.includeNotesSection !== undefined ? savedMeta.includeNotesSection : true);
  const [includeSignOff, setIncludeSignOff] = useState(savedMeta.includeSignOff !== undefined ? savedMeta.includeSignOff : true);
  const [lastSavedTime, setLastSavedTime] = useState<string>(savedMeta.lastSaved || 'Ready');

  // Sync checklist items to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setLastSavedTime(nowStr);
      
      const currentMeta: ChecklistMeta = {
        clientName,
        moveDate,
        originAddress,
        destinationAddress,
        includeHotlines,
        includeNotesSection,
        includeSignOff,
        lastSaved: nowStr,
      };
      localStorage.setItem(META_STORAGE_KEY, JSON.stringify(currentMeta));

      // Trigger temporary saved confirmation flash
      setSavedNotification(true);
      const timer = setTimeout(() => setSavedNotification(false), 2000);
      return () => clearTimeout(timer);
    } catch (e) {
      console.error('Failed to save checklist to localStorage', e);
    }
  }, [items, clientName, moveDate, originAddress, destinationAddress, includeHotlines, includeNotesSection, includeSignOff]);

  // Sync active filters to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        FILTERS_STORAGE_KEY,
        JSON.stringify({ selectedCategory, statusFilter })
      );
    } catch (e) {
      console.error('Failed to save filters to localStorage', e);
    }
  }, [selectedCategory, statusFilter]);

  // Toggle item status
  const toggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  // Add custom task
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newItem: ChecklistItem = {
      id: `custom-${Date.now()}`,
      category: newCategory,
      title: newTitle.trim(),
      description: newDescription.trim() || 'Custom user relocation task.',
      completed: false,
      isCustom: true,
    };

    setItems((prev) => [...prev, newItem]);
    setNewTitle('');
    setNewDescription('');
    setShowAddForm(false);
  };

  // Delete custom task
  const handleDeleteItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Reset to default
  const handleResetChecklist = () => {
    if (window.confirm('Are you sure you want to reset your checklist progress to default? All custom tasks and progress marks will be cleared.')) {
      setItems(DEFAULT_CHECKLIST);
      try {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(FILTERS_STORAGE_KEY);
      } catch {}
    }
  };

  // Share summary / copy checklist report
  const handleCopySummary = () => {
    const completedCount = items.filter((i) => i.completed).length;
    const totalCount = items.length;
    const percent = Math.round((completedCount / totalCount) * 100) || 0;

    let text = `📦 MEGATREND MOVERS - MOVING DAY CHECKLIST PROGRESS (${percent}% Complete)\n`;
    text += `Completed: ${completedCount} of ${totalCount} tasks\n\n`;

    const grouped: Record<string, ChecklistItem[]> = {};
    items.forEach((item) => {
      if (!grouped[item.category]) grouped[item.category] = [];
      grouped[item.category].push(item);
    });

    Object.keys(grouped).forEach((cat) => {
      text += `--- ${cat.toUpperCase()} ---\n`;
      grouped[cat].forEach((item) => {
        text += `${item.completed ? '[x]' : '[ ]'} ${item.title}\n`;
      });
      text += '\n';
    });

    text += `Organized with Megatrend Movers & Logistics Ltd (Hotline: 08062466212)`;

    navigator.clipboard.writeText(text);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 3000);
  };

  // Trigger physical document printing
  const handleTriggerPrint = () => {
    const printContent = document.getElementById('printable-checklist-sheet');
    if (!printContent) {
      window.print();
      return;
    }

    const printIframe = document.createElement('iframe');
    printIframe.style.position = 'fixed';
    printIframe.style.right = '0';
    printIframe.style.bottom = '0';
    printIframe.style.width = '0';
    printIframe.style.height = '0';
    printIframe.style.border = '0';
    document.body.appendChild(printIframe);

    const doc = printIframe.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Megatrend Movers - Moving Day Relocation Checklist</title>
          <meta charset="utf-8" />
          <style>
            @page {
              size: A4;
              margin: 12mm 14mm 12mm 14mm;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              color: #0f172a;
              background: #ffffff;
              margin: 0;
              padding: 0;
              font-size: 9.5pt;
              line-height: 1.35;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .header-box {
              border-bottom: 2.5px solid #0f172a;
              padding-bottom: 8px;
              margin-bottom: 10px;
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
            }
            .company-name {
              font-size: 15pt;
              font-weight: 900;
              color: #0f172a;
              letter-spacing: -0.5px;
              margin: 0;
              text-transform: uppercase;
            }
            .doc-title {
              font-size: 10pt;
              font-weight: 700;
              color: #b45309;
              margin-top: 2px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .meta-grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 6px;
              background: #f8fafc;
              border: 1px solid #cbd5e1;
              padding: 6px 10px;
              border-radius: 6px;
              margin-bottom: 12px;
              font-size: 8pt;
            }
            .meta-item strong {
              display: block;
              color: #64748b;
              text-transform: uppercase;
              font-size: 6.5pt;
              margin-bottom: 2px;
              letter-spacing: 0.5px;
            }
            .meta-item span {
              color: #0f172a;
              font-weight: 700;
            }
            .phase-section {
              margin-bottom: 10px;
              page-break-inside: avoid;
              break-inside: avoid;
            }
            .phase-header {
              background: #0f172a;
              color: #ffffff;
              padding: 3.5px 8px;
              font-size: 9pt;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              border-radius: 4px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 4px;
            }
            .tasks-list {
              border-left: 2px solid #e2e8f0;
              padding-left: 8px;
              margin-left: 4px;
            }
            .task-row {
              display: flex;
              align-items: flex-start;
              gap: 8px;
              padding: 4px 0;
              border-bottom: 1px dashed #e2e8f0;
              page-break-inside: avoid;
              break-inside: avoid;
            }
            .task-row:last-child {
              border-bottom: none;
            }
            .checkbox-box {
              width: 13px;
              height: 13px;
              border: 1.5px solid #0f172a;
              border-radius: 3px;
              margin-top: 1px;
              flex-shrink: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 8.5pt;
              font-weight: bold;
              line-height: 1;
            }
            .checkbox-box.checked {
              background: #0f172a;
              color: #ffffff;
            }
            .task-content {
              flex: 1;
            }
            .task-title {
              font-weight: 700;
              font-size: 9pt;
              color: #0f172a;
            }
            .task-title.completed {
              text-decoration: line-through;
              color: #64748b;
            }
            .task-desc {
              font-size: 8pt;
              color: #475569;
              margin-top: 1px;
            }
            .notes-box {
              border: 1px dashed #94a3b8;
              border-radius: 6px;
              padding: 8px 10px;
              margin-top: 10px;
              page-break-inside: avoid;
              break-inside: avoid;
              background: #fafafa;
            }
            .notes-title {
              font-size: 8pt;
              font-weight: 800;
              color: #334155;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .notes-lines {
              border-bottom: 1px dotted #cbd5e1;
              height: 16px;
            }
            .signoff-box {
              margin-top: 10px;
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              border-top: 1px solid #cbd5e1;
              padding-top: 8px;
              font-size: 8pt;
              page-break-inside: avoid;
              break-inside: avoid;
            }
            .sign-line {
              border-bottom: 1px solid #0f172a;
              height: 22px;
              margin-top: 4px;
            }
            .hotline-banner {
              background: #fffbeb;
              border: 1px solid #fef3c7;
              padding: 5px 10px;
              border-radius: 4px;
              font-size: 7.5pt;
              margin-top: 10px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              color: #92400e;
              font-weight: 700;
              page-break-inside: avoid;
              break-inside: avoid;
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      printIframe.contentWindow?.focus();
      printIframe.contentWindow?.print();
      setTimeout(() => {
        if (document.body.contains(printIframe)) {
          document.body.removeChild(printIframe);
        }
      }, 2500);
    }, 400);
  };

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'completed'
        ? item.completed
        : !item.completed;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesStatus && matchesSearch;
  });

  // Calculations
  const completedCount = items.filter((i) => i.completed).length;
  const totalCount = items.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Category statistics
  const getCategoryStats = (cat: string) => {
    if (cat === 'All') return { total: totalCount, done: completedCount };
    const catItems = items.filter((i) => i.category === cat);
    const done = catItems.filter((i) => i.completed).length;
    return { total: catItems.length, done };
  };

  const categoryIcons: Record<string, React.ReactNode> = {
    '4 Weeks Out': <Calendar className="w-4 h-4 text-sky-400" />,
    '2 Weeks Out': <Clock className="w-4 h-4 text-indigo-400" />,
    '1 Week Out': <Box className="w-4 h-4 text-amber-400" />,
    'Moving Day': <Truck className="w-4 h-4 text-emerald-400" />,
    'Post-Move': <Home className="w-4 h-4 text-purple-400" />,
  };

  return (
    <section id="moving-checklist" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        {/* Ambient background accent glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-8 border-b border-slate-800/80">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-3">
                <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  <ListChecks className="w-4 h-4" />
                  <span>Interactive Relocation Organizer</span>
                </div>

                {/* Storage Persistence Indicator */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-950/80 border border-emerald-500/30 text-emerald-400 rounded-full text-[11px] font-semibold">
                  <span className={`w-2 h-2 rounded-full ${savedNotification ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`} />
                  <span>{savedNotification ? 'Progress Saved ✓' : 'Auto-Saved to Browser'}</span>
                  {lastSavedTime && lastSavedTime !== 'Ready' && (
                    <span className="text-slate-400 font-mono text-[10px]">({lastSavedTime})</span>
                  )}
                </div>
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Moving Day Preparation Checklist
              </h2>
              <p className="text-slate-300 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
                Stay on top of every milestone from 4 weeks prior to post-move unpacking. Toggle tasks or add custom notes — your progress is automatically preserved in your browser's local storage across page refreshes.
              </p>
            </div>

            {/* Overall Progress Gauge */}
            <div className="bg-slate-950/80 border border-slate-800 p-6 rounded-2xl shrink-0 lg:w-80 shadow-xl">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-2">
                <span className="flex items-center gap-1.5 text-white">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Relocation Readiness</span>
                </span>
                <span className="text-amber-400 text-base font-black">{progressPercent}%</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden p-0.5 border border-slate-700/50">
                <div
                  className="bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 h-full rounded-full transition-all duration-500 ease-out shadow-lg"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-[11px] text-slate-400 mt-3 font-semibold">
                <span>{completedCount} of {totalCount} Tasks Done</span>
                {progressPercent === 100 ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 100% Ready!
                  </span>
                ) : (
                  <span>{totalCount - completedCount} Pending</span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Action Toolbar & Search */}
          <div className="pt-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search checklist (e.g. quote, utilities, box)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setIsPrintModalOpen(true)}
                className="bg-amber-500/15 hover:bg-amber-500 text-amber-400 hover:text-slate-950 border border-amber-500/30 font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all active:scale-95 shadow-md group"
                title="Print physical moving day checklist document"
              >
                <Printer className="w-4 h-4 text-amber-400 group-hover:text-slate-950 transition-colors" />
                <span>Print Version</span>
              </button>

              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all active:scale-95 shadow-md"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>{showAddForm ? 'Close Form' : 'Add Custom Task'}</span>
              </button>

              <button
                onClick={handleCopySummary}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all active:scale-95"
              >
                <Share2 className="w-3.5 h-3.5 text-amber-400" />
                <span>{copiedNotification ? 'Summary Copied!' : 'Export Summary'}</span>
              </button>

              <button
                onClick={handleResetChecklist}
                className="bg-slate-800/60 hover:bg-red-950/40 text-slate-400 hover:text-red-400 border border-slate-800 hover:border-red-800/40 font-semibold text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 transition-all"
                title="Reset progress to default"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>

              {onOpenQuoteModal && (
                <button
                  onClick={onOpenQuoteModal}
                  className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all active:scale-95 shadow-lg shadow-emerald-950/30"
                >
                  <Truck className="w-4 h-4" />
                  <span>Get Relocation Quote</span>
                </button>
              )}
            </div>
          </div>

          {/* Add Custom Task Form Collapsible */}
          {showAddForm && (
            <form
              onSubmit={handleAddItem}
              className="mt-6 p-5 bg-slate-950/90 border border-amber-500/30 rounded-2xl space-y-4 animate-in fade-in duration-200"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Plus className="w-4 h-4" /> Add Personal Relocation Task
                </h4>
                <span className="text-[10px] text-slate-500">Will be saved to local checklist</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Task Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Schedule generator disconnect with electrician"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Relocation Phase
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e: any) => setNewCategory(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="4 Weeks Out">4 Weeks Out</option>
                    <option value="2 Weeks Out">2 Weeks Out</option>
                    <option value="1 Week Out">1 Week Out</option>
                    <option value="Moving Day">Moving Day</option>
                    <option value="Post-Move">Post-Move</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Optional Description / Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Contact Engr. David at 0803XXXXXXX before 10 AM"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black shadow-md"
                >
                  Save Task
                </button>
              </div>
            </form>
          )}

          {/* Phase Filter Tabs */}
          <div className="mt-8 pt-6 border-t border-slate-800/80">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Filter Timeline Phase:
              </span>

              {/* Status Filter Toggle */}
              <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1 text-[11px] font-bold">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    statusFilter === 'all'
                      ? 'bg-amber-500/20 text-amber-400 font-extrabold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All ({totalCount})
                </button>
                <button
                  onClick={() => setStatusFilter('pending')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    statusFilter === 'pending'
                      ? 'bg-amber-500/20 text-amber-400 font-extrabold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Pending ({totalCount - completedCount})
                </button>
                <button
                  onClick={() => setStatusFilter('completed')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    statusFilter === 'completed'
                      ? 'bg-amber-500/20 text-amber-400 font-extrabold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Completed ({completedCount})
                </button>
              </div>
            </div>

            {/* Categories Buttons */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {CATEGORIES.map((cat) => {
                const stats = getCategoryStats(cat);
                const isActive = selectedCategory === cat;

                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 border shrink-0 ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20 font-black'
                        : 'bg-slate-950/60 hover:bg-slate-800/80 text-slate-300 border-slate-800'
                    }`}
                  >
                    {cat !== 'All' && categoryIcons[cat]}
                    <span>{cat}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono ${
                        isActive
                          ? 'bg-slate-950 text-amber-400 font-bold'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {stats.done}/{stats.total}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Task List Grid */}
      <div className="mt-8 space-y-4">
        {filteredItems.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 space-y-3">
            <AlertCircle className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">No tasks match your current filters</h3>
            <p className="text-xs max-w-sm mx-auto">
              Try adjusting your search query, switching categories, or clearing status filters.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setStatusFilter('all');
                setSearchQuery('');
              }}
              className="mt-2 text-xs text-amber-400 font-bold hover:underline"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className={`p-5 rounded-2xl border transition-all duration-200 cursor-pointer group flex items-start gap-4 ${
                  item.completed
                    ? 'bg-slate-950/50 border-slate-800/80 text-slate-400 opacity-80'
                    : 'bg-slate-900 hover:bg-slate-850 border-slate-800 hover:border-amber-500/40 text-slate-200 shadow-md'
                }`}
              >
                {/* Checkbox Icon */}
                <div className="pt-0.5 shrink-0">
                  {item.completed ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 fill-emerald-950/50 transition-transform group-hover:scale-110" />
                  ) : (
                    <Circle className="w-6 h-6 text-slate-500 group-hover:text-amber-400 transition-colors group-hover:scale-110" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-sm font-bold leading-snug transition-colors ${
                        item.completed ? 'line-through text-slate-400' : 'text-white group-hover:text-amber-300'
                      }`}
                    >
                      {item.title}
                    </span>

                    {/* Category Pill Tag */}
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800 shrink-0 flex items-center gap-1">
                      {categoryIcons[item.category]}
                      <span className="hidden sm:inline">{item.category}</span>
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed font-normal">
                    {item.description}
                  </p>

                  {/* Actions for custom tasks */}
                  {item.isCustom && (
                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteItem(item.id);
                        }}
                        className="text-[11px] text-red-400/80 hover:text-red-400 flex items-center gap-1 px-2 py-0.5 rounded bg-red-950/30 hover:bg-red-900/50"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ==================================================== */}
      {/* PRINT VERSION PREVIEW & CONFIGURATION MODAL */}
      {/* ==================================================== */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto no-print">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
            
            {/* Modal Header Bar */}
            <div className="p-5 sm:px-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Physical Relocation Checklist — Print Version</h3>
                  <p className="text-xs text-slate-400">Generate a high-contrast physical document for clipboards, moving boxes, and onsite crew coordination.</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleTriggerPrint}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-lg active:scale-95 transition-all"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Document</span>
                </button>
                <button
                  onClick={() => setIsPrintModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: Two-column layout (Settings & A4 Sheet Preview) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 overflow-y-auto p-4 sm:p-6 gap-6">
              
              {/* Left Column: Print Customization Controls */}
              <div className="lg:col-span-5 space-y-4">
                
                {/* Print Mode Selector */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2.5">
                  <label className="block text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Checklist Format</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPrintMode('progress')}
                      className={`p-3 rounded-xl border text-left text-xs font-bold transition-all ${
                        printMode === 'progress'
                          ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 text-white">
                        <CheckSquare className="w-4 h-4 text-amber-400" />
                        <span>Current Progress</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-normal">Shows your completed [✓] ticks & percentage</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPrintMode('blank')}
                      className={`p-3 rounded-xl border text-left text-xs font-bold transition-all ${
                        printMode === 'blank'
                          ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 text-white">
                        <Square className="w-4 h-4 text-amber-400" />
                        <span>Blank Template</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-normal">Empty [ ] boxes for pen marking on moving day</p>
                    </button>
                  </div>
                </div>

                {/* Timeline Category Scope */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <label className="block text-xs font-bold text-slate-300">
                    Phase Scope
                  </label>
                  <select
                    value={printCategory}
                    onChange={(e) => setPrintCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="All">All Relocation Phases (4 Weeks to Post-Move)</option>
                    <option value="4 Weeks Out">4 Weeks Out Only</option>
                    <option value="2 Weeks Out">2 Weeks Out Only</option>
                    <option value="1 Week Out">1 Week Out Only</option>
                    <option value="Moving Day">Moving Day Execution Only</option>
                    <option value="Post-Move">Post-Move Unpacking Only</option>
                  </select>
                </div>

                {/* Move Personalization Inputs */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-300">
                      Personalize Printout Header
                    </label>
                    <span className="text-[10px] text-slate-500">(Optional)</span>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Client / Family Name</label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="e.g. Chief & Mrs. Adebayo"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Move Date</label>
                      <input
                        type="date"
                        value={moveDate}
                        onChange={(e) => setMoveDate(e.target.value)}
                        className="w-full px-2.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Origin City/Area</label>
                      <input
                        type="text"
                        placeholder="e.g. Lekki Phase 1"
                        value={originAddress}
                        onChange={(e) => setOriginAddress(e.target.value)}
                        className="w-full px-2.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Destination Address / Estate</label>
                    <div className="relative">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="e.g. Guzape Hills, Abuja"
                        value={destinationAddress}
                        onChange={(e) => setDestinationAddress(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Section Toggles */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
                  <label className="block font-bold text-slate-300 mb-2">Include Document Sections</label>
                  
                  <label className="flex items-center gap-2.5 text-slate-300 cursor-pointer hover:text-white">
                    <input
                      type="checkbox"
                      checked={includeHotlines}
                      onChange={(e) => setIncludeHotlines(e.target.checked)}
                      className="rounded text-amber-500 focus:ring-amber-400 bg-slate-900 border-slate-700"
                    />
                    <span>24/7 Dispatch Hotline & Security Bar</span>
                  </label>

                  <label className="flex items-center gap-2.5 text-slate-300 cursor-pointer hover:text-white">
                    <input
                      type="checkbox"
                      checked={includeNotesSection}
                      onChange={(e) => setIncludeNotesSection(e.target.checked)}
                      className="rounded text-amber-500 focus:ring-amber-400 bg-slate-900 border-slate-700"
                    />
                    <span>Onsite Notes & Fragile Items Memo Area</span>
                  </label>

                  <label className="flex items-center gap-2.5 text-slate-300 cursor-pointer hover:text-white">
                    <input
                      type="checkbox"
                      checked={includeSignOff}
                      onChange={(e) => setIncludeSignOff(e.target.checked)}
                      className="rounded text-amber-500 focus:ring-amber-400 bg-slate-900 border-slate-700"
                    />
                    <span>Lead Driver & Client Sign-Off Handover</span>
                  </label>
                </div>

                {/* Quick Print CTA */}
                <button
                  onClick={handleTriggerPrint}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm rounded-xl flex items-center justify-center gap-2 shadow-xl active:scale-98 transition-all"
                >
                  <Printer className="w-4 h-4" />
                  <span>Send to Printer / Save as PDF</span>
                </button>

                <p className="text-[11px] text-slate-500 text-center">
                  💡 In the system print dialog, choose <strong className="text-slate-300">"Save as PDF"</strong> to export a digital PDF copy.
                </p>
              </div>

              {/* Right Column: High-fidelity Document Paper Preview */}
              <div className="lg:col-span-7 bg-slate-950 p-4 sm:p-6 rounded-2xl border border-slate-800 flex flex-col">
                <div className="flex items-center justify-between mb-3 text-xs text-slate-400 font-bold border-b border-slate-800 pb-2">
                  <span>Physical Document Preview (A4 Form Factor)</span>
                  <span className="text-amber-400">{items.filter((i) => printCategory === 'All' || i.category === printCategory).length} Tasks</span>
                </div>

                <div className="overflow-y-auto max-h-[600px] border border-slate-700/60 rounded-xl bg-white shadow-2xl p-6 sm:p-8 text-slate-900 select-text">
                  
                  {/* PRINTABLE SHEET CONTAINER (Targeted by print iframe) */}
                  <div id="printable-checklist-sheet" className="printable-document">
                    
                    {/* Header */}
                    <div className="header-box" style={{ borderBottom: '2.5px solid #0f172a', paddingBottom: '8px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontSize: '15pt', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px', textTransform: 'uppercase' }}>
                          MEGATREND MOVERS & LOGISTICS
                        </div>
                        <div style={{ fontSize: '9.5pt', fontWeight: 700, color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Official Moving Day Preparation Checklist
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', fontSize: '8pt', color: '#64748b' }}>
                        <div>Ref: <strong style={{ color: '#0f172a' }}>MTM-CHK-{new Date().getFullYear()}</strong></div>
                        <div>Date: {new Date().toLocaleDateString('en-GB')}</div>
                      </div>
                    </div>

                    {/* Meta Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', background: '#f8fafc', border: '1px solid #cbd5e1', padding: '6px 10px', borderRadius: '6px', marginBottom: '12px', fontSize: '8pt' }}>
                      <div>
                        <strong style={{ display: 'block', color: '#64748b', textTransform: 'uppercase', fontSize: '6.5pt', marginBottom: '2px' }}>Client / Account</strong>
                        <span style={{ color: '#0f172a', fontWeight: 700 }}>{clientName || 'Valued Relocation Client'}</span>
                      </div>
                      <div>
                        <strong style={{ display: 'block', color: '#64748b', textTransform: 'uppercase', fontSize: '6.5pt', marginBottom: '2px' }}>Target Move Date</strong>
                        <span style={{ color: '#0f172a', fontWeight: 700 }}>{moveDate ? new Date(moveDate).toLocaleDateString('en-GB') : 'To Be Confirmed'}</span>
                      </div>
                      <div>
                        <strong style={{ display: 'block', color: '#64748b', textTransform: 'uppercase', fontSize: '6.5pt', marginBottom: '2px' }}>Origin</strong>
                        <span style={{ color: '#0f172a', fontWeight: 700 }}>{originAddress || 'Origin Property'}</span>
                      </div>
                      <div>
                        <strong style={{ display: 'block', color: '#64748b', textTransform: 'uppercase', fontSize: '6.5pt', marginBottom: '2px' }}>Destination</strong>
                        <span style={{ color: '#0f172a', fontWeight: 700 }}>{destinationAddress || 'Destination Property'}</span>
                      </div>
                    </div>

                    {/* Checklist Tasks by Phase */}
                    {CATEGORIES.filter((c) => c !== 'All' && (printCategory === 'All' || printCategory === c)).map((cat) => {
                      const catTasks = items.filter((i) => i.category === cat);
                      if (catTasks.length === 0) return null;

                      return (
                        <div key={cat} style={{ marginBottom: '10px', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                          <div style={{ background: '#0f172a', color: '#ffffff', padding: '3.5px 8px', fontSize: '8.5pt', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <span>{cat}</span>
                            <span style={{ fontSize: '7.5pt', fontWeight: 600, opacity: 0.9 }}>
                              {printMode === 'progress' ? `${catTasks.filter((t) => t.completed).length}/${catTasks.length} Completed` : `${catTasks.length} Milestones`}
                            </span>
                          </div>

                          <div style={{ borderLeft: '2px solid #e2e8f0', paddingLeft: '8px', marginLeft: '4px' }}>
                            {catTasks.map((t) => {
                              const isChecked = printMode === 'progress' && t.completed;
                              return (
                                <div key={t.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '3.5px 0', borderBottom: '1px dashed #e2e8f0', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                                  <div
                                    style={{
                                      width: '13px',
                                      height: '13px',
                                      border: '1.5px solid #0f172a',
                                      borderRadius: '3px',
                                      marginTop: '1px',
                                      flexShrink: 0,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: '8.5pt',
                                      fontWeight: 'bold',
                                      lineHeight: 1,
                                      background: isChecked ? '#0f172a' : '#ffffff',
                                      color: isChecked ? '#ffffff' : 'transparent'
                                    }}
                                  >
                                    {isChecked ? '✓' : ''}
                                  </div>

                                  <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 700, fontSize: '8.5pt', color: '#0f172a', textDecoration: isChecked ? 'line-through' : 'none' }}>
                                      {t.title}
                                    </div>
                                    <div style={{ fontSize: '7.5pt', color: '#475569', marginTop: '1px' }}>
                                      {t.description}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}

                    {/* Optional Notes Section */}
                    {includeNotesSection && (
                      <div style={{ border: '1px dashed #94a3b8', borderRadius: '6px', padding: '6px 10px', marginTop: '10px', background: '#fafafa', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                        <div style={{ fontSize: '7.5pt', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Onsite Moving Day Notes & Fragile Crate Numbers
                        </div>
                        <div style={{ borderBottom: '1px dotted #cbd5e1', height: '15px' }} />
                        <div style={{ borderBottom: '1px dotted #cbd5e1', height: '15px' }} />
                      </div>
                    )}

                    {/* Optional Sign-Off Section */}
                    {includeSignOff && (
                      <div style={{ marginTop: '10px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', borderTop: '1px solid #cbd5e1', paddingTop: '8px', fontSize: '7.5pt', pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                        <div>
                          <div>Client / Representative Sign-Off:</div>
                          <div style={{ borderBottom: '1px solid #0f172a', height: '20px', marginTop: '4px' }} />
                          <div style={{ fontSize: '6.5pt', color: '#64748b', marginTop: '2px' }}>Signature & Date</div>
                        </div>
                        <div>
                          <div>Megatrend Dispatch Lead Sign-Off:</div>
                          <div style={{ borderBottom: '1px solid #0f172a', height: '20px', marginTop: '4px' }} />
                          <div style={{ fontSize: '6.5pt', color: '#64748b', marginTop: '2px' }}>Driver Name, Seal Verification & Date</div>
                        </div>
                      </div>
                    )}

                    {/* Optional Hotline Banner */}
                    {includeHotlines && (
                      <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', padding: '5px 10px', borderRadius: '4px', fontSize: '7.5pt', marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#92400e', fontWeight: 700, pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                        <span>24/7 Dispatch Hotline: 08062466212 / 08036249911</span>
                        <span>www.megatrendmovers.ng</span>
                      </div>
                    )}

                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>
      )}
    </section>
  );
};
