import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';
import Loader from './Loader';
import './AdminEvents.css';

const AdminFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/feedback`);
      if (res.data.success) {
        setFeedbacks(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this feedback?')) return;
    setDeleting(id);
    try {
      const res = await axios.delete(`${API_URL}/api/feedback/${id}`);
      if (res.data.success) {
        setFeedbacks(feedbacks.filter(f => f._id !== id));
      }
    } catch (error) {
      alert('Failed to delete feedback');
    } finally {
      setDeleting(null);
    }
  };

  const exportToCSV = () => {
    if (feedbacks.length === 0) return;

    const headers = [
      'Date', 'User Name', 'Email', 'Register No', 'Department', 'Year', 
      'Event Title', 'Event Rating', 'Event Comments', 
      'Site Rating', 'Site Comments', 'Suggestions'
    ];

    const rows = feedbacks.map(f => [
      new Date(f.createdAt).toLocaleDateString(),
      f.user?.name || 'N/A',
      f.user?.email || 'N/A',
      f.user?.registerNumber || 'N/A',
      f.user?.department || 'N/A',
      f.user?.year || 'N/A',
      f.event?.title || 'N/A',
      f.eventRating || 'N/A',
      `"${(f.eventComments || '').replace(/"/g, '""')}"`,
      f.siteRating || 'N/A',
      `"${(f.siteComments || '').replace(/"/g, '""')}"`,
      `"${(f.suggestions || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Spectrum_Feedback_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <Loader fullScreen text="Loading Feedbacks..." />;

  return (
    <div className="admin-container">
      <div className="admin-header glass animate-fade-in">
        <div className="admin-header-title">
          <h1>Feedback Management</h1>
          <p>View and manage all user feedback and ratings</p>
        </div>
        <div className="admin-header-actions">
          <button className="btn btn-secondary" onClick={() => navigate('/admin/events')}>
             Back to Admin
          </button>
          <button className="btn btn-primary" onClick={exportToCSV} disabled={feedbacks.length === 0}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '8px'}}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export to CSV
          </button>
        </div>
      </div>

      <div className="admin-content animate-fade-in-up">
        {feedbacks.length === 0 ? (
          <div className="glass" style={{ padding: '4rem', textAlign: 'center', borderRadius: '1.5rem' }}>
            <h2 style={{color: '#fff'}}>No feedback yet</h2>
            <p style={{color: 'rgba(255,255,255,0.6)'}}>Feedback will appear here once users start submitting.</p>
          </div>
        ) : (
          <div className="glass table-responsive" style={{ borderRadius: '1.5rem', overflow: 'hidden' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User Details</th>
                  <th>Event</th>
                  <th>Ratings (E/S)</th>
                  <th>Comments</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {feedbacks.map(f => (
                  <tr key={f._id}>
                    <td>
                      <div className="user-info">
                        <strong>{f.user?.name}</strong>
                        <div style={{fontSize: '0.8rem', opacity: 0.7}}>{f.user?.email}</div>
                        <div style={{fontSize: '0.8rem', opacity: 0.7}}>{f.user?.department} - {f.user?.year}yr</div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${f.event ? 'badge-primary' : 'badge-secondary'}`}>
                        {f.event?.title || 'Website Only'}
                      </span>
                    </td>
                    <td>
                      <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
                        <span title="Event Rating">E: {'⭐'.repeat(f.eventRating || 0)}</span>
                        <span title="Site Rating">S: {'⭐'.repeat(f.siteRating || 0)}</span>
                      </div>
                    </td>
                    <td>
                      <div className="feedback-comments" style={{maxWidth: '300px'}}>
                        {f.eventComments && <div style={{marginBottom: '8px'}}><strong>Event:</strong> {f.eventComments}</div>}
                        {f.siteComments && <div style={{marginBottom: '8px'}}><strong>Site:</strong> {f.siteComments}</div>}
                        {f.suggestions && <div style={{fontStyle: 'italic', color: '#fbbf24'}}><strong>Sug:</strong> {f.suggestions}</div>}
                      </div>
                    </td>
                    <td>
                      <button 
                        className="btn btn-icon btn-danger" 
                        onClick={() => handleDelete(f._id)}
                        disabled={deleting === f._id}
                        title="Delete Feedback"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminFeedback;
