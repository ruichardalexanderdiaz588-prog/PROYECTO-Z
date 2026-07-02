import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  User, Post, Club, Chat, ChatRequest, Story, Note 
} from "./types";
import { getSupabase } from "./lib/supabase";
import { getFirebaseAuth } from "./lib/firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import Registration from "./components/Registration";
import Activity from "./components/Activity";
import HomeFeed from "./components/HomeFeed";
import Descubre from "./components/Descubre";
import ChatsList from "./components/ChatsList";
import ClubsList from "./components/ClubsList";
import StoriesAndNotes from "./components/StoriesAndNotes";
import IMEA from "./components/IMEA";
import EditProfile from "./components/EditProfile";

// Lucide icons
import { 
  Heart, MessageSquare, Compass, Shield, Users, User as UserIcon, 
  Bell, Award, Clock, ArrowLeft, LogOut, CheckCircle2, ShieldAlert, Sparkles 
} from "lucide-react";

export default function App() {
  
  // SESSION STATES
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // DATABASE GLOBAL STATES
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [chatRequests, setChatRequests] = useState<ChatRequest[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);

  // NOTIFICATIONS LIST
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);

  // ACTIVE INTERACTION VIEW
  // 'home' | 'discover' | 'chats' | 'activity' | 'clubs' | 'profile'
  const [activeTab, setActiveTab] = useState<"home" | "discover" | "chats" | "activity" | "clubs" | "profile">("home");
  const [selectedProfileUser, setSelectedProfileUser] = useState<User | null>(null);

  // IMEA MENTAL HEALTH STATE
  const [showIMEAModal, setShowIMEAModal] = useState(false);
  const [imeaEmotion, setImeaEmotion] = useState("triste");

  // OVERUSE ENGINE / TIMER LOCK (Prevention of app addiction for minors)
  const [appElapsedTime, setAppElapsedTime] = useState(0); // in seconds
  const [showLockoutScreen, setShowLockoutScreen] = useState(false);

  // PROFILE SKIN UNLOCKED FROM ACHIEVEMENTS
  const [unlockedSkin, setUnlockedSkin] = useState<string>("default");
  const [showEditProfile, setShowEditProfile] = useState(false);

  // LISTEN TO AUTH CHANGES
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), async (fbUser) => {
      if (fbUser) {
        try {
          const { data: user } = await getSupabase()
            .from("users")
            .select("*")
            .eq("id", fbUser.uid)
            .single();
          if (user) {
            // Map snake_case to camelCase
            const mappedUser: User = {
              id: user.id,
              username: user.username,
              nickname: user.nickname,
              email: user.email,
              birthDate: user.birth_date,
              age: user.age,
              orientation: user.orientation,
              isOrientationPublic: user.is_orientation_public,
              profilePic: user.profile_pic,
              bio: user.bio,
              isAdult: user.is_adult,
              isParentMonitored: user.is_parent_monitored,
              hobbies: user.hobbies,
              isHobbiesPublic: user.is_hobbies_public,
              points: user.points,
              isSuspended: user.is_suspended,
              bannedMultiaccounts: user.banned_multiaccounts,
              unlockedSkins: user.unlocked_skins,
              followers: user.followers,
              following: user.following
            };
            setCurrentUser(mappedUser);
          } else {
            setCurrentUser(null);
          }
        } catch (err) {
          console.error("Error restoring session:", err);
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // LOAD DATA FROM SUPABASE
  useEffect(() => {
    async function loadData() {
      try {
        const [
          { data: usersData },
          { data: postsData },
          { data: clubsData },
          { data: chatsData },
          { data: requestsData },
          { data: storiesData },
          { data: notesData }
        ] = await Promise.all([
          getSupabase().from("users").select("*"),
          getSupabase().from("posts").select("*").order("created_at", { ascending: false }),
          getSupabase().from("clubs").select("*"),
          getSupabase().from("chats").select("*"),
          getSupabase().from("chat_requests").select("*"),
          getSupabase().from("stories").select("*"),
          getSupabase().from("notes").select("*")
        ]);

        if (usersData) {
          setAllUsers(usersData.map((u: any) => ({
            id: u.id,
            username: u.username,
            nickname: u.nickname,
            email: u.email,
            birthDate: u.birth_date,
            age: u.age,
            orientation: u.orientation,
            isOrientationPublic: u.is_orientation_public,
            profilePic: u.profile_pic,
            bio: u.bio,
            isAdult: u.is_adult,
            isParentMonitored: u.is_parent_monitored,
            hobbies: u.hobbies,
            isHobbiesPublic: u.is_hobbies_public,
            points: u.points,
            isSuspended: u.is_suspended,
            bannedMultiaccounts: u.banned_multiaccounts,
            unlockedSkins: u.unlocked_skins,
            followers: u.followers,
            following: u.following
          })));
        }
        
        if (postsData) {
          setPosts(postsData.map((p: any) => ({
            id: p.id,
            authorId: p.author_id,
            authorName: p.author_name,
            authorPic: p.author_pic,
            authorAge: p.author_age,
            authorIsAdult: p.author_is_adult,
            contentType: p.content_type,
            caption: p.caption,
            mediaUrl: p.media_url,
            likes: p.likes,
            stats: p.stats,
            tags: p.tags,
            category: p.category,
            isArchived: p.is_archived,
            privacy: p.privacy,
            allowComments: p.allow_comments,
            allowSharing: p.allow_sharing,
            allowDownloads: p.allow_downloads,
            createdAt: p.created_at
          })));
        }

        if (clubsData) {
          setClubs(clubsData.map((c: any) => ({
            id: c.id,
            name: c.name,
            description: c.description,
            coverImage: c.cover_image,
            profileImage: c.profile_image,
            tags: c.tags,
            is18Plus: c.is_18_plus,
            privacy: c.privacy,
            creatorId: c.creator_id,
            admins: c.admins,
            members: c.members,
            pendingRequests: c.pending_requests,
            chatMessages: c.chat_messages,
            allowAllToMessage: c.allow_all_to_message,
            allowMedia: c.allow_media,
            allowStickers: c.allow_stickers,
            allowVoiceNotes: c.allow_voice_notes,
            allowVideos30s: c.allow_videos_30s,
            bannedWords: c.banned_words,
            inviteLink: c.invite_link
          })));
        }
        // ... continue for others if needed
        if (chatsData) setChats(chatsData); 
        if (requestsData) setChatRequests(requestsData);
        if (storiesData) setStories(storiesData);
        if (notesData) setNotes(notesData);
      } catch (err) {
        console.error("Error fetching data from Supabase:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // TRACK OVERUSE TIME TIMER
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (currentUser) {
      interval = setInterval(() => {
        setAppElapsedTime(prev => {
          const newTime = prev + 1;
          // Trigger lockout warning after 120 seconds of continuous use for minors to prevent overuse
          if (!currentUser.isAdult && newTime === 120) {
            setShowLockoutScreen(true);
          }
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentUser]);

  // TRIGGER REALTIME SYSTEM ACTIVITY NOTIFICATIONS
  const handleTriggerNotification = (
    title: string, 
    content: string, 
    type: "system" | "like" | "comment" | "follow" | "chat_request" | "club_request"
  ) => {
    const newNoti = {
      id: "noti_" + Date.now(),
      title,
      content,
      type,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [newNoti, ...prev]);
  };

  // LEVEL CALCULATOR LOGIC
  const getLevelDetails = (points: number) => {
    if (points >= 500) {
      return { 
        level: 3, 
        title: "NEXUS Elite 👑", 
        badgeColor: "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)]",
        unlockedAura: "shadow-[inset_0_0_20px_rgba(255,255,255,0.2)] border-white/20" 
      };
    } else if (points >= 200) {
      return { 
        level: 2, 
        title: "Ciudadano NEXUS ✨", 
        badgeColor: "bg-teal-500 text-white shadow-[0_0_15px_rgba(20,184,166,0.3)]",
        unlockedAura: "shadow-[inset_0_0_15px_rgba(20,184,166,0.2)] border-teal-500/40" 
      };
    } else {
      return { 
        level: 1, 
        title: "Novato NEXUS 🌱", 
        badgeColor: "bg-white/5 border border-white/10 text-white/40",
        unlockedAura: "border-white/5" 
      };
    }
  };

  // HANDLE USER PROFILE CLICKS
  const handleSelectUserForProfile = (user: User) => {
    setSelectedProfileUser(user);
    setActiveTab("profile");
  };

  // START PRIVATE CHAT FROM MATCH / OUTSIDE INTERACTION
  const handleStartDirectChat = (targetUser: User) => {
    // Check if chat room already exists
    const existing = chats.find(c => c.participantIds.includes(currentUser!.id) && c.participantIds.includes(targetUser.id));
    
    if (existing) {
      setActiveTab("chats");
      return;
    }

    // Create new Chat request or direct Chat depending on rules
    // (If matched from discover game, it already created the chat directly via callback, but we guard here as well)
    const newChat: Chat = {
      id: "chat_" + Date.now(),
      user1Id: currentUser!.id,
      user2Id: targetUser.id,
      messages: [
        {
          id: "msg_init",
          senderId: "system",
          senderName: "NEXUS",
          senderPic: "",
          senderAge: 0,
          content: "🔒 Esta conversación permanente ha sido encriptada y protegida. Respeta los límites.",
          type: "text",
          createdAt: new Date().toISOString()
        }
      ]
    };

    setChats([newChat, ...chats]);
    setActiveTab("chats");
  };

  // FOLLOW / UNFOLLOW LOGIC
  const handleToggleFollow = async (targetUser: User) => {
    if (!currentUser) return;

    const isFollowing = currentUser.following.includes(targetUser.id);
    let updatedFollowing: string[];
    let updatedFollowers: string[];

    if (isFollowing) {
      updatedFollowing = currentUser.following.filter(id => id !== targetUser.id);
      updatedFollowers = targetUser.followers.filter(id => id !== currentUser.id);
    } else {
      updatedFollowing = [...currentUser.following, targetUser.id];
      updatedFollowers = [...targetUser.followers, currentUser.id];
      
      handleTriggerNotification(
        "👤 Nuevo Seguidor", 
        `¡A ${currentUser.nickname} le interesa tu contenido y comenzó a seguirte!`, 
        "follow"
      );
    }

    // Update Supabase
    try {
      await Promise.all([
        getSupabase().from("users").update({ following: updatedFollowing }).eq("id", currentUser.id),
        getSupabase().from("users").update({ followers: updatedFollowers }).eq("id", targetUser.id)
      ]);

      const updatedUsers = allUsers.map(u => {
        if (u.id === currentUser.id) return { ...u, following: updatedFollowing };
        if (u.id === targetUser.id) return { ...u, followers: updatedFollowers };
        return u;
      });

      setAllUsers(updatedUsers);
      const self = updatedUsers.find(u => u.id === currentUser.id);
      if (self) setCurrentUser(self);
      const peer = updatedUsers.find(u => u.id === targetUser.id);
      if (peer) setSelectedProfileUser(peer);
    } catch (err) {
      console.error("Error updating follow state in Supabase:", err);
    }
  };

  // EMOTION DAILY ALERT RESPONSE HANDLER
  const handleTriggerEmotionAlert = async (emotion: string) => {
    if (emotion === "triste") {
      setImeaEmotion("triste");
      setShowIMEAModal(true);
    } else {
      alert(`¡Nos alegra que te sientas ${emotion}! Sigue brillando y compartiendo buen contenido ✨`);
      // Add points for checking in
      if (currentUser) {
        const newPoints = currentUser.points + 10;
        try {
          await getSupabase().from("users").update({ points: newPoints }).eq("id", currentUser.id);
          setCurrentUser({ ...currentUser, points: newPoints });
          handleTriggerNotification("✨ +10 Puntos Ganados", "Has completado tu chequeo emocional del día.", "system");
        } catch (err) {
          console.error("Error updating points:", err);
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-purple-600/30 selection:text-purple-300" id="main-root">
      
      {/* BACKGROUND DECORATIONS */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-20%] w-[60%] h-[60%] rounded-full bg-purple-900/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-20%] w-[60%] h-[60%] rounded-full bg-indigo-900/15 blur-[120px]" />
      </div>

      <AnimatePresence mode="wait">
        {/* 1. REGISTRATION & LOGIN FLOW */}
        {!currentUser ? (
          <motion.div 
            key="registration"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="z-10 relative min-h-screen flex items-center justify-center p-4 md:p-8"
          >
            <Registration 
              onRegisterComplete={(newUser) => {
                setAllUsers([...allUsers, newUser]);
                setCurrentUser(newUser);
                handleTriggerNotification("🎁 Cuenta Activada", `¡Bienvenido ${newUser.nickname}! Has ganado tu primer skin y nivel básico.`, "system");
              }}
              onLoginSuccess={(user) => {
                setCurrentUser(user);
                handleTriggerNotification("👋 Bienvenido de vuelta", `Hola de nuevo, ${user.nickname}!`, "system");
              }}
            />
          </motion.div>
        ) : (
          /* 2. MAIN SECURE APPLICATION ENVIRONMENT */
          <motion.div 
            key="app-dashboard"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto bg-slate-950 min-h-screen flex flex-col justify-between border-x border-slate-900/80 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative z-10"
            id="app-container"
          >
            {/* APP HEADER */}
            <header className="p-4 border-b border-white/5 bg-slate-950/80 backdrop-blur sticky top-0 z-30 flex justify-between items-center" id="main-header">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-white text-black flex items-center justify-center font-black text-lg tracking-wider shadow-lg shadow-white/10">
                  N
                </div>
                <h1 className="text-xl font-black italic text-white tracking-tighter">NEXUS</h1>
                <div className="pl-2 border-l border-white/10 ml-1">
                  <h1 className="text-[8px] font-black tracking-[0.2em] text-white/40 block uppercase">Protocolo</h1>
                  <span className="text-[10px] text-teal-400 font-bold block mt-[-2px] uppercase italic tracking-tighter">Alpha-Secure</span>
                </div>
              </div>

              {/* Status and Action Buttons */}
              <div className="flex items-center gap-2">
                {/* Level / Achievements badge */}
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${getLevelDetails(currentUser.points).badgeColor}`} id="level-badge">
                  <Award size={10} />
                  <span>LV {getLevelDetails(currentUser.points).level}</span>
                </div>

                {/* Notifications badge */}
                <button 
                  onClick={() => setShowNotificationsModal(true)}
                  className="p-2 bg-slate-900 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition relative"
                  id="btn-notifications"
                >
                  <Bell size={15} />
                  {notifications.length > 1 && (
                    <span className="absolute top-1 right-1.5 w-2 h-2 bg-fuchsia-600 rounded-full" />
                  )}
                </button>

                {/* Logout Button */}
                <button 
                  onClick={async () => {
                    if (confirm("¿Estás seguro de que deseas cerrar sesión?")) {
                      try {
                        await signOut(getFirebaseAuth());
                        setCurrentUser(null);
                        setAppElapsedTime(0);
                      } catch (err) {
                        console.error("Error signing out:", err);
                      }
                    }
                  }}
                  className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-500 hover:text-red-400 rounded-xl transition"
                  title="Cerrar sesión"
                >
                  <LogOut size={15} />
                </button>
              </div>
            </header>

            {/* MAIN PORT BODY */}
            <main className="flex-1 overflow-y-auto p-4 pb-20 space-y-5" id="main-content-scroll">
              
              {/* top level customized achievements background glows */}
              <div className={`p-0.5 rounded-3xl border transition-all ${getLevelDetails(currentUser.points).unlockedAura}`}>
                
                {/* DAILY EMOTIONAL ALERT CHECK BANNER */}
                {activeTab === "feed" && (
                  <div className="p-4 bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/30 rounded-2xl border border-purple-900/30 space-y-3 mb-5" id="daily-emotion-banner">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black tracking-wider text-purple-400 uppercase">Bienestar Diario IMEA</span>
                      <Clock size={12} className="text-slate-500" />
                    </div>
                    <h3 className="text-xs font-bold text-slate-200">Dinos, ¿cómo te sientes hoy? 💜</h3>
                    <div className="grid grid-cols-4 gap-1.5 text-[10px] font-bold">
                      <button 
                        onClick={() => handleTriggerEmotionAlert("feliz")}
                        className="p-2 bg-slate-950 hover:bg-emerald-950/20 hover:text-emerald-400 border border-slate-800 rounded-xl transition"
                      >
                        Feliz 😊
                      </button>
                      <button 
                        onClick={() => handleTriggerEmotionAlert("triste")}
                        className="p-2 bg-slate-950 hover:bg-purple-950/30 hover:text-purple-400 border border-purple-800/40 rounded-xl transition"
                        id="btn-feel-sad"
                      >
                        Triste 😔
                      </button>
                      <button 
                        onClick={() => handleTriggerEmotionAlert("enojado")}
                        className="p-2 bg-slate-950 hover:bg-red-950/20 hover:text-red-400 border border-slate-800 rounded-xl transition"
                      >
                        Enojado ⚡
                      </button>
                      <button 
                        onClick={() => handleTriggerEmotionAlert("ansioso")}
                        className="p-2 bg-slate-950 hover:bg-teal-950/20 hover:text-teal-400 border border-slate-800 rounded-xl transition"
                      >
                        Ansioso 🍃
                      </button>
                    </div>
                  </div>
                )}

                {/* CURATED VIEWS ROUTING */}
                <AnimatePresence mode="wait">
                  
                  {/* VIEW 1: HOME FEED */}
                  {activeTab === "home" && (
                    <motion.div
                      key="home-view"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-6"
                    >
                      {/* Stories & Notes row */}
                      <StoriesAndNotes 
                        currentUser={currentUser}
                        allUsers={allUsers}
                        stories={stories}
                        notes={notes}
                        onUpdateStories={setStories}
                        onUpdateNotes={setNotes}
                        onTriggerNotification={handleTriggerNotification}
                      />

                      {/* Main Publication Feed */}
                      <HomeFeed 
                        currentUser={currentUser}
                        posts={posts}
                        allUsers={allUsers}
                        onUpdatePosts={setPosts}
                        onUpdateCurrentUser={setCurrentUser}
                        onTriggerNotification={handleTriggerNotification}
                        onSelectUserForProfile={handleSelectUserForProfile}
                      />
                    </motion.div>
                  )}

                  {/* VIEW 2: EXPLORE / DESCUBRE */}
                  {activeTab === "discover" && (
                    <motion.div
                      key="discover-view"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <Descubre 
                        currentUser={currentUser}
                        onTriggerNotification={handleTriggerNotification}
                      />
                    </motion.div>
                  )}

                  {/* VIEW 3: CHATS */}
                  {activeTab === "chats" && (
                    <motion.div
                      key="chats-view"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <ChatsList 
                        currentUser={currentUser}
                        allUsers={allUsers}
                        chats={chats}
                        chatRequests={chatRequests}
                        onUpdateChats={setChats}
                        onUpdateRequests={setChatRequests}
                        onTriggerNotification={handleTriggerNotification}
                      />
                    </motion.div>
                  )}

                  {/* VIEW 4: ACTIVITY */}
                  {activeTab === "activity" && (
                    <motion.div
                      key="activity-view"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <Activity 
                        currentUser={currentUser}
                        notifications={notifications}
                        onTriggerNotification={handleTriggerNotification}
                      />
                    </motion.div>
                  )}

                  {/* VIEW 5: CLUBS */}
                  {activeTab === "clubs" && (
                    <motion.div
                      key="clubs-view"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <ClubsList 
                        currentUser={currentUser}
                        allUsers={allUsers}
                        clubs={clubs}
                        onUpdateClubs={setClubs}
                        onTriggerNotification={handleTriggerNotification}
                      />
                    </motion.div>
                  )}

                  {/* VIEW 5: USER PROFILE VIEW (SELF OR OTHERS) */}
                  {activeTab === "profile" && (
                    <motion.div
                      key="profile-view"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-6 pb-24"
                      id="profile-panel"
                    >
                      {/* Back button if looking at someone else */}
                      {selectedProfileUser && selectedProfileUser.id !== currentUser.id && (
                        <button 
                          onClick={() => {
                            setSelectedProfileUser(null);
                            setActiveTab("home");
                          }}
                          className="px-4 py-2 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-white/40 hover:text-white transition flex items-center gap-2 uppercase tracking-widest"
                        >
                          <ArrowLeft size={14} /> Volver al Inicio
                        </button>
                      )}

                      {/* Profile Card Header */}
                      {(() => {
                        const target = selectedProfileUser || currentUser;
                        const isSelf = target.id === currentUser.id;
                        const lvlInfo = getLevelDetails(target.points);

                        return (
                          <div className="space-y-8">
                            {/* Visual Header */}
                            <div className="flex flex-col items-center gap-6 pt-4">
                              <div className="relative group">
                                <div className={`w-40 h-40 rounded-[60px] p-1 bg-white/10 shadow-2xl`}>
                                  <img src={target.profilePic} alt="avatar" className="w-full h-full rounded-[56px] object-cover" />
                                </div>
                                <div className="absolute -bottom-2 -right-2 px-4 py-1.5 bg-white text-black rounded-2xl font-black italic text-xs shadow-2xl">
                                  {lvlInfo.level}
                                </div>
                              </div>

                              <div className="text-center space-y-1">
                                <h3 className="text-3xl font-black italic text-white tracking-tighter uppercase">{target.nickname}</h3>
                                <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.4em]">@{target.username}</p>
                              </div>

                              <div className="flex gap-8">
                                <div className="text-center">
                                  <p className="text-xl font-black text-white italic">{target.followers.length}</p>
                                  <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">Seguidores</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-xl font-black text-white italic">{target.following.length}</p>
                                  <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">Siguiendo</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-xl font-black text-white italic">{target.points}</p>
                                  <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">Reputación</p>
                                </div>
                              </div>
                            </div>

                            {/* Bio & Details */}
                            <div className="p-8 bg-white/5 rounded-[48px] border border-white/5 space-y-6">
                              {isSelf && (
                                <button 
                                  onClick={() => setShowEditProfile(true)}
                                  className="w-full py-4 bg-white text-black rounded-[24px] text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:scale-[1.02] active:scale-95 shadow-2xl shadow-white/5"
                                >
                                  Editar Perfil NEXUS
                                </button>
                              )}
                              
                              <div className="space-y-4">
                                <p className="text-white/60 text-sm leading-relaxed font-medium italic">
                                  "{target.bio || "Explorando la red segura de NEXUS."}"
                                </p>
                                
                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                                  <div>
                                    <span className="text-[8px] font-black text-white/20 uppercase tracking-widest block mb-1">Identidad</span>
                                    <span className="text-xs text-white/80 font-black italic">{target.orientation}</span>
                                  </div>
                                  <div>
                                    <span className="text-[8px] font-black text-white/20 uppercase tracking-widest block mb-1">Estatus</span>
                                    <span className="text-xs text-white/80 font-black italic">{lvlInfo.title}</span>
                                  </div>
                                </div>

                                <div className="pt-4">
                                  <span className="text-[8px] font-black text-white/20 uppercase tracking-widest block mb-3">Nodos de Interés</span>
                                  <div className="flex flex-wrap gap-2">
                                    {target.hobbies.map(hob => (
                                      <span key={hob} className="px-3 py-1 bg-white/5 border border-white/10 rounded-xl text-[9px] text-white/40 font-black uppercase tracking-wider">
                                        {hob}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              {/* Actions bar for peer profile */}
                              {!isSelf && (
                                <div className="pt-6 border-t border-white/5 flex gap-3">
                                  <button
                                    onClick={() => handleToggleFollow(target)}
                                    className={`flex-1 py-4 rounded-[24px] text-[10px] font-black uppercase tracking-widest transition-all ${
                                      currentUser.following.includes(target.id)
                                        ? "bg-white/5 text-white/40 border border-white/10"
                                        : "bg-white text-black shadow-xl"
                                    }`}
                                  >
                                    {currentUser.following.includes(target.id) ? "Sincronizado" : "Sincronizar"}
                                  </button>
                                  <button
                                    onClick={() => handleStartDirectChat(target)}
                                    className="flex-1 py-4 bg-white/5 border border-white/10 text-white rounded-[24px] text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                                  >
                                    Nodo Privado
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                    </motion.div>
                  )}

                </AnimatePresence>

              </div>

            </main>

            {/* FLOATING ACTION BOTTOM NAV BAR */}
            <nav className="p-4 border-t border-white/5 bg-slate-950/80 backdrop-blur-2xl fixed bottom-0 left-0 right-0 max-w-md mx-auto z-30 flex justify-around items-center rounded-t-[32px]" id="bottom-navigation">
              
              <button 
                onClick={() => {
                  setSelectedProfileUser(null);
                  setActiveTab("home");
                }}
                className={`flex flex-col items-center gap-1 transition-all ${activeTab === "home" ? "text-white scale-110" : "text-white/40 hover:text-white/60"}`}
              >
                <Clock size={18} className={activeTab === 'home' ? 'fill-white/10' : ''} />
                <span className="text-[7px] font-black uppercase tracking-widest">Home</span>
              </button>

              <button 
                onClick={() => {
                  setSelectedProfileUser(null);
                  setActiveTab("discover");
                }}
                className={`flex flex-col items-center gap-1 transition-all ${activeTab === "discover" ? "text-white scale-110" : "text-white/40 hover:text-white/60"}`}
              >
                <Compass size={18} className={activeTab === 'discover' ? 'fill-white/10' : ''} />
                <span className="text-[7px] font-black uppercase tracking-widest">Descubre</span>
              </button>

              <button 
                onClick={() => {
                  setSelectedProfileUser(null);
                  setActiveTab("chats");
                }}
                className={`flex flex-col items-center gap-1 transition-all relative ${activeTab === "chats" ? "text-white scale-110" : "text-white/40 hover:text-white/60"}`}
              >
                <MessageSquare size={18} className={activeTab === 'chats' ? 'fill-white/10' : ''} />
                <span className="text-[7px] font-black uppercase tracking-widest">Chats</span>
                {chatRequests.filter(r => r.receiverId === currentUser.id && r.status === "pending").length > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-purple-500 rounded-full border border-slate-950" />
                )}
              </button>

              <button 
                onClick={() => {
                  setImeaEmotion("feliz");
                  setShowIMEAModal(true);
                }}
                className="w-12 h-12 rounded-[18px] bg-white text-black hover:scale-110 active:scale-95 flex items-center justify-center shadow-2xl shadow-white/10 transition-all -mt-10 border-4 border-slate-950"
              >
                <Sparkles size={20} />
              </button>

              <button 
                onClick={() => {
                  setSelectedProfileUser(null);
                  setActiveTab("activity");
                }}
                className={`flex flex-col items-center gap-1 transition-all ${activeTab === "activity" ? "text-white scale-110" : "text-white/40 hover:text-white/60"}`}
              >
                <Bell size={18} className={activeTab === 'activity' ? 'fill-white/10' : ''} />
                <span className="text-[7px] font-black uppercase tracking-widest">Actividad</span>
              </button>

              <button 
                onClick={() => {
                  setSelectedProfileUser(null);
                  setActiveTab("clubs");
                }}
                className={`flex flex-col items-center gap-1 transition-all ${activeTab === "clubs" ? "text-white scale-110" : "text-white/40 hover:text-white/60"}`}
              >
                <Users size={18} className={activeTab === 'clubs' ? 'fill-white/10' : ''} />
                <span className="text-[7px] font-black uppercase tracking-widest">Clubs</span>
              </button>

              <button 
                onClick={() => {
                  setSelectedProfileUser(null);
                  setActiveTab("profile");
                }}
                className={`flex flex-col items-center gap-1 transition-all ${activeTab === "profile" ? "text-white scale-110" : "text-white/40 hover:text-white/60"}`}
              >
                <img src={currentUser.profilePic} className={`w-5 h-5 rounded-full object-cover border ${activeTab === 'profile' ? 'border-white' : 'border-transparent opacity-40'}`} />
                <span className="text-[7px] font-black uppercase tracking-widest">Perfil</span>
              </button>

            </nav>

            {/* LOCKOUT MINORS APP ADDICTION WARNING SHEET */}
            <AnimatePresence>
              {showLockoutScreen && (
                <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-6 text-center space-y-6" id="lockout-screen">
                  <ShieldAlert className="text-fuchsia-500 animate-bounce" size={48} />
                  <div className="space-y-2 max-w-xs">
                    <h2 className="text-xl font-black text-white">Límite de Tiempo Alcanzado - IMEA</h2>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Llevas más de <span className="text-fuchsia-400 font-bold">2 minutos</span> de uso continuo. Por tu salud mental y bienestar visual, te aconsejamos tomar un descanso o salir.
                    </p>
                  </div>
                  <div className="space-y-2 w-full max-w-xs">
                    <button 
                      onClick={() => setShowLockoutScreen(false)}
                      className="w-full py-3.5 bg-gradient-to-tr from-fuchsia-600 to-purple-600 text-white rounded-xl text-xs font-bold transition shadow-lg active:scale-95"
                      id="btn-dismiss-lockout"
                    >
                      Sí, entiendo (Continuar con precaución)
                    </button>
                    <button 
                      onClick={() => {
                        setCurrentUser(null);
                        setShowLockoutScreen(false);
                      }}
                      className="w-full py-3 bg-slate-900 border border-slate-800 text-slate-400 rounded-xl text-xs font-bold hover:text-white"
                    >
                      Salir de la aplicación
                    </button>
                  </div>
                </div>
              )}
            </AnimatePresence>

            {/* NOTIFICATIONS FEED MODAL */}
            <AnimatePresence>
              {showNotificationsModal && (
                <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-2xl flex flex-col h-[400px]"
                    id="notifications-modal"
                  >
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Bell size={16} className="text-fuchsia-400 animate-pulse" /> Actividad Reciente
                      </h3>
                      <button onClick={() => setShowNotificationsModal(false)} className="text-slate-400 hover:text-white font-bold">✕</button>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3 pr-1" id="notifications-list">
                      {notifications.map(n => (
                        <div key={n.id} className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl space-y-1 text-xs">
                          <span className="font-bold text-slate-300 block">{n.title}</span>
                          <p className="text-slate-400 leading-relaxed">{n.content}</p>
                          <span className="text-[8px] text-slate-500 font-mono block text-right">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-end pt-1">
                      <button 
                        onClick={() => setShowNotificationsModal(false)}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold text-slate-400 transition"
                      >
                        Cerrar
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* IMEA CHAT MODAL PORTAL */}
            <AnimatePresence>
              {showIMEAModal && (
                <IMEA 
                  currentUser={currentUser}
                  emotion={imeaEmotion}
                  onClose={() => setShowIMEAModal(false)}
                />
              )}
            </AnimatePresence>

            {/* EDIT PROFILE MODAL */}
            <AnimatePresence>
              {showEditProfile && (
                <EditProfile 
                  currentUser={currentUser}
                  onUpdateUser={(updated) => {
                    setCurrentUser(updated);
                    setAllUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
                  }}
                  onClose={() => setShowEditProfile(false)}
                />
              )}
            </AnimatePresence>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
