import React, { useState, useEffect } from 'react';
import {
  FileText,
  FileDown,
  Printer,
  ShieldCheck,
  CheckCircle2,
  X,
  Truck,
  Plus,
  Trash2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Save,
  Eye,
  Edit3,
  Layers,
  MapPin,
  Calendar,
  Phone,
  User,
  Building,
  QrCode,
  Lock,
  Box,
  ClipboardList
} from 'lucide-react';
import { InventoryItem, CustomerUser, SiteSurveyPhoto, VaultDocument } from '../types';
import {
  PackingSlipData,
  loadInventoryForPackingSlip,
  getRecommendedVehicleFromCbm,
  downloadPackingSlipPdf,
  createPackingSlipDocument,
  savePackingSlipToVault,
} from '../utils/packingSlipGenerator';

interface ExportPackingSlipModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: CustomerUser | null;
  companyPhone?: string;
  onPackingSlipSaved?: (newDoc: VaultDocument) => void;
  saveToCloudFn?: (doc: VaultDocument) => Promise<void>;
  initialItems?: InventoryItem[];
}

export const ExportPackingSlipModal: React.FC<ExportPackingSlipModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  companyPhone = '+234 806 246 6212',
  onPackingSlipSaved,
  saveToCloudFn,
  initialItems,
}) => {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'configure' | 'preview'>('configure');

  // Inventory & Photos State
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [surveyPhotos, setSurveyPhotos] = useState<SiteSurveyPhoto[]>([]);
  const [surveyPhotosCount, setSurveyPhotosCount] = useState(0);
  const [surveyCbm, setSurveyCbm] = useState(0);

  // Form Fields for Manifest & Packing Slip
  const [packingSlipRef, setPackingSlipRef] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientCompany, setClientCompany] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [originAddress, setOriginAddress] = useState('Lagos Central Hub, Victoria Island, Lagos');
  const [destinationAddress, setDestinationAddress] = useState('Central Business District, Abuja FCT');
  const [serviceType, setServiceType] = useState('Corporate');
  const [assignedVehicle, setAssignedVehicle] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('KJA-892-XZ (DAF CF 410)');
  const [driverName, setDriverName] = useState('Captain S. Bello (Pyda Haulage)');
  const [inspectorName, setInspectorName] = useState('M. Ibrahim (Senior Inventory Marshall)');
  const [tamperSealRange, setTamperSealRange] = useState('PYDA-SEAL-88910 to SEAL-88915');
  const [dispatchDate, setDispatchDate] = useState('');
  const [handlingInstructions, setHandlingInstructions] = useState(
    'White-glove 5-layer protective wrapping protocol strictly enforced. All tamper seals must be inspected, cross-checked against manifest serials, and confirmed undamaged prior to cargo discharge.'
  );

  // New Item Inline Form State
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<'Furniture' | 'Electronics' | 'Boxes & Crates' | 'Special / Fragile'>('Boxes & Crates');
  const [newItemCbm, setNewItemCbm] = useState(0.2);
  const [newItemQty, setNewItemQty] = useState(1);
  const [isAddingItem, setIsAddingItem] = useState(false);

  // Feedback notifications
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize data on modal open
  useEffect(() => {
    if (isOpen) {
      const { items: loadedItems, surveyPhotos: loadedPhotos, totalCbm: loadedCbm } = loadInventoryForPackingSlip();
      
      const effectiveItems = initialItems && initialItems.length > 0 ? initialItems : loadedItems;
      setItems(effectiveItems);
      setSurveyPhotos(loadedPhotos);
      setSurveyPhotosCount(loadedPhotos.length);

      const computedSurveyCbm = loadedPhotos.reduce((s, p) => s + (p.estimatedCbm || 1.0), 0);
      setSurveyCbm(computedSurveyCbm);

      // Random 5-digit reference
      const randomSuffix = Math.floor(10000 + Math.random() * 90000);
      setPackingSlipRef(`PSL-PYDA-2026-${randomSuffix}`);

      // Dates
      const today = new Date().toISOString().split('T')[0];
      setDispatchDate(today);

      // Auto-populate client from currentUser
      setClientName(currentUser?.fullName || 'Consignee Client');
      setClientCompany(currentUser?.companyName || '');
      setClientPhone(currentUser?.phone || '+234 803 000 0000');
      setClientEmail(currentUser?.email || '');

      // Set recommended vehicle
      setAssignedVehicle(getRecommendedVehicleFromCbm(loadedCbm));
      setFeedbackMsg(null);
      setActiveTab('configure');
    }
  }, [isOpen, currentUser, initialItems]);

  if (!isOpen) return null;

  // Real-time calculations
  const totalPieces = items.reduce((sum, i) => sum + (i.qty || 1), 0);
  const itemsNetCbm = items.reduce((sum, i) => sum + (i.volumeCbm || 0.1) * (i.qty || 1), 0);
  const totalCbm = itemsNetCbm + surveyCbm + 2.0; // 2.0 CBM crating & spacing buffer

  // Packing Slip Payload
  const packingSlipData: PackingSlipData = {
    packingSlipRef,
    issuedDate: new Date().toISOString().split('T')[0],
    dispatchDate,
    clientName: clientName || 'Valued Consignee',
    clientCompany,
    clientPhone: clientPhone || '+234 806 246 6212',
    clientEmail,
    originAddress,
    destinationAddress,
    serviceType,
    assignedVehicle: assignedVehicle || getRecommendedVehicleFromCbm(totalCbm),
    vehiclePlate,
    driverName,
    inspectorName,
    tamperSealRange,
    items,
    surveyPhotosCount,
    surveyCbm,
    totalCbm,
    handlingInstructions,
    pkiVerificationCode: `PKI-PSL-SEAL-${Math.floor(100000 + Math.random() * 900000)}`,
  };

  // Handlers for modifying items
  const handleUpdateQty = (id: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((i) => {
          if (i.id === id) {
            const nextQty = Math.max(1, (i.qty || 1) + delta);
            return { ...i, qty: nextQty };
          }
          return i;
        })
    );
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const newItem: InventoryItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: newItemName.trim(),
      category: newItemCategory,
      volumeCbm: parseFloat(newItemCbm.toString()) || 0.2,
      qty: Math.max(1, parseInt(newItemQty.toString()) || 1),
    };

    setItems((prev) => [newItem, ...prev]);
    setNewItemName('');
    setNewItemQty(1);
    setIsAddingItem(false);
  };

  const handleResetToPlanner = () => {
    const { items: resetItems } = loadInventoryForPackingSlip();
    setItems(resetItems);
    setFeedbackMsg({ type: 'info', text: 'Reset items to live Inventory Planner manifest.' });
  };

  // Actions
  const handleDownloadPdf = () => {
    try {
      setIsProcessing(true);
      downloadPackingSlipPdf(packingSlipData, companyPhone);
      setFeedbackMsg({
        type: 'success',
        text: `Packing slip ${packingSlipRef} successfully generated and downloaded as PDF.`,
      });
    } catch (err) {
      console.error('Failed to export PDF packing slip', err);
      setFeedbackMsg({ type: 'error', text: 'Error generating PDF. Please check your data and retry.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveToVault = async () => {
    try {
      setIsProcessing(true);
      const vaultDoc = createPackingSlipDocument(packingSlipData, currentUser);
      await savePackingSlipToVault(vaultDoc, saveToCloudFn);

      if (onPackingSlipSaved) {
        onPackingSlipSaved(vaultDoc);
      }

      setFeedbackMsg({
        type: 'success',
        text: `Consignment Packing Slip saved into Document Vault with Ref #${vaultDoc.referenceNumber}.`,
      });
    } catch (err) {
      console.error('Failed to save packing slip to vault', err);
      setFeedbackMsg({ type: 'error', text: 'Failed to save packing slip into Document Vault.' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      id="export-packing-slip-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        id="export-packing-slip-modal-card"
        className="relative bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">Export Inventory Packing Slip</h3>
                <span className="bg-amber-500/10 text-amber-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border border-amber-500/20">
                  {packingSlipRef}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Transform your inventory planner manifest into a certified, professionally formatted PDF packing slip.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab switchers */}
            <div className="hidden sm:flex bg-slate-900 border border-slate-800 rounded-xl p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('configure')}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-colors ${
                  activeTab === 'configure'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Manifest Details</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-colors ${
                  activeTab === 'preview'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Document Preview</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Feedback Alert if any */}
        {feedbackMsg && (
          <div
            className={`px-5 py-2.5 text-xs flex items-center justify-between border-b ${
              feedbackMsg.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : feedbackMsg.type === 'error'
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
            }`}
          >
            <div className="flex items-center gap-2">
              {feedbackMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
              )}
              <span>{feedbackMsg.text}</span>
            </div>
            <button
              onClick={() => setFeedbackMsg(null)}
              className="text-slate-400 hover:text-white ml-2 text-xs"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {activeTab === 'configure' ? (
            <div className="space-y-6">
              {/* Summary KPI Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Pieces</span>
                  <span className="text-xl font-black text-white">{totalPieces} Units</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">{items.length} unique items</span>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Net Volume</span>
                  <span className="text-xl font-black text-amber-400">{itemsNetCbm.toFixed(1)} CBM</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Calculated cubic volume</span>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Gross Manifest (Buffer)</span>
                  <span className="text-xl font-black text-emerald-400">{totalCbm.toFixed(1)} CBM</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">+2.0 CBM crating cushion</span>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Suggested Fleet</span>
                  <span className="text-xs font-black text-white truncate block mt-1" title={assignedVehicle}>
                    {assignedVehicle.split('(')[0]}
                  </span>
                  <span className="text-[10px] text-amber-400 block">Padded cargo bay</span>
                </div>
              </div>

              {/* Transit & Consignment Route Details */}
              <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                    <Truck className="w-4 h-4 text-amber-400" />
                    <span>Consignment Logistics & Transit Route</span>
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">Format: A4 Certified Manifest</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="text-slate-400 font-bold block mb-1">Consignor / Client Full Name</label>
                    <input
                      type="text"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="e.g. Chief Adeleke Johnson"
                      className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 font-bold block mb-1">Company / Organization (Optional)</label>
                    <input
                      type="text"
                      value={clientCompany}
                      onChange={(e) => setClientCompany(e.target.value)}
                      placeholder="e.g. Zenith Tech Holdings Ltd"
                      className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 font-bold block mb-1">Contact Phone</label>
                    <input
                      type="text"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="+234 803 000 0000"
                      className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 font-bold block mb-1">Dispatch / Moving Date</label>
                    <input
                      type="date"
                      value={dispatchDate}
                      onChange={(e) => setDispatchDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 font-bold block mb-1">Pick-up Origin Location</label>
                    <input
                      type="text"
                      value={originAddress}
                      onChange={(e) => setOriginAddress(e.target.value)}
                      placeholder="Origin street, LGA, State"
                      className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 font-bold block mb-1">Delivery Destination Location</label>
                    <input
                      type="text"
                      value={destinationAddress}
                      onChange={(e) => setDestinationAddress(e.target.value)}
                      placeholder="Destination street, LGA, State"
                      className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 font-bold block mb-1">Assigned Transport Vehicle</label>
                    <select
                      value={assignedVehicle}
                      onChange={(e) => setAssignedVehicle(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 outline-none focus:border-amber-400"
                    >
                      <option value="3-Ton Padded Moving Van (Transit Van)">3-Ton Padded Moving Van (Transit Van)</option>
                      <option value="5-Ton Covered Box Truck (Enclosed Body)">5-Ton Covered Box Truck (Enclosed Body)</option>
                      <option value="10-Ton Heavy Logistics Truck (Hydraulic Liftgate)">10-Ton Heavy Logistics Truck (Hydraulic Liftgate)</option>
                      <option value="20-Ton Heavy Haulage Rig / 20ft Cargo Container">20-Ton Heavy Haulage Rig / 20ft Cargo Container</option>
                      <option value="30-Ton Multi-Axle Haulage Trailer / 40ft High-Cube Container">30-Ton Multi-Axle Haulage Trailer / 40ft High-Cube Container</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-400 font-bold block mb-1">Tamper-Proof Seal Serials</label>
                    <input
                      type="text"
                      value={tamperSealRange}
                      onChange={(e) => setTamperSealRange(e.target.value)}
                      placeholder="e.g. PYDA-SEAL-88910 to SEAL-88915"
                      className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 outline-none focus:border-amber-400 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Inventory Items Manifest Review Table */}
              <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 sm:p-5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                      <Box className="w-4 h-4 text-amber-400" />
                      <span>Itemized Manifest Cargo Items ({items.length})</span>
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Loaded directly from your Inventory Planner. You can adjust quantities or add supplemental crates.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingItem(!isAddingItem)}
                      className="text-xs bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-bold px-3 py-1.5 rounded-xl border border-amber-500/30 flex items-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Extra Item</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleResetToPlanner}
                      className="text-xs text-slate-400 hover:text-white p-1.5 bg-slate-900 border border-slate-800 rounded-xl"
                      title="Reset items to saved planner"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Inline Add Item Form */}
                {isAddingItem && (
                  <form onSubmit={handleAddItem} className="bg-slate-900 border border-slate-700 p-3 rounded-xl grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs">
                    <div className="sm:col-span-2">
                      <label className="text-[10px] text-slate-400 font-bold block mb-0.5">Item Name</label>
                      <input
                        type="text"
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        placeholder="e.g. Glass Conference Table"
                        className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 outline-none focus:border-amber-400"
                        autoFocus
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 font-bold block mb-0.5">Category</label>
                      <select
                        value={newItemCategory}
                        onChange={(e) => setNewItemCategory(e.target.value as any)}
                        className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-2 py-1.5 outline-none focus:border-amber-400"
                      >
                        <option value="Furniture">Furniture</option>
                        <option value="Electronics">Electronics</option>
                        <option value="Boxes & Crates">Boxes & Crates</option>
                        <option value="Special / Fragile">Special / Fragile</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5">
                      <div>
                        <label className="text-[10px] text-slate-400 font-bold block mb-0.5">Vol (CBM)</label>
                        <input
                          type="number"
                          step="0.05"
                          min="0.01"
                          value={newItemCbm}
                          onChange={(e) => setNewItemCbm(parseFloat(e.target.value) || 0.1)}
                          className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-2 py-1.5 outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 font-bold block mb-0.5">Qty</label>
                        <input
                          type="number"
                          min="1"
                          value={newItemQty}
                          onChange={(e) => setNewItemQty(parseInt(e.target.value) || 1)}
                          className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-2 py-1.5 outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>

                    <div className="flex items-end gap-1">
                      <button
                        type="submit"
                        className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-1.5 rounded-lg text-xs"
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsAddingItem(false)}
                        className="p-1.5 bg-slate-800 text-slate-400 hover:text-white rounded-lg text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {/* Items List */}
                <div className="divide-y divide-slate-800 max-h-56 overflow-y-auto pr-1">
                  {items.map((item, idx) => {
                    const isFragile = item.category === 'Special / Fragile' || item.category === 'Electronics';
                    const lineVol = ((item.volumeCbm || 0.1) * (item.qty || 1)).toFixed(2);

                    return (
                      <div key={item.id || idx} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <span className="text-[10px] font-mono text-slate-500 w-5">#{idx + 1}</span>
                          <div className="min-w-0">
                            <p className="font-bold text-white truncate">{item.name}</p>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400">
                              <span className="text-slate-400">{item.category}</span>
                              <span>•</span>
                              <span>{(item.volumeCbm || 0.1).toFixed(2)} CBM/unit</span>
                              <span>•</span>
                              <span className="text-amber-400 font-mono font-bold">{lineVol} CBM total</span>
                              {isFragile && (
                                <span className="text-rose-400 font-bold bg-rose-500/10 px-1.5 py-0.2 rounded border border-rose-500/20">
                                  FRAGILE
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Quantity Stepper & Delete */}
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg p-0.5">
                            <button
                              type="button"
                              onClick={() => handleUpdateQty(item.id, -1)}
                              className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 rounded font-black"
                              title="Decrease"
                            >
                              -
                            </button>
                            <span className="w-8 text-center font-bold text-white text-xs">{item.qty}</span>
                            <button
                              type="button"
                              onClick={() => handleUpdateQty(item.id, 1)}
                              className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 rounded font-black"
                              title="Increase"
                            >
                              +
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-slate-500 hover:text-rose-400 p-1"
                            title="Remove from packing slip"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Handling Notes & Protocols */}
              <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 sm:p-5 space-y-2">
                <label className="text-xs font-bold text-white block">
                  Cargo Care Directives & Chain-of-Custody Instructions
                </label>
                <textarea
                  rows={2}
                  value={handlingInstructions}
                  onChange={(e) => setHandlingInstructions(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-xl p-3 outline-none focus:border-amber-400"
                />
              </div>
            </div>
          ) : (
            /* Live PDF Document Preview Screen */
            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">
                  Showing digital rendition of <strong>A4 Packing Slip Ref #{packingSlipRef}</strong>
                </span>
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[10px] font-bold">
                  Verified Transit Ready
                </span>
              </div>

              {/* Simulated Paper Sheet */}
              <div className="bg-white text-slate-900 rounded-xl shadow-2xl p-6 sm:p-8 space-y-5 max-w-2xl mx-auto border border-slate-300 text-xs font-sans">
                {/* Letterhead Header */}
                <div className="border-b-2 border-amber-500 pb-4 flex justify-between items-start">
                  <div>
                    <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-950">
                      PYDA MOVERS & LOGISTICS NIGERIA LTD
                    </h2>
                    <p className="text-[10px] text-slate-500">
                      Consignment Packing Slip & Inventory Manifest • RC: 1498210
                    </p>
                    <p className="text-[9px] text-slate-400 mt-1">
                      Lagos Hub: 374/376 Old Ojo Rd, Alakija | Dispatch Line: {companyPhone}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="bg-slate-900 text-amber-400 text-[10px] font-mono font-bold px-2 py-1 rounded inline-block">
                      {packingSlipRef}
                    </span>
                    <p className="text-[9px] text-slate-500 mt-1 font-mono">DATE: {dispatchDate}</p>
                  </div>
                </div>

                {/* Shipper & Consignee 2-col box */}
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded border border-slate-200 text-[10px]">
                  <div>
                    <span className="font-bold text-slate-500 uppercase tracking-wider block text-[8px]">
                      CONSIGNOR / SHIPPER:
                    </span>
                    <p className="font-bold text-slate-900 text-xs mt-0.5">{clientName}</p>
                    {clientCompany && <p className="text-slate-600">{clientCompany}</p>}
                    <p className="text-slate-600">Tel: {clientPhone}</p>
                    <p className="text-slate-600">Origin: {originAddress}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-500 uppercase tracking-wider block text-[8px]">
                      TRANSIT & CARRIER SPECIFICATIONS:
                    </span>
                    <p className="font-bold text-slate-900 text-xs mt-0.5">Dest: {destinationAddress}</p>
                    <p className="text-slate-600">Vehicle: {assignedVehicle}</p>
                    <p className="text-slate-600 font-mono">Seals: {tamperSealRange}</p>
                    <p className="text-slate-600">Driver: {driverName}</p>
                  </div>
                </div>

                {/* Table */}
                <table className="w-full text-left border-collapse text-[10px]">
                  <thead>
                    <tr className="bg-slate-900 text-amber-400">
                      <th className="p-1.5">#</th>
                      <th className="p-1.5">Category</th>
                      <th className="p-1.5">Description</th>
                      <th className="p-1.5 text-center">Qty</th>
                      <th className="p-1.5 text-right">Vol (CBM)</th>
                      <th className="p-1.5 text-center">Verify</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {items.map((item, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                        <td className="p-1.5 text-slate-400 font-mono">{idx + 1}</td>
                        <td className="p-1.5 text-slate-600">{item.category}</td>
                        <td className="p-1.5 font-bold text-slate-900">{item.name}</td>
                        <td className="p-1.5 text-center font-bold">{item.qty}</td>
                        <td className="p-1.5 text-right font-mono text-amber-700">
                          {((item.volumeCbm || 0.1) * (item.qty || 1)).toFixed(2)}m³
                        </td>
                        <td className="p-1.5 text-center text-slate-400 font-mono">[ ]</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-100 font-bold border-t border-slate-300">
                      <td colSpan={3} className="p-1.5 text-slate-900">
                        TOTAL MANIFEST UNITS: {totalPieces} Items
                      </td>
                      <td className="p-1.5 text-center">{totalPieces}</td>
                      <td className="p-1.5 text-right text-amber-800 font-mono">
                        {totalCbm.toFixed(2)}m³ gross
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>

                {/* Sign off blocks */}
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-200 text-[8px]">
                  <div className="border border-slate-200 p-2 rounded text-center">
                    <p className="font-bold text-slate-700">DISPATCH MARSHALL</p>
                    <div className="h-6 border-b border-slate-300 my-1" />
                    <p className="text-slate-500">{inspectorName}</p>
                  </div>
                  <div className="border border-slate-200 p-2 rounded text-center">
                    <p className="font-bold text-slate-700">CONVOY CAPTAIN</p>
                    <div className="h-6 border-b border-slate-300 my-1" />
                    <p className="text-slate-500">{driverName}</p>
                  </div>
                  <div className="border border-slate-200 p-2 rounded text-center">
                    <p className="font-bold text-slate-700">CONSIGNEE HANDOVER</p>
                    <div className="h-6 border-b border-slate-300 my-1" />
                    <p className="text-emerald-700 font-bold">100% Intact Receipt</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Authenticated with Pyda Logistics Zero-Loss GIT Guarantee</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleSaveToVault}
              disabled={isProcessing}
              className="flex-1 sm:flex-initial bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-colors"
            >
              <Save className="w-3.5 h-3.5 text-amber-400" />
              <span>Save to Vault</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isProcessing}
              className="flex-1 sm:flex-initial bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all transform active:scale-95"
            >
              <FileDown className="w-4 h-4" />
              <span>{isProcessing ? 'Generating PDF...' : 'Download PDF Packing Slip'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
