export type MatchStatus = 
  | 'SCHEDULED' 
  | 'IN_PROGRESS' 
  | 'HALFTIME' 
  | 'FINISHED' 
  | 'POSTPONED' 
  | 'CANCELLED';

export type EventType = 
  | 'KICKOFF'
  | 'GOAL'
  | 'RED_CARD'
  | 'YELLOW_CARD'
  | 'HALFTIME'
  | 'FULL_TIME'
  | 'PENALTY_MISSED'
  | 'VAR';

export interface Team {
  id: string;
  name: string;
  shortName: string;
  code: string;
  crest: string;
  leagueId: string;
  leagueName: string;
  country?: string;
  followed?: boolean;
}

export interface MatchEvent {
  id: string;
  type: EventType;
  minute: string | number;
  teamId?: string;
  teamName?: string;
  playerName?: string;
  assistName?: string;
  detail?: string;
  score?: {
    home: number;
    away: number;
  };
  timestamp: number;
}

export interface Match {
  id: string;
  leagueId: string;
  leagueName: string;
  leagueLogo?: string;
  homeTeam: Team;
  awayTeam: Team;
  homeScore: number;
  awayScore: number;
  status: MatchStatus;
  statusDetail?: string; // e.g., '1st Half', 'Halftime', '2nd Half', 'FT'
  clock: string; // e.g. "35'", "HT", "90+3'", "FT"
  startTime: string; // ISO string
  events: MatchEvent[];
  venue?: string;
  isLive?: boolean;
}

export interface NotificationSettings {
  notifyKickoff: boolean;
  notifyGoals: boolean;
  notifyHalftime: boolean;
  notifyFullTime: boolean;
  notifyRedCards: boolean;
  notifyYellowCards: boolean;
  notifyPenalties: boolean;
  enableSound: boolean;
  pollingIntervalSeconds: number;
  onlyFollowedTeams: boolean;
}

export interface NotificationLog {
  id: string;
  title: string;
  message: string;
  eventType: EventType;
  matchId: string;
  timestamp: number;
  teamCrest?: string;
}

export interface League {
  id: string;
  name: string;
  country: string;
  code: string;
  logo: string;
}
