import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { User } from "../types";
import { 
  Sparkles, MessageCircle, Heart, Shield, X, Send, Brain, Ghost, Smile, Frown, Zap, Coffee 
} from "lucide-react";

interface IMEAProps {
  currentUser: User;
  emotion: string;
  onClose: () => void;
}

export default function IMEA({ currentUser, emotion, onClose }: IMEAProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Initial Greeting based on emotion
    const initialGreeting = emotion === "triste" 
      ? `Hola ${currentUser.nickname}, detecto que te sientes un poco triste hoy. Estoy aquí para escucharte, sin juicios. ¿Quieres contarme qué pasa por tu mente?`
      : `¡Hola ${currentUser.nickname}! Me alegra verte por aquí. ¿Cómo va tu día en NEXUS?`;
    
    setMessages([{ role: "imea", content: initialGreeting }]);
  }, [emotion, currentUser]);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMsg = { role: "user", content: inputText };
    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    // Simulate IMEA AI Response
    setTimeout(() => {
      let imeaResponse = "";
      const lower = inputText.toLowerCase();

      if (lower.includes("triste") || lower.includes("mal") || lower.includes("solo")) {
        imeaResponse = "Entiendo perfectamente... a veces el mundo se siente pesado. Recuerda que eres una persona valiosa y que en NEXUS todos estamos para apoyarnos. ¿Has intentado hablar con alguien de confianza hoy?";
      } else if (lower.includes("bullying") || lower.includes("molestan")) {
        imeaResponse = "Lamento mucho escuchar eso. El acoso NO está permitido en NEXUS. He marcado este reporte internamente para revisar la actividad sospechosa a tu alrededor. Mantente a salvo, bloquea a quien te moleste.";
      } else {
        imeaResponse = "Gracias por compartir eso conmigo. Recuerda que siempre puedes contar conmigo para desahogarte. ¿Hay algo más que quieras decir?";
      }

      setMessages(prev => [...prev, { role: "imea", content: imeaResponse }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <motion.div 
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4"
    >
      {/* Zoom Animation Background for "Sad" emotion */}
      {emotion === "triste" && (
        <div className="absolute inset-0 bg-slate-950 overflow-hidden">
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 4, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute inset-0 bg-purple-900/20 rounded-full blur-[120px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          />
          <motion.div 
            initial={{ scale: 0.2, opacity: 0 }}
            animate={{ scale: 2, opacity: 0.4 }}
            transition={{ duration: 2, delay: 0.5 }}
            className="absolute inset-0 bg-indigo-900/10 rounded-full blur-[150px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          />
        </div>
      )}

      {/* IMEA Interface Card */}
      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-3xl border border-white/10 rounded-[40px] shadow-2xl overflow-hidden flex flex-col h-[600px] relative z-10">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-800/20 to-slate-900/20 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg shadow-white/20">
                <Sparkles className="text-black" size={24} />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-teal-400 border-2 border-slate-900 rounded-full shadow-[0_0_10px_rgba(45,212,191,0.5)]" />
            </div>
            <div>
              <h3 className="text-lg font-black italic text-white tracking-tighter uppercase">NEXUS IMEA</h3>
              <p className="text-[9px] text-white/40 font-bold uppercase tracking-[0.2em]">Sincronización Cuántica</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-white/40 hover:text-white transition-colors"><X size={24} /></button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
          {messages.map((msg, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] p-4 rounded-3xl text-sm font-medium ${msg.role === 'user' ? 'bg-white text-black rounded-tr-none' : 'bg-white/5 text-white/80 border border-white/5 rounded-tl-none'}`}>
                {msg.content}
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="p-4 rounded-3xl bg-white/5 text-white/40 text-[10px] font-black uppercase tracking-widest animate-pulse">
                IMEA está procesando...
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-6 bg-slate-950/50 border-t border-white/5">
          <div className="flex items-center gap-3 bg-white/5 p-2 pl-4 rounded-full border border-white/10 focus-within:border-purple-500/50 transition-all">
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Habla con IMEA..."
              className="flex-1 bg-transparent text-white text-sm outline-none font-medium"
            />
            <button 
              onClick={handleSend}
              className="p-3 bg-white text-black rounded-full hover:scale-105 active:scale-95 transition-all shadow-lg shadow-white/10"
            >
              <Send size={18} />
            </button>
          </div>
          
          <div className="flex justify-center gap-4 mt-6">
            <button className="flex flex-col items-center gap-1 opacity-40 hover:opacity-100 transition-opacity">
              <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center"><Ghost size={18} /></div>
              <span className="text-[8px] font-black uppercase tracking-tighter">Reportar</span>
            </button>
            <button className="flex flex-col items-center gap-1 opacity-40 hover:opacity-100 transition-opacity">
              <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center"><Brain size={18} /></div>
              <span className="text-[8px] font-black uppercase tracking-tighter">Bienestar</span>
            </button>
            <button className="flex flex-col items-center gap-1 opacity-40 hover:opacity-100 transition-opacity">
              <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center"><Shield size={18} /></div>
              <span className="text-[8px] font-black uppercase tracking-tighter">Seguridad</span>
            </button>
          </div>
        </div>
      </div>

      {/* Avatar Animation (Zoom in mind) */}
      {emotion === "triste" && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-xs flex flex-col items-center pointer-events-none"
        >
          <img src={currentUser.profilePic} alt="Me" className="w-32 h-32 rounded-full border-4 border-purple-500 shadow-2xl opacity-60 grayscale" />
          <div className="mt-4 p-4 bg-white/10 backdrop-blur-md rounded-2xl text-[10px] font-black uppercase text-purple-300">Entrando en modo introspectivo...</div>
        </motion.div>
      )}
    </motion.div>
  );
}
