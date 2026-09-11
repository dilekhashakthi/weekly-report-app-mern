import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';

import Login from './pages/Login';
import Register from './pages/Register';
import MyReportPage from './pages/MyReportPage';
import ReportHistory from './pages/ReportHistory';
import ReportDetail from './pages/ReportDetail';
import TeamDashboard from './pages/TeamDashboard';
import ReviewQueue from './pages/ReviewQueue';
import TeamMemberProfile from './pages/TeamMemberProfile';
import ProjectManagement from './pages/ProjectManagement';
import UserManagement from './pages/UserManagement';

function RoleHome() {
  const { user } = useAuth();
  return <Navigate to={user?.role === 'manager' ? '/app/dashboard' : '/app/history'} replace />;
}

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<RoleHome />} />

          {/* Member pages */}
          <Route path="report" element={<ProtectedRoute roles={['member']}><MyReportPage /></ProtectedRoute>} />
          <Route path="history" element={<ProtectedRoute roles={['member']}><ReportHistory /></ProtectedRoute>} />

          {/* Reports pages */}
          <Route path="reports/:id" element={<ReportDetail />} />

          {/* Manager pages */}
          <Route path="dashboard" element={<ProtectedRoute roles={['manager']}><TeamDashboard /></ProtectedRoute>} />
          <Route path="review-queue" element={<ProtectedRoute roles={['manager']}><ReviewQueue /></ProtectedRoute>} />
          <Route path="team/:memberId" element={<ProtectedRoute roles={['manager']}><TeamMemberProfile /></ProtectedRoute>} />
          <Route path="projects" element={<ProtectedRoute roles={['manager']}><ProjectManagement /></ProtectedRoute>} />
          <Route path="users" element={<ProtectedRoute roles={['manager']}><UserManagement /></ProtectedRoute>} />
        </Route>

        <Route path="/" element={<Navigate to="/app" replace />} />
        <Route path="*" element={<Navigate to="/app" replace />} />
      </Routes>

      <Toaster
        position="top-right"
        containerStyle={{
          top: 50,
        }}
        toastOptions={{
          duration: 3500,
          style: {
            background: '#fff',
            color: '#1b1b1b',
            fontSize: '14px',
            fontWeight: 600,
            borderRadius: '8px',
            padding: '10px 16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          },
          success: {
            iconTheme: {
              primary: '#008000',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#FF0B0B',
              secondary: '#fff',
            },
          },
        }}
      />
    </>
  );
};

export default App;
