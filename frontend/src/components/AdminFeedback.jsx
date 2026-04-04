import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { 
  FileText, 
  ArrowLeft, 
  Trash2, 
  Download, 
  MessageSquare, 
  Star, 
  Layout, 
  Search 
} from 'lucide-react';
import { API_URL } from '../config';
import Loader from './Loader';
import './AdminEvents.css';

const AdminFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
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

  const exportToPDF = () => {
    if (feedbacks.length === 0) return;

    const doc = new jsPDF('l', 'pt', 'a4'); // Landscape, points, A4
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text('Spectrum Event Feedback Report', 40, 50);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 40, 70);

    const tableColumn = [
      'User', 
      'Dept/Year', 
      'Event', 
      'Ratings (E/S)', 
      'Comments', 
      'Suggestions'
    ];

    const tableRows = feedbacks.map(f => [
      `${f.user?.name}\n(${f.user?.email})`,
      `${f.user?.department || 'N/A'}\n${f.user?.year || 'N/A'}`,
      f.event?.title || 'Website Only',
      `Event: ${f.eventRating || 0}/5\nSite: ${f.siteRating || 0}/5`,
      `E: ${f.eventComments || '-'}\nS: ${f.siteComments || '-'}`,
      f.suggestions || '-'
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 90,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 5 },
      headStyles: { fillColor: [99, 102, 241], textColor: 255 }, // Spectrum Blue/Indigo
      alternateRowStyles: { fillColor: [245, 245, 245] },
      columnStyles: {
        0: { cellWidth: 120 },
        1: { cellWidth: 80 },
        2: { cellWidth: 100 },
        3: { cellWidth: 70 },
        4: { cellWidth: 180 },
        5: { cellWidth: 150 }
      }
    });

    doc.save(`Spectrum_Feedback_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const filteredFeedbacks = feedbacks.filter(f => 
    f.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.event?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.eventComments?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.siteComments?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.suggestions?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <Loader fullScreen text="Loading Feedbacks..." />;

  return (
    <div className="ae-wrapper">
      {/* ── Header ── */}
      <header className="ae-header glass animate-fade-in" style={{ justifyContent: 'space-between', padding: '1rem 2rem' }}>
        <div className="ae-header-left" style={{ gap: '1.5rem' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin/events')} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <ArrowLeft size={16} /> Dashboard
          </button>
          <div>
            <h1 className="ae-title" style={{ fontSize: '1.8rem', fontWeight: '800', letterSpacing: '-0.02em', background: 'linear-gradient(135deg, #fff 0%, #818cf8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Feedback Insights 
            </h1>
            <p className="ae-subtitle" style={{ fontSize: '0.9rem', opacity: 0.6 }}>{feedbacks.length} submissions found</p>
          </div>
        </div>
        <div className="ae-header-actions" style={{ gap: '1rem' }}>
           <div className="glass" style={{ position: 'relative', borderRadius: '0.8rem', padding: '0 0.8rem', display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <Search size={16} style={{ opacity: 0.5, marginRight: '0.5rem' }} />
              <input 
                type="text" 
                placeholder="Search feedback..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ background: 'none', border: 'none', color: '#fff', padding: '0.6rem 0', outline: 'none', width: '200px', fontSize: '0.9rem' }}
              />
           </div>
           <button 
             className="btn btn-primary" 
             onClick={exportToPDF} 
             disabled={feedbacks.length === 0}
             style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', borderRadius: '0.8rem', boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)' }}
           >
             <Download size={18} /> Export as PDF
           </button>
        </div>
      </header>

      {/* ── Main Content Area ── */}
      <div className="container" style={{ maxWidth: '1400px', margin: '2rem auto', padding: '0 2rem' }}>
        
        {/* Statistics Bar */}
        <div className="ae-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
          <div className="glass animate-fade-in-up" style={{ padding: '1.5rem', borderRadius: '1.2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.8rem', background: 'rgba(129, 140, 248, 0.1)', color: '#818cf8', borderRadius: '1rem' }}><MessageSquare size={24}/></div>
            <div>
              <p style={{ fontSize: '0.8rem', opacity: 0.6, marginBottom: '0.2rem' }}>Total Responses</p>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{feedbacks.length}</h3>
            </div>
          </div>
          <div className="glass animate-fade-in-up stagger-1" style={{ padding: '1.5rem', borderRadius: '1.2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.8rem', background: 'rgba(251, 191, 36, 0.1)', color: '#fbbf24', borderRadius: '1rem' }}><Star size={24}/></div>
            <div>
              <p style={{ fontSize: '0.8rem', opacity: 0.6, marginBottom: '0.2rem' }}>Avg. Site Rating</p>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                {(feedbacks.reduce((acc, f) => acc + (f.siteRating || 0), 0) / (feedbacks.length || 1)).toFixed(1)}/5
              </h3>
            </div>
          </div>
          <div className="glass animate-fade-in-up stagger-2" style={{ padding: '1.5rem', borderRadius: '1.2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.8rem', background: 'rgba(168, 85, 247, 0.1)', color: '#c084fc', borderRadius: '1rem' }}><Layout size={24}/></div>
            <div>
              <p style={{ fontSize: '0.8rem', opacity: 0.6, marginBottom: '0.2rem' }}>Events Covered</p>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                {[...new Set(feedbacks.map(f => f.event?._id).filter(id => id))].length}
              </h3>
            </div>
          </div>
          <div className="glass animate-fade-in-up stagger-3" style={{ padding: '1.5rem', borderRadius: '1.2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.8rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '1rem' }}><FileText size={24}/></div>
            <div>
              <p style={{ fontSize: '0.8rem', opacity: 0.6, marginBottom: '0.2rem' }}>New This Week</p>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                {feedbacks.filter(f => new Date(f.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
              </h3>
            </div>
          </div>
        </div>

        {/* Table View */}
        <div className="glass animate-fade-in-up stagger-4" style={{ borderRadius: '1.5rem', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
          {filteredFeedbacks.length === 0 ? (
            <div style={{ padding: '4rem', textAlign: 'center' }}>
              <div style={{ marginBottom: '1.5rem', fontSize: '4rem' }}>📭</div>
              <h2 style={{ color: '#fff', marginBottom: '0.5rem' }}>No feedback matches your search</h2>
              <p style={{ color: 'rgba(255,255,255,0.4)' }}>Try a different keyword or check back later.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="admin-table" style={{ borderCollapse: 'separate', borderSpacing: '0 4px' }}>
                <thead style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <tr>
                    <th style={{ padding: '1.2rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.5)' }}>User & Details</th>
                    <th style={{ padding: '1.2rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.5)' }}>Event Context</th>
                    <th style={{ padding: '1.2rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.5)' }}>Ratings</th>
                    <th style={{ padding: '1.2rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.5)' }}>Feedback Narratives</th>
                    <th style={{ padding: '1.2rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.5)', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFeedbacks.map((f, i) => (
                    <tr key={f._id} className="animate-fade-in-up" style={{ animationDelay: `${i * 0.05}s`, background: 'rgba(255,255,255,0.01)', transition: 'background 0.3s ease' }}>
                      <td style={{ padding: '1.2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 'bold', color: '#fff' }}>
                            {f.user?.name?.[0]?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <div style={{ fontWeight: '600', color: '#fff' }}>{f.user?.name || 'Anonymous'}</div>
                            <div style={{ fontSize: '0.75rem', opacity: 0.5 }}>{f.user?.email}</div>
                            <div style={{ fontSize: '0.75rem', opacity: 0.5, marginTop: '2px' }}>{f.user?.department} · {f.user?.year}yr</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1.2rem' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.8rem', borderRadius: '2rem', background: f.event ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255, 255, 255, 0.05)', color: f.event ? '#818cf8' : '#aaa', fontSize: '0.8rem', fontWeight: '500' }}>
                          <Layout size={12} /> {f.event?.title || 'Platform Only'}
                        </div>
                      </td>
                      <td style={{ padding: '1.2rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', width: '35px' }}>Event</span>
                            <div style={{ display: 'flex', gap: '2px' }}>
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} size={10} fill={i < (f.eventRating || 0) ? "#fbbf24" : "transparent"} stroke={i < (f.eventRating || 0) ? "#fbbf24" : "rgba(255,255,255,0.2)"} />
                              ))}
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', width: '35px' }}>Site</span>
                            <div style={{ display: 'flex', gap: '2px' }}>
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} size={10} fill={i < (f.siteRating || 0) ? "#a855f7" : "transparent"} stroke={i < (f.siteRating || 0) ? "#a855f7" : "rgba(255,255,255,0.2)"} />
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1.2rem' }}>
                        <div style={{ maxWidth: '400px' }}>
                          {(f.eventComments || f.siteComments) ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                              {f.eventComments && (
                                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)', fontStyle: 'italic', position: 'relative', paddingLeft: '1rem', borderLeft: '2px solid rgba(129, 140, 248, 0.3)' }}>
                                  "{f.eventComments}"
                                </p>
                              )}
                              {f.siteComments && (
                                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)', fontStyle: 'italic', position: 'relative', paddingLeft: '1rem', borderLeft: '2px solid rgba(168, 85, 247, 0.3)' }}>
                                  "{f.siteComments}"
                                </p>
                              )}
                              {f.suggestions && (
                                <p style={{ fontSize: '0.85rem', color: '#fbbf24', fontWeight: '500', background: 'rgba(251, 191, 36, 0.05)', padding: '0.5rem', borderRadius: '0.5rem' }}>
                                  💡 {f.suggestions}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.8rem' }}>No written feedback provided</span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '1.2rem', textAlign: 'center' }}>
                        <button 
                          className="btn-danger-ghost" 
                          onClick={() => handleDelete(f._id)}
                          disabled={deleting === f._id}
                          style={{ padding: '0.6rem', borderRadius: '0.8rem', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)', color: '#ef4444', cursor: 'pointer', transition: 'all 0.2s' }}
                        >
                          <Trash2 size={18} />
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

      <style dangerouslySetInnerHTML={{ __html: `
        .ae-wrapper {
          background: radial-gradient(circle at top right, rgba(99, 102, 241, 0.05), transparent 40%),
                      radial-gradient(circle at bottom left, rgba(168, 85, 247, 0.05), transparent 40%);
          min-height: 100vh;
        }
        .admin-table tr:hover {
          background: rgba(255,255,255,0.03) !important;
        }
        .btn-danger-ghost:hover {
          background: rgba(239, 68, 68, 0.2) !important;
          transform: scale(1.05);
        }
        .table-responsive::-webkit-scrollbar {
          height: 6px;
        }
        .table-responsive::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 10px;
        }
      `}} />
    </div>
  );
};

export default AdminFeedback;
