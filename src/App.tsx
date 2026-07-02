import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  User, Post, Club, Chat, ChatRequest, Story, Note 
} from "./types";
import { 
  INITIAL_USERS, INITIAL_POSTS, INITIAL_CLUBS, INITIAL_CHATS, 
  INITIAL_CHAT_REQUESTS
} from "./data";
import Registration from "./components/Registration";
import HomeFeed from "./components/HomeFeed";
import Descubre from "./components/Descubre";
import ChatsList from "./components/ChatsList";
import ClubsList from "./components/ClubsList";
import StoriesAndNotes from "./components/StoriesAndNotes";
import IMEA from "./components/IMEA";

// Lucide icons
import { 
  Heart, MessageSquare, Compass, Shield, Users, User as UserIcon, 
  Bell, Award, Clock, ArrowLeft, LogOut, CheckCircle2, ShieldAlert, Sparkles 
} from "lucide-react";

const initialStories: Story[] = [
  {
    id: "story_1",
    authorId: "user_sofia",
    authorName: "Sofía 🎨",
    authorPic: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    mediaUrl: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=600&auto=format&fit=crop&q=80",
    textOverlay: "Pintando bajo las estrellas ✨🛸",
    createdAt: new Date().toISOString(),
    viewsCount: 15
  },
  {
    id: "story_2",
    authorId: "user_alexis",
    authorName: "Alexis",
    authorPic: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    mediaUrl: "https://images.unsplash.com/photo-1516280440614-37939bbacd6a?w=600&auto=format&fit=crop&q=80",
    textOverlay: "¡Mis plantitas están creciendo sanas! 🌱💧",
    createdAt: new Date().toISOString(),
    viewsCount: 8
  }
];

const initialNotes: Note[] = [
  {
    id: "note_1",
    authorId: "user_sofia",
    authorName: "Sofía 🎨",
    authorPic: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    text: "Creando arte libre de hate hoy 🎨💜",
    bgColor: "bg-gradient-to-tr from-fuchsia-600 to-pink-600",
    createdAt: new Date().toISOString()
  },
  {
    id: "note_2",
    authorId: "user_alexis",
    authorName: "Alexis",
    authorPic: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    text: "Escuchando indie pop y regando cactus 🌵🎧",
    bgColor: "bg-gradient-to-tr from-purple-800 to-indigo-900",
    createdAt: new Date().toISOString()
  }
];

export default function App() {
  
  // SESSION STATES
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // DATABASE GLOBAL STATES
  const [allUsers, setAllUsers] = useState<User[]>(INITIAL_USERS);
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [clubs, setClubs] = useState<Club[]>(INITIAL_CLUBS);
  const [chats, setChats] = useState<Chat[]>(INITIAL_CHATS);
  const [chatRequests, setChatRequests] = useState<ChatRequest[]>(INITIAL_CHAT_REQUESTS);
  const [stories, setStories] = useState<Story[]>(initialStories);
  const [notes, setNotes] = useState<Note[]>(initialNotes);

  // NOTIFICATIONS LIST (SIMULATED ACTIVITY)
  const [notifications, setNotifications] = useState<any[]>([
    {
      id: "not_1",
      title: "✨ Bienvenido a Z App",
      content: "Disfruta de un entorno seguro, inclusivo y amigable para jóvenes.",
      type: "system",
      createdAt: new Date().toISOString()
    }
  ]);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);

  // ACTIVE INTERACTION VIEW
  // 'feed' | 'descubre' | 'chats' | 'clubs' | 'profile'
  const [activeTab, setActiveTab] = useState<"feed" | "descubre" | "chats" | "clubs" | "profile">("feed");
  const [selectedProfileUser, setSelectedProfileUser] = useState<User | null>(null);

  // IMEA MENTAL HEALTH STATE
  const [showIMEAModal, setShowIMEAModal] = useState(false);
  const [imeaEmotion, setImeaEmotion] = useState("triste");

  // OVERUSE ENGINE / TIMER LOCK (Prevention of app addiction for minors)
  const [appElapsedTime, setAppElapsedTime] = useState(0); // in seconds
  const [showLockoutScreen, setShowLockoutScreen] = useState(false);

  // PROFILE SKIN UNLOCKED FROM ACHIEVEMENTS
  const [unlockedSkin, setUnlockedSkin] = useState<string>("default");

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
    if (points >= 300) {
      return { 
        level: 3, 
        title: "Embajador de la Paz IMEA 👑", 
        badgeColor: "bg-gradient-to-r from-purple-600 to-fuchsia-600 shadow-[0_0_12px_rgba(168,85,247,0.5)]",
        unlockedAura: "shadow-[inset_0_0_20px_rgba(147,51,234,0.4)] border-purple-500/50" 
      };
    } else if (points >= 100) {
      return { 
        level: 2, 
        title: "Inclusivo Z ✨", 
        badgeColor: "bg-pink-600",
        unlockedAura: "shadow-[inset_0_0_15px_rgba(236,72,153,0.3)] border-pink-500/40" 
      };
    } else {
      return { 
        level: 1, 
        title: "Novato Z 🌱", 
        badgeColor: "bg-slate-800",
        unlockedAura: "border-slate-800" 
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
          text: "🔒 Esta conversación permanente ha sido encriptada y protegida. Respeta los límites.",
          type: "text",
          createdAt: new Date().toISOString()
        }
      ]
    };

    setChats([newChat, ...chats]);
    setActiveTab("chats");
  };

  // FOLLOW / UNFOLLOW LOGIC
  const handleToggleFollow = (targetUser: User) => {
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
      
      // Notify target user
      handleTriggerNotification(
        "👤 Nuevo Seguidor", 
        `¡A ${currentUser.nickname} le interesa tu contenido y comenzó a seguirte!`, 
        "follow"
      );
    }

    // Update global users database
    const updatedUsers = allUsers.map(u => {
      if (u.id === currentUser.id) {
        return { ...u, following: updatedFollowing };
      }
      if (u.id === targetUser.id) {
        return { ...u, followers: updatedFollowers };
      }
      return u;
    });

    setAllUsers(updatedUsers);
    
    // Update active currentUser
    const self = updatedUsers.find(u => u.id === currentUser.id);
    if (self) setCurrentUser(self);

    // Update active selected profile user
    const peer = updatedUsers.find(u => u.id === targetUser.id);
    if (peer) setSelectedProfileUser(peer);
  };

  // EMOTION DAILY ALERT RESPONSE HANDLER
  const handleTriggerEmotionAlert = (emotion: string) => {
    if (emotion === "triste") {
      setImeaEmotion("triste");
      setShowIMEAModal(true);
    } else {
      alert(`¡Nos alegra que te sientas ${emotion}! Sigue brillando y compartiendo buen contenido ✨`);
      // Add points for checking in
      if (currentUser) {
        setCurrentUser({ ...currentUser, points: currentUser.points + 10 });
        handleTriggerNotification("✨ +10 Puntos Ganados", "Has completado tu chequeo emocional del día.", "system");
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
              allUsers={allUsers}
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
            <header className="p-4 border-b border-slate-900 bg-slate-950/80 backdrop-blur sticky top-0 z-30 flex justify-between items-center" id="main-header">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-fuchsia-600 to-purple-600 flex items-center justify-center font-black text-white text-lg tracking-wider shadow-lg shadow-purple-950/20">
                  Z
                </div>
                <div>
                  <h1 className="text-xs font-black tracking-wider text-slate-400 block uppercase">Generación Libre</h1>
                  <span className="text-[10px] text-fuchsia-400 font-bold block mt-[-2px]">Zona Segura IMEA</span>
                </div>
              </div>

              {/* Status and Action Buttons */}
              <div className="flex items-center gap-2">
                {/* Level / Achievements badge */}
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold text-white uppercase ${getLevelDetails(currentUser.points).badgeColor}`} id="level-badge">
                  <Award size={11} />
                  <span>Nivel {getLevelDetails(currentUser.points).level}</span>
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
                  onClick={() => {
                    if (confirm("¿Estás seguro de que deseas cerrar sesión?")) {
                      setCurrentUser(null);
                      setAppElapsedTime(0);
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
                  {activeTab === "feed" && (
                    <motion.div
                      key="feed-view"
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
                  {activeTab === "descubre" && (
                    <motion.div
                      key="descubre-view"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <Descubre 
                        currentUser={currentUser}
                        allUsers={allUsers}
                        onSelectUserForProfile={handleSelectUserForProfile}
                        onStartDirectChat={handleStartDirectChat}
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
                        clubs={clubs}
                        onUpdateChats={setChats}
                        onUpdateRequests={setChatRequests}
                        onTriggerNotification={handleTriggerNotification}
                        onSelectUserForProfile={handleSelectUserForProfile}
                      />
                    </motion.div>
                  )}

                  {/* VIEW 4: CLUBS */}
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
                        onSelectUserForProfile={handleSelectUserForProfile}
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
                      className="space-y-5"
                      id="profile-panel"
                    >
                      {/* Back button if looking at someone else */}
                      {selectedProfileUser && selectedProfileUser.id !== currentUser.id && (
                        <button 
                          onClick={() => {
                            setSelectedProfileUser(null);
                            setActiveTab("feed");
                          }}
                          className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-400 hover:text-white transition flex items-center gap-1.5"
                        >
                          <ArrowLeft size={14} /> Volver al Feed
                        </button>
                      )}

                      {/* Profile Card Header */}
                      {(() => {
                        const target = selectedProfileUser || currentUser;
                        const isSelf = target.id === currentUser.id;
                        const lvlInfo = getLevelDetails(target.points);

                        return (
                          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl p-5 space-y-4">
                            <div className="flex justify-between items-start">
                              <div className="relative">
                                {/* Story glowing border if has stories */}
                                <div className={`w-20 h-20 rounded-full p-[3px] bg-gradient-to-tr from-fuchsia-600 to-indigo-600`}>
                                  <img src={target.profilePic} alt="avatar" className="w-full h-full rounded-full object-cover border-4 border-slate-900" />
                                </div>
                                <span className="absolute -bottom-1 -right-1 bg-purple-600 text-[10px] font-black p-1 rounded-full text-white line-clamp-1 border-2 border-slate-900">
                                  {target.age}
                                </span>
                              </div>

                              <div className="flex-1 pl-4 space-y-1">
                                <h3 className="font-extrabold text-base text-white">{target.nickname}</h3>
                                <p className="text-xs text-slate-500 font-mono">@{target.username}</p>
                                <div className="flex gap-3 text-xs text-slate-400">
                                  <span><strong className="text-white">{target.followers.length}</strong> seguidores</span>
                                  <span><strong className="text-white">{target.following.length}</strong> seguidos</span>
                                </div>
                              </div>
                            </div>

                            {/* Bio & Details */}
                            <div className="space-y-2 text-xs">
                              <p className="text-slate-300 leading-relaxed italic">"{target.bio || "Explorando la vida libre de odio."}"</p>
                              
                              <div className="grid grid-cols-2 gap-2 font-mono text-[10px] pt-1.5 border-t border-slate-800/60">
                                <div>
                                  <span className="text-slate-500 block">Género / Identidad</span>
                                  <span className="text-slate-300 font-bold">{target.genderIdentity}</span>
                                </div>
                                <div>
                                  <span className="text-slate-500 block">Orientación</span>
                                  <span className="text-slate-300 font-bold">{target.orientationIsPublic ? target.orientation : "🔒 Privada"}</span>
                                </div>
                              </div>

                              {/* Hobbies list */}
                              <div className="pt-2">
                                <span className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Intereses & Hobbies</span>
                                <div className="flex flex-wrap gap-1.5">
                                  {target.hobbies.map(hob => (
                                    <span key={hob} className="px-2 py-0.5 bg-slate-950 border border-slate-800 rounded text-[10px] text-slate-400 font-semibold uppercase">
                                      {hob}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Actions bar for peer profile */}
                            {!isSelf && (
                              <div className="pt-3 border-t border-slate-800 flex gap-2">
                                <button
                                  onClick={() => handleToggleFollow(target)}
                                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition ${
                                    currentUser.following.includes(target.id)
                                      ? "bg-slate-950 border border-slate-800 text-slate-400"
                                      : "bg-fuchsia-600 hover:bg-fuchsia-500 text-white"
                                  }`}
                                >
                                  {currentUser.following.includes(target.id) ? "Siguiendo" : "Seguir"}
                                </button>
                                <button
                                  onClick={() => handleStartDirectChat(target)}
                                  className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition"
                                >
                                  Mensaje Privado
                                </button>
                              </div>
                            )}

                            {/* Gamification Level display for Self */}
                            {isSelf && (
                              <div className="p-3 bg-purple-950/20 border border-purple-900/30 rounded-xl space-y-1.5 mt-2">
                                <div className="flex justify-between text-xs font-bold">
                                  <span className="text-purple-300">{lvlInfo.title}</span>
                                  <span className="text-slate-500">{target.points} pts acumulados</span>
                                </div>
                                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-900">
                                  <div className="bg-purple-500 h-full rounded-full" style={{ width: `${Math.min((target.points / 400) * 100, 100)}%` }} />
                                </div>
                                <span className="text-[9px] text-slate-500 block leading-relaxed">
                                  Completa chequeos, publica sanamente, y haz amigos para acumular puntos y desbloquear skins exclusivas de perfil.
                                </span>
                              </div>
                            )}

                          </div>
                        );
                      })()}
                    </motion.div>
                  )}

                </AnimatePresence>

              </div>

            </main>

            {/* FLOATING ACTION BOTTOM NAV BAR */}
            <nav className="p-3 border-t border-slate-900 bg-slate-950/90 backdrop-blur fixed bottom-0 left-0 right-0 max-w-md mx-auto z-30 flex justify-around items-center" id="bottom-navigation">
              
              <button 
                onClick={() => {
                  setSelectedProfileUser(null);
                  setActiveTab("feed");
                }}
                className={`flex flex-col items-center gap-1 p-1.5 transition-all ${
                  activeTab === "feed" ? "text-fuchsia-500 scale-105" : "text-slate-500 hover:text-slate-400"
                }`}
                id="tab-nav-feed"
              >
                <Compass size={18} />
                <span className="text-[9px] font-bold uppercase tracking-wider">Feed</span>
              </button>

              <button 
                onClick={() => {
                  setSelectedProfileUser(null);
                  setActiveTab("descubre");
                }}
                className={`flex flex-col items-center gap-1 p-1.5 transition-all ${
                  activeTab === "descubre" ? "text-fuchsia-500 scale-105" : "text-slate-500 hover:text-slate-400"
                }`}
                id="tab-nav-descubre"
              >
                <Compass size={18} className="rotate-45" />
                <span className="text-[9px] font-bold uppercase tracking-wider">Descubre</span>
              </button>

              {/* FLOATING CENTRAL IMEA BOT ACTION TRIGGER */}
              <button 
                onClick={() => {
                  setImeaEmotion("feliz");
                  setShowIMEAModal(true);
                }}
                className="w-11 h-11 rounded-full bg-gradient-to-tr from-fuchsia-600 via-purple-600 to-indigo-600 hover:scale-105 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-purple-950/50 relative z-40"
                id="btn-imea-bot-center"
              >
                <Sparkles size={18} className="animate-pulse" />
              </button>

              <button 
                onClick={() => {
                  setSelectedProfileUser(null);
                  setActiveTab("chats");
                }}
                className={`flex flex-col items-center gap-1 p-1.5 transition-all relative ${
                  activeTab === "chats" ? "text-fuchsia-500 scale-105" : "text-slate-500 hover:text-slate-400"
                }`}
                id="tab-nav-chats"
              >
                <MessageSquare size={18} />
                <span className="text-[9px] font-bold uppercase tracking-wider">Chats</span>
                {chatRequests.filter(r => r.receiverId === currentUser.id && r.status === "pending").length > 0 && (
                  <span className="absolute top-1.5 right-2 w-2 h-2 bg-fuchsia-500 rounded-full" />
                )}
              </button>

              <button 
                onClick={() => {
                  setSelectedProfileUser(null);
                  setActiveTab("clubs");
                }}
                className={`flex flex-col items-center gap-1 p-1.5 transition-all ${
                  activeTab === "clubs" ? "text-fuchsia-500 scale-105" : "text-slate-500 hover:text-slate-400"
                }`}
                id="tab-nav-clubs"
              >
                <Users size={18} />
                <span className="text-[9px] font-bold uppercase tracking-wider">Clubs</span>
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
                  initialEmotion={imeaEmotion}
                  onClose={() => setShowIMEAModal(false)}
                />
              )}
            </AnimatePresence>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
