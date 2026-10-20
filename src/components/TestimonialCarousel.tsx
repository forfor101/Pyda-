import React, { useState, useEffect, useCallback } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Star, 
  Quote, 
  CheckCircle2, 
  Building2, 
  Home, 
  Truck, 
  Store, 
  Pause, 
  Play, 
  ShieldCheck,
  Search,
  Plus,
  ThumbsUp,
  LayoutGrid,
  SlidersHorizontal,
  Loader2,
  RefreshCw,
  Sparkles,
  Award,
  Check
} from 'lucide-react';
import { ServiceType, TestimonialItem } from '../types';
import { fetchTestimonialsFromDb, upvoteHelpful } from '../services/testimonialService';
import { WriteReviewModal } from './WriteReviewModal';

interface TestimonialCarouselProps {
  onOpenQuoteModal?: (service?: ServiceType) => void;
}

export const TestimonialCarousel: React.FC<TestimonialCarouselProps> = ({ onOpenQuoteModal }) => {
  // State management
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'helpful' | 'rating'>('helpful');
  const [viewMode, setViewMode] = useState<'carousel' | 'grid'>('carousel');
  
  // Testimonials data and pagination
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(24);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [categoryCounts, setCategoryCounts] = useState<{ id: string; label: string; count: number }[]>([]);
  const [averageRating, setAverageRating] = useState(4.98);
  const [verifiedRatio, setVerifiedRatio] = useState('100%');

  // Carousel controls
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  // Modals & Interaction
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [upvotedIds, setUpvotedIds] = useState<Record<string, boolean>>({});

  const PAGE_SIZE = 6;

  // Load initial batch of testimonials from local mock JSON database
  const loadInitialTestimonials = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetchTestimonialsFromDb({
        page: 1,
        limit: PAGE_SIZE,
        category: activeCategory,
        search: searchQuery,
        sortBy,
      });

      setTestimonials(response.testimonials);
      setTotalCount(response.totalCount);
      setHasMore(response.hasMore);
      setPage(1);
      setCurrentIndex(0);
      if (response.categories.length > 0) {
        setCategoryCounts(response.categories);
      }
      setAverageRating(response.averageRating);
      setVerifiedRatio(response.verifiedRatio);
    } catch (err) {
      console.error('Failed to load initial testimonials from JSON mock database:', err);
    } finally {
      setIsLoading(false);
    }
  }, [activeCategory, searchQuery, sortBy]);

  // Load more testimonials from the local mock JSON database (pagination)
  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    const nextPage = page + 1;

    try {
      const response = await fetchTestimonialsFromDb({
        page: nextPage,
        limit: PAGE_SIZE,
        category: activeCategory,
        search: searchQuery,
        sortBy,
      });

      // Append newly fetched items to the existing list
      setTestimonials((prev) => {
        const existingIds = new Set(prev.map((item) => item.id));
        const newUnique = response.testimonials.filter((item) => !existingIds.has(item.id));
        return [...prev, ...newUnique];
      });

      setPage(nextPage);
      setHasMore(response.hasMore);
      setTotalCount(response.totalCount);
    } catch (err) {
      console.error('Failed to fetch additional testimonials from mock database:', err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Trigger load whenever category, search query, or sorting changes
  useEffect(() => {
    const timer = setTimeout(() => {
      loadInitialTestimonials();
    }, 200);
    return () => clearTimeout(timer);
  }, [loadInitialTestimonials]);

  // Auto-play timer for carousel mode
  useEffect(() => {
    if (!autoPlay || viewMode !== 'carousel' || testimonials.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [autoPlay, viewMode, testimonials.length]);

  const handlePrev = () => {
    if (testimonials.length === 0) return;
    setCurrentIndex((prev) => 
      prev === 0 ? testimonials.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    if (testimonials.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  // Helpful Upvote Handler
  const handleHelpfulClick = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (upvotedIds[id]) return;

    // Optimistic UI update
    setUpvotedIds((prev) => ({ ...prev, [id]: true }));
    setTestimonials((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, helpfulCount: (item.helpfulCount || 0) + 1 } : item
      )
    );

    await upvoteHelpful(id);
  };

  // Callback when a new review is submitted via modal
  const handleReviewSubmitted = (newReview: TestimonialItem) => {
    setTestimonials((prev) => [newReview, ...prev]);
    setTotalCount((prev) => prev + 1);
  };

  const getServiceIcon = (category: string) => {
    switch (category) {
      case 'corporate':
        return <Building2 className="w-3.5 h-3.5 text-amber-400" />;
      case 'residential':
        return <Home className="w-3.5 h-3.5 text-emerald-400" />;
      case 'commercial':
        return <Store className="w-3.5 h-3.5 text-purple-400" />;
      case 'haulage':
        return <Truck className="w-3.5 h-3.5 text-blue-400" />;
      default:
        return <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />;
    }
  };

  // Visible items for carousel slider
  const visibleCarouselItems = testimonials.length > 0
    ? testimonials.slice(currentIndex, currentIndex + 3).concat(
        currentIndex + 3 > testimonials.length
          ? testimonials.slice(0, Math.max(0, (currentIndex + 3) - testimonials.length))
          : []
      ).slice(0, Math.min(3, testimonials.length))
    : [];

  return (
    <section className="py-20 bg-slate-950 text-white relative overflow-hidden border-t border-b border-slate-800" id="testimonials">
      {/* Background Glow */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header with Verified Metrics */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-10">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold px-3.5 py-1.5 rounded-full uppercase tracking-wider">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>Verified Client Social Proof Database</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              Trusted by Corporate Leaders & Families Across Africa
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Explore authentic relocation stories from 14,800+ completed corporate headquarters migrations, family home moves, and heavy freight haulage operations.
            </p>

            {/* Quick Metrics Bar */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl text-xs">
                <Award className="w-4 h-4 text-amber-400" />
                <span className="text-slate-300 font-bold">{averageRating} / 5.0 Rating</span>
                <span className="text-slate-500">({totalCount} Local Mock Records)</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-300 font-bold">{verifiedRatio} Verified Relocations</span>
              </div>
            </div>
          </div>

          {/* Action Header: Mode Switcher, Write Review & Nav Controls */}
          <div className="flex flex-wrap items-center gap-3 self-start lg:self-end">
            
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1">
              <button
                onClick={() => setViewMode('carousel')}
                className={`p-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  viewMode === 'carousel'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Carousel Mode"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Carousel</span>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Grid / Archive View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Grid ({testimonials.length})</span>
              </button>
            </div>

            {/* Write a Review Button */}
            <button
              onClick={() => setIsWriteModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-amber-500/40 text-amber-400 hover:text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
              id="write-testimonial-btn"
            >
              <Plus className="w-4 h-4" />
              <span>Submit Review</span>
            </button>

            {/* Carousel Navigation (if in carousel mode) */}
            {viewMode === 'carousel' && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAutoPlay(!autoPlay)}
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors"
                  title={autoPlay ? 'Pause Auto-Play' : 'Play Auto-Play'}
                >
                  {autoPlay ? <Pause className="w-4 h-4 text-amber-400" /> : <Play className="w-4 h-4 text-emerald-400" />}
                </button>
                <button
                  onClick={handlePrev}
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-amber-500 hover:text-slate-950 border border-slate-800 text-slate-200 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                  aria-label="Previous Testimonial"
                  id="testimonial-prev-btn"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNext}
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-amber-500 hover:text-slate-950 border border-slate-800 text-slate-200 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                  aria-label="Next Testimonial"
                  id="testimonial-next-btn"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl mb-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {(categoryCounts.length > 0
              ? categoryCounts
              : [
                  { id: 'all', label: 'All Reviews', count: totalCount },
                  { id: 'corporate', label: 'Corporate Relocation', count: 0 },
                  { id: 'residential', label: 'Residential Moves', count: 0 },
                  { id: 'commercial', label: 'Commercial & Retail', count: 0 },
                  { id: 'haulage', label: 'Heavy Haulage', count: 0 },
                ]
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 border ${
                  activeCategory === tab.id
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-black'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                    activeCategory === tab.id ? 'bg-slate-950 text-amber-400 font-bold' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Search Input & Sort Dropdown */}
          <div className="flex items-center gap-2 self-stretch md:self-auto shrink-0">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search reviews, routes, keywords..."
                className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'helpful' | 'rating')}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs font-semibold focus:outline-none focus:border-amber-400"
            >
              <option value="helpful">Most Helpful</option>
              <option value="rating">Top Rated (5★)</option>
            </select>
          </div>
        </div>

        {/* Loading Skeleton */}
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 py-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-slate-900/60 border border-slate-800 p-8 rounded-3xl animate-pulse space-y-4">
                <div className="flex justify-between">
                  <div className="h-4 w-24 bg-slate-800 rounded" />
                  <div className="h-4 w-16 bg-slate-800 rounded" />
                </div>
                <div className="h-6 w-3/4 bg-slate-800 rounded" />
                <div className="space-y-2">
                  <div className="h-4 w-full bg-slate-800/60 rounded" />
                  <div className="h-4 w-5/6 bg-slate-800/60 rounded" />
                  <div className="h-4 w-2/3 bg-slate-800/60 rounded" />
                </div>
                <div className="pt-6 border-t border-slate-800 flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-800 rounded-full" />
                  <div className="space-y-1 flex-1">
                    <div className="h-3 w-32 bg-slate-800 rounded" />
                    <div className="h-2.5 w-24 bg-slate-800/60 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : testimonials.length === 0 ? (
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 space-y-4">
            <Quote className="w-12 h-12 text-slate-700 mx-auto" />
            <div className="space-y-1">
              <p className="text-white font-bold text-base">No testimonials found matching your filter</p>
              <p className="text-xs text-slate-500">Try clearing your search query or selecting a different category tab.</p>
            </div>
            <button
              onClick={() => {
                setActiveCategory('all');
                setSearchQuery('');
              }}
              className="px-4 py-2 bg-amber-500 text-slate-950 rounded-xl text-xs font-bold hover:bg-amber-400 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          /* Main Testimonial Display Area */
          <div>
            {viewMode === 'carousel' ? (
              /* Carousel 3-Card Slider */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {visibleCarouselItems.map((item) => (
                  <TestimonialCard
                    key={item.id}
                    item={item}
                    getServiceIcon={getServiceIcon}
                    isUpvoted={!!upvotedIds[item.id]}
                    onHelpfulClick={(e) => handleHelpfulClick(item.id, e)}
                  />
                ))}
              </div>
            ) : (
              /* Expanded Full Grid View */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {testimonials.map((item) => (
                  <TestimonialCard
                    key={item.id}
                    item={item}
                    getServiceIcon={getServiceIcon}
                    isUpvoted={!!upvotedIds[item.id]}
                    onHelpfulClick={(e) => handleHelpfulClick(item.id, e)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Load More Button Section */}
        <div className="mt-12 flex flex-col items-center justify-center gap-4 text-center">
          
          {/* Progress Tracker */}
          <div className="text-xs font-medium text-slate-400 flex items-center gap-2">
            <span>Showing <strong className="text-amber-400">{testimonials.length}</strong> of <strong className="text-white">{totalCount}</strong> Verified Client Stories</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full max-w-xs h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.round((testimonials.length / Math.max(1, totalCount)) * 100))}%` }}
            />
          </div>

          {/* Load More Button */}
          {hasMore ? (
            <button
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 hover:from-amber-500 hover:to-amber-600 hover:text-slate-950 border border-slate-700 hover:border-amber-400 text-slate-200 text-xs sm:text-sm font-black transition-all shadow-xl hover:shadow-amber-500/10 flex items-center gap-2 disabled:opacity-50 active:scale-95 group"
              id="load-more-testimonials-btn"
            >
              {isLoadingMore ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400 group-hover:text-slate-950" />
                  <span>Fetching Reviews from Mock Database...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 text-amber-400 group-hover:text-slate-950 group-hover:rotate-180 transition-transform duration-500" />
                  <span>Load More Client Stories (+{Math.min(PAGE_SIZE, totalCount - testimonials.length)})</span>
                </>
              )}
            </button>
          ) : (
            testimonials.length > 0 && (
              <div className="inline-flex items-center gap-2 bg-slate-900/80 border border-slate-800 text-slate-400 text-xs font-semibold px-4 py-2 rounded-full">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>All {totalCount} verified reviews loaded from local database</span>
              </div>
            )
          )}
        </div>

      </div>

      {/* Write Review Modal */}
      <WriteReviewModal
        isOpen={isWriteModalOpen}
        onClose={() => setIsWriteModalOpen(false)}
        onSuccess={handleReviewSubmitted}
      />
    </section>
  );
};

interface TestimonialCardProps {
  item: TestimonialItem;
  getServiceIcon: (category: string) => React.ReactNode;
  isUpvoted: boolean;
  onHelpfulClick: (e: React.MouseEvent) => void;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({
  item,
  getServiceIcon,
  isUpvoted,
  onHelpfulClick,
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 p-7 rounded-3xl flex flex-col justify-between relative shadow-xl hover:shadow-2xl transition-all group">
      
      {/* Decorative Quote Mark */}
      <div className="absolute top-6 right-6 text-slate-800 group-hover:text-amber-500/20 transition-colors pointer-events-none">
        <Quote className="w-10 h-10" />
      </div>

      <div className="space-y-4 relative z-10">
        
        {/* Rating Stars & Verified Tag */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {[...Array(item.rating)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            ))}
          </div>
          {item.verified && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              <CheckCircle2 className="w-3 h-3" />
              <span>Verified Move</span>
            </span>
          )}
        </div>

        {/* Route / Service Tag */}
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg">
          {getServiceIcon(item.category)}
          <span>{item.serviceTitle} • {item.city}</span>
        </div>

        {/* Move Highlight Pill */}
        {item.moveHighlight && (
          <div className="text-[11px] font-semibold text-slate-300 bg-slate-800/70 border border-slate-700/60 px-2.5 py-1 rounded-md inline-block">
            <span className="text-amber-400 mr-1">✦</span> {item.moveHighlight}
          </div>
        )}

        {/* Quote Content */}
        <p className="text-slate-300 text-xs sm:text-sm leading-relaxed italic">
          "{item.quote}"
        </p>

        {/* Tags if available */}
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {item.tags.slice(0, 3).map((tag, idx) => (
              <span key={idx} className="text-[10px] text-slate-400 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Author Card Footer & Helpful Action */}
      <div className="mt-6 pt-5 border-t border-slate-800/80 flex items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-3">
          <img
            src={item.avatar}
            alt={item.author}
            className="w-10 h-10 rounded-full object-cover border border-amber-400/60 group-hover:scale-105 transition-transform"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
          <div>
            <h4 className="font-extrabold text-white text-xs sm:text-sm group-hover:text-amber-400 transition-colors">
              {item.author}
            </h4>
            <p className="text-[11px] text-slate-400 font-medium">{item.role}</p>
            <p className="text-[10px] text-amber-300/80 font-bold">{item.company}</p>
          </div>
        </div>

        {/* Helpful Upvote Button */}
        <button
          onClick={onHelpfulClick}
          className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
            isUpvoted
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : 'bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border-slate-700/60'
          }`}
          title="Mark review as helpful"
        >
          <ThumbsUp className={`w-3.5 h-3.5 ${isUpvoted ? 'fill-amber-400 text-amber-400' : ''}`} />
          <span className="text-[11px] font-mono">{item.helpfulCount || 0}</span>
        </button>
      </div>
    </div>
  );
};
