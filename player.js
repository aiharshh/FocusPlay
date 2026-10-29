
const params = new URLSearchParams(window.location.search);

const videoId = params.get("video");
const startValue = params.get("start") || "0";

const titleElement = document.getElementById("videoTitle");
const channelElement = document.getElementById("channelName");
const videoPlayer = document.getElementById("videoPlayer");
const youtubeLink = document.getElementById("youtubeLink");

function showError(message) {
  titleElement.textContent = message;
  channelElement.textContent = "Please open a standard YouTube video.";
}

function getStartSeconds(value) {
  if (/^\d+$/.test(value)) {
    return Number(value);
  }

  const match = value.match(
    /^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/
  );

  if (!match) return 0;

  return Number(match[1] || 0) * 3600
    + Number(match[2] || 0) * 60
    + Number(match[3] || 0);
}

if (!videoId || !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
  showError("No valid video selected");
} else {
  const start = getStartSeconds(startValue);

  const embedUrl = new URL(
    `https://www.youtube.com/embed/${videoId}`
  );

  embedUrl.searchParams.set("rel", "0");
  embedUrl.searchParams.set("playsinline", "1");

  if (start > 0) {
    embedUrl.searchParams.set("start", String(start));
  }

  videoPlayer.src = embedUrl.href;

  youtubeLink.href =
    `https://www.youtube.com/watch?v=${videoId}`;

  document.title = "FocusPlay — Your space to focus";

  async function loadVideoDetails() {
    const oEmbedUrl = new URL(
      "https://www.youtube.com/oembed"
    );

    oEmbedUrl.searchParams.set(
      "url",
      youtubeLink.href
    );

    oEmbedUrl.searchParams.set("format", "json");

    try {
      const response = await fetch(oEmbedUrl.href);

      if (!response.ok) {
        throw new Error("Video details unavailable");
      }

      const data = await response.json();

      titleElement.textContent =
        data.title || "Untitled video";

      channelElement.textContent =
        data.author_name || "YouTube creator";
    } catch (error) {
      titleElement.textContent = "Your video is ready";
      channelElement.textContent =
        "Video details could not be loaded";
    }
  }

  loadVideoDetails();
}
