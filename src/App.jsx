import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import CourseDetail from './pages/CourseDetail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Footer from './components/Footer';

// Pages qui possèdent leur propre affichage dédié (sans barre ni pied de page publics)
const PAGES_WITHOUT_LAYOUT = [
  '/login',
  '/register',
  '/forgot-password',
  '/student-dashboard',
  '/profile',
  '/teacher-dashboard',
];

function AppContent() {
  const { pathname } = useLocation();
  const { user } = useContext(AuthContext);

  // Masquer la barre publique et le pied de page sur les pages d'authentification (pour supprimer tout scroll),
  // sur les dashboards connectés et dans le lecteur de cours
  const hideLayout =
    PAGES_WITHOUT_LAYOUT.includes(pathname) ||
    pathname.startsWith('/reset-password') ||
    (pathname.startsWith('/courses/') && !!user);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-600 selection:text-white">
      {!hideLayout && <Navbar />}
      <Routes>
        <Route path="/" element={<Landing />} />
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
