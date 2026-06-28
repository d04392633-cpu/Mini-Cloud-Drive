import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { LogOut, Upload, Download, Trash2, File, HardDrive, RefreshCw } from 'lucide-react';

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
  const [uploading, setUploading] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [actionType, setActionType] = useState<'download' | 'delete' | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

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
      setError(err.response?.data?.error || err.message || 'Не удалось загрузить список файлов');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Upload file
  const handleUploadSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      await api.post('/AddFiles', formData);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      await fetchFiles();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || err.message || 'Ошибка загрузки файла');
    } finally {
      setUploading(false);
    }
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

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
    if (!window.confirm(`Удалить файл "${file.original_name}"?`)) {
      return;
    }

    setActionLoadingId(file.id);
    setActionType('delete');
    try {
      await api.delete(`/delete/${file.id}`);
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
    <div className="dashboard-layout" onDragEnter={handleDrag} onDragOver={handleDrag}>
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <HardDrive style={{ width: 18, height: 18, color: 'white' }} />
          </div>
          <span className="sidebar-title">Mini Cloud</span>
        </div>
        
        <nav className="sidebar-nav">
          <div className="sidebar-link active">
            <File className="sidebar-link-icon" />
            <span>My Files</span>
          </div>
          <div className="sidebar-link" onClick={fetchFiles} style={{ cursor: 'pointer' }}>
            <RefreshCw className="sidebar-link-icon" />
            <span>Recent</span>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="storage-widget">
            <div className="storage-header">
              <span>Хранилище</span>
              <span>{files.length > 0 ? `${files.length} шт.` : 'Пусто'}</span>
            </div>
            <div className="storage-bar-bg">
              <div className="storage-bar-fill" style={{ width: files.length > 0 ? `${Math.min(files.length * 10, 100)}%` : '0%' }}></div>
            </div>
            <button className="btn-upgrade" onClick={() => alert('Учебный проект "Mini Cloud Drive" — все функции бесплатны!')}>
              Тариф: Учебный
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-wrapper">
        {/* Header */}
        <header className="header-navbar">
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
                <div className="user-display-name">{user ? user.email.split('@')[0] : 'Пользователь'}</div>
                <div className="user-role-tag">ID: {user?.id || '1024'}</div>
              </div>
              <div className="avatar">
                {user ? user.email.charAt(0).toUpperCase() : 'U'}
              </div>
            </div>
            <button onClick={logout} className="btn-header-logout" title="Выйти из системы">
              Выйти
            </button>
          </div>
        </header>

        {/* Page Body */}
        <div 
          className={`dashboard-content-area ${dragActive ? 'drag-over-active' : ''}`}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
        >
          <div className="page-title-row">
            <h1>Мой Диск</h1>
            <div className="action-buttons-group">
              <label htmlFor="dashboard-file-input" className="btn-select-file-label">
                <Upload />
                <span>Выбрать файл</span>
                <input 
                  type="file" 
                  id="dashboard-file-input" 
                  style={{ display: 'none' }} 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
              </label>
              <button 
                onClick={() => handleUploadSubmit()} 
                disabled={!selectedFile || uploading} 
                className="btn-upload-solid"
              >
                {uploading ? 'Загрузка...' : 'Загрузить файл'}
              </button>
            </div>
          </div>

          {/* Banner showing selected file ready to upload */}
          {selectedFile && (
            <div className="selected-file-banner">
              <div className="selected-file-banner-info">
                <File className="banner-file-icon" />
                <span className="banner-text">
                  Готов к загрузке: <strong>{selectedFile.name}</strong>
                  <span className="banner-text-size">({formatSize(selectedFile.size)})</span>
                </span>
              </div>
              <div className="banner-actions">
                <button 
                  onClick={() => handleUploadSubmit()} 
                  disabled={uploading} 
                  className="btn-banner-action btn-banner-upload"
                >
                  {uploading ? 'Загрузка...' : 'Загрузить'}
                </button>
                <button 
                  onClick={() => {
                    setSelectedFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }} 
                  disabled={uploading}
                  className="btn-banner-action btn-banner-cancel"
                >
                  Отмена
                </button>
              </div>
            </div>
          )}

          {error && <div className="error-message-panel">{error}</div>}

          {/* Elegant File Table Card */}
          <div className="table-card">
            <div className="table-card-header">
              <span className="table-card-title">Файлы ({filteredFiles.length})</span>
              <button onClick={fetchFiles} className="btn-refresh" title="Обновить" disabled={loading}>
                <RefreshCw className={`refresh-icon ${loading ? 'spin' : ''}`} style={{ width: 14, height: 14 }} />
              </button>
            </div>

            <div className="table-responsive-wrapper">
              {loading && files.length === 0 ? (
                <div className="panel-loading-state">
                  <RefreshCw className="spin" style={{ width: 24, height: 24, marginBottom: 12, color: 'var(--color-primary)' }} />
                  <span>Загрузка файлов...</span>
                </div>
              ) : filteredFiles.length === 0 ? (
                <div className="panel-empty-state">
                  <div className="panel-empty-icon-box">
                    <File className="panel-empty-icon" />
                  </div>
                  <h3>Нет файлов</h3>
                  {searchQuery ? (
                    <p>По запросу "{searchQuery}" ничего не найдено</p>
                  ) : (
                    <p>Загрузите свой первый файл с помощью кнопки "Выбрать файл" или перетащите его прямо на эту область</p>
                  )}
                </div>
              ) : (
                <table className="geometric-table">
                  <thead>
                    <tr>
                      <th>Оригинальное имя</th>
                      <th>Размер</th>
                      <th>Дата загрузки</th>
                      <th className="text-right">Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFiles.map((file) => {
                      // Determine visual color class based on extension
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
                          <td className="text-right">
                            <div className="table-actions">
                              <button 
                                onClick={() => handleDownload(file)} 
                                disabled={actionLoadingId === file.id}
                                className="btn-table-action btn-table-download"
                              >
                                {actionLoadingId === file.id && actionType === 'download' ? '...' : 'Скачать'}
                              </button>
                              <button 
                                onClick={() => handleDelete(file)} 
                                disabled={actionLoadingId === file.id}
                                className="btn-table-action btn-table-delete"
                              >
                                {actionLoadingId === file.id && actionType === 'delete' ? '...' : 'Удалить'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
