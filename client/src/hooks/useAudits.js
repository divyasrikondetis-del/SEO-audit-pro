import { useState, useEffect, useCallback } from 'react';
import { auditService } from '../services/auditService';

export const useAudits = () => {
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({});

  const fetchAudits = useCallback(async () => {
    try {
      setLoading(true);
      const response = await auditService.getAll();
      setAudits(response.audits);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch audits');
    } finally {
      setLoading(false);
    }
  }, []);

  // fetchStats removed (unused) — stats are fetched during init effect

  const createAudit = useCallback(async (url) => {
    try {
      const response = await auditService.create(url);
      setAudits(prev => [response.audit, ...prev]);
      return { success: true, audit: response.audit, cached: response.cached };
    } catch (err) {
      return { success: false, error: err.response?.data?.message };
    }
  }, []);

  const deleteAudit = useCallback(async (id) => {
    try {
      await auditService.delete(id);
      setAudits(prev => prev.filter(audit => audit._id !== id));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message };
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        setLoading(true);
        const response = await auditService.getAll();
        if (!cancelled) {
          setAudits(response.audits);
          setError(null);
        }

        try {
          const statsResp = await auditService.getStats();
          if (!cancelled) setStats(statsResp.stats || {});
        } catch {
          // ignore
        }
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || 'Failed to fetch audits');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    init();
    return () => { cancelled = true; };
  }, []);

  return {
    audits,
    loading,
    error,
    stats,
    fetchAudits,
    createAudit,
    deleteAudit,
  };
};

export default useAudits;
