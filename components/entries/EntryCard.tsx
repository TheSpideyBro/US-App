interface EntryCardProps {
  entry: {
    id: string;
    day_number: number;
    text: string;
    mood: string;
    mood_emoji: string;
    photo_url: string | null;
    voice_url: string | null;
    created_at: string;
    user_id: string;
  };
  displayName: string;
}

const moodColors: Record<string, string> = {
  sad: 'bg-mood-sad/20 text-mood-sad',
  missing: 'bg-mood-missing/20 text-mood-missing',
  loving: 'bg-mood-loving/20 text-mood-loving',
  happy: 'bg-mood-happy/20 text-mood-happy',
  'in-love': 'bg-mood-inLove/20 text-mood-inLove',
};

export function EntryCard({ entry, displayName }: EntryCardProps) {
  return (
    <div className="bg-card rounded-2xl p-5 border border-muted/10">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-xs font-semibold text-accent bg-accent/10 px-2 py-1 rounded-full">
          Day {entry.day_number}
        </span>
        <span className={`px-2 py-1 rounded-full text-xs ${moodColors[entry.mood] || ''}`}>
          {entry.mood_emoji} {entry.mood}
        </span>
        <span className="text-xs text-muted ml-auto">
          {new Date(entry.created_at).toLocaleString()}
        </span>
      </div>

      <p className="text-sm text-muted mb-1">by {displayName}</p>

      <p className="text-white leading-relaxed">{entry.text}</p>

      {entry.photo_url && (
        <div className="mt-3">
          <img
            src={entry.photo_url}
            alt="Entry photo"
            className="rounded-xl object-cover max-h-80 w-full"
          />
        </div>
      )}

      {entry.voice_url && (
        <audio controls src={entry.voice_url} className="mt-3 w-full" />
      )}
    </div>
  );
}
