import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';
import Loader from './Loader';
import { QRCodeCanvas } from 'qrcode.react';
import './AdminEvents.css';
import AttendanceScanner from './AttendanceScanner';

const AdminAttendance = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qrActive, setQrActive] = useState(false);
  const [qrSession, setQrSession] = useState(null);
  const [toast, setToast] = useState({ text: '', type: '' });
  const [showAdminScanner, setShowAdminScanner] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const showToast = (text, type = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast({ text: '', type: '' }), 3500);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [evRes, reportRes] = await Promise.all([
        axios.get(`${API_URL}/api/admin/events`, { withCredentials: true }),
        axios.get(`${API_URL}/api/attendance/report/${id}`, { withCredentials: true })
      ]);

      if (evRes.data.success) {
        const ev = evRes.data.events.find(e => e._id === id);
        if (ev) {
          setEvent(ev);
          if (ev.activeAttendance?.sessionToken) {
            setQrActive(true);
            setQrSession(ev.activeAttendance);
          }
        }
      }
      if (reportRes.data.success) {
        setRegistrations(reportRes.data.registrations);
      }
    } catch {
      showToast('Failed to load attendance data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStartAttendance = async (roundNum) => {
    try {
      const res = await axios.post(`${API_URL}/api/attendance/start`, { eventId: id, round: roundNum }, { withCredentials: true });
      if (res.data.success) {
        setQrActive(true);
        setQrSession(res.data.activeAttendance);
        showToast(`QR Session Started for Round ${roundNum}`);
      }
    } catch { showToast('Failed to start session.', 'error'); }
  };

  const handleEndAttendance = async () => {
    try {
      await axios.post(`${API_URL}/api/attendance/end`, { eventId: id }, { withCredentials: true });
      setQrActive(false);
      setQrSession(null);
      showToast('Attendance window closed.');
    } catch { showToast('Failed to end session.', 'error'); }
  };

  const toggleAttendance = async (regId, userId, roundNum) => {
    try {
      const reg = registrations.find(r => r._id === regId);
      const isPresent = reg.attendance?.some(a => a.round === roundNum && a.user.toString() === userId.toString());
      const res = await axios.post(`${API_URL}/api/attendance/manual`, { 
        registrationId: regId, 
        userId: userId,
        round: roundNum, 
        status: isPresent ? 'Absent' : 'Present' 
      }, { withCredentials: true });
      
      if (res.data.success) {
        setRegistrations(prev => prev.map(r => r._id === regId ? res.data.registration : r));
        showToast(`Attendance updated.`);
      }
    } catch { showToast('Manual mark failed.', 'error'); }
  };

  if (!loading && !event) return <div className="ae-error"><h2>Event not found</h2><button onClick={() => navigate('/admin/events')}>Back</button></div>;

  return (
    <div className="ae-wrapper">
      {toast.text && <div className={`ae-toast status-alert ${toast.type}`}>{toast.text}</div>}

      <header className="ae-header glass">
        <div className="ae-header-left">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/admin/events/${id}/participants`)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
            Back to Participants
          </button>
          <div>
            <h1 className="ae-title">QR Attendance Control</h1>
            <p className="ae-subtitle">{event?.title}</p>
          </div>
        </div>
        <div className="ae-header-right no-print">
            <button className="btn btn-primary btn-sm" onClick={() => setShowAdminScanner(true)}>
              📷 Scan Participant
            </button>
            <button className="btn btn-outline btn-sm" onClick={() => window.print()}>🖨️ Print Report</button>
        </div>
      </header>

      {/* ── Official Report Header (Print Only) ── */}
      <div className="official-report-header only-print">
        <h1 className="mcet-title">Dr. Mahalingam College of Engineering and Technology</h1>
        <h2 className="mcet-subtitle">ECE Department Association - SPECTRUM</h2>
        <div className="report-meta-row">
          <span>Report Type: Attendance Verification</span>
          <span>Date: {new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '6rem 0' }}>
          <Loader text="Loading session controls..." />
        </div>
      ) : (
        <div className="ae-attendance-view animate-fade-in">
          <div className="ae-attendance-grid">
            {/* Session Card */}
            <div className="ae-attendance-card glass-strong">
              <h3>Check-in Window</h3>
              {qrActive ? (
                <div className="ae-qr-active-box">
                  <div className="qr-container">
                    <QRCodeCanvas 
                      value={JSON.stringify({ eventId: id, sessionToken: qrSession.sessionToken, round: qrSession.round })}
                      size={240}
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                  <div className="qr-meta">
                    <span className="badge badge-accent">Round {qrSession.round} Active</span>
                    <button className="btn btn-danger btn-sm" onClick={handleEndAttendance} style={{ marginTop: '1rem' }}>Stop QR Scanning</button>
                  </div>
                </div>
              ) : (
                <div className="ae-qr-start-box">
                  <p>Choose a round to begin accepting QR scans from students.</p>
                  <div className="ae-round-picker">
                    <div className="btn-group" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      {[...Array(event?.rounds || 0)].map((_, i) => (
                        <button key={i} className="btn btn-accent btn-md" onClick={() => handleStartAttendance(i + 1)}>
                          Start R{i + 1} Attendance
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Stats Card */}
            <div className="ae-attendance-card glass-strong">
              <h3>Attendance Overview</h3>
              <div className="ae-report-summary">
                {[...Array(event?.rounds || 0)].map((_, i) => {
                  const rNum = i + 1;
                  const totalParticipants = registrations.reduce((sum, r) => sum + r.members.length, 0);
                  const presentCount = registrations.reduce((sum, reg) => {
                    return sum + reg.attendance.filter(a => a.round === rNum).length;
                  }, 0);
                  return (
                    <div key={rNum} className="ae-report-row">
                      <span>Round {rNum} Participants</span>
                      <strong>{presentCount} / {totalParticipants}</strong>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="ae-card-separator">Detailed Attendance Matrix</div>
          
          <div className="ae-table-wrapper card glass">
            <table className="ae-table printable">
              <thead>
                <tr>
                  <th>Roll No</th>
                  <th>Student Name</th>
                  <th>Team</th>
                  <th className="no-print">Check-in Status (Per Round)</th>
                  <th className="only-print">Status</th>
                  <th className="only-print">Last Log</th>
                </tr>
              </thead>
              <tbody>
                {registrations.flatMap(reg => reg.members).map((member, mIdx) => {
                  // Find the registration this member belongs to
                  const reg = registrations.find(r => r.members.some(m => m.user._id === member.user._id));
                  const user = member.user;
                  
                  return (
                    <tr key={user._id}>
                      <td><strong>{user.registerNumber}</strong></td>
                      <td>{user.name}</td>
                      <td><small>{reg.teamName}</small></td>
                      
                      {/* Round-wise toggles for Admin Interactive View */}
                      <td className="no-print" style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                          {[...Array(event?.rounds || 0)].map((_, i) => {
                            const rNum = i + 1;
                            const attended = reg.attendance?.find(a => a.round === rNum && a.user.toString() === user._id.toString());
                            return (
                              <button 
                                key={i}
                                className={`btn btn-xs ${attended ? 'btn-success' : 'btn-ghost'}`}
                                onClick={() => toggleAttendance(reg._id, user._id, rNum)}
                                title={`Round ${rNum}`}
                              >
                                R{rNum}: {attended ? 'P' : 'A'}
                              </button>
                            );
                          })}
                        </div>
                      </td>

                      {/* Official Print Layout Columns */}
                      <td className="only-print">
                        {reg.attendance?.some(a => a.status === 'Present') ? 'PRESENT' : 'ABSENT'}
                      </td>
                      <td className="only-print">
                        {(() => {
                          const lastLog = reg.attendance?.filter(a => a.user.toString() === user._id.toString()).sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
                          return lastLog ? new Date(lastLog.timestamp).toLocaleTimeString() : 'N/A';
                        })()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Admin QR Scanner Modal */}
      {showAdminScanner && (
        <AttendanceScanner 
          eventId={id} 
          isAdminScanner={true}
          initialRound={event?.activeAttendance?.round || 1}
          eventRounds={event?.rounds || 1}
          onComplete={(msg) => {
            showToast(msg || `Participant checked in!`);
            setShowAdminScanner(false);
            fetchData();
          }}
          onCancel={() => setShowAdminScanner(false)}
        />
      )}
    </div>
  );
};

export default AdminAttendance;
