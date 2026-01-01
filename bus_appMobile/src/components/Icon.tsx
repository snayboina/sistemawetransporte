import React from 'react';

interface IconProps {
  name: string;
  className?: string;
  filled?: boolean;
  size?: number;
}

export const Icon: React.FC<IconProps> = ({ 
  name, 
  className = '', 
  filled = false,
  size = 24 
}) => {
  return (
    <span 
      className={`material-symbols-outlined ${className}`}
      style={{ 
        fontSize: size,
        fontVariationSettings: filled ? "'FILL' 1" : "'FILL' 0"
      }}
    >
      {name}
    </span>
  );
};
