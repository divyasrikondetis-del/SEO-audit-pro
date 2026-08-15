import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import AuditReport from '../components/seo/AuditReport';
import ConfirmModal from '../components/common/ConfirmModal';
import { auditService } from '../services/auditService';
import '../styles/audit.css';

const csvEscape = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;

const Audit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [audit, setAudit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    const loadAudit = async () => {
      try { const response = await auditService.getOne(id); setAudit(response.audit); }
      catch (err) { setError(err.response?.data?.message || 'Unable to load this audit.'); }
      finally { setLoading(false); }
    };
    loadAudit();
  }, [id]);

  const deleteAudit = async () => {
    try { await auditService.delete(id); toast.success('Audit deleted successfully.'); navigate('/dashboard'); }
    catch (err) { setConfirmOpen(false); toast.error(err.response?.data?.message || 'Unable to delete this audit.'); }
  };

  const exportCsv = () => {
    const rows = [['Status', 'Check', 'Category', 'Explanation', 'Recommendation'], ...(audit.checks || []).map((check) => [check.status, check.name, check.category, check.explanation, check.recommendation])];
    const file = new Blob([rows.map((row) => row.map(csvEscape).join(',')).join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(file);
    link.download = `seo-audit-${new URL(audit.url).hostname}-${new Date(audit.createdAt).toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    toast.success('CSV report downloaded.');
  };

  const copyReport = async () => {
    const report = [`SEO Audit Pro report`, `Website: ${audit.url}`, `Score: ${audit.seoScore}/100`, `Audited: ${new Date(audit.createdAt).toLocaleString()}`, '', 'Recommendations:', ...(audit.recommendations || []).map((item, index) => `${index + 1}. ${item.title}: ${item.description}`)].join('\n');
    try { await navigator.clipboard.writeText(report); toast.success('Report copied to your clipboard.'); }
    catch { toast.error('Your browser could not copy the report.'); }
  };

  const exportJson = () => {
    const file = new Blob([JSON.stringify(audit, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(file);
    link.download = `seo-audit-${new URL(audit.url).hostname}-${new Date(audit.createdAt).toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
    toast.success('JSON report downloaded.');
  };

  const printReport = () => {
    window.print();
  };

  if (loading) return <div className="min-h-[60vh] grid place-items-center text-slate-600">Loading audit details…</div>;
  if (error || !audit) return <div className="min-h-[60vh] grid place-items-center px-4"><div className="max-w-md rounded-2xl border border-rose-200 bg-white p-7 text-center shadow-sm"><h1 className="text-xl font-bold text-slate-900">Audit unavailable</h1><p className="mt-2 text-slate-600">{error || 'This audit no longer exists or is not accessible to your account.'}</p><Link to="/dashboard" className="mt-5 inline-block rounded-xl bg-indigo-600 px-4 py-2 font-semibold text-white">Back to dashboard</Link></div></div>;

  return <div className="audit-page"><div className="audit-shell"><header className="audit-topbar"><div><Link to="/dashboard" className="audit-brand">SEO Audit Pro</Link><p className="mt-1 text-sm text-slate-500">Professional website audit report</p></div><div className="audit-topbar-actions"><Link to="/dashboard" className="audit-link">Back to dashboard</Link><button onClick={exportCsv} className="audit-link">Export CSV</button><button onClick={exportJson} className="audit-link">Export JSON</button><button onClick={copyReport} className="audit-link">Copy report</button><button onClick={printReport} className="audit-link">Print report</button><button onClick={() => setConfirmOpen(true)} className="audit-delete-btn">Delete</button></div></header><section className="audit-hero"><div className="min-w-0"><p className="audit-eyebrow">Website overview</p><h1 className="break-words">{audit.url}</h1><p>Audited {new Date(audit.createdAt).toLocaleString()} · Status: <span className="capitalize">{audit.status}</span></p></div><div className="audit-score-card"><div className="audit-score">{audit.seoScore || 0}<span>/100</span></div><div className="audit-score-label">Overall SEO score</div></div></section><AuditReport audit={audit} /></div><ConfirmModal open={confirmOpen} title="Delete this audit?" description="This action cannot be undone." onCancel={() => setConfirmOpen(false)} onConfirm={deleteAudit} /></div>;
};

export default Audit;
