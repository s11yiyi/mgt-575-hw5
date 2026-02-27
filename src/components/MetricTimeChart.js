import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useRef } from 'react';

const asCsv = (points) => {
  const lines = ['date,value,title,video_url'];
  points.forEach((p) => {
    const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    lines.push([esc(p.date), esc(p.value), esc(p.title), esc(p.video_url)].join(','));
  });
  return lines.join('\n');
};

export default function MetricTimeChart({ payload, onEnlarge }) {
  const wrapRef = useRef(null);
  if (!payload?.points?.length) return null;

  const downloadData = () => {
    const blob = new Blob([asCsv(payload.points)], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${payload.metric || 'metric'}-vs-time.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPng = async () => {
    const svg = wrapRef.current?.querySelector('svg');
    if (!svg) return;
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width || 1200;
      canvas.height = img.height || 600;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        return;
      }
      ctx.fillStyle = '#101227';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      const pngUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = pngUrl;
      a.download = `${payload.metric || 'metric'}-vs-time.png`;
      a.click();
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  return (
    <div ref={wrapRef} className="metric-chart-wrap" onClick={() => onEnlarge?.(payload)} role="button" tabIndex={0}>
      <div className="metric-chart-header">
        <span>{payload.metric} vs time</span>
        <button type="button" onClick={(e) => { e.stopPropagation(); downloadPng(); }}>
          Download PNG
        </button>
        <button type="button" onClick={(e) => { e.stopPropagation(); downloadData(); }}>
          Download CSV
        </button>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={payload.points}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.12)" />
          <XAxis dataKey="date" stroke="rgba(255,255,255,0.65)" />
          <YAxis stroke="rgba(255,255,255,0.65)" />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#818cf8" strokeWidth={2} dot={{ r: 2 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
