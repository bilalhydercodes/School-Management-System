import React from 'react';
import { LucideIcon } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: LucideIcon;
  loading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  loading = false,
  fullWidth = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-bold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-[#FF7555] text-white hover:bg-[#ff623e] shadow-xs',
    secondary: 'bg-[#FFF2EE] text-[#FF7555] hover:bg-[#FF7555] hover:text-white',
    outline: 'border-2 border-[#FF7555] text-[#FF7555] hover:bg-[#FF7555] hover:text-white',
    ghost: 'text-[#132033] hover:bg-[#F4F8FA]',
    danger: 'bg-red-500 text-white hover:bg-red-600 shadow-xs',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-[11px] rounded-[8px]',
    md: 'px-4 py-2 text-xs rounded-[10px]',
    lg: 'px-5 py-2.5 text-sm rounded-[12px]',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        Icon && <Icon className="w-3.5 h-3.5" />
      )}
      {children}
    </button>
  );
}
