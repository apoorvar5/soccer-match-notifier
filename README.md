# ⚽ MatchPulse — Soccer Match Live Events Notification Chrome Extension

A modern Chrome Extension (Manifest V3) built with **TypeScript**, **React**, and **Vite** that delivers real-time desktop and in-browser notifications on key soccer match events (Kickoffs, Goals with Scorers & Assists, Halftime scores, Red Cards, and Full Time) for your followed teams.

---

## ✨ Features

- **⚽ Event-Driven Notifications**: Get notified only when something happens (intelligent deduplication prevents repeat spam).
  - ⚽ **Match Started / Kickoff**
  - 🥅 **Goals with Scorer & Assist Names**
  - 🟥 **Red Cards & Dismissals**
  - ⏸️ **Halftime Scores**
  - 🏁 **Full Time / Match Ended**
- **🎨 Dual-Layer Visual Alerts**:
  - **In-Page Floating HUD**: An animated floating scoreboard overlay with slide-in bounce animations and progress countdowns on any active web tab.
  - **Custom Canvas Scoreboard Banners**: Generates graphic scoreboard cards rendered directly in Chrome OS desktop notifications.
- **🔊 Web Audio Fanfare**: Synthesized goal chimes and referee whistles with a 1-click mute/unmute toggle.
- **⭐ Followed Teams Manager**: Search and follow clubs across top leagues (Premier League, UEFA Champions League, La Liga, Serie A, Bundesliga, MLS, Ligue 1).
- **🧪 Live Match Simulator & Test Bench**: Test notifications and animations on demand anytime.

---

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v18+)
- npm or yarn

### 1. Clone & Install
```bash
git clone https://github.com/your-username/soccer-match-notifier.git
cd soccer-match-notifier
npm install
```

### 2. Build Extension Bundle
```bash
npm run build
```
This compiles the extension into the `dist/` directory.

### 3. Load into Google Chrome
1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Toggle on **Developer mode** in the top-right corner.
3. Click **Load unpacked** in the top-left corner.
4. Select the `dist/` folder from this project.

---

## 🧪 Development & Testing

- **Dev Server**: `npm run dev`
- **Unit Test Runner**: `npm exec tsx src/test-runner.ts`

---

## 📄 License
This project is open source and available under the [MIT License](LICENSE).
