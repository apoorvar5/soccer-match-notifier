import { Team, NotificationSettings, NotificationLog, Match } from '../models/soccer.models';

export const DEFAULT_SETTINGS: NotificationSettings = {
  notifyKickoff: true,
  notifyGoals: true,
  notifyHalftime: true,
  notifyFullTime: true,
  notifyRedCards: true,
  notifyYellowCards: false,
  notifyPenalties: true,
  enableSound: true,
  pollingIntervalSeconds: 60,
  onlyFollowedTeams: true,
};

const STORAGE_KEYS = {
  FOLLOWED_TEAMS: 'mp_followed_teams',
  SETTINGS: 'mp_settings',
  NOTIFIED_EVENTS: 'mp_notified_events',
  NOTIFICATION_HISTORY: 'mp_notification_history',
  SIMULATED_MATCHES: 'mp_simulated_matches',
  LAST_FETCH_TIME: 'mp_last_fetch_time',
};

// Check if Chrome extension storage API is available
const isChromeStorage = typeof chrome !== 'undefined' && !!chrome.storage && !!chrome.storage.local;

const memoryStorage = new Map<string, string>();

export class StorageService {
  static async get<T>(key: string, defaultValue: T): Promise<T> {
    if (isChromeStorage) {
      return new Promise((resolve) => {
        chrome.storage.local.get([key], (result) => {
          if (result && result[key] !== undefined) {
            resolve(result[key]);
          } else {
            resolve(defaultValue);
          }
        });
      });
    } else if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
      const stored = window.localStorage.getItem(key);
      if (stored) {
        try {
          return JSON.parse(stored) as T;
        } catch (e) {
          return defaultValue;
        }
      }
      return defaultValue;
    } else {
      const stored = memoryStorage.get(key);
      if (stored) {
        try {
          return JSON.parse(stored) as T;
        } catch (e) {
          return defaultValue;
        }
      }
      return defaultValue;
    }
  }

  static async set<T>(key: string, value: T): Promise<void> {
    if (isChromeStorage) {
      return new Promise((resolve) => {
        chrome.storage.local.set({ [key]: value }, () => resolve());
      });
    } else if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
      window.localStorage.setItem(key, JSON.stringify(value));
    } else {
      memoryStorage.set(key, JSON.stringify(value));
    }
  }

  static async getFollowedTeams(): Promise<Team[]> {
    return this.get<Team[]>(STORAGE_KEYS.FOLLOWED_TEAMS, []);
  }

  static async saveFollowedTeams(teams: Team[]): Promise<void> {
    return this.set(STORAGE_KEYS.FOLLOWED_TEAMS, teams);
  }

  static async toggleFollowTeam(team: Team): Promise<Team[]> {
    const teams = await this.getFollowedTeams();
    const index = teams.findIndex((t) => t.id === team.id || t.name.toLowerCase() === team.name.toLowerCase());
    let updated: Team[];
    if (index >= 0) {
      updated = teams.filter((_, i) => i !== index);
    } else {
      updated = [...teams, { ...team, followed: true }];
    }
    await this.saveFollowedTeams(updated);
    return updated;
  }

  static async isTeamFollowed(teamIdOrName: string): Promise<boolean> {
    const teams = await this.getFollowedTeams();
    const query = teamIdOrName.toLowerCase();
    return teams.some((t) => t.id.toLowerCase() === query || t.name.toLowerCase() === query || t.shortName.toLowerCase() === query);
  }

  static async getSettings(): Promise<NotificationSettings> {
    return this.get<NotificationSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  }

  static async saveSettings(settings: NotificationSettings): Promise<void> {
    return this.set(STORAGE_KEYS.SETTINGS, settings);
  }

  static async getNotifiedEventIds(): Promise<string[]> {
    return this.get<string[]>(STORAGE_KEYS.NOTIFIED_EVENTS, []);
  }

  static async markEventNotified(eventId: string): Promise<void> {
    const eventIds = await this.getNotifiedEventIds();
    if (!eventIds.includes(eventId)) {
      // Keep recent 500 events to prevent memory bloat
      const updated = [...eventIds.slice(-500), eventId];
      await this.set(STORAGE_KEYS.NOTIFIED_EVENTS, updated);
    }
  }

  static async getNotificationHistory(): Promise<NotificationLog[]> {
    return this.get<NotificationLog[]>(STORAGE_KEYS.NOTIFICATION_HISTORY, []);
  }

  static async addNotificationLog(log: NotificationLog): Promise<void> {
    const history = await this.getNotificationHistory();
    // Keep newest 100 entries
    const updated = [log, ...history.slice(0, 99)];
    await this.set(STORAGE_KEYS.NOTIFICATION_HISTORY, updated);
  }

  static async clearNotificationHistory(): Promise<void> {
    return this.set(STORAGE_KEYS.NOTIFICATION_HISTORY, []);
  }

  static async getSimulatedMatches(): Promise<Match[]> {
    return this.get<Match[]>(STORAGE_KEYS.SIMULATED_MATCHES, []);
  }

  static async saveSimulatedMatches(matches: Match[]): Promise<void> {
    return this.set(STORAGE_KEYS.SIMULATED_MATCHES, matches);
  }
}
