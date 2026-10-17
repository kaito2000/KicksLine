import React from 'react';
import { SilhouetteType } from '../types';

interface SneakerVisualProps {
  imageDataUrl?: string;
  silhouette: SilhouetteType;
  primaryColor: string;
  accentColor: string;
  brand: string;
  model: string;
  className?: string;
}

export const SILHOUETTE_LABELS: Record<SilhouetteType, string> = {
  low: 'LOW-TOP (ローカット)',
  high: 'HIGH-TOP (ハイカット)',
  runner: 'RUNNER (ハイテク・ラン)',
  canvas: 'CANVAS (ローテク)',
  boots: 'BOOTS (ブーツ)',
  leather: 'LEATHER (革靴・短靴)',
  sandal: 'SANDAL (サンダル・クロッグ)',
};

export const SneakerVisual: React.FC<SneakerVisualProps> = ({
  imageDataUrl,
  silhouette,
  primaryColor,
  accentColor,
  brand,
  model,
  className = 'w-full h-44',
}) => {
  if (imageDataUrl) {
    return (
      <div
        className={`relative overflow-hidden bg-white border border-zinc-200 flex items-center justify-center p-3 ${className}`}
      >
        <img
          src={imageDataUrl}
          alt={`${brand} ${model}`}
          className="max-h-full max-w-full object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
        />
        <span className="absolute bottom-1.5 right-2 font-mono-code text-[10px] uppercase tracking-widest text-zinc-400">
          PHOTO ARCHIVE
        </span>
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden bg-zinc-50 border border-zinc-200 flex flex-col items-center justify-center p-4 ${className}`}
      style={{
        backgroundImage:
          'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.06) 1px, transparent 0)',
        backgroundSize: '14px 14px',
      }}
    >
      <SneakerSvg
        silhouette={silhouette}
        primaryColor={primaryColor}
        accentColor={accentColor}
      />
      <div className="mt-1 flex items-center gap-1.5">
        <span
          className="inline-block w-2.5 h-2.5 rounded-full border border-zinc-300"
          style={{ backgroundColor: primaryColor }}
        />
        <span
          className="inline-block w-2.5 h-2.5 rounded-full border border-zinc-300"
          style={{ backgroundColor: accentColor }}
        />
        <span className="font-mono-code text-[10px] uppercase tracking-widest text-zinc-400 ml-1">
          {silhouette.toUpperCase()} SILHOUETTE
        </span>
      </div>
    </div>
  );
};

export const SneakerSvg: React.FC<{
  silhouette: SilhouetteType;
  primaryColor: string;
  accentColor: string;
  className?: string;
}> = ({ silhouette, primaryColor, accentColor, className = 'w-44 h-24' }) => {
  if (silhouette === 'boots') {
    return (
      <svg viewBox="0 0 240 140" className={`${className} drop-shadow-sm`} fill="none">
        {/* Heel Pull Loop */}
        <path
          d="M36 18 C28 12 28 28 36 26"
          stroke={accentColor}
          strokeWidth="4"
          strokeLinecap="round"
        />
        {/* Boot Shaft & Upper */}
        <path
          d="M34 104 L38 18 H94 L106 66 L166 76 L206 82 C218 85 220 94 218 104 Z"
          fill={primaryColor}
          stroke="#18181B"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {/* Boot Heel Counter Stitch */}
        <path
          d="M34 72 Q68 74 82 104"
          stroke={accentColor}
          strokeWidth="2"
          strokeDasharray="4 3"
        />
        {/* Lug Outsole & Heel Block */}
        <path
          d="M28 104 H220 V118 H135 L130 112 H88 L84 122 H28 Z"
          fill="#18181B"
          stroke="#18181B"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* Welt Stitch Line (Dr. Martens / Work Boot Style) */}
        <line
          x1="30"
          y1="104"
          x2="218"
          y2="104"
          stroke={accentColor}
          strokeWidth="3.5"
          strokeDasharray="6 4"
        />
        {/* Eyelets / Laces */}
        <line x1="88" y1="28" x2="98" y2="28" stroke={accentColor} strokeWidth="3" strokeLinecap="round" />
        <line x1="90" y1="40" x2="100" y2="40" stroke={accentColor} strokeWidth="3" strokeLinecap="round" />
        <line x1="94" y1="52" x2="104" y2="52" stroke={accentColor} strokeWidth="3" strokeLinecap="round" />
        <line x1="98" y1="64" x2="108" y2="64" stroke={accentColor} strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }

  if (silhouette === 'leather') {
    return (
      <svg viewBox="0 0 240 140" className={`${className} drop-shadow-sm`} fill="none">
        {/* Dress / Derby Stacked Sole & Heel */}
        <path
          d="M24 104 H220 V114 H126 L122 110 H84 L80 120 H24 Z"
          fill="#27272A"
          stroke="#18181B"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* Goodyear Welt Stitch */}
        <line
          x1="26"
          y1="103"
          x2="218"
          y2="103"
          stroke={accentColor}
          strokeWidth="3"
          strokeDasharray="5 3"
        />
        {/* Leather Shoe Upper */}
        <path
          d="M28 102 L34 56 C36 50 44 52 56 62 C68 70 88 68 102 48 L114 44 L166 74 L208 80 C218 82 220 92 218 102 Z"
          fill={primaryColor}
          stroke="#18181B"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {/* Quarter / Vamp Seam & Brand Tag */}
        <path
          d="M96 102 C96 76 110 62 124 52"
          stroke="#18181B"
          strokeWidth="2.5"
        />
        <rect x="92" y="66" width="10" height="6" fill={accentColor} stroke="#18181B" strokeWidth="1.5" />
        {/* 3-Eye Laces */}
        <line x1="112" y1="50" x2="122" y2="45" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="122" y1="57" x2="132" y2="52" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="132" y1="64" x2="142" y2="59" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    );
  }

  if (silhouette === 'sandal') {
    return (
      <svg viewBox="0 0 240 140" className={`${className} drop-shadow-sm`} fill="none">
        {/* Cork / Moulded Footbed */}
        <path
          d="M22 100 C22 94 30 94 40 96 H210 C220 96 224 102 220 112 H26 C20 112 20 106 22 100 Z"
          fill={accentColor}
          stroke="#18181B"
          strokeWidth="3"
        />
        {/* Outsole Tread */}
        <path
          d="M24 112 H218 V120 H24 Z"
          fill="#18181B"
          stroke="#18181B"
          strokeWidth="2"
        />
        {/* Clog / Sandal Upper Dome */}
        <path
          d="M86 96 C88 64 112 52 142 56 L198 72 C214 76 220 86 216 96 Z"
          fill={primaryColor}
          stroke="#18181B"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {/* Buckle & Strap Detail */}
        <path
          d="M110 58 L124 96"
          stroke="#18181B"
          strokeWidth="10"
        />
        <rect
          x="106"
          y="66"
          width="18"
          height="14"
          rx="2"
          fill="#FAFAF9"
          stroke="#18181B"
          strokeWidth="2.5"
        />
      </svg>
    );
  }

  if (silhouette === 'high') {
    return (
      <svg viewBox="0 0 240 140" className={`${className} drop-shadow-sm`} fill="none">
        {/* Outsole */}
        <path
          d="M20 116 H220 C224 116 226 122 220 124 H20 C15 124 15 116 20 116 Z"
          fill={accentColor}
          stroke="#18181B"
          strokeWidth="3"
        />
        {/* Midsole */}
        <path
          d="M22 104 H218 C222 104 224 116 218 116 H22 C17 116 18 104 22 104 Z"
          fill="#FFFFFF"
          stroke="#18181B"
          strokeWidth="3"
        />
        {/* High-top Collar & Upper */}
        <path
          d="M28 104 L34 22 C35 18 40 16 46 18 L92 28 L108 58 L156 76 L204 82 C216 84 220 94 218 104 Z"
          fill={primaryColor}
          stroke="#18181B"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {/* Ankle collar overlay */}
        <path
          d="M32 38 L88 46 L94 60 L30 56 Z"
          fill={accentColor}
          stroke="#18181B"
          strokeWidth="2.5"
        />
        {/* Side Accent / Stripe */}
        <path
          d="M65 68 Q115 92 145 72 L135 62 Q110 78 65 56 Z"
          fill={accentColor}
          stroke="#18181B"
          strokeWidth="2.5"
        />
        {/* Laces */}
        <line x1="94" y1="36" x2="108" y2="32" stroke="#18181B" strokeWidth="3" strokeLinecap="round" />
        <line x1="100" y1="48" x2="114" y2="44" stroke="#18181B" strokeWidth="3" strokeLinecap="round" />
        <line x1="108" y1="60" x2="122" y2="55" stroke="#18181B" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }

  if (silhouette === 'runner') {
    return (
      <svg viewBox="0 0 240 140" className={`${className} drop-shadow-sm`} fill="none">
        {/* Chunky Runner Sole */}
        <path
          d="M16 108 L30 96 H216 L226 112 C226 118 220 122 212 122 H24 C16 122 14 114 16 108 Z"
          fill="#FFFFFF"
          stroke="#18181B"
          strokeWidth="3"
        />
        {/* Sole Accent Window */}
        <rect x="46" y="104" width="36" height="10" rx="5" fill={accentColor} stroke="#18181B" strokeWidth="2" />
        <rect x="145" y="106" width="44" height="8" rx="4" fill={accentColor} stroke="#18181B" strokeWidth="2" />
        {/* Runner Upper */}
        <path
          d="M30 96 L40 52 C42 46 50 48 58 56 C68 65 82 62 92 46 L104 38 L158 72 L206 80 C216 83 220 90 216 96 Z"
          fill={primaryColor}
          stroke="#18181B"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {/* Dynamic Runner Wave Overlay */}
        <path
          d="M44 82 C85 68 125 68 182 88 L196 96 H34 Z"
          fill={accentColor}
          stroke="#18181B"
          strokeWidth="2.5"
        />
        {/* Laces */}
        <line x1="106" y1="46" x2="118" y2="40" stroke="#18181B" strokeWidth="3" strokeLinecap="round" />
        <line x1="118" y1="54" x2="130" y2="48" stroke="#18181B" strokeWidth="3" strokeLinecap="round" />
        <line x1="130" y1="62" x2="142" y2="56" stroke="#18181B" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }

  if (silhouette === 'canvas') {
    return (
      <svg viewBox="0 0 240 140" className={`${className} drop-shadow-sm`} fill="none">
        {/* Vulcanized Flat Sole */}
        <rect
          x="20"
          y="102"
          width="200"
          height="18"
          rx="6"
          fill="#FFFFFF"
          stroke="#18181B"
          strokeWidth="3"
        />
        {/* Foxing Line */}
        <line x1="22" y1="109" x2="218" y2="109" stroke="#18181B" strokeWidth="2" />
        {/* Canvas Low Upper */}
        <path
          d="M26 102 L34 58 C36 52 44 54 54 62 C66 70 84 68 96 50 L108 44 L158 76 L204 82 C214 84 218 93 216 102 Z"
          fill={primaryColor}
          stroke="#18181B"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {/* Jazz Stripe / Side Wave */}
        <path
          d="M52 82 Q105 66 168 88"
          stroke={accentColor}
          strokeWidth="6"
          strokeLinecap="round"
        />
        {/* Toe Cap */}
        <path
          d="M188 80 C206 82 216 90 216 102 H180 C180 90 183 84 188 80 Z"
          fill={accentColor}
          stroke="#18181B"
          strokeWidth="2.5"
        />
      </svg>
    );
  }

  // Default: 'low' (Classic Court Low)
  return (
    <svg viewBox="0 0 240 140" className={`${className} drop-shadow-sm`} fill="none">
      {/* Cupsole */}
      <path
        d="M20 102 H218 C222 102 224 120 216 120 H22 C16 120 16 102 20 102 Z"
        fill="#FFFFFF"
        stroke="#18181B"
        strokeWidth="3"
      />
      <line x1="20" y1="114" x2="220" y2="114" stroke={accentColor} strokeWidth="4" />
      {/* Low Court Upper */}
      <path
        d="M24 102 L32 52 C34 46 42 46 52 56 C64 66 84 64 96 44 L110 38 L158 72 L206 78 C216 80 220 90 218 102 Z"
        fill={primaryColor}
        stroke="#18181B"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* Court Side Check / Panel */}
      <path
        d="M56 74 Q108 96 146 72 L134 62 Q104 82 56 62 Z"
        fill={accentColor}
        stroke="#18181B"
        strokeWidth="2.5"
      />
      {/* Heel Tab */}
      <path
        d="M32 52 L48 54 L44 68 L29 66 Z"
        fill={accentColor}
        stroke="#18181B"
        strokeWidth="2.5"
      />
      {/* Laces */}
      <line x1="108" y1="46" x2="120" y2="40" stroke="#18181B" strokeWidth="3" strokeLinecap="round" />
      <line x1="120" y1="55" x2="132" y2="49" stroke="#18181B" strokeWidth="3" strokeLinecap="round" />
      <line x1="132" y1="64" x2="144" y2="58" stroke="#18181B" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
};
