'use client';

import { useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

const MOODS = [
  { value: 'sad', emoji: '😢', label: 'Sad' },
  { value: 'missing', emoji: '😔', label: 'Missing' },
  { value: 'loving', emoji: '❤️', label: 'Loving' },
  { value: 'happy', emoji: '😊', label: 'Happy' },
  { value: 'in-love', emoji: '😍', label: 'In Love' },
];

interface EntryFormProps {
  dayNumber: number;
  onSuccess: () => void;
}

export function EntryForm({ dayNumber, onSuccess }: EntryFormProps) {
  const supabase = createClient();
  const [text, setText] = useState('');
  const [mood, setMood] = useState(MOODS[0].value);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [voiceFile, setVoiceFile] = useState<Blob | null>(null);
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const moodEmoji = MOODS.find((m) => m.value === mood)?.emoji || '';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // Upload photo if present
    let photoUrl: string | undefined;
    if (photoFile) {
      // Sanitize filename to prevent path traversal
      const safeName = photoFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const uploadPath = `${user.id}/${Date.now()}-${safeName}`;
      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(uploadPath, photoFile);
      if (!uploadError) {
        const { data: photoData } = supabase.storage
          .from('photos')
          .getPublicUrl(uploadPath);
        photoUrl = photoData.publicUrl;
      }
    }

    // Upload voice if present
    let voiceUrl: string | undefined;
    if (voiceFile) {
      const { error: uploadError } = await supabase.storage
        .from('voice-notes')
        .upload(`${user.id}/${Date.now()}-voice.mp3`, voiceFile);
      if (!uploadError) {
        const { data: voiceData } = supabase.storage
          .from('voice-notes')
          .getPublicUrl(`${user.id}/${Date.now()}-voice.mp3`);
        voiceUrl = voiceData.publicUrl;
      }
    }

    // Insert entry
    const { error } = await supabase.from('entries').insert({
      user_id: user.id,
      day_number: dayNumber,
      text: text.trim(),
      mood,
      mood_emoji: moodEmoji,
      photo_url: photoUrl || null,
      voice_url: voiceUrl || null,
    });

    setLoading(false);
    if (!error) {
      setText('');
      setPhotoFile(null);
      setVoiceFile(null);
      onSuccess();
    }
  }

  function startRecording() {
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setVoiceFile(blob);
      };

      mediaRecorder.start();
      setRecording(true);
    });
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-4">
      <div>
        <p className="text-muted text-sm mb-1">Day {dayNumber}</p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="How are you feeling today?"
          rows={6}
          className="w-full px-4 py-3 rounded-xl bg-card border border-muted/20 text-white placeholder-muted/50 focus:outline-none focus:border-accent resize-none"
          required
        />
      </div>

      <div>
        <p className="text-sm text-muted mb-2">Mood</p>
        <div className="flex gap-3">
          {MOODS.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => setMood(m.value)}
              className={`px-4 py-2 rounded-lg border transition ${
                mood === m.value
                  ? 'border-accent bg-accent/20'
                  : 'border-muted/20 hover:border-muted/50'
              }`}
            >
              <span className="text-xl">{m.emoji}</span>
              <span className="text-xs block text-muted">{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm text-muted mb-2">Photo</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => setPhotoFile((e.target as HTMLInputElement).files?.[0] || null)}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 rounded-lg border border-muted/20 hover:border-accent transition text-sm"
        >
          {photoFile ? `📷 ${photoFile.name}` : '📷 Choose Photo'}
        </button>
      </div>

      <div>
        <p className="text-sm text-muted mb-2">Voice Note</p>
        <button
          type="button"
          onClick={recording ? stopRecording : startRecording}
          className={`px-4 py-2 rounded-lg border transition text-sm ${
            recording
              ? 'border-red-400 bg-red-400/20 text-red-400'
              : 'border-muted/20 hover:border-accent'
          }`}
        >
          {recording ? '⏹ Stop Recording' : '🎤 Record Voice'}
        </button>
        {voiceFile && !recording && (
          <span className="text-xs text-muted ml-2">✓ Recorded</span>
        )}
      </div>

      <button
        type="submit"
        disabled={loading || !text.trim()}
        className="w-full bg-accent py-3 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50"
      >
        {loading ? 'Saving...' : '💕 Save Entry'}
      </button>
    </form>
  );
}
