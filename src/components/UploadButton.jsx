// src/components/UploadButton.jsx
import React, { useRef, useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { Upload, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const UploadButton = ({ track }) => {
  const { uploadFileForTrack, removeFileFromTrack, isUploading } = usePlayer();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null); // 'idle' | 'uploading' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = async (file) => {
    if (!file) return;
    
    // بررسی نوع فایل
    const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/flac', 'audio/wav', 'audio/m4a', 'audio/aac', 'audio/ogg'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(mp3|flac|wav|m4a|aac|ogg)$/i)) {
      setUploadStatus('error');
      setErrorMessage('فرمت فایل پشتیبانی نمی‌شود. فرمت‌های مجاز: MP3, FLAC, WAV, M4A, AAC, OGG');
      setTimeout(() => setUploadStatus(null), 3000);
      return;
    }

    // بررسی حجم فایل (حداکثر ۵۰MB)
    if (file.size > 50 * 1024 * 1024) {
      setUploadStatus('error');
      setErrorMessage('حجم فایل بیشتر از ۵۰MB است');
      setTimeout(() => setUploadStatus(null), 3000);
      return;
    }

    setUploadStatus('uploading');
    const result = await uploadFileForTrack(track.id, file);
    
    if (result.success) {
      setUploadStatus('success');
      setTimeout(() => setUploadStatus(null), 2000);
    } else {
      setUploadStatus('error');
      setErrorMessage(result.error || 'خطا در آپلود فایل');
      setTimeout(() => setUploadStatus(null), 3000);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleRemove = async () => {
    await removeFileFromTrack(track.id);
    setUploadStatus(null);
  };

  // اگر فایل آپلود شده است
  if (track.hasFile) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-green-400 flex items-center gap-1">
          <CheckCircle size={14} />
          آپلود شده
        </span>
        <button
          onClick={handleRemove}
          className="text-white/20 hover:text-red-400 transition p-1 rounded-full hover:bg-red-500/10"
          title="حذف فایل"
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  // وضعیت‌های مختلف
  if (uploadStatus === 'uploading') {
    return (
      <div className="flex items-center gap-2 text-purple-400">
        <Loader2 size={16} className="animate-spin" />
        <span className="text-xs">در حال آپلود...</span>
      </div>
    );
  }

  if (uploadStatus === 'success') {
    return (
      <div className="flex items-center gap-2 text-green-400">
        <CheckCircle size={16} />
        <span className="text-xs">آپلود شد!</span>
      </div>
    );
  }

  if (uploadStatus === 'error') {
    return (
      <div className="flex items-center gap-2 text-red-400">
        <AlertCircle size={16} />
        <span className="text-xs">{errorMessage}</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <input
        ref={fileInputRef}
        type="file"
        accept=".mp3,.flac,.wav,.m4a,.aac,.ogg,audio/*"
        onChange={(e) => {
          const file = e.target.files[0];
          if (file) handleFileSelect(file);
          e.target.value = '';
        }}
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`text-white/30 hover:text-white transition p-1.5 rounded-full hover:bg-white/5 ${
          isDragging ? 'bg-purple-500/20 border-2 border-purple-400 border-dashed' : ''
        }`}
        title="آپلود فایل صوتی (کلیک یا drag & drop)"
        disabled={isUploading}
      >
        <Upload size={16} />
      </button>
      
      {/* نشانگر drag & drop */}
      {isDragging && (
        <div className="absolute inset-0 bg-purple-500/10 border-2 border-purple-400 border-dashed rounded-full flex items-center justify-center">
          <span className="text-xs text-purple-400">رها کنید</span>
        </div>
      )}
    </div>
  );
};

export default UploadButton;
