const API = process.env.REACT_APP_API_URL || '';

const api = async (path, options = {}) => {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(text || res.statusText);
  return text ? JSON.parse(text) : {};
};

export const getChannelVideos = async (channelUrl, maxVideos) =>
  api('/api/youtube/channel-videos', {
    method: 'POST',
    body: JSON.stringify({ channelUrl, maxVideos }),
  });

export const getVideoMetadata = async (video) => {
  const params = new URLSearchParams({ videoId: video.videoId });
  return api(`/api/youtube/video-metadata?${params.toString()}`);
};
