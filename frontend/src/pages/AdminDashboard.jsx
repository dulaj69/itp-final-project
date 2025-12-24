import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import AdminHome from './admin/AdminHome';
import AddUserPage from './admin/users/AddUserPage';
import UserDetailsPage from './admin/users/UserDetailsPage';
import AdminNotificationsPage from './admin/AdminNotificationsPage';
import AdminReportsPage from './admin/AdminReportsPage';
import AdminBackupPage from './admin/AdminBackupPage';
import AdminInquiriesPage from './admin/AdminInquiriesPage';
import AdminFeedbackPage from './admin/AdminFeedbackPage';

const AdminDashboard = () => {
  return (
    <div style={{ display: 'flex' }}>
      <AdminSidebar />
      <div style={{ flex: 1, padding: '20px' }}>
        <Routes>
          <Route path="/" element={<AdminHome />} />
          <Route path="/users/add" element={<AddUserPage />} />
          <Route path="/users/details" element={<UserDetailsPage />} />
          <Route path="/notifications" element={<AdminNotificationsPage />} />
          <Route path="/reports" element={<AdminReportsPage />} />
          <Route path="/backup" element={<AdminBackupPage />} />
          <Route path="/inquiries" element={<AdminInquiriesPage />} />
          <Route path="/feedback" element={<AdminFeedbackPage />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard; 