'use client';

import { useCounter } from '@/hooks/useCounter';

interface TogetherCounterProps {
  togetherSince: string;
}

export function TogetherCounter({ togetherSince }: TogetherCounterProps) {
  const counter = useCounter(new Date(togetherSince));

  return (
    <div className="bg-card rounded-2xl p-6 text-center border border-muted/10">
      <p className="text-muted text-sm mb-2">We have been together for</p>
      <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto">
        <CounterBox value={counter.days} label="Total Days" />
        <CounterBox value={Math.floor(counter.days / 365)} label="Years" />
        <CounterBox value={Math.floor(counter.days / 30)} label="Months" />
      </div>
    </div>
  );
}

function CounterBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="bg-background rounded-xl p-3">
      <span className="text-2xl font-bold text-accent">{value}</span>
      <p className="text-xs text-muted mt-1">{label}</p>
    </div>
  );
}
