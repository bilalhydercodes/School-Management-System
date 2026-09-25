import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricTileProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  accentColor?: 'yellow' | 'peach' | 'cyan';
  className?: string;
}

export function MetricTile({ icon: Icon, value, label, accentColor = 'cyan', className = '' }: MetricTileProps) {
  const accentPaths = {
    cyan: 'M50 0H12C12 18 22 28 50 28V0Z',
    yellow: 'M50 0H15C15 16 24 25 50 25V0Z',
    peach: 'M50 0H16C16 16 26 26 50 26V0Z',
  };

  const accentColors = {
    cyan: { fill: '#35C1E8', opacity: '0.85' },
    yellow: { fill: '#FDCB6E', opacity: '0.45' },
    peach: { fill: '#FFA07A', opacity: '0.4' },
  };

  return (
    <div className={`relative overflow-hidden bg-[#FF7555] text-white rounded-[22px] p-5 flex flex-col justify-between shadow-[0_4px_16px_rgba(255,117,85,0.22)] min-h-[128px] ${className}`}>
      <svg className="absolute top-0 right-0 w-14 h-14 pointer-events-none" viewBox="0 0 50 50" fill="none">
        <path d={accentPaths[accentColor]} fill={accentColors[accentColor].fill} fillOpacity={accentColors[accentColor].opacity} />
      </svg>
      <Icon className="w-5 h-5 text-white/95" />
      <div>
        <span className="text-3xl font-black block leading-none tracking-tight">{value}</span>
        <span className="text-xs font-semibold text-white/95 mt-1.5 block">{label}</span>
      </div>
    </div>
  );
}
