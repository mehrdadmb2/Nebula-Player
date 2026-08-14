// src/utils/parseM3U.js

/**
 * پارس کردن فایل M3U8 و تولید خودکار مسیر وب برای فایل‌های صوتی
 */
export function parseM3U(content) {
  const lines = content.split('\n')
    .map(l => l.trim())
    .filter(l => l && !l.startsWith('#'));

  return lines.map((line, index) => {
    const cleanPath = line.trim();
    // 1. استخراج نام کامل فایل با پسوند (مثلاً changes.mp3)
    const fileNameWithExt = cleanPath.split(/[\\/]/).pop() || 'unknown.mp3';
    // 2. حذف پسوند برای نمایش عنوان
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

    // 🔥 تولید خودکار مسیر وب برای فایل صوتی
    // فرض می‌کنیم فایل در پوشه‌ی /music/ با همان نام اصلی قرار دارد
    const webAudioPath = `/music/${encodeURIComponent(fileNameWithExt)}`;

    return {
      id: `track-${index}`,
      rawPath: cleanPath,
      artist,
      title,
      // 🎯 اینجا مسیر وب را به عنوان audioUrl قرار می‌دهیم
      audioUrl: webAudioPath,
      cover: null,
      lyrics: '',
      // متادیتا از فایل خوانده نمی‌شود، اما می‌توانید بعداً با کتابخانه music-metadata-browser آن را بخوانید
      // فعلاً یک فیلد برای وضعیت فایل در نظر می‌گیریم
      hasFile: true, // فرض می‌کنیم فایل وجود دارد
      metadata: null,
    };
  });
}
