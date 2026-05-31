import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Trophy, 
  LogOut, 
  User, 
  BookOpen, 
  LayoutDashboard, 
  Moon, 
  Sun, 
  Activity, 
  Settings 
} from 'lucide-react';

export default function Navbar({ activePage, navigateTo }) {
  const { user, logout, isAdmin } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <button 
          onClick={() => navigateTo('home')} 
          className="nav-brand"
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          🧠 <span>Quizora</span>
        </button>

        <ul className="nav-links">
          {user ? (
            <>
              <li>
                <button 
                  onClick={() => navigateTo('dashboard')} 
                  className={`nav-link ${activePage === 'dashboard' ? 'active' : ''}`}
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <LayoutDashboard size={18} />
                  <span>Dashboard</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigateTo('quizzes')} 
                  className={`nav-link ${activePage === 'quizzes' ? 'active' : ''}`}
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <BookOpen size={18} />
                  <span>Quizzes</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigateTo('leaderboard')} 
                  className={`nav-link ${activePage === 'leaderboard' ? 'active' : ''}`}
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <Trophy size={18} />
                  <span>Leaderboard</span>
                </button>
              </li>
              
              {isAdmin && (
                <>
                  <li>
                    <button 
                      onClick={() => navigateTo('admin-dashboard')} 
                      className={`nav-link ${activePage === 'admin-dashboard' ? 'active' : ''}`}
                      style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      <Settings size={18} />
                      <span>Admin</span>
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => navigateTo('admin-analytics')} 
                      className={`nav-link ${activePage === 'admin-analytics' ? 'active' : ''}`}
                      style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      <Activity size={18} />
                      <span>Analytics</span>
                    </button>
                  </li>
                </>
              )}

              <li>
                <button 
                  onClick={() => navigateTo('profile')} 
                  className={`nav-link ${activePage === 'profile' ? 'active' : ''}`}
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <User size={18} />
                  <span>{user.username}</span>
                </button>
              </li>
              
              <li>
                <button 
                  onClick={() => { logout(); navigateTo('home'); }} 
                  className="nav-link"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger-color)' }}
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <button 
                  onClick={() => navigateTo('login')} 
                  className={`nav-link ${activePage === 'login' ? 'active' : ''}`}
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Login
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigateTo('register')} 
                  className="btn btn-primary btn-hover-grow"
                >
                  Get Started
                </button>
              </li>
            </>
          )}

          <li>
            <button 
              onClick={toggleTheme} 
              className="theme-toggle-btn"
              title="Toggle Dark/Light Mode"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}
