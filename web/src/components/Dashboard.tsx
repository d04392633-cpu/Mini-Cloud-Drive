import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sidebar } from './Sidebar';
import { MobileHeader } from './MobileHeader';
import { FileUpload } from './FileUpload';
import api from '../api/axios';
import { File, RefreshCw } from 'lucide-react';

interface FileItem {
  id: number;
  user_id: number;
  filename: string;
  original_name: string;
  size: number;
  created_at: string;
}

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [actionType, setActionType] = useState<'download' | 'delete' | null>(null);

  // Fetch all files
  const fetchFiles = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/MyFiles');
      if (response.data && Array.isArray(response.data)) {
        setFiles(response.data);
      } else {
        setFiles([]);
      }
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 401) {
        logout();
      } else {
        setError(err.response?.data?.error || err.message || 'Не удалось загрузить список файлов');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  // Download file
  const handleDownload = async (file: FileItem) => {
    setActionLoadingId(file.id);
    setActionType('download');
    try {
      const response = await api.get(`/files/${file.id}/download`, {
        responseType: 'blob',
      });
      
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.original_name);
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error(err);
      alert('Ошибка при скачивании файла: ' + (err.response?.data?.error || err.message));
    } finally {
      setActionLoadingId(null);
      setActionType(null);
    }
  };

  // Delete file
  const handleDelete = async (file: FileItem) => {
    const backendMessage = "Удалить файл";
    if (!window.confirm(`${backendMessage} "${file.original_name}"?`)) {
      return;
    }

    setActionLoadingId(file.id);
    setActionType('delete');
    try {
      const response = await api.delete(`/delete/${file.id}`);
      // Backend returns field massege with typo
      const deleteMsg = response.data?.massege || response.data?.message || 'Файл успешно удален';
      console.log('Delete response:', deleteMsg);
      await fetchFiles();
    } catch (err: any) {
      console.error(err);
      alert('Ошибка при удалении файла: ' + (err.response?.data?.error || err.message));
    } finally {
      setActionLoadingId(null);
      setActionType(null);
    }
  };

  // Format File Size
  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format Date
  const formatDate = (dateStr: string) => {
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

  // Filter files by search query
  const filteredFiles = files.filter(file => 
    file.original_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="dashboard-layout" id="dashboard-page-layout">
      {/* Sidebar - responsive */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="main-wrapper">
        {/* Mobile Header Bar */}
        <MobileHeader onMenuToggle={() => setSidebarOpen(true)} title="Мои файлы" />

        {/* Desktop Header */}
        <header className="header-navbar desktop-only-header">
          <div className="breadcrumb-zone">
            <span className="breadcrumb-item">Главная</span>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-item active">Мои файлы</span>
          </div>

          <div className="search-container">
            <span className="search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="Поиск файлов..." 
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="user-profile-zone">
            <div className="profile-info">
              <div className="user-meta">
                <div className="user-display-name">{user?.full_name || user?.email?.split('@')[0]}</div>
                <div className="user-role-tag">{user?.email}</div>
              </div>
              <div className="avatar">
                {user?.full_name ? user.full_name.charAt(0).toUpperCase() : (user?.email ? user.email.charAt(0).toUpperCase() : 'U')}
              </div>
            </div>
            <button onClick={logout} className="btn-header-logout" title="Выйти из системы">
              Выйти
            </button>
          </div>
        </header>

        {/* Page Body */}
        <main className="dashboard-content-area" id="dashboard-main-content">
          <div className="page-title-row">
            <h1>Мои файлы</h1>
            <div className="mobile-search-bar">
              <span className="search-icon">🔍</span>
              <input 
                type="text" 
                placeholder="Поиск файлов..." 
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* New Drag and Drop FileUpload component */}
          <FileUpload onUploadSuccess={fetchFiles} />

          {error && <div className="error-message-panel" id="dashboard-error-panel">{error}</div>}

          {/* File Storage list representation (Table on Desktop, Cards on Mobile) */}
          <div className="table-card" id="files-list-container">
            <div className="table-card-header">
              <span className="table-card-title">Файлы ({filteredFiles.length})</span>
              <button onClick={fetchFiles} className="btn-refresh" title="Обновить" disabled={loading} id="btn-refresh-files">
                <RefreshCw className={`refresh-icon ${loading ? 'spin' : ''}`} style={{ width: 14, height: 14 }} />
              </button>
            </div>

            <div className="table-responsive-wrapper">
              {loading && files.length === 0 ? (
                <div className="panel-loading-state" id="files-loading-indicator">
                  <RefreshCw className="spin" style={{ width: 24, height: 24, marginBottom: 12, color: 'var(--color-primary)' }} />
                  <span>Загрузка файлов...</span>
                </div>
              ) : filteredFiles.length === 0 ? (
                <div className="panel-empty-state" id="files-empty-state">
                  <div className="panel-empty-icon-box">
                    <File className="panel-empty-icon" />
                  </div>
                  <h3>Нет файлов</h3>
                  {searchQuery ? (
                    <p>По запросу "{searchQuery}" ничего не найдено</p>
                  ) : (
                    <p>Перетащите файл в область выше или нажмите для выбора, чтобы начать загрузку</p>
                  )}
                </div>
              ) : (
                <>
                  {/* Desktop Table View */}
                  <table className="geometric-table desktop-table-only" id="files-desktop-table">
                    <thead>
                      <tr>
                        <th>Имя файла</th>
                        <th>Размер</th>
                        <th>Дата загрузки</th>
                        <th style={{ textAlign: 'right' }}>Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredFiles.map((file) => {
                        const ext = file.original_name.split('.').pop()?.toLowerCase();
                        let colorClass = 'blue';
                        if (ext === 'pdf') colorClass = 'red';
                        else if (ext === 'png' || ext === 'jpg' || ext === 'jpeg' || ext === 'gif') colorClass = 'green';
                        else if (ext === 'xlsx' || ext === 'xls' || ext === 'csv') colorClass = 'amber';

                        return (
                          <tr key={file.id}>
                            <td>
                              <div className="file-cell">
                                <div className={`file-cell-icon-box ${colorClass}`}>
                                  <File style={{ width: 18, height: 18 }} />
                                </div>
                                <span className="file-cell-name" title={file.original_name}>
                                  {file.original_name}
                                </span>
                              </div>
                            </td>
                            <td>
                              <span className="file-cell-size" title={`${file.size} байт`}>
                                {formatSize(file.size)}
                              </span>
                            </td>
                            <td>
                              <span className="file-cell-date">
                                {formatDate(file.created_at)}
                              </span>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <div className="table-actions">
                                <button 
                                  onClick={() => handleDownload(file)} 
                                  disabled={actionLoadingId === file.id}
                                  className="btn-table-action btn-table-download"
                                >
                                  {actionLoadingId === file.id && actionType === 'download' ? 'Загрузка...' : 'Скачать'}
                                </button>
                                <button 
                                  onClick={() => handleDelete(file)} 
                                  disabled={actionLoadingId === file.id}
                                  className="btn-table-action btn-table-delete"
                                >
                                  {actionLoadingId === file.id && actionType === 'delete' ? 'Удаление...' : 'Удалить'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {/* Mobile Cards View */}
                  <div className="mobile-cards-only" id="files-mobile-cards">
                    {filteredFiles.map((file) => {
                      const ext = file.original_name.split('.').pop()?.toLowerCase();
                      let colorClass = 'blue';
                      if (ext === 'pdf') colorClass = 'red';
                      else if (ext === 'png' || ext === 'jpg' || ext === 'jpeg' || ext === 'gif') colorClass = 'green';
                      else if (ext === 'xlsx' || ext === 'xls' || ext === 'csv') colorClass = 'amber';

                      return (
                        <div className="mobile-file-card" key={file.id}>
                          <div className="card-top-info">
                            <div className={`file-cell-icon-box ${colorClass}`}>
                              <File style={{ width: 18, height: 18 }} />
                            </div>
                            <div className="card-meta-details">
                              <span className="card-file-name" title={file.original_name}>
                                {file.original_name}
                              </span>
                              <div className="card-sub-stats">
                                <span className="card-file-size">{formatSize(file.size)}</span>
                                <span className="card-bullet">•</span>
                                <span className="card-file-date">{formatDate(file.created_at)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="card-action-bar">
                            <button 
                              onClick={() => handleDownload(file)} 
                              disabled={actionLoadingId === file.id}
                              className="btn-card-action download"
                            >
                              {actionLoadingId === file.id && actionType === 'download' ? 'Скачивание...' : 'Скачать'}
                            </button>
                            <button 
                              onClick={() => handleDelete(file)} 
                              disabled={actionLoadingId === file.id}
                              className="btn-card-action delete"
                            >
                              {actionLoadingId === file.id && actionType === 'delete' ? 'Удаление...' : 'Удалить'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
