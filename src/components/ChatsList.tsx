import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { User, Chat, ChatRequest, Club, ChatMessage } from "../types";
import { getSupabase } from "../lib/supabase";
import { 
  MessageSquare, UserCheck, ShieldAlert, Send, Trash2, ShieldX, Lock, 
  HelpCircle, Sparkles, Heart, CheckCircle2, UserX 
} from "lucide-react";

interface ChatsListProps {
  currentUser: User;
  allUsers: User[];
  chats: Chat[];
  chatRequests: ChatRequest[];
  clubs: Club[];
  onUpdateChats: (updatedChats: Chat[]) => void;
  onUpdateRequests: (updatedRequests: ChatRequest[]) => void;
  onTriggerNotification: (title: string, content: string, type: "system" | "like" | "comment" | "follow" | "chat_request" | "club_request") => void;
  onSelectUserForProfile: (user: User) => void;
}

export default function ChatsList({
  currentUser, allUsers, chats, chatRequests, clubs, onUpdateChats, onUpdateRequests, onTriggerNotification, onSelectUserForProfile
}: ChatsListProps) {
  
  const [activeTab, setActiveTab] = useState<"chats" | "requests" | "clubs">("chats");
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [activeClubChat, setActiveClubChat] = useState<Club | null>(null);
  const [messageText, setMessageText] = useState("");

  // Safety Code PIN state for minor accepting adult request
  const [requestToAuthorize, setRequestToAuthorize] = useState<ChatRequest | null>(null);
  const [pinCode, setPinCode] = useState("");
  const [pinError, setPinError] = useState("");

  // FILTER CHATS FOR CURRENT USER (Matching schema: user1Id & user2Id)
  const myChats = chats.filter(c => c.user1Id === currentUser.id || c.user2Id === currentUser.id);
  
  // FILTER REQUESTS FOR CURRENT USER
  const myRequests = chatRequests.filter(r => r.receiverId === currentUser.id && r.status === "pending");

  // FILTER CLUBS THAT I AM A MEMBER OF
  const myClubs = clubs.filter(c => c.members.includes(currentUser.id));

  // ACCEPT REQUEST WITH PIN VERIFICATION
  const handleStartAcceptRequest = (req: ChatRequest) => {
    const sender = allUsers.find(u => u.id === req.senderId);
    
    // Check if receiver (currentUser) is minor and sender is adult
    const isReceiverMinor = !currentUser.isAdult;
    const isSenderAdult = sender?.isAdult || false;

    if (isReceiverMinor && isSenderAdult) {
      setRequestToAuthorize(req);
      setPinCode("");
      setPinError("");
    } else {
      acceptRequestDirectly(req);
    }
  };

  const acceptRequestDirectly = async (req: ChatRequest) => {
    const sender = allUsers.find(u => u.id === req.senderId);
    if (!sender) return;

    // Create permanent chat room
    const newChat: Chat = {
      id: "chat_" + Date.now(),
      user1Id: currentUser.id,
      user2Id: req.senderId,
      messages: [
        {
          id: "msg_init",
          senderId: "system",
          text: "🔒 Esta conversación ha sido encriptada. Se prudente, amigable, y recuerda que puedes reportar acosos en el menú superior.",
          type: "text",
          createdAt: new Date().toISOString()
        }
      ]
    };

    try {
      await Promise.all([
        getSupabase().from("chats").insert([newChat]),
        getSupabase().from("chat_requests").delete().eq("id", req.id)
      ]);

      onUpdateChats([newChat, ...chats]);
      onUpdateRequests(chatRequests.filter(r => r.id !== req.id));
      onTriggerNotification("🤝 Solicitud Aceptada", `Ahora tienes un chat activo con ${sender.nickname}.`, "system");
    } catch (err) {
      console.error("Error accepting chat request in Supabase:", err);
    }
  };

  const handleVerifyPinAndAccept = () => {
    if (pinCode === "1234") {
      if (requestToAuthorize) {
        acceptRequestDirectly(requestToAuthorize);
        setRequestToAuthorize(null);
      }
    } else {
      setPinError("Código de autorización incorrecto. Por favor, ingresa el pin de 4 dígitos proporcionado por IMEA / tus padres.");
    }
  };

  // DECLINE CHAT REQUEST
  const handleDeclineRequest = async (reqId: string) => {
    try {
      await getSupabase().from("chat_requests").delete().eq("id", reqId);
      onUpdateRequests(chatRequests.filter(r => r.id !== reqId));
      onTriggerNotification("Solicitud Rechazada", "Has declinado la solicitud de conversación de forma segura.", "system");
    } catch (err) {
      console.error("Error declining chat request in Supabase:", err);
    }
  };

  // SEND PRIVATE MESSAGE WITH GROOMING/BULLYING FILTER
  const handleSendPrivateMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !activeChat) return;

    const sender = currentUser;
    const recipientId = activeChat.user1Id === sender.id ? activeChat.user2Id : activeChat.user1Id;
    const recipient = allUsers.find(u => u.id === recipientId);

    let isFlagged = false;
    let textToPost = messageText.trim();

    // Bullying words filters
    const sensitiveWords = ["estupido", "tonto", "idiota", "feo", "groseria"];
    sensitiveWords.forEach(w => {
      const reg = new RegExp(w, "gi");
      textToPost = textToPost.replace(reg, "***");
    });

    // Grooming check: If adult sends message to minor
    if (sender.isAdult && recipient && !recipient.isAdult) {
      const flags = ["mandame foto", "desnudate", "donde vives", "quedamos a solas", "quieres ser mi novio", "te compro cosas"];
      const isSuspect = flags.some(f => textToPost.toLowerCase().includes(f));
      
      if (isSuspect) {
        isFlagged = true;
        // Trigger alert block
        onTriggerNotification(
          "🚨 Detección de Grooming IMEA", 
          `Un adulto (${sender.nickname}) ha enviado una solicitud o lenguaje de tipo acoso sospechoso. Reportado.`, 
          "system"
        );
      }
    }

    const newMessage: ChatMessage = {
      id: "msg_" + Date.now(),
      senderId: sender.id,
      text: isFlagged ? "[MENSAJE BLOQUEADO POR MODERACIÓN DE SEGURIDAD BIOMÉTRICA IMEA]" : textToPost,
      type: "text",
      createdAt: new Date().toISOString()
    };

    try {
      const updatedMessages = [...activeChat.messages, newMessage];
      const { error } = await getSupabase()
        .from("chats")
        .update({ messages: updatedMessages })
        .eq("id", activeChat.id);
      
      if (error) throw error;

      const updatedChats = chats.map(c => {
        if (c.id === activeChat.id) {
          return {
            ...c,
            messages: updatedMessages
          };
        }
        return c;
      });

      onUpdateChats(updatedChats);
      setActiveChat(updatedChats.find(c => c.id === activeChat.id) || null);
      setMessageText("");

      if (recipient && !isFlagged) {
        onTriggerNotification("💬 Mensaje nuevo", `${sender.nickname}: ${textToPost.slice(0, 20)}...`, "chat_request");
      }
    } catch (err) {
      console.error("Error sending private message in Supabase:", err);
    }
  };

  // SEND CLUB GROUP MESSAGE
  const handleSendClubMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !activeClubChat) return;

    const sender = currentUser;
    const newMessage = {
      id: "msg_" + Date.now(),
      clubId: activeClubChat.id,
      senderId: sender.id,
      senderName: sender.nickname,
      senderPic: sender.profilePic,
      senderAge: sender.age,
      type: "text" as any,
      content: messageText.trim(),
      createdAt: new Date().toISOString()
    };

    const updatedClubMessages = [...(activeClubChat.chatMessages || []), newMessage];
    
    activeClubChat.chatMessages = updatedClubMessages;
    setActiveClubChat({ ...activeClubChat });
    setMessageText("");
  };

  // BLOCK USER SAFETY ACTION
  const handleBlockUser = (chat: Chat) => {
    if (confirm("¿Estás seguro de que deseas bloquear a este usuario de por vida? No volverá a aparecer en tu feed ni chats.")) {
      onUpdateChats(chats.filter(c => c.id !== chat.id));
      setActiveChat(null);
      alert("Usuario bloqueado con éxito. IMEA agradece tu aporte.");
    }
  };

  // CLEAR HISTORY SAFETY ACTION
  const handleClearHistory = (chat: Chat) => {
    const updated = chats.map(c => {
      if (c.id === chat.id) {
        return {
          ...c,
          messages: [
            {
              id: "msg_init",
              senderId: "system",
              text: "Historial de conversación vaciado por el usuario de forma segura.",
              type: "text" as any,
              createdAt: new Date().toISOString()
            }
          ]
        };
      }
      return c;
    });
    onUpdateChats(updated);
    setActiveChat(updated.find(c => c.id === chat.id) || null);
  };

  return (
    <div className="space-y-6" id="chats-and-channels-view">
      
      {/* 1. SECTOR TAB NAVIGATION */}
      {!activeChat && !activeClubChat && (
        <>
          <div className="flex bg-slate-950 p-1.5 rounded-xl border border-slate-900" id="chats-tab-selector">
            <button
              onClick={() => setActiveTab("chats")}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === "chats" ? "bg-slate-900 text-white shadow" : "text-slate-500 hover:text-slate-400"
              }`}
            >
              Chats ({myChats.length})
            </button>
            <button
              onClick={() => setActiveTab("requests")}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all relative ${
                activeTab === "requests" ? "bg-slate-900 text-white shadow" : "text-slate-500 hover:text-slate-400"
              }`}
              id="tab-requests"
            >
              Solicitudes
              {myRequests.length > 0 && (
                <span className="absolute top-1 right-2 w-2.5 h-2.5 bg-fuchsia-600 rounded-full animate-ping" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("clubs")}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === "clubs" ? "bg-slate-900 text-white shadow" : "text-slate-500 hover:text-slate-400"
              }`}
            >
              Clubs ({myClubs.length})
            </button>
          </div>

          {/* LISTS BODIES */}
          <div className="space-y-4" id="chats-tab-content">
            
            {/* TAB CHATS LIST */}
            {activeTab === "chats" && (
              <div className="space-y-3">
                {myChats.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 space-y-2">
                    <MessageSquare size={36} className="mx-auto text-slate-700" />
                    <p className="text-xs font-semibold">Aún no tienes chats activos</p>
                    <p className="text-[10px] text-slate-600">Dirígete a la pestaña de Descubre para encontrar personas de tu edad.</p>
                  </div>
                ) : (
                  myChats.map(c => {
                    const peerId = c.user1Id === currentUser.id ? c.user2Id : c.user1Id;
                    const peer = allUsers.find(u => u.id === peerId);
                    const lastMsg = c.messages[c.messages.length - 1];

                    return (
                      <button
                        key={c.id}
                        onClick={() => setActiveChat(c)}
                        className="w-full p-4 bg-slate-900 hover:bg-slate-800/60 rounded-2xl border border-slate-800/80 flex justify-between items-center transition text-left"
                      >
                        <div className="flex items-center gap-3 truncate">
                          <img src={peer?.profilePic} alt={peer?.nickname} className="w-11 h-11 rounded-full object-cover border-2 border-slate-800 flex-shrink-0" />
                          <div className="truncate">
                            <span className="font-bold text-sm block">{peer?.nickname}</span>
                            <p className="text-xs text-slate-500 truncate mt-0.5">{lastMsg?.text || "Conversación iniciada..."}</p>
                          </div>
                        </div>

                        <span className="text-[9px] text-slate-500 font-mono flex-shrink-0">
                          {lastMsg ? new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            )}

            {/* TAB REQUESTS LIST */}
            {activeTab === "requests" && (
              <div className="space-y-3">
                {myRequests.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-12">No tienes solicitudes pendientes por el momento 🛡️</p>
                ) : (
                  myRequests.map(req => {
                    const sender = allUsers.find(u => u.id === req.senderId);
                    const isSenderAdult = sender?.isAdult || false;

                    return (
                      <div
                        key={req.id}
                        className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 shadow-xl"
                        id={`request-card-${req.id}`}
                      >
                        <div className="flex items-center gap-3">
                          <img src={sender?.profilePic} alt="sender" className="w-10 h-10 rounded-full object-cover border-2 border-fuchsia-500/20" />
                          <div>
                            <span className="font-bold text-sm text-white block">{sender?.nickname}</span>
                            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                              isSenderAdult ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                            }`}>
                              {isSenderAdult ? `Adulto (${sender?.age} años)` : `Menor (${sender?.age} años)`}
                            </span>
                          </div>
                        </div>

                        {/* HIGH SPECIFIC REQUIREMENT WARNING BLOCK */}
                        {(!currentUser.isAdult && isSenderAdult) && (
                          <div className="p-3.5 bg-red-950/20 border border-red-500/30 rounded-xl space-y-2" id="request-adult-warning-block">
                            <div className="flex items-center gap-2 text-red-400 font-bold text-xs">
                              <ShieldAlert size={16} />
                              <span>Advertencia de Seguridad IMEA</span>
                            </div>
                            <p className="text-[11px] text-slate-300 leading-relaxed">
                              {currentUser.nickname}, {sender?.nickname} te ha enviado una solicitud de chat, tiene {sender?.age} años. Recuerda que es un adulto y debes de tener cuidado, te aconsejamos que salgas o que no aceptes.
                            </p>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDeclineRequest(req.id)}
                            className="flex-1 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-slate-400"
                            id={`btn-decline-req-${req.id}`}
                          >
                            Declinar / Salir
                          </button>
                          <button
                            onClick={() => handleStartAcceptRequest(req)}
                            className="flex-1 py-2.5 bg-gradient-to-tr from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-purple-950/20"
                            id={`btn-accept-req-${req.id}`}
                          >
                            Aceptar Conversación
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* TAB CLUBS LIST */}
            {activeTab === "clubs" && (
              <div className="space-y-3">
                {myClubs.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 space-y-2">
                    <p className="text-xs font-semibold">No perteneces a ningún Club aún</p>
                    <p className="text-[10px] text-slate-600">Crea o únete a un Club en la sección de Clubs para tener canales grupales.</p>
                  </div>
                ) : (
                  myClubs.map(club => (
                    <button
                      key={club.id}
                      onClick={() => setActiveClubChat(club)}
                      className="w-full p-4 bg-slate-900 hover:bg-slate-800/60 rounded-2xl border border-slate-800 flex justify-between items-center text-left"
                    >
                      <div className="flex items-center gap-3">
                        <img src={club.profileImage} alt={club.name} className="w-11 h-11 rounded-full object-cover border-2 border-slate-800" />
                        <div>
                          <span className="font-bold text-sm block text-white">{club.name}</span>
                          <p className="text-xs text-slate-500 truncate max-w-xs mt-0.5">💬 Grupo de Club: {club.members.length} miembros</p>
                        </div>
                      </div>
                      <ArrowRightIcon />
                    </button>
                  ))
                )}
              </div>
            )}

          </div>
        </>
      )}

      {/* 2. CHAT REQUESTS SECURITY PIN AUTHORIZATION MODAL FOR MINORS */}
      <AnimatePresence>
        {requestToAuthorize && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-2xl"
              id="pin-auth-modal"
            >
              <div className="text-center space-y-2">
                <Lock className="mx-auto text-purple-400 animate-pulse" size={32} />
                <h4 className="font-extrabold text-white text-base">Código de Autorización Parental / IMEA</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Has decidido conversar con un adulto siendo menor de edad. Ingresa el PIN de 4 dígitos proporcionado para continuar con absoluta seguridad.
                </p>
                <p className="text-[10px] text-purple-400 font-bold bg-purple-950/40 py-1.5 rounded-lg">
                  💡 Simula ingresando el código de seguridad: <span className="font-black underline text-sm">1234</span>
                </p>
              </div>

              <div className="space-y-3">
                <input
                  type="password"
                  placeholder="PIN de 4 dígitos"
                  maxLength={4}
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ""))}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-center text-lg font-black tracking-widest focus:outline-none focus:border-purple-500 text-white placeholder:text-slate-700"
                  id="pin-auth-input"
                />

                {pinError && (
                  <p className="text-[11px] text-red-500 text-center font-semibold leading-relaxed">{pinError}</p>
                )}
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setRequestToAuthorize(null)}
                  className="flex-1 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-bold text-slate-400"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleVerifyPinAndAccept}
                  className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-500 rounded-lg text-xs font-bold text-white transition"
                  id="btn-confirm-pin"
                >
                  Autorizar Chat 👍
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. ACTIVE PRIVATE CHAT ROOM INTERFACE */}
      {activeChat && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden flex flex-col h-[520px]"
          id="active-chat-view"
        >
          {/* Chat Header */}
          {(() => {
            const peerId = activeChat.user1Id === currentUser.id ? activeChat.user2Id : activeChat.user1Id;
            const peer = allUsers.find(u => u.id === peerId);

            return (
              <div className="p-3 border-b border-slate-800 bg-slate-950/40 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => {
                      if (peer) onSelectUserForProfile(peer);
                    }}
                    className="w-9 h-9 rounded-full overflow-hidden border border-slate-800 hover:border-purple-500 transition-all"
                  >
                    <img 
                      src={peer?.profilePic} 
                      alt="Avatar" 
                      className="w-full h-full object-cover" 
                    />
                  </button>
                  <div>
                    <span className="font-bold text-sm text-white block">
                      {peer?.nickname}
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono uppercase tracking-wider block">Conversación Protegida</span>
                  </div>
                </div>

                {/* Menu Actions */}
                <div className="flex gap-1.5">
                  <button
                    onClick={() => handleClearHistory(activeChat)}
                    className="p-2 text-slate-500 hover:text-white rounded-lg hover:bg-slate-800 transition"
                    title="Limpiar chat"
                  >
                    <Trash2 size={15} />
                  </button>
                  <button
                    onClick={() => handleBlockUser(activeChat)}
                    className="p-2 text-red-500 hover:text-red-400 rounded-lg hover:bg-slate-800 transition"
                    title="Bloquear usuario"
                    id="btn-block-user"
                  >
                    <UserX size={15} />
                  </button>
                  <button
                    onClick={() => setActiveChat(null)}
                    className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs font-bold text-slate-400 hover:text-white"
                  >
                    Atrás
                  </button>
                </div>
              </div>
            );
          })()}

          {/* Messages Listing */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4" id="chat-messages-scroll">
            {activeChat.messages.map((msg, idx) => {
              const isMe = msg.senderId === currentUser.id;
              const isSystem = msg.senderId === "system";

              if (isSystem) {
                return (
                  <div key={idx} className="flex justify-center">
                    <span className="bg-slate-950 text-slate-500 px-3 py-1.5 rounded-xl text-[10px] text-center border border-slate-900 leading-relaxed max-w-xs">
                      {msg.text}
                    </span>
                  </div>
                );
              }

              const sender = allUsers.find(u => u.id === msg.senderId);

              return (
                <div key={idx} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div className={`p-3 rounded-2xl text-xs max-w-[80%] leading-relaxed ${
                    isMe ? "bg-purple-600 text-white rounded-tr-none" : "bg-slate-950 border border-slate-800 text-slate-300 rounded-tl-none"
                  }`}>
                    {!isMe && (
                      <span className="text-[9px] font-bold text-purple-400 block mb-0.5">{sender?.nickname}</span>
                    )}
                    <p>{msg.text}</p>
                    <span className="text-[8px] text-slate-500 font-mono block text-right mt-1">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Messages Footer Form */}
          <form onSubmit={handleSendPrivateMessage} className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2">
            <input
              type="text"
              placeholder="Escribe un mensaje de forma respetuosa..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="flex-1 px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
              id="chat-message-input"
            />
            <button
              type="submit"
              disabled={!messageText.trim()}
              className="p-3 bg-purple-600 hover:bg-purple-500 rounded-xl text-white transition disabled:bg-slate-800 disabled:text-slate-600"
              id="btn-send-chat"
            >
              <Send size={15} />
            </button>
          </form>
        </motion.div>
      )}

      {/* 4. ACTIVE CLUB GROUP CHAT ROOM INTERFACE */}
      {activeClubChat && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col h-[520px]"
          id="club-group-chat-room"
        >
          {/* Header */}
          <div className="p-3 border-b border-slate-800 bg-slate-950/40 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <img src={activeClubChat.profileImage} alt="club" className="w-9 h-9 rounded-full object-cover" />
              <div>
                <span className="font-bold text-sm text-white block">Sala: {activeClubChat.name}</span>
                <p className="text-[9px] text-slate-500 font-mono font-bold uppercase tracking-wider block">Conversación grupal ({activeClubChat.category})</p>
              </div>
            </div>

            <button
              onClick={() => setActiveClubChat(null)}
              className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
            >
              Atrás
            </button>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4" id="club-group-scroll">
            <div className="flex justify-center">
              <span className="bg-purple-950/10 text-purple-400 px-3 py-1.5 rounded-xl text-[10px] text-center border border-purple-900/20 max-w-xs">
                🎨 Has ingresado al chat grupal de {activeClubChat.name}. Comparte tus ideas con todos los miembros.
              </span>
            </div>

            {(activeClubChat.chatMessages || []).map((msg, idx) => {
              const isMe = msg.senderId === currentUser.id;
              return (
                <div key={idx} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div className={`p-3 rounded-2xl text-xs max-w-[80%] leading-relaxed ${
                    isMe ? "bg-purple-600 text-white rounded-tr-none" : "bg-slate-950 border border-slate-800 text-slate-300 rounded-tl-none"
                  }`}>
                    {!isMe && (
                      <span className="text-[9px] font-black text-fuchsia-400 block mb-0.5">{msg.senderName}</span>
                    )}
                    <p>{msg.content}</p>
                    <span className="text-[8px] text-slate-500 font-mono block text-right mt-1">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Message Input Footer */}
          <form onSubmit={handleSendClubMessage} className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2">
            <input
              type="text"
              placeholder={`Enviar mensaje grupal a ${activeClubChat.name}...`}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="flex-1 px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
            />
            <button
              type="submit"
              disabled={!messageText.trim()}
              className="p-3 bg-purple-600 rounded-xl text-white"
            >
              <Send size={15} />
            </button>
          </form>
        </motion.div>
      )}

    </div>
  );
}

// Simple icons helpers
function ArrowRightIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right text-slate-600"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
  );
}
