import React from 'react';

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  htmlFor?: string;
  className?: string;
}

export function FormField({ label, error, required, children, htmlFor, className = '' }: FormFieldProps) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="block text-xs font-bold text-[#132033] mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-[10px] text-red-600 mt-1 font-medium">{error}</p>}
    </div>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export function Input({ error, className = '', ...props }: InputProps) {
  return (
    <input
      className={`w-full px-3 py-2 rounded-[10px] border ${
        error ? 'border-red-300 focus:border-red-500' : 'border-[#D9E2EC] focus:border-[#FF7555]'
      } bg-white text-xs text-[#132033] placeholder:text-[#8FA0B2] focus:outline-none transition-colors ${className}`}
      {...props}
    />
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

export function Select({ error, className = '', children, ...props }: SelectProps) {
  return (
    <select
      className={`w-full px-3 py-2 rounded-[10px] border ${
        error ? 'border-red-300 focus:border-red-500' : 'border-[#D9E2EC] focus:border-[#FF7555]'
      } bg-white text-xs text-[#132033] focus:outline-none transition-colors ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export function Textarea({ error, className = '', ...props }: TextareaProps) {
  return (
    <textarea
      className={`w-full px-3 py-2 rounded-[10px] border ${
        error ? 'border-red-300 focus:border-red-500' : 'border-[#D9E2EC] focus:border-[#FF7555]'
      } bg-white text-xs text-[#132033] placeholder:text-[#8FA0B2] focus:outline-none transition-colors resize-none ${className}`}
      {...props}
    />
  );
}
