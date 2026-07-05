'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Camera, X, Send } from 'lucide-react';

export default function AlbumPage() {
  const [photos, setPhotos] = useState<{ id: string; url: string; photo_url: string; caption: string; user_id: string; created_at: string }[]>([]);
  const [caption, setCaption] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function loadPhotos() {
      const { data } = await supabase
        .from('shared_album')
        .select('*')
        .order('created_at', { ascending: false });
      setPhotos(data || []);
      setLoading(false);
    }
    loadPhotos();
  }, [supabase]);

  async function handleUpload() {
    if (!file) return;
    setUploading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `${user.id}/${Date.now()}-album-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from('photos')
      .upload(path, file);

    if (!uploadError) {
      const { data: urlData } = supabase.storage
        .from('photos')
        .getPublicUrl(path);

      await supabase.from('shared_album').insert({
        user_id: user.id,
        photo_url: urlData.publicUrl,
        caption: caption || 'Memory 💕',
      });

      setFile(null);
      setCaption('');
      setPreview(null);

      // Reload
      const { data } = await supabase
        .from('shared_album')
        .select('*')
        .order('created_at', { ascending: false });
      setPhotos(data || []);
    }

    setUploading(false);
  }

  if (loading) return <main className="p-8 text-center text-muted">Loading...</main>;

  return (
    <main className="p-4 sm:p-8">
      <h1 className="text-2xl font-bold mb-2">📸 Shared Album</h1>
      <p className="text-muted mb-8">Photos you and your partner have shared together.</p>

      {/* Upload Area */}
      <div className="bg-card rounded-2xl p-5 border border-white/10 mb-8">
        <h2 className="font-semibold mb-4">Add a Photo</h2>
        <div className="space-y-4">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const f = (e.target as HTMLInputElement).files?.[0];
              if (f) {
                setFile(f);
                setPreview(URL.createObjectURL(f));
              }
            }}
            className="hidden"
            id="album-upload"
          />
          <label htmlFor="album-upload" className="block cursor-pointer">
            {preview ? (
              <div className="relative group">
                <img src={preview} alt="Preview" className="w-full h-48 object-cover rounded-xl" />
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setPreview(null);
                    setFile(null);
                  }}
                  className="absolute top-2 right-2 bg-black/60 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            ) : (
              <div className="w-full h-32 border-2 border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center text-muted hover:border-accent/50 transition">
                <Camera className="w-8 h-8 mb-2" />
                <span className="text-sm">Click to choose a photo</span>
              </div>
            )}
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Add a caption..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-background border border-white/10 text-white placeholder-muted/40 focus:outline-none focus:border-accent transition text-sm"
            />
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="bg-accent hover:bg-accent-hover px-5 py-2.5 rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {uploading ? '...' : <Send className="w-4 h-4" />}
              Upload
            </button>
          </div>
        </div>
      </div>

      {/* Photo Grid */}
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
        {photos.map((photo) => (
          <div key={photo.id} className="break-inside-avoid">
            <div className="bg-card rounded-xl overflow-hidden border border-white/5 hover:border-white/10 transition">
              <img src={photo.photo_url} alt={photo.caption} className="w-full" loading="lazy" />
              <div className="p-3">
                <p className="text-sm text-muted">{photo.caption}</p>
                <p className="text-xs text-muted/60 mt-1">
                  {new Date(photo.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {photos.length === 0 && (
        <p className="text-center text-muted py-12">No photos yet. Start sharing memories!</p>
      )}
    </main>
  );
}
