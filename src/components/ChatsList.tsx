import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { User, Chat, ChatRequest, ChatMessage } from "../types";
import { getSupabase } from "../lib/supabase";
import { 
  Search, MessageSquare, Heart, Clock, Check, X, Send, MoreVertical, 
  Shield, ShieldAlert, Image as ImageIcon, Mic, LogOut, ArrowLeft, Trash2, Ban
} from "lucide-react";

interface ChatsListProps {
  currentUser: User;
  chats: Chat[];
  chatRequests: ChatRequest[];
  allUsers: User[];
  onUpdateChats: (updatedChats: Chat[]) => void;
  onUpdateRequests: (updatedRequests: ChatRequest[]) => void;
  onTriggerNotification: (title: string, content: string, type: string) => void;
}

export default function ChatsList({ 
  currentUser, chats, chatRequests, allUsers, onUpdateChats, onUpdateRequests, onTriggerNotification 
}: ChatsListProps) {
  
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [showRequests, setShowRequests] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(false);

  const activeChat = chats.find(c => c.id === activeChatId);
  const chatPartnerId = activeChat ? (activeChat.user1Id === currentUser.id ? activeChat.user2Id : activeChat.user1Id) : null;
  const chatPartner = chatPartnerId ? allUsers.find(u => u.id === chatPartnerId) : null;

  const myRequests = chatRequests.filter(r => r.receiverId === currentUser.id && r.status === 'pending');

  const handleAcceptRequest = async (req: ChatRequest) => {
    setLoading(true);
    const newChat: Chat = {
      id: "chat_" + Date.now(),
      user1Id: req.senderId,
      user2Id: req.receiverId,
      messages: [],
      isConfessed: false,
      relationshipPublished: "none"
    };

    try {
      await getSupabase().from("chat_requests").update({ status: 'accepted' }).eq("id", req.id);
      await getSupabase().from("chats").insert([newChat]);
      
      onUpdateRequests(chatRequests.map(r => r.id === req.id ? { ...r, status: 'accepted' } : r));
      onUpdateChats([newChat, ...chats]);
      onTriggerNotification("✅ Solicitud Aceptada", `Ahora puedes hablar con ${req.senderName}`, "system");
    } catch (err) {
      console.error("Error accepting request:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !activeChat) return;

    const newMsg: ChatMessage = {
      id: "msg_" + Date.now(),
      senderId: currentUser.id,
      senderName: currentUser.nickname,
      senderPic: currentUser.profilePic,
      senderAge: currentUser.age,
      type: "text",
      content: messageText.trim(),
      createdAt: new Date().toISOString()
    };

    const updatedChat = { ...activeChat, messages: [...activeChat.messages, newMsg] };
    
    try {
      await getSupabase().from("chats").update({ messages: updatedChat.messages }).eq("id", activeChat.id);
      onUpdateChats(chats.map(c => c.id === activeChat.id ? updatedChat : c));
      setMessageText("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 pb-20">
      
      <AnimatePresence mode="wait">
        {!activeChatId ? (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col p-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-black italic tracking-tighter text-white">CHATS</h2>
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowRequests(!showRequests)}
                  className="relative p-3 bg-white/5 rounded-2xl text-white hover:bg-white/10 transition-colors"
                >
                  <MessageSquare size={24} />
                  {myRequests.length > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center text-[10px] font-black border-2 border-slate-950">
                      {myRequests.length}
                    </div>
                  )}
                </button>
              </div>
            </div>

            {showRequests && (
              <div className="mb-8 space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 px-2">Solicitudes Pendientes</h4>
                {myRequests.length === 0 ? (
                  <p className="text-[10px] text-white/20 italic px-2">No hay solicitudes nuevas.</p>
                ) : (
                  myRequests.map(req => (
                    <div key={req.id} className="bg-purple-600/10 border border-purple-500/20 rounded-[32px] p-6 flex flex-col gap-4">
                      <div className="flex items-center gap-4">
                        <img src={req.senderPic} className="w-12 h-12 rounded-2xl object-cover border-2 border-purple-500/20" />
                        <div className="flex-1">
                          <h4 className="text-sm font-black text-white italic">{req.senderName}</h4>
                          <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest">{req.senderAge} años • {req.reason.replace('_', ' ')}</p>
                        </div>
                      </div>
                      <p className="text-xs text-white/60 font-medium italic">"{req.reasonText}"</p>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleAcceptRequest(req)}
                          className="flex-1 py-3 bg-white text-black rounded-full text-[10px] font-black uppercase tracking-widest"
                        >
                          Aceptar
                        </button>
                        <button className="px-6 py-3 bg-white/5 text-white/40 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/5">Ignorar</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            <div className="space-y-4">
              {chats.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-20 opacity-40">
                  <Heart size={64} className="mb-4" />
                  <p className="text-sm font-black uppercase tracking-[0.2em]">Todavía no tienes conversaciones. <br/>Explora para conectar.</p>
                </div>
              ) : (
                chats.map(chat => {
                  const partnerId = chat.user1Id === currentUser.id ? chat.user2Id : chat.user1Id;
                  const partner = allUsers.find(u => u.id === partnerId);
                  const lastMsg = chat.messages[chat.messages.length - 1];
                  
                  return partner ? (
                    <div 
                      key={chat.id} 
                      onClick={() => setActiveChatId(chat.id)}
                      className="bg-slate-900/40 rounded-[32px] p-5 flex items-center gap-4 border border-white/5 hover:bg-slate-900/60 transition-all cursor-pointer group"
                    >
                      <img src={partner.profilePic} className="w-14 h-14 rounded-[20px] object-cover border-2 border-white/10 group-hover:border-purple-500/20" />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="text-sm font-black text-white italic truncate">{partner.nickname}</h4>
                          <span className="text-[8px] font-bold text-white/20 uppercase">12:45 PM</span>
                        </div>
                        <p className="text-xs text-white/40 truncate font-medium">{lastMsg ? lastMsg.content : "Inicia la conversación..."}</p>
                      </div>
                      {chat.isConfessed && <Heart size={16} className="text-red-500 fill-red-500" />}
                    </div>
                  ) : null;
                })
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div key="active" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex-1 flex flex-col h-full">
            {/* Chat Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-slate-950/80 backdrop-blur-xl sticky top-0 z-20">
              <div className="flex items-center gap-4">
                <button onClick={() => setActiveChatId(null)} className="p-2 bg-white/5 rounded-full"><ArrowLeft size={18}/></button>
                <div className="flex items-center gap-3">
                  <img src={chatPartner?.profilePic} className="w-10 h-10 rounded-xl object-cover border border-white/10" />
                  <div>
                    <h3 className="text-sm font-black text-white italic leading-tight">{chatPartner?.nickname}</h3>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                      <p className="text-[8px] text-white/40 font-bold uppercase tracking-widest">En línea</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 text-white/40 hover:text-white"><ShieldAlert size={20}/></button>
                <button className="p-2 text-white/40 hover:text-white"><MoreVertical size={20}/></button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">
              <div className="flex justify-center">
                <div className="px-4 py-1.5 bg-white/5 rounded-full text-[8px] font-black uppercase tracking-widest text-white/20 border border-white/5">
                  Protocolo NEXUS Activo • Encriptación Alpha-Secure
                </div>
              </div>
              
              {activeChat?.messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-3 ${msg.senderId === currentUser.id ? 'flex-row-reverse' : ''}`}>
                  <div className={`max-w-[80%] space-y-1 ${msg.senderId === currentUser.id ? 'items-end' : ''}`}>
                    <div className={`p-4 rounded-3xl text-sm font-medium ${msg.senderId === currentUser.id ? 'bg-white text-black rounded-tr-none' : 'bg-white/5 text-white/80 rounded-tl-none border border-white/5'}`}>
                      {msg.content}
                    </div>
                    <span className="text-[8px] font-bold text-white/20 uppercase px-1">12:45</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Bar */}
            <div className="p-6 bg-slate-950 border-t border-white/5 sticky bottom-0">
              <div className="flex items-center gap-3 bg-white/5 p-2 rounded-full border border-white/10 focus-within:border-white/20 transition-all">
                <div className="flex gap-1 ml-2">
                  <button className="p-2 text-white/40 hover:text-white"><ImageIcon size={18}/></button>
                  <button className="p-2 text-white/40 hover:text-white"><Mic size={18}/></button>
                </div>
                <input 
                  type="text" 
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Escribe un mensaje..."
                  className="flex-1 bg-transparent text-white text-xs outline-none font-medium px-2"
                />
                <button onClick={handleSendMessage} className="p-3 bg-white text-black rounded-full shadow-lg active:scale-95 transition-all"><Send size={16}/></button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
