import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { File, User, LogOut, HardDrive } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`} id="app-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <HardDrive style={{ width: 18, height: 18, color: 'white' }} />
          </div>
          <span className="sidebar-title">Mini Cloud</span>
          {onClose && (
            <button className="sidebar-close-btn" onClick={onClose} aria-label="Close menu">
              ✕
            </button>
          )}
        </div>
        
        <nav className="sidebar-nav">
          <NavLink 
            to="/dashboard" 
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={onClose}
            id="nav-files"
          >
            <File className="sidebar-link-icon" />
            <span>Мои файлы</span>
          </NavLink>
          
          <NavLink 
            to="/profile" 
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={onClose}
            id="nav-profile"
          >
            <User className="sidebar-link-icon" />
            <span>Профиль</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user-brief">
            <div className="user-brief-avatar">
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : (user?.email ? user.email.charAt(0).toUpperCase() : 'U')}
            </div>
            <div className="user-brief-info">
              <span className="brief-name">{user?.full_name || 'Пользователь'}</span>
              <span className="brief-email">{user?.email || ''}</span>
            </div>
          </div>
          <button onClick={logout} className="btn-logout-sidebar" id="btn-logout-sidebar">
            <LogOut className="sidebar-link-icon" />
            <span>Выйти</span>
          </button>
        </div>
      </aside>
    </>
  );
};
