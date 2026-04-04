import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  MessageSquare, 
  Star, 
  Send, 
  ArrowLeft, 
  CheckCircle, 
  Lightbulb,
  Globe,
  Trophy
} from 'lucide-react';
import { API_URL } from '../config';
import Loader from './Loader';
import './Dashboard.css';

const Feedback = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    eventId: '',
    eventRating: 5,
    siteRating: 5,
    eventComments: '',
    siteComments: '',
    suggestions: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserEvents();
  }, []);

  const fetchUserEvents = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/feedback/user-events`);
      if (res.data.success) {
        setEvents(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const setRating = (name, val) => {
    setFormData({ ...formData, [name]: val });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await axios.post(`${API_URL}/api/feedback`, formData);
      if (res.data.success) {
        setMessage({ type: 'success', text: 'Thank you! Your feedback has been recorded.' });
        setTimeout(() => navigate('/dashboard'), 2500);
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to submit feedback' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader fullScreen text="Preparing your feedback form..." />;

  const StarRating = ({ value, name, label, color }) => (
    <div className="rating-container" style={{ marginBottom: '1.5rem' }}>
      <label style={{ display: 'block', marginBottom: '0.8rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', fontWeight: '500' }}>
        {label}
      </label>
      <div style={{ display: 'flex', gap: '10px' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(name, star)}
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer', 
              padding: '5px',
              transition: 'transform 0.2s',
              transform: star <= value ? 'scale(1.2)' : 'scale(1)'
            }}
          >
            <Star 
              size={28} 
              fill={star <= value ? color : 'transparent'} 
              stroke={star <= value ? color : 'rgba(255,255,255,0.2)'} 
              style={{ filter: star <= value ? `drop-shadow(0 0 8px ${color}44)` : 'none' }}
            />
          </button>
        ))}
        <span style={{ marginLeft: '10px', fontSize: '1.2rem', fontWeight: '800', color: starRatingColor(value) }}>
          {value}/5
        </span>
      </div>
    </div>
  );

  const starRatingColor = (val) => {
    if (val >= 4) return '#10b981';
    if (val >= 3) return '#fbbf24';
    return '#ef4444';
  };

  return (
    <div className="db-wrapper" style={{ background: 'radial-gradient(circle at top left, rgba(99, 102, 241, 0.05), transparent 40%)' }}>
      {/* ── Navbar ── */}
      <nav className="db-nav glass animate-fade-in">
        <div className="db-nav-brand" onClick={() => navigate('/dashboard')} style={{cursor: 'pointer'}}>
          <div className="db-logo">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <span className="db-brand-name">Spectrum</span>
        </div>
        <div className="db-nav-right">
           <button className="btn btn-ghost btn-sm" onClick={() => navigate('/dashboard')} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
             <ArrowLeft size={16} /> Back
           </button>
        </div>
      </nav>

      <div className="container" style={{ maxWidth: '850px', margin: '4rem auto', padding: '0 1.5rem' }}>
        <div className="glass animate-fade-in-up" style={{ padding: '3rem', borderRadius: '2rem', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ display: 'inline-flex', padding: '1rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '1.5rem', color: '#818cf8', marginBottom: '1.5rem' }}>
              <MessageSquare size={32} />
            </div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>Help Us Grow 🚀</h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.1rem' }}>Your insights shape the future of Spectrum and our engineering community.</p>
          </div>

          {message.text && (
            <div className="animate-fade-in" style={{ marginBottom: '2rem', padding: '1.2rem', borderRadius: '1rem', background: message.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${message.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`, color: '#fff', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {message.type === 'success' ? <CheckCircle size={20} color="#10b981" /> : <div style={{color: '#ef4444'}}>⚠️</div>}
              <span style={{ fontWeight: '500' }}>{message.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Section 1: Event Experience */}
            <div className="form-section animate-fade-in-up stagger-1" style={{ marginBottom: '3rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <Trophy size={20} color="#818cf8" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#818cf8' }}>Event Experience</h3>
              </div>
              
              <div className="form-group" style={{ marginBottom: '2rem' }}>
                <label className="form-label">Which event did you participate in?</label>
                <div style={{ position: 'relative' }}>
                  <select 
                    name="eventId" 
                    className="form-control glass" 
                    value={formData.eventId} 
                    onChange={handleChange}
                    style={{ width: '100%', padding: '1rem 1.2rem', borderRadius: '1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', appearance: 'none', cursor: 'pointer' }}
                  >
                    <option value="" style={{background: '#0a0a0a'}}>General Website Feedback Only</option>
                    {events.map(event => (
                      <option key={event._id} value={event._id} style={{background: '#0a0a0a'}}>{event.title}</option>
                    ))}
                  </select>
                  <div style={{ position: 'absolute', right: '1.2rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', opacity: 0.5 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                  </div>
                </div>
              </div>

              {formData.eventId && (
                <div className="animate-fade-in">
                  <StarRating 
                    label="Rate the event organization and experience" 
                    name="eventRating" 
                    value={formData.eventRating} 
                    color="#818cf8"
                  />
                  <div className="form-group">
                     <textarea 
                      name="eventComments" 
                      className="form-control glass" 
                      rows="3" 
                      placeholder="What was the best part of this event? Any technical glitches?"
                      value={formData.eventComments}
                      onChange={handleChange}
                      style={{ width: '100%', padding: '1.2rem', borderRadius: '1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', resize: 'none' }}
                    ></textarea>
                  </div>
                </div>
              )}
            </div>

            {/* Section 2: Platform Feedback */}
            <div className="form-section animate-fade-in-up stagger-2" style={{ marginBottom: '3rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <Globe size={20} color="#a855f7" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#a855f7' }}>Platform & Website</h3>
              </div>
              
              <StarRating 
                label="How would you rate the Spectrum portal?" 
                name="siteRating" 
                value={formData.siteRating} 
                color="#a855f7"
              />

              <div className="form-group">
                <textarea 
                  name="siteComments" 
                  className="form-control glass" 
                  rows="3" 
                  placeholder="How was the registration process? Was the dashboard helpful?"
                  value={formData.siteComments}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '1.2rem', borderRadius: '1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', resize: 'none' }}
                ></textarea>
              </div>
            </div>

            {/* Section 3: Vision */}
            <div className="form-section animate-fade-in-up stagger-3" style={{ marginBottom: '3.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <Lightbulb size={20} color="#fbbf24" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#fbbf24' }}>Suggestions for HELIX'26</h3>
              </div>
              <div className="form-group">
                 <textarea 
                  name="suggestions" 
                  className="form-control glass" 
                  rows="4" 
                  placeholder="Any features you'd like to see next? Or events we should bring back?"
                  value={formData.suggestions}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '1.2rem', borderRadius: '1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', resize: 'none' }}
                ></textarea>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-block animate-fade-in-up stagger-4" 
              disabled={submitting}
              style={{ width: '100%', padding: '1.2rem', borderRadius: '1.2rem', fontSize: '1.2rem', fontWeight: '800', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.8rem', boxShadow: '0 10px 30px rgba(99, 102, 241, 0.4)', background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}
            >
              {submitting ? 'Transmitting Data...' : (
                <>
                  Submit Response <Send size={20} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .rating-container button:hover {
          transform: scale(1.3) !important;
        }
        .form-control:focus {
           background: rgba(255,255,255,0.06) !important;
           border-color: rgba(129, 140, 248, 0.4) !important;
           outline: none;
        }
      `}} />
    </div>
  );
};

export default Feedback;
