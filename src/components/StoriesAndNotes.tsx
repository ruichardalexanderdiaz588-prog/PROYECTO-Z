import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { User, Story, Note } from "../types";
import { getSupabase } from "../lib/supabase";
import { 
  Plus, X, Image as ImageIcon, MessageCircle, Send, Check, Heart, Sparkles, Smile, ArrowRight 
} from "lucide-react";

interface StoriesAndNotesProps {
  currentUser: User;
  stories: Story[];
  notes: Note[];
  allUsers: User[];
  onUpdateStories: (updatedStories: Story[]) => void;
  onUpdateNotes: (updatedNotes: Note[]) => void;
  onTriggerNotification: (title: string, content: string, type: string) => void;
}

const COLORS = ["#9333ea", "#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#6366f1", "#000000"];

export default function StoriesAndNotes({ 
  currentUser, stories, notes, allUsers, onUpdateStories, onUpdateNotes, onTriggerNotification 
}: StoriesAndNotesProps) {
  
  const [showStoryCreate, setShowStoryCreate] = useState(false);
  const [showNoteCreate, setShowNoteCreate] = useState(false);
  const [newStoryUrl, setNewStoryUrl] = useState("https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80");
  const [newStoryText, setNewStoryText] = useState("");
  const [newNoteText, setNewNoteText] = useState("");
  const [newNoteColor, setNewNoteColor] = useState(COLORS[0]);
  const [loading, setLoading] = useState(false);

  // Filter out expired content (simulated for now, real expiry would be on server or filtered here)
  const activeStories = stories.filter(s => new Date(s.expiresAt) > new Date());
  const activeNotes = notes.filter(n => new Date(n.expiresAt) > new Date());

  // Group stories by user
  const groupedStories: Record<string, Story[]> = {};
  activeStories.forEach(s => {
    if (!groupedStories[s.authorId]) groupedStories[s.authorId] = [];
    groupedStories[s.authorId].push(s);
  });

  const handleCreateStory = async () => {
    setLoading(true);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const newStory: Story = {
      id: "story_" + Date.now(),
      authorId: currentUser.id,
      authorName: currentUser.nickname,
      authorPic: currentUser.profilePic,
      mediaUrl: newStoryUrl,
      textOverlay: newStoryText,
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
      viewsCount: 0
    };

    try {
      const { error } = await getSupabase().from("stories").insert([newStory]);
      if (error) throw error;
      onUpdateStories([newStory, ...stories]);
      setShowStoryCreate(false);
      setNewStoryText("");
    } catch (err) {
      console.error("Error creating story:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = async () => {
    if (!newNoteText.trim()) return;
    setLoading(true);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const newNote: Note = {
      id: "note_" + Date.now(),
      authorId: currentUser.id,
      authorName: currentUser.nickname,
      authorPic: currentUser.profilePic,
      text: newNoteText,
      bgColor: newNoteColor,
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString()
    };

    try {
      const { error } = await getSupabase().from("notes").insert([newNote]);
      if (error) throw error;
      onUpdateNotes([newNote, ...notes.filter(n => n.authorId !== currentUser.id)]);
      setShowNoteCreate(false);
      setNewNoteText("");
    } catch (err) {
      console.error("Error creating note:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-950/50 backdrop-blur-xl border-b border-white/5 py-6">
      
      {/* Notes Section (Horizontal Scroll) */}
      <div className="flex gap-4 px-6 mb-8 overflow-x-auto no-scrollbar pb-2">
        {/* My Note */}
        <div className="relative flex-shrink-0 flex flex-col items-center">
          <div className="relative">
            <img src={currentUser.profilePic} alt="Me" className="w-16 h-16 rounded-full object-cover border-2 border-white/5" />
            <button 
              onClick={() => setShowNoteCreate(true)}
              className="absolute -top-1 -right-1 w-7 h-7 bg-white text-black rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all"
            >
              {activeNotes.find(n => n.authorId === currentUser.id) ? <Sparkles size={14} /> : <Plus size={16} />}
            </button>
            {activeNotes.find(n => n.authorId === currentUser.id) && (
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black p-2 rounded-2xl rounded-bl-none text-[8px] font-black uppercase tracking-widest whitespace-nowrap shadow-xl">
                {activeNotes.find(n => n.authorId === currentUser.id)?.text.slice(0, 15)}...
              </div>
            )}
          </div>
          <span className="text-[9px] font-black text-white/40 mt-2 uppercase tracking-widest">Tú</span>
        </div>

        {activeNotes.filter(n => n.authorId !== currentUser.id).map(note => (
          <div key={note.id} className="relative flex-shrink-0 flex flex-col items-center">
            <div className="relative">
              <img src={note.authorPic} alt={note.authorName} className="w-16 h-16 rounded-full object-cover border-2 border-white/5" />
              <div 
                style={{ backgroundColor: note.bgColor }}
                className="absolute -top-10 left-1/2 -translate-x-1/2 p-3 rounded-[20px] rounded-bl-none text-[9px] font-black text-white italic whitespace-nowrap shadow-xl border border-white/20 min-w-[60px] text-center"
              >
                {note.text}
                <div className="absolute -bottom-1.5 left-0 w-3 h-3 rotate-45" style={{ backgroundColor: note.bgColor }} />
              </div>
            </div>
            <span className="text-[9px] font-black text-white/60 mt-2 uppercase tracking-widest">{note.authorName.split(' ')[0]}</span>
          </div>
        ))}
      </div>

      {/* Stories Section (Horizontal Scroll) */}
      <div className="flex gap-4 px-6 overflow-x-auto no-scrollbar">
        {/* Create Story */}
        <div className="flex-shrink-0 flex flex-col items-center">
          <div 
            onClick={() => setShowStoryCreate(true)}
            className="w-16 h-16 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center cursor-pointer hover:border-white/40 transition-all group"
          >
            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center group-hover:bg-white/10">
              <Plus className="text-white/40 group-hover:text-white" size={20} />
            </div>
          </div>
          <span className="text-[9px] font-black text-white/40 mt-2 uppercase tracking-widest italic">NUEVO</span>
        </div>

        {Object.keys(groupedStories).map(userId => {
          const userStories = groupedStories[userId];
          const author = userStories[0];
          return (
            <div key={userId} className="flex-shrink-0 flex flex-col items-center cursor-pointer group">
              <div className="w-16 h-16 rounded-full p-1 bg-gradient-to-tr from-purple-600 to-indigo-600 animate-gradient-xy">
                <div className="w-full h-full rounded-full border-2 border-slate-950 overflow-hidden bg-slate-900">
                  <img src={author.authorPic} alt={author.authorName} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
              </div>
              <span className="text-[9px] font-black text-white/60 mt-2 uppercase tracking-widest">{author.authorName.split(' ')[0]}</span>
            </div>
          );
        })}
      </div>

      {/* Note Create Modal */}
      <AnimatePresence>
        {showNoteCreate && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setShowNoteCreate(false)} />
            <div className="relative w-full max-w-sm bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-[40px] p-8 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-black italic text-white tracking-tighter">NUEVA NOTA</h3>
                <button onClick={() => setShowNoteCreate(false)} className="text-white/40 hover:text-white"><X size={24}/></button>
              </div>

              <div 
                style={{ backgroundColor: newNoteColor }}
                className="w-full aspect-[2/1] rounded-[40px] flex items-center justify-center p-8 transition-colors duration-500 shadow-2xl"
              >
                <textarea 
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value.slice(0, 60))}
                  placeholder="¿En qué piensas?"
                  className="w-full bg-transparent text-center text-white text-xl font-black placeholder:text-white/40 outline-none resize-none no-scrollbar"
                />
              </div>

              <div className="flex justify-center gap-3">
                {COLORS.map(c => (
                  <button 
                    key={c}
                    onClick={() => setNewNoteColor(c)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${newNoteColor === c ? 'border-white scale-110' : 'border-transparent opacity-60'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>

              <button 
                onClick={handleCreateNote}
                disabled={loading || !newNoteText.trim()}
                className="w-full py-4 bg-white text-black rounded-[24px] font-black uppercase tracking-widest disabled:opacity-50"
              >
                {loading ? "PUBLICANDO..." : "SUBIR NOTA"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Story Create Modal */}
      <AnimatePresence>
        {showStoryCreate && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black flex flex-col"
          >
            <div className="flex justify-between items-center p-6 border-b border-white/5">
              <button onClick={() => setShowStoryCreate(false)} className="p-2 bg-white/5 rounded-full"><X size={20}/></button>
              <h3 className="text-xl font-black italic text-white tracking-tighter">NUEVA HISTORIA</h3>
              <button 
                onClick={handleCreateStory}
                disabled={loading}
                className="px-6 py-2 bg-white text-black rounded-full font-black text-xs uppercase tracking-widest disabled:opacity-50"
              >
                SUBIR
              </button>
            </div>

            <div className="flex-1 relative flex items-center justify-center overflow-hidden">
              <img src={newStoryUrl} alt="Preview" className="w-full h-full object-cover opacity-60" />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-12">
                <textarea 
                  value={newStoryText}
                  onChange={(e) => setNewStoryText(e.target.value)}
                  placeholder="Añade texto a tu historia..."
                  className="w-full bg-transparent text-center text-white text-3xl font-black placeholder:text-white/20 outline-none resize-none drop-shadow-[0_0_20px_rgba(0,0,0,0.8)]"
                />
              </div>
              
              <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/40 backdrop-blur-xl p-4 rounded-full border border-white/10">
                <button className="p-3 bg-white/10 rounded-full text-white hover:bg-white/20"><ImageIcon size={20} /></button>
                <div className="h-6 w-px bg-white/10" />
                <button className="p-3 bg-white/10 rounded-full text-white hover:bg-white/20"><Smile size={20} /></button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
