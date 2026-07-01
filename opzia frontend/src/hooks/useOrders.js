// src/hooks/useOrders.js
import { useState, useEffect, useCallback } from 'react';
import { orderService } from '@services/orderService';

export function useMyOrders() {
  const [orders, setOrders]       = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState(null);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await orderService.getMyOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load orders.');
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  return { orders, isLoading, error, refetch: fetchOrders };
}

export function useAdminOrders(params = {}) {
  const [orders, setOrders]       = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState(null);
  const paramsKey = JSON.stringify(params);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await orderService.getOrders(JSON.parse(paramsKey));
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load orders.');
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, [paramsKey]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  return { orders, isLoading, error, refetch: fetchOrders };
}

export function useOrder(id) {
  const [order, setOrder]         = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState(null);

  const fetchOrder = useCallback(async () => {
    if (!id) { setIsLoading(false); return; }
    setIsLoading(true);
    setError(null);
    try {
      const data = await orderService.getOrder(id);
      setOrder(data ?? null);
    } catch (err) {
      setError(err.message || 'Failed to load order.');
      setOrder(null);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchOrder(); }, [fetchOrder]);

  return { order, isLoading, error, refetch: fetchOrder };
}
