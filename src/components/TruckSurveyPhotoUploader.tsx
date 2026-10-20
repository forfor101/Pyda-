import React, { useState, useRef } from 'react';
import {
  Upload,
  Camera,
  Trash2,
  Eye,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  Sparkles,
  ShieldCheck,
  X,
  Plus,
  RefreshCw,
  FileCheck
} from 'lucide-react';
import { TruckSurveyPhoto, TruckSurveyPhotoType } from '../types';

interface TruckSurveyPhotoUploaderProps {
  photos: TruckSurveyPhoto[];
  onChange: (photos: TruckSurveyPhoto[]) => void;
  truckMake?: string;
  truckModel?: string;
}

interface PhotoCategoryConfig {
  type: TruckSurveyPhotoType;
  label: string;
  shortDesc: string;
  required?: boolean;
}

export const SURVEY_CATEGORIES: PhotoCategoryConfig[] = [
  {
    type: 'front_cabin',
    label: 'Front Cabin & Plate',
    shortDesc: 'Windscreen, cabin front & legible FRSC plate',
    required: true,
  },
  {
    type: 'cargo_interior',
    label: 'Cargo Bed / Box Interior',
    shortDesc: 'Clean dry floor, walls & roof weather-seal',
    required: true,
  },
  {
    type: 'left_profile',
    label: 'Left Side Profile',
    shortDesc: 'Full flank, side-guards, panels & paintwork',
    required: true,
  },
  {
    type: 'rear_tailgate',
    label: 'Rear Tailgate & Doors',
    shortDesc: 'Container locking bars, brake lamps & bumper',
    required: true,
  },
  {
    type: 'odometer_dash',
    label: 'Dashboard & Odometer',
    shortDesc: 'Odometer mileage reading & instrument cluster',
    required: false,
  },
  {
    type: 'engine_bay',
    label: 'Engine Bay & VIN',
    shortDesc: 'Engine block, fluid lines & chassis stamping',
    required: false,
  },
  {
    type: 'tyres_undercarriage',
    label: 'Tyres & Undercarriage',
    shortDesc: 'Tread depth, rims, leaf springs & spare tyre',
    required: false,
  },
  {
    type: 'right_profile',
    label: 'Right Side & Fuel Tank',
    shortDesc: 'Fuel cap lock, side tanks & battery box',
    required: false,
  },
];

// Curated verified sample photos for quick one-click preview & demonstration
const SAMPLE_SURVEY_PHOTOS: { type: TruckSurveyPhotoType; label: string; url: string; caption: string }[] = [
  {
    type: 'front_cabin',
    label: 'Front Cabin & FRSC Plate',
    url: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1000&q=80',
    caption: 'Clean cab with registered commercial plate & dual side mirrors',
  },
  {
    type: 'cargo_interior',
    label: 'Cargo Bed / Box Interior',
    url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1000&q=80',
    caption: 'Heavy-duty marine plywood flooring with perimeter tie-down lashings',
  },
  {
    type: 'left_profile',
    label: 'Left Flank / Side Profile',
    url: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=1000&q=80',
    caption: 'Enclosed composite box body with reflective safety chevrons',
  },
  {
    type: 'rear_tailgate',
    label: 'Rear Tailgate & Container Doors',
    url: 'https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=1000&q=80',
    caption: 'Double-locking galvanized rear doors and undamaged rear bumper',
  },
];

// Helper to compress and convert file to data URL
const compressImageFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 1200; // max 1200px width/height for fast loading & efficient storage
        let width = img.width;
        let height = img.height;

        if (width > height && width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Compress as JPEG 0.8
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        resolve(dataUrl);
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const TruckSurveyPhotoUploader: React.FC<TruckSurveyPhotoUploaderProps> = ({
  photos,
  onChange,
  truckMake,
  truckModel,
}) => {
  const [selectedAngle, setSelectedAngle] = useState<TruckSurveyPhotoType>('front_cabin');
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewModalPhoto, setPreviewModalPhoto] = useState<TruckSurveyPhoto | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate required angles covered
  const requiredCategories = SURVEY_CATEGORIES.filter((c) => c.required);
  const coveredRequiredCount = requiredCategories.filter((c) =>
    photos.some((p) => p.type === c.type)
  ).length;

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsProcessing(true);

    try {
      const newPhotos: TruckSurveyPhoto[] = [...photos];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) continue;

        const dataUrl = await compressImageFile(file);
        
        // Pick an angle: either current selectedAngle, or auto-assign to next unassigned required angle
        let angleToAssign = selectedAngle;
        if (i > 0) {
          const unassignedReq = requiredCategories.find(
            (c) => !newPhotos.some((p) => p.type === c.type)
          );
          if (unassignedReq) {
            angleToAssign = unassignedReq.type;
          }
        }

        const catConfig = SURVEY_CATEGORIES.find((c) => c.type === angleToAssign);
        const photoItem: TruckSurveyPhoto = {
          id: `photo-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          type: angleToAssign,
          label: catConfig?.label || 'Survey Photo',
          dataUrl,
          fileName: file.name,
          fileSizeBytes: file.size,
          uploadedAt: new Date().toISOString(),
          caption: catConfig?.shortDesc,
        };

        // Remove old photo for this specific category if already present
        const filtered = newPhotos.filter((p) => p.type !== angleToAssign);
        newPhotos.push(photoItem);
      }

      onChange(newPhotos);
    } catch (err) {
      console.error('Error processing truck photos:', err);
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = (id: string) => {
    onChange(photos.filter((p) => p.id !== id));
  };

  // Quick fill demo sample photos
  const handleLoadSamplePhotos = () => {
    const demoItems: TruckSurveyPhoto[] = SAMPLE_SURVEY_PHOTOS.map((s, idx) => ({
      id: `sample-photo-${idx}-${Date.now()}`,
      type: s.type,
      label: s.label,
      dataUrl: s.url,
      fileName: `${s.type}-sample-inspection.jpg`,
      fileSizeBytes: 245000 + idx * 30000,
      uploadedAt: new Date().toISOString(),
      caption: s.caption,
    }));
    onChange(demoItems);
  };

  return (
    <div className="space-y-4" id="truck-survey-photo-uploader">
      {/* Header & Verification Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-950/80 border border-slate-800 rounded-2xl">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-amber-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5" />
              <span>VEHICLE SITE SURVEY VERIFICATION PHOTOS</span>
            </span>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
              {coveredRequiredCount >= requiredCategories.length ? '✓ Inspection Ready' : `${coveredRequiredCount}/${requiredCategories.length} Mandatory`}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Upload high-resolution survey photos of your {truckMake || 'truck'} {truckModel || ''} to expedite physical inspection clearance.
          </p>
        </div>

        <button
          type="button"
          onClick={handleLoadSamplePhotos}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all shrink-0 active:scale-95"
          id="load-sample-photos-btn"
          title="Autofill standard 4-angle verified survey photos for quick demo testing"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Load Demo Survey Photos</span>
        </button>
      </div>

      {/* Target Angle Selector Tabs */}
      <div>
        <label className="text-xs font-bold text-slate-300 block mb-2">
          Select Photo Inspection Angle to Upload:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {SURVEY_CATEGORIES.map((cat) => {
            const hasPhoto = photos.some((p) => p.type === cat.type);
            const isSelected = selectedAngle === cat.type;

            return (
              <button
                key={cat.type}
                type="button"
                onClick={() => setSelectedAngle(cat.type)}
                className={`p-2.5 rounded-xl text-left border transition-all relative ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-500 text-white shadow-sm ring-1 ring-amber-500/40'
                    : hasPhoto
                    ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-300 hover:border-emerald-500/50'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[11px] font-bold truncate block">
                    {cat.label}
                  </span>
                  {hasPhoto ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : cat.required ? (
                    <span className="text-[9px] font-mono text-amber-400 font-black">REQ</span>
                  ) : null}
                </div>
                <p className="text-[9px] text-slate-500 leading-tight line-clamp-1">
                  {cat.shortDesc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Upload Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
          dragActive
            ? 'border-amber-400 bg-amber-500/10'
            : 'border-slate-800 hover:border-amber-500/50 bg-slate-950/50 hover:bg-slate-950'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        <div className="max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto shadow-inner">
            {isProcessing ? (
              <RefreshCw className="w-6 h-6 animate-spin text-amber-400" />
            ) : (
              <Upload className="w-6 h-6" />
            )}
          </div>

          <div className="space-y-1">
            <p className="text-xs sm:text-sm font-bold text-white">
              Click to Upload or Drag & Drop Photo for{' '}
              <span className="text-amber-400 font-black">
                {SURVEY_CATEGORIES.find((c) => c.type === selectedAngle)?.label}
              </span>
            </p>
            <p className="text-[11px] text-slate-400">
              Supports JPG, PNG or WEBP (Automatically compressed & optimized for speed).
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] text-slate-400 font-mono">
            <span>Angle Selected: <strong>{selectedAngle.replace('_', ' ').toUpperCase()}</strong></span>
            <span>•</span>
            <span>Max 15MB/photo</span>
          </div>
        </div>
      </div>

      {/* Uploaded Photos Grid Preview */}
      {photos.length > 0 && (
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold flex items-center gap-1.5 text-white">
              <FileCheck className="w-4 h-4 text-emerald-400" />
              <span>{photos.length} Verified Survey Photo{photos.length !== 1 ? 's' : ''} Attached</span>
            </span>
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-red-400 hover:text-red-300 text-[11px] font-bold transition-colors"
            >
              Clear All Photos
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {photos.map((photo) => {
              const cat = SURVEY_CATEGORIES.find((c) => c.type === photo.type);
              return (
                <div
                  key={photo.id}
                  className="group relative bg-slate-950 border border-slate-800 hover:border-amber-500/50 rounded-2xl overflow-hidden shadow-md transition-all"
                >
                  <div className="aspect-[4/3] w-full relative bg-slate-900 overflow-hidden">
                    <img
                      src={photo.dataUrl}
                      alt={photo.label}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent opacity-80" />
                    
                    {/* Actions overlay */}
                    <div className="absolute top-2 right-2 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewModalPhoto(photo);
                        }}
                        className="w-7 h-7 rounded-lg bg-slate-900/80 hover:bg-slate-900 text-white flex items-center justify-center backdrop-blur-sm transition-colors"
                        title="Zoom photo preview"
                      >
                        <Eye className="w-3.5 h-3.5 text-amber-400" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemovePhoto(photo.id);
                        }}
                        className="w-7 h-7 rounded-lg bg-red-950/80 hover:bg-red-900 text-red-300 flex items-center justify-center backdrop-blur-sm transition-colors"
                        title="Remove photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="absolute bottom-2 left-2 right-2">
                      <span className="text-[10px] font-bold text-white block truncate">
                        {photo.label}
                      </span>
                      <span className="text-[9px] text-amber-400 font-mono block">
                        {(photo.fileSizeBytes / 1024).toFixed(0)} KB • Verified
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Lightbox Preview Modal */}
      {previewModalPhoto && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setPreviewModalPhoto(null)}
        >
          <div
            className="relative max-w-3xl w-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl space-y-4 p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <h4 className="text-sm font-black text-white">{previewModalPhoto.label}</h4>
                <p className="text-[11px] text-slate-400">{previewModalPhoto.caption || previewModalPhoto.fileName}</p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewModalPhoto(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-hidden rounded-2xl bg-black flex items-center justify-center">
              <img
                src={previewModalPhoto.dataUrl}
                alt={previewModalPhoto.label}
                className="max-h-[65vh] w-auto object-contain rounded-xl"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <span className="font-mono text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Megatrend Fleet Inspection Site Survey Verified</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  handleRemovePhoto(previewModalPhoto.id);
                  setPreviewModalPhoto(null);
                }}
                className="text-red-400 hover:text-red-300 font-bold"
              >
                Delete This Photo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
