import { Avatar } from '@/components/ui/Avatar';
import { Heart, Eye, Clock, Camera, Mic } from 'lucide-react';

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
  isOwnEntry?: boolean;
  hasBeenViewed?: boolean;
}

const moodColors: Record<string, string> = {
  sad: 'bg-mood-sad/20 text-mood-sad border-mood-sad/30',
  missing: 'bg-mood-missing/20 text-mood-missing border-mood-missing/30',
  loving: 'bg-mood-loving/20 text-mood-loving border-mood-loving/30',
  happy: 'bg-mood-happy/20 text-mood-happy border-mood-happy/30',
  'in-love': 'bg-mood-inLove/20 text-mood-inLove border-mood-inLove/30',
};

const moodBorderColors: Record<string, string> = {
  sad: 'border-l-mood-sad',
  missing: 'border-l-mood-missing',
  loving: 'border-l-mood-loving',
  happy: 'border-l-mood-happy',
  'in-love': 'border-l-mood-inLove',
};

export function EntryCard({ entry, displayName, isOwnEntry = false, hasBeenViewed = false }: EntryCardProps) {
  return (
    <div className={`bg-card rounded-2xl border border-white/5 overflow-hidden transition-all hover:border-white/10 ${moodBorderColors[entry.mood] || 'border-l-accent'} border-l-4`}>
      {/* Header */}
      <div className="flex items-center gap-3 p-5 pb-0">
        <Avatar name={displayName} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm">{displayName}</span>
            {isOwnEntry && (
              <span className="text-[10px] bg-accent/20 text-accent px-2 py-0.5 rounded-full">You</span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-muted flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Day {entry.day_number} · {new Date(entry.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${moodColors[entry.mood] || ''}`}>
            {entry.mood_emoji} {entry.mood}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <p className="text-white/90 leading-relaxed whitespace-pre-wrap">{entry.text}</p>

        {/* Media */}
        <div className="mt-4 space-y-3">
          {entry.photo_url && (
            <div>
              <img
                src={entry.photo_url}
                alt="Entry photo"
                className="rounded-xl object-cover max-h-96 w-full cursor-pointer hover:opacity-90 transition"
              />
            </div>
          )}

          {entry.voice_url && (
            <div className="bg-background/50 rounded-xl p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                <Mic className="w-5 h-5 text-accent" />
              </div>
              <audio controls src={entry.voice_url} className="flex-1 h-8" />
            </div>
          )}

          {/* Meta icons */}
          {(entry.photo_url || entry.voice_url) && (
            <div className="flex items-center gap-3 pt-2">
              {entry.photo_url && (
                <span className="text-xs text-muted flex items-center gap-1">
                  <Camera className="w-3 h-3" /> Photo
                </span>
              )}
              {entry.voice_url && (
                <span className="text-xs text-muted flex items-center gap-1">
                  <Mic className="w-3 h-3" /> Voice Note
                </span>
              )}
              {hasBeenViewed && (
                <span className="text-xs text-muted flex items-center gap-1">
                  <Eye className="w-3 h-3" /> Viewed
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
