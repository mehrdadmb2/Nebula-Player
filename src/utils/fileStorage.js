// src/utils/fileStorage.js
const DB_NAME = 'NebulaPlayerDB';
const STORE_NAME = 'audioFiles';
const DB_VERSION = 1;

let db = null;

// باز کردن دیتابیس
export const openDB = () => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };
    
    request.onupgradeneeded = (event) => {
      const database = event.target.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('trackId', 'trackId', { unique: true });
      }
    };
  });
};

// ذخیره فایل
export const saveAudioFile = async (trackId, file, metadata) => {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put({
      id: trackId,
      trackId: trackId,
      file: file,
      metadata: metadata,
      uploadedAt: new Date().toISOString()
    });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// دریافت فایل
export const getAudioFile = async (trackId) => {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(trackId);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// حذف فایل
export const deleteAudioFile = async (trackId) => {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(trackId);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

// دریافت همه فایل‌ها
export const getAllAudioFiles = async () => {
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// بررسی وجود فایل
export const hasAudioFile = async (trackId) => {
  const result = await getAudioFile(trackId);
  return !!result;
};
