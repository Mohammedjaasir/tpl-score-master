export function parseYoutubeEmbedUrl(inputUrl: string): string | null {
  if (!inputUrl || inputUrl.trim() === "") return null;

  const url = inputUrl.trim();

  // If it's already an embed URL, just ensure autoplay and mute parameters exist
  if (url.includes("youtube.com/embed/")) {
    try {
      const parsed = new URL(url);
      parsed.searchParams.set("autoplay", "1");
      parsed.searchParams.set("mute", "1");
      return parsed.toString();
    } catch {
      return url; // fallback if URL is somehow invalid
    }
  }

  // Handle standard watch URLs: https://www.youtube.com/watch?v=ID
  const watchRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/\s]+)/;
  const match = url.match(watchRegex);

  if (match && match[1]) {
    const videoId = match[1];
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`;
  }

  // Handle youtube.com/live/ID
  const liveRegex = /youtube\.com\/live\/([^&?/\s]+)/;
  const liveMatch = url.match(liveRegex);
  
  if (liveMatch && liveMatch[1]) {
    const videoId = liveMatch[1];
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`;
  }

  // Return the original URL if we can't parse it (could be another platform)
  return url;
}
