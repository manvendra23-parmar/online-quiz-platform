import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';

// Page Views
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import QuizList from './pages/QuizList';
import QuizAttempt from './pages/QuizAttempt';
import Result from './pages/Result';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import AdminAnalytics from './pages/AdminAnalytics';

import './styles/main.css';
import './styles/dashboard.css';
import './styles/quiz.css';

function MainAppContent() {
  const { user, loading, authChecked, isAdmin } = useAuth();
  
  // Custom State Router Configuration
  const [page, setPage] = useState('home');
  const [params, setParams] = useState({});

  // Helper method for global routing transitions
  const navigateTo = (pageName, pageParams = {}) => {
    setPage(pageName);
    setParams(pageParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Enforce Route Protection guards dynamically in the state switcher
  useEffect(() => {
    if (!authChecked || loading) return;

    const privatePages = ['dashboard', 'quizzes', 'attempt', 'result', 'leaderboard', 'profile', 'admin-dashboard', 'admin-analytics'];
    const adminPages = ['admin-dashboard', 'admin-analytics'];

    if (privatePages.includes(page) && !user) {
      // Redirect unauthenticated requests to login page
      setPage('login');
      setParams({});
    } else if (adminPages.includes(page) && user && user.role !== 'admin') {
      // Redirect non-admins to standard dashboard
      setPage('dashboard');
      setParams({});
    } else if ((page === 'login' || page === 'register') && user) {
      // Redirect already logged-in users to dashboard
      setPage('dashboard');
      setParams({});
    }
  }, [page, user, loading, authChecked]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-app)' }}>
        <div className="spinner"></div>
        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--text-secondary)' }}>
          Securing assessment channels...
        </p>
      </div>
    );
  }

  // Routing renderer
  const renderPage = () => {
    switch (page) {
      case 'home':
        return <Home navigateTo={navigateTo} />;
      case 'login':
        return <Login navigateTo={navigateTo} />;
      case 'register':
        return <Register navigateTo={navigateTo} />;
      case 'dashboard':
        return <UserDashboard navigateTo={navigateTo} />;
      case 'quizzes':
        return <QuizList navigateTo={navigateTo} />;
      case 'attempt':
        return <QuizAttempt navigateTo={navigateTo} params={params} />;
      case 'result':
        return <Result navigateTo={navigateTo} params={params} />;
      case 'leaderboard':
        return <Leaderboard navigateTo={navigateTo} params={params} />;
      case 'profile':
        return <Profile />;
      case 'admin-dashboard':
        return <AdminDashboard />;
      case 'admin-analytics':
        return <AdminAnalytics />;
      default:
        return <Home navigateTo={navigateTo} />;
    }
  };

  return (
    <>
      {/* Decorative backdrop glowing rings */}
      <div className="bg-glow-orb bg-glow-orb-primary" />
      <div className="bg-glow-orb bg-glow-orb-secondary" />

      {/* Persistent dynamic navbar */}
      <Navbar activePage={page} navigateTo={navigateTo} />
      
      {/* Active page rendering */}
      <main style={{ minHeight: 'calc(100vh - 70px)' }}>
        {renderPage()}
      </main>
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainAppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
