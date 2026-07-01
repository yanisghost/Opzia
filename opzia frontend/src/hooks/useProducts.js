// src/hooks/useProducts.js
import { useState, useEffect, useCallback } from 'react';
import { productService } from '@services/productService';

export function useProducts(params = {}) {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState(null);
  const paramsKey = JSON.stringify(params);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await productService.getProducts(JSON.parse(paramsKey));
      // Always set an array — never let undefined reach components
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load products.');
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [paramsKey]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  return { products, isLoading, error, refetch: fetchProducts };
}

export function useProduct(id) {
  const [product, setProduct]     = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState(null);

  const fetchProduct = useCallback(async () => {
    if (!id) { setIsLoading(false); return; }
    setIsLoading(true);
    setError(null);
    try {
      const data = await productService.getProduct(id);
      setProduct(data ?? null);
    } catch (err) {
      setError(err.message || 'Failed to load product.');
      setProduct(null);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchProduct(); }, [fetchProduct]);

  return { product, isLoading, error, refetch: fetchProduct };
}
