import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm text-muted mb-1">{label}</label>
      )}
      <input
        className={`w-full px-4 py-2.5 rounded-lg bg-card border border-muted/20 text-white placeholder-muted/50 focus:outline-none focus:border-accent transition ${className}`}
        {...props}
      />
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}
