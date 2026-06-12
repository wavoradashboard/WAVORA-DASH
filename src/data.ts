import { User, Release, ArtistProfile, Label, RevenueReport, SupportQuery, OacApplication, Notification } from './types';

export interface AppState {
  users: User[];
  releases: Release[];
  artists: ArtistProfile[];
  labels: Label[];
  revenueReports: RevenueReport[];
  queries: SupportQuery[];
  oacApplications: OacApplication[];
  notifications?: Notification[]; // Backwards-compatible optional field
}

const SEED_USERS: User[] = [
  {
    email: 'admin@g.g',
    password: '232323',
    artistName: 'Administrator',
    plan: 'Elite',
    isApproved: true,
    registeredAt: '2026-01-01T00:00:00Z',
  },
  {
    email: 'luna@wavora.live',
    password: 'password',
    artistName: 'Luna Drift',
    plan: 'Basic',
    isApproved: true,
    registeredAt: '2026-03-10T14:30:00Z',
  },
  {
    email: 'vector@wavora.live',
    password: 'password',
    artistName: 'Vector Static',
    plan: 'Pro',
    isApproved: true,
    registeredAt: '2026-04-05T09:15:00Z',
  },
  {
    email: 'zenith@wavora.live',
    password: 'password',
    artistName: 'Zenith Beats',
    plan: 'Elite',
    isApproved: false, // Pending Admin Approval
    registeredAt: '2026-06-01T11:20:00Z',
  },
];

const SEED_ARTISTS: ArtistProfile[] = [
  {
    id: 'art-1',
    email: 'luna@wavora.live',
    name: 'Luna Drift',
    spotifyLink: 'https://open.spotify.com/artist/luna_drift',
    appleMusicLink: 'https://music.apple.com/artist/luna_drift',
    instagramLink: 'https://instagram.com/luna_drift',
  },
  {
    id: 'art-2',
    email: 'luna@wavora.live',
    name: 'Luna Drift & Echoes',
    spotifyLink: 'https://open.spotify.com/artist/luna_drift_echoes',
    appleMusicLink: 'https://music.apple.com/artist/luna_drift_echoes',
    instagramLink: 'https://instagram.com/luna_drift_echoes',
  },
  {
    id: 'art-3',
    email: 'vector@wavora.live',
    name: 'Vector Static',
    spotifyLink: 'https://open.spotify.com/artist/vector_static',
    appleMusicLink: 'https://music.apple.com/artist/vector_static',
    instagramLink: 'https://instagram.com/vector_static',
  },
  {
    id: 'art-4',
    email: 'zenith@wavora.live',
    name: 'Zenith Beats',
    spotifyLink: 'https://open.spotify.com/artist/zenith_beats',
    appleMusicLink: 'https://music.apple.com/artist/zenith_beats',
    instagramLink: 'https://instagram.com/zenith_beats',
  },
];

const SEED_LABELS: Label[] = [
  {
    id: 'lbl-1',
    email: 'zenith@wavora.live',
    name: 'Prism Records',
  },
  {
    id: 'lbl-2',
    email: 'zenith@wavora.live',
    name: 'Neon Horizon Music',
  },
];

const SEED_RELEASES: Release[] = [
  {
    id: 'rel-1',
    email: 'luna@wavora.live',
    albumName: 'Neon Solitude',
    type: 'Single',
    mainArtistName: 'Luna Drift',
    featureArtists: [],
    otherArtists: [],
    language: 'English',
    contentType: 'Original',
    numTracks: 1,
    genre: 'Electronic',
    subGenre: 'Synthwave',
    releaseDate: '2026-05-20',
    coverArtUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=600&auto=format&fit=crop',
    status: 'Live',
    submittedAt: '2026-05-10T10:00:00Z',
    tracks: [
      {
        id: 'trk-1',
        trackName: 'Neon Solitude',
        mainArtistName: 'Luna Drift',
        featureArtists: [],
        otherArtists: [],
        genre: 'Electronic',
        subGenre: 'Synthwave',
        language: 'English',
        producer: 'Luna Drift',
        lyricist: 'Jane Doe',
        composer: 'Luna Drift',
        isrc: 'US-WV-26-00001',
        explicitContent: false,
        lyrics: 'Cruising through the retro lights, neon solitude at night...',
        audioFileName: 'Neon_Solitude_Master_v2.wav',
      },
    ],
    specialRequest: 'Please pitching to editorial playlist.',
  },
  {
    id: 'rel-2',
    email: 'vector@wavora.live',
    albumName: 'Vaporwave Nights',
    type: 'EP',
    mainArtistName: 'Vector Static',
    featureArtists: [],
    otherArtists: [],
    language: 'English',
    contentType: 'Original',
    numTracks: 2,
    genre: 'Electronic',
    subGenre: 'Vaporwave',
    cLine: '© 2026 Vector Static Music',
    pLine: '℗ 2026 Vector Static Records',
    releaseDate: '2026-06-15',
    coverArtUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop',
    status: 'Submitted',
    submittedAt: '2026-06-05T12:00:00Z',
    tracks: [
      {
        id: 'trk-2',
        trackName: 'Lost in Sunset Shopping Mall',
        mainArtistName: 'Vector Static',
        featureArtists: [],
        otherArtists: [],
        genre: 'Electronic',
        subGenre: 'Vaporwave',
        language: 'English',
        producer: 'Vector Static',
        lyricist: 'Instrumental',
        composer: 'Vector Static',
        isrc: 'US-WV-26-00002',
        explicitContent: false,
        audioFileName: '01_Lost_In_Sunset.wav',
      },
      {
        id: 'trk-3',
        trackName: 'Analog VHS Dreams',
        mainArtistName: 'Vector Static',
        featureArtists: [],
        otherArtists: [],
        genre: 'Electronic',
        subGenre: 'Vaporwave',
        language: 'English',
        producer: 'Vector Static',
        lyricist: 'Instrumental',
        composer: 'Vector Static',
        explicitContent: false,
        audioFileName: '02_Analog_VHS_Dreams.wav',
      },
    ],
    specialRequest: 'Please release globally on all digital stores as scheduled.',
  },
  {
    id: 'rel-3',
    email: 'zenith@wavora.live',
    albumName: 'Glow In The Dark',
    type: 'EP',
    mainArtistName: 'Zenith Beats',
    featureArtists: [],
    otherArtists: [],
    language: 'English',
    contentType: 'Original',
    numTracks: 2,
    genre: 'Electronic',
    subGenre: 'Chiptune',
    labelName: 'Prism Records',
    cLine: '© 2026 Prism Records',
    pLine: '℗ 2026 Prism Records',
    releaseDate: '2026-06-25',
    coverArtUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=600&auto=format&fit=crop',
    status: 'Approved',
    submittedAt: '2026-06-02T08:00:00Z',
    tracks: [
      {
        id: 'trk-4',
        trackName: 'Bitworld Jump',
        mainArtistName: 'Zenith Beats',
        featureArtists: [],
        otherArtists: [],
        genre: 'Electronic',
        subGenre: 'Chiptune',
        language: 'English',
        producer: 'Zenith Beats',
        lyricist: 'Retro Synth',
        composer: 'Zenith Beats',
        explicitContent: false,
        audioFileName: '01_Bitworld_Jump.wav',
      },
    ],
  },
];

const SEED_REVENUE: RevenueReport[] = [
  {
    id: 'rev-1',
    email: 'luna@wavora.live',
    month: 'May 2026',
    amount: 1245.82,
    breakdown: [
      { releaseName: 'Neon Solitude (Spotify)', amount: 732.40 },
      { releaseName: 'Neon Solitude (Apple Music)', amount: 412.18 },
      { releaseName: 'Neon Solitude (Amazon Music)', amount: 101.24 },
    ],
  },
  {
    id: 'rev-2',
    email: 'luna@wavora.live',
    month: 'April 2026',
    amount: 890.15,
    breakdown: [
      { releaseName: 'Neon Solitude (Spotify)', amount: 520.10 },
      { releaseName: 'Neon Solitude (Apple Music)', amount: 370.05 },
    ],
  },
  {
    id: 'rev-3',
    email: 'vector@wavora.live',
    month: 'May 2026',
    amount: 450.00,
    breakdown: [
      { releaseName: 'Legacy Single (Spotify)', amount: 300.00 },
      { releaseName: 'Legacy Single (Apple Music)', amount: 150.00 },
    ],
  },
];

const SEED_QUERIES: SupportQuery[] = [
  {
    id: 'q-1',
    email: 'luna@wavora.live',
    artistName: 'Luna Drift',
    queryText: 'When will the royalties for Q1 2026 be deposited into our PayPal bank balance accounts?',
    submittedAt: '2026-06-01T15:00:00Z',
    status: 'Pending',
  },
  {
    id: 'q-2',
    email: 'vector@wavora.live',
    artistName: 'Vector Static',
    queryText: 'Hi support team, I would like to request explicit logo tags correction for my album artwork.',
    submittedAt: '2026-05-28T10:00:00Z',
    status: 'Resolved',
    replyText: 'Hi Vector! We have updated the visual tagging metadata. Your release looks perfectly polished now.',
  },
];

const SEED_OAC: OacApplication[] = [
  {
    id: 'oac-1',
    email: 'luna@wavora.live',
    artistName: 'Luna Drift',
    spotifyLink: 'https://open.spotify.com/artist/luna_drift',
    youtubeLink: 'https://youtube.com/c/luna_drift_music',
    fullName: 'Luna Mae Smith',
    submittedAt: '2026-06-03T09:00:00Z',
    status: 'Pending',
  },
];

const SEED_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    title: 'Platform System Upgrade',
    message: 'Welcome to Wavora Distribution! We have successfully transitioned all digital pipelines to real-time ingestion. Make sure to check our updated metadata policies before submitting EPs.',
    targetType: 'Everyone',
    severity: 'Success',
    createdAt: '2026-06-05T12:00:00Z',
  },
  {
    id: 'notif-2',
    title: 'Premium Sound-Exchange Sync Active',
    message: 'Pro & Elite tier members now enjoy automated direct claims with SoundExchange sync systems. No additional paperwork required.',
    targetType: 'Plan',
    targetValue: 'Pro',
    severity: 'Info',
    createdAt: '2026-06-08T09:30:00Z',
  },
  {
    id: 'notif-3',
    title: 'Metadata Verification Alert',
    message: 'An audit of Spotify Artist Profile links is occurring this week. Make sure your configured profiles under "Manage Artists" are set up correctly.',
    targetType: 'Everyone',
    severity: 'Warning',
    createdAt: '2026-06-10T10:15:00Z',
  }
];

const STORAGE_KEY = 'WAVORA_STATE_V1';

export function getStoredData(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (!parsed.notifications) {
        parsed.notifications = SEED_NOTIFICATIONS;
        saveStoredData(parsed);
      }
      return parsed;
    }
  } catch (e) {
    console.error('Failed reading storage state:', e);
  }

  // Seed default state
  const defaultState: AppState = {
    users: [{
      email: 'admin@g.g',
      password: 'password', // Resetting this placeholder to 'password' for easier login
      artistName: 'Administrator',
      plan: 'Elite',
      isApproved: true,
      registeredAt: new Date().toISOString(),
    }],
    releases: [],
    artists: [],
    labels: [],
    revenueReports: [],
    queries: [],
    oacApplications: [],
    notifications: [],
  };
  saveStoredData(defaultState);
  return defaultState;
}

export function saveStoredData(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed saving storage state:', e);
  }
}
