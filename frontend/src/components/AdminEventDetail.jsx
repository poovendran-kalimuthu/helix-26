import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';
import Loader from './Loader';
import './AdminEvents.css'; // Reuse existing admin styles

const AdminEventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({});
  const [toast, setToast] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const showToast = (text, type = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast({ text: '', type: '' }), 3500);
  };

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/admin/events`, { withCredentials: true });
      if (res.data.success) {
        const ev = res.data.events.find(e => e._id === id);
        if (ev) {
          setEvent(ev);
          setFormData({
            title: ev.title,
            description: ev.description,
            date: new Date(ev.date).toISOString().split('T')[0],
            location: ev.location,
            teamSizeLimit: ev.teamSizeLimit,
            maxShortlisted: ev.maxShortlisted || 0,
            session: ev.session || 'none',
            rounds: ev.rounds || 1,
            roundConfig: ev.roundConfig && ev.roundConfig.length > 0 ? ev.roundConfig.map(r => ({ ...r, maxAdvance: r.maxAdvance || 0 })) : [
              { roundNumber: 1, name: '', evaluationType: 'admin', criteria: [{ name: 'Overall', maxScore: 10 }], maxAdvance: 0 }
            ],
            imageUrl: ev.imageUrl || '',
            isPublished: ev.isPublished,
            isRegistrationOpen: ev.isRegistrationOpen !== undefined ? ev.isRegistrationOpen : true,
            isTeamChangeAllowed: ev.isTeamChangeAllowed !== undefined ? ev.isTeamChangeAllowed : true,
            attendanceMode: ev.attendanceMode || 'student_scan'
          });
        }
      }
    } catch (err) {
      showToast('Failed to load event.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = e => {
    let { name, value, type, checked } = e.target;
    let val = type === 'checkbox' ? checked : value;
    if (type === 'number') val = parseInt(value) || 0;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

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

        const base64Str = canvas.toDataURL('image/jpeg', 0.8);
        setFormData(prev => ({ ...prev, imageUrl: base64Str }));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Round Builder Handlers
  const addRound = () => {
    setFormData(prev => {
      const newRoundNumber = (prev.roundConfig ? prev.roundConfig.length : 0) + 1;
      const newConfig = [...(prev.roundConfig || []), { 
        roundNumber: newRoundNumber, name: '', evaluationType: 'admin', criteria: [{ name: 'Overall', maxScore: 10 }], maxAdvance: 0
      }];
      return { ...prev, roundConfig: newConfig, rounds: newConfig.length };
    });
  };

  const removeRound = (index) => {
    setFormData(prev => {
      const newConfig = prev.roundConfig.filter((_, i) => i !== index).map((r, i) => ({ ...r, roundNumber: i + 1 }));
      return { ...prev, roundConfig: newConfig, rounds: newConfig.length };
    });
  };

  const handleRoundChange = (index, field, value) => {
    setFormData(prev => {
      const newConfig = [...prev.roundConfig];
      newConfig[index][field] = value;
      return { ...prev, roundConfig: newConfig };
    });
  };

  const addCriteria = (roundIndex) => {
    setFormData(prev => {
      const newConfig = [...prev.roundConfig];
      newConfig[roundIndex].criteria.push({ name: '', maxScore: 10 });
      return { ...prev, roundConfig: newConfig };
    });
  };

  const removeCriteria = (roundIndex, critIndex) => {
    setFormData(prev => {
      const newConfig = [...prev.roundConfig];
      newConfig[roundIndex].criteria = newConfig[roundIndex].criteria.filter((_, i) => i !== critIndex);
      return { ...prev, roundConfig: newConfig };
    });
  };

  const handleCriteriaChange = (roundIndex, critIndex, field, value) => {
    setFormData(prev => {
      const newConfig = [...prev.roundConfig];
      newConfig[roundIndex].criteria[critIndex][field] = value;
      return { ...prev, roundConfig: newConfig };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.put(`${API_URL}/api/admin/events/${id}`, formData, { withCredentials: true });
      showToast('Event updated successfully!');
      fetchEvent();
    } catch {
      showToast('Error saving event.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) return;
    try {
      setSubmitting(true);
      await axios.delete(`${API_URL}/api/admin/events/${id}`, { withCredentials: true });
      showToast('Event deleted successfully!');
      setTimeout(() => navigate('/admin/events'), 1500);
    } catch {
      showToast('Error deleting event.', 'error');
      setSubmitting(false);
    }
  };

  // Remove full-screen early return
  // if (loading) return <Loader fullScreen text="Loading event details..." />;
  if (!loading && !event) return <div className="ae-error"><h2>Event not found</h2><button onClick={() => navigate('/admin/events')}>Back</button></div>;

  return (
    <div className="ae-wrapper">
      {toast.text && <div className={`ae-toast status-alert ${toast.type}`}>{toast.text}</div>}
      
      <header className="ae-header glass">
        <div className="ae-header-left">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin/events')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
            Back to All Events
          </button>
          <h1 className="ae-title">Edit Event: {event?.title}</h1>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button className="btn btn-danger" onClick={handleDelete} disabled={submitting}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
            Delete
          </button>
          <button className="btn btn-accent" onClick={() => navigate(`/admin/events/${id}/participants`)}>
            Manage Participants & Rounds
          </button>
        </div>
      </header>

      {loading ? (
        <div style={{ padding: '6rem 0' }}>
          <Loader text="Loading your event command center..." />
        </div>
      ) : (
        <div className="ae-form-card glass animate-fade-in ae-form-container">
        <form onSubmit={handleSubmit} className="ae-form">
          <div className="ae-form-row">
            <div className="form-group" style={{ flex: 2 }}>
              <label className="form-label">Event Title *</label>
              <input className="form-input" type="text" name="title" required value={formData.title} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Date *</label>
              <input className="form-input" type="date" name="date" required value={formData.date} onChange={handleInputChange} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea className="form-textarea" name="description" required value={formData.description} onChange={handleInputChange} rows={5} />
          </div>

          <div className="ae-form-row">
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Location *</label>
              <input className="form-input" type="text" name="location" required value={formData.location} onChange={handleInputChange} />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Session Slot</label>
              <select className="form-select" name="session" value={formData.session} onChange={handleInputChange}>
                <option value="none">No Session (Generic)</option>
                <option value="day1_morning">Day 1: 9:00 AM - 1:00 PM</option>
                <option value="day1_afternoon">Day 1: 2:00 PM - 4:00 PM</option>
                <option value="day2_morning">Day 2: 9:00 AM - 1:00 PM</option>
              </select>
            </div>
          </div>

          <div className="ae-form-row">
            <div className="form-group" style={{ flex: 1, position: 'relative' }}>
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
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Max Team Size</label>
              <input className="form-input" type="number" name="teamSizeLimit" min="1" max="10" value={formData.teamSizeLimit} onChange={handleInputChange} />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Max Shortlisted Teams (0=∞)</label>
              <input className="form-input" type="number" name="maxShortlisted" min="0" value={formData.maxShortlisted || 0} onChange={handleInputChange} />
            </div>
          </div>

          <div className="ae-card-separator">Secondary Settings</div>
          <div className="ae-form-row">
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Attendance System Mode</label>
              <select className="form-select" name="attendanceMode" value={formData.attendanceMode} onChange={handleInputChange}>
                <option value="student_scan">Student Scans Admin (Traditional)</option>
                <option value="admin_scan">Admin Scans Student (Speedy)</option>
                <option value="both">Both (Maximum Flexibility)</option>
              </select>
              <small style={{ color: 'var(--clr-text-muted)', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                * Admin scanning requires students to show their personal QR codes.
              </small>
            </div>
          </div>

          <div className="ae-card-separator">Rounds & Evaluation Setup</div>
  <div className="ae-rounds-builder">
    {formData?.roundConfig && formData.roundConfig.map((round, rIndex) => (
      <div key={rIndex} className="ae-round-card glass-strong">
        <div className="ae-round-header">
          <h4>Round {round.roundNumber}</h4>
          {formData.roundConfig.length > 1 && (
            <button type="button" className="btn btn-xs btn-danger" onClick={() => removeRound(rIndex)}>✕ Remove</button>
          )}
        </div>
        
        <div className="ae-form-row">
          <div className="form-group">
            <label className="form-label">Round Name</label>
            <input className="form-input" type="text" placeholder="e.g. Ideation Phase" 
              value={round.name} onChange={e => handleRoundChange(rIndex, 'name', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Evaluation Type</label>
            <select className="form-select" value={round.evaluationType} onChange={e => handleRoundChange(rIndex, 'evaluationType', e.target.value)}>
              <option value="admin">Admin (Internal)</option>
              <option value="jury">Jury (External Evaluators)</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Max Advancement Limit</label>
            <input className="form-input" type="number" placeholder="Max teams to move" 
              value={round.maxAdvance} onChange={e => handleRoundChange(rIndex, 'maxAdvance', parseInt(e.target.value) || 0)} min="0" />
          </div>
        </div>

        <div className="ae-criteria-section">
          <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>Scoring Criteria</label>
          {round.criteria.map((crit, cIndex) => (
            <div key={cIndex} className="ae-criteria-row">
              <input className="form-input" type="text" placeholder="Criteria Name (e.g. Design)" 
                value={crit.name} onChange={e => handleCriteriaChange(rIndex, cIndex, 'name', e.target.value)} required />
              <input className="form-input" type="number" placeholder="Max Score" style={{ width: '100px' }}
                value={crit.maxScore} onChange={e => handleCriteriaChange(rIndex, cIndex, 'maxScore', e.target.value)} required min="1" />
              <button type="button" className="btn btn-ghost btn-xs" onClick={() => removeCriteria(rIndex, cIndex)}>✕</button>
            </div>
          ))}
          <button type="button" className="btn btn-outline btn-xs" style={{ marginTop: '8px' }} onClick={() => addCriteria(rIndex)}>
            + Add Criteria
          </button>
        </div>
      </div>
    ))}
    
    <button type="button" className="btn btn-secondary btn-sm" style={{ width: '100%', marginTop: '10px' }} onClick={addRound}>
      + Add Another Round
    </button>
  </div>

  <div className="ae-card-separator">Event Settings</div>
  
  <div className="ae-toggle-row">
    {[
      { name: 'isPublished', label: 'Published', desc: 'Visible to students', icon: '👁️' },
      { name: 'isRegistrationOpen', label: 'Registrations Open', desc: 'Allow new sign-ups', icon: '📝' },
      { name: 'isTeamChangeAllowed', label: 'Team Changes Allowed', desc: 'Allow teammate edits', icon: '👥' },
    ].map(t => (
      <label key={t.name} className={`ae-toggle-item ${formData[t.name] ? 'active' : ''}`}>
        <div className="ae-toggle-info">
          <span>{t.icon} {t.label}</span>
          <small>{t.desc}</small>
        </div>
        <div className="ae-toggle-switch">
          <input type="checkbox" name={t.name} checked={formData[t.name]} onChange={handleInputChange} style={{ display: 'none' }} />
          <div className="ae-switch-track">
            <div className="ae-switch-thumb" />
          </div>
        </div>
      </label>
    ))}
  </div>

  <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '20px' }} disabled={submitting}>
    {submitting ? 'Saving Changes...' : 'Update Event Details'}
  </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminEventDetail;
