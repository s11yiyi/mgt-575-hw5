import { useMemo, useState } from 'react';
import { getChannelVideos, getVideoMetadata } from '../services/youtubeApi';
import './YouTubeDownload.css';

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

export default function YouTubeDownload({ user, onLogout }) {
  const [channelUrl, setChannelUrl] = useState('https://www.youtube.com/@veritasium');
  const [maxVideosInput, setMaxVideosInput] = useState('10');
  const [progress, setProgress] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const progressPct = useMemo(() => `${Math.round(progress)}%`, [progress]);

  const handleDownload = async () => {
    setDownloading(true);
    setError('');
    setResult(null);
    setProgress(0);
    try {
      const safeMax = clamp(Number(maxVideosInput) || 10, 1, 100);
      setMaxVideosInput(String(safeMax));
      const seed = await getChannelVideos(channelUrl, safeMax);
      const videos = [];
      for (let i = 0; i < seed.videos.length; i++) {
        const item = await getVideoMetadata(seed.videos[i]);
        videos.push(item);
        setProgress(((i + 1) / seed.videos.length) * 100);
      }
      const payload = {
        downloaded_at: new Date().toISOString(),
        requested_by: user.username,
        channel: {
          title: seed.channelTitle || '',
          channel_id: seed.channelId,
          channel_url: seed.channelUrl,
        },
        video_count: videos.length,
        videos,
      };
      setResult(payload);
    } catch (err) {
      setError(err.message || 'Download failed');
    } finally {
      setDownloading(false);
    }
  };

  const downloadJson = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const stamp = new Date().toISOString().slice(0, 10);
    a.download = `${result.channel.title || 'channel'}-${result.video_count}-videos-${stamp}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="yt-page">
      <div className="yt-topbar">
        <div className="yt-user">{user.firstName || user.username}</div>
        <button type="button" onClick={onLogout}>Log out</button>
      </div>
      <div className="yt-card">
        <h2>YouTube Channel Download</h2>
        <p>Download channel video metadata and save it as JSON for chat analysis.</p>
        <label htmlFor="channelUrl">YouTube Channel URL</label>
        <input
          id="channelUrl"
          type="url"
          value={channelUrl}
          onChange={(e) => setChannelUrl(e.target.value)}
          placeholder="https://www.youtube.com/@veritasium"
          disabled={downloading}
        />
        <label htmlFor="maxVideos">Max videos (1-100)</label>
        <input
          id="maxVideos"
          type="number"
          min={1}
          max={100}
          value={maxVideosInput}
          onChange={(e) => setMaxVideosInput(e.target.value)}
          disabled={downloading}
        />

        <button type="button" className="yt-download-btn" onClick={handleDownload} disabled={downloading}>
          {downloading ? 'Downloading...' : 'Download Channel Data'}
        </button>

        <div className="yt-progress">
          <div className="yt-progress-track">
            <div className="yt-progress-fill" style={{ width: progressPct }} />
          </div>
          <span>{progressPct}</span>
        </div>

        {error && <p className="yt-error">{error}</p>}

        {result && (
          <div className="yt-result">
            <p>
              Downloaded <strong>{result.video_count}</strong> videos from{' '}
              <strong>{result.channel.title || result.channel.channel_id}</strong>.
            </p>
            <button type="button" onClick={downloadJson}>Download JSON</button>
          </div>
        )}
      </div>
    </div>
  );
}
