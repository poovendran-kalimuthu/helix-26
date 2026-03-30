import { Shield, Zap, Users, Radio, Layers, MoveRight } from 'lucide-react';
import './Login.css';
import Loader from './Loader';
import { API_URL } from '../config';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [showTip, setShowTip] = useState(false);

  // Show a 'cold start' tip if redirect takes too long (Render free tier)
  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => setShowTip(true), 8000); // 8 seconds delay
    window.location.href = `${API_URL}/api/auth/google`;
  };

  return (
    <div className="ln-wrapper">
      {loading && (
        <Loader 
          fullScreen 
          text={showTip ? "Waking up server... (Render free tier takes ~30s)" : "Redirecting to Google..."} 
        />
      )}

      {/* Left Panel */}
      <div className="ln-left animate-fade-in">
        <div className="ln-brand">
          <div className="ln-logo">
            <Layers size={22} color="white" strokeWidth={2} />
          </div>
          <span>Spectrum</span>
        </div>

        <div className="ln-left-content">
          <div className="ln-badge animate-fade-in stagger-1">🎓 College Association Platform</div>
          <h1 className="ln-headline animate-fade-in-up stagger-2">
            Your campus,<br />
            <span className="ln-headline-accent">connected.</span>
          </h1>
          <p className="ln-tagline animate-fade-in-up stagger-3">
            Join events, form teams, and collaborate with peers across all departments.
          </p>

          <div className="ln-features animate-fade-in-up stagger-4">
            {[
              { icon: <Zap size={18} />, title: 'Instant Registration', desc: 'Sign up for events in seconds' },
              { icon: <Users size={18} />, title: 'Team Builder', desc: 'Find teammates by roll number' },
              { icon: <Radio size={18} />, title: 'Live Updates', desc: 'Admin-powered event management' },
            ].map((f, i) => (
              <div key={i} className="ln-feature">
                <div className="ln-feature-icon">{f.icon}</div>
                <div>
                  <strong>{f.title}</strong>
                  <span>{f.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Decorative blobs */}
        <div className="ln-blob ln-blob-1" />
        <div className="ln-blob ln-blob-2" />
      </div>

      {/* Right Panel (Card) */}
      <div className="ln-right">
        <div className="ln-card glass-strong animate-scale-in">
          <div className="ln-card-header">
            <div className="ln-card-logo">
              <Layers size={28} color="white" strokeWidth={1.5} />
            </div>
            <h2>Welcome back</h2>
            <p>Sign in to your Spectrum account</p>
          </div>

          <button className="ln-google-btn" onClick={handleLogin}>
            <svg className="ln-google-icon" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20c11.045 0 20-8.955 20-20 0-1.341-.138-2.65-.389-3.917z"/>
              <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
              <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
              <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
            </svg>
            Continue with Google
          </button>

          <div className="ln-divider"><span>Secure Authentication</span></div>

          <div className="ln-security">
            <div className="ln-security-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              Protected by Google OAuth 2.0
            </div>
            
          </div>

          <p className="ln-legal">
            By signing in, you agree to our <a href="#terms">Terms</a> &amp; <a href="#privacy">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
