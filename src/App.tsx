import React, { useState, useEffect } from 'react';
import { Match, NotificationLog, NotificationSettings as SettingsType, Team } from './models/soccer.models';
import { StorageService, DEFAULT_SETTINGS } from './services/storage.service';
import { SoccerApiService } from './services/soccer-api.service';
import { NotificationService } from './services/notification.service';
import { INITIAL_FOLLOWED_TEAMS } from './services/soccer-data';
import { Header, ActiveTab } from './components/Header';
import { LiveMatches } from './components/LiveMatches';
import { FollowedTeams } from './components/FollowedTeams';
import { NotificationSettings } from './components/NotificationSettings';
import { MatchSimulator } from './components/MatchSimulator';
import { HistoryLog } from './components/HistoryLog';
import { AnimatedNotificationToast, ActiveAlert } from './components/AnimatedNotificationToast';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('live');
  const [followedTeams, setFollowedTeams] = useState<Team[]>([]);
  const [settings, setSettings] = useState<SettingsType>(DEFAULT_SETTINGS);
  const [matches, setMatches] = useState<Match[]>([]);
  const [historyLogs, setHistoryLogs] = useState<NotificationLog[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeAlert, setActiveAlert] = useState<ActiveAlert | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    let teams = await StorageService.getFollowedTeams();
    if (!teams || teams.length === 0) {
      teams = INITIAL_FOLLOWED_TEAMS;
      await StorageService.saveFollowedTeams(teams);
    }
    setFollowedTeams(teams);

    const savedSettings = await StorageService.getSettings();
    setSettings(savedSettings || DEFAULT_SETTINGS);

    const logs = await StorageService.getNotificationHistory();
    setHistoryLogs(logs);

    await refreshMatches();
  };

  const refreshMatches = async () => {
    setIsRefreshing(true);
    try {
      const matchData = await SoccerApiService.fetchAllMatches();
      setMatches(matchData);

      const logs = await StorageService.getNotificationHistory();
      setHistoryLogs(logs);
    } catch (error) {
      console.error('Error refreshing matches:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleToggleFollow = async (team: Team) => {
    const updated = await StorageService.toggleFollowTeam(team);
    setFollowedTeams(updated);
  };

  const handleSaveSettings = async (newSettings: SettingsType) => {
    setSettings(newSettings);
    await StorageService.saveSettings(newSettings);

    // Notify background worker if running in Chrome Extension
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({
        action: 'UPDATE_ALARM',
        intervalSeconds: newSettings.pollingIntervalSeconds,
      });
    }
  };

  const handleToggleSound = () => {
    const updated = { ...settings, enableSound: !settings.enableSound };
    handleSaveSettings(updated);
  };

  const handleTestNotification = async (type: 'KICKOFF' | 'GOAL' | 'RED_CARD' | 'HALFTIME' | 'FULL_TIME') => {
    const sampleCrest = followedTeams[0]?.crest || 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/359.png';
    const sampleTeam = followedTeams[0]?.name || 'Arsenal';

    let title = '';
    let msg = '';

    switch (type) {
      case 'GOAL':
        title = `🥅 GOAL! ${sampleTeam} 1 - 0 Chelsea`;
        msg = `⚽ Bukayo Saka (34')\n👟 Assist: Martin Ødegaard`;
        break;
      case 'KICKOFF':
        title = `⚽ Match Started: ${sampleTeam} vs Chelsea`;
        msg = `Kickoff! The match is underway in the Premier League.`;
        break;
      case 'RED_CARD':
        title = `🟥 Red Card! Chelsea`;
        msg = `Moises Caicedo shown a direct red card at 42'!`;
        break;
      case 'HALFTIME':
        title = `⏸️ Halftime: ${sampleTeam} 1 - 0 Chelsea`;
        msg = `First 45 minutes completed at Emirates Stadium.`;
        break;
      case 'FULL_TIME':
        title = `🏁 Full Time: ${sampleTeam} 2 - 1 Chelsea`;
        msg = `Final whistle! ${sampleTeam} secures victory!`;
        break;
    }

    setActiveAlert({
      id: `toast-${Date.now()}`,
      title,
      message: msg,
      eventType: type,
      teamCrest: sampleCrest,
      timestamp: Date.now(),
    });

    await NotificationService.sendNotification(
      `test-${Date.now()}`,
      title,
      msg,
      type,
      'test-match',
      sampleCrest
    );

    const updatedLogs = await StorageService.getNotificationHistory();
    setHistoryLogs(updatedLogs);
  };

  const handleClearHistory = async () => {
    await StorageService.clearNotificationHistory();
    setHistoryLogs([]);
  };

  const liveMatchesCount = matches.filter(
    (m) => m.status === 'IN_PROGRESS' || m.status === 'HALFTIME'
  ).length;

  return (
    <div style={{ minHeight: '580px', display: 'flex', flexDirection: 'column', background: '#0b0f19', position: 'relative' }}>
      {/* Animated Floating Notification Alert Toast */}
      <AnimatedNotificationToast
        alert={activeAlert}
        onDismiss={() => setActiveAlert(null)}
        enableSound={settings.enableSound}
      />

      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        liveCount={liveMatchesCount}
        followedCount={followedTeams.length}
        onRefresh={refreshMatches}
        isRefreshing={isRefreshing}
        soundEnabled={settings.enableSound}
        onToggleSound={handleToggleSound}
      />

      <main style={{ flex: 1, paddingBottom: '16px' }}>
        {activeTab === 'live' && (
          <LiveMatches
            matches={matches}
            followedTeams={followedTeams}
            onOpenSimulator={() => setActiveTab('simulator')}
            onOpenTeams={() => setActiveTab('teams')}
          />
        )}

        {activeTab === 'teams' && (
          <FollowedTeams
            followedTeams={followedTeams}
            onToggleFollow={handleToggleFollow}
          />
        )}

        {activeTab === 'settings' && (
          <NotificationSettings
            settings={settings}
            onSaveSettings={handleSaveSettings}
            onTestNotification={handleTestNotification}
          />
        )}

        {activeTab === 'simulator' && (
          <MatchSimulator
            followedTeams={followedTeams}
            onMatchesUpdated={refreshMatches}
            onTriggerAlert={setActiveAlert}
          />
        )}

        {activeTab === 'history' && (
          <HistoryLog
            logs={historyLogs}
            onClearHistory={handleClearHistory}
          />
        )}
      </main>

      {/* Extension Footer Info */}
      <footer style={{
        padding: '8px 16px',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '10px',
        color: '#6b7280',
        background: '#070a10'
      }}>
        <span>MatchPulse v1.0 • Manifest V3</span>
        <span>Polling: every {settings.pollingIntervalSeconds || 60}s</span>
      </footer>
    </div>
  );
};
export default App;
