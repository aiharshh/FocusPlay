# FocusPlay

**Your space to focus.**

FocusPlay is a Chrome extension designed to provide a clean, distraction-free environment for watching YouTube videos. Instead of staying on YouTube's browsing interface, users can open a selected video in a dedicated viewing page focused on the content.

## 🎯 Project Goal

Reduce distractions while watching educational videos by separating video playback from the usual YouTube browsing experience.

## ✨ Features

- **Distraction-free interface:** A minimal, dark-themed video viewing page.
- **One-click access:** Open a supported YouTube video in FocusPlay using the Chrome extension.
- **Video playback:** Embed the selected YouTube video in a dedicated player.
- **Video information:** Display the video title and channel name when metadata is available.
- **Original video link:** Open the video on YouTube whenever needed.
- **Responsive design:** Interface adapts to different screen sizes.

## 🛠️ Tech Stack

- HTML5
- CSS3
- JavaScript
- Chrome Extensions Manifest V3
- YouTube Embedded Player
- YouTube oEmbed endpoint for video metadata

## 📁 Project Structure

```text
focusplay_mvp_v1/
├── manifest.json
├── background.js
├── player.html
├── player.js
└── README.md
```

## 🚀 Installation

1. Clone or download this project to your computer.
2. Open Google Chrome.
3. Navigate to `chrome://extensions`.
4. Enable **Developer mode**.
5. Click **Load unpacked**.
6. Select the `focusplay_mvp_v1` project folder.
7. Open a standard YouTube video.
8. Click the FocusPlay extension icon to open the video in a new tab.

## ⚙️ How It Works

1. The extension detects a supported YouTube video page.
2. It extracts the video ID and any available start-time parameter.
3. It opens the FocusPlay player page in a new tab.
4. The player embeds the selected video and attempts to load its title and channel information.
5. Users can watch the video in the dedicated interface or return to the original YouTube page.

## 🔬 Current Limitations

- Automatic timestamp seeking is experimental and may not work consistently.
- Video title and channel information depend on the metadata request succeeding.
- Some videos may not permit embedding because of creator or YouTube restrictions.
- The current implementation uses an experimental request-header workaround to address YouTube embed error 153. Its reliability and compliance with YouTube policies and Chrome Web Store requirements must be reviewed before public distribution.
- Playback and metadata behavior may vary across browsers and videos.

## 🗺️ Future Scope

Potential improvements for future versions include:

- More reliable timestamp seeking.
- Support for additional educational platforms.
- Save for later.
- Note-taking.
- Mark videos as completed.

These features are intentionally outside the current MVP scope.

## 📌 Project Status

**Minimum Viable Product — Under Testing**

FocusPlay is being developed incrementally, prioritizing reliable playback and a distraction-free viewing experience before adding more features.

## 📄 License

No license has been specified yet.
