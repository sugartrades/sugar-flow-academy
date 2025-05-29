
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function Logo({ className = '', size = 'md', showText = true }: LogoProps) {
  const navigate = useNavigate();
  
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-12'
  };

  const textSizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl'
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  return (
    <div 
      className={`flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity ${className}`}
      onClick={handleLogoClick}
    >
      <img 
        src="/lovable-uploads/3fdf9f5c-7897-4148-a211-2ef2e3a67ebc.png" 
        alt="SugarTrades.io"
        className={sizeClasses[size]}
      />
      {showText && (
        <span className={`font-bold text-primary ${textSizeClasses[size]}`}>
          SugarTrades.io
        </span>
      )}
    </div>
  );
}
