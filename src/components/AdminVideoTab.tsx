import React, { useState } from 'react';
import { 
  Film, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  X, 
  Play, 
  ExternalLink, 
  Clock, 
  MapPin, 
  Building2, 
  Package, 
  Award, 
  Truck, 
  CheckCircle2,
  Sparkles,
  Layers,
  Image as ImageIcon
} from 'lucide-react';
import { useCms } from '../context/CmsContext';
import { VideoShowcaseItem } from '../types';
import { ImagePicker } from './ImagePicker';

interface AdminVideoTabProps {
  onShowToast: (msg: string) => void;
}

export const AdminVideoTab: React.FC<AdminVideoTabProps> = ({ onShowToast }) => {
  const { cms, updateVideoShowcaseItem, addVideoShowcaseItem, deleteVideoShowcaseItem } = useCms();
  const videos = cms.videoShowcase || [];

  const [editingVideo, setEditingVideo] = useState<VideoShowcaseItem | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [activeImagePickerField, setActiveImagePickerField] = useState<boolean>(false);

  const [newVideo, setNewVideo] = useState<Omit<VideoShowcaseItem, 'id'>>({
    title: '',
    category: 'facility_tour',
    categoryLabel: 'Facility Tour',
    description: '',
    videoUrl: '',
    thumbnailUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&auto=format&fit=crop&q=80',
    durationFormatted: '3:30 Min',
    featuredClient: '',
    location: 'Abuja HQ Hub',
    keyHighlights: ['Comprehensive security & operations check'],
  });

  const [newHighlightInput, setNewHighlightInput] = useState('');

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVideo) return;
    updateVideoShowcaseItem(editingVideo.id, editingVideo);
    onShowToast(`Updated video: "${editingVideo.title}"!`);
    setEditingVideo(null);
  };

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVideo.title.trim() || !newVideo.videoUrl.trim()) {
      alert('Please fill out the Video Title and Video URL.');
      return;
    }

    const created: VideoShowcaseItem = {
      ...newVideo,
      id: `vid-${Date.now()}`,
    };

    addVideoShowcaseItem(created);
    onShowToast(`Added new video: "${created.title}"!`);
    setIsNewModalOpen(false);
    setNewVideo({
      title: '',
      category: 'facility_tour',
      categoryLabel: 'Facility Tour',
      description: '',
      videoUrl: '',
      thumbnailUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&auto=format&fit=crop&q=80',
      durationFormatted: '3:30 Min',
      featuredClient: '',
      location: 'Abuja HQ Hub',
      keyHighlights: ['Operations & Quality Assurance'],
    });
  };

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete the video "${title}"?`)) {
      deleteVideoShowcaseItem(id);
      onShowToast(`Deleted video "${title}".`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Film className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-black text-white uppercase tracking-wider">
              Video Testimonials & Facility Tours
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Embed YouTube videos, Vimeo streams, or local MP4 files showcasing your fleet, warehouse scale, and white-glove packing quality.
          </p>
        </div>

        <button
          onClick={() => setIsNewModalOpen(true)}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center gap-2 active:scale-95 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add New Video</span>
        </button>
      </div>

      {/* Videos List Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {videos.map((vid) => (
          <div
            key={vid.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-slate-700 transition-colors shadow-xl"
          >
            {/* Thumbnail Header */}
            <div className="relative aspect-video bg-slate-950">
              <img
                src={vid.thumbnailUrl}
                alt={vid.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
              
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                <span className="bg-amber-500 text-slate-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow">
                  {vid.categoryLabel}
                </span>
                <span className="bg-slate-950/80 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-400" />
                  {vid.durationFormatted}
                </span>
              </div>

              <div className="absolute bottom-3 left-3 right-3">
                <p className="text-[11px] text-amber-400 font-bold flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {vid.location || 'Nationwide Fleet'}
                </p>
                <h3 className="text-sm font-black text-white truncate">{vid.title}</h3>
              </div>
            </div>

            {/* Content & Details */}
            <div className="p-5 space-y-4 flex-grow flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="text-xs text-slate-300 line-clamp-2">
                  {vid.description}
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1.5">
                  <span className="text-[10px] font-mono text-slate-400 block truncate">
                    <strong>URL:</strong> {vid.videoUrl}
                  </span>
                  <div className="space-y-1">
                    {vid.keyHighlights.slice(0, 2).map((hl, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-[11px] text-slate-400 truncate">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span>{hl}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800 gap-2">
                <a
                  href={vid.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Preview Source</span>
                </a>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingVideo(vid)}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(vid.id, vid.title)}
                    className="p-2 bg-red-950/40 hover:bg-red-900/60 text-red-400 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    title="Delete Video"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Video Modal */}
      {editingVideo && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-in fade-in duration-150 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <Film className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-black text-white">Edit Video Showcase Item</h3>
              </div>
              <button
                onClick={() => setEditingVideo(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Video Title</label>
                <input
                  type="text"
                  required
                  value={editingVideo.title}
                  onChange={(e) => setEditingVideo({ ...editingVideo, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Category</label>
                  <select
                    value={editingVideo.category}
                    onChange={(e) => {
                      const cat = e.target.value as any;
                      const labels: Record<string, string> = {
                        facility_tour: 'Facility & Warehouse Tours',
                        packing_demo: 'Packing Quality & Crating',
                        client_story: 'Client Case Studies',
                        fleet_operations: 'Fleet & Highway Haulage',
                      };
                      setEditingVideo({
                        ...editingVideo,
                        category: cat,
                        categoryLabel: labels[cat] || 'Tour',
                      });
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="facility_tour">Facility & Warehouse Tours</option>
                    <option value="packing_demo">Packing Quality & Crating</option>
                    <option value="client_story">Client Case Studies</option>
                    <option value="fleet_operations">Fleet & Highway Haulage</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Location / Hub</label>
                  <input
                    type="text"
                    value={editingVideo.location || ''}
                    onChange={(e) => setEditingVideo({ ...editingVideo, location: e.target.value })}
                    placeholder="e.g. Abuja Citygate Terminal"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Video URL (YouTube link, Vimeo, or MP4 URL)
                </label>
                <input
                  type="text"
                  required
                  value={editingVideo.videoUrl}
                  onChange={(e) => setEditingVideo({ ...editingVideo, videoUrl: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Cover Thumbnail Image URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={editingVideo.thumbnailUrl}
                    onChange={(e) => setEditingVideo({ ...editingVideo, thumbnailUrl: e.target.value })}
                    className="flex-grow px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="button"
                    onClick={() => setActiveImagePickerField(true)}
                    className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl text-xs font-bold flex items-center gap-1.5"
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span>Browse</span>
                  </button>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Video Duration Tag</label>
                  <input
                    type="text"
                    value={editingVideo.durationFormatted}
                    onChange={(e) => setEditingVideo({ ...editingVideo, durationFormatted: e.target.value })}
                    placeholder="e.g. 3:45 Min"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Featured Client / Tag</label>
                  <input
                    type="text"
                    value={editingVideo.featuredClient || ''}
                    onChange={(e) => setEditingVideo({ ...editingVideo, featuredClient: e.target.value })}
                    placeholder="e.g. Operations & Fleet Command"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editingVideo.description}
                  onChange={(e) => setEditingVideo({ ...editingVideo, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingVideo(null)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs shadow-lg flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create New Video Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-in fade-in duration-150 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-black text-white">Add New Video Showcase Item</h3>
              </div>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNew} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Video Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lagos Container Port Freight Dispatch & Inspection"
                  value={newVideo.title}
                  onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Category</label>
                  <select
                    value={newVideo.category}
                    onChange={(e) => {
                      const cat = e.target.value as any;
                      const labels: Record<string, string> = {
                        facility_tour: 'Facility & Warehouse Tours',
                        packing_demo: 'Packing Quality & Crating',
                        client_story: 'Client Case Studies',
                        fleet_operations: 'Fleet & Highway Haulage',
                      };
                      setNewVideo({
                        ...newVideo,
                        category: cat,
                        categoryLabel: labels[cat] || 'Tour',
                      });
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="facility_tour">Facility & Warehouse Tours</option>
                    <option value="packing_demo">Packing Quality & Crating</option>
                    <option value="client_story">Client Case Studies</option>
                    <option value="fleet_operations">Fleet & Highway Haulage</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Location / Hub</label>
                  <input
                    type="text"
                    value={newVideo.location}
                    onChange={(e) => setNewVideo({ ...newVideo, location: e.target.value })}
                    placeholder="e.g. Lagos Hub / Apapa"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Video URL (YouTube link, Vimeo, or direct MP4)
                </label>
                <input
                  type="text"
                  required
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={newVideo.videoUrl}
                  onChange={(e) => setNewVideo({ ...newVideo, videoUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Cover Thumbnail URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={newVideo.thumbnailUrl}
                    onChange={(e) => setNewVideo({ ...newVideo, thumbnailUrl: e.target.value })}
                    className="flex-grow px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="button"
                    onClick={() => setActiveImagePickerField(true)}
                    className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl text-xs font-bold flex items-center gap-1.5"
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span>Browse</span>
                  </button>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Video Duration Tag</label>
                  <input
                    type="text"
                    value={newVideo.durationFormatted}
                    onChange={(e) => setNewVideo({ ...newVideo, durationFormatted: e.target.value })}
                    placeholder="e.g. 4:15 Min"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Featured Client / Tag</label>
                  <input
                    type="text"
                    value={newVideo.featuredClient}
                    onChange={(e) => setNewVideo({ ...newVideo, featuredClient: e.target.value })}
                    placeholder="e.g. Corporate Logistics Division"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Description</label>
                <textarea
                  rows={3}
                  value={newVideo.description}
                  onChange={(e) => setNewVideo({ ...newVideo, description: e.target.value })}
                  placeholder="Summary of what is demonstrated in the video..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs shadow-lg flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Publish Video</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Picker Modal */}
      {activeImagePickerField && (
        <ImagePicker
          isOpen={activeImagePickerField}
          onClose={() => setActiveImagePickerField(false)}
          onSelect={(item) => {
            if (editingVideo) {
              setEditingVideo({ ...editingVideo, thumbnailUrl: item.url });
            } else {
              setNewVideo({ ...newVideo, thumbnailUrl: item.url });
            }
            setActiveImagePickerField(false);
          }}
          title="Select Cover Thumbnail from Media Library"
        />
      )}
    </div>
  );
};
