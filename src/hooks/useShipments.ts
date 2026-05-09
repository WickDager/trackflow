import { useCallback, useEffect, useRef, useState } from 'react';
import type { Shipment, ShipmentStatus, PaginatedResponse } from '@/types';

interface UseShipmentsParams {
  status?: ShipmentStatus | 'all';
  search?: string;
  page?: number;
  limit?: number;
}

interface UseShipmentsReturn {
  shipments: Shipment[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  refetch: () => Promise<void>;
  createShipment: (data: Omit<Shipment, 'id' | 'created_by' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  updateShipment: (id: string, data: Partial<Shipment>) => Promise<boolean>;
  deleteShipment: (id: string) => Promise<boolean>;
}

export function useShipments(params: UseShipmentsParams = {}): UseShipmentsReturn {
  const { status, search, page = 1, limit = 20 } = params;
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchShipments = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const searchParams = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });

      if (status && status !== 'all') {
        searchParams.set('status', status);
      }
      if (search) {
        searchParams.set('search', search);
      }

      const response = await fetch(`/api/shipments?${searchParams.toString()}`, {
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: PaginatedResponse<Shipment> = await response.json();

      if (result.error) {
        setError(result.error);
        return;
      }

      setShipments(result.data ?? []);
      setTotalCount(result.count);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      const message = err instanceof Error ? err.message : 'Failed to fetch shipments';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [status, search, page, limit]);

  useEffect(() => {
    void fetchShipments();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchShipments]);

  const createShipment = useCallback(
    async (data: Omit<Shipment, 'id' | 'created_by' | 'created_at' | 'updated_at'>): Promise<boolean> => {
      try {
        const response = await fetch('/api/shipments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const result = await response.json();
          setError(result.error ?? 'Failed to create shipment');
          return false;
        }

        await fetchShipments();
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create shipment';
        setError(message);
        return false;
      }
    },
    [fetchShipments]
  );

  const updateShipment = useCallback(
    async (id: string, data: Partial<Shipment>): Promise<boolean> => {
      try {
        const response = await fetch(`/api/shipments/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const result = await response.json();
          setError(result.error ?? 'Failed to update shipment');
          return false;
        }

        await fetchShipments();
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update shipment';
        setError(message);
        return false;
      }
    },
    [fetchShipments]
  );

  const deleteShipment = useCallback(
    async (id: string): Promise<boolean> => {
      const previousShipments = [...shipments];
      setShipments((prev) => prev.filter((s) => s.id !== id));

      try {
        const response = await fetch(`/api/shipments/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok && response.status !== 204) {
          setShipments(previousShipments);
          const result = await response.json().catch(() => null);
          setError(result?.error ?? 'Failed to delete shipment');
          return false;
        }

        await fetchShipments();
        return true;
      } catch (err) {
        setShipments(previousShipments);
        const message = err instanceof Error ? err.message : 'Failed to delete shipment';
        setError(message);
        return false;
      }
    },
    [shipments, fetchShipments]
  );

  const refetch = useCallback(async () => {
    await fetchShipments();
  }, [fetchShipments]);

  return {
    shipments,
    loading,
    error,
    totalCount,
    refetch,
    createShipment,
    updateShipment,
    deleteShipment,
  };
}
