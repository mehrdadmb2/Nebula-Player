export function parseM3U(content) {
  const lines = content.split('\n')
    .map(l => l.trim())
    .filter(l => l && !l.startsWith('#'));

  return lines.map((line, index) => {
    const cleanPath = line.trim();
    const fileNameWithExt = cleanPath.split(/[\\/]/).pop() || 'unknown';
    const fullName = fileNameWithExt.replace(/\.[^.]+$/, '');

    let artist = 'Unknown';
    let title = fullName;

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

    return {
      id: `track-${index}`,
      rawPath: cleanPath,
      artist,
      title,
      audioUrl: null, // کاربر می‌تواند فایل را آپلود کند یا لینک بدهد
      cover: null,    // توسط avatarGenerator پر می‌شود
      lyrics: '',     // کاربر خودش می‌تواند در مودال اضافه کند
    };
  });
}
