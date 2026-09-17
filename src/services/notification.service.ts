import { Match, MatchEvent, NotificationLog, NotificationSettings, Team, EventType } from '../models/soccer.models';
import { StorageService } from './storage.service';
import { CardGeneratorService } from './card-generator.service';

export class NotificationService {
  /**
   * Dispatch rich notification (Custom Banner + In-Page HUD + Chrome OS Notification)
   */
  static async sendNotification(
    id: string,
    title: string,
    message: string,
    eventType: EventType,
    matchId: string,
    teamCrest?: string,
    homeTeamName?: string,
    awayTeamName?: string,
    homeScore?: number,
    awayScore?: number,
    minute?: string
  ): Promise<void> {
    const isChrome = typeof chrome !== 'undefined' && !!chrome.notifications;

    const logEntry: NotificationLog = {
      id,
      title,
      message,
      eventType,
      matchId,
      timestamp: Date.now(),
      teamCrest,
    };

    // 1. Save to persistent history log
    await StorageService.addNotificationLog(logEntry);

    // 2. Broadcast to In-Page Animated Floating HUD in all active browser tabs
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach((tab) => {
          if (tab.id) {
            chrome.tabs.sendMessage(tab.id, {
              type: 'SHOW_MATCHPULSE_HUD',
              payload: {
                id,
                title,
                message,
                eventType,
                homeTeamName,
                awayTeamName,
                homeScore,
                awayScore,
                clock: minute,
                teamCrest,
              },
            }).catch(() => {
              // Ignore tabs without content script (e.g. chrome:// tabs)
            });
          }
        });
      });
    }

    // 3. Generate Visual Image Card Banner for Chrome Desktop Notification
    let bannerImageUrl = '';
    if (homeTeamName && awayTeamName) {
      bannerImageUrl = await CardGeneratorService.generateMatchBanner(
        title,
        message,
        eventType,
        homeTeamName,
        awayTeamName,
        homeScore ?? 0,
        awayScore ?? 0,
        minute || 'FT'
      );
    }

    // 4. Chrome OS Desktop Notification with rich custom image banner & action buttons
    if (isChrome) {
      const notificationOptions: chrome.notifications.NotificationOptions<true> = bannerImageUrl
        ? {
            type: 'image',
            iconUrl: teamCrest || chrome.runtime.getURL('icons/icon128.png'),
            title: title,
            message: message,
            imageUrl: bannerImageUrl,
            priority: 2,
            requireInteraction: false,
            silent: false,
            buttons: [
              { title: '⚽ View Match Scoreboard' }
            ]
          }
        : {
            type: 'basic',
            iconUrl: teamCrest || chrome.runtime.getURL('icons/icon128.png'),
            title: title,
            message: message,
            priority: 2,
            requireInteraction: false,
            silent: false,
            buttons: [
              { title: '⚽ View Match' }
            ]
          };

      chrome.notifications.create(id, notificationOptions, (notificationId) => {
        if (chrome.runtime.lastError) {
          console.warn('Chrome notification error:', chrome.runtime.lastError);
        }
      });
    } else {
      // Browser fallback for local preview
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification(title, {
            body: message,
            icon: teamCrest || '/icons/icon128.png',
          });
        }
      }
      console.log(`[Notification: ${title}] - ${message}`);
    }
  }

  /**
   * Evaluate a match against notification settings and send alerts for new events
   */
  static async processMatchForNotifications(
    match: Match,
    followedTeams: Team[],
    settings: NotificationSettings,
    notifiedEventIds: Set<string>
  ): Promise<string[]> {
    const newNotifiedIds: string[] = [];
    const isHomeFollowed = followedTeams.some(
      (t) => t.id === match.homeTeam.id || t.name.toLowerCase() === match.homeTeam.name.toLowerCase()
    );
    const isAwayFollowed = followedTeams.some(
      (t) => t.id === match.awayTeam.id || t.name.toLowerCase() === match.awayTeam.name.toLowerCase()
    );

    if (settings.onlyFollowedTeams && !isHomeFollowed && !isAwayFollowed) {
      return newNotifiedIds;
    }

    const crestToUse = isHomeFollowed ? match.homeTeam.crest : (isAwayFollowed ? match.awayTeam.crest : match.homeTeam.crest);

    // 1. Kickoff Notification
    const kickoffId = `${match.id}-KICKOFF`;
    if (
      settings.notifyKickoff &&
      (match.status === 'IN_PROGRESS' || match.status === 'HALFTIME') &&
      !notifiedEventIds.has(kickoffId)
    ) {
      const title = `⚽ Game Started: ${match.homeTeam.name} vs ${match.awayTeam.name}`;
      const msg = `Kickoff! The match is underway in ${match.leagueName}.`;
      await this.sendNotification(
        kickoffId,
        title,
        msg,
        'KICKOFF',
        match.id,
        crestToUse,
        match.homeTeam.name,
        match.awayTeam.name,
        match.homeScore,
        match.awayScore,
        match.clock
      );
      newNotifiedIds.push(kickoffId);
      notifiedEventIds.add(kickoffId);
    }

    // 2. Halftime Notification
    const halftimeId = `${match.id}-HALFTIME`;
    if (
      settings.notifyHalftime &&
      match.status === 'HALFTIME' &&
      !notifiedEventIds.has(halftimeId)
    ) {
      const title = `⏸️ Halftime: ${match.homeTeam.name} ${match.homeScore} - ${match.awayScore} ${match.awayTeam.name}`;
      const msg = `First half concluded in ${match.leagueName}.`;
      await this.sendNotification(
        halftimeId,
        title,
        msg,
        'HALFTIME',
        match.id,
        crestToUse,
        match.homeTeam.name,
        match.awayTeam.name,
        match.homeScore,
        match.awayScore,
        'HT'
      );
      newNotifiedIds.push(halftimeId);
      notifiedEventIds.add(halftimeId);
    }

    // 3. Full Time Notification
    const fullTimeId = `${match.id}-FULL_TIME`;
    if (
      settings.notifyFullTime &&
      match.status === 'FINISHED' &&
      !notifiedEventIds.has(fullTimeId)
    ) {
      const title = `🏁 Match Ended: ${match.homeTeam.name} ${match.homeScore} - ${match.awayScore} ${match.awayTeam.name}`;
      const msg = `Final whistle! ${match.homeScore > match.awayScore ? match.homeTeam.name + ' wins!' : match.awayScore > match.homeScore ? match.awayTeam.name + ' wins!' : 'Match ended in a draw.'}`;
      await this.sendNotification(
        fullTimeId,
        title,
        msg,
        'FULL_TIME',
        match.id,
        crestToUse,
        match.homeTeam.name,
        match.awayTeam.name,
        match.homeScore,
        match.awayScore,
        'FT'
      );
      newNotifiedIds.push(fullTimeId);
      notifiedEventIds.add(fullTimeId);
    }

    // 4. In-Match Key Events (Goals, Red Cards, Yellow Cards)
    for (const evt of match.events) {
      if (notifiedEventIds.has(evt.id)) continue;

      if (evt.type === 'GOAL' && settings.notifyGoals) {
        const teamScored = evt.teamName || (evt.teamId === match.homeTeam.id ? match.homeTeam.name : match.awayTeam.name);
        const goalCrest = evt.teamId === match.homeTeam.id ? match.homeTeam.crest : match.awayTeam.crest;
        
        let details = `⚽ Goal for ${teamScored}!`;
        if (evt.playerName) {
          details = `⚽ ${evt.playerName} (${evt.minute}')`;
          if (evt.assistName) {
            details += `\n👟 Assist: ${evt.assistName}`;
          }
        }
        if (evt.detail && evt.detail.toLowerCase().includes('penalty')) {
          details += ` [Penalty]`;
        }

        const title = `🥅 GOAL! ${match.homeTeam.name} ${match.homeScore} - ${match.awayScore} ${match.awayTeam.name}`;
        await this.sendNotification(
          evt.id,
          title,
          details,
          'GOAL',
          match.id,
          goalCrest || crestToUse,
          match.homeTeam.name,
          match.awayTeam.name,
          match.homeScore,
          match.awayScore,
          `${evt.minute}'`
        );
        newNotifiedIds.push(evt.id);
        notifiedEventIds.add(evt.id);
      } else if (evt.type === 'RED_CARD' && settings.notifyRedCards) {
        const cardTeam = evt.teamName || (evt.teamId === match.homeTeam.id ? match.homeTeam.name : match.awayTeam.name);
        const cardCrest = evt.teamId === match.homeTeam.id ? match.homeTeam.crest : match.awayTeam.crest;
        const title = `🟥 Red Card: ${cardTeam}`;
        const msg = `${evt.playerName || 'Player'} has been sent off at ${evt.minute}'!`;
        await this.sendNotification(
          evt.id,
          title,
          msg,
          'RED_CARD',
          match.id,
          cardCrest || crestToUse,
          match.homeTeam.name,
          match.awayTeam.name,
          match.homeScore,
          match.awayScore,
          `${evt.minute}'`
        );
        newNotifiedIds.push(evt.id);
        notifiedEventIds.add(evt.id);
      }
    }

    return newNotifiedIds;
  }
}
