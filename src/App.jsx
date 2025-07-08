import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Students from './pages/admin/Students';
import Notices from './pages/admin/Notices';
import Assignments from './pages/admin/Assignments';
import Profile from './pages/student/Profile';
import AssignmentsStudent from './pages/student/AssignmentsStudent';
import NoticesStudent from './pages/student/NoticesStudent';

// Test component
const TestRoute = () => {
  const navigate = useNavigate();
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>🧪 Test Route Working!</h1>
      <p>React Router is functioning correctly.</p>
      <button onClick={() => navigate('/')}>Go back to login</button>
    </div>
  );
};

// Protected Route Components
const AdminRoute = ({ children }) => {
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  console.log('AdminRoute check - isAdmin:', isAdmin);
  if (!isAdmin) {
    console.log('AdminRoute: Redirecting to login - not admin');
    return <Navigate to="/" replace />;
  }
  return children;
};

const StudentRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const isAdmin = localStorage.getItem('isAdmin');
  const student = localStorage.getItem('student');

  console.log('=== StudentRoute Debug ===');
  console.log('Token:', token ? 'Present' : 'Missing');
  console.log('isAdmin value:', `"${isAdmin}"`);
  console.log('Student data:', student ? 'Present' : 'Missing');
  console.log('Current URL:', window.location.pathname);

  // Simple check: if we have token and student data, allow access
  if (!token) {
    console.log('❌ No token - redirecting to login');
    return <Navigate to="/" replace />;
  }
  
  if (!student) {
    console.log('❌ No student data - redirecting to login');
    return <Navigate to="/" replace />;
  }

  // Only redirect if explicitly admin
  if (isAdmin === 'true') {
    console.log('❌ User is admin - redirecting to login');
    return <Navigate to="/" replace />;
  }

  console.log('✅ All checks passed - rendering student component');
  return children;
};

function App() {
  return (
    <Router>
      
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Test route */}
        <Route path="/test" element={<TestRoute />} />
        
        {/* Admin Routes */}
        <Route path="/admin">
          <Route index element={<Navigate to="/admin/students" replace />} />
          <Route 
            path="students" 
            element={
              <AdminRoute>
                <Students />
              </AdminRoute>
            } 
          />
          <Route 
            path="notices" 
            element={
              <AdminRoute>
                <Notices />
              </AdminRoute>
            } 
          />
          <Route 
            path="assignments" 
            element={
              <AdminRoute>
                <Assignments />
              </AdminRoute>
            } 
          />
        </Route>

        {/* Student Routes */}
        <Route path="/student">
          <Route 
            index 
            element={
              <StudentRoute>
                <Profile />
              </StudentRoute>
            } 
          />
          <Route 
            path="profile" 
            element={
              <StudentRoute>
                <Profile />
              </StudentRoute>
            } 
          />
          <Route 
            path="assignments" 
            element={
              <StudentRoute>
                <AssignmentsStudent />
              </StudentRoute>
            } 
          />
          <Route 
            path="notices" 
            element={
              <StudentRoute>
                <NoticesStudent />
              </StudentRoute>
            } 
          />
        </Route>

        {/* Catch all route - redirect to login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
