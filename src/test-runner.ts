import { SoccerApiService } from './services/soccer-api.service';
import { NotificationService } from './services/notification.service';
import { StorageService, DEFAULT_SETTINGS } from './services/storage.service';
import { POPULAR_TEAMS } from './services/soccer-data';
import { Match, MatchEvent } from './models/soccer.models';

async function runTests() {
  console.log('=== RUNNING MATCHPULSE LOGIC TESTS ===\n');

  // Test 1: Team Search
  console.log('Test 1: Team Search');
  const searchArsenal = SoccerApiService.searchTeams('Arsenal');
  if (searchArsenal.length > 0 && searchArsenal[0].name === 'Arsenal') {
    console.log('  ✓ Search for "Arsenal" found:', searchArsenal[0].name, searchArsenal[0].crest);
  } else {
    throw new Error('Arsenal search failed');
  }

  const searchMadrid = SoccerApiService.searchTeams('Madrid');
  if (searchMadrid.length >= 2) {
    console.log(`  ✓ Search for "Madrid" found ${searchMadrid.length} teams (Real & Atletico)`);
  }

  // Test 2: Storage Defaults
  console.log('\nTest 2: Storage Service Defaults');
  const initialFollowed = [POPULAR_TEAMS[0], POPULAR_TEAMS[8]]; // Arsenal, Real Madrid
  await StorageService.saveFollowedTeams(initialFollowed);
  const fetchedFollowed = await StorageService.getFollowedTeams();
  console.log(`  ✓ Followed teams saved & fetched: ${fetchedFollowed.map(t => t.name).join(', ')}`);

  // Test 3: Match Processing & Notification Engine
  console.log('\nTest 3: Event-driven Notification Processing');
  const testMatch: Match = {
    id: 'test-arsenal-chelsea',
    leagueId: 'eng.1',
    leagueName: 'Premier League',
    homeTeam: POPULAR_TEAMS[0], // Arsenal
    awayTeam: POPULAR_TEAMS[4], // Chelsea
    homeScore: 1,
    awayScore: 0,
    status: 'IN_PROGRESS',
    statusDetail: '1st Half',
    clock: "34'",
    startTime: new Date().toISOString(),
    events: [
      {
        id: 'goal-saka-34',
        type: 'GOAL',
        minute: "34'",
        teamId: POPULAR_TEAMS[0].id,
        teamName: 'Arsenal',
        playerName: 'Bukayo Saka',
        assistName: 'Martin Ødegaard',
        timestamp: Date.now(),
      }
    ]
  };

  const notifiedSet = new Set<string>();
  
  // First run: should trigger Kickoff and Goal notifications
  const triggeredIds = await NotificationService.processMatchForNotifications(
    testMatch,
    fetchedFollowed,
    DEFAULT_SETTINGS,
    notifiedSet
  );

  console.log('  ✓ Triggered Notification IDs:', triggeredIds);
  if (triggeredIds.includes('test-arsenal-chelsea-KICKOFF') && triggeredIds.includes('goal-saka-34')) {
    console.log('  ✓ Both Kickoff and Goal (Saka / assist Ødegaard) were triggered!');
  } else {
    throw new Error('Notifications failed to trigger');
  }

  // Second run: deduplication test - should NOT trigger anything again
  const secondRun = await NotificationService.processMatchForNotifications(
    testMatch,
    fetchedFollowed,
    DEFAULT_SETTINGS,
    notifiedSet
  );
  console.log('  ✓ Second Run with same events (Deduplication):', secondRun.length, 'new alerts (Expected: 0)');
  if (secondRun.length !== 0) {
    throw new Error('Deduplication failed, duplicate notifications fired');
  }

  // Test Red Card & Halftime
  testMatch.status = 'HALFTIME';
  testMatch.clock = 'HT';
  testMatch.events.push({
    id: 'red-caicedo-42',
    type: 'RED_CARD',
    minute: "42'",
    teamId: POPULAR_TEAMS[4].id,
    teamName: 'Chelsea',
    playerName: 'Moises Caicedo',
    timestamp: Date.now(),
  });

  const thirdRun = await NotificationService.processMatchForNotifications(
    testMatch,
    fetchedFollowed,
    DEFAULT_SETTINGS,
    notifiedSet
  );
  console.log('  ✓ Halftime & Red Card Triggered:', thirdRun);
  if (thirdRun.includes('test-arsenal-chelsea-HALFTIME') && thirdRun.includes('red-caicedo-42')) {
    console.log('  ✓ Halftime and Red Card notifications successfully triggered!');
  } else {
    throw new Error('Halftime / Red card notifications failed');
  }

  // Test Notification History Log
  const history = await StorageService.getNotificationHistory();
  console.log(`\nTest 4: Notification History Log (${history.length} logged items)`);
  history.slice(0, 3).forEach((h, i) => {
    console.log(`  [${i + 1}] [${h.eventType}] ${h.title} => ${h.message.replace('\n', ' ')}`);
  });

  console.log('\n=== ALL TESTS PASSED SUCCESSFULLY! ===');
}

runTests().catch(console.error);
