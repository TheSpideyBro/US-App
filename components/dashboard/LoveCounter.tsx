'use client';

import { useCounter } from '@/hooks/useCounter';

interface LoveCounterProps {
  departureDate: string;
  herName: string;
}

export function LoveCounter({ departureDate, herName }: LoveCounterProps) {
  const counter = useCounter(new Date(departureDate));

  return (
    <div className="bg-card rounded-2xl p-8 text-center border border-muted/10">
      <p className="text-muted text-sm mb-2">
        {herName} has been gone for
      </p>
      <div className="grid grid-cols-4 gap-4 max-w-md mx-auto">
        <CounterBox value={counter.days} label="Days" />
        <CounterBox value={counter.hours} label="Hours" />
        <CounterBox value={counter.minutes} label="Minutes" />
        <CounterBox value={counter.seconds} label="Seconds" />
      </div>
    </div>
  );
}

function CounterBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="bg-background rounded-xl p-3">
      <span className="text-3xl font-bold text-accent">{value}</span>
      <p className="text-xs text-muted mt-1">{label}</p>
    </div>
  );
}
