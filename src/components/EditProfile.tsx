import React, { useState } from "react";
import { motion } from "motion/react";
import { User } from "../types";
import { getSupabase } from "../lib/supabase";
import { 
  X, Camera, Check, Shield, Lock, Eye, Trash2, ShieldAlert, Award, Star, Sparkles, User as UserIcon
} from "lucide-react";

interface EditProfileProps {
  currentUser: User;
  onUpdateUser: (updatedUser: User) => void;
  onClose: () => void;
}

export default function EditProfile({ currentUser, onUpdateUser, onClose }: EditProfileProps) {
  const [nickname, setNickname] = useState(currentUser.nickname);
  const [bio, setBio] = useState(currentUser.bio);
  const [profilePic, setProfilePic] = useState(currentUser.profilePic);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    const updatedUser = { 
      ...currentUser, 
      nickname, 
      bio, 
      profilePic 
    };

    try {
      await getSupabase().from("users").update({
        nickname,
        bio,
        profilePic
      }).eq("id", currentUser.id);
      
      onUpdateUser(updatedUser);
      onClose();
    } catch (err) {
      console.error("Error updating profile:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex flex-col p-6"
    >
      <div className="flex justify-between items-center mb-10">
        <button onClick={onClose} className="p-3 bg-white/5 rounded-full text-white"><X size={20}/></button>
        <h2 className="text-xl font-black italic tracking-tighter text-white">NEXUS PROTOCOL</h2>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="px-8 py-2 bg-white text-black rounded-full font-black text-xs uppercase tracking-widest disabled:opacity-50"
        >
          CONFIRMAR
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar space-y-10">
        {/* Profile Pic Section */}
        <div className="flex flex-col items-center gap-6">
          <div className="relative group cursor-pointer" onClick={() => setProfilePic(`https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`)}>
            <img src={profilePic} alt="Me" className="w-40 h-40 rounded-[60px] object-cover border-4 border-white/10 shadow-2xl group-hover:opacity-40 transition-opacity" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="text-white" size={32} />
            </div>
            <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-white rounded-3xl flex items-center justify-center shadow-2xl">
              <Sparkles className="text-black" size={20} />
            </div>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-black text-white italic">@{currentUser.username}</h3>
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1">ID NEXUS: {currentUser.id.slice(0, 8)}</p>
          </div>
        </div>

        {/* Inputs */}
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 px-2">Nombre Público</label>
            <input 
              type="text" 
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full bg-white/5 border border-white/10 p-5 rounded-3xl text-white font-black italic outline-none focus:border-white/20 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 px-2">Biografía</label>
            <textarea 
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Cuéntanos sobre ti..."
              className="w-full bg-white/5 border border-white/10 p-5 rounded-3xl text-white text-sm min-h-[120px] outline-none focus:border-white/20 transition-all"
            />
          </div>
        </div>

        {/* Badges / Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-6 bg-white/5 rounded-[40px] border border-white/5 text-center space-y-2">
             <Star className="mx-auto text-teal-400" size={24} />
             <div>
               <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">Reputación NEXUS</p>
               <p className="text-xl font-black text-white italic">{currentUser.points}</p>
             </div>
          </div>
          <div className="p-6 bg-white/5 rounded-[40px] border border-white/5 text-center space-y-2">
             <Award className="mx-auto text-white" size={24} />
             <div>
               <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">Estado Protocolo</p>
               <p className="text-xl font-black text-white italic">Alpha-Secure</p>
             </div>
          </div>
        </div>

        {/* DANGER AREA */}
        <div className="p-8 bg-red-600/10 border border-red-600/20 rounded-[40px] flex items-center justify-between">
          <div className="flex items-center gap-4">
             <ShieldAlert className="text-red-500" size={24} />
             <div className="text-left">
               <h4 className="text-[10px] font-black text-white uppercase tracking-widest">AUTODESTRUCCIÓN</h4>
               <p className="text-[8px] font-bold text-white/40">Desvincular nodo NEXUS permanentemente</p>
             </div>
          </div>
          <button className="p-3 bg-red-600/20 text-red-500 rounded-2xl"><Trash2 size={18}/></button>
        </div>
      </div>
    </motion.div>
  );
}
