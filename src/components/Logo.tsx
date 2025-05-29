
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
    sm: 'h-10',
    md: 'h-12',
    lg: 'h-14'
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
        src="/lovable-uploads/2cbf6bbd-e69f-4e17-a31f-5ca1847e1186.png" 
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
