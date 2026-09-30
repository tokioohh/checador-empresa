import {useEffect, useState} from 'react';

export function useQrToken(apiUrl: string) {
  const [qrToken, setQrToken] = useState<string>('');
  const [expiresInMs, setExpiresInMs] = useState<number>(30000);

  const fetchQr = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/tv/qr`);
      if (!res.ok) throw new Error('fetch qr failed');
      const data = await res.json();
      setQrToken(data.qrToken);
      setExpiresInMs(data.expiresInMs);
    } catch (e) {
      console.error('[QR] error', e);
    }
  };

  useEffect(() => {
    fetchQr();
    const interval = setInterval(fetchQr, 5000);
    return () => clearInterval(interval);
  }, [apiUrl]);

  return {qrToken, expiresInMs};
}
