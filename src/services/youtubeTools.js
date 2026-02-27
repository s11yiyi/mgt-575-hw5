export const YT_TOOL_DECLARATIONS = [
  {
    name: 'generateImage',
    description:
      'Generate an image from a text prompt and the anchor image the user attached in chat. Return a renderable image URL.',
    parameters: {
      type: 'OBJECT',
      properties: {
        prompt: { type: 'STRING', description: 'Text prompt for image generation' },
      },
      required: ['prompt'],
    },
  },
  {
    name: 'plot_metric_vs_time',
    description:
      'Plot any numeric field (views, likes, comments, etc.) versus release date from loaded YouTube channel JSON.',
    parameters: {
      type: 'OBJECT',
      properties: {
        metric: { type: 'STRING', description: 'Numeric field name, e.g. view_count, like_count, comment_count' },
      },
      required: ['metric'],
    },
  },
  {
    name: 'play_video',
    description:
      'Select and return one video card from loaded channel JSON. Supports title substring match, ordinal position (first/second/third/…), or any superlative like most viewed, most liked, most commented, longest, shortest, least viewed, newest, oldest.',
    parameters: {
      type: 'OBJECT',
      properties: {
        query: { type: 'STRING', description: 'Video selector, e.g. "asbestos", "third", "most liked", "longest", "newest"' },
      },
      required: ['query'],
    },
  },
  {
    name: 'compute_stats_json',
    description:
      'Compute mean, median, std, min, and max for any numeric field from loaded YouTube channel JSON.',
    parameters: {
      type: 'OBJECT',
      properties: {
        field: { type: 'STRING', description: 'Numeric field name from the loaded JSON' },
      },
      required: ['field'],
    },
  },
];

const fmt = (n) => Number(n.toFixed(4));
const median = (vals) => {
  const sorted = [...vals].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

const norm = (s = '') => s.toLowerCase().replace(/[\s_-]+/g, '');

const parseDurationToSeconds = (value) => {
  if (value === null || value === undefined) return NaN;
  if (typeof value === 'number') return value;
  const s = String(value).trim();
  if (!s) return NaN;
  if (/^\d+(\.\d+)?$/.test(s)) return Number(s);
  const iso = s.match(/^(?:P)?(?:T)?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/i);
  if (!iso) return NaN;
  const h = Number(iso[1] || 0);
  const m = Number(iso[2] || 0);
  const sec = Number(iso[3] || 0);
  return h * 3600 + m * 60 + sec;
};

const FIELD_ALIASES = {
  like: ['like_count', 'likes', 'likecount'],
  likes: ['like_count', 'likes', 'likecount'],
  comment: ['comment_count', 'comments', 'commentcount'],
  comments: ['comment_count', 'comments', 'commentcount'],
  view: ['view_count', 'views', 'viewcount'],
  views: ['view_count', 'views', 'viewcount'],
  duration: ['duration', 'duration_seconds', 'length_seconds'],
};

const resolveField = (videos, requestedField) => {
  if (!videos.length) return requestedField;
  const fields = Object.keys(videos[0]);
  if (fields.includes(requestedField)) return requestedField;
  const normalizedRequested = norm(requestedField);
  const aliasCandidates = FIELD_ALIASES[normalizedRequested] || [];
  const aliasMatch = fields.find((f) => aliasCandidates.includes(norm(f)));
  if (aliasMatch) return aliasMatch;
  return fields.find((f) => norm(f) === normalizedRequested) || requestedField;
};

const numericValues = (videos, field) =>
  videos
    .map((v) => (norm(field).includes('duration') ? parseDurationToSeconds(v[field]) : Number(v[field])))
    .filter((n) => Number.isFinite(n));

const superlativeField = (q) => {
  if (/view/i.test(q)) return 'view_count';
  if (/like/i.test(q)) return 'like_count';
  if (/comment/i.test(q)) return 'comment_count';
  if (/long|duration/i.test(q)) return 'duration';
  if (/short/i.test(q)) return 'duration';
  return null;
};

const videoNumeric = (v, field) => {
  if (field === 'duration') return parseDurationToSeconds(v.duration);
  return Number(v[field]);
};

const findVideo = (videos, query = '') => {
  if (!videos.length) return null;
  const q = query.toLowerCase().trim();

  const ordinals = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth'];
  const idx = ordinals.findIndex((o) => q.includes(o));
  if (idx >= 0 && videos[idx]) return videos[idx];

  if (/\b(last)\b/.test(q)) return videos[videos.length - 1];

  if (/\b(newest|most recent|latest)\b/.test(q)) {
    return [...videos].sort((a, b) => new Date(b.release_date || 0) - new Date(a.release_date || 0))[0];
  }
  if (/\b(oldest|earliest)\b/.test(q)) {
    return [...videos].sort((a, b) => new Date(a.release_date || 0) - new Date(b.release_date || 0))[0];
  }

  const isMost = /\b(most|longest|highest|top|best|greatest)\b/.test(q);
  const isLeast = /\b(least|fewest|lowest|shortest|worst|smallest)\b/.test(q);
  if (isMost || isLeast) {
    const field = superlativeField(q);
    if (field) {
      const withVal = videos.filter((v) => Number.isFinite(videoNumeric(v, field)));
      if (withVal.length) {
        withVal.sort((a, b) => videoNumeric(a, field) - videoNumeric(b, field));
        return isMost ? withVal[withVal.length - 1] : withVal[0];
      }
    }
  }

  const titleMatch = videos.find((v) => v.title?.toLowerCase().includes(q));
  if (titleMatch) return titleMatch;

  return videos[0];
};

const pseudoImage = (prompt, hasAnchor) => {
  const scoped = `${prompt} ${hasAnchor ? 'style inspired by attached anchor image' : ''}`.trim();
  const encoded = encodeURIComponent(scoped);
  return `https://image.pollinations.ai/prompt/${encoded}?nologo=true&seed=42`;
};

export const executeYouTubeTool = (name, args, videos, anchorImages = []) => {
  switch (name) {
    case 'compute_stats_json': {
      const field = resolveField(videos, args.field || '');
      const vals = numericValues(videos, field);
      if (!vals.length) return { error: `No numeric values found for field "${field}"` };
      const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
      const variance = vals.reduce((a, b) => a + (b - mean) ** 2, 0) / vals.length;
      return {
        field,
        count: vals.length,
        mean: fmt(mean),
        median: fmt(median(vals)),
        std: fmt(Math.sqrt(variance)),
        min: Math.min(...vals),
        max: Math.max(...vals),
      };
    }
    case 'plot_metric_vs_time': {
      const metric = resolveField(videos, args.metric || '');
      const metricIsDuration = norm(metric).includes('duration');
      const points = videos
        .filter((v) => Number.isFinite(metricIsDuration ? parseDurationToSeconds(v[metric]) : Number(v[metric])) && v.release_date)
        .map((v) => ({
          date: v.release_date,
          value: metricIsDuration ? parseDurationToSeconds(v[metric]) : Number(v[metric]),
          title: v.title,
          video_url: v.video_url,
        }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));
      if (!points.length) return { error: `No data points found for metric "${metric}"` };
      return { _chartType: 'metric_time', metric, points };
    }
    case 'play_video': {
      const picked = findVideo(videos, args.query || '');
      if (!picked) return { error: 'No video found in loaded JSON data.' };
      return {
        _cardType: 'video',
        title: picked.title,
        thumbnail_url: picked.thumbnail_url || `https://i.ytimg.com/vi/${picked.video_id}/hqdefault.jpg`,
        video_url: picked.video_url,
      };
    }
    case 'generateImage': {
      const url = pseudoImage(args.prompt || '', anchorImages.length > 0);
      return {
        _artifactType: 'generated_image',
        prompt: args.prompt || '',
        image_url: url,
        has_anchor_image: anchorImages.length > 0,
      };
    }
    default:
      return { error: `Unknown tool ${name}` };
  }
};
