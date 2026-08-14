// src/utils/debug.js
export const debug = {
  log: (label, data) => {
    if (import.meta.env.DEV) {
      console.log(`🔍 ${label}:`, data);
    }
  },
  error: (label, err) => {
    if (import.meta.env.DEV) {
      console.error(`❌ ${label}:`, err);
    }
  },
};
