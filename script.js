/**
 * Stopwatch PRO - High-Precision Digital Chronometer
 * Robust, high-resolution timing engine with zero drift, split analytics,
 * Web Audio synthesizer, theme management, and full keyboard navigation.
 */

(() => {
  'use strict';

  // --- Constants & Config ---
  const RING_CIRCUMFERENCE = 2 * Math.PI * 142; // ~892.21px for r=142
  const DEFAULT_TITLE = 'Stopwatch Pro | High-Precision Chronometer';
  const STORAGE_KEYS = {
    THEME: 'stopwatch_theme',
    SOUND: 'stopwatch_sound_enabled'
  };

  // --- State ---
  let isRunning = false;
  let startTime = 0;
  let accumulatedTime = 0; // ms accumulated before current run
  let animationFrameId = null;

  let laps = []; // Array of { lapNum, splitMs, totalMs }
  let lastLapTotalMs = 0;

  let soundEnabled = true;

  // --- DOM Elements ---
  const timeMain = document.getElementById('timeMain');
  const timeFraction = document.getElementById('timeFraction');
  const currentLapTime = document.getElementById('currentLapTime');
  const progressRing = document.getElementById('progressRing');
  const statusIndicator = document.getElementById('statusIndicator');
  const statusLabel = document.getElementById('statusLabel');

  const startBtn = document.getElementById('startBtn');
  const startBtnText = document.getElementById('startBtnText');
  const playIcon = document.getElementById('playIcon');
  const pauseIcon = document.getElementById('pauseIcon');
  const lapBtn = document.getElementById('lapBtn');
  const resetBtn = document.getElementById('resetBtn');

  const statsBar = document.getElementById('statsBar');
  const fastestLapNum = document.getElementById('fastestLapNum');
  const fastestLapTime = document.getElementById('fastestLapTime');
  const slowestLapNum = document.getElementById('slowestLapNum');
  const slowestLapTime = document.getElementById('slowestLapTime');
  const averageLapTime = document.getElementById('averageLapTime');

  const lapsContainer = document.getElementById('laps');
  const lapCounterPill = document.getElementById('lapCounterPill');
  const copyLapsBtn = document.getElementById('copyLapsBtn');
  const exportCsvBtn = document.getElementById('exportCsvBtn');
  const clearLapsBtn = document.getElementById('clearLapsBtn');

  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const themeSunIcon = themeToggleBtn.querySelector('.theme-sun-icon');
  const themeMoonIcon = themeToggleBtn.querySelector('.theme-moon-icon');

  const soundToggleBtn = document.getElementById('soundToggleBtn');
  const soundOnIcon = soundToggleBtn.querySelector('.sound-on-icon');
  const soundOffIcon = soundToggleBtn.querySelector('.sound-off-icon');

  const shortcutsBtn = document.getElementById('shortcutsBtn');
  const shortcutsModal = document.getElementById('shortcutsModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const modalDismissBtn = document.getElementById('modalDismissBtn');

  const toast = document.getElementById('toast');

  // --- Web Audio API Synthesizer ---
  let audioCtx = null;

  function initAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playTone(freq, duration = 0.05, type = 'sine', gainVal = 0.15) {
    if (!soundEnabled) return;
    try {
      initAudioContext();
      if (!audioCtx) return;

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      gain.gain.setValueAtTime(gainVal, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch {
      // Audio playback fails gracefully if unpermitted by browser
    }
  }

  function playSound(action) {
    if (!soundEnabled) return;
    switch (action) {
      case 'start':
        playTone(700, 0.05, 'triangle', 0.15);
        setTimeout(() => playTone(1050, 0.07, 'sine', 0.15), 50);
        break;
      case 'pause':
        playTone(900, 0.04, 'triangle', 0.12);
        setTimeout(() => playTone(600, 0.06, 'sine', 0.12), 40);
        break;
      case 'lap':
        playTone(1200, 0.06, 'sine', 0.18);
        break;
      case 'reset':
        playTone(400, 0.08, 'sawtooth', 0.1);
        break;
      default:
        break;
    }
  }

  // --- High-Resolution Formatting Helpers ---
  function formatTime(totalMs) {
    const hours = Math.floor(totalMs / 3600000);
    const minutes = Math.floor((totalMs % 3600000) / 60000);
    const seconds = Math.floor((totalMs % 60000) / 1000);
    const centiseconds = Math.floor((totalMs % 1000) / 10);

    const pad = (n) => String(n).padStart(2, '0');

    return {
      main: `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`,
      fraction: `.${pad(centiseconds)}`,
      full: `${pad(hours)}:${pad(minutes)}:${pad(seconds)}.${pad(centiseconds)}`,
      short: `${pad(minutes)}:${pad(seconds)}.${pad(centiseconds)}`
    };
  }

  function getElapsedTime() {
    if (!isRunning) {
      return accumulatedTime;
    }
    return accumulatedTime + (performance.now() - startTime);
  }

  // --- Render Loop (Smooth 60FPS via requestAnimationFrame) ---
  function render(timeMs) {
    const elapsed = timeMs !== undefined ? timeMs : getElapsedTime();
    const formatted = formatTime(elapsed);

    timeMain.textContent = formatted.main;
    timeFraction.textContent = formatted.fraction;

    // Update real-time current lap counter
    const currentLapMs = isRunning ? (elapsed - lastLapTotalMs) : 0;
    currentLapTime.textContent = formatTime(currentLapMs).short;

    // Update SVG dial ring (completes a full rotation every 60 seconds)
    const cycleFraction = (elapsed % 60000) / 60000;
    const offset = RING_CIRCUMFERENCE - (cycleFraction * RING_CIRCUMFERENCE);
    progressRing.style.strokeDashoffset = `${offset}`;

    // Update Browser Tab Title when running
    if (isRunning) {
      document.title = `(${formatted.short}) Stopwatch Pro`;
    }
  }

  function tick() {
    if (!isRunning) return;
    render();
    animationFrameId = requestAnimationFrame(tick);
  }

  // --- State Transitions ---
  function start() {
    if (isRunning) return;
    initAudioContext();
    isRunning = true;
    startTime = performance.now();

    // UI Updates
    startBtn.classList.add('is-running');
    startBtnText.textContent = 'Pause';
    playIcon.classList.add('hidden');
    pauseIcon.classList.remove('hidden');

    lapBtn.disabled = false;
    resetBtn.disabled = false;

    statusIndicator.className = 'status-indicator running';
    statusLabel.textContent = 'RUNNING';

    playSound('start');
    animationFrameId = requestAnimationFrame(tick);
  }

  function pause() {
    if (!isRunning) return;
    isRunning = false;
    accumulatedTime += (performance.now() - startTime);

    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }

    // UI Updates
    startBtn.classList.remove('is-running');
    startBtnText.textContent = 'Resume';
    playIcon.classList.remove('hidden');
    pauseIcon.classList.add('hidden');

    lapBtn.disabled = true;
    resetBtn.disabled = false;

    statusIndicator.className = 'status-indicator paused';
    statusLabel.textContent = 'PAUSED';

    render();
    document.title = `[Paused] Stopwatch Pro`;
    playSound('pause');
  }

  function toggleStartPause() {
    if (isRunning) {
      pause();
    } else {
      start();
    }
  }

  function reset() {
    if (isRunning) {
      pause();
    }

    accumulatedTime = 0;
    startTime = 0;
    lastLapTotalMs = 0;
    laps = [];

    // UI Reset
    startBtn.classList.remove('is-running');
    startBtnText.textContent = 'Start';
    playIcon.classList.remove('hidden');
    pauseIcon.classList.add('hidden');

    lapBtn.disabled = true;
    resetBtn.disabled = true;

    statusIndicator.className = 'status-indicator';
    statusLabel.textContent = 'READY';

    progressRing.style.strokeDashoffset = `${RING_CIRCUMFERENCE}`;
    document.title = DEFAULT_TITLE;

    render(0);
    renderLapsUI();
    playSound('reset');
    showToast('Stopwatch reset');
  }

  function recordLap() {
    if (!isRunning) return;

    const currentTotal = getElapsedTime();
    const splitMs = currentTotal - lastLapTotalMs;
    const lapNum = laps.length + 1;

    laps.unshift({
      lapNum,
      splitMs,
      totalMs: currentTotal
    });

    lastLapTotalMs = currentTotal;
    playSound('lap');
    renderLapsUI();
  }

  // --- Laps UI & Statistics ---
  function renderLapsUI() {
    const lapCount = laps.length;
    lapCounterPill.textContent = `${lapCount} ${lapCount === 1 ? 'lap' : 'laps'}`;

    copyLapsBtn.disabled = lapCount === 0;
    exportCsvBtn.disabled = lapCount === 0;
    clearLapsBtn.disabled = lapCount === 0;

    if (lapCount === 0) {
      lapsContainer.innerHTML = `
        <li class="lap-empty-state" id="lapEmptyState">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="empty-icon">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <p>No lap records yet</p>
          <span>Press <strong>Lap</strong> while stopwatch is running to record splits</span>
        </li>
      `;
      statsBar.classList.add('hidden');
      return;
    }

    // Determine Best (Fastest) & Worst (Slowest) splits
    let minSplit = Infinity;
    let maxSplit = -Infinity;
    let bestLapIndex = -1;
    let worstLapIndex = -1;
    let totalSplitSum = 0;

    laps.forEach((lap, idx) => {
      totalSplitSum += lap.splitMs;
      if (lap.splitMs < minSplit) {
        minSplit = lap.splitMs;
        bestLapIndex = idx;
      }
      if (lap.splitMs > maxSplit) {
        maxSplit = lap.splitMs;
        worstLapIndex = idx;
      }
    });

    // Update Quick Statistics Bar (when 2 or more laps exist)
    if (lapCount >= 2) {
      statsBar.classList.remove('hidden');
      const bestLap = laps[bestLapIndex];
      const worstLap = laps[worstLapIndex];
      const avgSplitMs = totalSplitSum / lapCount;

      fastestLapNum.textContent = `#${bestLap.lapNum}`;
      fastestLapTime.textContent = formatTime(bestLap.splitMs).short;

      slowestLapNum.textContent = `#${worstLap.lapNum}`;
      slowestLapTime.textContent = formatTime(worstLap.splitMs).short;

      averageLapTime.textContent = formatTime(avgSplitMs).short;
    } else {
      statsBar.classList.add('hidden');
    }

    // Build Laps Table Rows
    let html = '';
    laps.forEach((lap, index) => {
      const isFastest = lapCount >= 2 && index === bestLapIndex;
      const isSlowest = lapCount >= 2 && index === worstLapIndex;

      let rowClass = 'lap-row';
      let badgeHtml = '';
      if (isFastest) {
        rowClass += ' is-fastest';
        badgeHtml = ' 🏆';
      } else if (isSlowest) {
        rowClass += ' is-slowest';
        badgeHtml = ' ⚠️';
      }

      // Delta comparison relative to previous chronological lap
      let deltaText = '--';
      let deltaClass = 'neutral';
      // laps is in reverse order (newest first). The chronological predecessor is at index + 1
      if (index < laps.length - 1) {
        const prevLap = laps[index + 1];
        const diff = lap.splitMs - prevLap.splitMs;
        if (Math.abs(diff) < 10) {
          deltaText = '0.00s';
        } else if (diff < 0) {
          deltaText = `-${(Math.abs(diff) / 1000).toFixed(2)}s`;
          deltaClass = 'faster';
        } else {
          deltaText = `+${(diff / 1000).toFixed(2)}s`;
          deltaClass = 'slower';
        }
      }

      html += `
        <li class="${rowClass}">
          <span class="lap-num">#${lap.lapNum}${badgeHtml}</span>
          <span class="lap-split">${formatTime(lap.splitMs).short}</span>
          <span class="lap-total">${formatTime(lap.totalMs).short}</span>
          <span class="lap-delta ${deltaClass}">${deltaText}</span>
        </li>
      `;
    });

    lapsContainer.innerHTML = html;
  }

  function clearLaps() {
    if (laps.length === 0) return;
    laps = [];
    lastLapTotalMs = isRunning ? getElapsedTime() : 0;
    renderLapsUI();
    showToast('Laps cleared');
  }

  // --- Export & Copy Functionality ---
  function copyLapsToClipboard() {
    if (laps.length === 0) return;

    const currentTotalFormatted = formatTime(getElapsedTime()).full;
    let text = `⏱️ Stopwatch PRO - Lap Summary\n`;
    text += `Total Time: ${currentTotalFormatted}\n`;
    text += `Total Laps: ${laps.length}\n\n`;
    text += `Lap #\tSplit Time\tTotal Time\tNote\n`;

    // Copy in chronological order (#1 first)
    const chronologicalLaps = [...laps].reverse();
    let minSplit = Math.min(...laps.map(l => l.splitMs));
    let maxSplit = Math.max(...laps.map(l => l.splitMs));

    chronologicalLaps.forEach((lap) => {
      let note = '';
      if (laps.length >= 2) {
        if (lap.splitMs === minSplit) note = '(Fastest)';
        else if (lap.splitMs === maxSplit) note = '(Slowest)';
      }
      text += `#${lap.lapNum}\t${formatTime(lap.splitMs).short}\t${formatTime(lap.totalMs).short}\t${note}\n`;
    });

    navigator.clipboard.writeText(text).then(() => {
      showToast('Laps copied to clipboard!');
    }).catch(() => {
      showToast('Could not copy to clipboard');
    });
  }

  function exportLapsCsv() {
    if (laps.length === 0) return;

    let csv = 'Lap,Split Time,Total Time,Split Milliseconds,Total Milliseconds\n';
    const chronologicalLaps = [...laps].reverse();

    chronologicalLaps.forEach((lap) => {
      csv += `${lap.lapNum},"${formatTime(lap.splitMs).short}","${formatTime(lap.totalMs).short}",${lap.splitMs.toFixed(0)},${lap.totalMs.toFixed(0)}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `stopwatch_laps_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast('CSV file downloaded');
  }

  // --- Floating Toast Notification ---
  let toastTimeout = null;
  function showToast(message, duration = 2200) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');

    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, duration);
  }

  // --- Theme Management ---
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEYS.THEME, theme);

    if (theme === 'light') {
      themeSunIcon.classList.add('hidden');
      themeMoonIcon.classList.remove('hidden');
    } else {
      themeSunIcon.classList.remove('hidden');
      themeMoonIcon.classList.add('hidden');
    }
  }

  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
  }

  function initTheme() {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
    if (savedTheme) {
      applyTheme(savedTheme);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      applyTheme(prefersDark ? 'dark' : 'light');
    }
  }

  // --- Sound Management ---
  function toggleSound() {
    soundEnabled = !soundEnabled;
    localStorage.setItem(STORAGE_KEYS.SOUND, String(soundEnabled));
    updateSoundUI();
    showToast(soundEnabled ? 'Sound enabled' : 'Sound muted');
  }

  function updateSoundUI() {
    if (soundEnabled) {
      soundOnIcon.classList.remove('hidden');
      soundOffIcon.classList.add('hidden');
    } else {
      soundOnIcon.classList.add('hidden');
      soundOffIcon.classList.remove('hidden');
    }
  }

  function initSound() {
    const savedSound = localStorage.getItem(STORAGE_KEYS.SOUND);
    if (savedSound !== null) {
      soundEnabled = savedSound === 'true';
    }
    updateSoundUI();
  }

  // --- Keyboard Shortcuts Modal ---
  function openShortcutsModal() {
    if (shortcutsModal && typeof shortcutsModal.showModal === 'function') {
      shortcutsModal.showModal();
    }
  }

  function closeShortcutsModal() {
    if (shortcutsModal && typeof shortcutsModal.close === 'function') {
      shortcutsModal.close();
    }
  }

  // --- Event Listeners Setup ---
  function setupEventListeners() {
    // Buttons
    startBtn.addEventListener('click', toggleStartPause);
    lapBtn.addEventListener('click', recordLap);
    resetBtn.addEventListener('click', reset);

    copyLapsBtn.addEventListener('click', copyLapsToClipboard);
    exportCsvBtn.addEventListener('click', exportLapsCsv);
    clearLapsBtn.addEventListener('click', clearLaps);

    themeToggleBtn.addEventListener('click', toggleTheme);
    soundToggleBtn.addEventListener('click', toggleSound);

    // Modal
    shortcutsBtn.addEventListener('click', openShortcutsModal);
    closeModalBtn.addEventListener('click', closeShortcutsModal);
    modalDismissBtn.addEventListener('click', closeShortcutsModal);
    shortcutsModal.addEventListener('click', (e) => {
      // Close on backdrop click
      const rect = shortcutsModal.getBoundingClientRect();
      const isInDialog = (
        rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX && e.clientX <= rect.left + rect.width
      );
      if (!isInDialog) {
        closeShortcutsModal();
      }
    });

    // Page Visibility API (ensures precision when user returns from another tab)
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && isRunning) {
        render();
      }
    });

    // Global Keyboard Navigation
    document.addEventListener('keydown', (e) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        toggleStartPause();
      } else if (e.code === 'KeyL') {
        e.preventDefault();
        if (isRunning) recordLap();
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        if (!resetBtn.disabled) reset();
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        toggleSound();
      } else if (e.code === 'KeyT') {
        e.preventDefault();
        toggleTheme();
      } else if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        if (shortcutsModal.open) {
          closeShortcutsModal();
        } else {
          openShortcutsModal();
        }
      } else if (e.key === 'Escape' && shortcutsModal.open) {
        closeShortcutsModal();
      }
    });
  }

  // --- Initialization ---
  function init() {
    initTheme();
    initSound();
    setupEventListeners();
    render(0);
    renderLapsUI();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
