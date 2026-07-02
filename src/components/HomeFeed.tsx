import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { User, Post, Comment } from "../types";
import { getSupabase } from "../lib/supabase";
import { 
  Heart, MessageCircle, Share2, Bookmark, Pin, Trash2, ShieldAlert, 
  BarChart3, Check, Filter, Lock, Eye, Edit3, Plus, Image, EyeOff, MoreVertical, Send, VolumeX, AlertOctagon, Info, ArrowLeft
} from "lucide-react";

interface HomeFeedProps {
  currentUser: User;
  posts: Post[];
  allUsers: User[];
  onUpdatePosts: (updatedPosts: Post[]) => void;
  onUpdateCurrentUser: (updatedUser: User) => void;
  onTriggerNotification: (title: string, content: string, type: string) => void;
  onSelectUserForProfile: (user: User) => void;
}

export default function HomeFeed({ 
  currentUser, posts, allUsers, onUpdatePosts, onUpdateCurrentUser, onTriggerNotification, onSelectUserForProfile 
}: HomeFeedProps) {
  
  const [activeCategory, setActiveCategory] = useState<string>("todos");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPostCaption, setNewPostCaption] = useState("");
  const [newPostUrl, setNewPostUrl] = useState("https://images.unsplash.com/photo-1516280440614-37939bbacd6a?w=600&auto=format&fit=crop&q=80");
  const [newPostPrivacy, setNewPostPrivacy] = useState<"public" | "friends" | "minors" | "majors" | "private">("public");
  const [newPostCategory, setNewPostCategory] = useState("vlog");
  const [loading, setLoading] = useState(false);

  // Filter posts based on age rules
  const filteredPosts = posts.filter(post => {
    if (activeCategory !== "todos" && post.category !== activeCategory) return false;
    if (post.isArchived && post.authorId !== currentUser.id) return false;
    if (post.privacy === "private" && post.authorId !== currentUser.id) return false;

    if (!currentUser.isAdult) {
      if (post.privacy === "majors") return false;
      if (post.authorIsAdult && post.category === "adult_restricted") return false;
    } else {
      if (post.privacy === "minors" && post.authorId !== currentUser.id) return false;
    }

    return true;
  });

  const handleCreatePost = async () => {
    if (!newPostCaption.trim()) return;

    // Safety scan for minors
    if (!currentUser.isAdult) {
      const sensitiveWords = ["desnudo", "sexo", "gore", "sangre", "suicidio", "matanza", "drogas"];
      if (sensitiveWords.some(w => newPostCaption.toLowerCase().includes(w))) {
        alert("🚨 ¡Alerta IMEA! Tu publicación contiene contenido no permitido para menores. Por favor revisa nuestras normas.");
        return;
      }
    }

    setLoading(true);
    const postData = {
      author_id: currentUser.id,
      author_name: currentUser.nickname,
      author_pic: currentUser.profilePic,
      author_age: currentUser.age,
      author_is_adult: currentUser.isAdult,
      content_type: "image",
      caption: newPostCaption,
      media_url: newPostUrl,
      likes: [],
      stats: { likes: 0, comments: 0, shares: 0, saves: 0, views: 0 },
      tags: [],
      category: newPostCategory,
      is_archived: false,
      privacy: newPostPrivacy,
      allow_comments: true,
      allow_sharing: true,
      allow_downloads: true
    };

    try {
      const { data, error } = await getSupabase().from("posts").insert([postData]).select();
      if (error) throw error;
      
      if (data && data[0]) {
        const createdPost: Post = {
          id: data[0].id,
          authorId: data[0].author_id,
          authorName: data[0].author_name,
          authorPic: data[0].author_pic,
          authorAge: data[0].author_age,
          authorIsAdult: data[0].author_is_adult,
          contentType: data[0].content_type as any,
          caption: data[0].caption,
          mediaUrl: data[0].media_url,
          likes: data[0].likes,
          stats: data[0].stats,
          tags: data[0].tags,
          category: data[0].category,
          isArchived: data[0].is_archived,
          privacy: data[0].privacy as any,
          allowComments: data[0].allow_comments,
          allowSharing: data[0].allow_sharing,
          allowDownloads: data[0].allow_downloads,
          createdAt: data[0].created_at
        };
        onUpdatePosts([createdPost, ...posts]);
      }
      
      setShowCreateModal(false);
      setNewPostCaption("");
      onTriggerNotification("✨ +25 NEXUS Points", "¡Protocolo compartido! Ganas reputación por tu contenido positivo.", "system");
    } catch (err) {
      console.error("Error creating post:", err);
      alert("Error al crear la publicación. Por favor revisa tu conexión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 pb-20">
      {/* Categories Bar */}
      <div className="flex gap-2 p-4 overflow-x-auto no-scrollbar bg-slate-950/80 backdrop-blur-md sticky top-0 z-20 border-b border-white/5">
        {["todos", "vlog", "humor", "motivacion", "arte", "musica"].map(cat => (
          <button 
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeCategory === cat ? 'bg-white text-black' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Feed */}
      <div className="flex-1 space-y-4 p-4">
        {filteredPosts.map(post => (
          <motion.div 
            key={post.id} 
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/40 rounded-[32px] overflow-hidden border border-white/5 group"
          >
            {/* Post Header */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => {
                const author = allUsers.find(u => u.id === post.authorId);
                if (author) onSelectUserForProfile(author);
              }}>
                <img src={post.authorPic} alt={post.authorName} className="w-10 h-10 rounded-full object-cover border-2 border-purple-500/20" />
                <div>
                  <h4 className="text-xs font-black text-white italic">{post.authorName}</h4>
                  <p className="text-[9px] text-white/40 font-bold uppercase tracking-tighter">
                    {post.authorIsAdult ? "Nodo Verificado (+18)" : `Nodo Junior (${post.authorAge})`}
                  </p>
                </div>
              </div>
              <button className="p-2 text-white/40 hover:text-white"><MoreVertical size={16}/></button>
            </div>

            {/* Post Content */}
            {post.mediaUrl && (
              <div className="aspect-square bg-slate-800 relative group-hover:scale-[1.02] transition-transform duration-500">
                <img src={post.mediaUrl} alt="Content" className="w-full h-full object-cover" />
                {post.privacy !== 'public' && (
                  <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md p-2 rounded-xl text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-white/10">
                    <Lock size={10} /> {post.privacy}
                  </div>
                )}
              </div>
            )}

            {/* Post Actions */}
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-1.5 text-white/80 hover:text-red-500 transition-colors">
                    <Heart size={22} />
                    <span className="text-[10px] font-black tracking-widest">{post.likes.length}</span>
                  </button>
                  <button className="flex items-center gap-1.5 text-white/80 hover:text-indigo-500 transition-colors">
                    <MessageCircle size={22} />
                    <span className="text-[10px] font-black tracking-widest">{post.stats.comments}</span>
                  </button>
                  <button className="text-white/80 hover:text-green-500"><Share2 size={22} /></button>
                </div>
                <button className="text-white/80 hover:text-amber-500"><Bookmark size={22} /></button>
              </div>
              
              <div className="space-y-1">
                <p className="text-xs text-white/80 leading-relaxed font-medium">
                  <span className="font-black mr-2 italic">{post.authorName}</span>
                  {post.caption}
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {post.tags.map(tag => (
                    <span key={tag} className="text-[10px] text-purple-400 font-bold">#{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Floating Create Button */}
      <button 
        onClick={() => setShowCreateModal(true)}
        className="fixed bottom-24 right-6 w-16 h-16 bg-white text-black rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-30 shadow-white/20"
      >
        <Plus size={32} />
      </button>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col p-6"
          >
            <div className="flex justify-between items-center mb-8">
              <button onClick={() => setShowCreateModal(false)} className="p-2 bg-white/5 rounded-full"><ArrowLeft size={20} /></button>
              <h2 className="text-xl font-black italic tracking-tighter text-white">NUEVA PUBLICACIÓN</h2>
              <button 
                onClick={handleCreatePost}
                disabled={loading || !newPostCaption}
                className="px-6 py-2 bg-white text-black rounded-full font-black text-xs uppercase tracking-widest disabled:opacity-50"
              >
                {loading ? "PUBLICANDO..." : "PUBLICAR"}
              </button>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto no-scrollbar">
              <div className="aspect-square bg-slate-900 rounded-3xl border-2 border-white/5 overflow-hidden group relative">
                <img src={newPostUrl} alt="Preview" className="w-full h-full object-cover opacity-60" />
                <button className="absolute inset-0 flex flex-col items-center justify-center gap-2 group-hover:scale-110 transition-transform">
                  <Image size={40} className="text-white/40" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Cambiar Media</span>
                </button>
              </div>

              <textarea 
                value={newPostCaption}
                onChange={(e) => setNewPostCaption(e.target.value)}
                placeholder="Escribe lo que sientes o piensas..."
                className="w-full bg-transparent border-b border-white/10 p-4 text-white text-lg font-medium focus:border-purple-500 outline-none min-h-[120px] resize-none"
              />

              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Privacidad & Reglas</h4>
                <div className="grid grid-cols-2 gap-2">
                  {["public", "friends", "minors", "majors"].map(p => (
                    <button 
                      key={p}
                      onClick={() => setNewPostPrivacy(p as any)}
                      className={`p-4 rounded-2xl border-2 text-[10px] font-black uppercase tracking-widest transition-all ${newPostPrivacy === p ? 'bg-white text-black border-white' : 'bg-white/5 border-white/5 text-white/40'}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="p-4 bg-teal-600/10 border border-teal-500/20 rounded-2xl flex gap-3">
                <ShieldAlert className="text-teal-400 shrink-0" size={20} />
                <p className="text-[10px] text-teal-300 font-bold leading-relaxed italic">
                  NEXUS protege tu contenido. El sistema Alpha-Secure filtrará automáticamente cualquier palabra o imagen no apta. Tu seguridad es primero.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
