import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';
import './AdminProjectReview.css';

const AdminProjectReview = () => {
  const { id: eventId } = useParams();
  const [submissions, setSubmissions] = useState([]);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    fetchData();
  }, [eventId]);

  const fetchData = async () => {
    try {
      const [eventRes, subRes] = await Promise.all([
        axios.get(`${API_URL}/api/events/${eventId}`, { withCredentials: true }),
        axios.get(`${API_URL}/api/projects/event/${eventId}`, { withCredentials: true })
      ]);
      setEvent(eventRes.data);
      setSubmissions(subRes.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setToast({ show: true, message: 'Failed to load data.', type: 'danger' });
      setLoading(false);
    }
  };

  const handleToggle = async (e) => {
    const isOpen = e.target.checked;
    setToggling(true);
    try {
      await axios.patch(`${API_URL}/api/projects/toggle-submission/${eventId}`, {
        isOpen
      }, { withCredentials: true });
      setEvent({ ...event, isSubmissionOpen: isOpen });
      setToast({ show: true, message: `Submission window ${isOpen ? 'opened' : 'closed'}.`, type: 'success' });
    } catch (err) {
      setToast({ show: true, message: 'Failed to update status.', type: 'danger' });
    } finally {
      setToggling(false);
    }
  };

  if (loading) return <div className="loader-container"><div className="spinner"></div></div>;

  return (
    <div className="apr-wrapper animate-fade-in">
      <div className="apr-controls glass">
        <div className="apr-header-info">
          <h2>Project Details Review</h2>
          <p>{event?.title} • {submissions.length} Submissions</p>
        </div>
        
        <div className="apr-toggle-box">
          <span className="apr-toggle-label">Accepting Submissions:</span>
          <label className="switch">
            <input 
              type="checkbox" 
              checked={event?.isSubmissionOpen} 
              onChange={handleToggle}
              disabled={toggling}
            />
            <span className="slider round"></span>
          </label>
        </div>
      </div>

      <div className="apr-grid">
        {submissions.map(sub => (
          <div key={sub._id} className="apr-card">
            <div className="apr-team-info">
              <div>
                <div className="apr-team-name">{sub.registration?.teamName}</div>
                <div className="apr-leader">
                  Leader: {sub.registration?.teamLeader?.name} ({sub.registration?.teamLeader?.registerNumber})
                </div>
              </div>
              <div className="badge badge-accent">Round {sub.registration?.currentRound}</div>
            </div>

            <div className="apr-details">
              <div className="apr-section">
                <span className="apr-section-label">Problem Statement</span>
                <p className="apr-section-content">{sub.problemStatement}</p>
              </div>
              <div className="apr-section">
                <span className="apr-section-label">Target Users</span>
                <p className="apr-section-content">{sub.targetUsers}</p>
              </div>
              <div className="apr-section">
                <span className="apr-section-label">Proposed Solution</span>
                <p className="apr-section-content">{sub.proposedSolution}</p>
              </div>
              <div className="apr-section">
                <span className="apr-section-label">U.S.P / Unique Factor</span>
                <p className="apr-section-content">{sub.uniqueFactor}</p>
              </div>
              <div className="apr-section">
                <span className="apr-section-label">Revenue Model</span>
                <p className="apr-section-content">{sub.revenueModel}</p>
              </div>
              <div className="apr-section">
                <span className="apr-section-label">Problem Validation</span>
                <p className="apr-section-content">{sub.problemValidation}</p>
              </div>
              <div className="apr-section">
                <span className="apr-section-label">Feasibility</span>
                <p className="apr-section-content">{sub.feasibility}</p>
              </div>
              <div className="apr-section">
                <span className="apr-section-label">Workflow</span>
                <p className="apr-section-content">{sub.workflow}</p>
              </div>
              <div className="apr-section">
                <span className="apr-section-label">Solutions Gap</span>
                <p className="apr-section-content">{sub.existingSolutions}</p>
              </div>
              <div className="apr-section">
                <span className="apr-section-label">Expected Impact</span>
                <p className="apr-section-content">{sub.expectedImpact}</p>
              </div>
            </div>
          </div>
        ))}
        {submissions.length === 0 && (
          <div className="ae-empty" style={{ gridColumn: '1/-1' }}>
            <span>📭</span>
            <p>No project details submitted yet.</p>
          </div>
        )}
      </div>

      {toast.show && (
        <div className={`ae-toast alert alert-${toast.type} animate-slide-in`}>
          <span>{toast.message}</span>
          <button onClick={() => setToast({ ...toast, show: false })}>✕</button>
        </div>
      )}
    </div>
  );
};

export default AdminProjectReview;
