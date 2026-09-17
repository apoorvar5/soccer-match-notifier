import React, { useState, useEffect } from 'react';
import { Match, MatchEvent, Team } from '../models/soccer.models';
import { POPULAR_TEAMS } from '../services/soccer-data';
import { StorageService } from '../services/storage.service';
import { NotificationService } from '../services/notification.service';
import { Play, FastForward, RotateCcw, Flame, CheckCircle, ShieldAlert } from 'lucide-react';

import { ActiveAlert } from './AnimatedNotificationToast';

interface MatchSimulatorProps {
  followedTeams: Team[];
  onMatchesUpdated: () => void;
  onTriggerAlert?: (alert: ActiveAlert) => void;
}

export const MatchSimulator: React.FC<MatchSimulatorProps> = ({
  followedTeams,
  onMatchesUpdated,
  onTriggerAlert,
}) => {
  const [homeTeam, setHomeTeam] = useState<Team>(followedTeams[0] || POPULAR_TEAMS[0]);
  const [awayTeam, setAwayTeam] = useState<Team>(POPULAR_TEAMS[8] || POPULAR_TEAMS[1]);
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [scorerInput, setScorerInput] = useState('Bukayo Saka');
  const [assistInput, setAssistInput] = useState('Martin Ødegaard');

  useEffect(() => {
    loadSimulated();
  }, []);

  const loadSimulated = async () => {
    const sims = await StorageService.getSimulatedMatches();
    if (sims && sims.length > 0) {
      setCurrentMatch(sims[0]);
    }
  };

  const startNewMatch = async () => {
    const matchId = `sim-${Date.now()}`;
    const newMatch: Match = {
      id: matchId,
      leagueId: homeTeam.leagueId || 'eng.1',
      leagueName: homeTeam.leagueName || 'Premier League',
      leagueLogo: 'https://a.espncdn.com/combiner/i?img=/i/leaguelogos/soccer/500/23.png&w=64&h=64',
      homeTeam,
      awayTeam,
      homeScore: 0,
      awayScore: 0,
      status: 'IN_PROGRESS',
      statusDetail: '1st Half',
      clock: "1'",
      startTime: new Date().toISOString(),
      events: [],
      venue: 'Emirates Stadium',
      isLive: true,
    };

    setCurrentMatch(newMatch);
    await StorageService.saveSimulatedMatches([newMatch]);

    // Send Kickoff Notification
    const kickoffTitle = `⚽ Match Started: ${homeTeam.name} vs ${awayTeam.name}`;
    const kickoffMsg = `Kickoff! The clash has begun in ${newMatch.leagueName}.`;
    onTriggerAlert?.({
      id: `${matchId}-KICKOFF`,
      title: kickoffTitle,
      message: kickoffMsg,
      eventType: 'KICKOFF',
      teamCrest: homeTeam.crest,
      timestamp: Date.now(),
    });

    await NotificationService.sendNotification(
      `${matchId}-KICKOFF`,
      kickoffTitle,
      kickoffMsg,
      'KICKOFF',
      matchId,
      homeTeam.crest
    );
    await StorageService.markEventNotified(`${matchId}-KICKOFF`);

    onMatchesUpdated();
  };

  const triggerGoal = async (isHome: boolean) => {
    if (!currentMatch) return;

    const scoringTeam = isHome ? currentMatch.homeTeam : currentMatch.awayTeam;
    const newHomeScore = isHome ? currentMatch.homeScore + 1 : currentMatch.homeScore;
    const newAwayScore = !isHome ? currentMatch.awayScore + 1 : currentMatch.awayScore;
    const minute = `${Math.floor(Math.random() * 80) + 10}`;

    const goalEvent: MatchEvent = {
      id: `${currentMatch.id}-GOAL-${Date.now()}`,
      type: 'GOAL',
      minute,
      teamId: scoringTeam.id,
      teamName: scoringTeam.name,
      playerName: scorerInput || (isHome ? 'Striker' : 'Forward'),
      assistName: assistInput || '',
      score: { home: newHomeScore, away: newAwayScore },
      timestamp: Date.now(),
    };

    const updatedMatch: Match = {
      ...currentMatch,
      homeScore: newHomeScore,
      awayScore: newAwayScore,
      clock: `${minute}'`,
      events: [...currentMatch.events, goalEvent],
    };

    setCurrentMatch(updatedMatch);
    await StorageService.saveSimulatedMatches([updatedMatch]);

    // Send Goal Notification
    let msg = `⚽ ${goalEvent.playerName} (${minute}')`;
    if (goalEvent.assistName) {
      msg += `\n👟 Assist: ${goalEvent.assistName}`;
    }
    const goalTitle = `🥅 GOAL! ${updatedMatch.homeTeam.name} ${newHomeScore} - ${newAwayScore} ${updatedMatch.awayTeam.name}`;

    onTriggerAlert?.({
      id: goalEvent.id,
      title: goalTitle,
      message: msg,
      eventType: 'GOAL',
      teamCrest: scoringTeam.crest,
      timestamp: Date.now(),
    });

    await NotificationService.sendNotification(
      goalEvent.id,
      goalTitle,
      msg,
      'GOAL',
      currentMatch.id,
      scoringTeam.crest
    );
    await StorageService.markEventNotified(goalEvent.id);

    onMatchesUpdated();
  };

  const triggerRedCard = async (isHome: boolean) => {
    if (!currentMatch) return;
    const cardTeam = isHome ? currentMatch.homeTeam : currentMatch.awayTeam;
    const minute = `${Math.floor(Math.random() * 80) + 15}`;

    const cardEvent: MatchEvent = {
      id: `${currentMatch.id}-RED-${Date.now()}`,
      type: 'RED_CARD',
      minute,
      teamId: cardTeam.id,
      teamName: cardTeam.name,
      playerName: isHome ? 'Defender' : 'Midfielder',
      timestamp: Date.now(),
    };

    const updatedMatch: Match = {
      ...currentMatch,
      clock: `${minute}'`,
      events: [...currentMatch.events, cardEvent],
    };

    setCurrentMatch(updatedMatch);
    await StorageService.saveSimulatedMatches([updatedMatch]);

    const redTitle = `🟥 Red Card: ${cardTeam.name}`;
    const redMsg = `${cardEvent.playerName} shown a direct red card at ${minute}'!`;

    onTriggerAlert?.({
      id: cardEvent.id,
      title: redTitle,
      message: redMsg,
      eventType: 'RED_CARD',
      teamCrest: cardTeam.crest,
      timestamp: Date.now(),
    });

    await NotificationService.sendNotification(
      cardEvent.id,
      redTitle,
      redMsg,
      'RED_CARD',
      currentMatch.id,
      cardTeam.crest
    );
    await StorageService.markEventNotified(cardEvent.id);

    onMatchesUpdated();
  };

  const triggerHalftime = async () => {
    if (!currentMatch) return;
    const updatedMatch: Match = {
      ...currentMatch,
      status: 'HALFTIME',
      statusDetail: 'Halftime',
      clock: 'HT',
    };

    setCurrentMatch(updatedMatch);
    await StorageService.saveSimulatedMatches([updatedMatch]);

    const htTitle = `⏸️ Halftime: ${currentMatch.homeTeam.name} ${currentMatch.homeScore} - ${currentMatch.awayScore} ${currentMatch.awayTeam.name}`;
    const htMsg = `First 45 minutes completed at the stadium.`;

    onTriggerAlert?.({
      id: `${currentMatch.id}-HALFTIME`,
      title: htTitle,
      message: htMsg,
      eventType: 'HALFTIME',
      teamCrest: currentMatch.homeTeam.crest,
      timestamp: Date.now(),
    });

    await NotificationService.sendNotification(
      `${currentMatch.id}-HALFTIME`,
      htTitle,
      htMsg,
      'HALFTIME',
      currentMatch.id,
      currentMatch.homeTeam.crest
    );
    await StorageService.markEventNotified(`${currentMatch.id}-HALFTIME`);

    onMatchesUpdated();
  };

  const triggerFullTime = async () => {
    if (!currentMatch) return;
    const updatedMatch: Match = {
      ...currentMatch,
      status: 'FINISHED',
      statusDetail: 'Full Time',
      clock: 'FT',
      isLive: false,
    };

    setCurrentMatch(updatedMatch);
    await StorageService.saveSimulatedMatches([updatedMatch]);

    const ftTitle = `🏁 Full Time: ${currentMatch.homeTeam.name} ${currentMatch.homeScore} - ${currentMatch.awayScore} ${currentMatch.awayTeam.name}`;
    const ftMsg = `The referee has blown the final whistle! Match has concluded.`;

    onTriggerAlert?.({
      id: `${currentMatch.id}-FULL_TIME`,
      title: ftTitle,
      message: ftMsg,
      eventType: 'FULL_TIME',
      teamCrest: currentMatch.homeTeam.crest,
      timestamp: Date.now(),
    });

    await NotificationService.sendNotification(
      `${currentMatch.id}-FULL_TIME`,
      ftTitle,
      ftMsg,
      'FULL_TIME',
      currentMatch.id,
      currentMatch.homeTeam.crest
    );
    await StorageService.markEventNotified(`${currentMatch.id}-FULL_TIME`);

    onMatchesUpdated();
  };

  const resetSimulation = async () => {
    setCurrentMatch(null);
    await StorageService.saveSimulatedMatches([]);
    onMatchesUpdated();
  };

  const runFullAutoSimulation = async () => {
    if (isSimulating) return;
    setIsSimulating(true);

    try {
      await startNewMatch();
      await new Promise((r) => setTimeout(r, 2500));

      setScorerInput('Bukayo Saka');
      setAssistInput('Martin Ødegaard');
      await triggerGoal(true);
      await new Promise((r) => setTimeout(r, 3000));

      await triggerRedCard(false);
      await new Promise((r) => setTimeout(r, 2500));

      await triggerHalftime();
      await new Promise((r) => setTimeout(r, 2500));

      setScorerInput('Kai Havertz');
      setAssistInput('Declan Rice');
      await triggerGoal(true);
      await new Promise((r) => setTimeout(r, 3000));

      await triggerFullTime();
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="p-4 fade-in">
      <div style={{ marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Flame size={18} style={{ color: '#fbbf24' }} />
          <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#f9fafb' }}>
            Live Match Simulator & Test Bench
          </h2>
        </div>
        <p style={{ fontSize: '11px', color: '#9ca3af' }}>
          Instantly simulate match events to trigger live desktop notifications on demand.
        </p>
      </div>

      {/* Team Selection */}
      <div className="glass-card" style={{ padding: '12px', marginBottom: '14px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', marginBottom: '8px' }}>
          Select Teams For Test Match
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
          <div>
            <label style={{ fontSize: '10px', color: '#9ca3af', display: 'block', marginBottom: '2px' }}>Home Team</label>
            <select
              value={homeTeam.id}
              onChange={(e) => {
                const found = POPULAR_TEAMS.find((t) => t.id === e.target.value);
                if (found) setHomeTeam(found);
              }}
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '6px',
                padding: '6px 8px',
                color: '#f9fafb',
                fontSize: '12px'
              }}
            >
              {POPULAR_TEAMS.map((t) => (
                <option key={t.id} value={t.id} style={{ background: '#111827', color: '#f9fafb' }}>
                  {t.name} ({t.leagueName})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '10px', color: '#9ca3af', display: 'block', marginBottom: '2px' }}>Away Team</label>
            <select
              value={awayTeam.id}
              onChange={(e) => {
                const found = POPULAR_TEAMS.find((t) => t.id === e.target.value);
                if (found) setAwayTeam(found);
              }}
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '6px',
                padding: '6px 8px',
                color: '#f9fafb',
                fontSize: '12px'
              }}
            >
              {POPULAR_TEAMS.map((t) => (
                <option key={t.id} value={t.id} style={{ background: '#111827', color: '#f9fafb' }}>
                  {t.name} ({t.leagueName})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn-primary" onClick={startNewMatch} style={{ flex: 1 }}>
            <Play size={14} />
            Start Match (Kickoff Alert)
          </button>
          <button
            className="btn-secondary"
            onClick={runFullAutoSimulation}
            disabled={isSimulating}
            style={{ flex: 1, borderColor: '#fbbf24', color: '#fbbf24' }}
          >
            <FastForward size={14} />
            {isSimulating ? 'Simulating...' : 'Auto-Run Match (20s)'}
          </button>
        </div>
      </div>

      {/* Active Simulated Match Board */}
      {currentMatch && (
        <div className="glass-card glass-card-active" style={{ padding: '14px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="live-pulse" />
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#34d399' }}>
                SIMULATED LIVE MATCH
              </span>
            </div>
            <span className="clock-badge">{currentMatch.clock}</span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            background: 'rgba(0, 0, 0, 0.4)',
            padding: '10px',
            borderRadius: '8px',
            marginBottom: '12px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <img src={currentMatch.homeTeam.crest} alt="" style={{ width: '32px', height: '32px', margin: '0 auto 4px' }} />
              <div style={{ fontSize: '12px', fontWeight: 700 }}>{currentMatch.homeTeam.name}</div>
            </div>

            <div style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#34d399' }}>
              {currentMatch.homeScore} - {currentMatch.awayScore}
            </div>

            <div style={{ textAlign: 'center' }}>
              <img src={currentMatch.awayTeam.crest} alt="" style={{ width: '32px', height: '32px', margin: '0 auto 4px' }} />
              <div style={{ fontSize: '12px', fontWeight: 700 }}>{currentMatch.awayTeam.name}</div>
            </div>
          </div>

          {/* Goal Scorer & Assist Inputs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '10px' }}>
            <div>
              <label style={{ fontSize: '10px', color: '#9ca3af', display: 'block', marginBottom: '2px' }}>⚽ Scorer Name</label>
              <input
                type="text"
                value={scorerInput}
                onChange={(e) => setScorerInput(e.target.value)}
                placeholder="Scorer name"
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  fontSize: '11px',
                  color: '#f9fafb'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '10px', color: '#9ca3af', display: 'block', marginBottom: '2px' }}>👟 Assist Name</label>
              <input
                type="text"
                value={assistInput}
                onChange={(e) => setAssistInput(e.target.value)}
                placeholder="Assist name"
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  fontSize: '11px',
                  color: '#f9fafb'
                }}
              />
            </div>
          </div>

          {/* Event Trigger Action Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '10px' }}>
            <button className="btn-secondary" onClick={() => triggerGoal(true)}>
              <span>⚽ Goal: {currentMatch.homeTeam.shortName}</span>
            </button>
            <button className="btn-secondary" onClick={() => triggerGoal(false)}>
              <span>⚽ Goal: {currentMatch.awayTeam.shortName}</span>
            </button>
            <button className="btn-secondary" onClick={() => triggerRedCard(true)}>
              <span>🟥 Red Card ({currentMatch.homeTeam.shortName})</span>
            </button>
            <button className="btn-secondary" onClick={triggerHalftime}>
              <span>⏸️ Halftime (HT)</span>
            </button>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button className="btn-primary" onClick={triggerFullTime} style={{ flex: 1, background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}>
              🏁 Full Time / Match Ended
            </button>
            <button className="btn-danger" onClick={resetSimulation}>
              <RotateCcw size={12} />
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
