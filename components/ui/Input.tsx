import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm text-muted mb-1.5">{label}</label>
      )}
      <input
        className={`w-full px-4 py-3 rounded-xl bg-card border border-white/10 text-white placeholder-muted/40 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition ${className}`}
        {...props}
      />
      {error && <p className="text-red-400 text-xs mt-1.5">{error}</p>}
    </div>
  );
}
