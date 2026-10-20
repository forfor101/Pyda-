import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Link as LinkIcon, X, Check, Eye } from 'lucide-react';
import { useCms, MediaItem } from '../context/CmsContext';

interface ImagePickerProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  category?: MediaItem['category'];
  helperText?: string;
  previewHeight?: string;
}

export const ImagePicker: React.FC<ImagePickerProps> = ({
  label,
  value,
  onChange,
  category = 'general',
  helperText,
  previewHeight = 'h-36',
}) => {
  const { cms, addMedia } = useCms();
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [customUrl, setCustomUrl] = useState(value || '');
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle local file selection & conversion to Data URL
  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPG, PNG, WebP, SVG).');
      return;
    }

    // Size check: limit to 15MB for responsive local processing
    if (file.size > 15 * 1024 * 1024) {
      alert('Image file is too large (max 15MB). Please choose a compressed photo.');
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      const sizeFormatted = `${(file.size / (1024 * 1024)).toFixed(2)} MB`;

      // Add to CMS media library
      const newMedia = addMedia({
        name: file.name.replace(/\.[^/.]+$/, ''),
        url: dataUrl,
        category,
        sizeFormatted,
      });

      // Update parent value
      onChange(newMedia.url);
      setUploading(false);
    };
    reader.onerror = () => {
      alert('Failed to read image file.');
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleApplyUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (customUrl.trim()) {
      onChange(customUrl.trim());
      setShowUrlInput(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-200 uppercase tracking-wider">{label}</label>
        {helperText && <span className="text-[11px] text-slate-400">{helperText}</span>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
        {/* Preview Thumbnail Card */}
        <div className={`sm:col-span-5 relative bg-slate-950 rounded-xl border border-slate-800 overflow-hidden group ${previewHeight}`}>
          {value ? (
            <>
              <img
                src={value}
                alt={label}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800&auto=format&fit=crop&q=80';
                }}
              />
              <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 bg-amber-500 text-slate-950 rounded-lg text-xs font-bold hover:bg-amber-400 shadow-md"
                  title="Upload replacement"
                >
                  <Upload className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowGalleryModal(true)}
                  className="p-2 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-slate-700 shadow-md"
                  title="Choose from Gallery"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onChange('')}
                  className="p-2 bg-red-900/80 text-red-200 rounded-lg text-xs font-bold hover:bg-red-800 shadow-md"
                  title="Clear photo"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          ) : (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`w-full h-full flex flex-col items-center justify-center p-4 text-center cursor-pointer border-2 border-dashed transition-all ${
                dragOver ? 'border-amber-400 bg-amber-500/10' : 'border-slate-800 hover:border-amber-500/40 bg-slate-900/40'
              }`}
            >
              <Upload className="w-6 h-6 text-slate-500 mb-1" />
              <span className="text-xs font-bold text-slate-300">Drop Photo or Click to Upload</span>
              <span className="text-[10px] text-slate-500 mt-0.5">JPG, PNG, WebP up to 15MB</span>
            </div>
          )}
        </div>

        {/* Action Controls Column */}
        <div className="sm:col-span-7 space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex-1 min-w-[120px] bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-3 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-sm"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{uploading ? 'Processing...' : 'Upload File'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowGalleryModal(true)}
              className="flex-1 min-w-[120px] bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs px-3 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all"
            >
              <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
              <span>Media Library</span>
            </button>

            <button
              type="button"
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 rounded-xl text-xs transition-colors"
              title="Paste image URL"
            >
              <LinkIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Direct URL Input accordion */}
          {showUrlInput && (
            <form onSubmit={handleApplyUrl} className="flex gap-1.5 pt-1">
              <input
                type="url"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://example.com/photo.jpg"
                className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-amber-500 text-slate-950 text-xs font-bold rounded-lg hover:bg-amber-400"
              >
                Apply
              </button>
            </form>
          )}

          {value && (
            <div className="text-[10px] text-slate-400 break-all truncate font-mono bg-slate-950/70 p-1.5 rounded-lg border border-slate-800/80">
              {value.startsWith('data:') ? 'Embedded Base64 Photo Asset' : value}
            </div>
          )}
        </div>
      </div>

      {/* Gallery Selector Modal */}
      {showGalleryModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm sm:text-base font-bold text-white">Select from Media Library</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowGalleryModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {cms.mediaLibrary.map((item) => {
                const isSelected = value === item.url;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      onChange(item.url);
                      setShowGalleryModal(false);
                    }}
                    className={`group relative rounded-xl overflow-hidden border cursor-pointer transition-all aspect-video ${
                      isSelected
                        ? 'border-amber-400 ring-2 ring-amber-400'
                        : 'border-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <img
                      src={item.url}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent opacity-80" />
                    <div className="absolute bottom-1.5 left-2 right-2 text-[10px] text-white font-bold truncate">
                      {item.name}
                    </div>
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 bg-amber-500 text-slate-950 p-1 rounded-full">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-950/60">
              <span className="text-xs text-slate-400">
                {cms.mediaLibrary.length} photos available in site library
              </span>
              <button
                type="button"
                onClick={() => {
                  setShowGalleryModal(false);
                  fileInputRef.current?.click();
                }}
                className="px-3.5 py-1.5 bg-amber-500 text-slate-950 text-xs font-bold rounded-xl hover:bg-amber-400 flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload New</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
