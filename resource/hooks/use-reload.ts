'use client';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

export function useReload() {
  const [loading, setLoading] = useState(false);
  const [key, setKey] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const handleBeforeUnload = () => setLoading(true);
    const handleLoad = () => setLoading(false);

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('load', handleLoad);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('load', handleLoad);
    };
  }, []);

  const onReload = useCallback(() => {
    setKey(prev => prev + 1);
    router.refresh();
  }, [router.refresh]);

  const onReloadWindow = useCallback(<T = Element, E = MouseEvent>(e?: React.MouseEvent<T, E>) => {
    window.location.reload();
    e?.preventDefault();
  }, []);

  return { router, loading, setLoading, key, onReload, onReloadWindow };
}
