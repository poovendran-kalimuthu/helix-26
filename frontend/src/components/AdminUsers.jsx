import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Loader from './Loader';
import { API_URL } from '../config';
import './AdminEvents.css';

const AdminUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', role: 'user', department: '', year: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/admin/users`, { withCredentials: true });
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (err) {
      setError('Failed to load users. Admin access required.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post(`${API_URL}/api/admin/users`, formData, { withCredentials: true });
      setShowForm(false);
      setFormData({ name: '', email: '', role: 'user', department: '', year: '' });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (userId, name) => {
    if (!window.confirm(`Are you sure you want to delete user ${name}? This action cannot be undone.`)) return;
    
    try {
      await axios.delete(`${API_URL}/api/admin/users/${userId}`, { withCredentials: true });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting user');
    }
  };

  if (loading) return <Loader fullScreen text="Loading users..." />;
  if (error) return (
    <div className="ae-error animate-fade-in">
      <h2>{error}</h2>
      <button className="btn btn-primary" onClick={() => navigate('/admin/events')}>Back to Admin</button>
    </div>
  );

  return (
    <div className="ae-wrapper">
      <header className="ae-header glass animate-fade-in">
        <div className="ae-header-left">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin/events')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
            Admin Panel
          </button>
          <div>
            <h1 className="ae-title">User Management</h1>
            <p className="ae-subtitle">{users.length} registered users</p>
          </div>
        </div>
        <button 
          className={`btn ${showForm ? 'btn-ghost' : 'btn-primary'}`} 
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : 'Create User'}
        </button>
      </header>

      {showForm && (
        <div className="ae-form-card glass animate-fade-in" style={{ marginBottom: '2rem' }}>
          <h2>Create User</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Users created here can log in via Google using the exact email address provided.
          </p>
          <form onSubmit={handleSubmit} className="ae-form">
            <div className="ae-form-row">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="form-input" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input className="form-input" type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
            </div>
            <div className="ae-form-row">
              <div className="form-group">
                <label className="form-label">Role</label>
                <select className="form-select" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                  <option value="user">User</option>
                  <option value="coordinator">Coordinator</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Department</label>
                <input className="form-input" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Year</label>
                <input className="form-input" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create User'}
            </button>
          </form>
        </div>
      )}

      <div className="glass" style={{ padding: '1.5rem', borderRadius: '1rem', overflowX: 'auto' }}>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '1rem' }}>Name</th>
              <th style={{ padding: '1rem' }}>Email</th>
              <th style={{ padding: '1rem' }}>Role</th>
              <th style={{ padding: '1rem' }}>Dept / Year</th>
              <th style={{ padding: '1rem' }}>Linked</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '1rem' }}>{u.name}</td>
                <td style={{ padding: '1rem' }}>{u.email}</td>
                <td style={{ padding: '1rem' }}>
                  <span className={`badge ${u.role === 'admin' ? 'badge-danger' : u.role === 'coordinator' ? 'badge-success' : 'badge-outline'}`}>
                    {u.role.toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>
                  {u.department ? `${u.department} ${u.year}` : '-'}
                </td>
                <td style={{ padding: '1rem' }}>
                  {u.isProfileComplete ? '✅' : '⏳'}
                </td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <button 
                    className="btn btn-ghost btn-icon btn-sm" 
                    onClick={() => handleDelete(u._id, u.name || u.email)}
                    title="Delete User"
                    style={{ color: 'var(--danger)' }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;
