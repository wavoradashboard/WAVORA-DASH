import React, { useState, useEffect } from 'react';
import { getStoredData, saveStoredData, AppState } from './data';
import { User, Release, ArtistProfile, Label, RevenueReport, SupportQuery, OacApplication, TrackStatus } from './types';
import { supabase, isolatedAdminSupabase } from './supabase';

// Importing Tab Components
import LoginScreen from './components/LoginScreen';
import Sidebar from './components/Sidebar';
import DashboardHome from './components/DashboardHome';
import NewReleaseWizard from './components/NewReleaseWizard';
import ManageArtists from './components/ManageArtists';
import ManageLabels from './components/ManageLabels';
import CatalogueView from './components/CatalogueView';
import RevenuePage from './components/RevenuePage';
import SupportPage from './components/SupportPage';
import AdminPanel from './components/AdminPanel';
import ProfileModal from './components/ProfileModal';
import RevenueReportsModal from './components/RevenueReportsModal';
import NotificationsDrawer from './components/NotificationsDrawer';


import { 
  Menu, 
  X, 
  Disc, 
  User as UserIcon, 
  ShieldAlert, 
  Compass, 
  AudioLines, 
  HelpCircle,
  Landmark,
  Tags,
  Users,
  Layers,
  Sparkles,
  Home,
  Bell
} from 'lucide-react';

export default function App() {
  const [appState, setAppState] = useState<AppState>(() => getStoredData());

  // Current session parameters
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [realAdminUser, setRealAdminUser] = useState<User | null>(null);
  const [isImpersonating, setIsImpersonating] = useState<boolean>(false);
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [isOpenMobile, setIsOpenMobile] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isRevenueModalOpen, setIsRevenueModalOpen] = useState<boolean>(false);
  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState<boolean>(false);

  // Fetch all Supabase data
  const loadSupabaseData = async (userEmail: string, userId: string) => {
    try {
      const isAdmin = userEmail.toLowerCase() === 'admin@g.g';

      // Build scoped queries to enforce data privacy at the DB level
      const usersQuery = supabase.from('users').select('*');
      const releasesQuery = supabase.from('releases').select('*').order('submitted_at', { ascending: false });
      const artistsQuery = supabase.from('artists').select('*');
      const labelsQuery = supabase.from('labels').select('*');
      const revenueQuery = supabase.from('revenue_reports').select('*');
      const queriesQuery = supabase.from('support_queries').select('*').order('submitted_at', { ascending: false });
      const oacQuery = supabase.from('oac_applications').select('*').order('submitted_at', { ascending: false });
      const notifQuery = supabase.from('notifications').select('*').order('created_at', { ascending: false });

      // Apply row-level filtering if not admin
      if (!isAdmin) {
        usersQuery.eq('id', userId);
        releasesQuery.eq('user_id', userId);
        artistsQuery.eq('user_id', userId);
        labelsQuery.eq('user_id', userId);
        revenueQuery.eq('user_id', userId);
        queriesQuery.eq('user_id', userId);
        oacQuery.eq('user_id', userId);
      }

      const [
        { data: usersData, error: usersErr },
        { data: releasesData, error: releasesErr },
        { data: artistsData, error: artistsErr },
        { data: labelsData, error: labelsErr },
        { data: revenueData, error: revenueErr },
        { data: queriesData, error: queriesErr },
        { data: oacData, error: oacErr },
        { data: notifData, error: notifErr }
      ] = await Promise.all([
        usersQuery,
        releasesQuery,
        artistsQuery,
        labelsQuery,
        revenueQuery,
        queriesQuery,
        oacQuery,
        notifQuery
      ]);

      if (usersErr) console.error("Error loading users:", usersErr);
      if (releasesErr) console.error("Error loading releases:", releasesErr);
      if (artistsErr) console.error("Error loading artists:", artistsErr);
      if (labelsErr) console.error("Error loading labels:", labelsErr);
      if (revenueErr) console.error("Error loading revenue reports:", revenueErr);
      if (queriesErr) console.error("Error loading support queries:", queriesErr);
      if (oacErr) console.error("Error loading OAC applications:", oacErr);
      if (notifErr) console.error("Error loading notifications:", notifErr);

      // Batch resolve signed URLs for private files
      const storagePathsToResolve: string[] = [];
      releasesData?.forEach(r => {
        if (r.cover_art_url && !r.cover_art_url.startsWith('http')) {
          storagePathsToResolve.push(r.cover_art_url);
        }
      });

      const signedUrlMap: Record<string, string> = {};
      if (storagePathsToResolve.length > 0) {
        const { data: signedUrls } = await supabase.storage.from('app-files').createSignedUrls(storagePathsToResolve, 3600);
        signedUrls?.forEach(item => {
          if (item.signedUrl) {
            signedUrlMap[item.path] = item.signedUrl;
          }
        });
      }

      // De-duplicate users by email if any duplicates exist in DB
      const uniqueUsers: User[] = [];
      const userEmailsSeen = new Set<string>();
      (usersData || []).forEach(u => {
        const emailLower = u.email.toLowerCase();
        if (!userEmailsSeen.has(emailLower)) {
          userEmailsSeen.add(emailLower);
          uniqueUsers.push({
            id: u.id,
            email: u.email,
            artistName: u.artist_name,
            plan: u.plan,
            isApproved: u.is_approved,
            registeredAt: u.registered_at,
            allowedCLines: u.allowed_c_lines ? u.allowed_c_lines.split('|||') : [],
            allowedPLines: u.allowed_p_lines ? u.allowed_p_lines.split('|||') : []
          });
        }
      });

      // Augment uniqueUsers with current session user if they don't have a profile in the users table yet
      const loggedInEmailLower = userEmail.toLowerCase();
      const hasLoggedInUser = uniqueUsers.some(u => u.email.toLowerCase() === loggedInEmailLower);
      if (!hasLoggedInUser && !isAdmin) {
        uniqueUsers.push({
          id: userId,
          email: userEmail,
          artistName: currentUser?.artistName || userEmail.split('@')[0],
          plan: currentUser?.plan || 'Basic',
          isApproved: currentUser?.isApproved !== undefined ? currentUser.isApproved : true,
          registeredAt: currentUser?.registeredAt || new Date().toISOString(),
          allowedCLines: currentUser?.allowedCLines || [],
          allowedPLines: currentUser?.allowedPLines || []
        });
      }

      setAppState({
        users: uniqueUsers,
        releases: (releasesData || [])
          .map(r => ({
            ...r,
            albumName: r.album_name,
            mainArtistName: r.main_artist_name,
            featureArtists: r.feature_artists || r.featureArtists || [],
            otherArtists: r.other_artists || r.otherArtists || [],
            contentType: r.content_type,
            numTracks: r.num_tracks,
            subGenre: r.sub_genre,
            labelName: r.label_name,
            cLine: r.c_line,
            pLine: r.p_line,
            releaseDate: r.release_date,
            // Extract signed url if it's a storage path
            coverArtUrl: r.cover_art_url,
            coverArtSignedUrl: (r.cover_art_url && !r.cover_art_url.startsWith('http')) ? signedUrlMap[r.cover_art_url] : undefined,
            submittedAt: r.submitted_at,
            tracks: r.tracks || []
          })),
        artists: (artistsData || [])
          .map(a => ({
            id: a.id,
            email: a.email,
            name: a.name,
            spotifyLink: a.spotify_link,
            appleMusicLink: a.apple_music_link,
            instagramLink: a.instagram_link,
            defaultCLine: a.default_c_line,
            defaultPLine: a.default_p_line
          })),
        labels: labelsData || [],
        revenueReports: revenueData || [],
        queries: (queriesData || [])
          .map(q => ({
            id: q.id,
            email: q.email,
            artistName: q.artist_name,
            queryText: q.query_text,
            status: q.status,
            replyText: q.reply_text,
            submittedAt: q.submitted_at
          })),
        oacApplications: (oacData || [])
          .map(o => ({
            id: o.id,
            email: o.email,
            artistName: o.artist_name,
            spotifyLink: o.spotify_link,
            youtubeLink: o.youtube_link,
            fullName: o.full_name,
            status: o.status,
            submittedAt: o.submitted_at
          })),
        notifications: notifData || []
      });
    } catch (e) {
      console.error('Data load error:', e);
    }
  };

  // Sync session on mount with Supabase Auth so refreshing is fully supported without losing state
  useEffect(() => {
    const initSupabaseSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const u = session.user;
          const metadata = u.user_metadata || {};
          
          const mappedUser: User = {
            email: u.email!,
            artistName: metadata.artistName || u.email!.split('@')[0],
            plan: metadata.plan || 'Basic',
            isApproved: metadata.isApproved !== undefined ? metadata.isApproved : true,
            registeredAt: u.created_at || new Date().toISOString()
          };

          // Synchronize locally first, then await real data load
          updateState((prev) => {
            const exists = prev.users.some(existing => existing.email.toLowerCase() === mappedUser.email.toLowerCase());
            if (!exists) {
              return {
                ...prev,
                users: [...prev.users, mappedUser]
              };
            }
            return prev;
          });

          // Fetch fresh data for this user ID
          await loadSupabaseData(mappedUser.email, u.id);

          setCurrentUser(mappedUser);
          if (mappedUser.email === 'admin@g.g') {
            setCurrentTab('admin-panel');
          } else {
            setCurrentTab('home');
          }
        }
      } catch (e) {
        console.error('Supabase Session Initializer Error:', e);
      }
    };
    initSupabaseSession();
  }, []);

  // Auto-login logic for testing or keep sessions alive if needed (defaults to null for real authentication view)
  const users = appState.users;
  const releases = appState.releases;
  const artists = appState.artists;
  const labels = appState.labels;
  const revenueReports = appState.revenueReports;
  const queries = appState.queries;
  const oacApplications = appState.oacApplications;
  const notifications = appState.notifications || [];

  // Filter count of active, non-dismissed notifications for the bell badge
  const [headerDismissedIds, setHeaderDismissedIds] = useState<string[]>([]);

  useEffect(() => {
    if (!currentUser) return;
    const loadDismissed = () => {
      try {
        const saved = localStorage.getItem(`wavora_dismissed_notif_${currentUser.email}`);
        setHeaderDismissedIds(saved ? JSON.parse(saved) : []);
      } catch {
        setHeaderDismissedIds([]);
      }
    };

    // Load initially
    loadDismissed();

    // Listen to sync events when they are dismissed inside the drawer or other widgets
    window.addEventListener('wavora_notifications_synced', loadDismissed);
    return () => window.removeEventListener('wavora_notifications_synced', loadDismissed);
  }, [currentUser, isNotifDrawerOpen]);

  const filteredNotifs = notifications.filter(notif => {
    if (!currentUser) return false;
    if (notif.targetType === 'Everyone') return true;
    if (notif.targetType === 'Plan') return notif.targetValue?.toLowerCase() === currentUser.plan?.toLowerCase();
    if (notif.targetType === 'Artist') return notif.targetValue?.toLowerCase() === currentUser.email?.toLowerCase();
    return false;
  });

  const activeNotifCount = filteredNotifs.filter(n => !headerDismissedIds.includes(n.id)).length;

  // Synchronization helpers
  const updateState = (updater: (prev: AppState) => AppState) => {
    setAppState((prev) => {
      const next = updater(prev);
      saveStoredData(next);
      return next;
    });
  };

  // Auth Callbacks
  const handleLogin = async (user: User) => {
    setCurrentUser(user);
    setIsImpersonating(false);
    setRealAdminUser(null);
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await loadSupabaseData(user.email, session.user.id);
    }
    if (user.email === 'admin@g.g') {
      setCurrentTab('admin-panel');
    } else {
      setCurrentTab('home');
    }
  };

  const handleRegister = (newUser: User) => {
    updateState((prev) => ({
      ...prev,
      users: [...prev.users, newUser],
    }));
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error('Signout Error:', e);
    }
    setCurrentUser(null);
    setRealAdminUser(null);
    setIsImpersonating(false);
    setCurrentTab('home');
  };

  // Admin Actions
  const handleApproveUser = async (email: string) => {
    await supabase.from('users').update({ is_approved: true }).eq('email', email);
    updateState((prev) => ({
      ...prev,
      users: prev.users.map((u) => (u.email === email ? { ...u, isApproved: true } : u)),
    }));
  };

  const handleRejectUser = async (email: string) => {
    await supabase.from('users').delete().eq('email', email);
    updateState((prev) => ({
      ...prev,
      users: prev.users.filter((u) => u.email !== email),
    }));
  };

  const handleCreateUser = async (newUser: User): Promise<{ success: boolean; message: string }> => {
    const exists = appState.users.some(u => u.email.toLowerCase() === newUser.email.toLowerCase());
    if (exists) {
      return { success: false, message: 'This email is already in use.' };
    }

    try {
      // Create user auth in Supabase using the isolatedAdminSupabase client (which avoids logging out the admin session).
      const { data, error: signUpError } = await isolatedAdminSupabase.auth.signUp({
        email: newUser.email,
        password: newUser.password || 'password',
        options: {
          data: {
            artistName: newUser.artistName,
            plan: newUser.plan,
            isApproved: true,
            registeredAt: newUser.registeredAt || new Date().toISOString()
          }
        }
      });

      if (signUpError) {
        return { success: false, message: 'Supabase Error: ' + signUpError.message };
      }

      // Add user to the local roster state too so they instantly appear in lists
      // Note: A database trigger in Supabase should ideally insert into `users` 
      // but to be safe, we insert explicitly here for the mock.
      await supabase.from('users').insert({
        id: data.user?.id,
        email: newUser.email,
        artist_name: newUser.artistName,
        plan: newUser.plan,
        is_approved: true,
        registered_at: newUser.registeredAt || new Date().toISOString()
      });

      updateState((prev) => ({
        ...prev,
        users: [...prev.users, newUser],
      }));

      return { success: true, message: 'User account created and pre-approved directly on Supabase!' };
    } catch (err: any) {
      return { success: false, message: 'Supabase link failure: ' + (err.message || err) };
    }
  };

  const handleUpdateReleaseStatus = async (releaseId: string, status: TrackStatus, feedback?: string) => {
    await supabase.from('releases').update({ status, feedback: feedback || null }).eq('id', releaseId);
    updateState((prev) => ({
      ...prev,
      releases: prev.releases.map((r) => 
        r.id === releaseId 
          ? { ...r, status, feedback: feedback || r.feedback } 
          : r
      ),
    }));
  };

  const handleReplySupportQuery = async (queryId: string, replyText: string) => {
    await supabase.from('support_queries').update({ status: 'Resolved', reply_text: replyText }).eq('id', queryId);
    updateState((prev) => ({
      ...prev,
      queries: prev.queries.map((q) => 
        q.id === queryId 
          ? { ...q, status: 'Resolved' as const, replyText } 
          : q
      ),
    }));
  };

  const handleUpdateOacStatus = async (oacId: string, status: 'Approved' | 'Rejected') => {
    await supabase.from('oac_applications').update({ status }).eq('id', oacId);
    updateState((prev) => ({
      ...prev,
      oacApplications: prev.oacApplications.map((app) => 
        app.id === oacId 
          ? { ...app, status } 
          : app
      ),
    }));
  };

  const handlePostRevenue = async (email: string, month: string, amount: number, releaseName: string, currency: 'USD' | 'INR' = 'USD') => {
    
    // We should lookup user_id by email before sending to Supabase
    // But since this is a mock implementation with `public.users` available as lookup we can easily fetch it
    const { data: targetUser } = await supabase.from('users').select('id').eq('email', email).single();
    if (!targetUser) return; // User not found in DB

    // In a real system, you'd insert a new revenue report, or append to breakdown.
    // For simplicity, we just insert a brand new row into revenue_reports in Supabase.
    await supabase.from('revenue_reports').insert({
      user_id: targetUser.id,
      email,
      month,
      amount,
      currency,
      breakdown: [{ releaseName, amount }]
    });

    updateState((prev) => {
      // Find existing report for this user, month, and currency
      const existingIdx = prev.revenueReports.findIndex(
        r => r.email === email && r.month === month && (r.currency || 'USD') === currency
      );
      
      const newBreakdownItem = { releaseName, amount };
      
      let updatedReports = [...prev.revenueReports];
      
      if (existingIdx > -1) {
        // Append breakdown and add amount
        const currentRep = updatedReports[existingIdx];
        updatedReports[existingIdx] = {
          ...currentRep,
          amount: currentRep.amount + amount,
          breakdown: [...currentRep.breakdown, newBreakdownItem],
        };
      } else {
        // Insert brand new report block
        const newReport: RevenueReport = {
          id: `rev-${Date.now()}`,
          email,
          month,
          amount,
          currency,
          breakdown: [newBreakdownItem],
        };
        updatedReports = [newReport, ...updatedReports];
      }

      return {
        ...prev,
        revenueReports: updatedReports,
      };
    });
  };

  // Impersonating mechanics
  const handleImpersonateUser = (targetUser: User) => {
    if (currentUser?.email === 'admin@g.g') {
      setRealAdminUser(currentUser);
    }
    setCurrentUser(targetUser);
    setIsImpersonating(true);
    setCurrentTab('home');
  };

  const handleExitImpersonation = () => {
    if (realAdminUser) {
      setCurrentUser(realAdminUser);
      setRealAdminUser(null);
    } else {
      // Fallback
      const admin = users.find(u => u.email === 'admin@g.g');
      if (admin) setCurrentUser(admin);
    }
    setIsImpersonating(false);
    setCurrentTab('admin-panel');
  };

  const handleSavePassword = (currentPass: string, newPass: string) => {
    if (!currentUser) return { success: false, message: 'No active user session.' };
    
    // Find absolute exact current state of the user password to make sure current password matches
    const actualUser = appState.users.find(u => u.email.toLowerCase() === currentUser.email.toLowerCase());
    
    if (!actualUser) {
      return { success: false, message: 'User not found in roster statistics.' };
    }

    if (actualUser.password !== currentPass) {
      return { success: false, message: 'Incorrect current password.' };
    }

    // Save and persist password
    updateState((prev) => ({
      ...prev,
      users: prev.users.map((u) => 
        u.email.toLowerCase() === currentUser.email.toLowerCase() 
          ? { ...u, password: newPass } 
          : u
      ),
    }));

    // Update local state copy
    setCurrentUser((prevUser) => prevUser ? { ...prevUser, password: newPass } : null);

    return { success: true, message: 'Password updated successfully!' };
  };

  // Artist Actions
  const handleAddArtist = async (profile: ArtistProfile) => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      // Use the email specifically set on the artist object (important for admin registrations)
      const targetEmail = profile.email || currentUser?.email;

      // If admin is adding for another user (or impersonating), look up their ID
      let targetUserId = session.user.id;
      const isActuallyAdmin = realAdminUser?.email === 'admin@g.g' || currentUser?.email === 'admin@g.g';
      
      if (isActuallyAdmin && targetEmail !== (realAdminUser?.email || currentUser?.email)) {
        // Use the known ID of the currentUser if we are impersonating them
        if (isImpersonating && currentUser && targetEmail === currentUser.email) {
          targetUserId = currentUser.id;
        } else {
          try {
            const { data: targetUser } = await supabase.from('users').select('id').eq('email', targetEmail).single();
            if (targetUser) targetUserId = targetUser.id;
          } catch (e) {
            console.error("Error looking up target user id:", e);
          }
        }
      }

      const payload: any = {
        user_id: targetUserId,
        email: targetEmail,
        name: profile.name,
        spotify_link: profile.spotifyLink,
        apple_music_link: profile.appleMusicLink,
        instagram_link: profile.instagramLink,
      };

      try {
        const fullPayload = {
          ...payload,
          default_c_line: profile.defaultCLine,
          default_p_line: profile.defaultPLine
        };
        const { error } = await supabase.from('artists').insert(fullPayload);
        if (error) {
          console.warn("Inserting artist custom lines failed, falling back without default lines:", error);
          const { error: fallbackError } = await supabase.from('artists').insert(payload);
          if (fallbackError) {
            console.error("Artist fallback insert failed too:", fallbackError);
          }
        }
      } catch (e) {
        console.error("Artist insertion exception:", e);
      }
    } else {
      console.warn("No active session found. Saving artist to local state only.");
    }

    updateState((prev) => ({
      ...prev,
      artists: [...prev.artists, profile],
    }));
  };

  const handleRemoveArtist = async (id: string) => {
    try {
      await supabase.from('artists').delete().eq('id', id);
    } catch (e) {
      console.error("Artist deletion error:", e);
    }
    updateState((prev) => ({
      ...prev,
      artists: prev.artists.filter((art) => art.id !== id),
    }));
  };

  const handleUpdateArtist = async (id: string, updates: Partial<ArtistProfile>) => {
    const baseUpdates: any = {
      ...(updates.name && { name: updates.name }),
      ...(updates.spotifyLink && { spotify_link: updates.spotifyLink }),
      ...(updates.appleMusicLink && { apple_music_link: updates.appleMusicLink }),
      ...(updates.instagramLink && { instagram_link: updates.instagramLink }),
    };

    try {
      const fullUpdates = {
        ...baseUpdates,
        ...(updates.defaultCLine !== undefined && { default_c_line: updates.defaultCLine }),
        ...(updates.defaultPLine !== undefined && { default_p_line: updates.defaultPLine })
      };
      const { error } = await supabase.from('artists').update(fullUpdates).eq('id', id);
      if (error) {
        console.warn("Updating artist custom lines failed, trying fallback without default lines:", error);
        const { error: fallbackError } = await supabase.from('artists').update(baseUpdates).eq('id', id);
        if (fallbackError) {
          console.error("Artist update fallback failed too:", fallbackError);
        }
      }
    } catch (e) {
      console.error("Artist update exception:", e);
    }

    updateState((prev) => ({
      ...prev,
      artists: prev.artists.map((art) => art.id === id ? { ...art, ...updates } : art),
    }));
  };

  const handleUpdateUser = async (email: string, updates: Partial<User>) => {
    const baseUpdates: any = {
      ...(updates.artistName && { artist_name: updates.artistName }),
      ...(updates.plan && { plan: updates.plan }),
      ...(updates.isApproved !== undefined && { is_approved: updates.isApproved }),
    };

    try {
      const fullUpdates = {
        ...baseUpdates,
        ...(updates.allowedCLines !== undefined && { allowed_c_lines: updates.allowedCLines.join('|||') }),
        ...(updates.allowedPLines !== undefined && { allowed_p_lines: updates.allowedPLines.join('|||') })
      };
      const { error } = await supabase.from('users').update(fullUpdates).eq('email', email);
      if (error) {
        console.warn("Updating user allowed lines failed, trying fallback without them:", error);
        const { error: fallbackError } = await supabase.from('users').update(baseUpdates).eq('email', email);
        if (fallbackError) {
          console.error("User update fallback failed too:", fallbackError);
        }
      }
    } catch (e) {
      console.error("User update exception:", e);
    }

    updateState((prev) => ({
      ...prev,
      users: prev.users.map((u) => u.email === email ? { ...u, ...updates } : u),
      // Also update currentUser if they are the one being updated
      ...(currentUser?.email === email ? { currentUser: { ...currentUser, ...updates } } : {})
    }));
  };

  const handleAddLabel = async (label: Label) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    // Use the email specifically set on the label object (important for admin registrations)
    const targetEmail = label.email || currentUser?.email;

    // If admin is adding for another user (or impersonating), we might need that user's actual ID
    let targetUserId = session.user.id;
    const isActuallyAdmin = realAdminUser?.email === 'admin@g.g' || currentUser?.email === 'admin@g.g';

    if (isActuallyAdmin && targetEmail !== (realAdminUser?.email || currentUser?.email)) {
      // Use the known ID of the currentUser if we are impersonating them
      if (isImpersonating && currentUser && targetEmail === currentUser.email) {
        targetUserId = currentUser.id;
      } else {
        const { data: targetUser } = await supabase.from('users').select('id').eq('email', targetEmail).single();
        if (targetUser) targetUserId = targetUser.id;
      }
    }

    await supabase.from('labels').insert({
      user_id: targetUserId,
      email: targetEmail,
      name: label.name
    });

    updateState((prev) => ({
      ...prev,
      labels: [...prev.labels, label],
    }));
  };

  const handleRemoveLabel = async (id: string) => {
    await supabase.from('labels').delete().eq('id', id);
    updateState((prev) => ({
      ...prev,
      labels: prev.labels.filter((lbl) => lbl.id !== id),
    }));
  };

  const handleDeleteRelease = async (id: string) => {
    // 1. Fetch the release to get its file paths
    const releaseToDelete = appState.releases.find(r => r.id === id);
    if (releaseToDelete) {
      const filesToDelete: string[] = [];
      
      // Cover Art
      if (releaseToDelete.coverArtUrl && !releaseToDelete.coverArtUrl.startsWith('http')) {
        filesToDelete.push(releaseToDelete.coverArtUrl);
      }
      
      // Audio files
      if (releaseToDelete.tracks) {
        releaseToDelete.tracks.forEach(track => {
          if (track.audioFileName && !track.audioFileName.startsWith('http') && track.audioFileName.includes('/audio/')) {
            filesToDelete.push(track.audioFileName);
          }
        });
      }
      
      // Attempt storage deletion
      if (filesToDelete.length > 0) {
        try {
          await supabase.storage.from('app-files').remove(filesToDelete);
        } catch(e) {
          console.error("Failed to delete storage files", e);
        }
      }
    }

    // 2. Delete from DB
    await supabase.from('releases').delete().eq('id', id);
    
    // 3. Update local state
    updateState((prev) => ({
      ...prev,
      releases: prev.releases.filter((r) => r.id !== id),
    }));
  };

  const handleSubmitRelease = async (newRelease: Release) => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      const payload: any = {
        user_id: session.user.id,
        email: currentUser?.email,
        album_name: newRelease.albumName,
        type: newRelease.type,
        main_artist_name: newRelease.mainArtistName,
        other_artists: newRelease.otherArtists,
        language: newRelease.language,
        content_type: newRelease.contentType,
        num_tracks: newRelease.numTracks,
        genre: newRelease.genre,
        sub_genre: newRelease.subGenre,
        label_name: newRelease.labelName,
        c_line: newRelease.cLine,
        p_line: newRelease.pLine,
        release_date: newRelease.releaseDate,
        cover_art_url: newRelease.coverArtUrl,
        tracks: newRelease.tracks,
        special_request: newRelease.specialRequest,
        status: 'Submitted',
        submitted_at: newRelease.submittedAt
      };

      try {
        const fullPayload = {
          ...payload,
          feature_artists: newRelease.featureArtists
        };
        const { error } = await supabase.from('releases').insert(fullPayload);
        if (error) {
          console.warn("First insert attempt failed, trying fallback without feature_artists", error);
          const { error: fallbackError } = await supabase.from('releases').insert(payload);
          if (fallbackError) {
            console.error("Fallback insert also failed:", fallbackError);
          }
        }
      } catch (e) {
        console.error("Release insert exception:", e);
      }
    } else {
      console.warn("No active session found during release submission. Saving to local state only.");
    }

    let coverArtSignedUrl = newRelease.coverArtSignedUrl;
    if (newRelease.coverArtUrl && !newRelease.coverArtUrl.startsWith('http')) {
      const { data: urlData } = await supabase.storage.from('app-files').createSignedUrl(newRelease.coverArtUrl, 3600);
      if (urlData?.signedUrl) {
         coverArtSignedUrl = urlData.signedUrl;
      }
    }

    updateState((prev) => ({
      ...prev,
      releases: [{...newRelease, coverArtSignedUrl}, ...prev.releases],
    }));
  };

  const handleSubmitSupportQuery = async (queryText: string) => {
    if (!currentUser) return;
    const { data: { session } } = await supabase.auth.getSession();

    const newQuery: SupportQuery = {
      id: `q-${Date.now()}`,
      email: currentUser.email,
      artistName: currentUser.artistName,
      queryText,
      submittedAt: new Date().toISOString(),
      status: 'Pending',
    };

    if (session?.user) {
      try {
        await supabase.from('support_queries').insert({
          user_id: session.user.id,
          email: currentUser.email,
          artist_name: currentUser.artistName,
          query_text: queryText,
          status: 'Pending',
          submitted_at: newQuery.submittedAt
        });
      } catch (e) {
        console.error("Support query insert error:", e);
      }
    } else {
      console.warn("No active session found. Saving support query to local state only.");
    }

    updateState((prev) => ({
      ...prev,
      queries: [newQuery, ...prev.queries],
    }));
  };

  const handleSubmitOacApplication = async (youtubeLink: string, spotifyLink: string, fullName: string) => {
    if (!currentUser) return;
    const { data: { session } } = await supabase.auth.getSession();

    const newOac: OacApplication = {
      id: `oac-${Date.now()}`,
      email: currentUser.email,
      artistName: currentUser.artistName,
      spotifyLink,
      youtubeLink,
      fullName,
      submittedAt: new Date().toISOString(),
      status: 'Pending',
    };

    if (session?.user) {
      try {
        await supabase.from('oac_applications').insert({
          user_id: session.user.id,
          email: currentUser.email,
          artist_name: currentUser.artistName,
          spotify_link: spotifyLink,
          youtube_link: youtubeLink,
          full_name: fullName,
          status: 'Pending',
          submitted_at: newOac.submittedAt
        });
      } catch (e) {
        console.error("OAC application insert error:", e);
      }
    } else {
      console.warn("No active session found. Saving OAC application to local state only.");
    }

    updateState((prev) => ({
      ...prev,
      oacApplications: [newOac, ...prev.oacApplications],
    }));
  };

  const handlePushNotification = async (newNotif: any) => {
    await supabase.from('notifications').insert({
      title: newNotif.title,
      message: newNotif.message,
      target_type: newNotif.targetType,
      target_value: newNotif.targetValue,
      severity: newNotif.severity,
      created_at: newNotif.createdAt
    });

    updateState((prev) => ({
      ...prev,
      notifications: [newNotif, ...(prev.notifications || [])],
    }));
  };

  const handleDeleteNotification = async (notifId: string) => {
    await supabase.from('notifications').delete().eq('id', notifId);
    updateState((prev) => ({
      ...prev,
      notifications: (prev.notifications || []).filter(n => n.id !== notifId),
    }));
  };

  const handleDownloadFile = async (path: string) => {
    try {
      const { data, error } = await supabase.storage.from('app-files').createSignedUrl(path, 60);
      if (error) throw error;
      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank');
      }
    } catch (err: any) {
      alert('Download Error: ' + err.message);
    }
  };

  const ensureMainArtistProfile = async (user: User, userId: string) => {
    if (user.email === 'admin@g.g') return;
    
    // Check if user already has an artist profile with their main name
    // We check if THEY HAVE ANY artists first. If they have 0 artists, we definitely add the main one.
    // If they have artists, we check if one matches their artistName.
    const { data: existing } = await supabase.from('artists')
      .select('id')
      .eq('email', user.email)
      .eq('name', user.artistName);

    if (!existing || existing.length === 0) {
      await supabase.from('artists').insert({
        user_id: userId,
        email: user.email,
        name: user.artistName,
        spotify_link: 'https://open.spotify.com/artist/verify_required',
        apple_music_link: 'https://music.apple.com/artist/verify_required',
        instagram_link: 'https://instagram.com/verify_required'
      });
      // Refresh to reflect in UI
      await loadSupabaseData(user.email, userId);
    }
  };

  // Render view router based on currentTab
  const renderCurrentView = () => {
    if (!currentUser) return null;

    switch (currentTab) {
      case 'home':
        return (
          <DashboardHome
            currentUser={currentUser}
            releases={releases}
            revenueReports={revenueReports}
            setCurrentTab={setCurrentTab}
            onOpenRevenueModal={() => setIsRevenueModalOpen(true)}
            notifications={notifications}
          />
        );
      case 'new-release':
        return (
          <NewReleaseWizard
            currentUser={currentUser}
            managedArtists={artists}
            managedLabels={labels}
            onSubmitRelease={handleSubmitRelease}
            setCurrentTab={setCurrentTab}
          />
        );
      case 'manage-artists':
        return (
          <ManageArtists
            currentUser={currentUser}
            users={users}
            managedArtists={artists}
            onAddArtist={handleAddArtist}
            onRemoveArtist={handleRemoveArtist}
            isImpersonating={isImpersonating}
          />
        );
      case 'manage-labels':
        return (
          <ManageLabels
            currentUser={currentUser}
            users={users}
            managedLabels={labels}
            onAddLabel={handleAddLabel}
            onRemoveLabel={handleRemoveLabel}
            isImpersonating={isImpersonating}
          />
        );
      case 'catalogue':
        return (
          <CatalogueView
            currentUser={currentUser}
            releases={releases}
            onDeleteRelease={handleDeleteRelease}
          />
        );
      case 'revenue':
        return (
          <RevenuePage
            currentUser={currentUser}
            revenueReports={revenueReports}
            onOpenRevenueModal={() => setIsRevenueModalOpen(true)}
          />
        );
      case 'support':
        return (
          <SupportPage
            currentUser={currentUser}
            supportQueries={queries}
            onSubmitSupportQuery={handleSubmitSupportQuery}
            oacApplications={oacApplications}
            onSubmitOacApplication={handleSubmitOacApplication}
          />
        );
      case 'admin-panel':
        return (
          <AdminPanel
            currentUser={currentUser}
            users={users}
            releases={releases}
            artists={artists}
            supportQueries={queries}
            oacApplications={oacApplications}
            onApproveUser={handleApproveUser}
            onRejectUser={handleRejectUser}
            onCreateUser={handleCreateUser}
            onUpdateReleaseStatus={handleUpdateReleaseStatus}
            onReplySupportQuery={handleReplySupportQuery}
            onUpdateOacStatus={handleUpdateOacStatus}
            onPostRevenue={handlePostRevenue}
            onImpersonateUser={handleImpersonateUser}
            notifications={notifications}
            onPushNotification={handlePushNotification}
            onDeleteNotification={handleDeleteNotification}
            onDownloadFile={handleDownloadFile}
            onUpdateArtist={handleUpdateArtist}
            onUpdateUser={handleUpdateUser}
          />
        );
      default:
        return (
          <div className="p-8 text-center text-gray-400">
            <h3 className="font-bold text-lg">Work in Progress</h3>
            <p className="text-xs mt-1">This module is under construction.</p>
          </div>
        );
    }
  };

  // Unauthenticated screen
  if (!currentUser) {
    return (
      <LoginScreen
        onLogin={handleLogin}
        onRegister={handleRegister}
        allUsers={users}
      />
    );
  }

  // Get active tab icon
  const getTabIcon = () => {
    switch (currentTab) {
      case 'home': return <Home className="w-4 h-4 text-[#1DB954]" />;
      case 'new-release': return <Disc className="w-4 h-4 text-[#1DB954]" />;
      case 'manage-artists': return <Users className="w-4 h-4 text-[#1DB954]" />;
      case 'manage-labels': return <Tags className="w-4 h-4 text-[#1DB954]" />;
      case 'catalogue': return <Layers className="w-4 h-4 text-[#1DB954]" />;
      case 'revenue': return <Landmark className="w-4 h-4 text-[#1DB954]" />;
      case 'support': return <HelpCircle className="w-4 h-4 text-[#1DB954]" />;
      default: return <Sparkles className="w-4 h-4 text-[#1DB954]" />;
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full bg-[#0A0A0A] text-white font-sans overflow-hidden" id="app_root_layout">
      
      {/* Sidebar Component */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentUser={currentUser}
        onLogout={handleLogout}
        isImpersonating={isImpersonating}
        onExitImpersonation={handleExitImpersonation}
        isOpenMobile={isOpenMobile}
        setIsOpenMobile={setIsOpenMobile}
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
      />

      {/* Main viewport block */}
      <main className="flex-1 flex flex-col min-w-0 h-[calc(100vh-5rem)] md:h-screen overflow-y-auto" id="app_main_wrapper">
        
        {/* Editorial Top Bar / Header */}
        <header className="h-20 border-b border-[#1F1F1F] flex items-center justify-between px-6 md:px-8 bg-[#0A0A0A]/90 backdrop-blur-md sticky top-0 z-30" id="editorial_top_bar">
          <div className="flex items-center gap-3 animate-fade-in">
            {isSidebarCollapsed && (
              <button
                type="button"
                onClick={() => setIsSidebarCollapsed(false)}
                className="hidden md:flex p-1.5 rounded-lg hover:bg-[#121212] text-gray-400 hover:text-[#1DB954] transition cursor-pointer mr-2.5"
                id="btn_expand_sidebar"
                title="Expand Sidebar"
              >
                <Menu className="w-5 h-5 text-gray-400 hover:text-[#1DB954]" />
              </button>
            )}
            <div className="p-2 bg-[#121212] border border-[#1F1F1F] rounded-lg">
              {getTabIcon()}
            </div>
            <div className="text-left">
              <h1 className="text-sm md:text-base font-black tracking-tighter uppercase text-white flex items-center gap-2">
                Wavora Live <span className="text-[#1DB954]">●</span>
                <span className="text-gray-400 font-medium normal-case tracking-normal hidden md:inline">
                  {currentTab === 'admin-panel' ? 'Administration Suite' : `${currentTab.replace('-', ' ')} Feed`}
                </span>
              </h1>
              <p className="text-[10px] md:text-xs text-gray-500 font-mono uppercase tracking-wider hidden sm:block">
                {currentUser.email === 'admin@g.g' ? 'SYSTEM_ROOT_ADMIN_PORT' : `Artist Unique ID: #${currentUser.email.split('@')[0].toUpperCase()}-WA`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-gray-350">{currentUser.artistName}</p>
              <p className="text-[10px] text-[#1DB954] flex items-center gap-1 justify-end font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1DB954] animate-ping" />
                VERIFIED & ACTIVE
              </p>
            </div>

            {/* Premium Notification Bell Trigger with Badge */}
            <button
              type="button"
              onClick={() => setIsNotifDrawerOpen(true)}
              className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-[#121212] hover:bg-[#1E1E1E] border border-[#1F1F1F] hover:border-[#1DB954]/50 flex items-center justify-center relative transition-all cursor-pointer shadow-inner active:scale-95 group"
              id="btn_header_notification_bell"
              title="Open System Bulletins"
            >
              <Bell className="w-4 h-4 md:w-[18px] md:h-[18px] text-gray-400 group-hover:text-[#1DB954] transition-all group-hover:rotate-12" />
              {activeNotifCount > 0 && (
                <span 
                  className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-red-500 text-[8px] md:text-[9px] font-black text-white leading-none ring-[3px] ring-[#0A0A0A] animate-pulse"
                  id="notif_header_badge_count"
                >
                  {activeNotifCount}
                </span>
              )}
            </button>

            {/* User Badge avatar - Clickable */}
            <button 
              type="button"
              onClick={() => setIsProfileOpen(true)}
              className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-[#121212] hover:bg-[#1E1E1E] border border-[#1F1F1F] hover:border-[#1DB954]/50 flex items-center justify-center font-bold text-xs text-[#1DB954] transition-all cursor-pointer shadow-inner active:scale-95 group relative"
              id="btn_header_profile_avatar"
              title="View Profile Suite"
            >
              <span className="group-hover:scale-105 transition-transform">
                {currentUser.artistName.charAt(0).toUpperCase()}
              </span>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#1DB954] border border-[#0A0A0A] rounded-full" />
            </button>
          </div>
        </header>

        {/* Dashboard Content Container */}
        <div className="p-4 md:p-8 flex-1 max-w-7xl w-full mx-auto" id="app_view_viewport">
          {renderCurrentView()}
        </div>

        {/* Editorial Footer */}
        <footer className="py-4 px-6 md:px-8 bg-[#0A0A0A] border-t border-[#1F1F1F] flex flex-col md:flex-row items-center justify-between text-[9px] uppercase tracking-[0.2em] text-gray-500 font-bold gap-3 mt-auto" id="editorial_footer">
          <div className="flex gap-4 md:gap-6">
            <span>v4.2.0-STABLE</span>
            <span>System Status: <span className="text-[#1DB954] underline">Operational</span></span>
          </div>
          <div className="flex flex-wrap gap-4 md:gap-6 justify-center">
            <button type="button" onClick={() => setCurrentTab('support')} className="hover:text-white cursor-pointer transition">Official Artist Channel Request</button>
            <span className="opacity-40">|</span>
            <span className="hover:text-white cursor-pointer">Legal & Copyright</span>
            <span className="opacity-40">|</span>
            <button type="button" onClick={() => setCurrentTab('support')} className="hover:text-white cursor-pointer transition">Contact Support Desk</button>
          </div>
        </footer>

      </main>

      {currentUser && (
        <ProfileModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          currentUser={currentUser}
          onSavePassword={handleSavePassword}
        />
      )}

      {currentUser && (
        <RevenueReportsModal
          isOpen={isRevenueModalOpen}
          onClose={() => setIsRevenueModalOpen(false)}
          currentUser={currentUser}
          revenueReports={revenueReports}
        />
      )}

      {currentUser && (
        <NotificationsDrawer
          isOpen={isNotifDrawerOpen}
          onClose={() => setIsNotifDrawerOpen(false)}
          currentUser={currentUser}
          notifications={notifications}
        />
      )}
    </div>
  );
}
