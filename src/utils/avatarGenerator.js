export function generateTrackCover(artist, title, size = 200) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // هش ساده برای تولید رنگ ثابت بر اساس نام خواننده
  let hash = 0;
  for (let i = 0; i < artist.length; i++) {
    hash = artist.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue1 = Math.abs(hash % 360);
  const hue2 = (hue1 + 40 + Math.abs(hash % 80)) % 360;

  // گرادیان زاویه‌دار
  const grad = ctx.createRadialGradient(0, 0, 10, size/2, size/2, size);
  grad.addColorStop(0, `hsl(${hue1}, 80%, 60%)`);
  grad.addColorStop(0.6, `hsl(${hue2}, 70%, 40%)`);
  grad.addColorStop(1, `hsl(${(hue1+30)%360}, 80%, 20%)`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // اضافه کردن افکت هولوگرافیک (خطوط مورب)
  ctx.globalAlpha = 0.1;
  for (let i = -size; i < size * 2; i += 20) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + size, size);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // نوشتن حروف اول
  const initial1 = artist.charAt(0).toUpperCase();
  const initial2 = title.charAt(0).toUpperCase();
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.font = `bold ${size * 0.35}px 'Inter', sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 15;
  ctx.fillText(`${initial1}${initial2}`, size/2, size/2);

  return canvas.toDataURL('image/png');
}
