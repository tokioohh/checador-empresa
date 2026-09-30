import { useEffect, useState } from "react";

export type MediaItem = {
  id: string;
  tipo: "IMAGEN" | "VIDEO";
  archivoUrl: string;
  duracionSegundos: number | null;
  orden: number;
};

export function useMedia(apiUrl: string) {
  const [media, setMedia] = useState<MediaItem[]>([]);

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/tv/media`);
        if (!res.ok) throw new Error("fetch media failed");
        const data = await res.json();
        setMedia(data.media ?? []);
      } catch (e) {
        console.error("[Media] error", e);
      }
    };

    fetchMedia();
    const interval = setInterval(fetchMedia, 30000);
    return () => clearInterval(interval);
  }, [apiUrl]);

  return media;
}
