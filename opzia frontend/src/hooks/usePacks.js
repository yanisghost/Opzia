// src/hooks/usePacks.js
import { useState, useEffect, useCallback } from 'react';
import { packService } from '@services/packService';

export function usePacks(params = {}) {
  const [packs, setPacks]         = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState(null);
  const paramsKey = JSON.stringify(params);

  const fetchPacks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await packService.getPacks(JSON.parse(paramsKey));
      setPacks(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load packs.');
      setPacks([]);
    } finally {
      setIsLoading(false);
    }
  }, [paramsKey]);

  useEffect(() => { fetchPacks(); }, [fetchPacks]);

  return { packs, isLoading, error, refetch: fetchPacks };
}

export function usePack(id) {
  const [pack, setPack]           = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState(null);

  const fetchPack = useCallback(async () => {
    if (!id) { setIsLoading(false); return; }
    setIsLoading(true);
    setError(null);
    try {
      const data = await packService.getPack(id);
      setPack(data ?? null);
    } catch (err) {
      setError(err.message || 'Failed to load pack.');
      setPack(null);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchPack(); }, [fetchPack]);

  return { pack, isLoading, error, refetch: fetchPack };
}
