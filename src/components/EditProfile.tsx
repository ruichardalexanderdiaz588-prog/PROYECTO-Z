import React, { useState } from "react";
import { User } from "../types";
import { getSupabase } from "../lib/supabase";
import { Save, X, Camera, User as UserIcon, Heart, Calendar } from "lucide-react";

interface EditProfileProps {
  currentUser: User;
  onUpdate: (updatedUser: User) => void;
  onClose: () => void;
}

export default function EditProfile({ currentUser, onUpdate, onClose }: EditProfileProps) {
  const [nickname, setNickname] = useState(currentUser.nickname);
  const [bio, setBio] = useState(currentUser.bio || "");
  const [genderIdentity, setGenderIdentity] = useState(currentUser.genderIdentity);
  const [orientation, setOrientation] = useState(currentUser.orientation);
  const [orientationIsPublic, setOrientationIsPublic] = useState(currentUser.orientationIsPublic);
  const [hobbies, setHobbies] = useState<string[]>(currentUser.hobbies);
  const [newHobby, setNewHobby] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const updatedData = {
        nickname,
        bio,
        genderIdentity,
        orientation,
        orientationIsPublic,
        hobbies
      };

      const { error } = await getSupabase()
        .from("users")
        .update(updatedData)
        .eq("id", currentUser.id);

      if (error) throw error;

      onUpdate({ ...currentUser, ...updatedData });
      onClose();
    } catch (err) {
      console.error("Error updating profile in Supabase:", err);
      alert("Error al guardar los cambios.");
    } finally {
      setLoading(false);
    }
  };

  const addHobby = () => {
    if (newHobby.trim() && !hobbies.includes(newHobby.trim())) {
      setHobbies([...hobbies, newHobby.trim()]);
      setNewHobby("");
    }
  };

  const removeHobby = (hobby: string) => {
    setHobbies(hobbies.filter(h => h !== hobby));
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col p-4 md:p-8 overflow-y-auto">
      <div className="max-w-md mx-auto w-full space-y-6">
        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <UserIcon className="text-fuchsia-500" /> Completar Perfil
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="relative group cursor-pointer">
              <img src={currentUser.profilePic} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-slate-900 shadow-xl" />
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={24} className="text-white" />
              </div>
            </div>
            <p className="text-[10px] text-slate-500 font-bold uppercase">Foto de Perfil (Google)</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase text-slate-400">Apodo / Nickname</label>
            <input 
              type="text" 
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-fuchsia-500"
              placeholder="¿Cómo quieres que te llamen?"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase text-slate-400">Biografía</label>
            <textarea 
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-fuchsia-500"
              placeholder="Cuéntanos un poco sobre ti..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-slate-400">Identidad de Género</label>
              <select 
                value={genderIdentity}
                onChange={(e) => setGenderIdentity(e.target.value)}
                className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
              >
                <option value="Hombre">Hombre</option>
                <option value="Mujer">Mujer</option>
                <option value="No binario">No binario</option>
                <option value="Trans">Trans</option>
                <option value="Fluido">Fluido</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-slate-400">Orientación</label>
              <select 
                value={orientation}
                onChange={(e) => setOrientation(e.target.value)}
                className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
              >
                <option value="Heterosexual">Heterosexual</option>
                <option value="Gay">Gay</option>
                <option value="Bisexual">Bisexual</option>
                <option value="Lesbiana">Lesbiana</option>
                <option value="Pansexual">Pansexual</option>
                <option value="Asexual">Asexual</option>
                <option value="Queer">Queer</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-900 border border-slate-800 rounded-xl">
            <div className="space-y-0.5">
              <p className="text-[11px] font-bold text-white">¿Orientación pública?</p>
              <p className="text-[9px] text-slate-500">Si lo desactivas, solo aparecerá como 🔒 Privada</p>
            </div>
            <input 
              type="checkbox" 
              checked={orientationIsPublic}
              onChange={(e) => setOrientationIsPublic(e.target.checked)}
              className="w-4 h-4 rounded border-slate-800 text-fuchsia-600 focus:ring-fuchsia-600 bg-slate-950"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase text-slate-400">Intereses & Gustos</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={newHobby}
                onChange={(e) => setNewHobby(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addHobby()}
                className="flex-1 p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-fuchsia-500"
                placeholder="ej: Gaming, Arte, Música..."
              />
              <button 
                onClick={addHobby}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold text-slate-300"
              >
                Añadir
              </button>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              {hobbies.map(hobby => (
                <span 
                  key={hobby} 
                  className="px-3 py-1.5 bg-fuchsia-900/20 border border-fuchsia-500/30 rounded-lg text-[10px] font-bold text-fuchsia-400 flex items-center gap-2"
                >
                  {hobby}
                  <button onClick={() => removeHobby(hobby)} className="hover:text-white">✕</button>
                </span>
              ))}
            </div>
          </div>
        </div>

        <button 
          disabled={loading || !nickname.trim()}
          onClick={handleSave}
          className="w-full py-4 bg-gradient-to-tr from-fuchsia-600 via-purple-600 to-indigo-600 rounded-2xl text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-purple-950/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? "Guardando..." : <><Save size={18} /> Guardar Perfil</>}
        </button>
      </div>
    </div>
  );
}
