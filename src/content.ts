interface MatchPulseNotificationMessage {
  type: 'SHOW_MATCHPULSE_HUD';
  payload: {
    id: string;
    title: string;
    message: string;
    eventType: string;
    homeTeamName?: string;
    awayTeamName?: string;
    homeScore?: number;
    awayScore?: number;
    clock?: string;
    teamCrest?: string;
  };
}

const STYLES = `
#matchpulse-host {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 2147483647;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  pointer-events: none;
}

.mp-hud-toast {
  pointer-events: auto;
  width: 360px;
  background: rgba(11, 15, 25, 0.95);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: 14px;
  padding: 14px 16px;
  color: #f9fafb;
  box-shadow: 0 10px 35px -5px rgba(0, 0, 0, 0.8), 0 0 20px rgba(16, 185, 129, 0.35);
  border: 1.5px solid rgba(16, 185, 129, 0.5);
  margin-bottom: 12px;
  position: relative;
  overflow: hidden;
  transform: translateX(120%);
  opacity: 0;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.mp-hud-toast.mp-show {
  transform: translateX(0);
  opacity: 1;
}

.mp-hud-toast.mp-goal {
  border-color: #fbbf24;
  box-shadow: 0 10px 35px -5px rgba(0, 0, 0, 0.8), 0 0 25px rgba(251, 191, 36, 0.45);
}

.mp-hud-toast.mp-red {
  border-color: #ef4444;
  box-shadow: 0 10px 35px -5px rgba(0, 0, 0, 0.8), 0 0 25px rgba(239, 68, 68, 0.45);
}

.mp-hud-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.mp-badge {
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  padding: 2px 8px;
  border-radius: 6px;
  background: #10b981;
  color: #ffffff;
}

.mp-badge-goal {
  background: #fbbf24;
  color: #000000;
}

.mp-badge-red {
  background: #ef4444;
  color: #ffffff;
}

.mp-close-btn {
  background: transparent;
  border: none;
  color: #9ca3af;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  padding: 0 4px;
}

.mp-close-btn:hover {
  color: #ffffff;
}

.mp-scoreboard-row {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  background: rgba(0, 0, 0, 0.4);
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.mp-team-name {
  font-size: 12px;
  font-weight: 700;
  color: #f3f4f6;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mp-team-away {
  text-align: right;
}

.mp-score-display {
  font-family: 'Courier New', Courier, monospace;
  font-size: 16px;
  font-weight: 800;
  color: #34d399;
}

.mp-score-goal {
  color: #fbbf24;
}

.mp-details-box {
  background: rgba(255, 255, 255, 0.05);
  padding: 8px 10px;
  border-radius: 8px;
  font-size: 12px;
  line-height: 1.4;
  color: #e5e7eb;
}

.mp-event-title {
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 2px;
}

.mp-event-msg {
  color: #94a3b8;
  white-space: pre-line;
}

.mp-progress-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  width: 100%;
  background: #10b981;
  transform-origin: left;
}

.mp-goal .mp-progress-bar {
  background: #fbbf24;
}

.mp-red .mp-progress-bar {
  background: #ef4444;
}
`;

function injectStyles() {
  if (document.getElementById('matchpulse-styles')) return;
  const styleEl = document.createElement('style');
  styleEl.id = 'matchpulse-styles';
  styleEl.textContent = STYLES;
  document.head ? document.head.appendChild(styleEl) : document.documentElement.appendChild(styleEl);
}

// Get or create host container in the current webpage
function getOrCreateHost(): HTMLElement {
  injectStyles();
  let host = document.getElementById('matchpulse-host');
  if (!host) {
    host = document.createElement('div');
    host.id = 'matchpulse-host';
    document.documentElement.appendChild(host);
  }
  return host;
}

function showHudToast(data: MatchPulseNotificationMessage['payload']) {
  const host = getOrCreateHost();
  const isGoal = data.eventType === 'GOAL';
  const isRed = data.eventType === 'RED_CARD';

  const toast = document.createElement('div');
  toast.className = `mp-hud-toast ${isGoal ? 'mp-goal' : isRed ? 'mp-red' : ''}`;

  const badgeText = isGoal ? '⚽ GOAL ALERT!' : isRed ? '🟥 RED CARD!' : (data.eventType === 'KICKOFF' ? '⚽ KICKOFF' : '🏁 MATCH UPDATE');
  const badgeClass = isGoal ? 'mp-badge-goal' : isRed ? 'mp-badge-red' : '';

  toast.innerHTML = `
    <div class="mp-hud-header">
      <span class="mp-badge ${badgeClass}">${badgeText}</span>
      <button class="mp-close-btn" title="Dismiss">×</button>
    </div>

    ${data.homeTeamName && data.awayTeamName ? `
      <div class="mp-scoreboard-row">
        <div class="mp-team-name">${data.homeTeamName}</div>
        <div class="mp-score-display ${isGoal ? 'mp-score-goal' : ''}">
          ${data.homeScore ?? 0} - ${data.awayScore ?? 0}
        </div>
        <div class="mp-team-name mp-team-away">${data.awayTeamName}</div>
      </div>
    ` : ''}

    <div class="mp-details-box">
      <div class="mp-event-title">${data.title}</div>
      <div class="mp-event-msg">${data.message.replace(/\n/g, '<br/>')}</div>
    </div>

    <div class="mp-progress-bar"></div>
  `;

  // Dismiss button
  const closeBtn = toast.querySelector('.mp-close-btn');
  closeBtn?.addEventListener('click', () => {
    dismissToast(toast);
  });

  host.appendChild(toast);

  // Trigger enter animation
  requestAnimationFrame(() => {
    toast.classList.add('mp-show');
  });

  // Auto-dismiss after 6 seconds
  const timer = setTimeout(() => {
    dismissToast(toast);
  }, 6000);

  // Animate progress bar
  const progressBar = toast.querySelector('.mp-progress-bar') as HTMLElement;
  if (progressBar) {
    progressBar.style.transition = 'transform 6s linear';
    requestAnimationFrame(() => {
      progressBar.style.transform = 'scaleX(0)';
    });
  }

  function dismissToast(el: HTMLElement) {
    clearTimeout(timer);
    el.classList.remove('mp-show');
    setTimeout(() => {
      el.remove();
    }, 400);
  }
}

// Listen for messages from background script
if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
  chrome.runtime.onMessage.addListener((message: MatchPulseNotificationMessage, _sender, sendResponse) => {
    if (message.type === 'SHOW_MATCHPULSE_HUD') {
      showHudToast(message.payload);
      sendResponse({ received: true });
    }
  });
}
