import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { User, Club } from "../types";
import { Users, Plus, ShieldAlert, ArrowRight, Eye, Tag, Trash2, Heart, PlusCircle } from "lucide-react";

interface ClubsListProps {
  currentUser: User;
  allUsers: User[];
  clubs: Club[];
  onUpdateClubs: (updatedClubs: Club[]) => void;
  onTriggerNotification: (title: string, content: string, type: "system" | "like" | "comment" | "follow" | "chat_request" | "club_request") => void;
  onSelectUserForProfile: (user: User) => void;
}

export default function ClubsList({
  currentUser, allUsers, clubs, onUpdateClubs, onTriggerNotification, onSelectUserForProfile
}: ClubsListProps) {
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [clubName, setClubName] = useState("");
  const [clubDesc, setClubDesc] = useState("");
  const [clubPrivacy, setClubPrivacy] = useState<"public" | "private">("public");
  const [is18Plus, setIs18Plus] = useState(false);
  const [clubTags, setClubTags] = useState("");
  const [selectedClubForDetails, setSelectedClubForDetails] = useState<Club | null>(null);

  // Filter available clubs depending on age rules
  const visibleClubs = clubs.filter(c => {
    // Minors can NOT see +18 clubs
    if (!currentUser.isAdult && c.is18Plus) return false;
    return true;
  });

  // CREATE CLUB LOGIC
  const handleCreateClub = () => {
    if (!clubName.trim()) return;

    if (!currentUser.isAdult && is18Plus) {
      alert("🚨 Alerta IMEA: No puedes crear clubs orientados únicamente a adultos (+18) siendo menor de edad.");
      return;
    }

    const tagsArr = clubTags
      .split(",")
      .map(t => t.trim().toLowerCase())
      .filter(t => t.length > 0);

    const newClub: Club = {
      id: "club_" + Date.now(),
      name: clubName.trim(),
      description: clubDesc.trim(),
      coverImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80",
      profileImage: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=300&auto=format&fit=crop&q=80",
      tags: tagsArr,
      is18Plus: is18Plus,
      privacy: clubPrivacy,
      creatorId: currentUser.id,
      admins: [currentUser.id],
      members: [currentUser.id],
      pendingRequests: [],
      chatMessages: [
        {
          id: "init",
          clubId: "club_" + Date.now(),
          senderId: "system",
          senderName: "IMEA Security",
          senderPic: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=300&auto=format&fit=crop&q=80",
          senderAge: 18,
          type: "text",
          content: `🎉 ¡Bienvenido al Club ${clubName}! Este canal grupal es seguro y monitoreado para todo público.`,
          createdAt: new Date().toISOString()
        }
      ],
      allowAllToMessage: true,
      allowMedia: true,
      allowStickers: true,
      allowVoiceNotes: true,
      allowVideos30s: true,
      bannedWords: [],
      reports: [],
      inviteLink: `https://zapp.io/join/club_${Date.now()}`
    };

    onUpdateClubs([newClub, ...clubs]);
    setShowCreateModal(false);
    resetForm();
    onTriggerNotification("🏆 Club Creado", `Has fundado el club "${clubName}" con éxito.`, "system");
  };

  const resetForm = () => {
    setClubName("");
    setClubDesc("");
    setClubTags("");
    setClubPrivacy("public");
    setIs18Plus(false);
  };

  // JOIN / LEAVE CLUB LOGIC
  const handleToggleJoinClub = (club: Club) => {
    const isMember = club.members.includes(currentUser.id);
    let updatedMembers: string[];

    if (isMember) {
      // Leave club
      updatedMembers = club.members.filter(id => id !== currentUser.id);
      onTriggerNotification("🚪 Club Abandonado", `Has salido del club "${club.name}".`, "system");
    } else {
      // Join club (check age barrier)
      if (club.is18Plus && !currentUser.isAdult) {
        alert("🔒 Acceso Denegado: Este club está marcado exclusivamente para adultos (+18). No cumples con el rango de edad.");
        return;
      }

      updatedMembers = [...club.members, currentUser.id];
      onTriggerNotification("🎉 Club Unido", `¡Bienvenido! Ahora eres miembro del club "${club.name}".`, "system");
    }

    const updatedClubs = clubs.map(c => {
      if (c.id === club.id) {
        return { ...c, members: updatedMembers };
      }
      return c;
    });

    onUpdateClubs(updatedClubs);
    
    // Update active details if open
    if (selectedClubForDetails?.id === club.id) {
      setSelectedClubForDetails({ ...club, members: updatedMembers });
    }
  };

  return (
    <div className="space-y-6" id="clubs-main-panel">
      
      {/* Create club hero button */}
      <div className="p-4 bg-gradient-to-r from-purple-900 to-indigo-950/40 rounded-2xl border border-purple-800/20 flex justify-between items-center" id="create-club-banner">
        <div className="flex items-center gap-3">
          <Users className="text-purple-400 animate-pulse" size={24} />
          <div>
            <h4 className="text-sm font-bold text-white">Comunidades y Clubs de Interés</h4>
            <p className="text-[11px] text-slate-400">Crea tu propio nido de intereses, seguro y respetuoso.</p>
          </div>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="p-3 bg-purple-600 hover:bg-purple-500 rounded-xl text-white font-bold text-xs transition flex items-center gap-1.5"
          id="btn-trigger-create-club"
        >
          <Plus size={16} /> Fundar Club
        </button>
      </div>

      {/* Clubs feed grid */}
      <div className="grid grid-cols-2 gap-3" id="visible-clubs-grid">
        {visibleClubs.map(club => {
          return (
            <div
              key={club.id}
              className="bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between h-[190px]"
              id={`club-card-${club.id}`}
            >
              {/* Cover banner */}
              <div className="h-12 bg-cover bg-center relative" style={{ backgroundImage: `url(${club.coverImage})` }}>
                <div className="absolute inset-0 bg-black/40" />
                <span className="absolute top-2 right-2 px-1.5 py-0.5 bg-black/70 rounded text-[8px] font-bold text-purple-400 uppercase tracking-wider">
                  {club.is18Plus ? "+18" : club.privacy === "private" ? "Privado" : "Público"}
                </span>
              </div>

              {/* Club Info body */}
              <div className="p-3 flex-1 space-y-1 relative">
                <img src={club.profileImage} alt="club-pic" className="w-10 h-10 rounded-full border-2 border-slate-900 object-cover absolute -top-5 left-3 shadow-lg" />
                
                <div className="pt-5">
                  <h5 className="font-extrabold text-xs text-white truncate">{club.name}</h5>
                  <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">{club.description}</p>
                </div>
              </div>

              {/* Footer actions */}
              <div className="p-3 border-t border-slate-950 bg-slate-950/20 flex justify-between items-center">
                <span className="text-[10px] text-slate-500 font-bold">{club.members.length} miembros</span>
                <button
                  onClick={() => setSelectedClubForDetails(club)}
                  className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-[10px] font-semibold text-slate-300 hover:text-white"
                  id={`btn-view-club-${club.id}`}
                >
                  Detalles
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* CLUB CREATION MODAL */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[500px]"
              id="create-club-modal"
            >
              {/* Header */}
              <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                <span className="font-bold text-sm text-white flex items-center gap-2">
                  <PlusCircle size={16} className="text-purple-400" />
                  <span>Fundar nuevo Club</span>
                </span>
                <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white font-bold">✕</button>
              </div>

              {/* Body Form */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                
                {/* Name */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Nombre del Club</span>
                  <input
                    type="text"
                    placeholder="ej: Amantes del K-Pop, Programadores Libres"
                    value={clubName}
                    onChange={(e) => setClubName(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
                    id="club-name-input"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Descripción de Objetivos</span>
                  <textarea
                    placeholder="Cuéntale a todos cuál es el propósito y las reglas de este Club..."
                    value={clubDesc}
                    onChange={(e) => setClubDesc(e.target.value)}
                    rows={3}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>

                {/* Privacy Rule */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Ajustes de Privacidad</span>
                  <select
                    value={clubPrivacy}
                    onChange={(e) => setClubPrivacy(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  >
                    <option value="public">Público (Cualquiera puede entrar)</option>
                    <option value="private">Privado (Solo por invitación)</option>
                  </select>
                </div>

                {/* 18Plus Rule */}
                {currentUser.isAdult && (
                  <div className="flex items-center gap-2 p-3 bg-slate-950 border border-slate-800/80 rounded-xl">
                    <input
                      type="checkbox"
                      id="is18Plus"
                      checked={is18Plus}
                      onChange={(e) => setIs18Plus(e.target.checked)}
                      className="w-4 h-4 rounded text-purple-600 bg-slate-900 border-slate-800 focus:ring-purple-500"
                    />
                    <label htmlFor="is18Plus" className="text-xs text-slate-300 font-semibold cursor-pointer select-none">
                      Marcar este Club como Exclusivo Adultos (+18) 🔒
                    </label>
                  </div>
                )}

                {/* Tags */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Etiquetas (separadas por coma)</span>
                  <input
                    type="text"
                    placeholder="ej: kpop, anime, indie"
                    value={clubTags}
                    onChange={(e) => setClubTags(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>

              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex justify-end gap-2.5">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold transition text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  disabled={!clubName.trim()}
                  onClick={handleCreateClub}
                  className="px-5 py-2 bg-gradient-to-tr from-purple-600 to-indigo-600 text-white rounded-xl text-xs font-bold transition shadow-lg"
                  id="btn-publish-club"
                >
                  Fundar Club 🚀
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CLUB DETAILS SHEET DIALOG */}
      <AnimatePresence>
        {selectedClubForDetails && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl"
              id="club-details-modal"
            >
              {/* Cover */}
              <div className="h-28 bg-cover bg-center relative" style={{ backgroundImage: `url(${selectedClubForDetails.coverImage})` }}>
                <div className="absolute inset-0 bg-black/60" />
                <button
                  onClick={() => setSelectedClubForDetails(null)}
                  className="absolute top-3 right-3 text-white/80 hover:text-white font-bold p-1 bg-black/40 rounded-full text-xs"
                >
                  ✕
                </button>
              </div>

              {/* Info content */}
              <div className="p-5 space-y-4 relative">
                <img src={selectedClubForDetails.profileImage} alt="pic" className="w-16 h-16 rounded-full border-4 border-slate-900 object-cover absolute -top-10 left-5 shadow-2xl" />
                
                <div className="pt-6 space-y-1">
                  <h4 className="text-sm font-black text-white">{selectedClubForDetails.name}</h4>
                  <div className="flex gap-2 text-[10px] font-mono text-purple-400">
                    <span>{selectedClubForDetails.is18Plus ? "Adultos (+18)" : "Todo Público"}</span>
                    <span>•</span>
                    <span>{selectedClubForDetails.members.length} miembros</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{selectedClubForDetails.description}</p>

                {/* Tags */}
                {selectedClubForDetails.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {selectedClubForDetails.tags.map(t => (
                      <span key={t} className="px-2 py-0.5 bg-slate-950 border border-slate-800/80 text-[10px] font-bold text-slate-400 rounded">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}

                {/* Join action */}
                <div className="pt-2 border-t border-slate-800/60 flex gap-2">
                  <button
                    onClick={() => handleToggleJoinClub(selectedClubForDetails)}
                    className={`flex-1 py-3 text-xs font-bold rounded-xl transition ${
                      selectedClubForDetails.members.includes(currentUser.id)
                        ? "bg-slate-950 border border-slate-800 text-slate-400 hover:bg-slate-900"
                        : "bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-950/20"
                    }`}
                    id="btn-toggle-join-club"
                  >
                    {selectedClubForDetails.members.includes(currentUser.id) ? "Abandonar Club" : "Unirme al Club 👍"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
