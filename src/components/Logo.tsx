
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
        src="/lovable-uploads/a86d5539-0e0f-4f8c-9a9f-68f2c4b0e57c.png" 
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
