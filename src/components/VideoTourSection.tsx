import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  Maximize2, 
  Sparkles, 
  ShieldCheck, 
  Building2, 
  Truck, 
  Package, 
  CheckCircle2, 
  ExternalLink, 
  Award, 
  ChevronRight, 
  Layers, 
  Film, 
  Clock, 
  MapPin, 
  ArrowRight,
  Info,
  X
} from 'lucide-react';
import { useCms } from '../context/CmsContext';
import { VideoShowcaseItem, ServiceType } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface VideoTourSectionProps {
  onOpenQuoteModal?: (serviceType?: ServiceType) => void;
}

export const VideoTourSection: React.FC<VideoTourSectionProps> = ({ onOpenQuoteModal }) => {
  const { cms } = useCms();
  const { t } = useLanguage();

  // Curated Nigerian operations & facility videos with fallback demos
  const defaultVideos: VideoShowcaseItem[] = [
    {
      id: 'vid-facility-abuja',
      title: 'Abuja Citygate Terminal & Fleet Staging Facility Tour',
      category: 'facility_tour',
      categoryLabel: 'Operations Facility',
      description: 'Go behind the scenes at our AA Rano Citygate Airport Road central dispatch hub, featuring heavy trailer bays, climate-controlled container storage, and computerized telematics operations.',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Clean embed converter handles YouTube/Vimeo/Direct MP4
      thumbnailUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&auto=format&fit=crop&q=80',
      durationFormatted: '3:45 Min',
      location: 'Abuja Airport Road Hub',
      featuredClient: 'Operations & Fleet Command',
      keyHighlights: [
        'Secure 24/7 CCTV-monitored enclosed warehousing',
        'Hydraulic tail-lift fleet staging and maintenance yard',
        'Central telematics GPS tracking dispatch command station',
      ],
    },
    {
      id: 'vid-packing-white-glove',
      title: '5-Ply Export Packing & Custom Wooden Crating Demonstration',
      category: 'packing_demo',
      categoryLabel: 'Packing Quality',
      description: 'Watch our master riggers and carpenters craft bespoke wooden crates on-site, bubble-wrap fragile electronics, and shock-pad server racks for zero-downtime migrations.',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      thumbnailUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80',
      durationFormatted: '4:12 Min',
      location: 'Victoria Island & Maitama Sites',
      featuredClient: 'White-Glove Packing Standards',
      keyHighlights: [
        'Multi-layer export shock cushioning & edge corner guards',
        'Anti-static bubble insulation for enterprise server racks',
        'Heat-treated custom crating for Italian marble & artwork',
      ],
    },
    {
      id: 'vid-corp-bank-relocation',
      title: 'Client Story: 48-Hour Zero-Downtime Bank Headquarters Migration',
      category: 'client_story',
      categoryLabel: 'Verified Testimonial',
      description: 'How Megatrend Movers seamlessly transitioned a 4-floor commercial banking headquarters from Victoria Island to Central Business District Abuja over a single weekend.',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      thumbnailUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80',
      durationFormatted: '5:20 Min',
      location: 'Lagos ➔ Abuja Corridor',
      featuredClient: 'Tier-1 Banking & Financial Partners',
      keyHighlights: [
        '100% operational resumption on Monday 8:00 AM',
        'Serialized barcode tagging on 450+ IT workstations',
        'Armed highway security escorts along A2 federal corridor',
      ],
    },
    {
      id: 'vid-fleet-operations',
      title: 'Pan-African Heavy Haulage & 30-Ton Freight Fleet in Action',
      category: 'fleet_operations',
      categoryLabel: 'Fleet Capabilities',
      description: 'Experience our fleet traversing Nigerian state highways and cross-border ECOWAS corridors with satellite speed monitoring and verified tamper-evident seals.',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      thumbnailUrl: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=1200&auto=format&fit=crop&q=80',
      durationFormatted: '3:10 Min',
      location: 'Nationwide Highway Corridors',
      featuredClient: 'Industrial & Port Logistics',
      keyHighlights: [
        'Air-ride shock absorbing suspension on heavy trucks',
        'Real-time satellite telematics monitoring speed & route',
        'Full Goods-in-Transit cargo insurance underwritten',
      ],
    },
  ];

  const videoList: VideoShowcaseItem[] = 
    cms.videoShowcase && cms.videoShowcase.length > 0 
      ? cms.videoShowcase 
      : defaultVideos;

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedVideo, setSelectedVideo] = useState<VideoShowcaseItem>(videoList[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeModalVideo, setActiveModalVideo] = useState<VideoShowcaseItem | null>(null);

  const categories = [
    { id: 'all', label: 'All Operations', icon: <Film className="w-3.5 h-3.5" /> },
    { id: 'facility_tour', label: 'Facility & Warehouse Tours', icon: <Building2 className="w-3.5 h-3.5 text-amber-400" /> },
    { id: 'packing_demo', label: 'Packing Quality & Crating', icon: <Package className="w-3.5 h-3.5 text-emerald-400" /> },
    { id: 'client_story', label: 'Client Case Studies', icon: <Award className="w-3.5 h-3.5 text-blue-400" /> },
    { id: 'fleet_operations', label: 'Fleet & Highway Haulage', icon: <Truck className="w-3.5 h-3.5 text-purple-400" /> },
  ];

  const filteredVideos = videoList.filter((item) => {
    if (activeCategory === 'all') return true;
    return item.category === activeCategory;
  });

  // Convert various video URLs (YouTube watch/share, Vimeo, or direct MP4) into proper embed format
  const getEmbedUrl = (url: string): { type: 'youtube' | 'vimeo' | 'direct'; src: string } => {
    if (!url) {
      return { type: 'youtube', src: 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0' };
    }

    // YouTube regex
    const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (ytMatch && ytMatch[1]) {
      return {
        type: 'youtube',
        src: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0&modestbranding=1`,
      };
    }

    // Vimeo regex
    const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?([0-9]+)/);
    if (vimeoMatch && vimeoMatch[1]) {
      return {
        type: 'vimeo',
        src: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`,
      };
    }

    // Direct MP4 / WebM video link
    return { type: 'direct', src: url };
  };

  const handleSelectVideo = (video: VideoShowcaseItem) => {
    setSelectedVideo(video);
    setIsPlaying(false);
  };

  const embedInfo = getEmbedUrl(selectedVideo.videoUrl);

  return (
    <section id="video-tour-section" className="py-16 sm:py-24 bg-slate-950 text-white relative overflow-hidden border-t border-slate-800">
      {/* Background glow styling */}
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[300px] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[400px] h-[300px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">
            <Film className="w-4 h-4" />
            <span>Operational Scale & Quality Proof</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white uppercase font-sans">
            Video Tour & <span className="text-amber-400">Operations Showcase</span>
          </h2>

          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            See our heavy fleet in action, tour our central warehousing facilities, and witness the meticulous 5-ply export crating and white-glove rigging standards that protect your cargo.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 scale-105'
                    : 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {cat.icon}
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Main Stage Grid: Hero Video Player + Interactive Playlist */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Video Cinema Screen (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="relative aspect-video rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl group">
              {isPlaying ? (
                embedInfo.type === 'direct' ? (
                  <video
                    src={embedInfo.src}
                    controls
                    autoPlay
                    className="w-full h-full object-cover"
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <iframe
                    src={embedInfo.src}
                    title={selectedVideo.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                )
              ) : (
                <>
                  <img
                    src={selectedVideo.thumbnailUrl}
                    alt={selectedVideo.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-75"
                  />
                  {/* Subtle Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                    <span className="bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-lg">
                      {selectedVideo.categoryLabel}
                    </span>
                    <span className="bg-slate-950/80 backdrop-blur-md border border-slate-700 text-slate-200 text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      {selectedVideo.durationFormatted}
                    </span>
                  </div>

                  {/* Center Play Trigger */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button
                      onClick={() => setIsPlaying(true)}
                      className="w-20 h-20 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center shadow-2xl shadow-amber-500/50 transform group-hover:scale-110 active:scale-95 transition-all cursor-pointer border-4 border-amber-300/40"
                      aria-label="Play Video"
                    >
                      <Play className="w-8 h-8 fill-current translate-x-0.5 stroke-none" />
                    </button>
                  </div>

                  {/* Bottom Video Meta Bar */}
                  <div className="absolute bottom-4 left-4 right-4 text-left">
                    <p className="text-xs text-amber-400 font-black uppercase tracking-wider flex items-center gap-1 mb-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {selectedVideo.location || 'Nationwide Operations'}
                    </p>
                    <h3 className="text-lg sm:text-xl font-black text-white line-clamp-1">
                      {selectedVideo.title}
                    </h3>
                  </div>
                </>
              )}
            </div>

            {/* Video Detailed Highlights & Technical Summary */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Featured Segment</span>
                  <h4 className="text-base font-black text-white">{selectedVideo.title}</h4>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Client / Division</span>
                  <p className="text-xs font-bold text-amber-400">{selectedVideo.featuredClient || 'Megatrend Logistics Fleet'}</p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {selectedVideo.description}
              </p>

              {/* Key Highlights Checkboxes */}
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-2">
                <p className="text-[11px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Quality Assurance Demonstrated In This Video:</span>
                </p>
                <div className="grid sm:grid-cols-1 gap-2">
                  {selectedVideo.keyHighlights.map((hl, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{hl}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Video Playlist Selector (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                <span>Featured Tour Playlist</span>
              </h3>
              <span className="text-xs text-slate-400 font-bold">
                {filteredVideos.length} Videos Available
              </span>
            </div>

            <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1">
              {filteredVideos.map((video) => {
                const isSelected = selectedVideo.id === video.id;
                return (
                  <button
                    key={video.id}
                    onClick={() => handleSelectVideo(video)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all duration-150 flex items-start gap-3.5 cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 border-amber-500/60 shadow-lg shadow-amber-500/10'
                        : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/70'
                    }`}
                  >
                    {/* Thumbnail with mini play icon */}
                    <div className="relative w-28 h-20 rounded-xl overflow-hidden shrink-0 bg-slate-950 border border-slate-800">
                      <img
                        src={video.thumbnailUrl}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                          isSelected ? 'bg-amber-500 text-slate-950' : 'bg-slate-900/90 text-white'
                        }`}>
                          <Play className="w-3.5 h-3.5 fill-current translate-x-0.5 stroke-none" />
                        </div>
                      </div>
                      <span className="absolute bottom-1 right-1 bg-slate-950/90 text-[9px] font-bold text-white px-1.5 py-0.5 rounded">
                        {video.durationFormatted}
                      </span>
                    </div>

                    {/* Metadata */}
                    <div className="space-y-1 flex-grow min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-950 text-amber-400 border border-slate-800">
                          {video.categoryLabel}
                        </span>
                        {video.location && (
                          <span className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                            <MapPin className="w-2.5 h-2.5" />
                            {video.location}
                          </span>
                        )}
                      </div>
                      <h4 className={`text-xs sm:text-sm font-black leading-snug line-clamp-2 ${
                        isSelected ? 'text-amber-400' : 'text-white'
                      }`}>
                        {video.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 line-clamp-1">
                        {video.featuredClient || 'Megatrend Verified'}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quick Consultation CTA */}
            <div className="bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/30 rounded-2xl p-5 space-y-3 mt-4">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-black uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Ready To Book Your Move?</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Schedule an on-site video or physical survey with our senior logistics coordinator today.
              </p>
              <div className="flex items-center gap-2 pt-1">
                {onOpenQuoteModal && (
                  <button
                    onClick={() => onOpenQuoteModal('corporate')}
                    className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs py-2.5 px-4 rounded-xl shadow-lg flex items-center justify-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
                  >
                    <span>Request Free Estimate</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
                <a
                  href="https://wa.me/2348062466212?text=Hello%20Megatrend%20Movers!%20I%20watched%20your%20facility%20tour%20video%20and%20want%20to%20request%20a%20quote."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 px-3.5 rounded-xl shadow-lg flex items-center justify-center gap-1.5 transition-transform active:scale-95"
                >
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
