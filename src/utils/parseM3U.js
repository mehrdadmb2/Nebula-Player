/**
 * پارس کردن فایل M3U8 با پشتیبانی از مسیرهای ویندوز/یونیکس و فرمت‌های مختلف اسم
 */
export function parseM3U(content) {
  const lines = content.split('\n').filter(line => line.trim() !== '' && !line.startsWith('#'));

  return lines.map((line, index) => {
    const cleanPath = line.trim();
    // 1. استخراج نام فایل از مسیر (هم \ و هم / را پشتیبانی کن)
    const fileNameWithExt = cleanPath.split(/[\\/]/).pop();
    // 2. حذف پسوند (mp3, flac, m4a, ...)
    const fullName = fileNameWithExt.replace(/\.[^.]+$/, '');

    let artist = 'Unknown Artist';
    let title = fullName;

    // 3. تلاش برای جدا کردن Artist - Title (پشتیبانی از جداکننده‌های مختلف)
    const separators = [' - ', ' – ', ' _ ', ' — ', '-'];
    let found = false;
    for (const sep of separators) {
      if (fullName.includes(sep)) {
        const parts = fullName.split(sep);
        // اگر بیشتر از دو بخش داشت، دو بخش اول را بگیر
        if (parts.length >= 2) {
          artist = parts[0].trim() || 'Unknown';
          // بقیه را به عنوان عنوان در نظر بگیر (برای مواردی که خود عنوان شامل - است)
          title = parts.slice(1).join(sep).trim() || fullName;
          found = true;
          break;
        }
      }
    }

    // اگر جداکننده پیدا نشد، سعی می‌کنیم با فاصله یا حروف بزرگ تشخیص دهیم (حالت پیشفرض)
    if (!found) {
      // اگر خط فاصله داشت ولی با فاصله نبود مثل "Artist-Title"
      if (fullName.includes('-')) {
        const idx = fullName.indexOf('-');
        artist = fullName.substring(0, idx).trim() || 'Unknown';
        title = fullName.substring(idx + 1).trim() || fullName;
      } else {
        // در غیر این صورت، کل اسم را title و artist را Unknown می‌گذاریم
        title = fullName;
        artist = 'Unknown Artist';
      }
    }

    return {
      id: `track-${index}`,
      rawPath: cleanPath,
      artist,
      title,
      // برای نمایش، اگر خیلی طولانی بود برش بزن
      displayName: `${artist} - ${title}`.length > 50 ? `${artist} - ${title}`.substring(0, 50) + '...' : `${artist} - ${title}`,
      // اطلاعات تکمیلی که بعداً از API پر می‌شود
      cover: null,
      lyrics: null,
      spotifyId: null,
      // برای پخش، کاربر باید فایل را آپلود کند یا لینک ابری بدهد. فعلاً null
      audioUrl: null,
    };
  });
}
