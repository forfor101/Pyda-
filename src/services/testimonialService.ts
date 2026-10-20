import { TestimonialItem, TestimonialQueryOptions, TestimonialDatabaseResponse } from '../types';

// Fallback in-memory dataset to guarantee zero-failure offline execution
import { TESTIMONIALS as DEFAULT_TESTIMONIALS } from '../data/companyData';

/**
 * Service to manage fetching and querying testimonials from the local mock JSON database
 */
export async function fetchTestimonialsFromDb(
  options: TestimonialQueryOptions = {}
): Promise<TestimonialDatabaseResponse> {
  const page = options.page || 1;
  const limit = options.limit || 6;
  const category = options.category || 'all';
  const search = (options.search || '').trim().toLowerCase();
  const sortBy = options.sortBy || 'helpful';

  const queryParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    category,
    search,
    sortBy,
  });

  try {
    const res = await fetch(`/api/testimonials?${queryParams.toString()}`, {
      headers: { Accept: 'application/json' },
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.testimonials)) {
        return {
          testimonials: data.testimonials,
          totalCount: data.totalCount,
          page: data.page,
          limit: data.limit,
          hasMore: data.hasMore,
          categories: data.categories || [],
          averageRating: data.averageRating || 4.98,
          verifiedRatio: data.verifiedRatio || '100%',
        };
      }
    }
  } catch (err) {
    console.warn('[TestimonialService] Direct API unavailable, attempting static JSON fetch:', err);
  }

  // Secondary Fallback: Fetch directly from /data/testimonials-mock-db.json in public folder
  try {
    const staticRes = await fetch('/data/testimonials-mock-db.json');
    if (staticRes.ok) {
      const staticData = await staticRes.json();
      let list: TestimonialItem[] = staticData.testimonials || [];

      if (category && category !== 'all') {
        list = list.filter((t) => t.category === category);
      }

      if (search) {
        list = list.filter(
          (t) =>
            t.author.toLowerCase().includes(search) ||
            t.company.toLowerCase().includes(search) ||
            t.city.toLowerCase().includes(search) ||
            t.quote.toLowerCase().includes(search) ||
            t.serviceTitle.toLowerCase().includes(search) ||
            (t.moveHighlight && t.moveHighlight.toLowerCase().includes(search)) ||
            (t.tags && t.tags.some((tag) => tag.toLowerCase().includes(search)))
        );
      }

      if (sortBy === 'helpful') {
        list.sort((a, b) => (b.helpfulCount || 0) - (a.helpfulCount || 0));
      } else if (sortBy === 'rating') {
        list.sort((a, b) => b.rating - a.rating);
      }

      const totalCount = list.length;
      const startIndex = (page - 1) * limit;
      const paginated = list.slice(startIndex, startIndex + limit);
      const hasMore = startIndex + limit < totalCount;

      const raw = staticData.testimonials || [];
      const categories = [
        { id: 'all', label: 'All Reviews', count: raw.length },
        { id: 'corporate', label: 'Corporate Relocation', count: raw.filter((t: any) => t.category === 'corporate').length },
        { id: 'residential', label: 'Residential Moves', count: raw.filter((t: any) => t.category === 'residential').length },
        { id: 'commercial', label: 'Commercial & Retail', count: raw.filter((t: any) => t.category === 'commercial').length },
        { id: 'haulage', label: 'Heavy Haulage', count: raw.filter((t: any) => t.category === 'haulage').length },
      ];

      return {
        testimonials: paginated,
        totalCount,
        page,
        limit,
        hasMore,
        categories,
        averageRating: staticData.averageRating || 4.98,
        verifiedRatio: staticData.verifiedRatio || '100%',
      };
    }
  } catch (staticErr) {
    console.warn('[TestimonialService] Static JSON fetch failed, utilizing embedded fallback:', staticErr);
  }

  // Tertiary Fallback: in-memory constant
  let fallbackList = (DEFAULT_TESTIMONIALS as any[]).map((t) => ({
    ...t,
    helpfulCount: t.helpfulCount || 25,
    tags: t.tags || ['Verified Client'],
  }));

  if (category && category !== 'all') {
    fallbackList = fallbackList.filter((t) => t.category === category);
  }

  if (search) {
    fallbackList = fallbackList.filter(
      (t) =>
        t.author.toLowerCase().includes(search) ||
        t.company.toLowerCase().includes(search) ||
        t.city.toLowerCase().includes(search) ||
        t.quote.toLowerCase().includes(search)
    );
  }

  const totalCount = fallbackList.length;
  const startIndex = (page - 1) * limit;
  const paginated = fallbackList.slice(startIndex, startIndex + limit);

  return {
    testimonials: paginated,
    totalCount,
    page,
    limit,
    hasMore: startIndex + limit < totalCount,
    categories: [
      { id: 'all', label: 'All Reviews', count: DEFAULT_TESTIMONIALS.length },
      { id: 'corporate', label: 'Corporate Relocation', count: DEFAULT_TESTIMONIALS.filter((t) => t.category === 'corporate').length },
      { id: 'residential', label: 'Residential Moves', count: DEFAULT_TESTIMONIALS.filter((t) => t.category === 'residential').length },
      { id: 'commercial', label: 'Commercial & Retail', count: DEFAULT_TESTIMONIALS.filter((t) => t.category === 'commercial').length },
      { id: 'haulage', label: 'Heavy Haulage', count: DEFAULT_TESTIMONIALS.filter((t) => t.category === 'haulage').length },
    ],
    averageRating: 4.98,
    verifiedRatio: '100%',
  };
}

/**
 * Submit a customer testimonial to the local database
 */
export async function submitTestimonial(testimonialData: Partial<TestimonialItem>): Promise<{ success: boolean; message: string; testimonial?: TestimonialItem }> {
  try {
    const res = await fetch('/api/testimonials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testimonialData),
    });

    const data = await res.json();
    return data;
  } catch (err: any) {
    console.error('Error submitting testimonial:', err);
    return {
      success: false,
      message: err.message || 'Failed to submit review.',
    };
  }
}

/**
 * Increment helpful count on a testimonial
 */
export async function upvoteHelpful(testimonialId: string): Promise<{ success: boolean; helpfulCount?: number }> {
  try {
    const res = await fetch(`/api/testimonials/${testimonialId}/helpful`, {
      method: 'POST',
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Helpful upvote API call failed:', err);
  }
  return { success: false };
}
