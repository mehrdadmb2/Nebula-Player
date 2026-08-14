export function generateTrackCover(artist, title, size = 300) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // هش برای تولید رنگ ثابت
  let hash = 0;
  for (let i = 0; i < artist.length; i++) {
    hash = artist.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue1 = Math.abs(hash % 360);
  const hue2 = (hue1 + 40 + Math.abs(hash % 80)) % 360;
  const hue3 = (hue2 + 40 + Math.abs(hash % 60)) % 360;

  // گرادیان پیشرفته
  const grad = ctx.createRadialGradient(
    size * 0.2, size * 0.2, size * 0.1,
    size * 0.5, size * 0.5, size * 0.8
  );
  grad.addColorStop(0, `hsl(${hue1}, 85%, 65%)`);
  grad.addColorStop(0.4, `hsl(${hue2}, 75%, 45%)`);
  grad.addColorStop(0.8, `hsl(${hue3}, 80%, 30%)`);
  grad.addColorStop(1, `hsl(${(hue1 + 30) % 360}, 80%, 15%)`);
  
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // افکت هولوگرافیک
  ctx.globalAlpha = 0.08;
  for (let i = -size; i < size * 2; i += 15) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + size, size);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // حلقه‌های تزئینی
  ctx.globalAlpha = 0.15;
  ctx.beginPath();
  ctx.arc(size/2, size/2, size * 0.35, 0, Math.PI * 2);
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.globalAlpha = 0.1;
  ctx.beginPath();
  ctx.arc(size/2, size/2, size * 0.5, 0, Math.PI * 2);
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.globalAlpha = 1;

  // حروف اول
  const initial1 = artist.charAt(0).toUpperCase();
  const initial2 = title.charAt(0).toUpperCase();
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  ctx.font = `bold ${size * 0.32}px 'Inter', system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = 20;
  ctx.fillText(`${initial1}${initial2}`, size/2, size/2);
  
  // زیرنویس (نام کامل خواننده به صورت کوچک)
  ctx.shadowBlur = 10;
  ctx.font = `${size * 0.07}px 'Inter', system-ui, sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.fillText(artist.length > 15 ? artist.substring(0, 12) + '...' : artist, size/2, size * 0.82);

  return canvas.toDataURL('image/png');
}
