interface QuickStatsProps {
  entryCount: number;
  photoCount: number;
  voiceCount: number;
}

export function QuickStats({ entryCount, photoCount, voiceCount }: QuickStatsProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <StatCard value={entryCount} label="Entries" icon="📝" />
      <StatCard value={photoCount} label="Photos" icon="📷" />
      <StatCard value={voiceCount} label="Voice Notes" icon="🎤" />
    </div>
  );
}

function StatCard({ value, label, icon }: { value: number; label: string; icon: string }) {
  return (
    <div className="bg-card rounded-xl p-4 text-center border border-muted/10">
      <span className="text-2xl">{icon}</span>
      <p className="text-2xl font-bold mt-1">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}
