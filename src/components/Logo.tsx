import React, { useState, useEffect } from 'react';
import { StorageService } from '../utils/storage';

interface LogoProps {
  variant?: 'full' | 'compact' | 'icon';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'full',
  size = 'md',
  className = '',
  showText = true,
}) => {
  const [customLogoUrl, setCustomLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    const updateLogo = () => {
      setCustomLogoUrl(StorageService.getCustomLogo());
    };

    updateLogo();
    window.addEventListener('yasfi_logo_updated', updateLogo);
    return () => window.removeEventListener('yasfi_logo_updated', updateLogo);
  }, []);

  // Size mappings
  const dimensions = {
    sm: { iconSize: 42, textSize: 'text-xs', titleSize: 'text-sm' },
    md: { iconSize: 60, textSize: 'text-sm', titleSize: 'text-base' },
    lg: { iconSize: 84, textSize: 'text-base', titleSize: 'text-lg' },
    xl: { iconSize: 120, textSize: 'text-lg', titleSize: 'text-xl' },
  }[size];

  const iconDim = dimensions.iconSize;

  // Render Emblem: Custom uploaded image or high-fidelity vector seal emblem
  const Emblem = customLogoUrl ? (
    <div
      style={{ width: iconDim, height: iconDim }}
      className="shrink-0 rounded-full overflow-hidden border-2 border-slate-900 bg-white shadow-sm flex items-center justify-center p-0.5 select-none"
    >
      <img
        src={customLogoUrl}
        alt="Logo Ponpes Tahfidz Yasfi"
        className="w-full h-full object-contain rounded-full"
      />
    </div>
  ) : (
    <svg
      width={iconDim}
      height={iconDim}
      viewBox="0 0 500 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 drop-shadow-sm select-none"
    >
      {/* Outer Thick Seal Boundary Circle */}
      <circle cx="250" cy="250" r="236" stroke="#000000" strokeWidth="18" fill="#FFFFFF" />
      
      {/* Inner Concentric Circle */}
      <circle cx="250" cy="250" r="218" stroke="#000000" strokeWidth="4" fill="none" />

      {/* Horizontal Divider Line Band Structure */}
      {/* Curved Banner Outline for PONPES TAHFIDZ YASFI BEKASI */}
      <path
        d="M 32 250 H 115 A 135 135 0 0 0 385 250 H 468"
        stroke="#000000"
        strokeWidth="6"
        fill="none"
      />
      <path
        d="M 32 250 C 32 385, 120 462, 250 462 C 380 462, 468 385, 468 250"
        stroke="#000000"
        strokeWidth="6"
        fill="none"
      />

      {/* Bottom Text Arc Path */}
      <path
        id="bottomYasfiPath"
        d="M 68 275 A 190 190 0 0 0 432 275"
        fill="none"
        stroke="none"
      />
      <text fill="#000000" fontSize="35" fontWeight="900" fontFamily="Impact, Arial Black, sans-serif" letterSpacing="2.5">
        <textPath href="#bottomYasfiPath" startOffset="50%" textAnchor="middle">
          PONPES TAHFIDZ YASFI BEKASI
        </textPath>
      </text>

      {/* Top Arabic Calligraphy Arc */}
      <path
        id="topArabicPath"
        d="M 75 220 A 185 185 0 0 1 425 220"
        fill="none"
        stroke="none"
      />
      <text fill="#000000" fontSize="38" fontWeight="bold" fontFamily="'Traditional Arabic', 'Amiri', 'Scheherazade New', serif">
        <textPath href="#topArabicPath" startOffset="50%" textAnchor="middle">
          مَعْهَدُ سَعَادَةِ الْفِرْدَوْسِ الإِسْلَامِي
        </textPath>
      </text>

      {/* Five-pointed Stars on Left and Right Junctions */}
      {/* Left Star */}
      <polygon
        points="70,215 75,200 87,200 78,208 81,222 70,213 59,222 62,208 53,200 65,200"
        fill="#000000"
      />
      {/* Right Star */}
      <polygon
        points="430,215 435,200 447,200 438,208 441,222 430,213 419,222 422,208 413,200 425,200"
        fill="#000000"
      />

      {/* Center Motif */}
      {/* 1. Green Dome Outline Arch */}
      <path
        d="M 155 230 C 155 125, 250 100, 250 100 C 250 100, 345 125, 345 230 C 345 235, 335 235, 335 230 C 335 138, 250 115, 250 115 C 250 115, 165 138, 165 230 C 165 235, 155 235, 155 230 Z"
        fill="#0D7A3E"
      />

      {/* 2. Torch / Candle inside Dome */}
      {/* Flame */}
      <path
        d="M 250 150 C 242 165, 240 178, 250 188 C 260 178, 258 165, 250 150 Z"
        fill="#FFB800"
      />
      <path
        d="M 250 156 C 245 167, 244 175, 250 183 C 256 175, 255 167, 250 156 Z"
        fill="#FFF380"
      />
      {/* Torch Body */}
      <path
        d="M 241 188 C 241 188, 237 205, 237 232 C 237 235, 263 235, 263 232 C 263 205, 259 188, 259 188 Z"
        fill="#0B2053"
      />

      {/* 3. Open Golden Quran Book */}
      {/* Green Base Foundation */}
      <path
        d="M 160 300 Q 250 365 340 300 L 330 325 Q 250 385 170 325 Z"
        fill="#0D7A3E"
      />
      
      {/* Golden Book Spine & Pages */}
      <path
        d="M 250 245 L 175 225 C 168 223, 160 228, 160 236 L 163 300 C 163 305, 170 310, 178 313 L 250 332 Z"
        fill="#E59C00"
        stroke="#0D7A3E"
        strokeWidth="4"
      />
      <path
        d="M 250 245 L 325 225 C 332 223, 340 228, 340 236 L 337 300 C 337 305, 330 310, 322 313 L 250 332 Z"
        fill="#E59C00"
        stroke="#0D7A3E"
        strokeWidth="4"
      />
      {/* Inner Yellow Book Page Highlighting */}
      <path
        d="M 180 238 L 243 252 L 243 318 L 182 302 Z"
        fill="#F6B819"
      />
      <path
        d="M 320 238 L 257 252 L 257 318 L 318 302 Z"
        fill="#F6B819"
      />
      {/* Center Spine Line */}
      <path
        d="M 250 245 L 250 332"
        stroke="#0D7A3E"
        strokeWidth="4"
      />
    </svg>
  );

  if (variant === 'icon') {
    return <div className={`inline-flex items-center justify-center ${className}`}>{Emblem}</div>;
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        {Emblem}
        {showText && (
          <div className="flex flex-col">
            <span className="text-[10px] font-extrabold text-amber-600 uppercase tracking-wider">
              PONPES TAHFIDZ YASFI BEKASI
            </span>
            <span className={`font-bold text-slate-900 leading-tight ${dimensions.titleSize}`}>
              Absensi Guru & Musyrif
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              Sukamaju - Tambelang - Bekasi
            </span>
          </div>
        )}
      </div>
    );
  }

  // Variant "full"
  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
      {Emblem}
      {showText && (
        <div className="mt-3 flex flex-col items-center">
          <div className="text-emerald-900 font-serif text-lg md:text-xl font-bold tracking-wide">
            مَعْهَدُ سَعَادَةِ الْفِرْدَوْسِ الإِسْلَامِي
          </div>
          
          <h1 className="mt-1 text-emerald-950 font-black tracking-tight text-base md:text-xl uppercase">
            PONDOK PESANTREN TAHFIDZ YASFI BEKASI
          </h1>

          <p className="mt-0.5 text-xs md:text-sm font-bold text-emerald-800 tracking-widest uppercase">
            SUKAMAJU - TAMBELANG - BEKASI - JAWA BARAT
          </p>
        </div>
      )}
    </div>
  );
};


