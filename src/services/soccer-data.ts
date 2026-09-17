import { League, Team } from '../models/soccer.models';

export const LEAGUES: League[] = [
  {
    id: 'eng.1',
    name: 'Premier League',
    country: 'England',
    code: 'EPL',
    logo: 'https://a.espncdn.com/combiner/i?img=/i/leaguelogos/soccer/500/23.png&w=64&h=64'
  },
  {
    id: 'uefa.champions',
    name: 'UEFA Champions League',
    country: 'Europe',
    code: 'UCL',
    logo: 'https://a.espncdn.com/combiner/i?img=/i/leaguelogos/soccer/500/2.png&w=64&h=64'
  },
  {
    id: 'esp.1',
    name: 'La Liga',
    country: 'Spain',
    code: 'ESP',
    logo: 'https://a.espncdn.com/combiner/i?img=/i/leaguelogos/soccer/500/15.png&w=64&h=64'
  },
  {
    id: 'ita.1',
    name: 'Serie A',
    country: 'Italy',
    code: 'ITA',
    logo: 'https://a.espncdn.com/combiner/i?img=/i/leaguelogos/soccer/500/12.png&w=64&h=64'
  },
  {
    id: 'ger.1',
    name: 'Bundesliga',
    country: 'Germany',
    code: 'GER',
    logo: 'https://a.espncdn.com/combiner/i?img=/i/leaguelogos/soccer/500/10.png&w=64&h=64'
  },
  {
    id: 'usa.1',
    name: 'Major League Soccer',
    country: 'USA',
    code: 'MLS',
    logo: 'https://a.espncdn.com/combiner/i?img=/i/leaguelogos/soccer/500/19.png&w=64&h=64'
  },
  {
    id: 'fra.1',
    name: 'Ligue 1',
    country: 'France',
    code: 'FRA',
    logo: 'https://a.espncdn.com/combiner/i?img=/i/leaguelogos/soccer/500/9.png&w=64&h=64'
  }
];

export const POPULAR_TEAMS: Team[] = [
  // Premier League
  {
    id: '359',
    name: 'Arsenal',
    shortName: 'Arsenal',
    code: 'ARS',
    crest: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/359.png&w=64&h=64',
    leagueId: 'eng.1',
    leagueName: 'Premier League',
    country: 'England'
  },
  {
    id: '360',
    name: 'Manchester United',
    shortName: 'Man United',
    code: 'MUN',
    crest: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/360.png&w=64&h=64',
    leagueId: 'eng.1',
    leagueName: 'Premier League',
    country: 'England'
  },
  {
    id: '364',
    name: 'Liverpool',
    shortName: 'Liverpool',
    code: 'LIV',
    crest: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/364.png&w=64&h=64',
    leagueId: 'eng.1',
    leagueName: 'Premier League',
    country: 'England'
  },
  {
    id: '382',
    name: 'Manchester City',
    shortName: 'Man City',
    code: 'MCI',
    crest: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/382.png&w=64&h=64',
    leagueId: 'eng.1',
    leagueName: 'Premier League',
    country: 'England'
  },
  {
    id: '363',
    name: 'Chelsea',
    shortName: 'Chelsea',
    code: 'CHE',
    crest: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/363.png&w=64&h=64',
    leagueId: 'eng.1',
    leagueName: 'Premier League',
    country: 'England'
  },
  {
    id: '367',
    name: 'Tottenham Hotspur',
    shortName: 'Tottenham',
    code: 'TOT',
    crest: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/367.png&w=64&h=64',
    leagueId: 'eng.1',
    leagueName: 'Premier League',
    country: 'England'
  },
  {
    id: '361',
    name: 'Newcastle United',
    shortName: 'Newcastle',
    code: 'NEW',
    crest: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/361.png&w=64&h=64',
    leagueId: 'eng.1',
    leagueName: 'Premier League',
    country: 'England'
  },
  {
    id: '362',
    name: 'Aston Villa',
    shortName: 'Aston Villa',
    code: 'AVL',
    crest: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/362.png&w=64&h=64',
    leagueId: 'eng.1',
    leagueName: 'Premier League',
    country: 'England'
  },

  // La Liga
  {
    id: '86',
    name: 'Real Madrid',
    shortName: 'Real Madrid',
    code: 'RMA',
    crest: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/86.png&w=64&h=64',
    leagueId: 'esp.1',
    leagueName: 'La Liga',
    country: 'Spain'
  },
  {
    id: '83',
    name: 'Barcelona',
    shortName: 'Barcelona',
    code: 'BAR',
    crest: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/83.png&w=64&h=64',
    leagueId: 'esp.1',
    leagueName: 'La Liga',
    country: 'Spain'
  },
  {
    id: '1068',
    name: 'Atlético Madrid',
    shortName: 'Atlético',
    code: 'ATM',
    crest: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/1068.png&w=64&h=64',
    leagueId: 'esp.1',
    leagueName: 'La Liga',
    country: 'Spain'
  },

  // Serie A
  {
    id: '111',
    name: 'Juventus',
    shortName: 'Juventus',
    code: 'JUV',
    crest: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/111.png&w=64&h=64',
    leagueId: 'ita.1',
    leagueName: 'Serie A',
    country: 'Italy'
  },
  {
    id: '103',
    name: 'AC Milan',
    shortName: 'AC Milan',
    code: 'MIL',
    crest: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/103.png&w=64&h=64',
    leagueId: 'ita.1',
    leagueName: 'Serie A',
    country: 'Italy'
  },
  {
    id: '110',
    name: 'Inter Milan',
    shortName: 'Inter',
    code: 'INT',
    crest: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/110.png&w=64&h=64',
    leagueId: 'ita.1',
    leagueName: 'Serie A',
    country: 'Italy'
  },
  {
    id: '114',
    name: 'Napoli',
    shortName: 'Napoli',
    code: 'NAP',
    crest: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/114.png&w=64&h=64',
    leagueId: 'ita.1',
    leagueName: 'Serie A',
    country: 'Italy'
  },

  // Bundesliga
  {
    id: '132',
    name: 'Bayern Munich',
    shortName: 'Bayern',
    code: 'BAY',
    crest: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/132.png&w=64&h=64',
    leagueId: 'ger.1',
    leagueName: 'Bundesliga',
    country: 'Germany'
  },
  {
    id: '124',
    name: 'Borussia Dortmund',
    shortName: 'Dortmund',
    code: 'BVB',
    crest: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/124.png&w=64&h=64',
    leagueId: 'ger.1',
    leagueName: 'Bundesliga',
    country: 'Germany'
  },
  {
    id: '131',
    name: 'Bayer Leverkusen',
    shortName: 'Leverkusen',
    code: 'B04',
    crest: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/131.png&w=64&h=64',
    leagueId: 'ger.1',
    leagueName: 'Bundesliga',
    country: 'Germany'
  },

  // Ligue 1
  {
    id: '160',
    name: 'Paris Saint-Germain',
    shortName: 'PSG',
    code: 'PSG',
    crest: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/160.png&w=64&h=64',
    leagueId: 'fra.1',
    leagueName: 'Ligue 1',
    country: 'France'
  },

  // MLS
  {
    id: '19047',
    name: 'Inter Miami CF',
    shortName: 'Inter Miami',
    code: 'MIA',
    crest: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/19047.png&w=64&h=64',
    leagueId: 'usa.1',
    leagueName: 'MLS',
    country: 'USA'
  },
  {
    id: '184',
    name: 'LA Galaxy',
    shortName: 'LA Galaxy',
    code: 'LA',
    crest: 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/184.png&w=64&h=64',
    leagueId: 'usa.1',
    leagueName: 'MLS',
    country: 'USA'
  }
];

export const INITIAL_FOLLOWED_TEAMS: Team[] = [
  POPULAR_TEAMS[0], // Arsenal
  POPULAR_TEAMS[8], // Real Madrid
  POPULAR_TEAMS[3], // Man City
];
