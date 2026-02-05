
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLSelectElement> {
  label?: string;
  error?: string;
  isSelect?: boolean;
  icon?: string;
}

const Input: React.FC<InputProps> = ({ label, error, isSelect, icon, className = '', ...props }) => {
  const baseFieldClass = `w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition-all outline-none text-slate-700 dark:text-slate-200 ${
    error ? 'border-red-500 bg-red-50 dark:bg-red-900/10' : ''
  } ${icon ? 'pl-10' : ''}`;

  return (
    <div className="space-y-1.5 w-full">
      {label && <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <i className={`fa-solid ${icon}`}></i>
          </div>
        )}
        {isSelect ? (
          <select className={`${baseFieldClass} ${className}`} {...(props as any)}>
            {props.children}
          </select>
        ) : (
          <input className={`${baseFieldClass} ${className}`} {...(props as any)} />
        )}
      </div>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
};

export default Input;
