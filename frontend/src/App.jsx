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
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/dashboard.html" element={<Navigate to="/dashboard" replace />} />
        <Route path="/complete-profile" element={<ProtectedRoute><CompleteProfile /></ProtectedRoute>} />
        <Route path="/edit-profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
        <Route path="/events" element={<ProtectedRoute><EventsList /></ProtectedRoute>} />
        <Route path="/events/:id" element={<ProtectedRoute><EventDetails /></ProtectedRoute>} />
        
        {/* Admin Routes */}
        <Route path="/admin/events" element={<ProtectedRoute><AdminEvents /></ProtectedRoute>} />
        <Route path="/admin/events/:id" element={<ProtectedRoute><AdminEventDetail /></ProtectedRoute>} />
        <Route path="/admin/events/:id/participants" element={<ProtectedRoute><AdminParticipantManagement /></ProtectedRoute>} />
        <Route path="/admin/events/:id/evaluators" element={<ProtectedRoute><AdminEvaluators /></ProtectedRoute>} />
        <Route path="/admin/events/:id/attendance" element={<ProtectedRoute><AdminAttendance /></ProtectedRoute>} />
        
        {/* Public/Other Routes */}
        <Route path="/profile/:id" element={<PublicProfile />} />
        <Route path="/evaluator/login" element={<EvaluatorLogin />} />
        <Route path="/evaluator/portal" element={<EvaluatorPortal />} />
        
        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
