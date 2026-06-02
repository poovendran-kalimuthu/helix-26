import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Loader from './Loader';
import { API_URL } from '../config';
import { 
  Users, 
  UserCheck, 
  Shield, 
  Search, 
  Plus, 
  Trash2, 
  Edit3, 
  Eye, 
  RefreshCw, 
  X, 
  Check, 
  AlertTriangle, 
  Activity, 
  Calendar, 
  Filter, 
  ArrowLeft,
  Mail,
  UserPlus,
  BookOpen,
  Phone
} from 'lucide-react';
import './AdminUsers.css';

const AdminUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Dashboard Tabs / Navigation
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'admins', 'coordinators', 'analytics'
  
  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'user',
    department: '',
    year: '',
    registerNumber: '',
    mobile: '',
    isProfileComplete: true
  });
  const [submitting, setSubmitting] = useState(false);

  // Toast / Notification State
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch users
      const usersRes = await axios.get(`${API_URL}/api/admin/users`, { withCredentials: true });
      if (usersRes.data.success) {
        setUsers(usersRes.data.users);
      }

      // Fetch audit logs for recent activity
      try {
        const logsRes = await axios.get(`${API_URL}/api/admin/audit-logs`, { withCredentials: true });
        if (logsRes.data.success) {
          // Filter logs to user-related activities or just show recent system logs
          const userLogs = logsRes.data.logs.filter(log => 
            log.action.includes('USER') || 
            log.action.includes('PROFILE') ||
            log.targetModel === 'User'
          );
          setLogs(userLogs.slice(0, 15)); // Keep latest 15 user logs
        }
      } catch (err) {
        console.warn('Failed to load audit logs. Proceeding without logs.', err);
      }

    } catch (err) {
      setError('Failed to load dashboard data. Admin access required.');
    } finally {
      setLoading(false);
    }
  };

  // Create User Handler
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await axios.post(`${API_URL}/api/admin/users`, formData, { withCredentials: true });
      if (res.data.success) {
        setShowCreateModal(false);
        resetForm();
        showToast('User created successfully');
        fetchDashboardData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error creating user', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Edit User Handler
  const handleEditUser = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await axios.put(`${API_URL}/api/admin/users/${selectedUser._id}`, formData, { withCredentials: true });
      if (res.data.success) {
        setShowEditModal(false);
        setSelectedUser(null);
        resetForm();
        showToast('User updated successfully');
        fetchDashboardData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error updating user', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete User Handler
  const handleDeleteUser = async (userId, name) => {
    if (!window.confirm(`Are you sure you want to delete user "${name}"? This action is permanent.`)) return;
    
    try {
      const res = await axios.delete(`${API_URL}/api/admin/users/${userId}`, { withCredentials: true });
      if (res.data.success) {
        showToast('User deleted successfully');
        fetchDashboardData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error deleting user', 'error');
    }
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'user',
      department: user.department || '',
      year: user.year || '',
      registerNumber: user.registerNumber || '',
      mobile: user.mobile || '',
      isProfileComplete: user.isProfileComplete !== undefined ? user.isProfileComplete : true
    });
    setShowEditModal(true);
  };

  const openDetailModal = (user) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      role: 'user',
      department: '',
      year: '',
      registerNumber: '',
      mobile: '',
      isProfileComplete: true
    });
  };

  // ── Analytics Computations ──
  const totalUsers = users.length;
  const adminCount = users.filter(u => u.role === 'admin').length;
  const coordinatorCount = users.filter(u => u.role === 'coordinator').length;
  const standardUserCount = users.filter(u => u.role === 'user').length;
  
  const completedProfiles = users.filter(u => u.isProfileComplete).length;
  const pendingProfiles = totalUsers - completedProfiles;
  const completionRate = totalUsers > 0 ? Math.round((completedProfiles / totalUsers) * 100) : 0;

  // New users in last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const newUsersCount = users.filter(u => new Date(u.createdAt) >= sevenDaysAgo).length;

  // Department distribution logic
  const getDeptStats = () => {
    const counts = {};
    users.forEach(u => {
      const dept = u.department?.trim().toUpperCase() || 'UNSPECIFIED';
      counts[dept] = (counts[dept] || 0) + 1;
    });
    // Sort and return top 5
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const deptStats = getDeptStats();

  // Role Percentage for Donut Chart
  const adminPct = totalUsers > 0 ? (adminCount / totalUsers) * 100 : 0;
  const coordPct = totalUsers > 0 ? (coordinatorCount / totalUsers) * 100 : 0;
  const userPct = totalUsers > 0 ? (standardUserCount / totalUsers) * 100 : 0;

  // Get unique departments for filtering
  const allDepartments = Array.from(
    new Set(users.map(u => u.department?.trim().toUpperCase()).filter(Boolean))
  ).sort();

  // ── Filters & Search Execution ──
  const filteredUsers = users.filter(user => {
    // Search filter
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      (user.name && user.name.toLowerCase().includes(searchLower)) ||
      (user.email && user.email.toLowerCase().includes(searchLower)) ||
      (user.registerNumber && user.registerNumber.toLowerCase().includes(searchLower)) ||
      (user.mobile && user.mobile.includes(searchLower));

    // Role filter
    const matchesRole = 
      roleFilter === 'all' ? true : user.role === roleFilter;

    // Tab navigation quick filter
    const matchesTab = 
      activeTab === 'all' ? true :
      activeTab === 'admins' ? user.role === 'admin' :
      activeTab === 'coordinators' ? user.role === 'coordinator' : true;

    // Status filter
    const matchesStatus = 
      statusFilter === 'all' ? true :
      statusFilter === 'completed' ? user.isProfileComplete : !user.isProfileComplete;

    // Department filter
    const matchesDept = 
      deptFilter === 'all' ? true : 
      user.department?.trim().toUpperCase() === deptFilter;

    return matchesSearch && matchesRole && matchesTab && matchesStatus && matchesDept;
  });

  // Sorting Execution
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
    if (sortBy === 'oldest') {
      return new Date(a.createdAt) - new Date(b.createdAt);
    }
    if (sortBy === 'name-asc') {
      return (a.name || '').localeCompare(b.name || '');
    }
    if (sortBy === 'name-desc') {
      return (b.name || '').localeCompare(a.name || '');
    }
    if (sortBy === 'completion') {
      return (b.isProfileComplete ? 1 : 0) - (a.isProfileComplete ? 1 : 0);
    }
    return 0;
  });

  if (loading) return <Loader fullScreen text="Loading user management dashboard..." />;
  if (error) return (
    <div className="ae-error animate-fade-in">
      <AlertTriangle className="ae-error-icon" size={48} />
      <h2>{error}</h2>
      <button className="btn btn-primary" onClick={() => navigate('/admin/events')}>
        <ArrowLeft size={16} style={{marginRight: '6px'}} />
        Back to Admin Panel
      </button>
    </div>
  );

  return (
    <div className="aud-container">
      {/* Toast Alert */}
      {toast && (
        <div className={`sp-toast status-alert ${toast.type === 'error' ? 'error' : 'success'} glass`}>
          {toast.type === 'error' ? <AlertTriangle size={18} /> : <Check size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <header className="ae-header glass animate-fade-in" style={{ marginBottom: '2rem', borderRadius: '1rem' }}>
        <div className="ae-header-left">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin/events')}>
            <ArrowLeft size={14} />
            Events Dashboard
          </button>
          <div>
            <h1 className="ae-title">User Analytics & Management</h1>
            <p className="ae-subtitle">Overview of platform accounts, roles, and statistics</p>
          </div>
        </div>
        <div className="ae-header-right">
          <button className="btn btn-secondary btn-sm" onClick={fetchDashboardData}>
            <RefreshCw size={14} style={{ marginRight: '4px' }} />
            Sync
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => { resetForm(); setShowCreateModal(true); }}>
            <Plus size={16} />
            Create User
          </button>
        </div>
      </header>

      {/* KPI Cards Grid */}
      <section className="aud-stats-grid animate-fade-in-up">
        {/* Total Users */}
        <div className="aud-stat-card">
          <div className="aud-stat-icon">
            <Users size={22} />
          </div>
          <div className="aud-stat-content">
            <div className="aud-stat-label">Total Accounts</div>
            <div className="aud-stat-value">{totalUsers}</div>
            <div className="aud-stat-sub">
              <span style={{ color: 'var(--clr-success)', fontWeight: '600' }}>+{newUsersCount}</span> new this week
            </div>
          </div>
        </div>

        {/* Admin Accounts */}
        <div className="aud-stat-card admin-card">
          <div className="aud-stat-icon">
            <Shield size={22} />
          </div>
          <div className="aud-stat-content">
            <div className="aud-stat-label">Admins</div>
            <div className="aud-stat-value">{adminCount}</div>
            <div className="aud-stat-sub">
              System access control
            </div>
          </div>
        </div>

        {/* Coordinators */}
        <div className="aud-stat-card coordinator-card">
          <div className="aud-stat-icon">
            <UserCheck size={22} />
          </div>
          <div className="aud-stat-content">
            <div className="aud-stat-label">Coordinators</div>
            <div className="aud-stat-value">{coordinatorCount}</div>
            <div className="aud-stat-sub">
              Event managers and checkers
            </div>
          </div>
        </div>

        {/* Profile Completion Rate */}
        <div className="aud-stat-card complete-card">
          <div className="aud-stat-icon">
            <Check size={22} />
          </div>
          <div className="aud-stat-content">
            <div className="aud-stat-label">Profile Setup</div>
            <div className="aud-stat-value">{completionRate}%</div>
            <div className="aud-stat-sub">
              <strong>{completedProfiles}</strong> set / <strong>{pendingProfiles}</strong> pending
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <div className="ae-tabs-container animate-fade-in-up" style={{ margin: '0 0 1.5rem 0' }}>
        <div className="ae-tabs">
          <button 
            className={`ae-tab ${activeTab === 'all' ? 'active' : ''}`} 
            onClick={() => setActiveTab('all')}
          >
            All Accounts
            <span className="ae-tab-count">{totalUsers}</span>
          </button>
          <button 
            className={`ae-tab ${activeTab === 'admins' ? 'active' : ''}`} 
            onClick={() => setActiveTab('admins')}
          >
            Administrators
            <span className="ae-tab-count">{adminCount}</span>
          </button>
          <button 
            className={`ae-tab ${activeTab === 'coordinators' ? 'active' : ''}`} 
            onClick={() => setActiveTab('coordinators')}
          >
            Coordinators
            <span className="ae-tab-count">{coordinatorCount}</span>
          </button>
          <button 
            className={`ae-tab ${activeTab === 'analytics' ? 'active' : ''}`} 
            onClick={() => setActiveTab('analytics')}
          >
            Deep Analytics
            <span className="badge badge-accent" style={{ fontSize: '0.62rem', padding: '1px 6px' }}>Charts</span>
          </button>
        </div>
      </div>

      {/* Main Dashboard Layout */}
      {activeTab === 'analytics' ? (
        <div className="animate-fade-in">
          <div className="aud-analytics-tab-grid">
            {/* Pie/Donut Chart for Roles */}
            <div className="aud-card">
              <div className="aud-card-header">
                <h3 className="aud-card-title">
                  <Shield size={18} />
                  Role Distribution
                </h3>
              </div>
              <div className="aud-chart-container">
                <div style={{
                  position: 'relative',
                  width: '160px',
                  height: '160px',
                  borderRadius: '50%',
                  background: totalUsers > 0 
                    ? `conic-gradient(var(--clr-danger) 0% ${adminPct}%, var(--clr-warning) ${adminPct}% ${adminPct + coordPct}%, var(--clr-accent) ${adminPct + coordPct}% 100%)`
                    : 'var(--clr-surface-3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'inset 0 0 10px rgba(0,0,0,0.1), var(--shadow-sm)'
                }}>
                  <div style={{
                    width: '110px',
                    height: '110px',
                    borderRadius: '50%',
                    background: 'var(--clr-surface)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--clr-text-heading)' }}>
                      {totalUsers}
                    </span>
                    <span style={{ fontSize: '0.68rem', color: 'var(--clr-text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>
                      Accounts
                    </span>
                  </div>
                </div>
                
                <div className="aud-chart-legends">
                  <div className="aud-legend-item">
                    <div className="aud-legend-color" style={{ background: 'var(--clr-danger)' }} />
                    <span>Admin ({adminCount})</span>
                  </div>
                  <div className="aud-legend-item">
                    <div className="aud-legend-color" style={{ background: 'var(--clr-warning)' }} />
                    <span>Coordinator ({coordinatorCount})</span>
                  </div>
                  <div className="aud-legend-item">
                    <div className="aud-legend-color" style={{ background: 'var(--clr-accent)' }} />
                    <span>General User ({standardUserCount})</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Circular Progress for Profile Completion */}
            <div className="aud-card">
              <div className="aud-card-header">
                <h3 className="aud-card-title">
                  <UserCheck size={18} />
                  Profile Completion
                </h3>
              </div>
              <div className="aud-chart-container" style={{ minHeight: '228px' }}>
                <svg width="120" height="120" viewBox="0 0 120 120" className="animate-scale-in">
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="transparent"
                    stroke="var(--clr-surface-3)"
                    strokeWidth="10"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="transparent"
                    stroke="var(--clr-success)"
                    strokeWidth="10"
                    strokeDasharray={2 * Math.PI * 50}
                    strokeDashoffset={2 * Math.PI * 50 - (completionRate / 100) * (2 * Math.PI * 50)}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.8s ease', transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                  />
                  <text
                    x="60"
                    y="66"
                    textAnchor="middle"
                    fill="var(--clr-text-heading)"
                    fontSize="20"
                    fontWeight="bold"
                    fontFamily="var(--font-heading)"
                  >
                    {completionRate}%
                  </text>
                </svg>
                <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--clr-text-subtle)' }}>
                  <div><strong>{completedProfiles}</strong> profiles fully populated</div>
                  <div style={{ color: 'var(--clr-text-muted)', fontSize: '0.75rem', marginTop: '2px' }}>{pendingProfiles} accounts missing core details</div>
                </div>
              </div>
            </div>

            {/* Department bar chart */}
            <div className="aud-card">
              <div className="aud-card-header">
                <h3 className="aud-card-title">
                  <BookOpen size={18} />
                  Top Departments
                </h3>
              </div>
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '228px' }}>
                {deptStats.length === 0 ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--clr-text-muted)', fontStyle: 'italic' }}>
                    No department data set.
                  </div>
                ) : (
                  <div className="aud-bar-chart">
                    {deptStats.map((dept, index) => {
                      const pct = totalUsers > 0 ? (dept.count / totalUsers) * 100 : 0;
                      return (
                        <div className="aud-bar-row" key={dept.name}>
                          <div className="aud-bar-header">
                            <span>{dept.name}</span>
                            <span style={{ color: 'var(--clr-text-muted)' }}>
                              {dept.count} {dept.count === 1 ? 'user' : 'users'} ({Math.round(pct)}%)
                            </span>
                          </div>
                          <div className="aud-bar-bg">
                            <div 
                              className="aud-bar-fill" 
                              style={{ 
                                width: `${pct}%`,
                                background: index === 0 ? 'var(--clr-accent)' : index === 1 ? 'var(--clr-accent-2)' : 'var(--clr-text-muted)' 
                              }} 
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Registration activity summary */}
          <div className="aud-card animate-fade-in-up" style={{ marginBottom: '2rem' }}>
            <div className="aud-card-header">
              <h3 className="aud-card-title">
                <Activity size={18} />
                User Administration Log (Recent Operations)
              </h3>
            </div>
            <div className="aud-logs-list" style={{ maxHeight: '400px' }}>
              {logs.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--clr-text-muted)', fontStyle: 'italic' }}>
                  No recent user-related actions recorded in logs.
                </div>
              ) : (
                logs.map(log => (
                  <div className="aud-log-item" key={log._id}>
                    <div className="aud-log-header">
                      <span className="aud-log-action">{log.action}</span>
                      <span className="aud-log-time">{new Date(log.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="aud-log-desc">{log.details}</div>
                    <div className="aud-log-user">
                      Actor: {log.user ? `${log.user.name} (${log.user.email})` : 'System'} • IP: {log.ipAddress || 'N/A'}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="aud-grid animate-fade-in-up">
          {/* Main User List Card */}
          <div className="aud-card">
            {/* Search & Filter Header bar */}
            <div className="aud-filter-bar">
              <div className="aud-search-wrapper">
                <Search className="aud-search-icon" size={16} />
                <input 
                  type="text" 
                  placeholder="Search by name, email, register no., mobile..." 
                  className="aud-search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm('')} 
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--clr-text-muted)' }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Status filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Filter size={14} style={{ color: 'var(--clr-text-muted)' }} />
                <select 
                  className="aud-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Profiles</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              {/* Department filter */}
              <select 
                className="aud-select"
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
              >
                <option value="all">All Depts</option>
                {allDepartments.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>

              {/* Sorting filter */}
              <select 
                className="aud-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="completion">Completion</option>
              </select>
            </div>

            {/* User List Table */}
            <div className="aud-table-wrapper">
              <table className="aud-table">
                <thead>
                  <tr>
                    <th>User Details</th>
                    <th>Role</th>
                    <th>Dept / Year</th>
                    <th>Reg No.</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedUsers.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: 'var(--clr-text-muted)' }}>
                        <Users size={32} style={{ opacity: 0.3, marginBottom: '8px' }} />
                        <p>No registered users found matching the filter criteria.</p>
                      </td>
                    </tr>
                  ) : (
                    sortedUsers.map(user => {
                      const initials = user.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '?';
                      return (
                        <tr key={user._id}>
                          <td>
                            <div className="aud-user-info">
                              <div className="aud-user-avatar">
                                {user.profilePicture ? (
                                  <img src={user.profilePicture} alt={user.name} onError={(e) => e.target.style.display = 'none'} />
                                ) : initials}
                              </div>
                              <div className="aud-user-meta">
                                <span className="aud-user-name">{user.name}</span>
                                <span className="aud-user-email">{user.email}</span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className={`aud-role-badge ${user.role}`}>
                              {user.role}
                            </span>
                          </td>
                          <td>
                            {user.department ? (
                              <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>
                                {user.department} {user.year ? `• Year ${user.year}` : ''}
                              </span>
                            ) : (
                              <span style={{ color: 'var(--clr-text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>Not set</span>
                            )}
                          </td>
                          <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                            {user.registerNumber || '-'}
                          </td>
                          <td>
                            <div className="aud-status-indicator">
                              <span className={`aud-dot ${user.isProfileComplete ? 'active' : 'pending'}`} />
                              <span>{user.isProfileComplete ? 'Complete' : 'Pending'}</span>
                            </div>
                          </td>
                          <td>
                            <div className="aud-action-btns">
                              <button 
                                className="btn btn-ghost btn-icon-sm"
                                onClick={() => openDetailModal(user)}
                                title="View Details"
                              >
                                <Eye size={14} />
                              </button>
                              <button 
                                className="btn btn-ghost btn-icon-sm"
                                onClick={() => openEditModal(user)}
                                title="Edit Account"
                                style={{ color: 'var(--clr-accent)' }}
                              >
                                <Edit3 size={14} />
                              </button>
                              <button 
                                className="btn btn-ghost btn-icon-sm"
                                onClick={() => handleDeleteUser(user._id, user.name || user.email)}
                                title="Delete Account"
                                style={{ color: 'var(--clr-danger)' }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Sidebar Widgets */}
          <aside className="aud-widget">
            {/* Quick Analytics Summary Panel */}
            <div className="aud-card">
              <div className="aud-card-header">
                <h3 className="aud-card-title">
                  <Activity size={16} />
                  Role Distribution
                </h3>
              </div>
              <div className="aud-chart-container" style={{ padding: '1.25rem' }}>
                <div style={{
                  position: 'relative',
                  width: '130px',
                  height: '130px',
                  borderRadius: '50%',
                  background: totalUsers > 0 
                    ? `conic-gradient(var(--clr-danger) 0% ${adminPct}%, var(--clr-warning) ${adminPct}% ${adminPct + coordPct}%, var(--clr-accent) ${adminPct + coordPct}% 100%)`
                    : 'var(--clr-surface-3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'inset 0 0 8px rgba(0,0,0,0.08), var(--shadow-sm)'
                }}>
                  <div style={{
                    width: '90px',
                    height: '90px',
                    borderRadius: '50%',
                    background: 'var(--clr-surface)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--clr-text-heading)' }}>
                      {totalUsers}
                    </span>
                    <span style={{ fontSize: '0.62rem', color: 'var(--clr-text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>
                      Accounts
                    </span>
                  </div>
                </div>
                
                <div className="aud-chart-legends" style={{ marginTop: '0.75rem', gap: '8px 12px' }}>
                  <div className="aud-legend-item">
                    <div className="aud-legend-color" style={{ background: 'var(--clr-danger)' }} />
                    <span>Admin ({adminCount})</span>
                  </div>
                  <div className="aud-legend-item">
                    <div className="aud-legend-color" style={{ background: 'var(--clr-warning)' }} />
                    <span>Coordinator ({coordinatorCount})</span>
                  </div>
                  <div className="aud-legend-item">
                    <div className="aud-legend-color" style={{ background: 'var(--clr-accent)' }} />
                    <span>User ({standardUserCount})</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Department stats preview */}
            <div className="aud-card">
              <div className="aud-card-header">
                <h3 className="aud-card-title">
                  <BookOpen size={16} />
                  Top Departments
                </h3>
              </div>
              <div style={{ padding: '1.25rem', minHeight: '120px' }}>
                {deptStats.length === 0 ? (
                  <p style={{ color: 'var(--clr-text-muted)', fontStyle: 'italic', fontSize: '0.8rem', textAlign: 'center' }}>No department data available</p>
                ) : (
                  <div className="aud-bar-chart" style={{ gap: '8px' }}>
                    {deptStats.slice(0, 3).map((dept, index) => {
                      const pct = totalUsers > 0 ? (dept.count / totalUsers) * 100 : 0;
                      return (
                        <div className="aud-bar-row" key={dept.name} style={{ gap: '2px' }}>
                          <div className="aud-bar-header" style={{ fontSize: '0.75rem' }}>
                            <span>{dept.name}</span>
                            <span>{dept.count}</span>
                          </div>
                          <div className="aud-bar-bg" style={{ height: '6px' }}>
                            <div 
                              className="aud-bar-fill" 
                              style={{ width: `${pct}%`, background: index === 0 ? 'var(--clr-accent)' : 'var(--clr-accent-2)' }} 
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Recent user log alerts */}
            <div className="aud-card">
              <div className="aud-card-header">
                <h3 className="aud-card-title">
                  <Activity size={16} />
                  Recent Actions
                </h3>
              </div>
              <div className="aud-logs-list" style={{ maxHeight: '240px', padding: '0.5rem 1rem' }}>
                {logs.length === 0 ? (
                  <div style={{ padding: '1rem 0', textAlign: 'center', color: 'var(--clr-text-muted)', fontSize: '0.78rem' }}>
                    No user updates log.
                  </div>
                ) : (
                  logs.slice(0, 5).map(log => (
                    <div className="aud-log-item" key={log._id} style={{ padding: '8px 0' }}>
                      <div className="aud-log-header">
                        <span className="aud-log-action" style={{ fontSize: '0.62rem' }}>{log.action.replace('USER', '').replace('PROFILE', '').trim() || log.action}</span>
                        <span className="aud-log-time" style={{ fontSize: '0.62rem' }}>{new Date(log.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="aud-log-desc" style={{ fontSize: '0.75rem' }}>{log.details}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* CREATE USER MODAL */}
      {showCreateModal && (
        <div className="aud-modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="aud-modal glass" onClick={(e) => e.stopPropagation()}>
            <div className="aud-modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem' }}>
                <UserPlus size={20} />
                Create New User
              </h3>
              <button className="aud-modal-close" onClick={() => setShowCreateModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateUser}>
              <div className="aud-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)' }}>
                  Manually registered users can bypass standard setup and log in using their matching Google account email.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      required 
                      placeholder="e.g. John Doe"
                      value={formData.name} 
                      onChange={e => setFormData({...formData, name: e.target.value})} 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address *</label>
                    <input 
                      type="email" 
                      className="form-input" 
                      required 
                      placeholder="e.g. name@domain.com"
                      value={formData.email} 
                      onChange={e => setFormData({...formData, email: e.target.value})} 
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Role</label>
                    <select 
                      className="form-select" 
                      value={formData.role} 
                      onChange={e => setFormData({...formData, role: e.target.value})}
                    >
                      <option value="user">User</option>
                      <option value="coordinator">Coordinator</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. CSE"
                      value={formData.department} 
                      onChange={e => setFormData({...formData, department: e.target.value})} 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Year</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. III"
                      value={formData.year} 
                      onChange={e => setFormData({...formData, year: e.target.value})} 
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Register Number</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. 312221104001"
                      value={formData.registerNumber} 
                      onChange={e => setFormData({...formData, registerNumber: e.target.value})} 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Mobile Number</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. 9876543210"
                      value={formData.mobile} 
                      onChange={e => setFormData({...formData, mobile: e.target.value})} 
                    />
                  </div>
                </div>
              </div>
              <div className="aud-modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {showEditModal && (
        <div className="aud-modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="aud-modal glass" onClick={(e) => e.stopPropagation()}>
            <div className="aud-modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem' }}>
                <Edit3 size={20} />
                Edit Account Details
              </h3>
              <button className="aud-modal-close" onClick={() => setShowEditModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleEditUser}>
              <div className="aud-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      required 
                      value={formData.name} 
                      onChange={e => setFormData({...formData, name: e.target.value})} 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address *</label>
                    <input 
                      type="email" 
                      className="form-input" 
                      required 
                      value={formData.email} 
                      onChange={e => setFormData({...formData, email: e.target.value})} 
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Role</label>
                    <select 
                      className="form-select" 
                      value={formData.role} 
                      onChange={e => setFormData({...formData, role: e.target.value})}
                    >
                      <option value="user">User</option>
                      <option value="coordinator">Coordinator</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={formData.department} 
                      onChange={e => setFormData({...formData, department: e.target.value})} 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Year</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={formData.year} 
                      onChange={e => setFormData({...formData, year: e.target.value})} 
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Register Number</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={formData.registerNumber} 
                      onChange={e => setFormData({...formData, registerNumber: e.target.value})} 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Mobile Number</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={formData.mobile} 
                      onChange={e => setFormData({...formData, mobile: e.target.value})} 
                    />
                  </div>
                </div>

                <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <input 
                    type="checkbox" 
                    id="edit-profile-complete" 
                    checked={formData.isProfileComplete} 
                    onChange={e => setFormData({...formData, isProfileComplete: e.target.checked})} 
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <label htmlFor="edit-profile-complete" className="form-label" style={{ cursor: 'pointer', margin: 0 }}>
                    Mark Profile Status as Complete
                  </label>
                </div>
              </div>
              <div className="aud-modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* USER DETAIL MODAL */}
      {showDetailModal && selectedUser && (
        <div className="aud-modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="aud-modal glass" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="aud-modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem' }}>
                <Eye size={20} />
                User Account Profile
              </h3>
              <button className="aud-modal-close" onClick={() => setShowDetailModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="aud-modal-body">
              <div className="aud-profile-detail">
                {/* Large Avatar */}
                <div className="aud-profile-avatar-lg">
                  {selectedUser.profilePicture ? (
                    <img src={selectedUser.profilePicture} alt={selectedUser.name} />
                  ) : (
                    selectedUser.name ? selectedUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '?'
                  )}
                </div>
                
                <div>
                  <h2 style={{ fontSize: '1.4rem', color: 'var(--clr-text-heading)', margin: '0.25rem 0' }}>{selectedUser.name}</h2>
                  <span className={`aud-role-badge ${selectedUser.role}`}>{selectedUser.role}</span>
                </div>

                <div className="aud-profile-fields">
                  <div className="aud-profile-field">
                    <div className="aud-field-label">Email Address</div>
                    <div className="aud-field-value" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Mail size={14} style={{ color: 'var(--clr-text-muted)' }} />
                      {selectedUser.email}
                    </div>
                  </div>

                  <div className="aud-profile-field">
                    <div className="aud-field-label">Alternative Email</div>
                    <div className="aud-field-value">{selectedUser.alternateEmail || '-'}</div>
                  </div>

                  <div className="aud-profile-field">
                    <div className="aud-field-label">Register Number</div>
                    <div className="aud-field-value" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{selectedUser.registerNumber || '-'}</div>
                  </div>

                  <div className="aud-profile-field">
                    <div className="aud-field-label">Mobile Number</div>
                    <div className="aud-field-value" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Phone size={14} style={{ color: 'var(--clr-text-muted)' }} />
                      {selectedUser.mobile || '-'}
                    </div>
                  </div>

                  <div className="aud-profile-field">
                    <div className="aud-field-label">Department / Year</div>
                    <div className="aud-field-value">
                      {selectedUser.department ? `${selectedUser.department} ${selectedUser.year ? `(Year ${selectedUser.year})` : ''}` : '-'}
                    </div>
                  </div>

                  <div className="aud-profile-field">
                    <div className="aud-field-label">Section</div>
                    <div className="aud-field-value">{selectedUser.section || '-'}</div>
                  </div>

                  <div className="aud-profile-field">
                    <div className="aud-field-label">Google Account Link</div>
                    <div className="aud-field-value" style={{ fontSize: '0.78rem' }}>
                      {selectedUser.googleId ? `Linked ID: ${selectedUser.googleId}` : 'Not linked yet'}
                    </div>
                  </div>

                  <div className="aud-profile-field">
                    <div className="aud-field-label">Registration Date</div>
                    <div className="aud-field-value" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={14} style={{ color: 'var(--clr-text-muted)' }} />
                      {new Date(selectedUser.createdAt).toLocaleDateString()} {new Date(selectedUser.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="aud-modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary btn-sm" 
                onClick={() => {
                  setShowDetailModal(false);
                  openEditModal(selectedUser);
                }}
                style={{ color: 'var(--clr-accent)' }}
              >
                <Edit3 size={14} style={{ marginRight: '4px' }} />
                Edit Profile
              </button>
              <button type="button" className="btn btn-primary btn-sm" onClick={() => setShowDetailModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
