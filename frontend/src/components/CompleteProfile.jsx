import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Loader from './Loader';
import { API_URL } from '../config';
import './CompleteProfile.css';

const DEPARTMENTS = ['CSE', 'ECE', 'MECH', 'CIVIL', 'EEE', 'IT', 'OTHER'];
const YEARS = ['1st', '2nd', '3rd', '4th'];

const CompleteProfile = () => {
  const [formData, setFormData] = useState({
    name: '', registerNumber: '', department: 'CSE', year: '1st', section: '', mobile: '', alternateEmail: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = e => setFormData(f => ({ ...f, [e.target.name]: e.target.value }));

  const filled = Object.values({ ...formData, alternateEmail: 'ok' }).filter(Boolean).length;
  const progress = Math.round((filled / 6) * 100);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await axios.put(`${API_URL}/api/auth/profile`, formData, { withCredentials: true });
      if (res.data.success) navigate('/dashboard');
    } catch { setError('Failed to update profile. Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="cp-wrapper">
      {loading && <Loader fullScreen text="Saving Profile..." />}
      <div className="cp-card animate-scale-in">
        <div className="cp-header">
          <div className="cp-icon">🎓</div>
          <h1>Almost There!</h1>
          <p>Complete your college profile to access Spectrum</p>
        </div>

        <div className="cp-progress">
          <div className="cp-progress-bar" style={{ width: `${progress}%` }} />
        </div>

        <form onSubmit={handleSubmit} className="cp-form">
          {error && <div className="cp-error">{error}</div>}

          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input className="form-input" type="text" name="name" required value={formData.name} onChange={handleChange} placeholder="e.g. Hari Poovendran" />
          </div>

          <div className="form-group">
            <label className="form-label">Register / Roll Number *</label>
            <input className="form-input" type="text" name="registerNumber" required value={formData.registerNumber} onChange={handleChange} placeholder="e.g. 21BCE0001" />
          </div>

          <div className="cp-form-row">
            <div className="form-group">
              <label className="form-label">Department *</label>
              <select className="form-select" name="department" value={formData.department} onChange={handleChange} required>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Year *</label>
              <select className="form-select" name="year" value={formData.year} onChange={handleChange} required>
                {YEARS.map(y => <option key={y} value={y}>{y} Year</option>)}
              </select>
            </div>
          </div>

          <div className="cp-form-row">
            <div className="form-group">
              <label className="form-label">Section *</label>
              <input className="form-input" type="text" name="section" required value={formData.section} onChange={handleChange} placeholder="e.g. A" />
            </div>
            <div className="form-group">
              <label className="form-label">Mobile *</label>
              <input className="form-input" type="tel" name="mobile" required value={formData.mobile} onChange={handleChange} placeholder="10-digit number" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Alternate Email (Optional)</label>
            <input className="form-input" type="email" name="alternateEmail" value={formData.alternateEmail} onChange={handleChange} placeholder="personal@example.com" />
          </div>

          <button type="submit" className="cp-submit" disabled={loading}>
            {loading ? <><span className="cp-spin" /> Saving...</> : <>Complete Profile <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg></>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfile;
