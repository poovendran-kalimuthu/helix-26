import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Loader from './Loader';
import { API_URL } from '../config';
import './EventsList.css';

const EventsList = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/events`, { withCredentials: true });
        if (res.data.success) setEvents(res.data.events);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const filtered = events.filter(e =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="el-wrapper">
      {/* ── Compact Nav ── */}
      <nav className="el-nav">
        <button className="el-nav-back" onClick={() => navigate('/dashboard')}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          Dashboard
        </button>
        <span style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--clr-text-heading)', letterSpacing: '-0.01em' }}>
          Events
        </span>
        <div style={{ width: 90 }} />
      </nav>

      {/* ── Content ── */}
      <div className="el-content">
        {/* Hero */}
        <header className="el-hero animate-fade-in">
          <span className="el-hero-badge">
            <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
            Registration Portal
          </span>
          <h1 className="el-hero-title">
            <span>HELIX</span><span className="text-accent">'26</span>
          </h1>
          <p className="el-hero-subtitle">
            Push the boundaries of innovation. Join us for a high-intensity technical showcase from the ECE Association.
          </p>
        </header>

        {/* Search */}
        <div className="el-search-row animate-fade-in-up">
          <div className="el-search-box">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="el-search-icon">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Search events or locations..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="el-search-input"
            />
            {search && (
              <button className="el-search-clear" onClick={() => setSearch('')}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            )}
          </div>
          <span className="el-count">{filtered.length} event{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ padding: '4rem 0', display: 'flex', justifyContent: 'center' }}>
            <Loader text="Loading events..." />
          </div>
        ) : filtered.length === 0 ? (
          <div className="el-empty animate-fade-in">
            <span>🔍</span>
            <h3>{search ? 'No events match your search' : 'No events published yet'}</h3>
            <p>{search ? 'Try a different keyword' : 'Check back later!'}</p>
          </div>
        ) : (
          <div className="el-grid">
            {filtered.map((ev, i) => (
              <div
                key={ev._id}
                className={`el-card-premium animate-fade-in-up stagger-${Math.min(i + 1, 5)}`}
                onClick={() => navigate(`/events/${ev._id}`)}
              >
                {/* Image */}
                <div className="el-card-image-wrap">
                  <div className="el-card-session-badge">
                    {ev.session && ev.session !== 'none' ? `${ev.session} Session` : 'General'}
                  </div>
                  <div className="el-card-date-badge">
                    <span className="el-date-d">{new Date(ev.date).getDate()}</span>
                    <span className="el-date-m">{new Date(ev.date).toLocaleString('default', { month: 'short' })}</span>
                  </div>
                  <img src={ev.imageUrl || '/hero.png'} alt="Event Cover" className="el-card-cover" />
                  <div className="el-card-image-overlay" />
                </div>

                {/* Body */}
                <div className="el-card-body">
                  <div className="el-reg-badge">
                    {ev.isRegistrationOpen !== false
                      ? <span className="badge badge-success">Open</span>
                      : <span className="badge badge-danger">Closed</span>
                    }
                  </div>
                  <h3 className="el-card-title">{ev.title}</h3>
                  <p className="el-card-desc">
                    {ev.description.length > 90 ? ev.description.slice(0, 90) + '…' : ev.description}
                  </p>
                </div>

                {/* Footer */}
                <div className="el-card-footer">
                  <div className="el-card-meta">
                    <div className="meta-icon-group">
                      <span>📅 {new Date(ev.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                    </div>
                    <div className="meta-icon-group">
                      <span>📍 {ev.location}</span>
                      <span>👥 Team of {ev.teamSizeLimit}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsList;
