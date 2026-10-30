
const params = new URLSearchParams(window.location.search);

const videoId = params.get("video");
const startValue = params.get("start") || "0";

const titleElement = document.getElementById("videoTitle");
const channelElement = document.getElementById("channelName");
const videoPlayer = document.getElementById("videoPlayer");
const youtubeLink = document.getElementById("youtubeLink");

const storageKey = videoId
  ? `focusplay_progress_${videoId}`
  : null;

let savedTime = 0;
let currentTime = 0;
let playerReady = false;
let lastSavedTime = 0;

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

function sendPlayerCommand(func, args = []) {
  if (!videoPlayer.contentWindow) return;

  videoPlayer.contentWindow.postMessage(
    JSON.stringify({
      event: "command",
      func,
      args,
      id: 1,
      channel: "widget"
    }),
    "https://www.youtube.com"
  );
}

function saveProgress(time) {
  if (!storageKey || !Number.isFinite(time) || time <= 2) {
    return;
  }

  // Avoid unnecessary storage writes.
  if (Math.abs(time - lastSavedTime) < 4) {
    return;
  }

  lastSavedTime = time;

  chrome.storage.local.set({
    [storageKey]: time
  });
}

function clearProgress() {
  if (!storageKey) return;

  chrome.storage.local.remove(storageKey);
  savedTime = 0;
  currentTime = 0;
  lastSavedTime = 0;
}

function initializePlayer() {
  videoPlayer.addEventListener("load", () => {
    // Establish communication with the YouTube iframe.
    videoPlayer.contentWindow.postMessage(
      JSON.stringify({
        event: "listening",
        id: 1,
        channel: "widget"
      }),
      "https://www.youtube.com"
    );

    sendPlayerCommand("addEventListener", ["onReady"]);
    sendPlayerCommand("addEventListener", ["onStateChange"]);
  });

  window.addEventListener("message", (event) => {
    if (
      event.origin !== "https://www.youtube.com" ||
      event.source !== videoPlayer.contentWindow
    ) {
      return;
    }

    let data;

    try {
      data = typeof event.data === "string"
        ? JSON.parse(event.data)
        : event.data;
    } catch {
      return;
    }

    if (data.event === "onReady") {
      playerReady = true;

      if (savedTime > 0) {
        sendPlayerCommand("seekTo", [savedTime, true]);
        lastSavedTime = savedTime;
      }

      return;
    }

    if (data.event === "infoDelivery" && data.info) {
      const info = data.info;

      if (typeof info.currentTime === "number") {
        currentTime = info.currentTime;
        saveProgress(currentTime);
      }

      // YouTube player state 0 means the video has ended.
      if (info.playerState === 0) {
        clearProgress();
      }
    }
  });

  // Request playback information periodically.
  setInterval(() => {
    if (playerReady) {
      sendPlayerCommand("getCurrentTime");
    }
  }, 5000);

  // Save the latest known position when leaving the page.
  window.addEventListener("pagehide", () => {
    saveProgress(currentTime);
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      saveProgress(currentTime);
    }
  });
}

async function loadVideoDetails() {
  const oEmbedUrl = new URL(
    "https://www.youtube.com/oembed"
  );

  oEmbedUrl.searchParams.set("url", youtubeLink.href);
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
  } catch {
    titleElement.textContent = "Your video is ready";
    channelElement.textContent =
      "Video details could not be loaded";
  }
}

async function initializeFocusPlay() {
  if (!videoId || !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
    showError("No valid video selected");
    return;
  }

  const originalStart = getStartSeconds(startValue);

  try {
    const result = await chrome.storage.local.get(storageKey);
    savedTime = result[storageKey] || 0;
  } catch (error) {
    console.error("Could not load saved progress:", error);
  }

  // A saved position takes priority over the original URL timestamp.
  const start = savedTime > 2 ? savedTime : originalStart;

  const embedUrl = new URL(
    `https://www.youtube.com/embed/${videoId}`
  );

  embedUrl.searchParams.set("rel", "0");
  embedUrl.searchParams.set("playsinline", "1");
  embedUrl.searchParams.set("enablejsapi", "1");
  embedUrl.searchParams.set("origin", location.origin);

  if (start > 0) {
    embedUrl.searchParams.set("start", String(Math.floor(start)));
  }

  youtubeLink.href =
    `https://www.youtube.com/watch?v=${videoId}`;

  document.title = "FocusPlay — Your space to focus";

  initializePlayer();

  videoPlayer.src = embedUrl.href;

  loadVideoDetails();
}

initializeFocusPlay();
