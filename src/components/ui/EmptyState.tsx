import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-[#F4F8FA] flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-[#8FA0B2]" />
      </div>
      <h3 className="text-sm font-bold text-[#132033] mb-1">{title}</h3>
      {description && <p className="text-xs text-[#6F7D8D] mb-4 max-w-sm">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
