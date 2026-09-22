export interface ParsedVideo {
  type: 'youtube' | 'vimeo' | 'html5' | 'unknown';
  embedUrl: string;
  originalUrl: string;
  videoId?: string;
}

export const parseVideoUrl = (url: string): ParsedVideo => {
  if (!url) {
    return {
      type: 'unknown',
      embedUrl: '',
      originalUrl: ''
    };
  }

  const clean = url.trim();

  // YouTube matchers
  const ytMatch = clean.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/i);
  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1`,
      originalUrl: clean,
      videoId
    };
  }

  // Vimeo matchers
  const vimeoMatch = clean.match(/(?:vimeo\.com\/)(\d+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    const videoId = vimeoMatch[1];
    return {
      type: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${videoId}?autoplay=0`,
      originalUrl: clean,
      videoId
    };
  }

  // Direct MP4 / WebM / Google Storage / HTML5 video
  if (clean.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i) || clean.includes('commondatastorage.googleapis.com')) {
    return {
      type: 'html5',
      embedUrl: clean,
      originalUrl: clean
    };
  }

  // Fallback to HTML5 if it looks like a direct URL or unknown
  return {
    type: 'html5',
    embedUrl: clean,
    originalUrl: clean
  };
};

export const formatDuration = (seconds: number): string => {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const parseTimeStringToSeconds = (timeStr: string): number => {
  const parts = timeStr.trim().split(':').map(Number);
  if (parts.length === 2) {
    return (parts[0] * 60) + (parts[1] || 0);
  }
  if (parts.length === 3) {
    return (parts[0] * 3600) + (parts[1] * 60) + (parts[2] || 0);
  }
  return 0;
};
