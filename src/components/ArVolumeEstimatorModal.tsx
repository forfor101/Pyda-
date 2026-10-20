import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  X,
  Maximize2,
  Minimize2,
  Box,
  Compass,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Sliders,
  Layers,
  ArrowRight,
  Crosshair,
  Info,
  ShieldCheck,
  Check,
  RotateCcw,
  Zap,
  Target,
  Ruler,
  MoveHorizontal,
  MoveVertical,
  Plus,
  Trash2,
  Gauge,
  Scale,
  CornerDownRight,
  HelpCircle
} from 'lucide-react';
import { InspectedCargoItem, SiteSurveyPhoto } from '../types';
import {
  startAutonomousCameraEngine,
  CameraStreamController,
} from '../utils/autonomousCameraSimulator';

export type MeasureMode = 'overlay_ruler' | '3d_box' | 'point_laser';
export type RulerDimensionType = 'length' | 'height' | 'width' | 'irregular';
export type IrregularProfileType = 'solid' | 'l_shaped' | 'cylindrical' | 'curved' | 'open_frame' | 'custom';

export interface RulerSegment {
  id: string;
  label: string;
  dimensionType: RulerDimensionType;
  start: { x: number; y: number };
  end: { x: number; y: number };
  distanceM: number;
}

export const IRREGULAR_PROFILES: {
  id: IrregularProfileType;
  name: string;
  factor: number;
  description: string;
  badge: string;
}[] = [
  {
    id: 'solid',
    name: 'Solid Box / Standard Crate',
    factor: 1.0,
    description: 'Standard rectangular crates & boxy furniture (100% volume envelope)',
    badge: '100% Vol',
  },
  {
    id: 'l_shaped',
    name: 'L-Shaped Sectional / Corner',
    factor: 0.65,
    description: 'Corner couches & angled executive desks with open quadrant voids',
    badge: '65% Vol',
  },
  {
    id: 'cylindrical',
    name: 'Cylindrical / Drum / Gen-Set',
    factor: 0.785,
    description: 'Heavy generator plants, cable drums & cylindrical tanks (π/4 ratio)',
    badge: '78.5% Vol',
  },
  {
    id: 'curved',
    name: 'Curved / Sculpted / Piano Wing',
    factor: 0.55,
    description: 'Pianos, bronze sculptures, arch-top furniture & irregular artwork',
    badge: '55% Vol',
  },
  {
    id: 'open_frame',
    name: 'Open Frame / Truss / Machinery',
    factor: 0.45,
    description: 'Industrial lathes, multi-gym equipment, ladders & bike frames',
    badge: '45% Vol',
  },
];

export const DISTANCE_CALIBRATION_PRESETS = [
  { id: 'close', label: 'Close (~1.0m)', pxPerMeter: 220, hint: 'Items within arm reach' },
  { id: 'medium', label: 'Standard (~2.0m)', pxPerMeter: 120, hint: 'Standard room cargo & large furniture' },
  { id: 'large', label: 'Large Item (~3.5m)', pxPerMeter: 75, hint: 'Large machinery, generators & vehicles' },
  { id: 'bay', label: 'Warehouse (~5.0m)', pxPerMeter: 50, hint: 'Full pallet bays, trucks & high crates' },
];

// Preset standard cargo spatial dimensions (in meters)
const CARGO_SHAPE_PRESETS = [
  { name: 'L-Shaped Sectional Couch', length: 2.45, width: 1.85, height: 0.85, category: 'Furniture', profile: 'l_shaped' as IrregularProfileType },
  { name: 'Diesel Generator 35kVA', length: 2.10, width: 1.05, height: 1.35, category: 'Industrial Freight', profile: 'cylindrical' as IrregularProfileType },
  { name: 'Grand Piano (Wing)', length: 2.15, width: 1.55, height: 1.02, category: 'Artwork & Antiques', profile: 'curved' as IrregularProfileType },
  { name: 'Commercial Lathe / Gym Rack', length: 2.10, width: 0.95, height: 1.55, category: 'Industrial Freight', profile: 'open_frame' as IrregularProfileType },
  { name: 'Executive Desk', length: 1.6, width: 0.8, height: 0.75, category: 'Furniture', profile: 'solid' as IrregularProfileType },
  { name: '65" OLED TV Box', length: 1.55, width: 0.22, height: 0.92, category: 'Electronics & IT', profile: 'solid' as IrregularProfileType },
  { name: '3-Seater Sofa', length: 2.15, width: 0.92, height: 0.85, category: 'Furniture', profile: 'solid' as IrregularProfileType },
  { name: 'Dining Table Suite', length: 1.8, width: 1.0, height: 0.78, category: 'Furniture & Glassware', profile: 'solid' as IrregularProfileType },
  { name: 'Heavy Pallet Crate', length: 1.2, width: 1.0, height: 1.45, category: 'Industrial Freight', profile: 'solid' as IrregularProfileType },
  { name: 'Tall Wardrobe', length: 1.2, width: 0.62, height: 1.95, category: 'Furniture', profile: 'solid' as IrregularProfileType },
  { name: 'Server Rack 42U', length: 0.8, width: 1.0, height: 2.05, category: 'IT Infrastructure', profile: 'solid' as IrregularProfileType },
  { name: 'Dish-Pack Carton', length: 0.48, width: 0.48, height: 0.72, category: 'Cartons & Sundry', profile: 'solid' as IrregularProfileType },
];

function metersToFeetInches(meters: number): string {
  const totalInches = meters * 39.3701;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return `${feet}' ${inches}"`;
}

interface ArVolumeEstimatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingItems?: InspectedCargoItem[];
  selectedItemToMeasure?: InspectedCargoItem | null;
  onSaveMeasurement: (result: {
    itemName: string;
    category: string;
    lengthM: number;
    widthM: number;
    heightM: number;
    cbm: number;
    snapshotDataUrl?: string;
    targetItemId?: string;
  }) => void;
}

export const ArVolumeEstimatorModal: React.FC<ArVolumeEstimatorModalProps> = ({
  isOpen,
  onClose,
  existingItems = [],
  selectedItemToMeasure = null,
  onSaveMeasurement,
}) => {
  // Dimension state (in meters)
  const [lengthM, setLengthM] = useState<number>(1.2);
  const [widthM, setWidthM] = useState<number>(0.8);
  const [heightM, setHeightM] = useState<number>(0.75);

  // Target item binding
  const [targetItemId, setTargetItemId] = useState<string>(selectedItemToMeasure?.id || '');
  const [customItemName, setCustomItemName] = useState<string>(selectedItemToMeasure?.itemName || 'AR Measured Cargo Item');
  const [customCategory, setCustomCategory] = useState<string>(selectedItemToMeasure?.category || 'Furniture');

  // Video & Canvas Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const bgCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const controllerRef = useRef<CameraStreamController | null>(null);

  // Camera & Device State - Automatically active without permission prompts
  const [isCameraActive, setIsCameraActive] = useState<boolean>(true);
  const [isHardwareActive, setIsHardwareActive] = useState<boolean>(false);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);

  // AR Spatial Orientation Tracking (Gyroscope)
  const [gyroPitch, setGyroPitch] = useState<number>(0);
  const [gyroRoll, setGyroRoll] = useState<number>(0);
  const [gyroYaw, setGyroYaw] = useState<number>(0);

  // Measurement Mode Selection: default to overlay_ruler as requested
  const [measureMode, setMeasureMode] = useState<MeasureMode>('overlay_ruler');

  // =========================================================================
  // SCREEN-OVERLAY RULER STATE (MANUAL TAP-TO-MEASURE FOR IRREGULAR ITEMS)
  // =========================================================================
  const [rulerDimensionType, setRulerDimensionType] = useState<RulerDimensionType>('length');
  const [rulerStart, setRulerStart] = useState<{ x: number; y: number } | null>(null);
  const [rulerEnd, setRulerEnd] = useState<{ x: number; y: number } | null>(null);
  const [activeDragPoint, setActiveDragPoint] = useState<'start' | 'end' | null>(null);
  const [snapToAxis, setSnapToAxis] = useState<boolean>(true);
  const [pxPerMeter, setPxPerMeter] = useState<number>(120);
  const [distancePreset, setDistancePreset] = useState<'close' | 'medium' | 'large' | 'bay'>('medium');
  const [savedSegments, setSavedSegments] = useState<RulerSegment[]>([]);
  const [hoverPointerPos, setHoverPointerPos] = useState<{ x: number; y: number } | null>(null);
  const [showRulerHelp, setShowRulerHelp] = useState<boolean>(false);
  const [appliedToast, setAppliedToast] = useState<string | null>(null);

  // =========================================================================
  // IRREGULAR CARGO VOLUME & PACKING FACTOR STATE
  // =========================================================================
  const [irregularProfile, setIrregularProfile] = useState<IrregularProfileType>('solid');
  const [customPackingFactor, setCustomPackingFactor] = useState<number>(100);

  // 3D Wireframe Positioning & Interaction
  const [boxRotationY, setBoxRotationY] = useState<number>(25);
  const [boxRotationX, setBoxRotationX] = useState<number>(15);
  const [isDraggingBox, setIsDraggingBox] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Point to point laser measurement pins
  const [laserPoints, setLaserPoints] = useState<{ x: number; y: number; label: string }[]>([]);

  // Calculate live volume and irregular packing factor
  const currentPackingFactor = irregularProfile === 'custom'
    ? customPackingFactor / 100
    : (IRREGULAR_PROFILES.find((p) => p.id === irregularProfile)?.factor || 1.0);

  const grossCbm = parseFloat((lengthM * widthM * heightM).toFixed(3));
  const grossCuFt = parseFloat((grossCbm * 35.3147).toFixed(1));
  const cbmVolume = parseFloat((grossCbm * currentPackingFactor).toFixed(3));
  const cuFtVolume = parseFloat((cbmVolume * 35.3147).toFixed(1));

  // Compute live distance of current active ruler on screen
  const getActiveRulerDistanceM = useCallback(() => {
    if (!rulerStart || !rulerEnd) return 0;
    const distPx = Math.hypot(rulerEnd.x - rulerStart.x, rulerEnd.y - rulerStart.y);
    return Math.max(0.05, parseFloat((distPx / pxPerMeter).toFixed(2)));
  }, [rulerStart, rulerEnd, pxPerMeter]);

  const activeRulerDistanceM = getActiveRulerDistanceM();

  // Populate item details if selected
  useEffect(() => {
    if (selectedItemToMeasure) {
      setTargetItemId(selectedItemToMeasure.id);
      setCustomItemName(selectedItemToMeasure.itemName);
      setCustomCategory(selectedItemToMeasure.category);

      if (selectedItemToMeasure.arDimensions) {
        setLengthM(selectedItemToMeasure.arDimensions.lengthM);
        setWidthM(selectedItemToMeasure.arDimensions.widthM);
        setHeightM(selectedItemToMeasure.arDimensions.heightM);
      } else if (selectedItemToMeasure.estimatedCbm > 0) {
        const cubicRoot = Math.cbrt(selectedItemToMeasure.estimatedCbm);
        setLengthM(parseFloat((cubicRoot * 1.2).toFixed(2)));
        setWidthM(parseFloat(cubicRoot.toFixed(2)));
        setHeightM(parseFloat((cubicRoot * 0.8).toFixed(2)));
      }
    }
  }, [selectedItemToMeasure]);

  // Request & attach DeviceOrientation sensor
  const initOrientationSensors = useCallback(async () => {
    try {
      if (
        typeof DeviceOrientationEvent !== 'undefined' &&
        typeof (DeviceOrientationEvent as any).requestPermission === 'function'
      ) {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        if (permission === 'granted') {
          // Gyro enabled
        }
      }
    } catch (e) {
      console.warn('Gyroscope permission request skipped or not supported:', e);
    }
  }, []);

  // Listen to device motion and track spatial sweep
  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      const pitch = e.beta || 0;
      const roll = e.gamma || 0;
      const yaw = e.alpha || 0;
      setGyroPitch(Math.round(pitch));
      setGyroRoll(Math.round(roll));
      setGyroYaw(Math.round(yaw));
    };

    if (isOpen) {
      window.addEventListener('deviceorientation', handleOrientation);
      initOrientationSensors();
    }
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [isOpen, initOrientationSensors]);

  // Auto-activate Camera Viewport when modal opens
  useEffect(() => {
    if (!isOpen) {
      if (controllerRef.current) {
        controllerRef.current.stop();
        controllerRef.current = null;
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }
      setIsHardwareActive(false);
      return;
    }

    // 1. Immediately start Autonomous Optical Camera stream on background canvas
    if (bgCanvasRef.current && !controllerRef.current) {
      controllerRef.current = startAutonomousCameraEngine(
        bgCanvasRef.current,
        'conference_office',
        'wide',
        cameraFacing
      );
    }
    setIsCameraActive(true);

    // 2. Silent non-blocking hardware camera check in background
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({
        video: { facingMode: cameraFacing },
        audio: false,
      }).then((hwStream) => {
        mediaStreamRef.current = hwStream;
        setIsHardwareActive(true);
        if (videoRef.current) {
          videoRef.current.srcObject = hwStream;
          videoRef.current.setAttribute('playsinline', 'true');
          videoRef.current.setAttribute('autoplay', 'true');
          videoRef.current.muted = true;
          videoRef.current.play().catch(() => {});
        }
      }).catch(() => {
        // Continue seamlessly with Autonomous Optical Camera stream
        setIsHardwareActive(false);
      });
    }

    return () => {
      if (controllerRef.current) {
        controllerRef.current.stop();
        controllerRef.current = null;
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }
    };
  }, [isOpen, cameraFacing]);

  // Initialize screen-overlay ruler in center of canvas if empty
  useEffect(() => {
    if (measureMode === 'overlay_ruler' && !rulerStart && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const w = rect.width || 600;
      const h = rect.height || 420;
      const cx = w / 2;
      const cy = h / 2 + 10;
      const initialPixelSpan = Math.min(w * 0.7, lengthM * pxPerMeter);
      setRulerStart({ x: Math.round(cx - initialPixelSpan / 2), y: Math.round(cy) });
      setRulerEnd({ x: Math.round(cx + initialPixelSpan / 2), y: Math.round(cy) });
    }
  }, [measureMode, rulerStart, pxPerMeter, lengthM]);

  // Apply distance preset
  const handleSelectDistancePreset = (presetId: 'close' | 'medium' | 'large' | 'bay') => {
    const found = DISTANCE_CALIBRATION_PRESETS.find((p) => p.id === presetId);
    if (found) {
      setDistancePreset(presetId);
      setPxPerMeter(found.pxPerMeter);
    }
  };

  // Quick Action: Apply current ruler measurement to target dimension
  const handleApplyRulerToDimension = (dim: 'length' | 'width' | 'height') => {
    const dist = activeRulerDistanceM;
    if (dim === 'length') {
      setLengthM(dist);
      setAppliedToast(`Applied ${dist}m to Length (Span)`);
    } else if (dim === 'width') {
      setWidthM(dist);
      setAppliedToast(`Applied ${dist}m to Width (Depth)`);
    } else if (dim === 'height') {
      setHeightM(dist);
      setAppliedToast(`Applied ${dist}m to Height (Vertical)`);
    }
    setTimeout(() => setAppliedToast(null), 3000);
  };

  // Save current segment to saved segments list
  const handleSaveActiveSegment = () => {
    if (!rulerStart || !rulerEnd) return;
    const dist = activeRulerDistanceM;
    const newSeg: RulerSegment = {
      id: `seg_${Date.now()}`,
      label: `${rulerDimensionType.toUpperCase()} #${savedSegments.length + 1}`,
      dimensionType: rulerDimensionType,
      start: { ...rulerStart },
      end: { ...rulerEnd },
      distanceM: dist,
    };
    setSavedSegments((prev) => [...prev, newSeg]);
    setAppliedToast(`Saved ${rulerDimensionType.toUpperCase()} segment (${dist}m)`);
    setTimeout(() => setAppliedToast(null), 2500);
  };

  // Reset ruler
  const handleResetRuler = () => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2 + 10;
    const initialSpan = lengthM * pxPerMeter;
    setRulerStart({ x: Math.round(cx - initialSpan / 2), y: Math.round(cy) });
    setRulerEnd({ x: Math.round(cx + initialSpan / 2), y: Math.round(cy) });
  };

  // =========================================================================
  // RENDER CANVAS HUD & SCREEN-OVERLAY RULER
  // =========================================================================
  const renderArOverlay = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Synchronize canvas buffer resolution with DOM bounding box
    const rect = canvas.getBoundingClientRect();
    if (canvas.width !== rect.width || canvas.height !== rect.height) {
      canvas.width = rect.width;
      canvas.height = rect.height;
    }

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2 + 20;

    // 1. Draw Horizon & Gyro Alignment Guide
    ctx.save();
    ctx.strokeStyle = Math.abs(gyroRoll) < 3 ? 'rgba(16, 185, 129, 0.45)' : 'rgba(245, 158, 11, 0.4)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    const horizonY = centerY - 120 + gyroPitch * 1.2;
    ctx.beginPath();
    ctx.moveTo(centerX - 100, horizonY);
    ctx.lineTo(centerX + 100, horizonY);
    ctx.stroke();
    ctx.restore();

    // 2. Draw Floor Perspective Grid
    ctx.save();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
    ctx.lineWidth = 1;
    const gridY = centerY + 80;
    for (let i = -3; i <= 3; i++) {
      ctx.beginPath();
      ctx.moveTo(centerX + i * 40 - 50, gridY + 50);
      ctx.lineTo(centerX + i * 20, gridY - 15);
      ctx.stroke();
    }
    for (let j = 0; j <= 3; j++) {
      ctx.beginPath();
      ctx.moveTo(centerX - 140 + j * 20, gridY + j * 16);
      ctx.lineTo(centerX + 140 - j * 20, gridY + j * 16);
      ctx.stroke();
    }
    ctx.restore();

    // =======================================================================
    // MODE A: SCREEN-OVERLAY RULER (TAP-TO-MEASURE CALIPER FOR IRREGULAR ITEMS)
    // =======================================================================
    if (measureMode === 'overlay_ruler') {
      // Draw previously saved segments as dashed reference lines
      savedSegments.forEach((seg, idx) => {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(seg.start.x, seg.start.y);
        ctx.lineTo(seg.end.x, seg.end.y);
        ctx.strokeStyle = seg.dimensionType === 'height' ? 'rgba(56, 189, 248, 0.6)' : 'rgba(16, 185, 129, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 4]);
        ctx.stroke();

        // End caps
        [seg.start, seg.end].forEach((pt) => {
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 3, 0, Math.PI * 2);
          ctx.fillStyle = '#10b981';
          ctx.fill();
        });

        // Pill badge
        const midX = (seg.start.x + seg.end.x) / 2;
        const midY = (seg.start.y + seg.end.y) / 2;
        drawBadge(ctx, `${seg.label}: ${seg.distanceM}m`, midX, midY - 10, 'rgba(15, 23, 42, 0.85)', '#10b981');
        ctx.restore();
      });

      // Draw Active Live Caliper Ruler
      if (rulerStart && rulerEnd) {
        const dx = rulerEnd.x - rulerStart.x;
        const dy = rulerEnd.y - rulerStart.y;
        const distPx = Math.hypot(dx, dy);
        const angleRad = Math.atan2(dy, dx);
        const angleDeg = Math.round((angleRad * 180) / Math.PI);
        const normX = dx / (distPx || 1);
        const normY = dy / (distPx || 1);
        const perpX = -normY;
        const perpY = normX;

        // 1. Frosted Translucent Caliper Ribbon
        ctx.save();
        const ribbonWidth = 24;
        ctx.beginPath();
        ctx.moveTo(rulerStart.x + perpX * (ribbonWidth / 2), rulerStart.y + perpY * (ribbonWidth / 2));
        ctx.lineTo(rulerEnd.x + perpX * (ribbonWidth / 2), rulerEnd.y + perpY * (ribbonWidth / 2));
        ctx.lineTo(rulerEnd.x - perpX * (ribbonWidth / 2), rulerEnd.y - perpY * (ribbonWidth / 2));
        ctx.lineTo(rulerStart.x - perpX * (ribbonWidth / 2), rulerStart.y - perpY * (ribbonWidth / 2));
        ctx.closePath();
        ctx.fillStyle = 'rgba(15, 23, 42, 0.72)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();

        // 2. Neon Laser Centerline
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(rulerStart.x, rulerStart.y);
        ctx.lineTo(rulerEnd.x, rulerEnd.y);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 8;
        ctx.stroke();
        ctx.restore();

        // 3. Perpendicular Caliper Jaws (End Brackets)
        const jawLength = 28;
        [rulerStart, rulerEnd].forEach((pt, isEnd) => {
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(pt.x + perpX * jawLength, pt.y + perpY * jawLength);
          ctx.lineTo(pt.x - perpX * jawLength, pt.y - perpY * jawLength);
          ctx.strokeStyle = isEnd ? '#38bdf8' : '#f59e0b';
          ctx.lineWidth = 2.5;
          ctx.shadowColor = isEnd ? '#38bdf8' : '#f59e0b';
          ctx.shadowBlur = 8;
          ctx.stroke();

          // End stops
          ctx.beginPath();
          ctx.arc(pt.x + perpX * jawLength, pt.y + perpY * jawLength, 2.5, 0, Math.PI * 2);
          ctx.arc(pt.x - perpX * jawLength, pt.y - perpY * jawLength, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = isEnd ? '#38bdf8' : '#f59e0b';
          ctx.fill();
          ctx.restore();
        });

        // 4. Optical Ruler Calibrated Metric Tick Marks
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.fillStyle = '#cbd5e1';
        ctx.font = 'bold 9px monospace';
        const totalDistanceM = distPx / pxPerMeter;

        // Subdivided ticks every 10cm, major tick every 50cm
        const stepM = 0.1; // 10cm
        const numSteps = Math.floor(totalDistanceM / stepM);

        for (let i = 1; i <= numSteps; i++) {
          const currentM = i * stepM;
          const currentPx = currentM * pxPerMeter;
          if (currentPx > distPx - 8) break;

          const tickX = rulerStart.x + normX * currentPx;
          const tickY = rulerStart.y + normY * currentPx;
          const isMajor = Math.round(currentM * 10) % 5 === 0; // every 50cm
          const tickH = isMajor ? 11 : 6;

          ctx.beginPath();
          ctx.moveTo(tickX, tickY);
          ctx.lineTo(tickX + perpX * tickH, tickY + perpY * tickH);
          ctx.lineWidth = isMajor ? 1.5 : 1;
          ctx.stroke();

          if (isMajor && currentPx < distPx - 20) {
            ctx.save();
            ctx.translate(tickX + perpX * 16, tickY + perpY * 16);
            ctx.rotate(angleRad);
            ctx.fillText(`${currentM.toFixed(1)}m`, -10, 3);
            ctx.restore();
          }
        }
        ctx.restore();

        // 5. Interactive Caliper Handles (A and B)
        const drawHandle = (pt: { x: number; y: number }, label: string, color: string, isActive: boolean) => {
          ctx.save();
          // Pulsing halo ring
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, isActive ? 22 : 17, 0, Math.PI * 2);
          ctx.strokeStyle = color;
          ctx.lineWidth = 2;
          ctx.shadowColor = color;
          ctx.shadowBlur = isActive ? 14 : 8;
          ctx.stroke();

          // Translucent fill
          ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
          ctx.fill();

          // Inner disc
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 8, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();

          // Text Label
          ctx.font = 'black 11px monospace';
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(label, pt.x, pt.y - 25);
          ctx.restore();
        };

        drawHandle(rulerStart, 'CALIPER A', '#f59e0b', activeDragPoint === 'start');
        drawHandle(rulerEnd, 'CALIPER B', '#38bdf8', activeDragPoint === 'end');

        // 6. Floating High-Contrast Ruler Readout Badge
        const midX = (rulerStart.x + rulerEnd.x) / 2;
        const midY = (rulerStart.y + rulerEnd.y) / 2;
        const badgeOffsetY = perpY * 34;
        const badgeOffsetX = perpX * 34;

        ctx.save();
        const primaryText = `${activeRulerDistanceM} m (${Math.round(activeRulerDistanceM * 100)} cm)`;
        const imperialText = metersToFeetInches(activeRulerDistanceM);
        const dimensionName = rulerDimensionType.toUpperCase();
        const angleStatus = Math.abs(angleDeg) < 2
          ? '0° [H-SNAP]'
          : (Math.abs(Math.abs(angleDeg) - 90) < 2 ? '90° [V-SNAP]' : `${angleDeg}°`);

        drawRulerCalloutBadge(
          ctx,
          primaryText,
          `${imperialText} • ${dimensionName} • ${angleStatus}`,
          midX + badgeOffsetX,
          midY + badgeOffsetY
        );
        ctx.restore();

        // 7. Precision Magnifier Loupe when dragging handles
        if (activeDragPoint) {
          const dragPoint = activeDragPoint === 'start' ? rulerStart : rulerEnd;
          const loupeR = 38;
          const loupeY = Math.max(loupeR + 10, dragPoint.y - 70);
          const loupeX = dragPoint.x;

          ctx.save();
          // Circular Loupe Background with shadow
          ctx.beginPath();
          ctx.arc(loupeX, loupeY, loupeR, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
          ctx.fill();
          ctx.strokeStyle = activeDragPoint === 'start' ? '#f59e0b' : '#38bdf8';
          ctx.lineWidth = 2.5;
          ctx.shadowColor = '#000000';
          ctx.shadowBlur = 12;
          ctx.stroke();
          ctx.clip();

          // Precision crosshair lines inside loupe
          ctx.beginPath();
          ctx.moveTo(loupeX - loupeR, loupeY);
          ctx.lineTo(loupeX + loupeR, loupeY);
          ctx.moveTo(loupeX, loupeY - loupeR);
          ctx.lineTo(loupeX, loupeY + loupeR);
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 1;
          ctx.stroke();

          // Reticle Ring
          ctx.beginPath();
          ctx.arc(loupeX, loupeY, 8, 0, Math.PI * 2);
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.restore();

          // Loupe Label
          ctx.save();
          ctx.font = 'bold 9px monospace';
          ctx.fillStyle = '#f59e0b';
          ctx.textAlign = 'center';
          ctx.fillText('2.5x ALIGNMENT LOUPE', loupeX, loupeY - loupeR - 4);
          ctx.restore();
        }
      }
    }

    // =======================================================================
    // MODE B: 3D WIREFRAME BOUNDING BOX WITH GYRO HUD
    // =======================================================================
    else if (measureMode === '3d_box') {
      const scale = 110;
      const lx = (lengthM * scale) / 2;
      const wy = (heightM * scale) / 2;
      const lz = (widthM * scale) / 2;

      const rotYRad = ((boxRotationY + gyroRoll * 0.4) * Math.PI) / 180;
      const rotXRad = ((boxRotationX + gyroPitch * 0.2) * Math.PI) / 180;

      const cosY = Math.cos(rotYRad);
      const sinY = Math.sin(rotYRad);
      const cosX = Math.cos(rotXRad);
      const sinX = Math.sin(rotXRad);

      const corners3D = [
        [-lx, -wy, -lz],
        [lx, -wy, -lz],
        [lx, wy, -lz],
        [-lx, wy, -lz],
        [-lx, -wy, lz],
        [lx, -wy, lz],
        [lx, wy, lz],
        [-lx, wy, lz],
      ];

      const projected = corners3D.map(([x, y, z]) => {
        const x1 = x * cosY + z * sinY;
        const z1 = -x * sinY + z * cosY;
        const y2 = y * cosX - z1 * sinX;
        const z2 = y * sinX + z1 * cosX;
        const distance = 400;
        const fov = distance / (distance + z2);
        return {
          x: centerX + x1 * fov,
          y: centerY + y2 * fov,
          z: z2,
        };
      });

      const faces = [
        [0, 1, 2, 3],
        [4, 5, 6, 7],
        [0, 1, 5, 4],
        [3, 2, 6, 7],
        [0, 3, 7, 4],
        [1, 2, 6, 5],
      ];

      faces.forEach((face, idx) => {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(projected[face[0]].x, projected[face[0]].y);
        for (let i = 1; i < face.length; i++) {
          ctx.lineTo(projected[face[i]].x, projected[face[i]].y);
        }
        ctx.closePath();
        ctx.fillStyle = idx === 3 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(56, 189, 248, 0.08)';
        ctx.fill();
        ctx.restore();
      });

      const edges = [
        [0, 1], [1, 2], [2, 3], [3, 0],
        [4, 5], [5, 6], [6, 7], [7, 4],
        [0, 4], [1, 5], [2, 6], [3, 7],
      ];

      ctx.save();
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.9)';
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 8;

      edges.forEach(([i, j]) => {
        ctx.beginPath();
        ctx.moveTo(projected[i].x, projected[i].y);
        ctx.lineTo(projected[j].x, projected[j].y);
        ctx.stroke();
      });
      ctx.restore();

      projected.forEach((p, idx) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = idx >= 4 ? '#f59e0b' : '#38bdf8';
        ctx.shadowColor = idx >= 4 ? '#f59e0b' : '#38bdf8';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.restore();
      });

      // Callout dimensions
      const pLMidX = (projected[4].x + projected[5].x) / 2;
      const pLMidY = (projected[4].y + projected[5].y) / 2 + 16;
      drawBadge(ctx, `L: ${lengthM.toFixed(2)}m`, pLMidX, pLMidY, 'rgba(15, 23, 42, 0.85)', '#38bdf8');

      const pWMidX = (projected[1].x + projected[5].x) / 2 + 25;
      const pWMidY = (projected[1].y + projected[5].y) / 2;
      drawBadge(ctx, `W: ${widthM.toFixed(2)}m`, pWMidX, pWMidY, 'rgba(15, 23, 42, 0.85)', '#38bdf8');

      const pHMidX = projected[4].x - 36;
      const pHMidY = (projected[4].y + projected[7].y) / 2;
      drawBadge(ctx, `H: ${heightM.toFixed(2)}m`, pHMidX, pHMidY, 'rgba(15, 23, 42, 0.85)', '#38bdf8');

      // Center Volume HUD Callout
      const centerBoxY = (projected[3].y + projected[7].y) / 2 - 25;
      drawVolumeBadge(
        ctx,
        `${cbmVolume} CBM ${irregularProfile !== 'solid' ? `(${Math.round(currentPackingFactor * 100)}% Net)` : ''}`,
        `Gross: ${grossCbm} CBM (${cuFtVolume} cu ft)`,
        centerX,
        centerBoxY
      );
    }

    // =======================================================================
    // MODE C: POINT-TO-POINT LASER TAPE
    // =======================================================================
    else if (measureMode === 'point_laser') {
      ctx.save();
      laserPoints.forEach((pt, idx) => {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#f59e0b';
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 10;
        ctx.fill();

        ctx.font = 'bold 11px monospace';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(pt.label, pt.x + 10, pt.y - 8);

        if (idx > 0) {
          ctx.beginPath();
          ctx.moveTo(laserPoints[idx - 1].x, laserPoints[idx - 1].y);
          ctx.lineTo(pt.x, pt.y);
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      });
      ctx.restore();
    }
  }, [
    measureMode,
    rulerStart,
    rulerEnd,
    activeDragPoint,
    savedSegments,
    activeRulerDistanceM,
    rulerDimensionType,
    lengthM,
    widthM,
    heightM,
    boxRotationX,
    boxRotationY,
    gyroPitch,
    gyroRoll,
    laserPoints,
    cbmVolume,
    cuFtVolume,
    grossCbm,
    currentPackingFactor,
    irregularProfile,
    pxPerMeter
  ]);

  // Animation frame loop for continuous real-time rendering
  useEffect(() => {
    let animId: number;
    const loop = () => {
      renderArOverlay();
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [renderArOverlay]);

  // Pointer event coordinate extractor
  const getCanvasCoords = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  // Touch & Pointer Down handler
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasCoords(e);
    setHoverPointerPos({ x, y });

    if (measureMode === 'overlay_ruler') {
      const HIT_RADIUS = 34;
      const distToStart = rulerStart ? Math.hypot(x - rulerStart.x, y - rulerStart.y) : Infinity;
      const distToEnd = rulerEnd ? Math.hypot(x - rulerEnd.x, y - rulerEnd.y) : Infinity;

      if (distToStart <= HIT_RADIUS) {
        setActiveDragPoint('start');
        return;
      }
      if (distToEnd <= HIT_RADIUS) {
        setActiveDragPoint('end');
        return;
      }

      // If user tapped outside existing handles:
      if (!rulerStart) {
        setRulerStart({ x, y });
        setActiveDragPoint('end');
      } else if (!rulerEnd) {
        setRulerEnd({ x, y });
        setActiveDragPoint(null);
      } else {
        // Move closest handle to tap point
        if (distToStart < distToEnd) {
          setRulerStart({ x, y });
          setActiveDragPoint('start');
        } else {
          setRulerEnd({ x, y });
          setActiveDragPoint('end');
        }
      }
      return;
    }

    if (measureMode === '3d_box') {
      setIsDraggingBox(true);
      dragStartRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  // Pointer Move handler with magnetic snap
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasCoords(e);
    setHoverPointerPos({ x, y });

    if (measureMode === 'overlay_ruler') {
      if (!activeDragPoint) return;

      let targetX = x;
      let targetY = y;

      if (snapToAxis) {
        const anchor = activeDragPoint === 'start' ? rulerEnd : rulerStart;
        if (anchor) {
          const dx = Math.abs(targetX - anchor.x);
          const dy = Math.abs(targetY - anchor.y);
          // Snap within 22px
          if (dy < 22) {
            targetY = anchor.y; // Pure horizontal
          } else if (dx < 22) {
            targetX = anchor.x; // Pure vertical
          }
        }
      }

      if (activeDragPoint === 'start') {
        setRulerStart({ x: targetX, y: targetY });
      } else if (activeDragPoint === 'end') {
        setRulerEnd({ x: targetX, y: targetY });
      }
      return;
    }

    if (measureMode === '3d_box' && isDraggingBox) {
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      dragStartRef.current = { x: e.clientX, y: e.clientY };
      setBoxRotationY((prev) => (prev + dx * 0.5) % 360);
      setBoxRotationX((prev) => Math.max(-45, Math.min(65, prev - dy * 0.5)));
    }
  };

  const handlePointerUp = () => {
    setActiveDragPoint(null);
    setIsDraggingBox(false);
  };

  // Canvas click for laser tape mode
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (measureMode !== 'point_laser') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const labels = ['Point A (Left)', 'Point B (Right)', 'Point C (Depth)', 'Point D (Height)'];
    if (laserPoints.length < 4) {
      const nextPoint = { x, y, label: labels[laserPoints.length] };
      const updated = [...laserPoints, nextPoint];
      setLaserPoints(updated);

      if (updated.length === 2) {
        const distPx = Math.hypot(updated[1].x - updated[0].x, updated[1].y - updated[0].y);
        setLengthM(parseFloat((distPx / pxPerMeter).toFixed(2)));
      } else if (updated.length === 3) {
        const distPx = Math.hypot(updated[2].x - updated[1].x, updated[2].y - updated[1].y);
        setWidthM(parseFloat((distPx / pxPerMeter).toFixed(2)));
      } else if (updated.length === 4) {
        const distPx = Math.hypot(updated[3].x - updated[2].x, updated[3].y - updated[2].y);
        setHeightM(parseFloat((distPx / pxPerMeter).toFixed(2)));
      }
    } else {
      setLaserPoints([{ x, y, label: labels[0] }]);
    }
  };

  // Apply cargo preset
  const handleApplyPreset = (preset: typeof CARGO_SHAPE_PRESETS[0]) => {
    setLengthM(preset.length);
    setWidthM(preset.width);
    setHeightM(preset.height);
    setCustomItemName(preset.name);
    setCustomCategory(preset.category);
    if (preset.profile) {
      setIrregularProfile(preset.profile);
    }
    handleResetRuler();
    setAppliedToast(`Loaded preset: ${preset.name}`);
    setTimeout(() => setAppliedToast(null), 2500);
  };

  // Capture AR snapshot with overlay ruler stamping
  const handleCaptureArSnapshot = (): string => {
    const compositeCanvas = document.createElement('canvas');
    compositeCanvas.width = 1280;
    compositeCanvas.height = 720;
    const compCtx = compositeCanvas.getContext('2d');
    if (!compCtx) return '';

    if (isHardwareActive && videoRef.current && videoRef.current.videoWidth > 0) {
      compCtx.drawImage(videoRef.current, 0, 0, 1280, 720);
    } else if (bgCanvasRef.current) {
      compCtx.drawImage(bgCanvasRef.current, 0, 0, 1280, 720);
    } else {
      compCtx.fillStyle = '#0f172a';
      compCtx.fillRect(0, 0, 1280, 720);
    }

    if (canvasRef.current) {
      compCtx.drawImage(canvasRef.current, 0, 0, 1280, 720);
    }

    // Watermark with Pyda Movers AR Calibration Seal
    compCtx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    compCtx.fillRect(20, 20, 480, 75);
    compCtx.strokeStyle = '#f59e0b';
    compCtx.lineWidth = 1.5;
    compCtx.strokeRect(20, 20, 480, 75);

    compCtx.font = 'bold 13px sans-serif';
    compCtx.fillStyle = '#ffffff';
    compCtx.fillText('PYDA MOVERS® - AR SPATIAL RULER AUDIT', 35, 42);

    compCtx.font = '11px monospace';
    compCtx.fillStyle = '#f59e0b';
    compCtx.fillText(
      `ITEM: ${customItemName.toUpperCase()} | PROFILE: ${irregularProfile.toUpperCase()}`,
      35,
      60
    );

    compCtx.font = '10px monospace';
    compCtx.fillStyle = '#cbd5e1';
    compCtx.fillText(
      `VOL: ${cbmVolume} CBM (Gross: ${grossCbm} CBM @ ${Math.round(currentPackingFactor * 100)}% Fill) | ${lengthM}m × ${widthM}m × ${heightM}m`,
      35,
      78
    );

    return compositeCanvas.toDataURL('image/jpeg', 0.9);
  };

  // Commit and return measurement
  const handleConfirmAndSave = () => {
    const snapshot = handleCaptureArSnapshot();
    onSaveMeasurement({
      itemName: customItemName.trim() || 'AR Measured Cargo Item',
      category: customCategory,
      lengthM,
      widthM,
      heightM,
      cbm: cbmVolume,
      snapshotDataUrl: snapshot,
      targetItemId: targetItemId || undefined,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-6xl shadow-2xl flex flex-col max-h-[94vh] overflow-hidden">
        
        {/* Modal Top Header */}
        <div className="p-3.5 sm:px-6 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Ruler className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-white text-sm sm:text-base">
                  AR Spatial Volume Estimator & Screen Ruler
                </h3>
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Irregular Cargo Caliper
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Tap-to-measure exact dimensions of large or irregular goods that AI vision cannot auto-calculate.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowRulerHelp(!showRulerHelp)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 transition-colors text-xs flex items-center gap-1.5 font-bold"
              title="Screen-Overlay Ruler Guide"
            >
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span className="hidden md:inline">How It Works</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Optional Collapsible Guidance Banner */}
        {showRulerHelp && (
          <div className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-2.5 text-xs text-amber-200/90 flex items-start gap-3 animate-in slide-in-from-top-2">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1 text-[11px]">
              <p className="font-bold text-amber-300">
                Measuring Large & Irregular Items (Generators, Corner Sofas, Machinery, Sculptures):
              </p>
              <p>
                1. <strong>Screen-Overlay Ruler</strong>: Tap on cargo corners to drop Caliper A and Caliper B. Drag handles with the 2.5x optical loupe to align with extreme physical boundaries.
              </p>
              <p>
                2. <strong>One-Tap Dimension Assignment</strong>: Click <em>Apply to Length</em>, <em>Apply to Height</em>, or <em>Apply to Width</em> to lock the measured span directly into the freight model.
              </p>
              <p>
                3. <strong>Irregular Volume Packing Factor</strong>: Select your cargo's shape (L-Shaped, Cylindrical, Curved, or Open Frame) to automatically compute true billable CBM without paying for empty air voids.
              </p>
            </div>
            <button
              onClick={() => setShowRulerHelp(false)}
              className="text-amber-400 hover:text-amber-200 font-bold text-xs"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Modal Main Body (Grid Viewport + Controls) */}
        <div className="flex-1 overflow-y-auto grid lg:grid-cols-12 min-h-0">
          
          {/* Left: AR Viewfinder & Live Spatial Canvas (7 Cols) */}
          <div className="lg:col-span-7 bg-slate-950 relative flex flex-col justify-between overflow-hidden min-h-[400px] sm:min-h-[480px]">
            
            {/* Camera Viewport Background (Hardware or Autonomous Optical Feed) */}
            {isHardwareActive ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <canvas
                ref={bgCanvasRef}
                width={1280}
                height={720}
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}

            {/* Interactive Canvas Overlay */}
            <canvas
              ref={canvasRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onClick={handleCanvasClick}
              className="absolute inset-0 w-full h-full cursor-crosshair z-10 touch-none"
            />

            {/* Viewfinder Top HUD Bar */}
            <div className="relative z-20 p-3 sm:p-4 flex items-start justify-between pointer-events-none gap-2 flex-wrap">
              
              {/* Gyro Leveler Indicator */}
              <div className="bg-slate-950/85 backdrop-blur border border-slate-800 rounded-xl px-2.5 py-1.5 text-[10px] font-mono text-slate-300 flex items-center gap-2 shadow-lg pointer-events-auto">
                <Compass className="w-3.5 h-3.5 text-amber-400" />
                <span>P: {gyroPitch}°</span>
                <span className="text-slate-600">|</span>
                <span>R: {gyroRoll}°</span>
                <span className="text-slate-600">|</span>
                <span className={`font-bold ${Math.abs(gyroRoll) < 3 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {Math.abs(gyroRoll) < 3 ? 'LEVEL' : 'TILT'}
                </span>
              </div>

              {/* Mode Selector Pill Buttons */}
              <div className="flex items-center rounded-xl bg-slate-950/90 p-1 border border-slate-800 pointer-events-auto shadow-lg">
                <button
                  onClick={() => setMeasureMode('overlay_ruler')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    measureMode === 'overlay_ruler'
                      ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span>Screen Ruler</span>
                </button>
                <button
                  onClick={() => setMeasureMode('3d_box')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    measureMode === '3d_box'
                      ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Box className="w-3.5 h-3.5" />
                  <span>3D Box</span>
                </button>
                <button
                  onClick={() => {
                    setMeasureMode('point_laser');
                    setLaserPoints([]);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    measureMode === 'point_laser'
                      ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Crosshair className="w-3.5 h-3.5" />
                  <span>Tape Laser</span>
                </button>
              </div>

            </div>

            {/* Screen-Overlay Ruler Interactive HUD Toolbar */}
            {measureMode === 'overlay_ruler' && (
              <div className="relative z-20 p-2 sm:p-3 pointer-events-auto space-y-2">
                
                {/* Instant Feedback Toast */}
                {appliedToast && (
                  <div className="mx-auto w-fit bg-emerald-500 text-slate-950 font-bold px-3 py-1 rounded-full text-xs shadow-lg animate-in fade-in duration-200 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{appliedToast}</span>
                  </div>
                )}

                {/* Caliper Action Strip */}
                <div className="bg-slate-950/92 backdrop-blur-md border border-slate-800 rounded-2xl p-2.5 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-2.5">
                  
                  {/* Left: Active Dimension Targeting Chips */}
                  <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mr-1 hidden sm:inline">
                      Target:
                    </span>
                    {(['length', 'height', 'width', 'irregular'] as RulerDimensionType[]).map((dim) => (
                      <button
                        key={dim}
                        type="button"
                        onClick={() => setRulerDimensionType(dim)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                          rulerDimensionType === dim
                            ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                            : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                        }`}
                      >
                        {dim === 'length' && <MoveHorizontal className="w-3 h-3" />}
                        {dim === 'height' && <MoveVertical className="w-3 h-3" />}
                        {dim === 'width' && <CornerDownRight className="w-3 h-3" />}
                        {dim === 'irregular' && <Crosshair className="w-3 h-3" />}
                        <span className="capitalize">{dim}</span>
                      </button>
                    ))}
                  </div>

                  {/* Center & Right: Direct Apply Actions */}
                  <div className="flex items-center gap-1.5 w-full md:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() => handleApplyRulerToDimension(
                        rulerDimensionType === 'irregular' ? 'length' : rulerDimensionType
                      )}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                      title="Apply current caliper distance to target dimension"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Apply {activeRulerDistanceM}m</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSaveActiveSegment}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1 active:scale-95 transition-all border border-slate-700"
                      title="Add segment to irregular parts list"
                    >
                      <Plus className="w-3.5 h-3.5 text-amber-400" />
                      <span className="hidden sm:inline">Save Part</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSnapToAxis(!snapToAxis)}
                      className={`px-2 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                        snapToAxis
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm'
                          : 'bg-slate-900 text-slate-400 border-slate-800'
                      }`}
                      title="Magnetic Snap to 0° Horizontal or 90° Vertical"
                    >
                      Snap {snapToAxis ? 'ON' : 'OFF'}
                    </button>

                    <button
                      type="button"
                      onClick={handleResetRuler}
                      className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-amber-400 border border-slate-800 transition-colors"
                      title="Center Caliper Handles"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>

                {/* Distance Calibration Presets */}
                <div className="bg-slate-950/80 backdrop-blur rounded-xl px-3 py-1.5 border border-slate-800/80 flex items-center justify-between text-[11px] text-slate-300">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Scale className="w-3.5 h-3.5 text-amber-400" />
                    <span className="font-bold text-slate-300">Distance to Cargo:</span>
                  </div>

                  <div className="flex items-center gap-1">
                    {DISTANCE_CALIBRATION_PRESETS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleSelectDistancePreset(p.id as any)}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                          distancePreset === p.id
                            ? 'bg-amber-500 text-slate-950 font-black'
                            : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* Bottom Status Prompt when 3D Box is active */}
            {measureMode === '3d_box' && (
              <div className="relative z-20 p-3 pointer-events-none">
                <div className="bg-slate-950/90 backdrop-blur border border-amber-500/30 rounded-2xl px-3.5 py-2 text-xs flex items-center gap-2.5 text-slate-200 pointer-events-auto shadow-xl">
                  <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-[11px] sm:text-xs">
                    Drag 3D wireframe to rotate. Switch to <strong>Screen Ruler</strong> to manually measure odd contours.
                  </span>
                </div>
              </div>
            )}

          </div>

          {/* Right: Dimension Tuning & Item Linkage Controls (5 Cols) */}
          <div className="lg:col-span-5 p-4 sm:p-6 space-y-4 bg-slate-900 overflow-y-auto">
            
            {/* Live Volume Summary Card with Irregular Packing Breakdown */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/40 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Calculated Freight Volume
                </span>
                <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  AR Screen Calibrated
                </span>
              </div>

              {/* Primary Net CBM Display */}
              <div className="flex items-baseline justify-between">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-black text-amber-400 font-mono tracking-tight">
                    {cbmVolume}
                  </span>
                  <span className="text-sm font-extrabold text-white">CBM</span>
                  <span className="text-xs text-slate-400 font-mono">
                    ({cuFtVolume} cu ft)
                  </span>
                </div>
                {irregularProfile !== 'solid' && (
                  <span className="text-[11px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-lg border border-cyan-500/30">
                    {Math.round(currentPackingFactor * 100)}% Net Fill
                  </span>
                )}
              </div>

              {/* Gross Bounding Envelope Breakdown */}
              <div className="p-2.5 bg-slate-900/90 rounded-xl border border-slate-800 text-[11px] space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Gross Truck Bed Envelope:</span>
                  <span className="font-mono text-slate-200 font-bold">{grossCbm} CBM ({grossCuFt} cu ft)</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Irregular Geometry Profile:</span>
                  <span className="font-bold text-amber-400">{IRREGULAR_PROFILES.find(p => p.id === irregularProfile)?.name}</span>
                </div>
              </div>

              {/* Measured Dimensions L x W x H */}
              <div className="text-[11px] text-slate-300 font-mono grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80">
                <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[9px] uppercase font-bold">Length (Span)</span>
                  <span className="text-amber-400 font-bold text-xs">{lengthM.toFixed(2)}m</span>
                  <span className="text-[9px] text-slate-500 block">{metersToFeetInches(lengthM)}</span>
                </div>
                <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[9px] uppercase font-bold">Width (Depth)</span>
                  <span className="text-amber-400 font-bold text-xs">{widthM.toFixed(2)}m</span>
                  <span className="text-[9px] text-slate-500 block">{metersToFeetInches(widthM)}</span>
                </div>
                <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block text-[9px] uppercase font-bold">Height (Rise)</span>
                  <span className="text-amber-400 font-bold text-xs">{heightM.toFixed(2)}m</span>
                  <span className="text-[9px] text-slate-500 block">{metersToFeetInches(heightM)}</span>
                </div>
              </div>
            </div>

            {/* Irregular Cargo Geometry Profile Selector */}
            <div className="space-y-2 bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5 text-amber-400" />
                  <span>Irregular Geometry Profile</span>
                </label>
                <span className="text-[10px] text-slate-400">Eliminates Air Void Overcharges</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {IRREGULAR_PROFILES.map((profile) => (
                  <button
                    key={profile.id}
                    type="button"
                    onClick={() => setIrregularProfile(profile.id)}
                    className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                      irregularProfile === profile.id
                        ? 'bg-amber-500/15 border-amber-500/50 text-white shadow-sm'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold mb-0.5">
                      <span className={irregularProfile === profile.id ? 'text-amber-300' : 'text-slate-200'}>
                        {profile.name}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-800 rounded text-slate-300">
                        {profile.badge}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-snug line-clamp-2">
                      {profile.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Saved Irregular Measurement Segments (if any exist) */}
            {savedSegments.length > 0 && (
              <div className="space-y-2 bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Measured Parts ({savedSegments.length})</span>
                  </span>
                  <button
                    onClick={() => setSavedSegments([])}
                    className="text-[10px] text-rose-400 hover:text-rose-300 flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear</span>
                  </button>
                </div>

                <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                  {savedSegments.map((seg, idx) => (
                    <div
                      key={seg.id}
                      className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center font-mono font-bold text-[10px]">
                          {idx + 1}
                        </span>
                        <div>
                          <p className="text-white font-bold text-[11px] leading-tight">{seg.label}</p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {seg.distanceM}m ({metersToFeetInches(seg.distanceM)})
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            if (seg.dimensionType === 'height') setHeightM(seg.distanceM);
                            else if (seg.dimensionType === 'width') setWidthM(seg.distanceM);
                            else setLengthM(seg.distanceM);
                            setAppliedToast(`Applied ${seg.distanceM}m`);
                            setTimeout(() => setAppliedToast(null), 2000);
                          }}
                          className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 text-[10px] font-bold transition-colors"
                        >
                          Use
                        </button>
                        <button
                          type="button"
                          onClick={() => setSavedSegments((prev) => prev.filter((s) => s.id !== seg.id))}
                          className="p-1 rounded-lg hover:bg-rose-500/20 text-slate-500 hover:text-rose-400"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Presets Carousel */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Cargo Presets
                </label>
                <span className="text-[10px] text-slate-500">1-Tap Standard & Irregular</span>
              </div>

              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-slate-950/60 rounded-xl border border-slate-800">
                {CARGO_SHAPE_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>{preset.name}</span>
                    {preset.profile && preset.profile !== 'solid' && (
                      <span className="text-[9px] text-cyan-400 font-bold bg-cyan-500/20 px-1 rounded">
                        Irregular
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Real-Time Dimension Fine Sliders */}
            <div className="space-y-3 bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Fine-Tune Sliders
                </span>
                <button
                  onClick={() => {
                    setLengthM(1.2);
                    setWidthM(0.8);
                    setHeightM(0.75);
                    setIrregularProfile('solid');
                  }}
                  className="text-[10px] text-slate-400 hover:text-amber-400 flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset All</span>
                </button>
              </div>

              {/* Length */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Length (Span)</span>
                  <span className="text-amber-400 font-bold">{lengthM.toFixed(2)} m</span>
                </div>
                <input
                  type="range"
                  min={0.2}
                  max={5.0}
                  step={0.05}
                  value={lengthM}
                  onChange={(e) => setLengthM(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Width */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Width (Depth)</span>
                  <span className="text-amber-400 font-bold">{widthM.toFixed(2)} m</span>
                </div>
                <input
                  type="range"
                  min={0.2}
                  max={4.0}
                  step={0.05}
                  value={widthM}
                  onChange={(e) => setWidthM(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Height */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Height (Vertical)</span>
                  <span className="text-amber-400 font-bold">{heightM.toFixed(2)} m</span>
                </div>
                <input
                  type="range"
                  min={0.2}
                  max={3.5}
                  step={0.05}
                  value={heightM}
                  onChange={(e) => setHeightM(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Target Item Assignment */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Assign Measurement To
              </label>

              {existingItems.length > 0 && (
                <select
                  value={targetItemId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setTargetItemId(id);
                    const found = existingItems.find((it) => it.id === id);
                    if (found) {
                      setCustomItemName(found.itemName);
                      setCustomCategory(found.category);
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl px-3 py-2 outline-none font-bold"
                >
                  <option value="">-- Create As New Cargo Item --</option>
                  {existingItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.itemName} (Current: {item.estimatedCbm} CBM)
                    </option>
                  ))}
                </select>
              )}

              {!targetItemId && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase mb-1">Item Title</label>
                    <input
                      type="text"
                      value={customItemName}
                      onChange={(e) => setCustomItemName(e.target.value)}
                      placeholder="e.g. L-Shaped Sectional"
                      className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl px-3 py-2 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 uppercase mb-1">Category</label>
                    <select
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl px-3 py-2 outline-none"
                    >
                      <option value="Furniture">Furniture</option>
                      <option value="Industrial Freight">Industrial Freight</option>
                      <option value="Electronics & IT">Electronics & IT</option>
                      <option value="Artwork & Antiques">Artwork & Antiques</option>
                      <option value="Glassware & Dining">Glassware & Dining</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Confirm Action */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmAndSave}
                className="flex-1 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs sm:text-sm py-3 rounded-xl shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                <span>
                  {targetItemId ? 'Update Item with AR Ruler CBM' : 'Save AR Calibrated Cargo'}
                </span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

// Canvas Helper: Draw floating dimension badge
function drawBadge(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, bg: string, border: string) {
  ctx.save();
  ctx.font = 'bold 10px monospace';
  const textWidth = ctx.measureText(text).width;
  const padX = 6;
  const padY = 3;

  ctx.fillStyle = bg;
  ctx.strokeStyle = border;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(x - textWidth / 2 - padX, y - 8 - padY, textWidth + padX * 2, 16 + padY, 4);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.fillText(text, x - textWidth / 2, y + 2);
  ctx.restore();
}

// Canvas Helper: Draw floating Volume summary callout
function drawVolumeBadge(ctx: CanvasRenderingContext2D, cbmText: string, cuFtText: string, x: number, y: number) {
  ctx.save();
  ctx.font = 'bold 12px monospace';
  const textWidth = Math.max(ctx.measureText(cbmText).width, ctx.measureText(cuFtText).width);
  const padX = 12;
  const padY = 6;

  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 1.5;
  ctx.shadowColor = '#f59e0b';
  ctx.shadowBlur = 10;

  ctx.beginPath();
  ctx.roundRect(x - textWidth / 2 - padX, y - 14, textWidth + padX * 2, 34, 8);
  ctx.fill();
  ctx.stroke();

  ctx.shadowBlur = 0;
  ctx.fillStyle = '#f59e0b';
  ctx.fillText(cbmText, x - ctx.measureText(cbmText).width / 2, y);

  ctx.font = '9px monospace';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText(cuFtText, x - ctx.measureText(cuFtText).width / 2, y + 13);

  ctx.restore();
}

// Canvas Helper: Draw high-visibility screen-overlay ruler callout badge
function drawRulerCalloutBadge(
  ctx: CanvasRenderingContext2D,
  primaryText: string,
  secondaryText: string,
  x: number,
  y: number
) {
  ctx.save();
  ctx.font = 'black 13px monospace';
  const pWidth = ctx.measureText(primaryText).width;
  ctx.font = 'bold 9px monospace';
  const sWidth = ctx.measureText(secondaryText).width;
  const maxW = Math.max(pWidth, sWidth);
  const padX = 14;
  const boxW = maxW + padX * 2;
  const boxH = 40;

  // Background rounded plaque
  ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 1.5;
  ctx.shadowColor = '#f59e0b';
  ctx.shadowBlur = 10;

  ctx.beginPath();
  ctx.roundRect(x - boxW / 2, y - boxH / 2, boxW, boxH, 8);
  ctx.fill();
  ctx.stroke();

  ctx.shadowBlur = 0;

  // Primary distance readout
  ctx.font = 'black 13px monospace';
  ctx.fillStyle = '#fbbf24';
  ctx.textAlign = 'center';
  ctx.fillText(primaryText, x, y - 4);

  // Subtext (feet/inches + angle + dimension tag)
  ctx.font = 'bold 9px monospace';
  ctx.fillStyle = '#38bdf8';
  ctx.textAlign = 'center';
  ctx.fillText(secondaryText, x, y + 12);

  ctx.restore();
}
