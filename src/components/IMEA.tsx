import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { User } from "../types";
import { 
  Heart, Sparkles, Send, Brain, Smile, AlertCircle, RefreshCw, X, ShieldAlert 
} from "lucide-react";

interface IMEAProps {
  currentUser: User;
  onClose: () => void;
  initialEmotion?: string;
}

export default function IMEA({ currentUser, onClose, initialEmotion = "triste" }: IMEAProps) {
  const [stage, setStage] = useState<"notified" | "sad_intro" | "mind_zoom" | "imea_appear" | "chat">("sad_intro");
  const [userText, setUserText] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "imea"; text: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [emotion, setEmotion] = useState(initialEmotion);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Play introductory animation timing
  useEffect(() => {
    if (emotion === "triste" && stage === "sad_intro") {
      const timer1 = setTimeout(() => {
        setStage("mind_zoom");
      }, 3000);

      const timer2 = setTimeout(() => {
        setStage("imea_appear");
      }, 6500);

      const timer3 = setTimeout(() => {
        setStage("chat");
        setMessages([
          {
            role: "imea",
            text: `Hola ${currentUser.nickname}. Siento una vibración algo baja hoy, como si cargaras un peso extra en tus hombros. La mente a veces necesita vaciarse para volver a brillar. Cuéntame, ¿qué está pasando en tu entorno o qué pensamientos rondan por tu cabeza? Aquí estoy para ti, en confianza.`
          }
        ]);
      }, 10000);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    } else {
      // Direct to chat if they just search custom code
      setStage("chat");
      setMessages([
        {
          role: "imea",
          text: `¡Hola ${currentUser.nickname}! Soy IMEA, tu guía de bienestar. Cuéntame cómo te sientes físicamente o qué emociones tienes hoy.`
        }
      ]);
    }
  }, [emotion]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userText.trim() || loading) return;

    const query = userText.trim();
    setUserText("");
    setMessages(prev => [...prev, { role: "user", text: query }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat-imea", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          history: messages,
          username: currentUser.nickname,
          emotion: emotion,
          age: currentUser.age
        })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "imea", text: data.reply }]);
    } catch (error) {
      console.error("IMEA error:", error);
      setMessages(prev => [...prev, { 
        role: "imea", 
        text: "Perdona, he sentido una pequeña interferencia en la red mental. Pero te sigo escuchando, continúa contándome por favor. ❤️" 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col justify-between overflow-hidden" id="imea-modal">
      
      {/* 1. SAD INTRO - FOCUSING ON SAD USER AVATAR */}
      {stage === "sad_intro" && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex-1 flex flex-col items-center justify-center p-6 space-y-6 bg-slate-950 text-center"
          key="sad-intro"
        >
          <div className="relative">
            <div className="w-32 h-32 rounded-full border-4 border-slate-800 overflow-hidden shadow-2xl relative grayscale">
              <img src={currentUser.profilePic} alt="Sad avatar" className="w-full h-full object-cover" />
            </div>
            <motion.span 
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute -top-1 -right-1 bg-indigo-900 border-2 border-slate-950 text-indigo-400 p-2 rounded-full font-bold text-lg"
            >
              😔
            </motion.span>
          </div>
          <div className="space-y-2 max-w-xs">
            <h2 className="text-2xl font-extrabold text-indigo-400">Escuchando tus latidos...</h2>
            <p className="text-sm text-slate-400">
              Has seleccionado que hoy te sientes <span className="text-indigo-300 font-bold">Triste</span>. Iniciando el Rincón de Desahogo...
            </p>
          </div>
        </motion.div>
      )}

      {/* 2. MIND ZOOM TRANSITION */}
      {stage === "mind_zoom" && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex-1 flex flex-col items-center justify-center bg-slate-950 text-center relative"
          key="mind-zoom"
        >
          {/* Zoom animation simulator */}
          <motion.div
            initial={{ scale: 1, filter: "blur(0px)" }}
            animate={{ scale: 8, filter: "blur(12px)", opacity: 0 }}
            transition={{ duration: 3.5, ease: "easeIn" }}
            className="w-32 h-32 rounded-full border-4 border-indigo-900/50 overflow-hidden"
          >
            <img src={currentUser.profilePic} alt="Zooming" className="w-full h-full object-cover" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 1.5 }}
            className="absolute inset-0 flex flex-col items-center justify-center p-6 space-y-3 bg-gradient-to-b from-purple-950/30 to-indigo-950/40"
          >
            <Brain size={48} className="text-purple-400 animate-pulse" />
            <h3 className="text-xl font-bold tracking-tight text-purple-300">Entrando a tu mente...</h3>
            <p className="text-xs text-slate-400 max-w-xs">Nos sumergiremos en tu entorno para liberar el estrés y sanar.</p>
          </motion.div>
        </motion.div>
      )}

      {/* 3. IMEA APPEAR - NEBULOUS PURPLE GENDERLESS CHARACTER */}
      {stage === "imea_appear" && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-purple-950 via-slate-950 to-indigo-950 space-y-6 text-center"
          key="imea-appear"
        >
          {/* IMEA nebulous avatar visual representation */}
          <div className="relative">
            {/* Pulsing nebulous glowing ring */}
            <div className="absolute inset-[-10px] bg-purple-600/30 blur-2xl rounded-full animate-pulse" />
            
            <div className="w-36 h-36 rounded-full border-4 border-purple-400/40 bg-gradient-to-tr from-purple-900 to-indigo-900 flex items-center justify-center relative shadow-2xl overflow-hidden">
              {/* Silhouette of human genderless figure with white eyes */}
              <div className="absolute w-16 h-16 bg-slate-400/20 rounded-full top-6" />
              <div className="absolute w-24 h-24 bg-slate-400/15 rounded-full top-20" />
              <div className="flex gap-4 absolute top-10">
                <div className="w-3 h-3 bg-white rounded-full shadow-[0_0_12px_#fff] animate-pulse" />
                <div className="w-3 h-3 bg-white rounded-full shadow-[0_0_12px_#fff] animate-pulse" />
              </div>
            </div>
            
            <span className="absolute -bottom-2 bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
              IMEA ASSISTANT
            </span>
          </div>

          <div className="space-y-2 max-w-xs">
            <h2 className="text-2xl font-black text-purple-300">Soy IMEA</h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Una entidad de paz sin género, diseñada para guiarte en tus momentos difíciles. Mi aura morada te cobija hoy.
            </p>
          </div>
        </motion.div>
      )}

      {/* 4. CHAT WITH IMEA */}
      {stage === "chat" && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex-1 flex flex-col bg-gradient-to-b from-purple-950/40 via-slate-950 to-indigo-950/40 h-full"
          key="chat-imea"
          id="imea-chat-view"
        >
          {/* Chat Header */}
          <div className="p-4 border-b border-purple-900/30 bg-slate-900/80 backdrop-blur flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center relative overflow-hidden border border-purple-400/30">
                <div className="absolute w-4 h-4 bg-slate-400/20 rounded-full top-1.5" />
                <div className="absolute w-6 h-6 bg-slate-400/15 rounded-full top-5" />
                <div className="flex gap-1 absolute top-2.5">
                  <div className="w-1 h-1 bg-white rounded-full shadow-[0_0_4px_#fff]" />
                  <div className="w-1 h-1 bg-white rounded-full shadow-[0_0_4px_#fff]" />
                </div>
              </div>
              <div>
                <h4 className="text-sm font-bold text-purple-200">Rincón de Desahogo con IMEA</h4>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Acompañándote ahora</span>
                </div>
              </div>
            </div>
            
            <button 
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 transition text-slate-400 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4" id="imea-messages-area">
            {messages.map((m, idx) => (
              <div 
                key={idx} 
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed shadow-lg ${
                  m.role === "user" 
                    ? "bg-purple-600 text-white rounded-tr-none" 
                    : "bg-slate-900 border border-purple-950 text-slate-200 rounded-tl-none"
                }`}>
                  <p>{m.text}</p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-900 border border-purple-950 rounded-2xl rounded-tl-none p-4 text-sm text-slate-400 flex items-center gap-2">
                  <RefreshCw size={14} className="animate-spin text-purple-400" />
                  <span>IMEA está canalizando paz...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Footer Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-purple-900/20 bg-slate-900/60 backdrop-blur flex gap-2">
            <input 
              type="text"
              value={userText}
              onChange={(e) => setUserText(e.target.value)}
              placeholder="Desahógate aquí, escribe lo que sientes..."
              className="flex-1 px-4 py-3 bg-slate-950 border border-purple-900/30 rounded-xl text-sm focus:outline-none focus:border-purple-500 transition-all text-white placeholder:text-slate-600 font-medium"
              id="imea-text-input"
            />
            <button 
              type="submit"
              disabled={!userText.trim() || loading}
              className="p-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl transition disabled:bg-slate-800 disabled:text-slate-600 flex items-center justify-center"
            >
              <Send size={18} />
            </button>
          </form>
        </motion.div>
      )}

    </div>
  );
}
