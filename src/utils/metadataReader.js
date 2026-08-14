// src/utils/metadataReader.js
import * as mm from 'music-metadata-browser';

export const readAudioMetadata = async (file) => {
  try {
    const metadata = await mm.parseBlob(file);
    const { common, format } = metadata;
    
    // استخراج اطلاعات کامل
    return {
      title: common.title || file.name.replace(/\.[^.]+$/, ''),
      artist: common.artist || 'Unknown Artist',
      album: common.album || 'Unknown Album',
      genre: common.genre ? common.genre.join(', ') : '',
      year: common.year || '',
      trackNumber: common.track?.no || '',
      duration: format.duration || 0,
      bitrate: format.bitrate || 0,
      sampleRate: format.sampleRate || 0,
      codec: format.codec || '',
      cover: common.picture && common.picture.length > 0 
        ? `data:${common.picture[0].format};base64,${arrayBufferToBase64(common.picture[0].data)}`
        : null,
      // برای پشتیبانی از فرمت‌های مختلف
      format: format.container || file.type,
      size: file.size,
      lastModified: file.lastModified,
    };
  } catch (error) {
    console.warn('⚠️ خطا در خواندن متادیتا:', error);
    // در صورت خطا، اطلاعات پایه را از نام فایل استخراج کن
    return {
      title: file.name.replace(/\.[^.]+$/, ''),
      artist: 'Unknown Artist',
      album: 'Unknown Album',
      genre: '',
      year: '',
      duration: 0,
      bitrate: 0,
      sampleRate: 0,
      codec: '',
      cover: null,
      format: file.type,
      size: file.size,
      lastModified: file.lastModified,
    };
  }
};

// تبدیل ArrayBuffer به Base64
const arrayBufferToBase64 = (buffer) => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
};

// دریافت URL برای پخش
export const createAudioUrl = (file) => {
  return URL.createObjectURL(file);
};

// آزادسازی URL
export const revokeAudioUrl = (url) => {
  URL.revokeObjectURL(url);
};
