import React from 'react';
import registeredSignImg from '../assets/images/registered_trademark_sign_1790283777721.jpg';

interface BrandLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  showRegisteredSign?: boolean;
  taglineVariant?: 'full' | 'compact' | 'minimal';
  theme?: 'dark' | 'light';
  brandName?: string;
  brandSuffix?: string;
  className?: string;
  onClick?: () => void;
  id?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showTagline = true,
  showRegisteredSign = true,
  taglineVariant = 'full',
  theme = 'dark',
  brandName = 'PYDA',
  brandSuffix = 'MOVERS',
  className = '',
  onClick,
  id = 'brand-logo',
}) => {
  // Balanced optical scale definitions
  const dimensions = {
    xs: {
      emblem: 'w-8 h-8',
      text: 'text-lg',
      subtext: 'text-[8px]',
      track: 'tracking-[0.16em]',
      gap: 'gap-2.5',
      rSign: 'w-2.5 h-2.5',
    },
    sm: {
      emblem: 'w-10 h-10',
      text: 'text-2xl',
      subtext: 'text-[9px]',
      track: 'tracking-[0.20em]',
      gap: 'gap-3',
      rSign: 'w-3 h-3',
    },
    md: {
      emblem: 'w-12 h-12 sm:w-14 sm:h-14 md:w-15 md:h-15',
      text: 'text-3xl sm:text-4xl md:text-[42px] lg:text-[44px]',
      subtext: 'text-[10px] sm:text-[11px] md:text-xs',
      track: 'tracking-[0.22em] sm:tracking-[0.26em]',
      gap: 'gap-3 sm:gap-3.5 md:gap-4',
      rSign: 'w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5',
    },
    lg: {
      emblem: 'w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20',
      text: 'text-4xl sm:text-5xl md:text-[48px]',
      subtext: 'text-xs sm:text-sm',
      track: 'tracking-[0.25em] sm:tracking-[0.28em]',
      gap: 'gap-4 sm:gap-5',
      rSign: 'w-5 h-5 sm:w-5.5 sm:h-5.5 md:w-6 md:h-6',
    },
    xl: {
      emblem: 'w-20 h-20 sm:w-24 sm:h-24',
      text: 'text-5xl sm:text-6xl',
      subtext: 'text-sm sm:text-base',
      track: 'tracking-[0.3em]',
      gap: 'gap-5 sm:gap-6',
      rSign: 'w-6 h-6 sm:w-7 sm:h-7',
    },
  }[size];

  const isLight = theme === 'light';

  return (
    <div
      onClick={onClick}
      id={id}
      className={`group flex items-center ${dimensions.gap} select-none transition-all ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {/* ========================================================================= */}
      {/* BESPOKE LOGOMARK EMBLEM: ARCHITECTURAL "P" + FORWARD FREIGHT VELOCITY */}
      {/* ========================================================================= */}
      <div className={`relative shrink-0 ${dimensions.emblem} transition-transform duration-300 group-hover:scale-105`}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_10px_25px_rgba(245,158,11,0.35)]"
          aria-hidden="true"
        >
          <defs>
            {/* Architectural Saharan Burnished Brass & Gold Gradient */}
            <linearGradient id="pydaGoldMetallic" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFDF5" />
              <stop offset="18%" stopColor="#FBE5A3" />
              <stop offset="48%" stopColor="#E5A738" />
              <stop offset="82%" stopColor="#C88318" />
              <stop offset="100%" stopColor="#824E09" />
            </linearGradient>

            {/* Radiant Accent Gold for Inner Vector */}
            <linearGradient id="pydaGoldCore" x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="45%" stopColor="#FCEFC7" />
              <stop offset="100%" stopColor="#E5A738" />
            </linearGradient>

            {/* Deep Botanical Forest & Obsidian Base Plate (Duchess Naturals inspired) */}
            <linearGradient id="pydaObsidianBase" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#15652e" />
              <stop offset="40%" stopColor="#0f2e1b" />
              <stop offset="100%" stopColor="#08180e" />
            </linearGradient>

            {/* Caliper Border Gradient */}
            <linearGradient id="pydaBorderGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fed700" stopOpacity="0.95" />
              <stop offset="50%" stopColor="#83b735" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#fcb900" stopOpacity="0.9" />
            </linearGradient>

            {/* Drop Shadow for the "P" Vector */}
            <filter id="vectorDropShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000000" floodOpacity="0.6" />
            </filter>
          </defs>

          {/* Chamfered Shield Carrier / Precision Geometric Plate */}
          <rect
            x="4"
            y="4"
            width="92"
            height="92"
            rx="24"
            fill="url(#pydaObsidianBase)"
            stroke="url(#pydaBorderGold)"
            strokeWidth="2.5"
          />

          {/* Inner Inset Geodesic Border */}
          <rect
            x="9"
            y="9"
            width="82"
            height="82"
            rx="19"
            stroke="#E5A738"
            strokeWidth="0.8"
            strokeOpacity="0.25"
            strokeDasharray="4 3"
          />

          {/* Geodetic Coordinate Calibration Pins */}
          <circle cx="16" cy="16" r="1.5" fill="#E5A738" opacity="0.6" />
          <circle cx="84" cy="16" r="1.5" fill="#E5A738" opacity="0.6" />
          <circle cx="84" cy="84" r="1.5" fill="#E5A738" opacity="0.6" />
          <circle cx="16" cy="84" r="1.5" fill="#E5A738" opacity="0.6" />

          {/* =================================================== */}
          {/* THE "P" ARCHITECTURAL VECTOR FORM */}
          {/* =================================================== */}
          <g filter="url(#vectorDropShadow)">
            {/* Left Vertical Pillar: Strong, Confident, Architectural */}
            <path
              d="M 26 23 C 26 21.34 27.34 20 29 20 L 42 20 C 43.66 20 45 21.34 45 23 L 45 77 C 45 78.66 43.66 80 42 80 L 32.5 80 C 30.84 80 29.5 78.66 29.5 77 L 26 71 Z"
              fill="url(#pydaGoldMetallic)"
            />

            {/* Dynamic Upper Loop of "P" with Compound Negative Space */}
            {/* Outer perimeter of Loop + Inner Window using evenodd */}
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M 45 20 L 64 20 C 76.5 20 86 29.5 86 42 C 86 54.5 76.5 64 64 64 L 45 64 L 45 52 L 63 52 C 68.5 52 73 47.5 73 42 C 73 36.5 68.5 32 63 32 L 45 32 Z"
              fill="url(#pydaGoldMetallic)"
            />

            {/* Dynamic Supersonic Forward Arrow (The Velocity Vector) */}
            <path
              d="M 37 32 L 54 42 L 37 52 L 47 42 Z"
              fill="url(#pydaGoldCore)"
            />

            {/* Forward Transit Trajectory Line */}
            <path
              d="M 57 42 L 72 42"
              stroke="#FFFBEB"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Precision Delivery Node Pulse Dot (Duchess Leaf Green) */}
            <circle cx="73" cy="42" r="2.2" fill="#83b735" />
          </g>

          {/* Subtle Dynamic Bevel Light Reflection Streak */}
          <path
            d="M 28 22 L 40 22 L 32 74 L 28 68 Z"
            fill="#FFFFFF"
            opacity="0.15"
          />
        </svg>

        {/* Outer Radiant Glow on Interaction */}
        <div className="absolute inset-0 rounded-3xl bg-emerald-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none -z-10" />
      </div>

      {/* ========================================================================= */}
      {/* BRAND TYPOGRAPHY & LETTERFORMS */}
      {/* ========================================================================= */}
      <div className="flex flex-col justify-center">
        {/* Main Wordmark: PYDA MOVERS */}
        <div className="flex items-start leading-none">
          <span
            className={`font-display font-black tracking-tight ${dimensions.text} leading-none select-none drop-shadow-md flex items-baseline`}
          >
            {/* PYDA: Razor-sharp architectural white or deep navy */}
            <span
              className={`${
                isLight ? 'text-slate-900' : 'text-white'
              } font-extrabold tracking-[-0.035em] drop-shadow-sm transition-colors`}
            >
              {brandName}
            </span>

            {/* MOVERS: Radiant Duchess Harvest Gold with Specular Sheen */}
            <span className="ml-1.5 sm:ml-2 bg-gradient-to-r from-amber-300 via-[#fed700] to-amber-500 bg-clip-text text-transparent font-black tracking-[-0.015em] drop-shadow-[0_2px_14px_rgba(251,191,36,0.35)]">
              {brandSuffix}
            </span>
          </span>

          {/* Registered Trademark Sign (Letter R inside circle signifying registered sign) */}
          {showRegisteredSign && (
            <span
              className="inline-flex items-center ml-1 sm:ml-1.5 -mt-0.5 sm:-mt-1 select-none shrink-0"
              title="Pyda Movers® Registered Trademark"
              aria-label="Registered Trademark Sign"
            >
              <img
                src={registeredSignImg}
                alt="Registered Trademark (®)"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.parentElement?.querySelector('.reg-trademark-fallback');
                  if (fallback) (fallback as HTMLElement).style.display = 'inline-flex';
                }}
                className={`${dimensions.rSign} rounded-full object-cover ring-1 ring-amber-400/50 shadow-[0_0_8px_rgba(245,158,11,0.4)] hover:scale-110 hover:ring-amber-300 transition-all duration-200`}
              />
              <span
                className="reg-trademark-fallback hidden items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 font-black text-[9px] w-3.5 h-3.5 ring-1 ring-amber-400 shadow-sm"
                style={{ display: 'none' }}
              >
                ®
              </span>
            </span>
          )}
        </div>

        {/* Subtitle Letters: Smart, Crisp, Precision-Spaced Logistics Credential */}
        {showTagline && (
          <div className="flex items-center gap-2 mt-1 sm:mt-1.5">
            <p
              className={`font-sans ${dimensions.subtext} font-extrabold ${dimensions.track} uppercase flex items-center gap-1.5 ${
                isLight ? 'text-slate-600' : 'text-slate-200'
              }`}
            >
              <span className="text-amber-400 font-black">✦</span>
              {taglineVariant === 'full' && (
                <span className="bg-gradient-to-r from-slate-200 via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  LOGISTICS & HAULAGE NIGERIA
                </span>
              )}
              {taglineVariant === 'compact' && (
                <span className="bg-gradient-to-r from-slate-200 via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  LOGISTICS & FREIGHT
                </span>
              )}
              {taglineVariant === 'minimal' && (
                <span>& LOGISTICS LTD</span>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
