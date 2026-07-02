import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { User, Post, Comment } from "../types";
import { getSupabase } from "../lib/supabase";
import { 
  Heart, MessageCircle, Share2, Bookmark, Pin, Trash2, ShieldAlert, 
  BarChart3, Check, Filter, Lock, Eye, Edit3, Plus, Image, EyeOff, MoreVertical, Send, VolumeX, AlertOctagon 
} from "lucide-react";

interface HomeFeedProps {
  currentUser: User;
  posts: Post[];
  allUsers: User[];
  onUpdatePosts: (updatedPosts: Post[]) => void;
  onUpdateCurrentUser: (updatedUser: User) => void;
  onTriggerNotification: (title: string, content: string, type: "system" | "like" | "comment" | "follow" | "chat_request" | "club_request") => void;
  onSelectUserForProfile: (user: User) => void;
}

export default function HomeFeed({ 
  currentUser, posts, allUsers, onUpdatePosts, onUpdateCurrentUser, onTriggerNotification, onSelectUserForProfile 
}: HomeFeedProps) {
  
  // Navigation & View States
  const [activeCategory, setActiveCategory] = useState<string>("todos");
  const [searchHashtag, setSearchHashtag] = useState<string>("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPostForStats, setSelectedPostForStats] = useState<Post | null>(null);
  const [selectedPostForEditing, setSelectedPostForEditing] = useState<Post | null>(null);
  const [showMoreMenuPostId, setShowMoreMenuPostId] = useState<string | null>(null);

  // New Post Form State
  const [newPostType, setNewPostType] = useState<"image" | "text">("image");
  const [newPostUrl, setNewPostUrl] = useState("https://images.unsplash.com/photo-1516280440614-37939bbacd6a?w=600&auto=format&fit=crop&q=80");
  const [newPostCaption, setNewPostCaption] = useState("");
  const [newPostHashtags, setNewPostHashtags] = useState("");
  const [newPostCategory, setNewPostCategory] = useState("humor");
  const [newPostPrivacy, setNewPostPrivacy] = useState<"public" | "friends" | "minors" | "majors" | "private">("public");
  const [newPostFilter, setNewPostFilter] = useState("Standard");
  const [commentsEnabled, setCommentsEnabled] = useState(true);
  const [sharesEnabled, setSharesEnabled] = useState(true);
  const [downloadsEnabled, setDownloadsEnabled] = useState(true);
  const [createStep, setCreateStep] = useState<"details" | "preview">("details");

  // Edit Post Form State
  const [editCaption, setEditCaption] = useState("");
  const [editPrivacy, setEditPrivacy] = useState<"public" | "friends" | "minors" | "majors" | "private">("public");
  const [editCommentsEnabled, setEditCommentsEnabled] = useState(true);

  // Comments State
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");

  const categories = ["todos", "humor", "motivacion", "vlog", "arte", "ciencia"];
  const filters = ["Standard", "Retro", "Cosmic", "Noir", "Neon", "Vintage"];

  // Sample image template URLs for creation
  const sampleImages = [
    "https://images.unsplash.com/photo-1516280440614-37939bbacd6a?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80"
  ];

  // AGE FILTRATION LOGIC FOR POST DISPLAY
  const filteredPosts = posts.filter(post => {
    // 1. Basic category and hashtag filter
    if (activeCategory !== "todos" && post.category !== activeCategory) return false;
    if (searchHashtag && !post.hashtags.includes(searchHashtag.toLowerCase().replace("#", ""))) return false;

    // 2. Archived / Private
    if (post.isArchived && post.authorId !== currentUser.id) return false;
    if (post.privacy === "private" && post.authorId !== currentUser.id) return false;

    // 3. Minor constraints
    if (!currentUser.isAdult) {
      // Minor can NOT see majors posts
      if (post.privacy === "majors") return false;
      // If author is major and set "no mostrar a menores" (which is essentially what majors-only or NSFW tags imply)
      if (post.authorIsAdult && post.category === "adult_restricted") return false;
    }

    // 4. Adult constraints
    if (currentUser.isAdult) {
      // Adults can NOT see minors-only posts unless they are the author (not possible, but for safety)
      if (post.privacy === "minors" && post.authorId !== currentUser.id) return false;
    }

    // 5. Friends logic
    if (post.privacy === "friends") {
      const author = allUsers.find(u => u.id === post.authorId);
      const isFriend = author?.followers.includes(currentUser.id) && author?.following.includes(currentUser.id);
      if (!isFriend && post.authorId !== currentUser.id) return false;
    }

    return true;
  });

  // POST CREATION LOGIC
  const handleCreatePost = async () => {
    // SENSITIVE CONTENT SCANNING FOR MINORS
    if (!currentUser.isAdult) {
      const lowerCaption = newPostCaption.toLowerCase();
      const sensitveWords = ["boxer", "boxers", "desnudo", "sexo", "sexy", "suicidio", "sangre", "gore", "droga", "marihuana", "cuerpo", "abdomen"];
      const containsSensitive = sensitveWords.some(w => lowerCaption.includes(w));
      
      if (containsSensitive) {
        alert("🚨 ¡Advertencia de Seguridad IMEA! Al ser menor de edad, el sistema ha detectado palabras sensibles en tu publicación. Para protegerte, estas palabras o imágenes sexuales/violentas están prohibidas.");
        return;
      }
    }

    const tagsArr = newPostHashtags
      .split(",")
      .map(t => t.trim().toLowerCase().replace("#", ""))
      .filter(t => t.length > 0);

    const newPost: Post = {
      id: "post_" + Date.now(),
      authorId: currentUser.id,
      authorName: currentUser.nickname,
      authorPic: currentUser.profilePic,
      authorAge: currentUser.age,
      authorIsAdult: currentUser.isAdult,
      type: newPostType,
      url: newPostType === "image" ? newPostUrl : "",
      caption: newPostCaption,
      hashtags: tagsArr,
      category: newPostCategory,
      privacy: newPostPrivacy,
      commentsEnabled: commentsEnabled,
      sharesEnabled: sharesEnabled,
      downloadsEnabled: downloadsEnabled,
      likes: [],
      comments: [],
      sharesCount: 0,
      savesCount: 0,
      viewsCount: 1,
      createdAt: new Date().toISOString(),
      stats: {
        views: 1,
        likes: 0,
        comments: 0,
        shares: 0,
        saves: 0,
        minorsViews: currentUser.isAdult ? 0 : 1,
        adultsViews: currentUser.isAdult ? 1 : 0,
        avgWatchTime: 0
      }
    };

    try {
      const { error } = await getSupabase().from("posts").insert([newPost]);
      if (error) throw error;

      // Reward points for positive content
      const updatedUser = { ...currentUser, points: currentUser.points + 25 };
      await getSupabase().from("users").update({ points: updatedUser.points }).eq("id", currentUser.id);
      
      onUpdateCurrentUser(updatedUser);
      onTriggerNotification("✨ +25 Puntos Ganados", "Has publicado contenido positivo y sumas puntos para desbloquear skins.", "system");

      onUpdatePosts([newPost, ...posts]);
      setShowCreateModal(false);
      resetCreateForm();
    } catch (err) {
      console.error("Error creating post in Supabase:", err);
      alert("Error al crear la publicación.");
    }
  };

  const resetCreateForm = () => {
    setNewPostCaption("");
    setNewPostHashtags("");
    setNewPostPrivacy("public");
    setCreateStep("details");
  };

  // LIKE/UNLIKE LOGIC
  const handleToggleLike = async (post: Post) => {
    const isLiked = post.likes.includes(currentUser.id);
    let updatedLikes: string[];

    if (isLiked) {
      updatedLikes = post.likes.filter(id => id !== currentUser.id);
    } else {
      updatedLikes = [...post.likes, currentUser.id];
      // Trigger notification to author
      if (post.authorId !== currentUser.id) {
        onTriggerNotification(
          "💖 Nuevo me gusta", 
          `A ${currentUser.nickname} le gusta tu publicación: "${post.caption.slice(0, 20)}..."`, 
          "like"
        );
      }
    }

    try {
      const { error } = await getSupabase()
        .from("posts")
        .update({ 
          likes: updatedLikes,
          stats: post.stats ? { ...post.stats, likes: updatedLikes.length } : undefined
        })
        .eq("id", post.id);
      
      if (error) throw error;

      const updatedPosts = posts.map(p => {
        if (p.id === post.id) {
          return { 
            ...p, 
            likes: updatedLikes,
            stats: p.stats ? { ...p.stats, likes: updatedLikes.length } : undefined
          };
        }
        return p;
      });

      onUpdatePosts(updatedPosts);
    } catch (err) {
      console.error("Error toggling like in Supabase:", err);
    }
  };

  // SAVE LOGIC
  const handleToggleSave = (post: Post) => {
    const updatedPosts = posts.map(p => {
      if (p.id === post.id) {
        const currentSaves = p.savesCount || 0;
        return { 
          ...p, 
          savesCount: currentSaves + 1,
          stats: p.stats ? { ...p.stats, saves: currentSaves + 1 } : undefined
        };
      }
      return p;
    });
    onUpdatePosts(updatedPosts);
    alert("¡Publicación guardada en tu perfil!");
  };

  // ADD COMMENT WITH ADULT FLIRTING FILTER
  const handleAddComment = (post: Post) => {
    if (!commentText.trim()) return;

    // BANNED WORDS FILTER
    let finalCommentText = commentText.trim();
    const bannedWords = ["idiota", "tonto", "fea", "feo", "grosería", "estúpido"];
    bannedWords.forEach(w => {
      const reg = new RegExp(w, "gi");
      finalCommentText = finalCommentText.replace(reg, "***");
    });

    // ADULT FLIRTING/GROOMING FILTER FOR MINORS
    let isFiltered = false;
    if (currentUser.isAdult && !post.authorIsAdult) {
      const flirtingTriggers = ["hermosa", "bonita", "guapo", "novio", "novia", "mándame foto", "soltero", "bebé", "linda", "estas buena", "estas bueno"];
      const containsFlirt = flirtingTriggers.some(t => finalCommentText.toLowerCase().includes(t));
      
      if (containsFlirt) {
        isFiltered = true;
        // Trigger system notification to minor
        onTriggerNotification(
          "🚨 Alerta de Privacidad IMEA", 
          `Un adulto (${currentUser.nickname}) ha intentado escribir un comentario sospechoso. Ha sido ocultado para tu revisión.`, 
          "system"
        );
      }
    }

    const newComment: Comment = {
      id: "comment_" + Date.now(),
      authorId: currentUser.id,
      authorName: currentUser.nickname,
      authorPic: currentUser.profilePic,
      authorAge: currentUser.age,
      text: isFiltered ? "[Ocultado por filtro de seguridad IMEA]" : finalCommentText,
      createdAt: new Date().toISOString(),
      isFiltered: isFiltered
    };

    const updatedPosts = posts.map(p => {
      if (p.id === post.id) {
        return { 
          ...p, 
          comments: [...p.comments, newComment],
          stats: p.stats ? { ...p.stats, comments: p.comments.length + 1 } : undefined
        };
      }
      return p;
    });

    onUpdatePosts(updatedPosts);
    setCommentText("");
    
    if (post.authorId !== currentUser.id && !isFiltered) {
      onTriggerNotification(
        "💬 Nuevo comentario", 
        `${currentUser.nickname} comentó: "${finalCommentText.slice(0, 15)}..."`, 
        "comment"
      );
    }
  };

  // DELETE COMMENT
  const handleDeleteComment = (post: Post, commentId: string) => {
    const updatedPosts = posts.map(p => {
      if (p.id === post.id) {
        return { ...p, comments: p.comments.filter(c => c.id !== commentId) };
      }
      return p;
    });
    onUpdatePosts(updatedPosts);
  };

  // POST EDITS BY AUTHOR
  const handleSaveChangesPost = () => {
    if (!selectedPostForEditing) return;

    const updated = posts.map(p => {
      if (p.id === selectedPostForEditing.id) {
        return {
          ...p,
          caption: editCaption,
          privacy: editPrivacy,
          commentsEnabled: editCommentsEnabled
        };
      }
      return p;
    });

    onUpdatePosts(updated);
    setSelectedPostForEditing(null);
  };

  // DELETE POST BY AUTHOR
  const handleDeletePost = async (postId: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar permanentemente esta publicación?")) {
      try {
        const { error } = await getSupabase().from("posts").delete().eq("id", postId);
        if (error) throw error;
        
        onUpdatePosts(posts.filter(p => p.id !== postId));
        setShowMoreMenuPostId(null);
      } catch (err) {
        console.error("Error deleting post from Supabase:", err);
        alert("Error al eliminar la publicación.");
      }
    }
  };

  // PIN POST BY AUTHOR
  const handleTogglePinPost = (postId: string) => {
    const updated = posts.map(p => {
      if (p.id === postId) {
        return { ...p, isPinned: !p.isPinned };
      }
      return p;
    });
    onUpdatePosts(updated);
    setShowMoreMenuPostId(null);
  };

  return (
    <div className="space-y-6" id="home-feed-view">
      
      {/* Category selector & Hashtag search */}
      <div className="flex flex-col gap-3" id="feed-filters-bar">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                setSearchHashtag("");
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize transition-all flex-shrink-0 ${
                activeCategory === cat && !searchHashtag
                  ? "bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white shadow-md shadow-purple-950/20"
                  : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
              }`}
            >
              #{cat}
            </button>
          ))}
        </div>

        {searchHashtag && (
          <div className="flex items-center justify-between bg-indigo-950/30 border border-indigo-900/50 px-3 py-2 rounded-xl text-xs font-bold text-indigo-300">
            <span>Buscando contenido de tag: #{searchHashtag}</span>
            <button onClick={() => setSearchHashtag("")} className="text-slate-400 hover:text-white">✕</button>
          </div>
        )}
      </div>

      {/* NEW POST INSPIRATION ACTION BAR */}
      <div className="p-4 bg-gradient-to-r from-slate-900 via-slate-900 to-purple-950/40 rounded-2xl border border-slate-800/80 flex justify-between items-center shadow-lg" id="create-post-banner">
        <div className="flex items-center gap-3">
          <img src={currentUser.profilePic} alt="User Avatar" className="w-10 h-10 rounded-full border-2 border-fuchsia-500/40 object-cover" />
          <div>
            <span className="text-xs font-bold text-slate-400 block">Comparte tu día, libre de odio</span>
            <p className="text-sm font-semibold">¿Qué tienes hoy para el mundo, {currentUser.nickname}?</p>
          </div>
        </div>
        <button 
          onClick={() => {
            setCreateStep("details");
            setShowCreateModal(true);
          }}
          className="p-3 bg-gradient-to-tr from-fuchsia-600 to-purple-600 rounded-xl text-white font-bold transition shadow-md shadow-purple-950/30 flex items-center gap-1.5 active:scale-95 text-xs"
          id="btn-trigger-create-post"
        >
          <Plus size={16} /> Publicar
        </button>
      </div>

      {/* FEED POSTS */}
      <div className="space-y-6" id="feed-posts-list">
        {filteredPosts.length === 0 ? (
          <div className="py-16 text-center space-y-3 bg-slate-900/20 rounded-2xl border border-slate-900">
            <EyeOff size={40} className="mx-auto text-slate-600" />
            <h4 className="font-bold text-slate-400">No hay publicaciones disponibles</h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">Prueba cambiando de filtro o crea tu primera publicación usando el botón de arriba.</p>
          </div>
        ) : (
          filteredPosts.map(post => {
            const isAuthor = post.authorId === currentUser.id;
            const isLiked = post.likes.includes(currentUser.id);
            const author = allUsers.find(u => u.id === post.authorId);

            return (
              <motion.div
                key={post.id}
                layout
                className="bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl"
                id={`post-card-${post.id}`}
              >
                {/* Post Header */}
                <div className="p-4 flex justify-between items-center border-b border-slate-900 bg-slate-900/40">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => author && onSelectUserForProfile(author)}
                      className="w-10 h-10 rounded-full overflow-hidden border-2 border-slate-800 hover:border-fuchsia-500 transition-all flex-shrink-0"
                    >
                      <img src={post.authorPic} alt={post.authorName} className="w-full h-full object-cover" />
                    </button>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span 
                          onClick={() => author && onSelectUserForProfile(author)}
                          className="font-bold text-sm hover:underline cursor-pointer"
                        >
                          {post.authorName}
                        </span>
                        {post.isPinned && <Pin size={12} className="text-fuchsia-400 fill-fuchsia-400" />}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                        <span>@{author?.username}</span>
                        <span>•</span>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                          post.authorIsAdult ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                        }`}>
                          {post.authorIsAdult ? "Adulto +18" : `Menor (${post.authorAge})`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <button 
                      onClick={() => setShowMoreMenuPostId(showMoreMenuPostId === post.id ? null : post.id)}
                      className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                      id={`btn-menu-${post.id}`}
                    >
                      <MoreVertical size={16} />
                    </button>

                    {showMoreMenuPostId === post.id && (
                      <div className="absolute right-0 mt-1 w-44 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl py-1 z-30 font-semibold text-xs">
                        {isAuthor ? (
                          <>
                            <button 
                              onClick={() => {
                                setEditCaption(post.caption);
                                setEditPrivacy(post.privacy);
                                setEditCommentsEnabled(post.commentsEnabled);
                                setSelectedPostForEditing(post);
                                setShowMoreMenuPostId(null);
                              }}
                              className="w-full px-4 py-2.5 text-left hover:bg-slate-900 transition flex items-center gap-2"
                            >
                              <Edit3 size={14} /> Editar Publicación
                            </button>
                            <button 
                              onClick={() => handleTogglePinPost(post.id)}
                              className="w-full px-4 py-2.5 text-left hover:bg-slate-900 transition flex items-center gap-2"
                            >
                              <Pin size={14} /> {post.isPinned ? "Desfijar" : "Fijar en perfil"}
                            </button>
                            <button 
                              onClick={() => {
                                setSelectedPostForStats(post);
                                setShowMoreMenuPostId(null);
                              }}
                              className="w-full px-4 py-2.5 text-left hover:bg-slate-900 transition flex items-center gap-2 text-indigo-400"
                            >
                              <BarChart3 size={14} /> Ver Estadísticas
                            </button>
                            <div className="h-px bg-slate-900 my-1"></div>
                            <button 
                              onClick={() => handleDeletePost(post.id)}
                              className="w-full px-4 py-2.5 text-left hover:bg-slate-900 transition flex items-center gap-2 text-red-500"
                            >
                              <Trash2 size={14} /> Eliminar
                            </button>
                          </>
                        ) : (
                          <>
                            <button 
                              onClick={() => {
                                alert("Reporte enviado a moderación automática de IMEA. Gracias por proteger el entorno.");
                                setShowMoreMenuPostId(null);
                              }}
                              className="w-full px-4 py-2.5 text-left hover:bg-slate-900 transition flex items-center gap-2 text-red-400 font-bold"
                            >
                              <ShieldAlert size={14} /> Reportar Contenido
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Post Content */}
                <div className="relative">
                  {post.type === "image" && (
                    <div className="aspect-square bg-slate-950 overflow-hidden relative">
                      <img 
                        src={post.url} 
                        alt="Content" 
                        className={`w-full h-full object-cover`} 
                      />
                    </div>
                  )}

                  <div className="p-4 space-y-3">
                    <p className="text-sm leading-relaxed text-slate-200">{post.caption}</p>

                    {/* Hashtags display */}
                    {post.hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {post.hashtags.map(tag => (
                          <span 
                            key={tag}
                            onClick={() => setSearchHashtag(`#${tag}`)}
                            className="text-xs font-bold text-fuchsia-400 hover:underline cursor-pointer"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Post Actions Bar */}
                <div className="px-4 py-3 border-t border-slate-900 bg-slate-900/20 flex justify-between items-center text-slate-400 text-xs">
                  <div className="flex items-center gap-5">
                    <button 
                      onClick={() => handleToggleLike(post)}
                      className={`flex items-center gap-1.5 font-bold transition ${isLiked ? "text-fuchsia-500" : "hover:text-white"}`}
                      id={`btn-like-${post.id}`}
                    >
                      <Heart size={18} className={isLiked ? "fill-current" : ""} />
                      <span>{post.likes.length}</span>
                    </button>

                    <button 
                      onClick={() => setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id)}
                      className={`flex items-center gap-1.5 font-bold hover:text-white transition ${activeCommentPostId === post.id ? "text-purple-400" : ""}`}
                      id={`btn-comment-toggle-${post.id}`}
                    >
                      <MessageCircle size={18} />
                      <span>{post.comments.length}</span>
                    </button>

                    {post.sharesEnabled && (
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(window.location.href);
                          alert("¡Enlace de publicación copiado al portapapeles!");
                        }}
                        className="flex items-center gap-1.5 font-bold hover:text-white transition"
                      >
                        <Share2 size={18} />
                        <span>{post.sharesCount}</span>
                      </button>
                    )}
                  </div>

                  <button 
                    onClick={() => handleToggleSave(post)}
                    className="p-1 hover:text-white transition"
                  >
                    <Bookmark size={18} />
                  </button>
                </div>

                {/* Comments Section Drawer style */}
                {activeCommentPostId === post.id && (
                  <div className="p-4 border-t border-slate-900 bg-slate-950/50 space-y-4">
                    {post.commentsEnabled ? (
                      <>
                        {/* Add Comment Bar */}
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            placeholder="Añadir comentario amigable..."
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500"
                            id={`input-comment-${post.id}`}
                          />
                          <button
                            onClick={() => handleAddComment(post)}
                            className="p-2.5 bg-purple-600 hover:bg-purple-500 rounded-xl text-white font-bold text-xs"
                            id={`btn-comment-submit-${post.id}`}
                          >
                            <Send size={14} />
                          </button>
                        </div>

                        {/* Comments List */}
                        <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                          {post.comments.length === 0 ? (
                            <p className="text-[11px] text-slate-500 text-center py-2">Sé el primero en comentar algo positivo ✨</p>
                          ) : (
                            post.comments.map(c => {
                              const isCommentAuthor = c.authorId === currentUser.id;
                              return (
                                <div key={c.id} className="p-2.5 bg-slate-900 rounded-xl border border-slate-800/40 text-xs space-y-1">
                                  <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                      <img src={c.authorPic} alt="Author" className="w-5 h-5 rounded-full object-cover" />
                                      <span className="font-bold text-slate-300">{c.authorName}</span>
                                      <span className="text-[9px] text-slate-500">({c.authorAge} años)</span>
                                    </div>
                                    {(isCommentAuthor || isAuthor) && (
                                      <button 
                                        onClick={() => handleDeleteComment(post, c.id)}
                                        className="text-slate-500 hover:text-red-500 transition"
                                      >
                                        ✕
                                      </button>
                                    )}
                                  </div>
                                  <p className="text-slate-400 pl-7 leading-relaxed">{c.text}</p>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </>
                    ) : (
                      <p className="text-[11px] text-slate-500 text-center py-2">🔒 El autor ha desactivado los comentarios para esta publicación.</p>
                    )}
                  </div>
                )}

              </motion.div>
            );
          })
        )}
      </div>

      {/* CREATE POST MODAL DIALOG */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[520px]"
              id="create-post-modal"
            >
              {/* Modal Header */}
              <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/40">
                <div className="flex items-center gap-2 text-fuchsia-400">
                  <Plus size={18} />
                  <span className="font-bold text-sm text-white">Nueva Publicación</span>
                </div>
                <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white font-bold text-sm">✕</button>
              </div>

              {/* Steps Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {createStep === "details" ? (
                  <>
                    {/* Caption */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Descripción / Caption</label>
                      <textarea 
                        placeholder="Escribe lo que sientes, una idea creativa..."
                        value={newPostCaption}
                        onChange={(e) => setNewPostCaption(e.target.value)}
                        rows={3}
                        className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500"
                        id="create-caption-input"
                      />
                    </div>

                    {/* Hashtags */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Hashtags (separados por coma)</label>
                      <input 
                        type="text" 
                        placeholder="ej: arte, humor, indiemusic"
                        value={newPostHashtags}
                        onChange={(e) => setNewPostHashtags(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    {/* Select Category */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Categoría</label>
                      <select 
                        value={newPostCategory}
                        onChange={(e) => setNewPostCategory(e.target.value)}
                        className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
                      >
                        <option value="humor">Humor 🎬</option>
                        <option value="motivacion">Motivación ✨</option>
                        <option value="vlog">Vlog diario 🎒</option>
                        <option value="arte">Arte & Creatividad 🎨</option>
                        <option value="ciencia">Ciencia & Tech 🪐</option>
                      </select>
                    </div>

                    {/* Image Template Pick */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Seleccionar imagen a publicar</label>
                      <div className="grid grid-cols-4 gap-2">
                        {sampleImages.map((img, idx) => (
                          <button
                            key={idx}
                            onClick={() => setNewPostUrl(img)}
                            className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                              newPostUrl === img ? "border-fuchsia-500 scale-105" : "border-slate-800 hover:border-slate-600"
                            }`}
                          >
                            <img src={img} alt="sample" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Privacy Option */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Ajustes de Privacidad de Contenido</label>
                      <select
                        value={newPostPrivacy}
                        onChange={(e) => setNewPostPrivacy(e.target.value as any)}
                        className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
                      >
                        <option value="public">Público (Todos pueden ver)</option>
                        <option value="friends">Solo Amigos (Mutuos)</option>
                        {currentUser.isAdult ? (
                          <option value="majors">Solo Adultos (+18)</option>
                        ) : (
                          <option value="minors">Solo Menores de Edad</option>
                        )}
                        <option value="private">Privado (Solo yo)</option>
                      </select>
                    </div>

                    {/* Interactive Toggles */}
                    <div className="grid grid-cols-3 gap-2 pt-2 text-center text-[10px] font-bold">
                      <button
                        onClick={() => setCommentsEnabled(!commentsEnabled)}
                        className={`p-2 rounded-lg border transition-all ${
                          commentsEnabled ? "bg-purple-950/20 border-purple-500 text-purple-300" : "bg-slate-950 border-slate-800 text-slate-500"
                        }`}
                      >
                        {commentsEnabled ? "Comentarios On" : "Comentarios Off"}
                      </button>
                      <button
                        onClick={() => setSharesEnabled(!sharesEnabled)}
                        className={`p-2 rounded-lg border transition-all ${
                          sharesEnabled ? "bg-purple-950/20 border-purple-500 text-purple-300" : "bg-slate-950 border-slate-800 text-slate-500"
                        }`}
                      >
                        {sharesEnabled ? "Compartidos On" : "Compartidos Off"}
                      </button>
                      <button
                        onClick={() => setDownloadsEnabled(!downloadsEnabled)}
                        className={`p-2 rounded-lg border transition-all ${
                          downloadsEnabled ? "bg-purple-950/20 border-purple-500 text-purple-300" : "bg-slate-950 border-slate-800 text-slate-500"
                        }`}
                      >
                        {downloadsEnabled ? "Descargas On" : "Descargas Off"}
                      </button>
                    </div>
                  </>
                ) : (
                  // PREVIEW STEP
                  <div className="space-y-4" id="post-preview-step">
                    <div className="p-3 bg-fuchsia-950/20 border border-fuchsia-500/20 rounded-xl text-center text-xs text-fuchsia-300 font-bold">
                      👀 Vista previa de publicación activa
                    </div>

                    <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-lg p-3 space-y-3">
                      <div className="flex items-center gap-2">
                        <img src={currentUser.profilePic} alt="User" className="w-8 h-8 rounded-full object-cover" />
                        <div>
                          <h4 className="text-xs font-bold">{currentUser.nickname}</h4>
                          <span className="text-[9px] text-slate-500">@{currentUser.username} • {newPostCategory}</span>
                        </div>
                      </div>

                      <div className="aspect-video bg-slate-900 rounded-lg overflow-hidden">
                        <img src={newPostUrl} alt="Preview image" className="w-full h-full object-cover" />
                      </div>

                      <p className="text-xs text-slate-300">{newPostCaption}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-800 bg-slate-900/40 flex justify-end gap-2.5">
                {createStep === "details" ? (
                  <button
                    onClick={() => setCreateStep("preview")}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold transition text-slate-300"
                    id="btn-goto-preview"
                  >
                    Ver Vista Previa
                  </button>
                ) : (
                  <button
                    onClick={() => setCreateStep("details")}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold transition text-slate-300"
                  >
                    Editar Detalles
                  </button>
                )}

                <button
                  disabled={!newPostCaption.trim()}
                  onClick={handleCreatePost}
                  className="px-5 py-2 bg-gradient-to-tr from-fuchsia-600 via-purple-600 to-indigo-600 hover:from-fuchsia-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-purple-950/30"
                  id="btn-publish-final"
                >
                  Confirmar & Publicar 🚀
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT POST MODAL */}
      <AnimatePresence>
        {selectedPostForEditing && (
          <div className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl p-5 space-y-4"
            >
              <h3 className="text-sm font-bold text-white">Editar Publicación</h3>

              <div className="space-y-3">
                <textarea
                  value={editCaption}
                  onChange={(e) => setEditCaption(e.target.value)}
                  rows={3}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
                />

                <select
                  value={editPrivacy}
                  onChange={(e) => setEditPrivacy(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
                >
                  <option value="public">Público</option>
                  <option value="friends">Solo Amigos</option>
                  <option value="private">Privado</option>
                </select>

                <div className="flex justify-between items-center p-2.5 bg-slate-950 border border-slate-800 rounded-xl">
                  <span className="text-xs">Permitir Comentarios</span>
                  <input
                    type="checkbox"
                    checked={editCommentsEnabled}
                    onChange={(e) => setEditCommentsEnabled(e.target.checked)}
                    className="w-4 h-4 text-purple-600 border-slate-800 bg-slate-950"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setSelectedPostForEditing(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold transition text-slate-400"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveChangesPost}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition"
                >
                  Guardar Cambios
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* STATS ANALYTICS MODAL DIALOG */}
      <AnimatePresence>
        {selectedPostForStats && (
          <div className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl p-5 space-y-4"
              id="stats-modal"
            >
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <h3 className="text-sm font-bold text-indigo-400 flex items-center gap-2">
                  <BarChart3 size={16} /> Estadísticas de Publicación
                </h3>
                <button onClick={() => setSelectedPostForStats(null)} className="text-slate-400 hover:text-white font-bold text-sm">✕</button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center" id="stats-grid">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Visualizaciones</span>
                  <p className="text-lg font-black text-white">{selectedPostForStats.stats?.views || 10}</p>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Me gusta</span>
                  <p className="text-lg font-black text-fuchsia-400">{selectedPostForStats.likes.length}</p>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Guardados</span>
                  <p className="text-lg font-black text-indigo-400">{selectedPostForStats.savesCount}</p>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Compartidos</span>
                  <p className="text-lg font-black text-teal-400">{selectedPostForStats.sharesCount}</p>
                </div>
              </div>

              {/* Age Range Distribution */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400">Distribución de Audiencia (Por Edad)</span>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>Menores de edad:</span>
                    <span className="font-bold text-purple-400">{selectedPostForStats.stats?.minorsViews || 0} vistas</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div 
                      className="bg-purple-500 h-full rounded-full" 
                      style={{ width: `${((selectedPostForStats.stats?.minorsViews || 0) / ((selectedPostForStats.stats?.views || 1) || 1)) * 100}%` }}
                    />
                  </div>

                  <div className="flex justify-between pt-1">
                    <span>Mayores de edad (+18):</span>
                    <span className="font-bold text-red-400">{selectedPostForStats.stats?.adultsViews || 0} vistas</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div 
                      className="bg-red-500 h-full rounded-full" 
                      style={{ width: `${((selectedPostForStats.stats?.adultsViews || 0) / ((selectedPostForStats.stats?.views || 1) || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Likes/Saves Name lists */}
              <div className="space-y-1.5 border-t border-slate-800 pt-3">
                <span className="text-xs font-bold text-slate-400">Personas que dieron like:</span>
                <div className="flex flex-wrap gap-1.5 max-h-[80px] overflow-y-auto">
                  {selectedPostForStats.likes.length === 0 ? (
                    <span className="text-[10px] text-slate-600 italic">Nadie ha dado like aún.</span>
                  ) : (
                    selectedPostForStats.likes.map(userId => {
                      const user = allUsers.find(u => u.id === userId);
                      return (
                        <span key={userId} className="px-2 py-0.5 bg-slate-950 rounded text-[10px] font-semibold text-slate-300">
                          @{user?.username || "usuario_anonimo"}
                        </span>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button 
                  onClick={() => setSelectedPostForStats(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold transition"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
