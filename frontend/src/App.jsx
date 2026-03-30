import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import CompleteProfile from './components/CompleteProfile';
import EditProfile from './components/EditProfile';
import EventsList from './components/EventsList';
import EventDetails from './components/EventDetails';
import AdminEvents from './components/AdminEvents';
import AdminEventDetail from './components/AdminEventDetail';
import AdminParticipantManagement from './components/AdminParticipantManagement';
import AdminEvaluators from './components/AdminEvaluators';
import AdminAttendance from './components/AdminAttendance';
import EvaluatorLogin from './components/EvaluatorLogin';
import EvaluatorPortal from './components/EvaluatorPortal';
import PublicProfile from './components/PublicProfile';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard.html" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/complete-profile" element={<CompleteProfile />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/events" element={<EventsList />} />
        <Route path="/events/:id" element={<EventDetails />} />
        <Route path="/profile/:id" element={<PublicProfile />} />
        <Route path="/admin/events" element={<AdminEvents />} />
        <Route path="/admin/events/:id" element={<AdminEventDetail />} />
        <Route path="/admin/events/:id/participants" element={<AdminParticipantManagement />} />
        <Route path="/admin/events/:id/evaluators" element={<AdminEvaluators />} />
        <Route path="/admin/events/:id/attendance" element={<AdminAttendance />} />
        <Route path="/evaluator/login" element={<EvaluatorLogin />} />
        <Route path="/evaluator/portal" element={<EvaluatorPortal />} />
        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
