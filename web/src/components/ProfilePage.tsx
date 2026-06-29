import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sidebar } from './Sidebar';
import { MobileHeader } from './MobileHeader';
import { User, Calendar, Mail, ShieldAlert, ArrowLeft, RefreshCw } from 'lucide-react';
import api from '../api/axios';

export const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/me');
      if (response.status === 200) {
        setProfileData(response.data);
      }
    } catch (err: any) {
      console.error('Failed to load profile:', err);
      if (err.response?.status === 401) {
        logout();
      } else {
        setError(err.response?.data?.error || err.message || 'Ошибка загрузки профиля');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Неизвестно';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const id = profileData?.id || profileData?.user_id || user?.id || '—';
  const email = profileData?.email || user?.email || '—';
  const fullName = profileData?.full_name || user?.full_name || '—';
  const createdAt = profileData?.created_at || user?.created_at || '';

  return (
    <div className="dashboard-layout" id="profile-page-layout">
      {/* Sidebar - responsive */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main-wrapper">
        {/* Mobile top bar */}
        <MobileHeader onMenuToggle={() => setSidebarOpen(true)} title="Профиль" />

        {/* Desktop Header */}
        <header className="header-navbar desktop-only-header">
          <div className="breadcrumb-zone">
            <span className="breadcrumb-item">Главная</span>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-item active">Профиль</span>
          </div>

          <div className="user-profile-zone">
            <div className="profile-info">
              <div className="user-meta">
                <div className="user-display-name">{fullName !== '—' ? fullName : (user?.full_name || 'Пользователь')}</div>
                <div className="user-role-tag">{email !== '—' ? email : user?.email}</div>
              </div>
              <div className="avatar">
                {fullName !== '—' ? fullName.charAt(0).toUpperCase() : (user?.full_name ? user.full_name.charAt(0).toUpperCase() : (email.charAt(0).toUpperCase()))}
              </div>
            </div>
            <button onClick={logout} className="btn-header-logout">
              Выйти
            </button>
          </div>
        </header>

        {/* Profile Content Area */}
        <main className="dashboard-content-area" id="profile-content">
          <div className="page-title-row">
            <div className="title-with-back">
              <Link to="/dashboard" className="btn-back-link" id="profile-back-link">
                <ArrowLeft style={{ width: 16, height: 16 }} />
                <span>Назад к файлам</span>
              </Link>
              <h1 className="profile-title-header">Мой профиль</h1>
            </div>
          </div>

          {loading ? (
            <div className="panel-loading-state" id="profile-loading">
              <RefreshCw className="spin" style={{ width: 24, height: 24, marginBottom: 12, color: 'var(--color-primary)' }} />
              <span>Загрузка данных профиля...</span>
            </div>
          ) : error ? (
            <div className="profile-error-card" id="profile-error">
              <ShieldAlert style={{ width: 48, height: 48, color: 'var(--color-danger)', marginBottom: 16 }} />
              <h3>Ошибка загрузки</h3>
              <p>{error}</p>
              <button onClick={fetchProfile} className="btn-upload-solid" style={{ marginTop: 16 }}>
                Попробовать снова
              </button>
            </div>
          ) : (
            <div className="profile-info-card" id="profile-details-card">
              <div className="profile-card-header">
                <div className="profile-big-avatar">
                  {fullName !== '—' ? fullName.charAt(0).toUpperCase() : (email.charAt(0).toUpperCase())}
                </div>
                <div className="profile-header-meta">
                  <h2>{fullName}</h2>
                  <span className="profile-role-badge">Пользователь Mini Cloud</span>
                </div>
              </div>

              <div className="profile-details-grid">
                <div className="profile-detail-item">
                  <div className="detail-icon-box">
                    <User style={{ width: 18, height: 18, color: 'var(--color-primary)' }} />
                  </div>
                  <div className="detail-text-group">
                    <span className="detail-label">Полное имя</span>
                    <span className="detail-value">{fullName}</span>
                  </div>
                </div>

                <div className="profile-detail-item">
                  <div className="detail-icon-box">
                    <Mail style={{ width: 18, height: 18, color: 'var(--color-primary)' }} />
                  </div>
                  <div className="detail-text-group">
                    <span className="detail-label">Электронная почта</span>
                    <span className="detail-value">{email}</span>
                  </div>
                </div>

                <div className="profile-detail-item">
                  <div className="detail-icon-box">
                    <span style={{ fontSize: 14, fontWeight: 'bold', color: 'var(--color-primary)' }}>ID</span>
                  </div>
                  <div className="detail-text-group">
                    <span className="detail-label">Идентификатор</span>
                    <span className="detail-value">#{id}</span>
                  </div>
                </div>

                <div className="profile-detail-item">
                  <div className="detail-icon-box">
                    <Calendar style={{ width: 18, height: 18, color: 'var(--color-primary)' }} />
                  </div>
                  <div className="detail-text-group">
                    <span className="detail-label">Дата регистрации</span>
                    <span className="detail-value">{formatDate(createdAt)}</span>
                  </div>
                </div>
              </div>

              <div className="profile-card-footer">
                <Link to="/dashboard" className="btn-upload-solid" style={{ textDecoration: 'none' }}>
                  Перейти в хранилище
                </Link>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
