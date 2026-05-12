import React, { useState } from 'react';
import { Shield, Layers } from 'lucide-react';
import Loader from './Loader';
import { API_URL } from '../config';
import './Login.css';

// SVG Cube Cluster — isometric 3D cubes matching reference
const CubeCluster = () => (
  <svg viewBox="0 0 480 420" fill="none" xmlns="http://www.w3.org/2000/svg" className="ln-cube-svg">
    {/* Dark cubes */}
    {/* Top center dark */}
    <g transform="translate(210,20)">
      <polygon points="40,0 80,20 80,60 40,80 0,60 0,20" fill="#1c1f3a" stroke="#0a0a12" strokeWidth="1"/>
      <polygon points="40,0 80,20 80,60 40,40" fill="#2a2e50"/>
      <polygon points="0,20 40,40 40,80 0,60" fill="#14172d"/>
      <text x="36" y="45" fontSize="16" fill="rgba(255,255,255,0.7)" textAnchor="middle">🌐</text>
    </g>
    {/* Mid-left dark */}
    <g transform="translate(80,120)">
      <polygon points="40,0 80,20 80,60 40,80 0,60 0,20" fill="#1c1f3a" stroke="#0a0a12" strokeWidth="1"/>
      <polygon points="40,0 80,20 80,60 40,40" fill="#2a2e50"/>
      <polygon points="0,20 40,40 40,80 0,60" fill="#14172d"/>
    </g>
    {/* Blue cubes */}
    <g transform="translate(160,80)">
      <polygon points="40,0 80,20 80,60 40,80 0,60 0,20" fill="#5564a8" stroke="#3a3f6e" strokeWidth="1"/>
      <polygon points="40,0 80,20 80,60 40,40" fill="#6b7cbf"/>
      <polygon points="0,20 40,40 40,80 0,60" fill="#4050a0"/>
      <text x="36" y="45" fontSize="14" fill="rgba(255,255,255,0.8)" textAnchor="middle">🔑</text>
    </g>
    <g transform="translate(240,120)">
      <polygon points="40,0 80,20 80,60 40,80 0,60 0,20" fill="#5564a8" stroke="#3a3f6e" strokeWidth="1"/>
      <polygon points="40,0 80,20 80,60 40,40" fill="#6b7cbf"/>
      <polygon points="0,20 40,40 40,80 0,60" fill="#4050a0"/>
      <text x="36" y="45" fontSize="13" fill="rgba(255,255,255,0.8)" textAnchor="middle">⚙️</text>
    </g>
    {/* Light/white cubes */}
    <g transform="translate(320,60)">
      <polygon points="40,0 80,20 80,60 40,80 0,60 0,20" fill="#e8e8f5" stroke="#c0c0d8" strokeWidth="1"/>
      <polygon points="40,0 80,20 80,60 40,40" fill="#f5f5ff"/>
      <polygon points="0,20 40,40 40,80 0,60" fill="#d5d5ec"/>
      <text x="36" y="45" fontSize="14" textAnchor="middle">📊</text>
    </g>
    <g transform="translate(360,140)">
      <polygon points="40,0 80,20 80,60 40,80 0,60 0,20" fill="#e8e8f5" stroke="#c0c0d8" strokeWidth="1"/>
      <polygon points="40,0 80,20 80,60 40,40" fill="#f5f5ff"/>
      <polygon points="0,20 40,40 40,80 0,60" fill="#d5d5ec"/>
      <text x="36" y="45" fontSize="14" textAnchor="middle">🔒</text>
    </g>
    {/* Center prominent cluster */}
    <g transform="translate(160,180)">
      <polygon points="50,0 100,25 100,75 50,100 0,75 0,25" fill="#5564a8" stroke="#3a3f6e" strokeWidth="1.5"/>
      <polygon points="50,0 100,25 100,75 50,50" fill="#7080c0"/>
      <polygon points="0,25 50,50 50,100 0,75" fill="#3a4890"/>
      <text x="46" y="58" fontSize="18" fill="rgba(255,255,255,0.9)" textAnchor="middle">☁️</text>
    </g>
    <g transform="translate(240,200)">
      <polygon points="40,0 80,20 80,60 40,80 0,60 0,20" fill="#1c1f3a" stroke="#0a0a12" strokeWidth="1"/>
      <polygon points="40,0 80,20 80,60 40,40" fill="#2a2e50"/>
      <polygon points="0,20 40,40 40,80 0,60" fill="#14172d"/>
      <text x="36" y="45" fontSize="13" fill="rgba(255,255,255,0.8)" textAnchor="middle">⚡</text>
    </g>
    <g transform="translate(300,170)">
      <polygon points="40,0 80,20 80,60 40,80 0,60 0,20" fill="#e8e8f5" stroke="#c0c0d8" strokeWidth="1"/>
      <polygon points="40,0 80,20 80,60 40,40" fill="#f5f5ff"/>
      <polygon points="0,20 40,40 40,80 0,60" fill="#d5d5ec"/>
      <text x="36" y="45" fontSize="13" textAnchor="middle">🔗</text>
    </g>
    {/* Bottom cubes */}
    <g transform="translate(120,280)">
      <polygon points="40,0 80,20 80,60 40,80 0,60 0,20" fill="#5564a8" stroke="#3a3f6e" strokeWidth="1"/>
      <polygon points="40,0 80,20 80,60 40,40" fill="#6b7cbf"/>
      <polygon points="0,20 40,40 40,80 0,60" fill="#4050a0"/>
      <text x="36" y="45" fontSize="13" fill="rgba(255,255,255,0.8)" textAnchor="middle">📈</text>
    </g>
    <g transform="translate(200,300)">
      <polygon points="40,0 80,20 80,60 40,80 0,60 0,20" fill="#e8e8f5" stroke="#c0c0d8" strokeWidth="1"/>
      <polygon points="40,0 80,20 80,60 40,40" fill="#f5f5ff"/>
      <polygon points="0,20 40,40 40,80 0,60" fill="#d5d5ec"/>
    </g>
    <g transform="translate(280,280)">
      <polygon points="40,0 80,20 80,60 40,80 0,60 0,20" fill="#1c1f3a" stroke="#0a0a12" strokeWidth="1"/>
      <polygon points="40,0 80,20 80,60 40,40" fill="#2a2e50"/>
      <polygon points="0,20 40,40 40,80 0,60" fill="#14172d"/>
    </g>
    {/* Floating small dark cube top-right */}
    <g transform="translate(400,20) rotate(15,30,40)">
      <polygon points="30,0 60,15 60,45 30,60 0,45 0,15" fill="#1c1f3a" stroke="#0a0a12" strokeWidth="1"/>
      <polygon points="30,0 60,15 60,45 30,30" fill="#2a2e50"/>
      <polygon points="0,15 30,30 30,60 0,45" fill="#14172d"/>
      <text x="27" y="36" fontSize="12" fill="rgba(255,255,255,0.7)" textAnchor="middle">♾️</text>
    </g>
    {/* Floating cube bottom-right */}
    <g transform="translate(420,300) rotate(-10,30,40)">
      <polygon points="30,0 60,15 60,45 30,60 0,45 0,15" fill="#e8e8f5" stroke="#c0c0d8" strokeWidth="1"/>
      <polygon points="30,0 60,15 60,45 30,30" fill="#f5f5ff"/>
      <polygon points="0,15 30,30 30,60 0,45" fill="#d5d5ec"/>
      <text x="27" y="36" fontSize="12" textAnchor="middle">🛡️</text>
    </g>
    {/* Shadow/reflection blur effect */}
    <ellipse cx="250" cy="400" rx="160" ry="20" fill="rgba(91,110,245,0.08)"/>
  </svg>
);

// Decorative circles SVG
const GeometricBg = () => (
  <svg viewBox="0 0 700 600" fill="none" xmlns="http://www.w3.org/2000/svg" className="ln-geo-bg" preserveAspectRatio="xMidYMid slice">
    {/* Large circle top-right */}
    <circle cx="580" cy="80" r="200" stroke="rgba(0,0,0,0.07)" strokeWidth="1.5" fill="none"/>
    <circle cx="580" cy="80" r="140" stroke="rgba(91,110,245,0.12)" strokeWidth="1" fill="none"/>
    {/* Arc top-right (partial) */}
    <path d="M 680 -20 A 200 200 0 0 1 500 180" stroke="rgba(0,0,0,0.1)" strokeWidth="2" fill="none"/>
    {/* Vertical line right */}
    <line x1="660" y1="0" x2="660" y2="600" stroke="rgba(0,0,0,0.15)" strokeWidth="2"/>
    {/* Circle bottom-left */}
    <circle cx="180" cy="460" r="120" stroke="rgba(91,110,245,0.12)" strokeWidth="1.5" fill="none"/>
    {/* Small circle left side */}
    <circle cx="60" cy="280" r="40" stroke="rgba(0,0,0,0.06)" strokeWidth="1" fill="none"/>
    {/* Dot accent */}
    <circle cx="450" cy="310" r="4" fill="#5b6ef5"/>
  </svg>
);

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [showTip, setShowTip] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => setShowTip(true), 8000);
    window.location.href = `${API_URL}/api/auth/google`;
  };

  return (
    <div className="ln-wrapper">
      {loading && (
        <Loader
          fullScreen
          text={showTip ? 'Waking up server… (Render free tier takes ~30s)' : 'Redirecting to Google…'}
        />
      )}

      {/* ── Geometric background decoration ── */}
      <GeometricBg />

      {/* ── Navigation ── */}
      <nav className="ln-nav animate-fade-in">
        <div className="ln-nav-left">
          <button className="ln-hamburger" aria-label="Menu">
            <span/><span/>
          </button>
        </div>
        <div className="ln-brand">
          <div className="ln-logo">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <span>Spectrum</span>
        </div>
        <div className="ln-nav-right" />
      </nav>

      {/* ── Hero Content ── */}
      <main className="ln-hero">
        {/* Left: Copy */}
        <div className="ln-left animate-fade-in-up">
          {/* Label row */}
          <div className="ln-label">
            <span className="ln-arrow">→</span>
            the best platform for college events
          </div>

          {/* Big headline */}
          <h1 className="ln-headline">
            <span className="ln-headline-line1">Manage your</span>
            <span className="ln-headline-line2">
              <span className="ln-pill-word">events</span>
              <span className="ln-headline-word"> seamlessly</span>
              <span className="ln-dot">.</span>
            </span>
          </h1>

          {/* Sub copy */}
          <p className="ln-sub animate-fade-in-up stagger-2">
            Instant registration, team management, and real-time<br/>
            updates — all in one campus platform.
          </p>

          {/* CTAs */}
          <div className="ln-actions animate-fade-in-up stagger-3">
            <button className="ln-btn-primary" onClick={handleLogin}>
              sign in
              <span className="ln-btn-arrow">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M7 17L17 7M17 7H7M17 7v10"/>
                </svg>
              </span>
            </button>
            <button className="ln-btn-secondary" onClick={handleLogin}>
              get started
            </button>
          </div>

          {/* Security note */}
          <div className="ln-security animate-fade-in-up stagger-4">
            <Shield size={12} strokeWidth={2} />
            Protected by Google OAuth 2.0
          </div>
        </div>

        {/* Right: 3D Cube Illustration */}
        <div className="ln-right animate-scale-in stagger-1">
          <CubeCluster />
        </div>
      </main>
    </div>
  );
};

export default Login;
