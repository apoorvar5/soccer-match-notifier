import React, { useState } from 'react';
import { Match, Team } from '../models/soccer.models';
import { ChevronDown, ChevronUp, Clock, AlertCircle, PlayCircle } from 'lucide-react';

interface LiveMatchesProps {
  matches: Match[];
  followedTeams: Team[];
  onOpenSimulator: () => void;
  onOpenTeams: () => void;
}

export const LiveMatches: React.FC<LiveMatchesProps> = ({
  matches,
  followedTeams,
  onOpenSimulator,
  onOpenTeams,
}) => {
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<'followed' | 'all'>('followed');

  const followedIds = new Set(followedTeams.map((t) => t.id.toLowerCase()));
  const followedNames = new Set(followedTeams.map((t) => t.name.toLowerCase()));

  const isMatchFollowed = (m: Match) => {
    return (
      followedIds.has(m.homeTeam.id.toLowerCase()) ||
      followedIds.has(m.awayTeam.id.toLowerCase()) ||
      followedNames.has(m.homeTeam.name.toLowerCase()) ||
      followedNames.has(m.awayTeam.name.toLowerCase())
    );
  };

  const filteredMatches = filterMode === 'followed' 
    ? matches.filter(isMatchFollowed)
    : matches;

  const liveMatches = filteredMatches.filter((m) => m.status === 'IN_PROGRESS' || m.status === 'HALFTIME');
  const finishedMatches = filteredMatches.filter((m) => m.status === 'FINISHED');
  const upcomingMatches = filteredMatches.filter((m) => m.status === 'SCHEDULED');

  const toggleExpand = (id: string) => {
    setExpandedMatchId(expandedMatchId === id ? null : id);
  };

  const renderMatchCard = (match: Match) => {
    const isLive = match.status === 'IN_PROGRESS' || match.status === 'HALFTIME';
    const isHT = match.status === 'HALFTIME';
    const isFT = match.status === 'FINISHED';
    const isExpanded = expandedMatchId === match.id;
    const isFollowed = isMatchFollowed(match);

    return (
      <div
        key={match.id}
        className={`glass-card ${isLive ? 'glass-card-active' : ''}`}
        style={{ marginBottom: '10px', overflow: 'hidden', cursor: 'pointer' }}
        onClick={() => toggleExpand(match.id)}
      >
        {/* Match Header Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          background: 'rgba(255, 255, 255, 0.03)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          fontSize: '11px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#9ca3af' }}>
            {match.leagueLogo && (
              <img src={match.leagueLogo} alt="" style={{ width: '14px', height: '14px', objectFit: 'contain' }} />
            )}
            <span style={{ fontWeight: 600 }}>{match.leagueName}</span>
            {isFollowed && (
              <span style={{
                background: 'rgba(16, 185, 129, 0.2)',
                color: '#34d399',
                fontSize: '9px',
                padding: '1px 5px',
                borderRadius: '4px',
                fontWeight: 700
              }}>
                FOLLOWING
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {isLive && <span className="live-pulse" />}
            <span className={`clock-badge ${isFT ? 'finished' : (isHT ? 'halftime' : '')}`}>
              {isLive ? match.clock : (isFT ? 'Full Time' : (match.statusDetail || 'Upcoming'))}
            </span>
          </div>
        </div>

        {/* Teams & Scoreboard */}
        <div style={{ padding: '12px 14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '10px' }}>
            {/* Home Team */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img
                src={match.homeTeam.crest}
                alt={match.homeTeam.name}
                style={{ width: '28px', height: '28px', objectFit: 'contain' }}
                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
              />
              <span style={{
                fontSize: '13px',
                fontWeight: 600,
                color: '#f9fafb',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {match.homeTeam.shortName || match.homeTeam.name}
              </span>
            </div>

            {/* Score Center */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '4px 10px',
              background: 'rgba(0, 0, 0, 0.4)',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <span style={{
                fontSize: '16px',
                fontWeight: 800,
                fontFamily: 'var(--font-mono)',
                color: isLive ? '#34d399' : '#ffffff'
              }}>
                {match.status === 'SCHEDULED' ? 'vs' : `${match.homeScore} - ${match.awayScore}`}
              </span>
            </div>

            {/* Away Team */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
              <span style={{
                fontSize: '13px',
                fontWeight: 600,
                color: '#f9fafb',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                textAlign: 'right'
              }}>
                {match.awayTeam.shortName || match.awayTeam.name}
              </span>
              <img
                src={match.awayTeam.crest}
                alt={match.awayTeam.name}
                style={{ width: '28px', height: '28px', objectFit: 'contain' }}
                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
              />
            </div>
          </div>

          {/* Quick Key Event Summary Ticker */}
          {match.events && match.events.length > 0 && !isExpanded && (
            <div style={{
              marginTop: '8px',
              paddingTop: '6px',
              borderTop: '1px solid rgba(255, 255, 255, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '11px',
              color: '#9ca3af'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                <span>⚡ Recent:</span>
                <span style={{ color: '#e5e7eb', fontWeight: 500 }}>
                  {match.events[match.events.length - 1].type === 'GOAL' ? '⚽ Goal' : (match.events[match.events.length - 1].type === 'RED_CARD' ? '🟥 Red Card' : '🟨 Card')}
                  {match.events[match.events.length - 1].playerName ? ` - ${match.events[match.events.length - 1].playerName}` : ''} ({match.events[match.events.length - 1].minute}')
                </span>
              </div>
              <ChevronDown size={14} style={{ color: '#6b7280', flexShrink: 0 }} />
            </div>
          )}
        </div>

        {/* Detailed Timeline (Expanded) */}
        {isExpanded && (
          <div style={{
            padding: '10px 14px',
            background: 'rgba(0, 0, 0, 0.3)',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            fontSize: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontWeight: 700, color: '#34d399', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '0.5px' }}>
                Match Events Timeline
              </span>
              <ChevronUp size={14} style={{ color: '#9ca3af' }} />
            </div>

            {(!match.events || match.events.length === 0) ? (
              <p style={{ color: '#6b7280', fontStyle: 'italic', fontSize: '11px' }}>
                No goals or disciplinary cards recorded yet.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {match.events.map((evt, idx) => (
                  <div
                    key={evt.id || idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      background: evt.type === 'GOAL' ? 'rgba(16, 185, 129, 0.1)' : (evt.type === 'RED_CARD' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.04)'),
                      border: evt.type === 'GOAL' ? '1px solid rgba(16, 185, 129, 0.2)' : (evt.type === 'RED_CARD' ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(255, 255, 255, 0.05)')
                    }}
                  >
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      color: '#fbbf24',
                      fontSize: '11px',
                      width: '28px'
                    }}>
                      {evt.minute}'
                    </span>

                    <span style={{ fontSize: '13px' }}>
                      {evt.type === 'GOAL' ? '⚽' : (evt.type === 'RED_CARD' ? '🟥' : (evt.type === 'YELLOW_CARD' ? '🟨' : '⚡'))}
                    </span>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: 600, color: '#f3f4f6' }}>
                          {evt.playerName || evt.type}
                        </span>
                        <span style={{ fontSize: '10px', color: '#9ca3af' }}>
                          ({evt.teamName})
                        </span>
                      </div>
                      {evt.assistName && (
                        <div style={{ fontSize: '10px', color: '#34d399' }}>
                          👟 Assist: {evt.assistName}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-4 fade-in">
      {/* Filter Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '8px', padding: '2px' }}>
          <button
            onClick={() => setFilterMode('followed')}
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              background: filterMode === 'followed' ? '#10b981' : 'transparent',
              color: filterMode === 'followed' ? '#ffffff' : '#9ca3af',
              transition: 'all 0.2s ease'
            }}
          >
            My Teams ({followedTeams.length})
          </button>
          <button
            onClick={() => setFilterMode('all')}
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              background: filterMode === 'all' ? '#10b981' : 'transparent',
              color: filterMode === 'all' ? '#ffffff' : '#9ca3af',
              transition: 'all 0.2s ease'
            }}
          >
            All Matches ({matches.length})
          </button>
        </div>

        <button
          onClick={onOpenSimulator}
          style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '6px',
            color: '#34d399',
            padding: '4px 8px',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <PlayCircle size={12} />
          <span>Test Live Match</span>
        </button>
      </div>

      {/* Empty State */}
      {filteredMatches.length === 0 && (
        <div className="glass-card" style={{ padding: '24px', textAlign: 'center', margin: '20px 0' }}>
          <AlertCircle size={32} style={{ color: '#10b981', margin: '0 auto 10px' }} />
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#f3f4f6', marginBottom: '6px' }}>
            No Active Matches for Followed Teams
          </h3>
          <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '14px', lineHeight: 1.4 }}>
            Your followed teams do not have an active live match right now. You can follow more teams or run a simulation to see instant live notifications in action!
          </p>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            <button className="btn-primary" onClick={onOpenSimulator}>
              <PlayCircle size={14} />
              Launch Match Simulator
            </button>
            <button className="btn-secondary" onClick={onOpenTeams}>
              + Follow More Teams
            </button>
          </div>
        </div>
      )}

      {/* Live Matches Section */}
      {liveMatches.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <span className="live-pulse" />
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Live Now ({liveMatches.length})
            </span>
          </div>
          {liveMatches.map(renderMatchCard)}
        </div>
      )}

      {/* Upcoming Matches Section */}
      {upcomingMatches.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <Clock size={12} style={{ color: '#9ca3af' }} />
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Scheduled Fixtures ({upcomingMatches.length})
            </span>
          </div>
          {upcomingMatches.map(renderMatchCard)}
        </div>
      )}

      {/* Finished Matches Section */}
      {finishedMatches.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Completed Matches ({finishedMatches.length})
            </span>
          </div>
          {finishedMatches.map(renderMatchCard)}
        </div>
      )}
    </div>
  );
};
