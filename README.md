# ⏱️ Stopwatch PRO

> A sleek, high-precision, zero-dependency digital stopwatch and chronometer built with modern Vanilla JavaScript, CSS3, and HTML5. Engineered with millisecond accuracy, advanced split & lap analytics, interactive Web Audio feedback, and complete keyboard shortcuts.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Vanilla JS](https://img.shields.io/badge/Vanilla-JavaScript-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![CSS3](https://img.shields.io/badge/CSS3-Modern_Flexbox_%26_Grid-1572B6?logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![Web Audio API](https://img.shields.io/badge/Audio-Web_Audio_API-orange)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-0-brightgreen.svg)](#)

---

## 🚀 Live Demo

Deployable instantly with **GitHub Pages**:
👉 **[View Live Demo](https://yashchaudhari372-lab.github.io/stopwatch/)** *(Once enabled in repo settings)*

---

## ✨ Features

### 🎯 High-Precision Timing Engine
- **Zero Drift**: Built with high-resolution timestamps via `performance.now()`, ensuring the stopwatch stays 100% accurate even after hours of continuous tracking.
- **60 FPS Fluid Rendering**: Powered by `requestAnimationFrame` for stutter-free millisecond updates without excessive CPU overhead.
- **Background-Tab Resilient**: Uses the **Page Visibility API** to guarantee immediate resynchronization when returning from another browser tab.
- **Tabular Monospace Digits**: Utilizes `JetBrains Mono` and `font-variant-numeric: tabular-nums` to eliminate jitter and horizontal layout shift as numbers tick.

### 🏁 Comprehensive Lap & Split Analytics
- **Dual Display**: Live main stopwatch elapsed time + real-time current lap split timer.
- **Lap Table**: Tracks Lap #, individual split time, total cumulative time, and differential (+/- seconds) compared to the preceding lap.
- **Smart Highlighting**: Automatically identifies and highlights the **Fastest (🏆)** and **Slowest (⚠️)** laps.
- **Quick Statistics Dashboard**: Displays Fastest, Slowest, and Average lap times once 2 or more laps are recorded.
- **Export to CSV**: Export your complete split history to a `.csv` file with a single click.
- **Copy to Clipboard**: Copy human-readable formatted split summaries to paste into notes or sheets.

### 🎨 Modern & Responsive Design
- **Theme Support**: Seamless Dark Mode (default OLED slate) and Light Mode toggle with automatic user preference detection and `localStorage` persistence.
- **Circular Progress Dial**: SVG animated chronometer ring that sweeps dynamically with running time.
- **Dynamic Browser Tab Title**: Live timer updates directly in the browser tab title `(01:23.45) Stopwatch Pro`, so you can keep track while multitasking.
- **Mobile Optimized**: Clean touch-friendly interface designed to scale seamlessly across smartphones, tablets, and desktop displays.

### 🔊 Built-in Web Audio Synthesizer
- Generates tactical audio feedback for actions (Start, Pause, Lap, Reset) using browser-native oscillators.
- **100% Offline & Asset-Free**: No external `.mp3` or `.wav` network requests required.
- Easily toggle audio mute with the sound button or the <kbd>M</kbd> shortcut.

---

## ⌨️ Keyboard Shortcuts

Speed up your workflow with full keyboard navigation:

| Key | Action | Description |
| :--- | :--- | :--- |
| <kbd>Space</kbd> | **Start / Pause** | Toggle timing state |
| <kbd>L</kbd> | **Lap** | Record current split while running |
| <kbd>R</kbd> | **Reset** | Reset chronometer and clear timers |
| <kbd>M</kbd> | **Mute / Unmute** | Toggle acoustic feedback |
| <kbd>T</kbd> | **Theme** | Switch between Dark and Light mode |
| <kbd>?</kbd> | **Shortcuts** | Open / close shortcuts modal |
| <kbd>Esc</kbd> | **Close** | Dismiss open modal dialogs |

---

## 📂 Project Structure

```text
stopwatch/
│
├── index.html       # Semantic HTML5 markup, SVG assets & modal dialogs
├── style.css        # Modern CSS3 design system, custom properties & animations
├── script.js        # High-precision ES6+ timing engine, state & Web Audio
├── README.md        # Comprehensive documentation & usage guide
└── LICENSE          # Open-source MIT License
```

---

## 🛠️ Getting Started Locally

No compilers, Node.js packages, or build tools are required. You can run the app directly in any modern browser:

### Option 1: Direct File Opening
1. Clone this repository:
   ```bash
   git clone https://github.com/yashchaudhari372-lab/stopwatch.git
   cd stopwatch
   ```
2. Open `index.html` in your favorite web browser:
   - On Windows: double-click `index.html` or run:
     ```powershell
     Start-Process index.html
     ```
   - On macOS:
     ```bash
     open index.html
     ```
   - On Linux:
     ```bash
     xdg-open index.html
     ```

### Option 2: Local HTTP Server (Optional)
If you prefer running via a local development server:
```bash
# Using Python 3
python -m http.server 8000

# Or using npx serve
npx serve .
```
Then visit `http://localhost:8000` in your browser.

---

## 🌐 Deploy to GitHub Pages

To make your stopwatch available online for free:

1. Push your updated code to your repository:
   ```bash
   git add .
   git commit -m "Upgrade to Stopwatch PRO"
   git push origin main
   ```
2. Go to your GitHub repository:
   - Click **Settings** > **Pages** (under "Code and automation").
   - Under **Build and deployment** > **Source**, choose `Deploy from a branch`.
   - Under **Branch**, select `main` branch and `/ (root)` folder.
   - Click **Save**.
3. Your stopwatch will be live at `https://<your-username>.github.io/stopwatch/` within 1-2 minutes!

---

## 💡 Technologies Used

- **HTML5**: Semantic tags, accessible ARIA attributes, SVG graphics, native `<dialog>`.
- **CSS3**: CSS Custom Properties (Variables), Flexbox, CSS Grid, Glassmorphism, smooth transitions.
- **JavaScript (ES6+)**:
  - High-Resolution Time (`performance.now()`)
  - Render Loop (`requestAnimationFrame`)
  - Web Audio API (`AudioContext`, `OscillatorNode`, `GainNode`)
  - Clipboard API (`navigator.clipboard`)
  - Page Visibility API (`document.visibilitychange`)
  - Blob & Object URL API (CSV export)
  - LocalStorage (Theme & audio preference persistence)

---

## 📄 License

This project is licensed under the **MIT License** — feel free to use, modify, and distribute it for personal or commercial projects.
