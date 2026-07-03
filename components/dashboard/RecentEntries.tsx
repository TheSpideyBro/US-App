import Link from 'next/link';

interface Entry {
  id: string;
  day_number: number;
  text: string;
  mood: string;
  mood_emoji: string;
  created_at: string;
  user_id: string;
}

interface RecentEntriesProps {
  entries: Entry[];
}

export function RecentEntries({ entries }: RecentEntriesProps) {
  const recent = entries.slice(0, 3);

  if (recent.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted">No entries yet. Start writing!</p>
        <Link href="/entry/new" className="text-accent hover:underline">
          Write your first entry →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="font-semibold">Recent Entries</h3>
      {recent.map((entry) => (
        <div
          key={entry.id}
          className="bg-card rounded-xl p-4 border border-muted/10"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-muted">Day {entry.day_number}</span>
            <span>{entry.mood_emoji}</span>
            <span className="text-xs text-muted">
              {new Date(entry.created_at).toLocaleDateString()}
            </span>
          </div>
          <p className="text-sm text-muted line-clamp-2">{entry.text}</p>
        </div>
      ))}
      <Link href="/timeline" className="text-accent text-sm hover:underline">
        View all entries →
      </Link>
    </div>
  );
}
