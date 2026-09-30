import {useEffect, useState} from 'react';
import {Aviso} from '../types';

export function useAvisos(apiUrl: string) {
  const [avisos, setAvisos] = useState<Aviso[]>([]);

  useEffect(() => {
    const fetchAvisos = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/tv/avisos`);
        if (!res.ok) throw new Error('fetch avisos failed');
        const data = await res.json();
        setAvisos(data.avisos ?? []);
      } catch (e) {
        console.error('[Avisos] error', e);
      }
    };

    fetchAvisos();
    const interval = setInterval(fetchAvisos, 30000);
    return () => clearInterval(interval);
  }, [apiUrl]);

  return avisos;
}
