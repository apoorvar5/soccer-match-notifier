import React from 'react';
import { Radio, Users, Bell, PlaySquare, History, RefreshCw, Volume2, VolumeX } from 'lucide-react';

export type ActiveTab = 'live' | 'teams' | 'settings' | 'simulator' | 'history';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  liveCount: number;
  followedCount: number;
  onRefresh: () => void;
  isRefreshing: boolean;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  liveCount,
  followedCount,
  onRefresh,
  isRefreshing,
  soundEnabled = true,
  onToggleSound,
}) => {
  return (
    <header className="px-4 pt-4 pb-2 border-b border-white/10 bg-[#0b0f19]/90 sticky top-0 z-50 backdrop-blur-md">
      {/* Top Brand Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #10b981, #047857)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 12px rgba(16, 185, 129, 0.4)'
          }}>
            <span style={{ fontSize: '18px' }}>⚽</span>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <h1 style={{ fontSize: '16px', fontWeight: 800, letterSpacing: '-0.3px', color: '#ffffff' }}>
                Match<span style={{ color: '#34d399' }}>Pulse</span>
              </h1>
              <span style={{
                fontSize: '9px',
                fontWeight: 700,
                textTransform: 'uppercase',
                background: 'rgba(16, 185, 129, 0.2)',
                color: '#34d399',
                padding: '1px 6px',
                borderRadius: '4px',
                border: '1px solid rgba(16, 185, 129, 0.3)'
              }}>
                LIVE ALERTS
              </span>
            </div>
            <p style={{ fontSize: '11px', color: '#9ca3af' }}>Instant soccer match event notifications</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {onToggleSound && (
            <button
              onClick={onToggleSound}
              title={soundEnabled ? 'Mute notification sound' : 'Unmute notification sound'}
              style={{
                background: soundEnabled ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.06)',
                border: soundEnabled ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: soundEnabled ? '#34d399' : '#9ca3af',
                padding: '6px 8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease'
              }}
            >
              {soundEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
            </button>
          )}

          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Refresh match scores"
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              color: isRefreshing ? '#34d399' : '#9ca3af',
              padding: '6px 10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '11px',
              fontWeight: 500,
              transition: 'all 0.2s ease'
            }}
          >
            <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
            <span>{isRefreshing ? 'Syncing...' : 'Sync'}</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '4px' }}>
        <button
          className={`nav-tab ${activeTab === 'live' ? 'active' : ''}`}
          onClick={() => onTabChange('live')}
        >
          <Radio size={14} />
          <span>Matches</span>
          {liveCount > 0 && (
            <span style={{
              background: '#ef4444',
              color: '#ffffff',
              fontSize: '10px',
              fontWeight: 700,
              padding: '0 5px',
              borderRadius: '999px',
              marginLeft: '2px'
            }}>
              {liveCount}
            </span>
          )}
        </button>

        <button
          className={`nav-tab ${activeTab === 'teams' ? 'active' : ''}`}
          onClick={() => onTabChange('teams')}
        >
          <Users size={14} />
          <span>Teams</span>
          {followedCount > 0 && (
            <span style={{
              background: 'rgba(255,255,255,0.15)',
              color: '#f9fafb',
              fontSize: '10px',
              fontWeight: 600,
              padding: '0 5px',
              borderRadius: '999px',
            }}>
              {followedCount}
            </span>
          )}
        </button>

        <button
          className={`nav-tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => onTabChange('settings')}
        >
          <Bell size={14} />
          <span>Alerts</span>
        </button>

        <button
          className={`nav-tab ${activeTab === 'simulator' ? 'active' : ''}`}
          onClick={() => onTabChange('simulator')}
        >
          <PlaySquare size={14} />
          <span>Test Bench</span>
        </button>

        <button
          className={`nav-tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => onTabChange('history')}
        >
          <History size={14} />
          <span>History</span>
        </button>
      </nav>
    </header>
  );
};
