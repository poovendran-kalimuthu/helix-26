import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';
import Loader from './Loader';
import './Dashboard.css'; // Reusing some glass styles
import './EventDetails.css'; // Reusing form styles

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await axios.post(`${API_URL}/api/feedback`, formData);
      if (res.data.success) {
        setMessage({ type: 'success', text: 'Thank you for your feedback!' });
        setTimeout(() => navigate('/dashboard'), 2000);
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to submit feedback' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader fullScreen text="Loading Feedback Form..." />;

  return (
    <div className="db-wrapper">
      <nav className="db-nav glass animate-fade-in">
        <div className="db-nav-brand" onClick={() => navigate('/dashboard')} style={{cursor: 'pointer'}}>
          <div className="db-logo">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <span className="db-brand-name">Spectrum</span>
        </div>
        <div className="db-nav-right">
           <button className="btn btn-ghost" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
        </div>
      </nav>

      <div className="container" style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1rem' }}>
        <div className="glass animate-fade-in-up" style={{ padding: '2rem', borderRadius: '1.5rem' }}>
          <h1 style={{ marginBottom: '0.5rem', color: '#fff' }}>Share Your Experience 📝</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '2rem' }}>Your feedback helps us improve Spectrum and make future events even better.</p>

          {message.text && (
            <div className={`alert alert-${message.type}`} style={{ marginBottom: '1.5rem', padding: '1rem', borderRadius: '0.5rem', background: message.type === 'success' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)', color: '#fff', border: `1px solid ${message.type === 'success' ? '#10b981' : '#ef4444'}` }}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="feedback-form">
            <div className="form-section" style={{ marginBottom: '2.5rem' }}>
              <h3 style={{ color: '#818cf8', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>Event Feedback</h3>
              
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.9)' }}>Select Event</label>
                <select 
                  name="eventId" 
                  className="form-control" 
                  value={formData.eventId} 
                  onChange={handleChange}
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                >
                  <option value="" style={{background: '#1a1a1a'}}>Select an event you participated in</option>
                  {events.map(event => (
                    <option key={event._id} value={event._id} style={{background: '#1a1a1a'}}>{event.title}</option>
                  ))}
                </select>
                <small style={{ color: 'rgba(255,255,255,0.5)', marginTop: '0.3rem', display: 'block' }}>Only events you registered for are shown here.</small>
              </div>

              {formData.eventId && (
                <>
                  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.9)' }}>Event Rating (1-5)</label>
                    <input 
                      type="range" 
                      name="eventRating" 
                      min="1" max="5" 
                      value={formData.eventRating} 
                      onChange={handleChange}
                      style={{ width: '100%', accentColor: '#818cf8' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
                      <span>Poor</span>
                      <span style={{color: '#fbbf24', fontWeight: 'bold'}}>{'⭐'.repeat(formData.eventRating)}</span>
                      <span>Excellent</span>
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.9)' }}>Comments about the Event</label>
                    <textarea 
                      name="eventComments" 
                      className="form-control" 
                      rows="3" 
                      placeholder="What did you like or dislike?"
                      value={formData.eventComments}
                      onChange={handleChange}
                      style={{ width: '100%', padding: '0.8rem', borderRadius: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', resize: 'vertical' }}
                    ></textarea>
                  </div>
                </>
              )}
            </div>

            <div className="form-section" style={{ marginBottom: '2.5rem' }}>
              <h3 style={{ color: '#c084fc', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>Website Feedback</h3>
              
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.9)' }}>Website Experience Rating (1-5)</label>
                <input 
                  type="range" 
                  name="siteRating" 
                  min="1" max="5" 
                  value={formData.siteRating} 
                  onChange={handleChange}
                  style={{ width: '100%', accentColor: '#c084fc' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
                  <span>Poor</span>
                  <span style={{color: '#fbbf24', fontWeight: 'bold'}}>{'⭐'.repeat(formData.siteRating)}</span>
                  <span>Excellent</span>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.9)' }}>Comments about the Website</label>
                <textarea 
                  name="siteComments" 
                  className="form-control" 
                  rows="3" 
                  placeholder="How was your experience using the platform?"
                  value={formData.siteComments}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', resize: 'vertical' }}
                ></textarea>
              </div>
            </div>

            <div className="form-section" style={{ marginBottom: '2.5rem' }}>
              <h3 style={{ color: '#fbbf24', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>General Suggestions</h3>
              <div className="form-group">
                <textarea 
                  name="suggestions" 
                  className="form-control" 
                  rows="4" 
                  placeholder="Any other suggestions for improvement?"
                  value={formData.suggestions}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', resize: 'vertical' }}
                ></textarea>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-block btn-lg" 
              disabled={submitting}
              style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
            >
              {submitting ? 'Submitting...' : (
                <>
                  Submit Feedback
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polyline points="22 2 15 22 11 13 2 9 22 2"/></svg>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Feedback;
