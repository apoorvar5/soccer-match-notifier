import React from 'react';
import { NotificationLog } from '../models/soccer.models';
import { Trash2, Bell, Clock } from 'lucide-react';

interface HistoryLogProps {
  logs: NotificationLog[];
  onClearHistory: () => void;
}

export const HistoryLog: React.FC<HistoryLogProps> = ({ logs, onClearHistory }) => {
  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getEventBadge = (type: string) => {
    switch (type) {
      case 'GOAL':
        return { label: 'GOAL', color: '#10b981', bg: 'rgba(16, 185, 129, 0.2)' };
      case 'KICKOFF':
        return { label: 'KICKOFF', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.2)' };
      case 'HALFTIME':
        return { label: 'HALFTIME', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.2)' };
      case 'FULL_TIME':
        return { label: 'FULL TIME', color: '#a855f7', bg: 'rgba(168, 85, 247, 0.2)' };
      case 'RED_CARD':
        return { label: 'RED CARD', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.2)' };
      default:
        return { label: 'ALERT', color: '#9ca3af', bg: 'rgba(255, 255, 255, 0.1)' };
    }
  };

  return (
    <div className="p-4 fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div>
          <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#f9fafb' }}>
            Notification Log
          </h2>
          <p style={{ fontSize: '11px', color: '#9ca3af' }}>
            Recent soccer alerts sent to your desktop
          </p>
        </div>

        {logs.length > 0 && (
          <button className="btn-danger" onClick={onClearHistory}>
            <Trash2 size={12} />
            Clear
          </button>
        )}
      </div>

      {logs.length === 0 ? (
        <div className="glass-card" style={{ padding: '24px', textAlign: 'center', margin: '20px 0' }}>
          <Bell size={28} style={{ color: '#6b7280', margin: '0 auto 8px' }} />
          <p style={{ fontSize: '13px', fontWeight: 600, color: '#9ca3af', marginBottom: '4px' }}>
            No Notifications Dispatched Yet
          </p>
          <p style={{ fontSize: '11px', color: '#6b7280' }}>
            When matches start, goals are scored, or cards are given, your notifications will appear here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {logs.map((log) => {
            const badge = getEventBadge(log.eventType);
            return (
              <div
                key={log.id}
                className="glass-card"
                style={{ padding: '10px 12px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}
              >
                {log.teamCrest && (
                  <img
                    src={log.teamCrest}
                    alt=""
                    style={{ width: '28px', height: '28px', objectFit: 'contain', marginTop: '2px' }}
                    onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                  />
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                    <span style={{
                      fontSize: '9px',
                      fontWeight: 700,
                      color: badge.color,
                      background: badge.bg,
                      padding: '1px 6px',
                      borderRadius: '4px',
                      textTransform: 'uppercase'
                    }}>
                      {badge.label}
                    </span>
                    <span style={{ fontSize: '10px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Clock size={10} />
                      {formatTime(log.timestamp)}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#f9fafb', marginBottom: '2px' }}>
                    {log.title}
                  </div>
                  <div style={{ fontSize: '11px', color: '#d1d5db', whiteSpace: 'pre-line' }}>
                    {log.message}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
