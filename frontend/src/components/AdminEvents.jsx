import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Loader from './Loader';
import ParticipantsPanel from './ParticipantsPanel';
import { API_URL } from '../config';
import './AdminEvents.css';

const EMPTY_FORM = { title: '', description: '', date: '', location: '', teamSizeLimit: 4, rounds: 1, maxShortlisted: 0, session: 'none', imageUrl: '', isPublished: false, isRegistrationOpen: true, isTeamChangeAllowed: true };

// --- Helper Components ---
const EventForm = ({ formData, handleInputChange, handleImageUpload, handleSubmit, submitting }) => (
  <form onSubmit={handleSubmit} className="ae-form">
    <div className="ae-form-row">
      <div className="form-group" style={{ flex: 2 }}>
        <label className="form-label">Event Title *</label>
        <input className="form-input" type="text" name="title" required value={formData.title} onChange={handleInputChange} placeholder="e.g., Coding Challenge" />
      </div>
      <div className="form-group">
        <label className="form-label">Date *</label>
        <input className="form-input" type="date" name="date" required value={formData.date} onChange={handleInputChange} />
      </div>
    </div>

    <div className="form-group">
      <label className="form-label">Description *</label>
      <textarea className="form-textarea" name="description" required value={formData.description} onChange={handleInputChange} rows={3} />
    </div>

    <div className="ae-form-row">
      <div className="form-group">
        <label className="form-label">Location *</label>
        <input className="form-input" type="text" name="location" required value={formData.location} onChange={handleInputChange} />
      </div>
      <div className="form-group">
        <label className="form-label">Session Slot</label>
        <select className="form-select" name="session" value={formData.session} onChange={handleInputChange}>
          <option value="none">No Session (Generic)</option>
          <option value="day1_morning">Day 1: 9:00 AM - 1:00 PM</option>
          <option value="day1_afternoon">Day 1: 2:00 PM - 4:00 PM</option>
          <option value="day2_morning">Day 2: 9:00 AM - 1:00 PM</option>
        </select>
      </div>
      <div className="form-group" style={{ position: 'relative' }}>
        <label className="form-label">Event Image / Poster</label>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
           <input 
             className="form-input" 
             type="file" 
             accept="image/*" 
             onChange={handleImageUpload} 
             style={{ flex: 1, padding: '7px 12px', cursor: 'pointer', background: 'rgba(255,255,255,0.03)' }} 
           />
           {formData.imageUrl && formData.imageUrl.startsWith('data:image') && (
              <div style={{ width: '38px', height: '38px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', flexShrink: 0, border: '1px solid var(--clr-border-subtle)' }}>
                 <img src={formData.imageUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
           )}
        </div>
        <input className="form-input" type="text" name="imageUrl" value={formData.imageUrl} onChange={handleInputChange} placeholder="...or Paste External URL Here" style={{ fontSize: '0.8rem' }} />
      </div>
    </div>

    <div className="ae-form-row">
      <div className="form-group">
        <label className="form-label">Max Team Size</label>
        <input className="form-input" type="number" name="teamSizeLimit" min="1" max="10" value={formData.teamSizeLimit} onChange={handleInputChange} />
      </div>
      <div className="form-group">
        <label className="form-label">Number of Rounds</label>
        <input className="form-input" type="number" name="rounds" min="1" max="10" value={formData.rounds} onChange={handleInputChange} />
      </div>
      <div className="form-group">
        <label className="form-label">Max Shortlisted Teams (0=∞)</label>
        <input className="form-input" type="number" name="maxShortlisted" min="0" value={formData.maxShortlisted} onChange={handleInputChange} />
      </div>
    </div>

    <div className="ae-form-actions">
        <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Event'}
        </button>
    </div>
  </form>
);

const AdminEvents = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [toast, setToast] = useState({ text: '', type: '' });

  useEffect(() => { 
    fetchEvents(); 
  }, []);

  const showToast = (text, type = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast({ text: '', type: '' }), 3500);
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/admin/events`, { withCredentials: true });
      if (res.data.success) setEvents(res.data.events);
    } catch (err) {
      setError(err.response?.status === 403 ? 'Access Denied. Admin privileges required.' : 'Failed to load events.');
    } finally { setLoading(false); }
  };

  const handleInputChange = e => {
    let { name, value, type, checked } = e.target;
    let val = type === 'checkbox' ? checked : value;
    if (type === 'number') val = parseInt(value) || 0;
    setFormData(f => ({ ...f, [name]: val }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Use FileReader and Canvas to Compress
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const MAX_WIDTH = 800; // max reasonable width
        let width = img.width;
        let height = img.height;
        
        if (width > MAX_WIDTH) {
          height = height * (MAX_WIDTH / width);
          width = MAX_WIDTH;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Compression to 70% quality JPEG payload
        const base64Str = canvas.toDataURL('image/jpeg', 0.8);
        setFormData(f => ({ ...f, imageUrl: base64Str }));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post(`${API_URL}/api/admin/events`, formData, { withCredentials: true });
      showToast('Event created successfully!');
      setShowCreateForm(false);
      setFormData(EMPTY_FORM);
      fetchEvents();
    } catch { showToast('Error creating event.', 'error'); }
    finally { setSubmitting(false); }
  };

  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
  };

  // Remove full-screen early return
  // if (loading) return <Loader fullScreen text="Loading admin panel..." />;

  if (error) return (
    <div className="ae-error animate-fade-in">
      <div className="ae-error-icon">🚫</div>
      <h2>{error}</h2>
      <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
    </div>
  );

  return (
    <div className="ae-wrapper">
      {toast.text && <div className={`ae-toast status-alert ${toast.type}`}>{toast.text}</div>}

      <header className="ae-header glass animate-fade-in">
        <div className="ae-header-left">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/dashboard')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
            Dashboard
          </button>
          <div>
            <h1 className="ae-title">Event Administration</h1>
            <p className="ae-subtitle">{events.length} event{events.length !== 1 ? 's' : ''} total</p>
          </div>
        </div>
        <button 
          className={`btn ${showCreateForm ? 'btn-ghost' : 'btn-primary'}`} 
          onClick={() => { 
            setShowCreateForm(!showCreateForm); 
            setFormData(EMPTY_FORM); 
          }}
        >
          {showCreateForm ? (
            <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> Cancel</>
          ) : (
            <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> New Event</>
          )}
        </button>
      </header>

      {/* Flagship Helix Header */}
      <div className="ae-hero animate-fade-in">
        <span className="ae-hero-badge">
           <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
           ADMINISTRATION POST
        </span>
        <h1 className="ae-hero-title">
           <span className="text-white">HELIX</span><span className="text-accent">26</span>
        </h1>
        <p className="ae-hero-subtitle">Push the boundaries of innovation. Join us for a high-intensity technical showcase from the ECE Association.</p>
      </div>

      {showCreateForm && (
        <div className="ae-form-card glass animate-fade-in ae-form-container" style={{ marginBottom: events.length > 0 ? '2rem' : '0' }}>
          <h2>Create Event</h2>
          <EventForm 
            formData={formData} 
            handleInputChange={handleInputChange} 
            handleImageUpload={handleImageUpload}
            handleSubmit={handleSubmit} 
            submitting={submitting} 
          />
        </div>
      )}

      {loading ? (
        <div style={{ padding: '6rem 0' }}>
          <Loader text="Loading your event command center..." />
        </div>
      ) : events.length === 0 && !showCreateForm ? (
        <div className="ae-empty animate-fade-in">
          <span>📭</span>
          <p>No events yet. Click <strong>New Event</strong> to get started.</p>
        </div>
      ) : (
        <div className="el-grid">
          {events.map((ev, i) => (
            <div 
              key={ev._id} 
              className={`el-card-premium animate-fade-in-up stagger-${Math.min(i + 1, 5)}`}
              onClick={() => navigate(`/admin/events/${ev._id}`)}
              onMouseMove={handleMouseMove}
            >
              {/* Image & Badges */}
              <div className="el-card-image-wrap">
                 <div className="el-card-session-badge">
                   {ev.session && ev.session !== 'none' ? `${ev.session} Session` : 'General'}
                 </div>
                 <div className="el-card-date-badge">
                    <span className="el-date-d">{new Date(ev.date).getDate()}</span>
                    <span className="el-date-m">{new Date(ev.date).toLocaleString('default', { month: 'short' })}</span>
                 </div>
                 <div className="ae-card-status" style={{ top: '12px', right: '65px', zIndex: 10 }}>
                    <span className={`badge ${ev.isPublished ? 'badge-success' : 'badge-muted'}`} style={{ backdropFilter: 'blur(8px)', background: 'rgba(0,0,0,0.5)' }}>
                      {ev.isPublished ? 'Published' : 'Draft'}
                    </span>
                 </div>
                 <img src={ev.imageUrl || "/hero.png"} alt={ev.title} className="el-card-cover" />
                 <div className="el-card-image-overlay" />
              </div>

              {/* Content */}
              <div className="el-card-body">
                <div className="el-reg-badge">
                  {ev.isRegistrationOpen !== false ? (
                    <span className="badge badge-success">🟢 Reg Open</span>
                  ) : (
                    <span className="badge badge-danger">🔴 Reg Closed</span>
                  )}
                </div>
                <h3 className="el-card-title">{ev.title}</h3>
                <p className="el-card-desc">
                  {ev.description.length > 90 ? ev.description.slice(0, 90) + '…' : ev.description}
                </p>
              </div>

              {/* Footer Details */}
              <div className="el-card-footer">
                <div className="meta-icon-group" style={{ marginBottom: '8px' }}>
                  <span>📅 {new Date(ev.date).toLocaleDateString()}</span>
                  <span>📍 {ev.location}</span>
                </div>
                <div className="ae-card-footer" style={{ borderTop: 'none', padding: 0 }}>
                   <span className="badge badge-outline">{ev.rounds} Round{ev.rounds !== 1 ? 's' : ''}</span>
                   <span className="ae-link">Manage →</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminEvents;
