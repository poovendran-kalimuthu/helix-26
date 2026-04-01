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
  const [selectedProject, setSelectedProject] = useState(null);
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
      setEvent(eventRes.data.event);
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
          <h2>Project Review</h2>
          <p>{event?.title} • {submissions.length} Submissions</p>
        </div>
        
        <div className="apr-toggle-box">
          <span className="apr-toggle-label">Allow Edits/Submissions:</span>
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

      <div className="apr-tile-grid">
        {submissions.map(sub => (
          <div key={sub._id} className="apr-tile" onClick={() => setSelectedProject(sub)}>
            <div className="apr-tile-header">
              <div className="apr-tile-team">{sub.projectTitle || sub.registration?.teamName}</div>
              <div className="badge badge-accent">R{sub.registration?.currentRound}</div>
            </div>
            
            <div className="apr-tile-meta">
              <div className="apr-tile-leader"><strong>{sub.registration?.teamName}</strong> • {sub.registration?.teamLeader?.name}</div>
              <p className="apr-tile-preview">{sub.problemStatement}</p>
            </div>

            <div className="apr-tile-footer">
              <small style={{ color: 'rgba(255,255,255,0.3)' }}>Click to view full details</small>
              <div className="btn btn-ghost btn-xs">View →</div>
            </div>
          </div>
        ))}

        {submissions.length === 0 && (
          <div className="ae-empty" style={{ gridColumn: '1/-1' }}>
            <span>📭</span>
            <p>No projects submitted yet.</p>
          </div>
        )}
      </div>

      {/* Project Detail Modal */}
      {selectedProject && (
        <div className="apr-modal-overlay" onClick={() => setSelectedProject(null)}>
          <div className="apr-modal animate-pop-in" onClick={e => e.stopPropagation()}>
            <div className="apr-modal-header">
              <div className="apr-modal-title">
                <h3>{selectedProject.projectTitle || selectedProject.registration?.teamName}</h3>
                <p className="apr-leader">Team: {selectedProject.registration?.teamName} • Leader: {selectedProject.registration?.teamLeader?.name}</p>
              </div>
              <button className="btn btn-circle btn-ghost" onClick={() => setSelectedProject(null)}>✕</button>
            </div>
            <div className="apr-modal-body">
              <div className="apr-section full">
                <span className="apr-section-label">Problem Statement</span>
                <p className="apr-section-content">{selectedProject.problemStatement}</p>
              </div>
              <div className="apr-section full">
                <span className="apr-section-label">Proposed Solution</span>
                <p className="apr-section-content">{selectedProject.proposedSolution}</p>
              </div>
              <div className="apr-section">
                <span className="apr-section-label">Target Users</span>
                <p className="apr-section-content">{selectedProject.targetUsers}</p>
              </div>
              <div className="apr-section">
                <span className="apr-section-label">Unique Factor</span>
                <p className="apr-section-content">{selectedProject.uniqueFactor}</p>
              </div>
              <div className="apr-section">
                <span className="apr-section-label">Revenue Model</span>
                <p className="apr-section-content">{selectedProject.revenueModel}</p>
              </div>
              <div className="apr-section">
                <span className="apr-section-label">Validation</span>
                <p className="apr-section-content">{selectedProject.problemValidation}</p>
              </div>
              <div className="apr-section">
                <span className="apr-section-label">Feasibility</span>
                <p className="apr-section-content">{selectedProject.feasibility}</p>
              </div>
              <div className="apr-section">
                <span className="apr-section-label">Existing solutions</span>
                <p className="apr-section-content">{selectedProject.existingSolutions}</p>
              </div>
              <div className="apr-section full">
                <span className="apr-section-label">Workflow Steps</span>
                <p className="apr-section-content">{selectedProject.workflow}</p>
              </div>
              <div className="apr-section full">
                <span className="apr-section-label">Expected Impact</span>
                <p className="apr-section-content">{selectedProject.expectedImpact}</p>
              </div>
            </div>
          </div>
        </div>
      )}

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
