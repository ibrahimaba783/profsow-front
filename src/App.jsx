import React, { useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Courses from './pages/Courses';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import AdminDashboard from './pages/AdminDashboard';
import CourseDetail from './pages/CourseDetail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Footer from './components/Footer';

// Pages sans Navbar ni Footer publics (dashboards et authentification plein écran comme Bakeli)
const PAGES_WITHOUT_LAYOUT = [
  '/student-dashboard',
  '/teacher-dashboard',
  '/admin-dashboard',
  '/profile',
  '/login',
  '/register',
  '/forgot-password',
];

function AppContent() {
  const { pathname } = useLocation();
  const { user } = useContext(AuthContext);
  const hideLayout =
    PAGES_WITHOUT_LAYOUT.includes(pathname) ||
    pathname.startsWith('/reset-password') ||
    (pathname.startsWith('/courses/') && !!user);

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
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/courses/:id" element={<CourseDetail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Routes>
      {!hideLayout && <Footer />}
    </div>
  );
}

// Composant pour replacer le scroll tout en haut lors de chaque changement de page
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}

function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <Router>
          <ScrollToTop />
          <AppContent />
        </Router>
      </SettingsProvider>
    </AuthProvider>
  );
}

export default App;
