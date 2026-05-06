import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Loader from './Loader';
import { API_URL } from '../config';
import './AdminEvents.css';

const AdminAuditLogs = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/admin/audit-logs`, { withCredentials: true });
      if (res.data.success) {
        setLogs(res.data.logs);
      }
    } catch (err) {
      setError('Failed to load audit logs. Admin access required.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader fullScreen text="Loading audit logs..." />;
  if (error) return (
    <div className="ae-error animate-fade-in">
      <h2>{error}</h2>
      <button className="btn btn-primary" onClick={() => navigate('/admin/events')}>Back to Admin</button>
    </div>
  );

  return (
    <div className="ae-wrapper">
      <header className="ae-header glass animate-fade-in">
        <div className="ae-header-left">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin/events')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
            Admin Panel
          </button>
          <div>
            <h1 className="ae-title">Audit Logs</h1>
            <p className="ae-subtitle">System activity and modifications</p>
          </div>
        </div>
        <button className="btn btn-secondary" onClick={fetchLogs}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '6px'}}><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
          Refresh
        </button>
      </header>

      <div className="glass" style={{ padding: '1.5rem', borderRadius: '1rem', overflowX: 'auto' }}>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '1rem' }}>Timestamp</th>
              <th style={{ padding: '1rem' }}>User</th>
              <th style={{ padding: '1rem' }}>Action</th>
              <th style={{ padding: '1rem' }}>Details</th>
              <th style={{ padding: '1rem' }}>IP Address</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No audit logs found.
                </td>
              </tr>
            ) : logs.map(log => (
              <tr 
                key={log._id} 
                style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', transition: 'background 0.2s' }}
                onClick={() => setSelectedLog(log)}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding: '1rem', whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>
                  {new Date(log.createdAt).toLocaleString()}
                </td>
                <td style={{ padding: '1rem' }}>
                  {log.user ? (
                    <div>
                      <div style={{ fontWeight: '500' }}>{log.user.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{log.user.email}</div>
                    </div>
                  ) : 'System'}
                </td>
                <td style={{ padding: '1rem' }}>
                  <span className="badge badge-outline" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    {log.action}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>{log.details}</td>
                <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{log.ipAddress || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedLog && (
        <div className="ae-modal-overlay" onClick={() => setSelectedLog(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="ae-modal-content glass animate-fade-in" onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '600px', borderRadius: '1rem', padding: '2rem', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button 
              className="btn btn-ghost btn-icon" 
              style={{ position: 'absolute', top: '1rem', right: '1rem' }}
              onClick={() => setSelectedLog(null)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem', color: 'var(--text-primary)' }}>Log Details</h2>
            
            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <strong style={{ color: 'var(--text-muted)' }}>Action:</strong> <span>{selectedLog.action}</span>
                <strong style={{ color: 'var(--text-muted)' }}>Timestamp:</strong> <span>{new Date(selectedLog.createdAt).toLocaleString()}</span>
                <strong style={{ color: 'var(--text-muted)' }}>Actor:</strong> <span>{selectedLog.user ? `${selectedLog.user.name} (${selectedLog.user.email})` : 'System'}</span>
                <strong style={{ color: 'var(--text-muted)' }}>IP Address:</strong> <span>{selectedLog.ipAddress || 'Unknown'}</span>
                <strong style={{ color: 'var(--text-muted)' }}>Target Name:</strong> <span>{selectedLog.targetName || 'N/A'}</span>
                <strong style={{ color: 'var(--text-muted)' }}>Target Model:</strong> <span>{selectedLog.targetModel || 'N/A'}</span>
                <strong style={{ color: 'var(--text-muted)' }}>Target ID:</strong> <span>{selectedLog.targetId || 'N/A'}</span>
              </div>
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <strong style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>Summary:</strong>
                <span>{selectedLog.details}</span>
              </div>
            </div>

            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Payload</h3>
            {selectedLog.payload ? (
              <pre style={{ background: '#0d1117', padding: '1rem', borderRadius: '0.5rem', overflowX: 'auto', fontSize: '0.85rem', color: '#e6edf3', border: '1px solid rgba(255,255,255,0.05)' }}>
                {JSON.stringify(selectedLog.payload, null, 2)}
              </pre>
            ) : (
              <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.5rem', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center' }}>
                No additional payload data recorded for this event.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAuditLogs;
