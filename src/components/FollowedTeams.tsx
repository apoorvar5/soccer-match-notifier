import React, { useState } from 'react';
import { Team, League } from '../models/soccer.models';
import { LEAGUES, POPULAR_TEAMS } from '../services/soccer-data';
import { Search, Star, Check, Plus, ShieldCheck } from 'lucide-react';

interface FollowedTeamsProps {
  followedTeams: Team[];
  onToggleFollow: (team: Team) => void;
}

export const FollowedTeams: React.FC<FollowedTeamsProps> = ({
  followedTeams,
  onToggleFollow,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLeague, setSelectedLeague] = useState<string>('all');

  const followedIds = new Set(followedTeams.map((t) => t.id.toLowerCase()));
  const followedNames = new Set(followedTeams.map((t) => t.name.toLowerCase()));

  const isFollowed = (t: Team) => {
    return followedIds.has(t.id.toLowerCase()) || followedNames.has(t.name.toLowerCase());
  };

  // Filter teams by query and league
  const filteredTeams = POPULAR_TEAMS.filter((team) => {
    const matchesSearch =
      searchQuery === '' ||
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.shortName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.leagueName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesLeague = selectedLeague === 'all' || team.leagueId === selectedLeague;

    return matchesSearch && matchesLeague;
  });

  return (
    <div className="p-4 fade-in">
      {/* Header & Quick Stats */}
      <div style={{ marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#f9fafb' }}>
            Follow Your Teams
          </h2>
          <span style={{
            fontSize: '11px',
            fontWeight: 700,
            background: 'rgba(16, 185, 129, 0.15)',
            color: '#34d399',
            padding: '2px 8px',
            borderRadius: '999px',
            border: '1px solid rgba(16, 185, 129, 0.3)'
          }}>
            {followedTeams.length} Active
          </span>
        </div>
        <p style={{ fontSize: '11px', color: '#9ca3af' }}>
          You will receive instant desktop notifications whenever your followed teams start a game, score goals, receive red cards, reach halftime, or finish a match.
        </p>
      </div>

      {/* Currently Followed Chips */}
      {followedTeams.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <span style={{ fontSize: '10px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
            Currently Followed
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {followedTeams.map((team) => (
              <div
                key={team.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  borderRadius: '20px',
                  padding: '3px 8px',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#f9fafb'
                }}
              >
                <img
                  src={team.crest}
                  alt=""
                  style={{ width: '16px', height: '16px', objectFit: 'contain' }}
                  onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                />
                <span>{team.shortName || team.name}</span>
                <button
                  onClick={() => onToggleFollow(team)}
                  title="Unfollow"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#9ca3af',
                    cursor: 'pointer',
                    fontSize: '13px',
                    lineHeight: 1,
                    padding: '0 2px'
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search Input */}
      <div style={{ position: 'relative', marginBottom: '12px' }}>
        <Search
          size={14}
          style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}
        />
        <input
          type="text"
          placeholder="Search team (e.g. Arsenal, Real Madrid, Messi, Bayern)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '8px',
            padding: '8px 12px 8px 32px',
            color: '#f9fafb',
            fontSize: '12px',
            outline: 'none'
          }}
        />
      </div>

      {/* League Filter Badges */}
      <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '12px' }}>
        <button
          onClick={() => setSelectedLeague('all')}
          style={{
            padding: '4px 8px',
            borderRadius: '6px',
            fontSize: '10px',
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            background: selectedLeague === 'all' ? '#10b981' : 'rgba(255, 255, 255, 0.06)',
            color: selectedLeague === 'all' ? '#ffffff' : '#9ca3af'
          }}
        >
          All Leagues
        </button>
        {LEAGUES.map((league) => (
          <button
            key={league.id}
            onClick={() => setSelectedLeague(league.id)}
            style={{
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '10px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              background: selectedLeague === league.id ? '#10b981' : 'rgba(255, 255, 255, 0.06)',
              color: selectedLeague === league.id ? '#ffffff' : '#9ca3af',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            {league.name}
          </button>
        ))}
      </div>

      {/* Teams Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
        {filteredTeams.map((team) => {
          const followed = isFollowed(team);
          return (
            <div
              key={team.id}
              className={`glass-card ${followed ? 'glass-card-active' : ''}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img
                  src={team.crest}
                  alt={team.name}
                  style={{ width: '28px', height: '28px', objectFit: 'contain' }}
                  onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#f9fafb' }}>
                    {team.name}
                  </div>
                  <div style={{ fontSize: '10px', color: '#9ca3af' }}>
                    {team.leagueName} {team.country ? `• ${team.country}` : ''}
                  </div>
                </div>
              </div>

              <button
                onClick={() => onToggleFollow(team)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: followed ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)',
                  background: followed ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                  color: followed ? '#34d399' : '#d1d5db',
                  transition: 'all 0.18s ease'
                }}
              >
                {followed ? (
                  <>
                    <Check size={12} style={{ color: '#34d399' }} />
                    <span>Following</span>
                  </>
                ) : (
                  <>
                    <Plus size={12} />
                    <span>Follow</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
