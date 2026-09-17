import { Match, MatchEvent, MatchStatus, Team, EventType } from '../models/soccer.models';
import { LEAGUES, POPULAR_TEAMS } from './soccer-data';
import { StorageService } from './storage.service';

export class SoccerApiService {
  private static readonly ESPN_BASE = 'https://site.api.espn.com/apis/site/v2/sports/soccer';

  /**
   * Fetch scoreboard for a specific league from public ESPN API
   */
  static async fetchLeagueScoreboard(leagueId: string): Promise<Match[]> {
    try {
      const url = `${this.ESPN_BASE}/${leagueId}/scoreboard`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch from ESPN: ${response.statusText}`);
      }
      const data = await response.json();
      return this.parseEspnScoreboard(data, leagueId);
    } catch (error) {
      console.warn(`Error fetching live data for ${leagueId}:`, error);
      return [];
    }
  }

  /**
   * Fetch live and scheduled matches across all major leagues + simulated matches
   */
  static async fetchAllMatches(): Promise<Match[]> {
    const promises = LEAGUES.map((league) => this.fetchLeagueScoreboard(league.id));
    const leagueResults = await Promise.all(promises);
    const apiMatches = leagueResults.flat();

    // Also get simulated matches if any
    const simulatedMatches = await StorageService.getSimulatedMatches();

    const allMatches = [...simulatedMatches, ...apiMatches];
    // De-duplicate by ID
    const uniqueMap = new Map<string, Match>();
    allMatches.forEach((m) => uniqueMap.set(m.id, m));
    return Array.from(uniqueMap.values());
  }

  /**
   * Parse ESPN API scoreboard JSON to our standard Match interface
   */
  private static parseEspnScoreboard(data: any, leagueId: string): Match[] {
    if (!data || !data.events || !Array.isArray(data.events)) {
      return [];
    }

    const leagueInfo = LEAGUES.find((l) => l.id === leagueId);
    const leagueName = data.leagues?.[0]?.name || leagueInfo?.name || 'Soccer';
    const leagueLogo = data.leagues?.[0]?.logos?.[0]?.href || leagueInfo?.logo;

    return data.events.map((event: any): Match => {
      const competition = event.competitions?.[0] || {};
      const statusType = event.status?.type?.name || 'STATUS_SCHEDULED';
      const statusState = event.status?.type?.state || 'pre'; // 'pre', 'in', 'post'
      const statusDetail = event.status?.type?.shortDetail || event.status?.type?.description || '';
      const displayClock = event.status?.displayClock ? `${event.status.displayClock}'` : statusDetail;

      let status: MatchStatus = 'SCHEDULED';
      let isLive = false;

      if (statusState === 'in') {
        if (statusType.includes('HALFTIME') || statusDetail.toLowerCase().includes('half')) {
          status = 'HALFTIME';
        } else {
          status = 'IN_PROGRESS';
        }
        isLive = true;
      } else if (statusState === 'post') {
        status = 'FINISHED';
      } else if (statusType.includes('POSTPONED')) {
        status = 'POSTPONED';
      } else if (statusType.includes('CANCEL')) {
        status = 'CANCELLED';
      }

      // Home & Away competitors
      const competitors = competition.competitors || [];
      const homeComp = competitors.find((c: any) => c.homeAway === 'home') || competitors[0] || {};
      const awayComp = competitors.find((c: any) => c.homeAway === 'away') || competitors[1] || {};

      const homeTeam: Team = {
        id: homeComp.id || `home-${event.id}`,
        name: homeComp.team?.displayName || homeComp.team?.name || 'Home Team',
        shortName: homeComp.team?.shortDisplayName || homeComp.team?.name || 'Home',
        code: homeComp.team?.abbreviation || 'HOM',
        crest: homeComp.team?.logo || 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/default.png',
        leagueId,
        leagueName,
      };

      const awayTeam: Team = {
        id: awayComp.id || `away-${event.id}`,
        name: awayComp.team?.displayName || awayComp.team?.name || 'Away Team',
        shortName: awayComp.team?.shortDisplayName || awayComp.team?.name || 'Away',
        code: awayComp.team?.abbreviation || 'AWY',
        crest: awayComp.team?.logo || 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/default.png',
        leagueId,
        leagueName,
      };

      const homeScore = parseInt(homeComp.score || '0', 10);
      const awayScore = parseInt(awayComp.score || '0', 10);

      // Parse match events (goals, red cards, yellow cards)
      const events: MatchEvent[] = [];
      const rawDetails = competition.details || [];

      rawDetails.forEach((detail: any, index: number) => {
        const typeText = (detail.type?.text || detail.type?.name || '').toLowerCase();
        const minute = detail.clock?.displayValue || `${detail.clock?.value || ''}`;
        const teamObj = detail.team?.id === homeTeam.id ? homeTeam : awayTeam;

        let eventType: EventType | null = null;
        let playerName = '';
        let assistName = '';

        // Athletes involved
        if (detail.participants && Array.isArray(detail.participants)) {
          playerName = detail.participants[0]?.athlete?.displayName || '';
          if (detail.participants[1]) {
            assistName = detail.participants[1]?.athlete?.displayName || '';
          }
        } else if (detail.athletesInvolved && Array.isArray(detail.athletesInvolved)) {
          playerName = detail.athletesInvolved[0]?.displayName || '';
          if (detail.athletesInvolved[1]) {
            assistName = detail.athletesInvolved[1]?.displayName || '';
          }
        }

        if (typeText.includes('goal') || typeText.includes('penalty')) {
          eventType = 'GOAL';
        } else if (typeText.includes('red card') || typeText.includes('yellow red card') || typeText.includes('second yellow')) {
          eventType = 'RED_CARD';
        } else if (typeText.includes('yellow card')) {
          eventType = 'YELLOW_CARD';
        } else if (typeText.includes('var')) {
          eventType = 'VAR';
        }

        if (eventType) {
          const eventId = `${event.id}-${eventType}-${minute}-${playerName || index}`;
          events.push({
            id: eventId,
            type: eventType,
            minute: minute || '',
            teamId: teamObj.id,
            teamName: teamObj.name,
            playerName,
            assistName,
            detail: detail.type?.text || '',
            timestamp: Date.now(),
          });
        }
      });

      return {
        id: event.id,
        leagueId,
        leagueName,
        leagueLogo,
        homeTeam,
        awayTeam,
        homeScore: isNaN(homeScore) ? 0 : homeScore,
        awayScore: isNaN(awayScore) ? 0 : awayScore,
        status,
        statusDetail,
        clock: status === 'FINISHED' ? 'FT' : (status === 'HALFTIME' ? 'HT' : displayClock),
        startTime: event.date || new Date().toISOString(),
        events,
        venue: competition.venue?.fullName,
        isLive,
      };
    });
  }

  /**
   * Search for teams in our database or via API
   */
  static searchTeams(query: string): Team[] {
    if (!query || query.trim() === '') {
      return POPULAR_TEAMS;
    }
    const q = query.toLowerCase().trim();
    return POPULAR_TEAMS.filter((t) => 
      t.name.toLowerCase().includes(q) ||
      t.shortName.toLowerCase().includes(q) ||
      t.code.toLowerCase().includes(q) ||
      t.leagueName.toLowerCase().includes(q) ||
      (t.country && t.country.toLowerCase().includes(q))
    );
  }
}
