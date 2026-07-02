import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { User, Club, ChatMessage } from "../types";
import { getSupabase } from "../lib/supabase";
import { 
  Users, Plus, Search, Info, Settings, Shield, Image as ImageIcon, 
  ArrowLeft, X, Send, MoreVertical, LogOut, Check, Heart, ShieldAlert,
  Mic, Paperclip, Sticker, Film, Trash2, UserPlus, UserMinus
} from "lucide-react";

interface ClubsListProps {
  currentUser: User;
  clubs: Club[];
  allUsers: User[];
  onUpdateClubs: (updatedClubs: Club[]) => void;
  onTriggerNotification: (title: string, content: string, type: string) => void;
}

export default function ClubsList({ 
  currentUser, clubs, allUsers, onUpdateClubs, onTriggerNotification 
}: ClubsListProps) {
  
  const [activeClubId, setActiveClubId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [clubViewTab, setClubViewTab] = useState<"chat" | "info" | "admin">("chat");
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(false);

  // New Club Form
  const [newClubName, setNewClubName] = useState("");
  const [newClubDesc, setNewClubDesc] = useState("");
  const [newClubIs18Plus, setNewClubIs18Plus] = useState(false);
  const [newClubPrivacy, setNewClubPrivacy] = useState<"public" | "private">("public");

  const activeClub = clubs.find(c => c.id === activeClubId);
  const isAdmin = activeClub?.admins.includes(currentUser.id);

  const handleCreateClub = async () => {
    if (!newClubName.trim()) return;
    if (newClubIs18Plus && !currentUser.isAdult) {
      alert("No tienes edad para usar esta categoría (+18). Por favor elige otra.");
      return;
    }

    setLoading(true);
    const newClub: Club = {
      id: "club_" + Date.now(),
      name: newClubName,
      description: newClubDesc,
      coverImage: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80",
      profileImage: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=150&auto=format&fit=crop&q=80",
      tags: [],
      is18Plus: newClubIs18Plus,
      privacy: newClubIs18Plus ? "private" : newClubPrivacy,
      creatorId: currentUser.id,
      admins: [currentUser.id],
      members: [currentUser.id],
      pendingRequests: [],
      chatMessages: [],
      allowAllToMessage: true,
      allowMedia: true,
      allowStickers: true,
      allowVoiceNotes: true,
      allowVideos30s: true,
      bannedWords: [],
      inviteLink: "nexus.app/club/" + Date.now()
    };

    try {
      const { error } = await getSupabase().from("clubs").insert([newClub]);
      if (error) throw error;
      onUpdateClubs([newClub, ...clubs]);
      setShowCreateModal(false);
    } catch (err) {
      console.error("Error creating club:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !activeClub) return;

    const newMsg: ChatMessage = {
      id: "msg_" + Date.now(),
      clubId: activeClub.id,
      senderId: currentUser.id,
      senderName: currentUser.nickname,
      senderPic: currentUser.profilePic,
      senderAge: currentUser.age,
      type: "text",
      content: messageText.trim(),
      createdAt: new Date().toISOString()
    };

    const updatedClub = { ...activeClub, chatMessages: [...activeClub.chatMessages, newMsg] };
    
    try {
      await getSupabase().from("clubs").update({ chatMessages: updatedClub.chatMessages }).eq("id", activeClub.id);
      onUpdateClubs(clubs.map(c => c.id === activeClub.id ? updatedClub : c));
      setMessageText("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const handleJoinClub = async (club: Club) => {
    if (club.is18Plus && !currentUser.isAdult) {
      alert("Este club es solo para adultos. Por favor elige otro club.");
      return;
    }

    if (club.privacy === "private") {
      if (club.pendingRequests.includes(currentUser.id)) return;
      const updatedPending = [...club.pendingRequests, currentUser.id];
      try {
        await getSupabase().from("clubs").update({ pending_requests: updatedPending }).eq("id", club.id);
        onUpdateClubs(clubs.map(c => c.id === club.id ? { ...c, pendingRequests: updatedPending } : c));
        alert("Solicitud enviada con éxito. Espera a que el administrador acepte.");
      } catch (err) {
        console.error("Error joining private club:", err);
      }
      return;
    }

    const updatedMembers = [...club.members, currentUser.id];
    try {
      await getSupabase().from("clubs").update({ members: updatedMembers }).eq("id", club.id);
      onUpdateClubs(clubs.map(c => c.id === club.id ? { ...c, members: updatedMembers } : c));
      setActiveClubId(club.id);
    } catch (err) {
      console.error("Error joining club:", err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 pb-20">
      
      <AnimatePresence mode="wait">
        {!activeClubId ? (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col p-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-black italic tracking-tighter text-white">CLUBS</h2>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="p-3 bg-white text-black rounded-2xl shadow-xl shadow-white/10 hover:scale-105 active:scale-95 transition-all"
              >
                <Plus size={24} />
              </button>
            </div>

            {clubs.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                <Users size={64} />
                <p className="text-sm font-black uppercase tracking-[0.2em]">Todavía no hay clubs. <br/>Crea tu primer club.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {clubs.map(club => (
                  <div key={club.id} className="bg-slate-900/40 rounded-[32px] border border-white/5 overflow-hidden group">
                    <img src={club.coverImage} className="w-full h-32 object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
                    <div className="p-6 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <img src={club.profileImage} className="w-12 h-12 rounded-2xl object-cover border-2 border-white/10" />
                        <div>
                          <h4 className="text-sm font-black text-white italic">{club.name}</h4>
                          <div className="flex gap-2">
                            <span className="text-[8px] font-black uppercase tracking-widest text-white/40">{club.members.length} Miembros</span>
                            {club.is18Plus && <span className="text-[8px] font-black uppercase tracking-widest text-red-500">Solo Adultos</span>}
                          </div>
                        </div>
                      </div>
                      {club.members.includes(currentUser.id) ? (
                        <button 
                          onClick={() => setActiveClubId(club.id)}
                          className="px-6 py-2 bg-white/5 text-white rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10"
                        >
                          ABRIR
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleJoinClub(club)}
                          className="px-6 py-2 bg-white text-black rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-white/10"
                        >
                          {club.privacy === 'private' ? 'SOLICITAR' : 'UNIRSE'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div key="active" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex-1 flex flex-col h-full">
            {/* Club Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-slate-950/80 backdrop-blur-xl sticky top-0 z-20">
              <div className="flex items-center gap-4">
                <button onClick={() => setActiveClubId(null)} className="p-2 bg-white/5 rounded-full"><ArrowLeft size={18}/></button>
                <div className="flex items-center gap-3">
                  <img src={activeClub?.profileImage} className="w-10 h-10 rounded-xl object-cover border border-white/10" />
                  <div>
                    <h3 className="text-sm font-black text-white italic leading-tight">{activeClub?.name}</h3>
                    <p className="text-[8px] text-white/40 font-bold uppercase tracking-widest">{activeClub?.members.length} miembros activos</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-1 bg-white/5 p-1 rounded-full border border-white/5">
                <button onClick={() => setClubViewTab("chat")} className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${clubViewTab === 'chat' ? 'bg-white text-black shadow-lg' : 'text-white/40'}`}>Chat</button>
                <button onClick={() => setClubViewTab("info")} className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${clubViewTab === 'info' ? 'bg-white text-black shadow-lg' : 'text-white/40'}`}>Info</button>
                {isAdmin && <button onClick={() => setClubViewTab("admin")} className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${clubViewTab === 'admin' ? 'bg-white text-black shadow-lg' : 'text-white/40'}`}>Admin</button>}
              </div>
            </div>

            {/* Club Content */}
            <div className="flex-1 overflow-y-auto no-scrollbar">
              {clubViewTab === "chat" && (
                <div className="p-6 space-y-6">
                  {activeClub?.chatMessages.map((msg, idx) => (
                    <div key={idx} className={`flex gap-3 ${msg.senderId === currentUser.id ? 'flex-row-reverse' : ''}`}>
                      <img src={msg.senderPic} className="w-8 h-8 rounded-full object-cover border border-white/10" />
                      <div className={`max-w-[80%] space-y-1 ${msg.senderId === currentUser.id ? 'items-end' : ''}`}>
                        <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">{msg.senderName} ({msg.senderAge})</p>
                        <div className={`p-4 rounded-3xl text-xs font-medium ${msg.senderId === currentUser.id ? 'bg-white text-black rounded-tr-none' : 'bg-white/5 text-white/80 rounded-tl-none border border-white/5'}`}>
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {clubViewTab === "info" && (
                <div className="p-6 space-y-8">
                  <img src={activeClub?.coverImage} className="w-full h-48 rounded-[40px] object-cover shadow-2xl border border-white/5" />
                  <div className="space-y-4">
                    <h2 className="text-3xl font-black italic tracking-tighter text-white">{activeClub?.name}</h2>
                    <p className="text-white/60 text-sm leading-relaxed font-medium">{activeClub?.description}</p>
                    <div className="flex gap-2">
                      <span className="px-4 py-1 bg-purple-600/20 text-purple-400 rounded-full text-[9px] font-black uppercase tracking-widest border border-purple-500/20">#{activeClub?.is18Plus ? 'Adultos' : 'Todos'}</span>
                      <span className="px-4 py-1 bg-white/5 text-white/40 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/10">#{activeClub?.privacy}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Miembros del Club</h4>
                    <div className="grid grid-cols-4 gap-4">
                      {activeClub?.members.map(mid => {
                        const m = allUsers.find(u => u.id === mid);
                        return m ? (
                          <div key={mid} className="flex flex-col items-center gap-1.5">
                            <img src={m.profilePic} className="w-12 h-12 rounded-2xl object-cover border-2 border-white/5" />
                            <span className="text-[8px] font-bold text-white/40 truncate w-full text-center">{m.nickname}</span>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                </div>
              )}

              {clubViewTab === "admin" && isAdmin && (
                <div className="p-6 space-y-10">
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Configuración Básica</h4>
                    <div className="space-y-2">
                      <input type="text" value={activeClub?.name} className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white font-bold" />
                      <textarea value={activeClub?.description} className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white text-sm h-32" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Gestión de Miembros</h4>
                    <div className="space-y-3">
                      {activeClub?.members.map(mid => {
                        const m = allUsers.find(u => u.id === mid);
                        if (!m || m.id === currentUser.id) return null;
                        return (
                          <div key={mid} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                            <div className="flex items-center gap-3">
                              <img src={m.profilePic} className="w-10 h-10 rounded-xl object-cover" />
                              <span className="text-xs font-black text-white">{m.nickname}</span>
                            </div>
                            <div className="flex gap-2">
                              <button className="p-2 bg-red-600/20 text-red-500 rounded-lg"><UserMinus size={16}/></button>
                              <button className="p-2 bg-green-600/20 text-green-500 rounded-lg"><Shield size={16}/></button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {activeClub?.privacy === 'private' && (
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Solicitudes Pendientes</h4>
                      {activeClub?.pendingRequests.map(pid => {
                        const p = allUsers.find(u => u.id === pid);
                        return p ? (
                          <div key={pid} className="flex items-center justify-between p-4 bg-purple-600/10 rounded-2xl border border-purple-500/20">
                            <div className="flex items-center gap-3">
                              <img src={p.profilePic} className="w-10 h-10 rounded-xl object-cover" />
                              <span className="text-xs font-black text-white">{p.nickname}</span>
                            </div>
                            <div className="flex gap-2">
                              <button className="px-4 py-2 bg-white text-black rounded-full text-[9px] font-black uppercase">Aceptar</button>
                              <button className="px-4 py-2 bg-white/10 text-white rounded-full text-[9px] font-black uppercase">Rechazar</button>
                            </div>
                          </div>
                        ) : null;
                      })}
                    </div>
                  )}

                  <button className="w-full py-4 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2">
                    <Trash2 size={16} /> Eliminar Club Definitivamente
                  </button>
                </div>
              )}
            </div>

            {/* Chat Bar */}
            {clubViewTab === "chat" && (activeClub?.allowAllToMessage || isAdmin) && (
              <div className="p-6 bg-slate-950 border-t border-white/5 sticky bottom-0">
                <div className="flex items-center gap-3 bg-white/5 p-2 rounded-full border border-white/10">
                  <div className="flex gap-1 ml-2">
                    <button className="p-2 text-white/40 hover:text-white"><Film size={18}/></button>
                    <button className="p-2 text-white/40 hover:text-white"><Mic size={18}/></button>
                  </div>
                  <input 
                    type="text" 
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Escribe en el club..."
                    className="flex-1 bg-transparent text-white text-xs outline-none font-medium px-2"
                  />
                  <button onClick={handleSendMessage} className="p-3 bg-white text-black rounded-full shadow-lg active:scale-95"><Send size={16}/></button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl p-8 flex flex-col">
            <div className="flex justify-between items-center mb-12">
              <button onClick={() => setShowCreateModal(false)} className="p-2 bg-white/5 rounded-full"><X size={24}/></button>
              <h3 className="text-xl font-black italic text-white tracking-tighter">CREAR NUEVO CLUB</h3>
              <button onClick={handleCreateClub} className="px-8 py-2 bg-white text-black rounded-full font-black text-[10px] uppercase tracking-widest">CREAR</button>
            </div>
            
            <div className="flex-1 space-y-8 overflow-y-auto no-scrollbar">
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Portada del Club</h4>
                <div className="w-full h-40 bg-slate-900 rounded-[32px] border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-2">
                  <ImageIcon className="text-white/20" size={32} />
                  <span className="text-[8px] font-black uppercase tracking-widest text-white/20">Subir Portada</span>
                </div>
              </div>

              <div className="space-y-2">
                <input 
                  type="text" 
                  value={newClubName}
                  onChange={(e) => setNewClubName(e.target.value)}
                  placeholder="Nombre del Club" 
                  className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white font-black italic outline-none focus:border-purple-500"
                />
                <textarea 
                  value={newClubDesc}
                  onChange={(e) => setNewClubDesc(e.target.value)}
                  placeholder="Describe de qué trata este espacio..." 
                  className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white text-sm min-h-[120px] outline-none"
                />
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Configuración de Privacidad</h4>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setNewClubPrivacy("public")}
                    className={`p-5 rounded-3xl border-2 text-[10px] font-black uppercase transition-all ${newClubPrivacy === 'public' ? 'bg-white text-black border-white' : 'bg-white/5 border-white/5 text-white/40'}`}
                  >
                    Público
                  </button>
                  <button 
                    onClick={() => setNewClubPrivacy("private")}
                    className={`p-5 rounded-3xl border-2 text-[10px] font-black uppercase transition-all ${newClubPrivacy === 'private' ? 'bg-white text-black border-white' : 'bg-white/5 border-white/5 text-white/40'}`}
                  >
                    Privado
                  </button>
                </div>
              </div>

              <div 
                onClick={() => setNewClubIs18Plus(!newClubIs18Plus)}
                className={`p-6 rounded-[32px] border-2 flex items-center justify-between cursor-pointer transition-all ${newClubIs18Plus ? 'bg-red-600/10 border-red-600 shadow-lg shadow-red-900/20' : 'bg-white/5 border-white/5 opacity-60'}`}
              >
                <div className="flex gap-4 items-center">
                  <ShieldAlert className={newClubIs18Plus ? 'text-red-500' : 'text-white/20'} size={24} />
                  <div className="text-left">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-white">Categoría +18</h5>
                    <p className="text-[8px] font-bold text-white/40 max-w-[180px]">Automáticamente privado y restringido a adultos.</p>
                  </div>
                </div>
                <div className={`w-10 h-6 rounded-full p-1 transition-colors ${newClubIs18Plus ? 'bg-red-600' : 'bg-slate-700'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${newClubIs18Plus ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
