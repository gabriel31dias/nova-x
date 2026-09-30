import React from 'react';

interface LogoProps {
  variant?: 'dark' | 'light'; // dark = on a dark background (white "alen")
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const HEIGHT = { sm: 'h-6', md: 'h-8', lg: 'h-10', xl: 'h-14' };

export const Logo: React.FC<LogoProps> = ({ variant = 'dark', size = 'md' }) => (
  <img
    src={variant === 'dark' ? '/images/logo-white.png' : '/images/logo.png'}
    alt="Valen Finance"
    className={`${HEIGHT[size]} w-auto select-none`}
    draggable={false}
  />
);
