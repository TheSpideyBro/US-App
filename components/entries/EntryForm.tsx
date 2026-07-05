'use client';

import { useState, useRef, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Camera, Mic, X, Play, Trash2 } from 'lucide-react';

const MOODS = [
  { value: 'sad', emoji: '😢', label: 'Sad', color: 'bg-mood-sad/20 border-mood-sad/40 text-mood-sad' },
  { value: 'missing', emoji: '😔', label: 'Missing', color: 'bg-mood-missing/20 border-mood-missing/40 text-mood-missing' },
  { value: 'loving', emoji: '❤️', label: 'Loving', color: 'bg-mood-loving/20 border-mood-loving/40 text-mood-loving' },
  { value: 'happy', emoji: '😊', label: 'Happy', color: 'bg-mood-happy/20 border-mood-happy/40 text-mood-happy' },
  { value: 'in-love', emoji: '😍', label: 'In Love', color: 'bg-mood-inLove/20 border-mood-inLove/40 text-mood-inLove' },
];

interface EntryFormProps {
  dayNumber: number;
  onSuccess: () => void;
  herName?: string;
}

export function EntryForm({ dayNumber, onSuccess, herName = 'her' }: EntryFormProps) {
  const supabase = createClient();
  const [text, setText] = useState('');
  const [mood, setMood] = useState(MOODS[0].value);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [voiceFile, setVoiceFile] = useState<Blob | null>(null);
  const [voiceUrl, setVoiceUrl] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [charCount, setCharCount] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const moodData = MOODS.find((m) => m.value === mood) || MOODS[0];
  const moodEmoji = moodData.emoji;

  // Cleanup object URLs
  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
      if (voiceUrl) URL.revokeObjectURL(voiceUrl);
    };
  }, [photoPreview, voiceUrl]);

  function updateCharCount() {
    setCharCount(text.length);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg('');

    if (!text.trim()) {
      setErrorMsg('Please write something before saving.');
      return;
    }

    setLoading(true);

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      setErrorMsg('Not authenticated. Please log in again.');
      setLoading(false);
      return;
    }

    let photoUrl: string | undefined;
    let voiceUrlResult: string | undefined;

    try {
      // Upload photo if present
      if (photoFile) {
        const safeName = photoFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const uploadPath = `${user.id}/${Date.now()}-${safeName}`;
        const { error: uploadError } = await supabase.storage
          .from('photos')
          .upload(uploadPath, photoFile);
        if (uploadError) {
          console.error('Photo upload error:', uploadError);
          setErrorMsg('Failed to upload photo: ' + uploadError.message);
          setLoading(false);
          return;
        }
        const { data: photoData } = supabase.storage
          .from('photos')
          .getPublicUrl(uploadPath);
        photoUrl = photoData?.publicUrl;
      }

      // Upload voice if present
      if (voiceFile) {
        const uploadPath = `${user.id}/${Date.now()}-voice.webm`;
        const { error: uploadError } = await supabase.storage
          .from('voice-notes')
          .upload(uploadPath, voiceFile);
        if (uploadError) {
          console.error('Voice upload error:', uploadError);
          setErrorMsg('Failed to upload voice note: ' + uploadError.message);
          setLoading(false);
          return;
        }
        const { data: voiceData } = supabase.storage
          .from('voice-notes')
          .getPublicUrl(uploadPath);
        voiceUrlResult = voiceData?.publicUrl;
      }

      // Insert entry
      const { error: insertError } = await supabase.from('entries').insert({
        user_id: user.id,
        day_number: dayNumber,
        text: text.trim(),
        mood,
        mood_emoji: moodEmoji,
        photo_url: photoUrl || null,
        voice_url: voiceUrlResult || null,
      });

      if (insertError) {
        console.error('Insert error:', insertError);
        setErrorMsg('Failed to save entry: ' + insertError.message);
        setLoading(false);
        return;
      }

      // Success — reset and redirect
      setText('');
      setPhotoFile(null);
      setPhotoPreview(null);
      setVoiceFile(null);
      setVoiceUrl(null);
      setLoading(false);
      onSuccess();

    } catch (err: any) {
      console.error('Unexpected error:', err);
      setErrorMsg('Something went wrong: ' + (err.message || 'Unknown error'));
      setLoading(false);
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
        setVoiceUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setRecording(true);
    }).catch((err) => {
      console.error('Microphone error:', err);
      alert('Could not access microphone. Please allow mic permission.');
    });
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  }

  function removePhoto() {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoFile(null);
    setPhotoPreview(null);
  }

  function removeVoice() {
    if (voiceUrl) URL.revokeObjectURL(voiceUrl);
    setVoiceFile(null);
    setVoiceUrl(null);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-4 sm:p-6">
      {/* Error Message */}
      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
          {errorMsg}
          <button type="button" onClick={() => setErrorMsg('')} className="float-right text-red-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Day & Time */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-accent font-semibold text-lg">Day {dayNumber}</p>
          <p className="text-muted text-sm">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <p className="text-muted text-sm">
          {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>

      {/* Text Area */}
      <div>
        <textarea
          value={text}
          onChange={(e) => { setText(e.target.value); updateCharCount(); }}
          placeholder={`Dear ${herName}, today I missed you because...`}
          rows={6}
          className="w-full px-4 py-3 rounded-xl bg-card border border-white/10 text-white placeholder-muted/40 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition resize-none"
          required
        />
        <div className="flex justify-between mt-1.5">
          <p className="text-xs text-muted">Write how you feel today</p>
          <p className={`text-xs ${charCount > 1000 ? 'text-red-400' : 'text-muted'}`}>
            {charCount}/1000
          </p>
        </div>
      </div>

      {/* Mood Selector */}
      <div>
        <p className="text-sm text-muted mb-3">How are you feeling?</p>
        <div className="flex flex-wrap gap-2">
          {MOODS.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => setMood(m.value)}
              className={`px-4 py-2.5 rounded-xl border transition-all ${
                mood === m.value
                  ? `${m.color} scale-105 shadow-lg`
                  : 'border-white/10 text-muted hover:border-white/30 hover:text-white'
              }`}
            >
              <span className="text-lg">{m.emoji}</span>
              <span className="text-xs ml-1.5 block">{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Photo Upload */}
      <div>
        <p className="text-sm text-muted mb-3">Add a Photo</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
              setPhotoFile(file);
              setPhotoPreview(URL.createObjectURL(file));
            }
          }}
          className="hidden"
        />
        {photoPreview ? (
          <div className="relative group">
            <img
              src={photoPreview}
              alt="Preview"
              className="w-full h-48 object-cover rounded-xl border border-white/10"
            />
            <button
              type="button"
              onClick={removePhoto}
              className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full px-4 py-3 rounded-xl border border-dashed border-white/20 hover:border-accent/50 text-muted hover:text-accent transition-all flex items-center justify-center gap-2"
          >
            <Camera className="w-5 h-5" />
            <span className="text-sm">Choose a photo</span>
          </button>
        )}
      </div>

      {/* Voice Note */}
      <div>
        <p className="text-sm text-muted mb-3">Record a Voice Note</p>
        {!voiceFile ? (
          <button
            type="button"
            onClick={recording ? stopRecording : startRecording}
            className={`w-full px-4 py-3 rounded-xl border transition-all flex items-center justify-center gap-2 ${
              recording
                ? 'border-red-400/50 bg-red-400/10 text-red-400 animate-pulse-soft'
                : 'border-white/10 text-muted hover:border-accent/50 hover:text-accent'
            }`}
          >
            <Mic className="w-5 h-5" />
            <span className="text-sm">{recording ? 'Stop Recording' : 'Record a voice note'}</span>
            {recording && <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />}
          </button>
        ) : (
          <div className="bg-card rounded-xl p-3 border border-white/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
              <Play className="w-4 h-4 text-accent" />
            </div>
            <audio src={voiceUrl || undefined} controls className="flex-1 h-8" />
            <button
              type="button"
              onClick={removeVoice}
              className="text-muted hover:text-red-400 transition p-1"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Submit */}
      <Button
        type="submit"
        disabled={loading || !text.trim()}
        className="w-full"
        size="lg"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Saving...
          </span>
        ) : (
          '💕 Save Entry'
        )}
      </Button>
    </form>
  );
}
