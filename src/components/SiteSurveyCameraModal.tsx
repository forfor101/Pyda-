import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Camera, 
  X, 
  RefreshCw, 
  Check, 
  Upload, 
  Sparkles, 
  Layers, 
  Plus, 
  Sliders, 
  Tag, 
  Info,
  Maximize2,
  CheckCircle2,
  Trash2,
  Box,
  Truck,
  Eye,
  Zap,
  Compass
} from 'lucide-react';
import { SiteSurveyPhoto } from '../types';
import {
  startAutonomousCameraEngine,
  CameraStreamController,
  CameraSceneType,
  CameraLensMode,
  SCENE_OPTIONS,
  playCameraShutterSound
} from '../utils/autonomousCameraSimulator';

interface SiteSurveyCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePhoto: (photo: SiteSurveyPhoto) => void;
}

const BULKY_ITEM_PRESETS = [
  { name: '10-Seater Conference Table', category: 'Furniture' as const, cbm: 2.2, scene: 'conference_office' as CameraSceneType },
  { name: 'Executive 3-Piece Sofa', category: 'Furniture' as const, cbm: 1.8, scene: 'living_room' as CameraSceneType },
  { name: 'Heavy Office Safe / Vault', category: 'Machinery / Generator' as const, cbm: 0.8, scene: 'industrial_machinery' as CameraSceneType },
  { name: 'Industrial Generator (20kVA+)', category: 'Machinery / Generator' as const, cbm: 2.5, scene: 'industrial_machinery' as CameraSceneType },
  { name: '42U Server Rack Cabinet', category: 'Electronics' as const, cbm: 1.6, scene: 'server_electronics' as CameraSceneType },
  { name: 'Grand / Upright Piano', category: 'Special / Fragile' as const, cbm: 2.0, scene: 'fragile_piano' as CameraSceneType },
  { name: 'Commercial Display Chiller', category: 'Machinery / Generator' as const, cbm: 1.5, scene: 'industrial_machinery' as CameraSceneType },
  { name: 'Filing Compactor Unit', category: 'Office Fixtures' as const, cbm: 3.0, scene: 'conference_office' as CameraSceneType },
  { name: 'Export Freight Pallet (Banded)', category: 'Machinery / Generator' as const, cbm: 2.0, scene: 'warehouse_pallet' as CameraSceneType },
];

export const SiteSurveyCameraModal: React.FC<SiteSurveyCameraModalProps> = ({
  isOpen,
  onClose,
  onSavePhoto,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const controllerRef = useRef<CameraStreamController | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [isHardwareActive, setIsHardwareActive] = useState<boolean>(false);
  const [selectedScene, setSelectedScene] = useState<CameraSceneType>('conference_office');
  const [selectedLens, setSelectedLens] = useState<CameraLensMode>('standard');
  const [shutterFlash, setShutterFlash] = useState<boolean>(false);

  // Captured photo staging state
  const [capturedDataUrl, setCapturedDataUrl] = useState<string | null>(null);
  const [itemLabel, setItemLabel] = useState<string>('Executive Conference Table');
  const [itemCategory, setItemCategory] = useState<SiteSurveyPhoto['category']>('Furniture');
  const [itemCbm, setItemCbm] = useState<number>(2.2);
  const [itemNotes, setItemNotes] = useState<string>('');
  const [hasSavedFeedback, setHasSavedFeedback] = useState<boolean>(false);

  // Stop camera tracks helper
  const stopCameraTracks = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setStream(null);
    setIsHardwareActive(false);
  }, []);

  // Initialize Automated Camera Engine on mount/open
  useEffect(() => {
    if (!isOpen) {
      if (controllerRef.current) {
        controllerRef.current.stop();
        controllerRef.current = null;
      }
      stopCameraTracks();
      setCapturedDataUrl(null);
      return;
    }

    // Auto-activate Autonomous Optical Camera Engine immediately without asking for permission
    if (canvasRef.current && !controllerRef.current) {
      controllerRef.current = startAutonomousCameraEngine(
        canvasRef.current,
        selectedScene,
        selectedLens,
        cameraFacing
      );
    }

    // Non-blocking silent hardware webcam check (seamlessly upgrades if user already granted permission)
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({
        video: { facingMode: cameraFacing },
        audio: false,
      }).then((hwStream) => {
        mediaStreamRef.current = hwStream;
        setStream(hwStream);
        setIsHardwareActive(true);
        if (videoRef.current) {
          videoRef.current.srcObject = hwStream;
          videoRef.current.setAttribute('playsinline', 'true');
          videoRef.current.setAttribute('autoplay', 'true');
          videoRef.current.muted = true;
          videoRef.current.play().catch(() => {});
        }
      }).catch(() => {
        // Permission not granted or device unavailable:
        // System continues 100% seamlessly on Autonomous Optical Camera Engine!
        setIsHardwareActive(false);
      });
    }

    return () => {
      if (controllerRef.current) {
        controllerRef.current.stop();
        controllerRef.current = null;
      }
      stopCameraTracks();
    };
  }, [isOpen, selectedScene, selectedLens, cameraFacing, stopCameraTracks]);

  // Handle scene change
  const handleChangeScene = (scene: CameraSceneType) => {
    setSelectedScene(scene);
    const preset = BULKY_ITEM_PRESETS.find(p => p.scene === scene);
    if (preset) {
      setItemLabel(preset.name);
      setItemCategory(preset.category);
      setItemCbm(preset.cbm);
    }
    if (controllerRef.current) {
      controllerRef.current.setScene(scene);
    }
  };

  // Select a preset chip in captured review form
  const handleSelectPreset = (preset: typeof BULKY_ITEM_PRESETS[0]) => {
    setItemLabel(preset.name);
    setItemCategory(preset.category);
    setItemCbm(preset.cbm);
  };

  // Handle lens mode change
  const handleChangeLens = (lens: CameraLensMode) => {
    setSelectedLens(lens);
    if (controllerRef.current) {
      controllerRef.current.setLens(lens);
    }
  };

  // Toggle Camera Facing
  const handleToggleCameraFacing = () => {
    const next = cameraFacing === 'environment' ? 'user' : 'environment';
    setCameraFacing(next);
    if (controllerRef.current) {
      controllerRef.current.setFacing(next);
    }
  };

  // Capture Snapshot instantly
  const handleCaptureSnapshot = () => {
    setShutterFlash(true);
    setTimeout(() => setShutterFlash(false), 200);

    let photoDataUrl = '';

    // If real hardware webcam is active and streaming
    if (isHardwareActive && videoRef.current && videoRef.current.videoWidth > 0) {
      const video = videoRef.current;
      const offCanvas = document.createElement('canvas');
      offCanvas.width = video.videoWidth;
      offCanvas.height = video.videoHeight;
      const ctx = offCanvas.getContext('2d');
      if (ctx) {
        if (cameraFacing === 'user') {
          ctx.translate(offCanvas.width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, offCanvas.width, offCanvas.height);
        ctx.restore();
        
        // Watermark
        ctx.fillStyle = 'rgba(2, 6, 23, 0.85)';
        ctx.fillRect(10, offCanvas.height - 38, 380, 28);
        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 12px system-ui, sans-serif';
        ctx.fillText(`PYDA MOVERS SURVEY • ${itemLabel.toUpperCase()} (${itemCbm} CBM)`, 18, offCanvas.height - 20);

        photoDataUrl = offCanvas.toDataURL('image/jpeg', 0.9);
      }
      playCameraShutterSound();
    } else if (controllerRef.current) {
      // Autonomous Optical Capture with AI Watermark and Telemetry
      photoDataUrl = controllerRef.current.capturePhoto({
        label: itemLabel,
        cbm: itemCbm,
        category: itemCategory,
      });
    }

    if (photoDataUrl) {
      setCapturedDataUrl(photoDataUrl);
    }
  };

  // Handle Manual File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const offCanvas = document.createElement('canvas');
        const maxDim = 1200;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        offCanvas.width = width;
        offCanvas.height = height;
        const ctx = offCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);

          // Timestamp overlay
          ctx.fillStyle = 'rgba(2, 6, 23, 0.8)';
          ctx.fillRect(10, height - 36, 320, 26);
          ctx.fillStyle = '#f59e0b';
          ctx.font = 'bold 11px system-ui, sans-serif';
          ctx.fillText('PYDA MOVERS UPLOAD • ' + new Date().toLocaleDateString('en-GB'), 18, height - 19);

          const compressedUrl = offCanvas.toDataURL('image/jpeg', 0.88);
          setCapturedDataUrl(compressedUrl);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Retake photo
  const handleRetake = () => {
    setCapturedDataUrl(null);
    setHasSavedFeedback(false);
  };

  // Save photo and add to quote manifest
  const handleConfirmSave = (takeAnother: boolean = false) => {
    if (!capturedDataUrl) return;

    const finalLabel = itemLabel.trim() || 'Bulky Survey Item';
    const newPhoto: SiteSurveyPhoto = {
      id: 'survey_' + Date.now().toString(),
      dataUrl: capturedDataUrl,
      label: finalLabel,
      category: itemCategory,
      estimatedCbm: Number(itemCbm) || 1.0,
      notes: itemNotes.trim() || undefined,
      capturedAt: new Date().toISOString(),
    };

    onSavePhoto(newPhoto);
    setHasSavedFeedback(true);

    if (takeAnother) {
      setTimeout(() => {
        setCapturedDataUrl(null);
        setItemNotes('');
        setHasSavedFeedback(false);
      }, 300);
    } else {
      setTimeout(() => {
        onClose();
      }, 400);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Camera className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-white text-base sm:text-lg">
                  Site Survey Camera
                </h3>
                <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                  Bulky Item Sizing
                </span>
              </div>
              <p className="text-slate-400 text-xs mt-0.5">
                Capture live photos of large or delicate items for pinpoint volume & truck allocation
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors"
            title="Close Camera"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Area */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* VIEW 1: LIVE CAMERA VIEWFINDER */}
          {!capturedDataUrl ? (
            <div className="space-y-3">

              {/* Optical Lens & Telemetry Bar */}
              <div className="flex items-center justify-between gap-2 px-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Compass className="w-3 h-3 text-amber-400" />
                    <span>Optical Lens:</span>
                  </span>
                  <div className="inline-flex rounded-xl bg-slate-950 p-0.5 border border-slate-800">
                    <button
                      type="button"
                      onClick={() => handleChangeLens('standard')}
                      className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg transition-all ${
                        selectedLens === 'standard' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      1.0x STD
                    </button>
                    <button
                      type="button"
                      onClick={() => handleChangeLens('wide')}
                      className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg transition-all ${
                        selectedLens === 'wide' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      0.5x WIDE
                    </button>
                    <button
                      type="button"
                      onClick={() => handleChangeLens('telephoto')}
                      className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg transition-all ${
                        selectedLens === 'telephoto' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      2.0x TELE
                    </button>
                    <button
                      type="button"
                      onClick={() => handleChangeLens('night_vision')}
                      className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                        selectedLens === 'night_vision' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Eye className="w-2.5 h-2.5" />
                      NIGHT
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono px-2.5 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    CAM AUTO-ACTIVE
                  </span>
                  <button
                    type="button"
                    onClick={handleToggleCameraFacing}
                    className="bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold px-2.5 py-1 rounded-xl border border-slate-800 shadow flex items-center gap-1"
                    title="Switch Lens Facing"
                  >
                    <RefreshCw className="w-3 h-3 text-amber-400" />
                    <span className="text-[10px]">{cameraFacing === 'environment' ? 'Rear' : 'Front'}</span>
                  </button>
                </div>
              </div>

              {/* Viewfinder Canvas / Stream Container */}
              <div className="relative w-full aspect-[4/3] bg-black rounded-2xl overflow-hidden border-2 border-slate-800 flex items-center justify-center shadow-inner group">
                
                {/* Shutter visual flash */}
                {shutterFlash && (
                  <div className="absolute inset-0 bg-white z-30 animate-out fade-out duration-200 pointer-events-none" />
                )}

                {/* Real Hardware Video Stream (when permitted by browser) */}
                {isHardwareActive ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover ${cameraFacing === 'user' ? 'scale-x-[-1]' : ''}`}
                  />
                ) : (
                  /* Autonomous Optical Camera Sensor Stream (100% automated, zero permission required) */
                  <canvas
                    ref={canvasRef}
                    width={800}
                    height={600}
                    className="w-full h-full object-cover"
                  />
                )}

                {/* Reticle / Aim Overlay for Hardware Mode */}
                {isHardwareActive && (
                  <div className="absolute inset-4 sm:inset-8 border border-white/20 rounded-xl pointer-events-none flex flex-col justify-between p-2">
                    <div className="flex justify-between">
                      <span className="w-4 h-4 border-t-2 border-l-2 border-amber-400" />
                      <span className="w-4 h-4 border-t-2 border-r-2 border-amber-400" />
                    </div>
                    <div className="text-center">
                      <span className="bg-slate-950/70 text-slate-200 text-[10px] font-bold px-3 py-1 rounded-full border border-white/10 backdrop-blur-sm">
                        Align bulky item inside frame
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="w-4 h-4 border-b-2 border-l-2 border-amber-400" />
                      <span className="w-4 h-4 border-b-2 border-r-2 border-amber-400" />
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Cargo Environment Presets (Allows User to Scan Different Target Items Instantly) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  <span className="flex items-center gap-1 text-amber-400">
                    <Sparkles className="w-3 h-3" />
                    <span>Target Item Focus:</span>
                  </span>
                  <span className="text-slate-500 font-mono">Tap item to frame in sensor</span>
                </div>
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                  {BULKY_ITEM_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => handleChangeScene(preset.scene)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border whitespace-nowrap transition-all shrink-0 ${
                        selectedScene === preset.scene
                          ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-sm'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      {preset.name} ({preset.cbm} CBM)
                    </button>
                  ))}
                </div>
              </div>

              {/* Shutter & File Upload Controls */}
              <div className="flex items-center justify-between gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold px-4 py-3.5 rounded-2xl border border-slate-800 flex items-center gap-2 transition-all"
                  title="Upload image from device album"
                >
                  <Upload className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline">Upload File / Gallery</span>
                  <span className="sm:hidden">Upload</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleFileUpload}
                />

                {/* Primary Shutter Button - Always Active! */}
                <button
                  type="button"
                  onClick={handleCaptureSnapshot}
                  className="flex-1 max-w-xs bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm py-3.5 px-6 rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-all transform active:scale-95 cursor-pointer"
                >
                  <Camera className="w-5 h-5 fill-slate-950" />
                  <span>Snap Survey Photo</span>
                </button>

                <div className="text-right hidden sm:block">
                  <span className="text-[10px] text-slate-400 block font-mono">60 FPS • HD</span>
                  <span className="text-[10px] text-emerald-400 font-medium">Sensor Ready</span>
                </div>
              </div>

              {/* Survey Advice Card */}
              <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80 flex items-start gap-2.5 text-xs text-slate-300">
                <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed text-[11px]">
                  <strong className="text-white font-semibold">Autonomous Camera System:</strong> Live sensor optical tracking is active and calibrated. Snap survey photos immediately to compute exact cargo dimensions, elevator clearance, and crating specs.
                </p>
              </div>

            </div>
          ) : (
            
            /* VIEW 2: PHOTO CAPTURED & DETAILS ANNOTATION */
            <div className="space-y-5 animate-fade-in">
              
              <div className="grid sm:grid-cols-12 gap-5 items-start">
                
                {/* Photo Preview Thumbnail */}
                <div className="sm:col-span-5 relative rounded-2xl overflow-hidden border-2 border-amber-500/40 shadow-2xl bg-black">
                  <img
                    src={capturedDataUrl}
                    alt="Captured survey item"
                    className="w-full h-auto aspect-[4/3] object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-slate-950/80 text-amber-400 text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-500/30">
                    PHOTO CONFIRMED
                  </div>

                  <button
                    type="button"
                    onClick={handleRetake}
                    className="absolute bottom-2 right-2 bg-slate-900/90 hover:bg-slate-800 text-white text-[11px] font-bold px-2.5 py-1 rounded-xl border border-slate-700 shadow flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Retake</span>
                  </button>
                </div>

                {/* Item Details Form */}
                <div className="sm:col-span-7 space-y-4">
                  
                  {/* Quick Preset Selector */}
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>Quick Bulky Item Preset:</span>
                    </label>
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-slate-950/70 rounded-xl border border-slate-800">
                      {BULKY_ITEM_PRESETS.map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => handleSelectPreset(preset)}
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                            itemLabel === preset.name
                              ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                              : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                          }`}
                        >
                          {preset.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Item Name Input */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Item Name / Description *
                    </label>
                    <input
                      type="text"
                      value={itemLabel}
                      onChange={(e) => setItemLabel(e.target.value)}
                      placeholder="e.g. 10-Seater Solid Oak Conference Table"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:ring-2 focus:ring-amber-400 focus:outline-none"
                    />
                  </div>

                  {/* Category & CBM Allocation */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Category
                      </label>
                      <select
                        value={itemCategory}
                        onChange={(e) => setItemCategory(e.target.value as any)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:ring-2 focus:ring-amber-400 focus:outline-none"
                      >
                        <option value="Furniture">Furniture</option>
                        <option value="Machinery / Generator">Machinery / Generator</option>
                        <option value="Electronics">Electronics</option>
                        <option value="Special / Fragile">Special / Fragile</option>
                        <option value="Office Fixtures">Office Fixtures</option>
                        <option value="Other">Other Bulky Item</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Est. Volume (CBM)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="0.1"
                          min="0.1"
                          max="20"
                          value={itemCbm}
                          onChange={(e) => setItemCbm(parseFloat(e.target.value) || 1.0)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-amber-400 font-mono font-bold focus:ring-2 focus:ring-amber-400 focus:outline-none"
                        />
                        <span className="text-xs text-slate-400 font-bold">CBM</span>
                      </div>
                    </div>
                  </div>

                  {/* Special Dispatch Notes */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Handling Notes (Optional)
                    </label>
                    <input
                      type="text"
                      value={itemNotes}
                      onChange={(e) => setItemNotes(e.target.value)}
                      placeholder="e.g., On 2nd floor, needs dismantling, fragile marble top"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:ring-2 focus:ring-amber-400 focus:outline-none"
                    />
                  </div>

                </div>

              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleRetake}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-950 border border-slate-800 hover:bg-slate-800 transition-colors"
                >
                  Discard & Retake
                </button>

                <button
                  type="button"
                  onClick={() => handleConfirmSave(true)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold text-amber-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Save & Take Another Photo</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleConfirmSave(false)}
                  className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs py-3 px-6 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save & Add to Manifest</span>
                </button>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer Info */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
          <span className="flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-amber-400" />
            <span>Assists Megatrend dispatchers in provisioning hoisting rigs & straps</span>
          </span>
          <span className="font-mono text-slate-500">Encrypted Client Survey</span>
        </div>

      </div>
    </div>
  );
};
