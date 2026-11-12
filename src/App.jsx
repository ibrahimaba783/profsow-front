import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Courses from './pages/Courses';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import CourseDetail from './pages/CourseDetail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Footer from './components/Footer';

// Pages qui ont leur propre barre du haut : on masque la barre et le pied de page publics
const PAGES_WITHOUT_LAYOUT = ['/student-dashboard', '/teacher-dashboard', '/profile'];

function AppContent() {
  const { pathname } = useLocation();
  const { user } = useContext(AuthContext);
  const hideLayout =
    PAGES_WITHOUT_LAYOUT.includes(pathname) || (pathname.startsWith('/courses/') && !!user);

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-[#009688] selection:text-white">
      {!hideLayout && <Navbar />}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
        <Route path="/courses/:id" element={<CourseDetail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Routes>
      {!hideLayout && <Footer />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
