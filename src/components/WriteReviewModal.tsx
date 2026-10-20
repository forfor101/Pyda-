import React, { useState } from 'react';
import { X, Star, CheckCircle2, Building2, Home, Truck, Store, ShieldCheck, Send } from 'lucide-react';
import { TestimonialItem, ServiceType } from '../types';
import { submitTestimonial } from '../services/testimonialService';

interface WriteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newTestimonial: TestimonialItem) => void;
}

export const WriteReviewModal: React.FC<WriteReviewModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [author, setAuthor] = useState('');
  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [city, setCity] = useState('');
  const [category, setCategory] = useState<ServiceType>('residential');
  const [serviceTitle, setServiceTitle] = useState('Residential Move');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [moveHighlight, setMoveHighlight] = useState('');
  const [quote, setQuote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleCategoryChange = (cat: ServiceType) => {
    setCategory(cat);
    switch (cat) {
      case 'corporate':
        setServiceTitle('Corporate Office Relocation');
        break;
      case 'residential':
        setServiceTitle('Residential White-Glove Move');
        break;
      case 'commercial':
        setServiceTitle('Commercial & Retail Migration');
        break;
      case 'haulage':
        setServiceTitle('Heavy Freight & Haulage');
        break;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !quote.trim()) {
      setErrorMsg('Please enter your full name and review details.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const payload: Partial<TestimonialItem> = {
        author: author.trim(),
        role: role.trim() || 'Verified Client',
        company: company.trim() || 'Private Move',
        city: city.trim() || 'Nigeria',
        category,
        serviceTitle,
        rating,
        moveHighlight: moveHighlight.trim() || 'Verified Relocation',
        quote: quote.trim(),
        avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
        tags: [serviceTitle, city || 'Verified'],
      };

      const result = await submitTestimonial(payload);
      if (result.success && result.testimonial) {
        setSuccessMsg('Thank you! Your testimonial has been verified and added.');
        setTimeout(() => {
          onSuccess(result.testimonial!);
          onClose();
        }, 1200);
      } else {
        setErrorMsg(result.message || 'Failed to record testimonial.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl p-6 sm:p-8 relative shadow-2xl my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          id="close-write-review-modal"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-2 mb-6">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-400 text-xs font-bold px-3 py-1 rounded-full border border-amber-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verified Customer Feedback</span>
          </div>
          <h3 className="text-2xl font-black text-white tracking-tight">
            Share Your Relocation Experience
          </h3>
          <p className="text-slate-400 text-xs sm:text-sm">
            Your review helps Nigerian families and corporate enterprises choose a trusted moving partner.
          </p>
        </div>

        {/* Feedback Alerts */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-semibold">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Service Category Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Service Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'residential', label: 'Residential', icon: Home },
                { id: 'corporate', label: 'Corporate', icon: Building2 },
                { id: 'commercial', label: 'Commercial', icon: Store },
                { id: 'haulage', label: 'Haulage', icon: Truck },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = category === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleCategoryChange(item.id as ServiceType)}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-md'
                        : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-slate-950' : 'text-amber-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rating Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Your Rating ({rating} Stars)
            </label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 rounded-lg hover:scale-110 transition-transform focus:outline-none"
                  aria-label={`Rate ${star} star`}
                >
                  <Star
                    className={`w-6 h-6 transition-colors ${
                      star <= (hoverRating || rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-700'
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs text-amber-400 font-bold ml-2">
                {rating === 5 ? 'Exceptional Service' : rating === 4 ? 'Very Good' : 'Satisfactory'}
              </span>
            </div>
          </div>

          {/* User Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Your Full Name *
              </label>
              <input
                type="text"
                required
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="e.g., Dr. Aminu Ibrahim"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Role / Title
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g., Head of IT / Homeowner"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Company or Entity
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g., Zenith Energy / Private Client"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Route / Cities
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g., Lagos ➔ Abuja"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Move Highlight */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Key Move Highlight (Optional)
            </label>
            <input
              type="text"
              value={moveHighlight}
              onChange={(e) => setMoveHighlight(e.target.value)}
              placeholder="e.g., 4-Bedroom Duplex • Zero Scratches"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Quote Body */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Your Review / Story *
            </label>
            <textarea
              required
              rows={3}
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              placeholder="Share details about the packing quality, vehicle condition, punctuality, and professionalism of the Megatrend crew..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-amber-400 resize-none"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98]"
              id="submit-testimonial-btn"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Verified Review</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
