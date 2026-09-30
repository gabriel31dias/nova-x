import React from 'react';

export const PixIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M5.283 18.36a3.505 3.505 0 0 0 2.493-1.032l3.6-3.6a.684.684 0 0 1 .946 0l3.613 3.613a3.504 3.504 0 0 0 2.493 1.032h.71l-4.56 4.56a3.647 3.647 0 0 1-5.156 0L4.85 18.36ZM18.428 5.627a3.505 3.505 0 0 0-2.493 1.032l-3.613 3.614a.67.67 0 0 1-.946 0l-3.6-3.6A3.505 3.505 0 0 0 5.283 5.64h-.434l4.573-4.572a3.646 3.646 0 0 1 5.156 0l4.559 4.559ZM1.068 9.422 3.79 6.699h1.492a2.483 2.483 0 0 1 1.744.722l3.6 3.6a1.73 1.73 0 0 0 2.443 0l3.614-3.613a2.482 2.482 0 0 1 1.744-.723h1.767l2.737 2.737a3.646 3.646 0 0 1 0 5.156l-2.736 2.736h-1.768a2.482 2.482 0 0 1-1.744-.722l-3.613-3.613a1.77 1.77 0 0 0-2.444 0l-3.6 3.6a2.483 2.483 0 0 1-1.744.722H3.791l-2.723-2.723a3.646 3.646 0 0 1 0-5.156" />
  </svg>
);

export const BoletoIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="2" y="4" width="2" height="16" rx="0.5" />
    <rect x="5" y="4" width="3" height="16" rx="0.5" />
    <rect x="9" y="4" width="1.5" height="16" rx="0.5" />
    <rect x="12" y="4" width="2.5" height="16" rx="0.5" />
    <rect x="16" y="4" width="1" height="16" rx="0.5" />
    <rect x="18.5" y="4" width="3.5" height="16" rx="0.5" />
  </svg>
);

export const CreditCardBadgeIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className} xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="5" width="20" height="14" rx="3" />
    <path d="M2 10h20M6 15h4" />
  </svg>
);

export const HandDrawnCrown: React.FC<{ className?: string; color?: string }> = ({
  className = 'w-8 h-8',
  color = '#00D15F',
}) => (
  <svg
    viewBox="0 0 60 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M5 32C18 31 35 30 55 31M6 31L12 12L25 24L34 6L45 22L53 10L55 31"
      stroke={color}
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const ItauLogo: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <div className={`rounded-lg bg-[#EC7000] flex items-center justify-center font-black text-white text-xs font-sans tracking-tight shadow-md select-none ${className}`}>
    <div className="flex items-center gap-0.5">
      <span className="text-white font-extrabold text-[11px] leading-none">Itaú</span>
    </div>
  </div>
);

export const BradescoLogo: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <div className={`rounded-lg bg-[#CC092F] flex items-center justify-center p-1 shadow-md select-none ${className}`}>
    <svg viewBox="0 0 24 24" fill="white" className="w-full h-full">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.5h-2v-5h2v5zm0-7h-2V7h2v2.5z" opacity="0" />
      <path d="M12 3C8 3 5 5.5 5 8.5c0 2 1.5 3.8 3.8 4.7L6 20h3l1.8-4.5h2.4L15 20h3l-2.8-6.8C17.5 12.3 19 10.5 19 8.5 19 5.5 16 3 12 3zm0 3.2c1.8 0 3 1 3 2.3s-1.2 2.3-3 2.3-3-1-3-2.3 1.2-2.3 3-2.3z" />
    </svg>
  </div>
);

export const SantanderLogo: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <div className={`rounded-lg bg-[#CC0000] flex items-center justify-center p-1 shadow-md select-none ${className}`}>
    <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
      <path d="M12 3c-1.5 2.5-3 5-3 7.5 0 2 1.2 3.5 3 3.5s3-1.5 3-3.5C15 8 13.5 5.5 12 3zm-4 7.5c-1 1.5-2 3.2-2 4.8 0 1.8 1.2 3.2 2.8 3.2 1.2 0 2.2-.8 2.6-2-1.8-.4-3-1.8-3.4-3.5v-2.5zm8 0c-.4 1.7-1.6 3.1-3.4 3.5.4 1.2 1.4 2 2.6 2 1.6 0 2.8-1.4 2.8-3.2 0-1.6-1-3.3-2-4.8v2.5z" />
    </svg>
  </div>
);

export const CaixaLogo: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <div className={`rounded-lg bg-[#005CA9] flex items-center justify-center text-white font-black text-[10px] tracking-wider shadow-md select-none ${className}`}>
    <span className="font-extrabold text-white tracking-tighter">CAIXA</span>
  </div>
);

export const BancoDoBrasilLogo: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <div className={`rounded-lg bg-[#0038A8] flex items-center justify-center font-black text-[#F9DD16] text-[10px] tracking-tighter shadow-md select-none ${className}`}>
    <span>BB</span>
  </div>
);

export const NubankLogo: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <div className={`rounded-lg bg-[#820AD1] flex items-center justify-center font-black text-white text-[11px] tracking-tighter shadow-md select-none ${className}`}>
    <span>Nu</span>
  </div>
);

