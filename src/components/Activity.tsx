import React from "react";
import { motion } from "motion/react";
import { User, AppNotification } from "../types";
import { 
  Bell, Heart, MessageSquare, UserPlus, Shield, Award, Sparkles, Clock, ArrowRight, Trash2
} from "lucide-react";

interface ActivityProps {
  currentUser: User;
  notifications: AppNotification[];
  onTriggerNotification: (title: string, content: string, type: string) => void;
}

export default function Activity({ currentUser, notifications, onTriggerNotification }: ActivityProps) {
  
  const getIcon = (type: string) => {
    switch (type) {
      case "system": return <Shield className="text-teal-400" size={18} />;
      case "like": return <Heart className="text-white" size={18} />;
      case "comment": return <MessageSquare className="text-white" size={18} />;
      case "follow": return <UserPlus className="text-white" size={18} />;
      case "chat_request": return <Sparkles className="text-teal-400" size={18} />;
      case "event": return <Award className="text-white" size={18} />;
      default: return <Bell size={18} />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 pb-20">
      <div className="p-6 flex items-center justify-between">
        <h2 className="text-3xl font-black italic tracking-tighter text-white">ACTIVIDAD</h2>
        <button className="p-3 bg-white/5 rounded-2xl text-white/40 hover:text-white transition-colors">
          <Trash2 size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-4">
        {/* System Status Card */}
        <div className="p-6 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 rounded-[40px] border border-white/5 space-y-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="text-white" size={24} />
              <h3 className="text-sm font-black italic text-white tracking-tighter uppercase">NEXUS GUARD</h3>
            </div>
            <div className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-[8px] font-black tracking-widest border border-green-500/20">PROTEGIDO</div>
          </div>
          <p className="text-xs text-white/60 font-medium leading-relaxed">
            Tu cuenta está operando bajo el protocolo de seguridad **ALPHA-7**. Todos tus datos están encriptados y monitoreados por IMEA.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-4 bg-black/20 rounded-3xl">
              <p className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-1">Reputación</p>
              <p className="text-xl font-black text-white italic">100%</p>
            </div>
            <div className="p-4 bg-black/20 rounded-3xl">
              <p className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-1">Nivel Nex</p>
              <p className="text-xl font-black text-white italic">LV 42</p>
            </div>
          </div>
        </div>

        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-40">
            <Clock size={64} />
            <p className="text-sm font-black uppercase tracking-[0.2em]">Todo tranquilo por aquí. <br/>Sigue conectando con NEXUS.</p>
          </div>
        ) : (
          notifications.map((notif, idx) => (
            <motion.div 
              key={notif.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-slate-900/40 rounded-[32px] p-5 flex items-center gap-4 border border-white/5 hover:bg-slate-900/60 transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5 shrink-0 group-hover:scale-110 transition-transform">
                {getIcon(notif.type)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-black text-white italic truncate tracking-tight">{notif.title}</h4>
                <p className="text-[10px] text-white/40 truncate font-medium mt-0.5">{notif.content}</p>
              </div>
              <ArrowRight className="text-white/10 group-hover:text-white/40 transition-colors" size={16} />
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
