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
  Search,
  Heart,
  ThumbsUp,
  TrendingUp,
  Trophy,
  Globe
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
    doc.setFontSize(22);
    doc.setTextColor(63, 66, 241); // Indigo
    doc.text('Spectrum HELIX\'26 Feedback Report', 40, 50);
    
    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 40, 70);
    doc.text(`Total Responses: ${feedbacks.length}`, 40, 85);

    const tableColumn = [
      'User Details', 
      'Event Context', 
      'Ratings (E/S/O/R)', 
      'Comments (E/S)', 
      'Suggestions & Vision'
    ];

    const tableRows = feedbacks.map(f => [
      `${f.user?.name}\n${f.user?.email}\n${f.user?.department} - ${f.user?.year}yr`,
      f.event?.title || 'Platform Only',
      `Event: ${f.eventRating || 0}/5\nSite: ${f.siteRating || 0}/5\nOverall: ${f.overallSatisfaction || 0}/5\nRecommend: ${f.recommendation || 0}/5`,
      `Event: ${f.eventComments || '-'}\n\nSite: ${f.siteComments || '-'}`,
      `Sug: ${f.suggestions || '-'}\n\nNext: ${f.preferredNextEvent || '-'}`
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 110,
      theme: 'grid',
      styles: { fontSize: 7, cellPadding: 8, overflow: 'linebreak' },
      headStyles: { fillColor: [63, 66, 241], textColor: 255, fontSize: 8, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        0: { cellWidth: 130 },
        1: { cellWidth: 100 },
        2: { cellWidth: 90 },
        3: { cellWidth: 200 },
        4: { cellWidth: 200 }
      },
      margin: { top: 110, left: 40, right: 40 }
    });

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 20, { align: 'center' });
    }

    doc.save(`Spectrum_Feedback_Full_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const filteredFeedbacks = feedbacks.filter(f => 
    f.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.event?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.eventComments?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.siteComments?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.suggestions?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.preferredNextEvent?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <Loader fullScreen text="Loading Feedback Insights..." />;

  const avgOverall = (feedbacks.reduce((acc, f) => acc + (f.overallSatisfaction || 0), 0) / (feedbacks.length || 1)).toFixed(1);
  const avgRecommend = (feedbacks.reduce((acc, f) => acc + (f.recommendation || 0), 0) / (feedbacks.length || 1)).toFixed(1);

  return (
    <div className="ae-wrapper admin-feedback-wrapper" style={{ minHeight: '100vh', background: 'radial-gradient(circle at top right, rgba(99, 102, 241, 0.05), transparent 40%)' }}>
      {/* ── Header ── */}
      <header className="ae-header glass animate-fade-in header-responsive" style={{ justifyContent: 'space-between', padding: '1rem 2rem' }}>
        <div className="ae-header-left" style={{ gap: '1.5rem' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin/events')} style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
            <ArrowLeft size={16} /> <span className="hide-mobile">Dashboard</span>
          </button>
          <div className="header-text">
            <h1 className="ae-title feedback-mgmt-title" style={{ fontSize: '1.8rem', fontWeight: '800', letterSpacing: '-0.02em', background: 'linear-gradient(135deg, #fff 0%, #818cf8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Feedback Insights 📊
            </h1>
            <p className="ae-subtitle" style={{ fontSize: '0.85rem', opacity: 0.6 }}>{feedbacks.length} submissions analyzed</p>
          </div>
        </div>
        <div className="ae-header-actions" style={{ gap: '0.8rem' }}>
           <div className="search-box glass" style={{ position: 'relative', borderRadius: '0.8rem', padding: '0 0.8rem', display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <Search size={14} style={{ opacity: 0.5, marginRight: '0.4rem' }} />
              <input 
                type="text" 
                placeholder="Search report..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ background: 'none', border: 'none', color: '#fff', padding: '0.6rem 0', outline: 'none', width: '150px', fontSize: '0.85rem' }}
              />
           </div>
           <button 
             className="btn btn-primary export-btn" 
             onClick={exportToPDF} 
             disabled={feedbacks.length === 0}
             style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', borderRadius: '0.8rem', padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}
           >
             <Download size={16} /> <span className="hide-mobile">Export PDF</span>
           </button>
        </div>
      </header>

      {/* ── Main Content Area ── */}
      <div className="container" style={{ maxWidth: '1400px', margin: '2rem auto', padding: '0 1.5rem' }}>
        
        {/* Statistics Bar */}
        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.2rem', marginBottom: '2rem' }}>
          <div className="glass animate-fade-in-up" style={{ padding: '1.2rem', borderRadius: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.6rem', background: 'rgba(129, 140, 248, 0.1)', color: '#818cf8', borderRadius: '0.8rem' }}><MessageSquare size={20}/></div>
            <div>
              <p style={{ fontSize: '0.75rem', opacity: 0.6 }}>Total Responses</p>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{feedbacks.length}</h3>
            </div>
          </div>
          <div className="glass animate-fade-in-up stagger-1" style={{ padding: '1.2rem', borderRadius: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.6rem', background: 'rgba(236, 72, 153, 0.1)', color: '#ec4899', borderRadius: '0.8rem' }}><Heart size={20}/></div>
            <div>
              <p style={{ fontSize: '0.75rem', opacity: 0.6 }}>Satisfaction</p>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{avgOverall}/5</h3>
            </div>
          </div>
          <div className="glass animate-fade-in-up stagger-2" style={{ padding: '1.2rem', borderRadius: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.6rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '0.8rem' }}><ThumbsUp size={20}/></div>
            <div>
              <p style={{ fontSize: '0.75rem', opacity: 0.6 }}>Recommendation</p>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{avgRecommend}/5</h3>
            </div>
          </div>
          <div className="glass animate-fade-in-up stagger-3" style={{ padding: '1.2rem', borderRadius: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.6rem', background: 'rgba(251, 191, 36, 0.1)', color: '#fbbf24', borderRadius: '0.8rem' }}><TrendingUp size={20}/></div>
            <div>
              <p style={{ fontSize: '0.75rem', opacity: 0.6 }}>Conversion Rate</p>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>100%</h3>
            </div>
          </div>
        </div>

        {/* Table View */}
        <div className="glass animate-fade-in-up stagger-4 responsive-table-card" style={{ borderRadius: '1.2rem', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
          {filteredFeedbacks.length === 0 ? (
            <div style={{ padding: '4rem', textAlign: 'center' }}>
              <div style={{ marginBottom: '1rem', fontSize: '3rem' }}>📭</div>
              <h2 style={{ color: '#fff', marginBottom: '0.5rem', fontSize: '1.2rem' }}>No matching reports</h2>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>Refine your search parameters.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="admin-table" style={{ borderCollapse: 'separate', borderSpacing: '0 2px' }}>
                <thead style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <tr>
                    <th style={{ padding: '1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', textAlign: 'left' }}>Participant</th>
                    <th style={{ padding: '1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', textAlign: 'left' }}>Event</th>
                    <th style={{ padding: '1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', textAlign: 'left' }}>Metrics (E/S/O/R)</th>
                    <th style={{ padding: '1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', textAlign: 'left' }}>Direct Feedback</th>
                    <th style={{ padding: '1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>Manage</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFeedbacks.map((f, i) => (
                    <tr key={f._id} className="feedback-row animate-fade-in-up" style={{ animationDelay: `${i * 0.03}s` }}>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold', color: '#fff' }}>
                            {f.user?.name?.[0]?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <div style={{ fontWeight: '600', color: '#fff', fontSize: '0.85rem' }}>{f.user?.name || 'Anonymous'}</div>
                            <div style={{ fontSize: '0.7rem', opacity: 0.4 }}>{f.user?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ fontSize: '0.8rem', color: '#818cf8', background: 'rgba(129, 140, 248, 0.1)', padding: '0.2rem 0.6rem', borderRadius: '1rem' }}>
                          {f.event?.title || 'Platform'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Trophy size={10} color="#818cf8" /> {f.eventRating || 0}/5
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Globe size={10} color="#a855f7" /> {f.siteRating || 0}/5
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Heart size={10} color="#ec4899" /> {f.overallSatisfaction || 0}/5
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <ThumbsUp size={10} color="#10b981" /> {f.recommendation || 0}/5
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ maxWidth: '350px', fontSize: '0.8rem' }}>
                          {f.eventComments && <div style={{ color: 'rgba(255,255,255,0.7)', fontStyle: 'italic', marginBottom: '4px' }}>• {f.eventComments}</div>}
                          {f.siteComments && <div style={{ color: 'rgba(255,255,255,0.7)', fontStyle: 'italic', marginBottom: '4px' }}>• {f.siteComments}</div>}
                          {f.suggestions && <div style={{ color: '#fbbf24', fontWeight: '500' }}>💡 {f.suggestions}</div>}
                          {f.preferredNextEvent && <div style={{ color: '#10b981', fontWeight: '500', marginTop: '4px' }}>🎯 Next: {f.preferredNextEvent}</div>}
                        </div>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <button 
                          onClick={() => handleDelete(f._id)}
                          disabled={deleting === f._id}
                          className="delete-icon-btn"
                          style={{ padding: '0.5rem', borderRadius: '0.6rem', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)', color: '#ef4444', cursor: 'pointer', transition: 'all 0.2s' }}
                        >
                          <Trash2 size={16} />
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
        @media (max-width: 768px) {
          .header-responsive {
            padding: 0.8rem 1rem !important;
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start !important;
          }
          .ae-header-left {
             width: 100%;
             gap: 1rem !important;
          }
          .ae-header-actions {
            width: 100%;
            justify-content: space-between;
          }
          .search-box {
            flex: 1;
          }
          .hide-mobile {
            display: none !important;
          }
          .stats-grid {
            grid-template-columns: 1fr 1fr !important;
          }
          .feedback-mgmt-title {
            font-size: 1.4rem !important;
          }
        }
        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr !important;
          }
        }
        .feedback-row:hover {
          background: rgba(255,255,255,0.03) !important;
        }
        .delete-icon-btn:hover {
          background: rgba(239, 68, 68, 0.2) !important;
          transform: scale(1.1);
        }
        .table-responsive::-webkit-scrollbar {
          height: 4px;
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
