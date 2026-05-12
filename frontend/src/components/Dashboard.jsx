import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Loader from './Loader';
import { API_URL } from '../config';
import AttendanceScanner from './AttendanceScanner';
import './Dashboard.css';

axios.defaults.withCredentials = true;

const StatCard = ({ icon, label, value, bg }) => (
  <div className="stat-card animate-fade-in-up">
    <div className="stat-icon" style={{ background: bg || '#eff6ff' }}>{icon}</div>
    <div style={{ minWidth: 0 }}>
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [events, setEvents] = useState([]);
  const [activeScanner, setActiveScanner] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { fetchUser(); }, []);

  const fetchUser = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/auth/login/success`);
      if (res.data.success) {
        const u = res.data.user;
        const redirectUrl = sessionStorage.getItem('authRedirectUrl');
        if (redirectUrl) { sessionStorage.removeItem('authRedirectUrl'); navigate(redirectUrl); return; }
        if (!u.isProfileComplete) { navigate('/complete-profile'); return; }
        setUser(u);
        fetchEvents();
      } else { navigate('/login'); }
    } catch { navigate('/login'); }
    finally { setLoading(false); }
  };

  const fetchEvents = async () => {
    setEventsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/events`);
      if (res.data.success) setEvents(res.data.events);
    } catch (error) { console.error('Error fetching events:', error); }
    finally { setEventsLoading(false); }
  };

  const handleLogout = () => { window.location.href = `${API_URL}/api/auth/logout`; };

  if (loading) return <Loader fullScreen text="Loading..." />;

  const initials = (user?.name?.split(' ') || []).map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="db-wrapper">
      {/* ── Navbar ── */}
      <nav className="db-nav animate-fade-in">
        <div className="db-nav-brand" onClick={() => navigate('/dashboard')}>
          <div className="db-logo">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="db-brand-name">Spectrum</span>
        </div>

        {/* Desktop Links */}
        <div className="db-nav-center">
          <button className="db-nav-link active" onClick={() => navigate('/dashboard')}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
            Dashboard
          </button>
          <button className="db-nav-link" onClick={() => navigate('/events')}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Events
          </button>
          <button className="db-nav-link" onClick={() => navigate('/feedback')}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            Feedback
          </button>
          {(user?.role === 'admin' || user?.role === 'coordinator') && (
            <button className="db-nav-link" onClick={() => navigate('/admin/events')}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>
              Admin
            </button>
          )}
        </div>

        {/* Right */}
        <div className="db-nav-right">
          <span className="db-greeting hide-mobile">Hi, {user?.name?.split(' ')[0]}</span>
          <div className="db-avatar-wrap">
            {user?.profilePicture
              ? <img src={user.profilePicture} alt="Avatar" className="db-avatar" />
              : <div className="db-avatar-init">{initials}</div>
            }
            <div className="db-online-dot" />
          </div>
          <button className="btn btn-icon btn-ghost db-logout" onClick={handleLogout} title="Logout">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </button>
          <button className="db-hamburger" onClick={() => setMobileOpen(o => !o)} aria-label="Menu">
            <span/><span/><span/>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`db-mobile-menu ${mobileOpen ? 'open' : ''}`}>
        {[
          { label: 'Dashboard', path: '/dashboard', active: true },
          { label: 'Events', path: '/events' },
          { label: 'Feedback', path: '/feedback' },
          ...(user?.role === 'admin' || user?.role === 'coordinator' ? [{ label: 'Admin Panel', path: '/admin/events' }] : []),
          { label: 'Edit Profile', path: '/edit-profile' },
        ].map(item => (
          <button key={item.path} className={`db-mobile-link ${item.active ? 'active' : ''}`}
            onClick={() => { navigate(item.path); setMobileOpen(false); }}>
            {item.label}
          </button>
        ))}
        <button className="db-mobile-link" style={{ color: 'var(--clr-danger)' }} onClick={handleLogout}>
          Sign out
        </button>
      </div>

      {/* ── Main Content ── */}
      <main className="db-content">
        {/* Hero */}
        <header className="db-hero animate-fade-in-up">
          <div className="db-hero-text">
            <span className="db-hero-badge">
              <span className="db-hero-dot" />
              {user?.department} · {user?.year} Year
            </span>
            <h1>Welcome back, <span className="db-hero-name">{user?.name?.split(' ')[0]}</span></h1>
            <p>Your student portal for events, teams, and college life.</p>
          </div>
          <div className="db-hero-actions">
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/events')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              Browse Events
            </button>
            <button className="btn btn-secondary btn-lg" onClick={() => navigate('/edit-profile')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Edit Profile
            </button>
          </div>
        </header>

        {/* Stats */}
        <section className="db-stats">
          <StatCard icon="🎯" label="Upcoming Events" value={events.length || '—'} bg="#eff6ff" />
          <StatCard icon="🎓" label="Department"      value={user?.department || '—'} bg="#f5f3ff" />
          <StatCard icon="📅" label="Year & Section"  value={user?.year && user?.section ? `${user.year} / ${user.section}` : '—'} bg="#f0fdf4" />
          <StatCard icon="📋" label="Roll No"         value={user?.registerNumber || '—'} bg="#fffbeb" />
        </section>

        {/* Events */}
        <section className="db-events-section animate-fade-in-up stagger-1">
          <div className="db-section-header">
            <div>
              <h2>Explore Events</h2>
              <p>Don't miss out on the latest technical and cultural showcases.</p>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/events')}>View All</button>
          </div>

          {eventsLoading ? (
            <div style={{ padding: '3rem 0', display: 'flex', justifyContent: 'center' }}>
              <Loader text="Fetching events..." />
            </div>
          ) : events.length === 0 ? (
            <div className="db-empty-state">
              <span style={{ fontSize: '2.5rem' }}>🎭</span>
              <h3>No events available yet</h3>
              <p>Check back soon for upcoming HELIX'26 highlights!</p>
            </div>
          ) : (
            <div className="db-event-grid">
              {events.map((ev, i) => (
                <div key={ev._id} className={`db-event-card animate-fade-in-up stagger-${Math.min(i + 1, 5)}`}
                  onClick={() => navigate(`/events/${ev._id}`)}>
                  <div className="db-card-img-wrap">
                    <div className="db-card-session">
                      {ev.session && ev.session !== 'none' ? ev.session : 'General'}
                    </div>
                    {ev.activeAttendance?.sessionToken && (
                      <div className="db-attendance-pulse" onClick={e => { e.stopPropagation(); setActiveScanner(ev._id); }}>
                        <span className="pulse-dot" />
                        Check-in Active
                      </div>
                    )}
                    <img src={ev.imageUrl || '/hero.png'} alt={ev.title} className="db-card-img" />
                    <div className="db-card-date">
                      <span className="db-day">{new Date(ev.date).getDate()}</span>
                      <span className="db-month">{new Date(ev.date).toLocaleString('default', { month: 'short' })}</span>
                    </div>
                  </div>
                  <div className="db-card-content">
                    <h3 className="db-card-title">{ev.title}</h3>
                    <div className="db-card-meta">
                      <span>📍 {ev.location}</span>
                      <span>👥 {ev.teamSizeLimit} Members</span>
                    </div>
                    <button className="btn btn-secondary btn-sm btn-block">View Details</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Attendance Scanner Modal */}
      {activeScanner && (
        <div className="db-scanner-overlay" onClick={() => setActiveScanner(null)}>
          <div onClick={e => e.stopPropagation()}>
            <AttendanceScanner
              eventId={activeScanner}
              onComplete={() => { setActiveScanner(null); fetchEvents(); }}
              onCancel={() => setActiveScanner(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
