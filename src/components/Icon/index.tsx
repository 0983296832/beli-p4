// components/Icon.tsx
import React from 'react';

interface IconProps {
  icon?: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  size?: number;
  height?: number;
  width?: number;
  className?: string;
  onClick?: () => void;
}

const Icon = ({ icon: IconComponent, height, width, size = 24, className = '', onClick }: IconProps) => {
  if (!IconComponent) {
    return null;
  } else {
    return <IconComponent width={width || size} height={height || size} className={className} onClick={onClick} />;
  }
};

export default Icon;
