import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export const BackToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-20 sm:bottom-6 left-4 sm:left-6 z-40 bg-slate-900/90 hover:bg-amber-500 text-slate-200 hover:text-slate-950 p-3 rounded-2xl border border-slate-800 hover:border-amber-400 shadow-xl backdrop-blur-md transition-all duration-300 transform hover:scale-110 active:scale-95 group flex items-center gap-2"
      aria-label="Back to Top"
      id="back-to-top-btn"
      title="Scroll back to top"
    >
      <ArrowUp className="w-5 h-5 stroke-[2.5] group-hover:-translate-y-0.5 transition-transform" />
      <span className="hidden md:inline text-xs font-black uppercase tracking-wider pr-1">Top</span>
    </button>
  );
};
