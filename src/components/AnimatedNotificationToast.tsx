import React, { useEffect, useState } from 'react';
import { EventType } from '../models/soccer.models';
import { SoundEffects } from '../services/audio.service';
import { X, Sparkles, AlertTriangle } from 'lucide-react';

export interface ActiveAlert {
  id: string;
  title: string;
  message: string;
  eventType: EventType;
  teamCrest?: string;
  timestamp: number;
}

interface AnimatedNotificationToastProps {
  alert: ActiveAlert | null;
  onDismiss: () => void;
  enableSound?: boolean;
}

export const AnimatedNotificationToast: React.FC<AnimatedNotificationToastProps> = ({
  alert,
  onDismiss,
  enableSound = true,
}) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!alert) return;

    // Play synthesized sound
    if (enableSound) {
      if (alert.eventType === 'GOAL') {
        SoundEffects.playGoalSound();
      } else if (alert.eventType === 'KICKOFF' || alert.eventType === 'FULL_TIME' || alert.eventType === 'RED_CARD') {
        SoundEffects.playWhistleSound(alert.eventType === 'FULL_TIME');
      }
    }

    setProgress(100);
    const duration = 5000;
    const interval = 50;
    const step = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= step) {
          clearInterval(timer);
          onDismiss();
          return 0;
        }
        return prev - step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [alert, enableSound]);

  if (!alert) return null;

  const isGoal = alert.eventType === 'GOAL';
  const isRed = alert.eventType === 'RED_CARD';
  const isKickoff = alert.eventType === 'KICKOFF';
  const isHT = alert.eventType === 'HALFTIME';
  const isFT = alert.eventType === 'FULL_TIME';

  return (
    <div style={{
      position: 'fixed',
      top: '12px',
      left: '14px',
      right: '14px',
      zIndex: 9999,
      pointerEvents: 'auto',
    }}>
      <div
        className={`glass-card animated-alert-card ${isGoal ? 'goal-glow' : (isRed ? 'red-glow' : 'standard-glow')}`}
        style={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '12px',
          padding: '12px 14px',
          boxShadow: isGoal
            ? '0 0 25px rgba(251, 191, 36, 0.45), 0 8px 30px rgba(0,0,0,0.8)'
            : isRed
            ? '0 0 25px rgba(239, 68, 68, 0.45), 0 8px 30px rgba(0,0,0,0.8)'
            : '0 0 25px rgba(16, 185, 129, 0.4), 0 8px 30px rgba(0,0,0,0.8)',
          background: 'rgba(15, 23, 42, 0.95)',
          border: isGoal
            ? '1.5px solid #fbbf24'
            : isRed
            ? '1.5px solid #ef4444'
            : '1.5px solid #10b981',
          animation: 'bounceIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        }}
      >
        {/* Shimmer Light Sweep Effect */}
        <div className="shimmer-effect" />

        {/* Confetti & Particle Sparks for Goal */}
        {isGoal && (
          <div className="confetti-container">
            <span className="particle particle-1">✨</span>
            <span className="particle particle-2">🎉</span>
            <span className="particle particle-3">⚡</span>
            <span className="particle particle-4">⚽</span>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          {/* Animated Icon Avatar */}
          <div style={{
            position: 'relative',
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: isGoal
              ? 'linear-gradient(135deg, #f59e0b, #d97706)'
              : isRed
              ? 'linear-gradient(135deg, #ef4444, #b91c1c)'
              : 'linear-gradient(135deg, #10b981, #047857)',
            boxShadow: '0 0 12px rgba(0,0,0,0.5)',
            flexShrink: 0,
            animation: isGoal ? 'spinBall 2s ease infinite' : (isRed ? 'vibrate 0.3s ease infinite' : 'none'),
          }}>
            {alert.teamCrest ? (
              <img src={alert.teamCrest} alt="" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
            ) : (
              <span style={{ fontSize: '22px' }}>
                {isGoal ? '⚽' : isRed ? '🟥' : isKickoff ? '⚽' : isHT ? '⏸️' : '🏁'}
              </span>
            )}
          </div>

          {/* Alert Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{
                  fontSize: '9px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                  padding: '1px 6px',
                  borderRadius: '4px',
                  color: isGoal ? '#000000' : '#ffffff',
                  background: isGoal ? '#fbbf24' : (isRed ? '#ef4444' : '#10b981'),
                  boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                }}>
                  {isGoal ? 'GOAL ALERT!' : isRed ? 'RED CARD!' : isKickoff ? 'KICKOFF' : isHT ? 'HALFTIME' : 'MATCH ENDED'}
                </span>
                {isGoal && <Sparkles size={11} style={{ color: '#fbbf24', animation: 'spinBall 3s linear infinite' }} />}
              </div>

              <button
                onClick={onDismiss}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#9ca3af',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <X size={14} />
              </button>
            </div>

            <div style={{
              fontSize: '13px',
              fontWeight: 800,
              color: '#ffffff',
              marginBottom: '2px',
              textShadow: '0 1px 2px rgba(0,0,0,0.8)'
            }}>
              {alert.title}
            </div>

            <div style={{
              fontSize: '11px',
              fontWeight: 500,
              color: '#e2e8f0',
              lineHeight: 1.3,
              whiteSpace: 'pre-line'
            }}>
              {alert.message}
            </div>
          </div>
        </div>

        {/* Animated Progress Countdown Bar */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          height: '3px',
          width: `${progress}%`,
          background: isGoal ? '#fbbf24' : (isRed ? '#ef4444' : '#34d399'),
          transition: 'width 0.05s linear',
        }} />
      </div>
    </div>
  );
};
