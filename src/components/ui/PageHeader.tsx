import React from 'react';
import { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({ icon: Icon, title, description, action, className = '' }: PageHeaderProps) {
  return (
    <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${className}`}>
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="w-12 h-12 rounded-[16px] bg-[#FFF2EE] border border-[#FFD5C8] flex items-center justify-center shrink-0">
            <Icon className="w-6 h-6 text-[#FF7555]" />
          </div>
        )}
        <div>
          <h1 className="text-xl font-extrabold text-[#132033] leading-tight">{title}</h1>
          {description && <p className="text-xs text-[#6F7D8D] mt-0.5">{description}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
