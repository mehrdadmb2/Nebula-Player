// src/utils/parseM3U.js

export function parseM3U(content) {
  const lines = content.split('\n')
    .map(l => l.trim())
    .filter(l => l && !l.startsWith('#'));

  return lines.map((line, index) => {
    const cleanPath = line.trim();
    // استخراج نام کامل فایل با پسوند
    const fileNameWithExt = cleanPath.split(/[\\/]/).pop() || 'unknown.mp3';
    // حذف پسوند برای عنوان
    const fullName = fileNameWithExt.replace(/\.[^.]+$/, '');

    let artist = 'Unknown';
    let title = fullName;

    // جداکننده‌های مختلف
    const separators = [' - ', ' – ', ' _ ', ' — ', '-'];
    let found = false;
    for (const sep of separators) {
      if (fullName.includes(sep)) {
        const parts = fullName.split(sep);
        if (parts.length >= 2) {
          artist = parts[0].trim() || 'Unknown';
          title = parts.slice(1).join(sep).trim() || fullName;
          found = true;
          break;
        }
      }
    }
    if (!found && fullName.includes('-')) {
      const idx = fullName.indexOf('-');
      artist = fullName.substring(0, idx).trim() || 'Unknown';
      title = fullName.substring(idx + 1).trim() || fullName;
    }

    // 🔥 ساخت مسیر وب برای فایل صوتی
    // فرض می‌کنیم فایل در پوشه‌ی /music/ با همان نام اصلی قرار دارد
    const encodedFileName = encodeURIComponent(fileNameWithExt);
    const webAudioPath = `/music/${encodedFileName}`;

    return {
      id: `track-${index}`,
      rawPath: cleanPath,
      artist,
      title,
      audioUrl: webAudioPath, // ← اینجا مسیر وب را تنظیم می‌کنیم
      cover: null,
      lyrics: '',
      hasFile: true, // فرض می‌کنیم فایل در سرور وجود دارد
      metadata: null,
    };
  });
}
