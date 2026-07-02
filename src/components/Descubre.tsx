import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { User } from "../types";
import { 
  Search, MessageSquare, Mic, Play, Anchor, ArrowRight, Heart, X, Send, Filter, Sparkles, Zap
} from "lucide-react";

interface DescubreProps {
  currentUser: User;
  onTriggerNotification: (title: string, content: string, type: string) => void;
}

export default function Descubre({ currentUser, onTriggerNotification }: DescubreProps) {
  const [activeSection, setActiveSection] = useState<"text" | "audio" | "video" | "bottle" | null>(null);

  const sections = [
    { id: "text", title: "RELATOS & PENSAMIENTOS", icon: <MessageSquare size={32} />, color: "from-blue-600 to-indigo-600", desc: "Lee lo que otros están escribiendo en tiempo real." },
    { id: "audio", title: "CÁPSULAS DE VOZ", icon: <Mic size={32} />, color: "from-purple-600 to-pink-600", desc: "Escucha susurros y anécdotas de voz de 15 segundos." },
    { id: "video", title: "MOMENTOS NEXUS", icon: <Play size={32} />, color: "from-amber-500 to-orange-600", desc: "Videos cortos de lo que está pasando ahora mismo." },
    { id: "bottle", title: "BOTELLAS AL MAR", icon: <Anchor size={32} />, color: "from-emerald-500 to-teal-600", desc: "Lanza un mensaje anónimo al azar y espera respuesta." }
  ];

  return (
    <div className="flex flex-col h-full bg-slate-950 pb-20">
      
      <AnimatePresence mode="wait">
        {!activeSection ? (
          <motion.div 
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 p-6 flex flex-col"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-black italic tracking-tighter text-white">DESCUBRE</h2>
              <div className="flex gap-2">
                <button className="p-3 bg-white/5 rounded-2xl text-white/40"><Search size={20}/></button>
                <button className="p-3 bg-white/5 rounded-2xl text-white/40"><Filter size={20}/></button>
              </div>
            </div>

            <div className="flex-1 flex flex-col gap-4">
              {sections.map((s, idx) => (
                <motion.div 
                  key={s.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => setActiveSection(s.id as any)}
                  className={`flex-1 group relative rounded-[40px] overflow-hidden cursor-pointer border border-white/5`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${s.color} opacity-40 group-hover:opacity-60 transition-opacity duration-500`} />
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                  
                  <div className="relative h-full p-8 flex items-center gap-6">
                    <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-500 border border-white/10 shadow-2xl">
                      {s.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-black italic text-white tracking-tighter">{s.title}</h3>
                      <p className="text-[10px] text-white/60 font-bold uppercase tracking-widest mt-1">{s.desc}</p>
                    </div>
                    <ArrowRight className="text-white/40 group-hover:text-white group-hover:translate-x-2 transition-all" size={24} />
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 p-6 bg-white/5 rounded-[40px] border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-black shadow-xl shadow-white/20">
                  <Sparkles size={24} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white italic">NEXUS AI SUGGEST</h4>
                  <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest">Gente con tus mismos hobbies</p>
                </div>
              </div>
              <button className="px-6 py-2 bg-white text-black rounded-full text-[10px] font-black uppercase tracking-widest">VER GENTE</button>
            </div>
          </motion.div>
        ) : (
          <SectionDetail section={activeSection} onBack={() => setActiveSection(null)} currentUser={currentUser} />
        )}
      </AnimatePresence>
    </div>
  );
}

function SectionDetail({ section, onBack, currentUser }: { section: string, onBack: () => void, currentUser: User }) {
  return (
    <motion.div 
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 100, opacity: 0 }}
      className="flex-1 flex flex-col bg-slate-900"
    >
      <div className="p-6 flex items-center justify-between border-b border-white/5">
        <button onClick={onBack} className="p-3 bg-white/5 rounded-full text-white"><X size={20}/></button>
        <h3 className="text-lg font-black italic text-white uppercase tracking-tighter">{section.replace('_', ' ')}</h3>
        <div className="w-10" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6">
        <div className="w-32 h-32 bg-white/5 rounded-full flex items-center justify-center animate-pulse">
           <Zap className="text-white/20" size={48} />
        </div>
        <div>
          <h4 className="text-2xl font-black italic text-white tracking-tighter">SINCRONIZANDO...</h4>
          <p className="text-xs text-white/40 font-bold uppercase tracking-[0.2em] mt-2">Buscando contenido de {section} para {currentUser.nickname}</p>
        </div>
      </div>
    </motion.div>
  );
}
