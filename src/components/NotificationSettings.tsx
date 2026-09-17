import React, { useState } from 'react';
import { NotificationSettings as SettingsType } from '../models/soccer.models';
import { Bell, Volume2, VolumeX, ShieldAlert, Check, Clock, Sliders } from 'lucide-react';

interface SettingsProps {
  settings: SettingsType;
  onSaveSettings: (settings: SettingsType) => void;
  onTestNotification: (type: 'KICKOFF' | 'GOAL' | 'RED_CARD' | 'HALFTIME' | 'FULL_TIME') => void;
}

export const NotificationSettings: React.FC<SettingsProps> = ({
  settings,
  onSaveSettings,
  onTestNotification,
}) => {
  const [localSettings, setLocalSettings] = useState<SettingsType>({ ...settings });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const toggleOption = (key: keyof SettingsType) => {
    const updated = {
      ...localSettings,
      [key]: !localSettings[key],
    };
    setLocalSettings(updated);
    onSaveSettings(updated);
    showSavedToast();
  };

  const setPolling = (seconds: number) => {
    const updated = {
      ...localSettings,
      pollingIntervalSeconds: seconds,
    };
    setLocalSettings(updated);
    onSaveSettings(updated);
    showSavedToast();
  };

  const showSavedToast = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="p-4 fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div>
          <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#f9fafb' }}>
            Alert Preferences
          </h2>
          <p style={{ fontSize: '11px', color: '#9ca3af' }}>
            Customize exactly which match events trigger desktop notifications and sound
          </p>
        </div>

        {savedSuccess && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: 'rgba(16, 185, 129, 0.2)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            color: '#34d399',
            fontSize: '11px',
            fontWeight: 600,
            padding: '2px 8px',
            borderRadius: '6px'
          }}>
            <Check size={12} />
            <span>Saved</span>
          </div>
        )}
      </div>

      {/* Main Event Toggles */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '18px' }}>
        {/* Sound Toggle */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '20px' }}>{localSettings.enableSound ? '🔊' : '🔇'}</span>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#f9fafb' }}>Notification Audio & Fanfare</div>
              <div style={{ fontSize: '11px', color: '#9ca3af' }}>Play referee whistles and goal celebration chimes on events</div>
            </div>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={localSettings.enableSound}
              onChange={() => toggleOption('enableSound')}
            />
            <span className="toggle-slider" />
          </label>
        </div>
        {/* Goal Alerts */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '20px' }}>🥅</span>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#f9fafb' }}>Goals, Scorers & Assists</div>
              <div style={{ fontSize: '11px', color: '#9ca3af' }}>Alert when a goal is scored with scorer & assister name</div>
            </div>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={localSettings.notifyGoals}
              onChange={() => toggleOption('notifyGoals')}
            />
            <span className="toggle-slider" />
          </label>
        </div>

        {/* Kickoff / Game Started */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '20px' }}>⚽</span>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#f9fafb' }}>Match Kickoff / Game Started</div>
              <div style={{ fontSize: '11px', color: '#9ca3af' }}>Alert immediately when a followed match gets underway</div>
            </div>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={localSettings.notifyKickoff}
              onChange={() => toggleOption('notifyKickoff')}
            />
            <span className="toggle-slider" />
          </label>
        </div>

        {/* Halftime */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '20px' }}>⏸️</span>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#f9fafb' }}>Halftime Score</div>
              <div style={{ fontSize: '11px', color: '#9ca3af' }}>Alert at the 45' interval with the halftime score</div>
            </div>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={localSettings.notifyHalftime}
              onChange={() => toggleOption('notifyHalftime')}
            />
            <span className="toggle-slider" />
          </label>
        </div>

        {/* Full Time / Match Ended */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '20px' }}>🏁</span>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#f9fafb' }}>Match Ended / Full Time</div>
              <div style={{ fontSize: '11px', color: '#9ca3af' }}>Alert when referee blows the final whistle with final result</div>
            </div>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={localSettings.notifyFullTime}
              onChange={() => toggleOption('notifyFullTime')}
            />
            <span className="toggle-slider" />
          </label>
        </div>

        {/* Red Cards */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '20px' }}>🟥</span>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#f9fafb' }}>Red Cards / Dismissals</div>
              <div style={{ fontSize: '11px', color: '#9ca3af' }}>Alert when a player receives a direct red or second yellow</div>
            </div>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={localSettings.notifyRedCards}
              onChange={() => toggleOption('notifyRedCards')}
            />
            <span className="toggle-slider" />
          </label>
        </div>

        {/* Yellow Cards */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '20px' }}>🟨</span>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#f9fafb' }}>Yellow Cards (Optional)</div>
              <div style={{ fontSize: '11px', color: '#9ca3af' }}>Alert on yellow card bookings</div>
            </div>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={localSettings.notifyYellowCards}
              onChange={() => toggleOption('notifyYellowCards')}
            />
            <span className="toggle-slider" />
          </label>
        </div>
      </div>

      {/* Sync Interval & Sound */}
      <div className="glass-card" style={{ padding: '14px', marginBottom: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Clock size={16} style={{ color: '#34d399' }} />
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#f9fafb' }}>Background Polling Interval</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
          {[
            { label: '30 sec', value: 30 },
            { label: '1 min', value: 60 },
            { label: '2 min', value: 120 },
            { label: '5 min', value: 300 },
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => setPolling(item.value)}
              style={{
                padding: '6px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 600,
                border: localSettings.pollingIntervalSeconds === item.value ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.1)',
                background: localSettings.pollingIntervalSeconds === item.value ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                color: localSettings.pollingIntervalSeconds === item.value ? '#34d399' : '#9ca3af',
                cursor: 'pointer'
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Test Notification Quick Trigger Buttons */}
      <div className="glass-card" style={{ padding: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Bell size={16} style={{ color: '#fbbf24' }} />
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#f9fafb' }}>
            Test Desktop Notifications
          </span>
        </div>
        <p style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '10px' }}>
          Click any event below to verify how Chrome desktop notifications will appear on your system:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
          <button className="btn-secondary" onClick={() => onTestNotification('GOAL')}>
            <span>⚽ Test Goal Alert</span>
          </button>
          <button className="btn-secondary" onClick={() => onTestNotification('KICKOFF')}>
            <span>⚽ Test Kickoff</span>
          </button>
          <button className="btn-secondary" onClick={() => onTestNotification('RED_CARD')}>
            <span>🟥 Test Red Card</span>
          </button>
          <button className="btn-secondary" onClick={() => onTestNotification('HALFTIME')}>
            <span>⏸️ Test Halftime</span>
          </button>
        </div>
      </div>
    </div>
  );
};
