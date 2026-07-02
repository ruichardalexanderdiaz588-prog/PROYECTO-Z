import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { User, Story, Note } from "../types";
import { Plus, X, Heart, Eye, Trash2, Palette, Sparkles, Smile } from "lucide-react";

interface StoriesAndNotesProps {
  currentUser: User;
  allUsers: User[];
  stories: Story[];
  notes: Note[];
  onUpdateStories: (updatedStories: Story[]) => void;
  onUpdateNotes: (updatedNotes: Note[]) => void;
  onTriggerNotification: (title: string, content: string, type: "system" | "like" | "comment" | "follow" | "chat_request" | "club_request") => void;
}

export default function StoriesAndNotes({
  currentUser, allUsers, stories, notes, onUpdateStories, onUpdateNotes, onTriggerNotification
}: StoriesAndNotesProps) {
  
  // Create story state
  const [showCreateStory, setShowCreateStory] = useState(false);
  const [storyImage, setStoryImage] = useState("https://images.unsplash.com/photo-1516280440614-37939bbacd6a?w=600&auto=format&fit=crop&q=80");
  const [storyText, setStoryText] = useState("");
  const [storyTextColor, setStoryTextColor] = useState("#ffffff");

  // Create note state
  const [showCreateNote, setShowCreateNote] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [noteBg, setNoteBg] = useState("bg-gradient-to-tr from-fuchsia-600 to-pink-600");

  // Story player states
  const [activeStoryUser, setActiveStoryUser] = useState<User | null>(null);
  const [playerStories, setPlayerStories] = useState<Story[]>([]);
  const [activeStoryIdx, setActiveStoryIdx] = useState(0);
  const [storyProgress, setStoryProgress] = useState(0);

  // Group stories by user for display in round avatar rows
  const groupedStories: { [userId: string]: Story[] } = {};
  stories.forEach(s => {
    if (!groupedStories[s.authorId]) {
      groupedStories[s.authorId] = [];
    }
    groupedStories[s.authorId].push(s);
  });

  const usersWithStories = Object.keys(groupedStories).map(userId => {
    return allUsers.find(u => u.id === userId) || allUsers[0];
  }).filter(Boolean);

  // Sample image options for story
  const sampleStoryImages = [
    "https://images.unsplash.com/photo-1516280440614-37939bbacd6a?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80"
  ];

  // Note skin options
  const noteSkins = [
    { label: "Pink Neon", bg: "bg-gradient-to-tr from-fuchsia-600 to-pink-600" },
    { label: "Cosmic Indigo", bg: "bg-gradient-to-tr from-purple-800 to-indigo-900" },
    { label: "Forest Emerald", bg: "bg-gradient-to-tr from-teal-600 to-emerald-700" },
    { label: "Retro Sunset", bg: "bg-gradient-to-tr from-orange-500 to-rose-600" },
    { label: "Classic Charcoal", bg: "bg-slate-900" }
  ];

  // Story Progress Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeStoryUser && playerStories.length > 0) {
      interval = setInterval(() => {
        setStoryProgress(prev => {
          if (prev >= 100) {
            // Move to next story
            if (activeStoryIdx < playerStories.length - 1) {
              setActiveStoryIdx(idx => idx + 1);
              return 0;
            } else {
              // End player
              setActiveStoryUser(null);
              return 0;
            }
          }
          return prev + 2; // Increment speed
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [activeStoryUser, activeStoryIdx, playerStories]);

  // Handle Play Stories for user
  const handlePlayStories = (user: User) => {
    const userS = groupedStories[user.id] || [];
    if (userS.length > 0) {
      setPlayerStories(userS);
      setActiveStoryIdx(0);
      setStoryProgress(0);
      setActiveStoryUser(user);
    }
  };

  // CREATE STORY
  const handleCreateStory = () => {
    if (!storyImage) return;

    const newS: Story = {
      id: "story_" + Date.now(),
      authorId: currentUser.id,
      authorName: currentUser.nickname,
      authorPic: currentUser.profilePic,
      mediaUrl: storyImage,
      textOverlay: storyText,
      createdAt: new Date().toISOString(),
      viewsCount: 0
    };

    onUpdateStories([newS, ...stories]);
    setShowCreateStory(false);
    setStoryText("");
    onTriggerNotification("🌟 Historia Publicada", "Tu historia de 24 horas estará visible para tus seguidores.", "system");
  };

  // CREATE NOTE
  const handleCreateNote = () => {
    if (!noteText.trim()) return;

    // Filter existing notes of current user
    const filteredNotes = notes.filter(n => n.authorId !== currentUser.id);

    const newN: Note = {
      id: "note_" + Date.now(),
      authorId: currentUser.id,
      authorName: currentUser.nickname,
      authorPic: currentUser.profilePic,
      text: noteText.trim().slice(0, 60),
      bgColor: noteBg,
      createdAt: new Date().toISOString()
    };

    onUpdateNotes([newN, ...filteredNotes]);
    setShowCreateNote(false);
    setNoteText("");
    onTriggerNotification("📝 Nota Actualizada", "Tu estado de perfil ha sido actualizado con éxito.", "system");
  };

  // DELETE NOTE
  const handleDeleteNote = (noteId: string) => {
    onUpdateNotes(notes.filter(n => n.id !== noteId));
  };

  return (
    <div className="space-y-6" id="stories-notes-widget">
      
      {/* STORIES ROW (ROUND GLOWING AVATARS) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400">Historias (24 horas)</span>
          <button 
            onClick={() => setShowCreateStory(true)}
            className="text-xs text-fuchsia-400 font-bold flex items-center gap-1 hover:underline"
            id="btn-add-story"
          >
            <Plus size={14} /> Añadir Historia
          </button>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-1 scrollbar-none items-center" id="stories-row-scroller">
          {/* Create Own Story Avatar */}
          <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
            <button 
              onClick={() => setShowCreateStory(true)}
              className="w-14 h-14 rounded-full bg-slate-900 border-2 border-dashed border-slate-700 hover:border-fuchsia-500 transition flex items-center justify-center relative overflow-hidden"
            >
              <img src={currentUser.profilePic} alt="User" className="absolute inset-0 w-full h-full object-cover opacity-40" />
              <Plus size={20} className="text-white z-10" />
            </button>
            <span className="text-[10px] text-slate-500 font-bold truncate max-w-[64px]">Mi historia</span>
          </div>

          {/* Users with stories */}
          {usersWithStories.map(user => (
            <div key={user.id} className="flex flex-col items-center gap-1.5 flex-shrink-0">
              <button 
                onClick={() => handlePlayStories(user)}
                className="w-14 h-14 rounded-full p-[3px] bg-gradient-to-tr from-fuchsia-600 via-purple-600 to-indigo-600 active:scale-95 transition-all"
                id={`btn-play-story-${user.id}`}
              >
                <div className="w-full h-full rounded-full border-2 border-slate-950 overflow-hidden bg-slate-900">
                  <img src={user.profilePic} alt={user.nickname} className="w-full h-full object-cover" />
                </div>
              </button>
              <span className="text-[10px] text-slate-300 font-bold truncate max-w-[64px]">{user.nickname}</span>
            </div>
          ))}
        </div>
      </div>

      {/* NOTES ROW (SMALL CARDS WITH TEXT ACCENTS) */}
      <div className="space-y-2 border-t border-slate-900 pt-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400">Notas de perfil (Estados)</span>
          <button 
            onClick={() => setShowCreateNote(true)}
            className="text-xs text-fuchsia-400 font-bold flex items-center gap-1 hover:underline"
            id="btn-add-note"
          >
            <Plus size={14} /> Nueva Nota
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3" id="notes-grid-scroller">
          {/* Own note */}
          {notes.find(n => n.authorId === currentUser.id) ? (
            notes.filter(n => n.authorId === currentUser.id).map(note => (
              <div 
                key={note.id} 
                className={`p-3 rounded-2xl ${note.bgColor} text-white flex flex-col justify-between h-24 shadow-lg border border-white/10 relative group`}
              >
                <button 
                  onClick={() => handleDeleteNote(note.id)}
                  className="absolute top-2 right-2 p-1 bg-black/40 hover:bg-black/60 rounded text-white opacity-0 group-hover:opacity-100 transition"
                  title="Eliminar Nota"
                >
                  <Trash2 size={11} />
                </button>

                <p className="text-xs font-semibold leading-relaxed line-clamp-3">"{note.text}"</p>
                
                <div className="flex items-center gap-1.5 pt-1 border-t border-white/10">
                  <img src={note.authorPic} alt="avatar" className="w-4 h-4 rounded-full object-cover" />
                  <span className="text-[9px] font-bold text-white/80">Tú</span>
                </div>
              </div>
            ))
          ) : (
            <button 
              onClick={() => setShowCreateNote(true)}
              className="p-3 bg-slate-900/50 hover:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-800 text-center flex flex-col items-center justify-center h-24 space-y-1 text-slate-500 transition-all"
            >
              <Palette size={18} />
              <span className="text-[10px] font-bold">Escribe un estado...</span>
            </button>
          )}

          {/* Other users notes */}
          {notes.filter(n => n.authorId !== currentUser.id).map(note => (
            <div 
              key={note.id} 
              className={`p-3 rounded-2xl ${note.bgColor} text-white flex flex-col justify-between h-24 shadow-lg border border-white/10`}
            >
              <p className="text-xs font-semibold leading-relaxed line-clamp-3">"{note.text}"</p>
              
              <div className="flex items-center gap-1.5 pt-1 border-t border-white/10">
                <img src={note.authorPic} alt="avatar" className="w-4 h-4 rounded-full object-cover" />
                <span className="text-[9px] font-bold text-white/80">{note.authorName}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CREATE STORY DIALOG */}
      <AnimatePresence>
        {showCreateStory && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-2xl"
              id="create-story-modal"
            >
              <h3 className="text-sm font-bold text-white">Nueva Historia (24h)</h3>

              <div className="space-y-3">
                {/* Pick sample image */}
                <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Imagen de Historia</span>
                <div className="grid grid-cols-4 gap-2">
                  {sampleStoryImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setStoryImage(img)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        storyImage === img ? "border-fuchsia-500 scale-105" : "border-slate-800"
                      }`}
                    >
                      <img src={img} alt="story" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>

                {/* Text overlays */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Texto Overlay</span>
                  <input 
                    type="text" 
                    placeholder="Escribe algo sobre tu foto..."
                    value={storyText}
                    onChange={(e) => setStoryText(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
                    id="story-caption-input"
                  />
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  onClick={() => setShowCreateStory(false)}
                  className="flex-1 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-bold text-slate-400"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateStory}
                  className="flex-1 py-2.5 bg-gradient-to-tr from-fuchsia-600 to-purple-600 text-white rounded-lg text-xs font-bold"
                  id="btn-publish-story"
                >
                  Publicar Historia 🌟
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CREATE NOTE DIALOG */}
      <AnimatePresence>
        {showCreateNote && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-2xl"
              id="create-note-modal"
            >
              <h3 className="text-sm font-bold text-white">Nueva Nota de Perfil</h3>

              <div className="space-y-3">
                <textarea 
                  placeholder="¿En qué estás pensando hoy? (max 60 caracteres)..."
                  maxLength={60}
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  rows={2}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500"
                  id="note-text-input"
                />

                {/* Skin colors */}
                <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Skin de Nota</span>
                <div className="grid grid-cols-2 gap-2">
                  {noteSkins.map(skin => (
                    <button
                      key={skin.label}
                      onClick={() => setNoteBg(skin.bg)}
                      className={`p-2 rounded-lg text-[10px] font-bold text-white border transition ${skin.bg} ${
                        noteBg === skin.bg ? "border-white" : "border-transparent"
                      }`}
                    >
                      {skin.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  onClick={() => setShowCreateNote(false)}
                  className="flex-1 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-bold text-slate-400"
                >
                  Cancelar
                </button>
                <button
                  disabled={!noteText.trim()}
                  onClick={handleCreateNote}
                  className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition"
                  id="btn-publish-note"
                >
                  Actualizar Nota 📝
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* STORY VIEWER FULLSCREEN PLAYER */}
      <AnimatePresence>
        {activeStoryUser && playerStories.length > 0 && (
          <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between" id="story-fullscreen-player">
            
            {/* Progress Bar Indicators */}
            <div className="absolute top-4 left-4 right-4 flex gap-1 z-30">
              {playerStories.map((s, idx) => {
                let w = "w-full";
                if (idx < activeStoryIdx) w = "w-full bg-white";
                else if (idx === activeStoryIdx) w = "bg-white/30";
                else w = "bg-white/10";

                return (
                  <div key={s.id} className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                    {idx === activeStoryIdx && (
                      <div className="bg-white h-full" style={{ width: `${storyProgress}%` }} />
                    )}
                    {idx < activeStoryIdx && (
                      <div className="bg-white h-full w-full" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Header Author Info */}
            <div className="absolute top-8 left-4 right-4 flex justify-between items-center z-30">
              <div className="flex items-center gap-2">
                <img src={activeStoryUser.profilePic} alt="pic" className="w-8 h-8 rounded-full border-2 border-white/50 object-cover" />
                <span className="font-bold text-white text-xs">{activeStoryUser.nickname}</span>
                <span className="text-[10px] text-white/60">({activeStoryUser.age} años)</span>
              </div>
              <button 
                onClick={() => setActiveStoryUser(null)}
                className="text-white hover:text-slate-300 font-bold p-1 rounded-full bg-black/40"
              >
                ✕
              </button>
            </div>

            {/* Story Image Body */}
            <div className="flex-1 flex items-center justify-center relative bg-black">
              <img 
                src={playerStories[activeStoryIdx].mediaUrl} 
                alt="Story content" 
                className="w-full h-auto max-h-[85vh] object-contain" 
              />

              {/* Text overlay overlayed elegant */}
              {playerStories[activeStoryIdx].textOverlay && (
                <div className="absolute bottom-20 left-6 right-6 p-4 bg-black/60 backdrop-blur rounded-2xl text-center text-white border border-white/10">
                  <p className="text-xs font-semibold">{playerStories[activeStoryIdx].textOverlay}</p>
                </div>
              )}
            </div>

            {/* Bottom Interaction or Close controls */}
            <div className="p-4 bg-gradient-to-t from-black to-transparent flex justify-center text-center z-30">
              <span className="text-[10px] text-white/50">Viendo historia de {activeStoryUser.nickname}</span>
            </div>

          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
