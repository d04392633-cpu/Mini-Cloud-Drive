import React, { useState, useRef } from 'react';
import api from '../api/axios';
import { Upload, File, CheckCircle2, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  onUploadSuccess: () => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onUploadSuccess }) => {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      setStatus('idle');
      setProgress(null);
      setErrorMessage('');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setStatus('idle');
      setProgress(null);
      setErrorMessage('');
    }
  };

  const handleUpload = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedFile) return;

    setStatus('uploading');
    setProgress(0);
    setErrorMessage('');

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      await api.post('/AddFiles', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(percentCompleted);
          }
        }
      });

      setStatus('success');
      setSelectedFile(null);
      setProgress(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Briefly show success feedback then reload file list
      setTimeout(() => {
        onUploadSuccess();
        setStatus('idle');
      }, 1000);

    } catch (err: any) {
      console.error('File upload error:', err);
      setStatus('error');
      setProgress(null);
      setErrorMessage(err.response?.data?.error || err.message || 'Ошибка загрузки файла');
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="upload-container" id="file-upload-zone">
      <div 
        className={`drag-drop-zone ${dragActive ? 'drag-active' : ''} ${status === 'uploading' ? 'uploading-state' : ''}`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => status !== 'uploading' && fileInputRef.current?.click()}
      >
        <input 
          ref={fileInputRef}
          type="file" 
          style={{ display: 'none' }}
          onChange={handleFileChange}
          disabled={status === 'uploading'}
        />

        <div className="zone-content">
          <Upload className={`upload-icon ${dragActive ? 'bounce' : ''}`} style={{ width: 32, height: 32, color: 'var(--color-primary)', marginBottom: 8 }} />
          <p className="zone-text-primary">
            {dragActive ? 'Отпустите файл здесь' : 'Перетащите файл сюда или нажмите для выбора'}
          </p>
          <p className="zone-text-secondary">Любые форматы файлов размером до 50MB</p>
        </div>
      </div>

      {selectedFile && status !== 'uploading' && (
        <div className="selected-file-card" id="selected-file-details">
          <div className="file-info-container">
            <File className="file-doc-icon" style={{ color: 'var(--color-primary)' }} />
            <div className="file-details">
              <span className="file-name">{selectedFile.name}</span>
              <span className="file-size">{formatSize(selectedFile.size)}</span>
            </div>
          </div>
          <div className="action-buttons">
            <button 
              className="btn-upload-action primary"
              onClick={handleUpload}
            >
              Загрузить
            </button>
            <button 
              className="btn-upload-action secondary"
              onClick={() => {
                setSelectedFile(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
            >
              Отмена
            </button>
          </div>
        </div>
      )}

      {status === 'uploading' && progress !== null && (
        <div className="upload-progress-container" id="upload-progress-card">
          <div className="progress-info">
            <span className="progress-label">Загрузка файла...</span>
            <span className="progress-value">{progress}%</span>
          </div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      )}

      {status === 'success' && (
        <div className="upload-status-banner success" id="upload-success-alert">
          <CheckCircle2 style={{ width: 18, height: 18 }} />
          <span>Файл успешно загружен!</span>
        </div>
      )}

      {status === 'error' && (
        <div className="upload-status-banner error" id="upload-error-alert">
          <AlertCircle style={{ width: 18, height: 18 }} />
          <span className="error-text">{errorMessage}</span>
          <button className="retry-btn" onClick={handleUpload}>Повторить</button>
        </div>
      )}
    </div>
  );
};
