'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function GalleryPage() {
  const [photos, setPhotos] = useState<{ url: string; caption: string }[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  function isSafeUrl(url: string): boolean {
    return url.startsWith('https://') || url.startsWith('http://');
  }

  useEffect(() => {
    async function loadPhotos() {
      const { data } = await supabase
        .from('entries')
        .select('photo_url, text, created_at')
        .not('photo_url', 'is', null);

      const mapped = (data || [])
        .filter((e: any) => isSafeUrl(e.photo_url))
        .map((e: any) => ({
          url: e.photo_url,
          caption: e.text.substring(0, 60) + '...',
        }));
      setPhotos(mapped);
      setLoading(false);
    }

    loadPhotos();
  }, [supabase]);

  if (loading) {
    return <main className="p-8 text-center text-muted">Loading...</main>;
  }

  return (
    <main className="p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-6">Photo Gallery</h1>

      {selected ? (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <img
            src={selected}
            alt="Full size"
            className="max-w-full max-h-[90vh] rounded-xl"
          />
        </div>
      ) : null}

      <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
        {photos.map((photo, i) => (
          <div
            key={i}
            className="break-inside-avoid cursor-pointer"
            onClick={() => setSelected(photo.url)}
          >
            <img
              src={photo.url}
              alt={photo.caption}
              className="rounded-xl w-full hover:opacity-90 transition"
            />
          </div>
        ))}
      </div>

      {photos.length === 0 && (
        <p className="text-center text-muted py-12">No photos yet.</p>
      )}
    </main>
  );
}
