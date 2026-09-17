import { SoccerApiService } from './services/soccer-api.service';
import { NotificationService } from './services/notification.service';
import { StorageService, DEFAULT_SETTINGS } from './services/storage.service';
import { INITIAL_FOLLOWED_TEAMS } from './services/soccer-data';

const ALARM_NAME = 'SOCCER_MATCH_POLL_ALARM';

// Initialize extension defaults on install
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('[MatchPulse] Extension installed/updated:', details.reason);
  
  const existingTeams = await StorageService.getFollowedTeams();
  if (!existingTeams || existingTeams.length === 0) {
    await StorageService.saveFollowedTeams(INITIAL_FOLLOWED_TEAMS);
  }

  const existingSettings = await StorageService.getSettings();
  if (!existingSettings) {
    await StorageService.saveSettings(DEFAULT_SETTINGS);
  }

  setupAlarm(DEFAULT_SETTINGS.pollingIntervalSeconds);
});

// Re-create alarm when Chrome starts up
chrome.runtime.onStartup.addListener(async () => {
  const settings = await StorageService.getSettings();
  setupAlarm(settings.pollingIntervalSeconds || 60);
});

function setupAlarm(intervalSeconds: number) {
  const periodInMinutes = Math.max(0.5, (intervalSeconds || 60) / 60);
  chrome.alarms.clear(ALARM_NAME, () => {
    chrome.alarms.create(ALARM_NAME, {
      periodInMinutes: periodInMinutes,
      delayInMinutes: 0.1,
    });
    console.log(`[MatchPulse] Alarm scheduled every ${periodInMinutes} minute(s).`);
  });
}

// Alarm listener
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === ALARM_NAME) {
    await checkLiveMatches();
  }
});

async function checkLiveMatches() {
  try {
    const followedTeams = await StorageService.getFollowedTeams();
    const settings = await StorageService.getSettings();
    const rawNotifiedIds = await StorageService.getNotifiedEventIds();
    const notifiedSet = new Set<string>(rawNotifiedIds);

    const matches = await SoccerApiService.fetchAllMatches();

    for (const match of matches) {
      const newIds = await NotificationService.processMatchForNotifications(
        match,
        followedTeams,
        settings,
        notifiedSet
      );
      for (const id of newIds) {
        await StorageService.markEventNotified(id);
      }
    }
  } catch (error) {
    console.error('[MatchPulse] Error in checkLiveMatches:', error);
  }
}

// Animate the extension action badge when key events happen
function flashActionBadge(text: string, color: string) {
  if (typeof chrome === 'undefined' || !chrome.action) return;

  chrome.action.setBadgeText({ text });
  chrome.action.setBadgeBackgroundColor({ color });

  let flashes = 0;
  const interval = setInterval(() => {
    flashes++;
    const currentColor = flashes % 2 === 0 ? color : '#0f172a';
    chrome.action.setBadgeBackgroundColor({ color: currentColor });

    if (flashes >= 8) {
      clearInterval(interval);
      // Reset after 15 seconds
      setTimeout(() => {
        chrome.action.setBadgeText({ text: '' });
      }, 15000);
    }
  }, 400);
}

// Message handler for test events and immediate polling triggers
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === 'POLL_NOW') {
    checkLiveMatches().then(() => sendResponse({ success: true }));
    return true; // Keep channel open for async response
  } else if (message.action === 'UPDATE_ALARM') {
    setupAlarm(message.intervalSeconds || 60);
    sendResponse({ success: true });
    return true;
  } else if (message.action === 'TEST_NOTIFICATION') {
    const { title, text, eventType, matchId, crest } = message.payload;
    
    if (eventType === 'GOAL') {
      flashActionBadge('GOAL', '#fbbf24');
    } else if (eventType === 'RED_CARD') {
      flashActionBadge('RED', '#ef4444');
    } else {
      flashActionBadge('LIVE', '#10b981');
    }

    NotificationService.sendNotification(
      `test-${Date.now()}`,
      title,
      text,
      eventType,
      matchId || 'test-match',
      crest
    ).then(() => sendResponse({ success: true }));
    return true;
  }
});
