const STORAGE_KEY_PREFIX = "tpl_obs_stream_";
const GLOBAL_STREAM_KEY = "tpl_obs_stream_global";

/**
 * Format any stream URL (YouTube Live, YouTube Watch, YouTube Short, Twitch, Direct video)
 * into an embeddable URL that can render cleanly inside an iframe without X-Frame-Options blocks.
 */
export function formatStreamUrl(rawUrl: string): string {
  if (!rawUrl) return "";
  const trimmed = rawUrl.trim();
  if (!trimmed) return "";

  // 1. YouTube Live / Watch / Short / Embed URLs
  // https://www.youtube.com/live/D56BfP0cRC4
  const ytLiveMatch = trimmed.match(/youtube\.com\/live\/([a-zA-Z0-9_-]+)/);
  if (ytLiveMatch?.[1]) {
    return `https://www.youtube.com/embed/${ytLiveMatch[1]}?autoplay=1&mute=1&playsinline=1&controls=0&rel=0`;
  }

  // https://www.youtube.com/watch?v=D56BfP0cRC4
  const ytWatchMatch = trimmed.match(/(?:youtube\.com\/watch\?v=|youtube\.com\/v\/)([a-zA-Z0-9_-]+)/);
  if (ytWatchMatch?.[1]) {
    return `https://www.youtube.com/embed/${ytWatchMatch[1]}?autoplay=1&mute=1&playsinline=1&controls=0&rel=0`;
  }

  // https://youtu.be/D56BfP0cRC4
  const ytShortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (ytShortMatch?.[1]) {
    return `https://www.youtube.com/embed/${ytShortMatch[1]}?autoplay=1&mute=1&playsinline=1&controls=0&rel=0`;
  }

  // Already embed format: https://www.youtube.com/embed/D56BfP0cRC4
  if (trimmed.includes("youtube.com/embed/")) {
    if (!trimmed.includes("autoplay=1")) {
      const sep = trimmed.includes("?") ? "&" : "?";
      return `${trimmed}${sep}autoplay=1&mute=1&playsinline=1&controls=0&rel=0`;
    }
    return trimmed;
  }

  // 2. Twitch Channel
  const twitchMatch = trimmed.match(/twitch\.tv\/([a-zA-Z0-9_]+)/);
  if (twitchMatch?.[1]) {
    const hostname = typeof window !== "undefined" ? window.location.hostname : "localhost";
    return `https://player.twitch.tv/?channel=${twitchMatch[1]}&parent=${hostname}&autoplay=true&muted=true`;
  }

  return trimmed;
}

export const obsStreamRepository = {
  /**
   * Get the saved live stream URL (match-specific first, fallback to global default).
   */
  getStreamUrl(matchId?: string): string | null {
    if (typeof window === "undefined") return null;
    if (matchId) {
      const matchSpecific = window.localStorage.getItem(`${STORAGE_KEY_PREFIX}${matchId}`);
      if (matchSpecific) return matchSpecific;
    }
    return window.localStorage.getItem(GLOBAL_STREAM_KEY);
  },

  /**
   * Save the live stream URL (persisted both under match ID and global).
   */
  saveStreamUrl(matchId: string | undefined, url: string): string {
    if (typeof window === "undefined") return "";
    const formatted = formatStreamUrl(url);
    if (!formatted) {
      if (matchId) {
        window.localStorage.removeItem(`${STORAGE_KEY_PREFIX}${matchId}`);
      }
      window.localStorage.removeItem(GLOBAL_STREAM_KEY);
      return "";
    } else {
      if (matchId) {
        window.localStorage.setItem(`${STORAGE_KEY_PREFIX}${matchId}`, formatted);
      }
      window.localStorage.setItem(GLOBAL_STREAM_KEY, formatted);
      return formatted;
    }
  },

  /**
   * Remove the saved live stream URL.
   */
  removeStreamUrl(matchId?: string): void {
    if (typeof window === "undefined") return;
    if (matchId) {
      window.localStorage.removeItem(`${STORAGE_KEY_PREFIX}${matchId}`);
    }
    window.localStorage.removeItem(GLOBAL_STREAM_KEY);
  }
};
