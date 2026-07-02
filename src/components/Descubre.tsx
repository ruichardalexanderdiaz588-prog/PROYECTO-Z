import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { User, Chat } from "../types";
import { 
  MessageSquare, Mic, Tv, HelpCircle, Users, ArrowRight, AlertTriangle, 
  X, Check, Timer, Sparkles, Smile, ShieldAlert, Navigation, Send 
} from "lucide-react";

interface DescubreProps {
  currentUser: User;
  allUsers: User[];
  onSelectUserForProfile: (user: User) => void;
  onStartDirectChat: (targetUser: User) => void;
}

export default function Descubre({ currentUser, allUsers, onSelectUserForProfile, onStartDirectChat }: DescubreProps) {
  
  // Discover game mode choice
  // null: Main explore feed, 'text': text match, 'audio': audio match, 'video': video match, 'bottle': drift bottle
  const [activeGameMode, setActiveGameMode] = useState<"text" | "audio" | "video" | "bottle" | null>(null);

  // General Filter Selections for Matches
  const [filterOrientation, setFilterOrientation] = useState<string>("Cualquier persona");
  const [filterAgeRange, setFilterAgeRange] = useState<"todos" | "menor" | "adulto">("todos");
  
  // Game state
  const [gameState, setGameState] = useState<"setup" | "warning" | "searching" | "matched" | "completed">("setup");
  const [matchedUser, setMatchedUser] = useState<User | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(180);
  const [gameMessages, setGameMessages] = useState<{ sender: "user" | "match"; text: string }[]>([]);
  const [inputText, setInputText] = useState("");

  // Video call visual options
  const [hideCameraInVideoCall, setHideCameraInVideoCall] = useState(false);

  // Bottle drift mode states
  const [bottleAction, setBottleAction] = useState<"choice" | "write" | "fish">("choice");
  const [bottleMessage, setBottleMessage] = useState("");
  const [driftBottles, setDriftBottles] = useState<{ id: string; sender: User; text: string }[]>([
    {
      id: "bot_1",
      sender: allUsers.find(u => u.id === "user_sofia") || allUsers[0],
      text: "Hola almas libres! Busco amigos para hablar de pintura o música indie. ¡Suelta tu mensaje!"
    },
    {
      id: "bot_2",
      sender: allUsers.find(u => u.id === "user_juan") || allUsers[0],
      text: "Entrenando duro hoy. ¿Alguien para motivarse mutuamente con rutinas fitness? +18"
    }
  ]);
  const [fishedBottle, setFishedBottle] = useState<{ id: string; sender: User; text: string } | null>(null);

  // Match preference choices
  const orientations = ["Cualquier persona", "Hetero", "Gay pasivo", "Gay versátil", "Gay activo", "Lesbiana", "Bisexual", "Pansexual", "No binario", "Queer"];

  // Search trigger for matches
  const handleStartSearching = () => {
    // Check if minor matching with adult -> trigger age warning first
    const isMinor = !currentUser.isAdult;
    const wantsAdult = filterAgeRange === "adulto";

    if (isMinor && wantsAdult) {
      setGameState("warning");
    } else {
      executeMatching();
    }
  };

  const executeMatching = () => {
    setGameState("searching");
    setTimeout(() => {
      // Find suitable candidate from mock database
      let candidates = allUsers.filter(u => u.id !== currentUser.id);
      
      // Filter by orientation preference
      if (filterOrientation !== "Cualquier persona") {
        candidates = candidates.filter(u => u.orientation === filterOrientation);
      }

      // Filter by age preference
      if (filterAgeRange === "menor") {
        candidates = candidates.filter(u => !u.isAdult);
      } else if (filterAgeRange === "adulto") {
        candidates = candidates.filter(u => u.isAdult);
      }

      // Fallback if no matching user found
      const finalMatch = candidates.length > 0 
        ? candidates[Math.floor(Math.random() * candidates.length)] 
        : allUsers.find(u => u.id !== currentUser.id) || allUsers[0];

      setMatchedUser(finalMatch);
      setGameState("matched");
      setTimerSeconds(180);
      setGameMessages([
        { sender: "match", text: `¡Hola! Me alegra haber hecho match contigo. ¿Qué tal va tu día?` }
      ]);
    }, 2500);
  };

  // Chat game countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameState === "matched" && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev - 1);
      }, 1000);
    } else if (gameState === "matched" && timerSeconds === 0) {
      setGameState("completed");
    }
    return () => clearInterval(interval);
  }, [gameState, timerSeconds]);

  // Send message in match room
  const handleSendMatchMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setGameMessages(prev => [...prev, { sender: "user", text: inputText.trim() }]);
    setInputText("");

    // Simulate match typing response
    setTimeout(() => {
      const matchResponses = [
        "¡Qué interesante! Me gusta mucho hablar contigo.",
        "Oye, compartimos bastantes cosas en común, qué cool.",
        "Totalmente de acuerdo, la verdad. Z App es súper segura para esto.",
        "¡Jajaja qué gracioso! Me caes excelente.",
        "Qué chulo. Cuéntame más sobre lo que te gusta hacer."
      ];
      setGameMessages(prev => [...prev, { 
        sender: "match", 
        text: matchResponses[Math.floor(Math.random() * matchResponses.length)] 
      }]);
    }, 1500);
  };

  // Launch bottle
  const handleLaunchBottle = () => {
    if (!bottleMessage.trim()) return;

    // Filter minors warning
    const wantsAdult = filterAgeRange === "adulto";
    if (!currentUser.isAdult && wantsAdult) {
      alert("🚨 Alerta IMEA: Por seguridad como menor de edad, al lanzar esta botella se le advierte tener precaución con respuestas de adultos.");
    }

    const newBottle = {
      id: "bot_" + Date.now(),
      sender: currentUser,
      text: bottleMessage
    };

    setDriftBottles([newBottle, ...driftBottles]);
    setBottleMessage("");
    alert("🍾 ¡Botella lanzada al mar digital con éxito! Espera a que alguien la recoja.");
    setBottleAction("choice");
  };

  // Pick up bottle
  const handleFishBottle = () => {
    const candidates = driftBottles.filter(b => b.sender.id !== currentUser.id);
    if (candidates.length === 0) {
      alert("🌊 El mar digital está en calma por ahora. No se pescaron botellas.");
      return;
    }

    const randomBot = candidates[Math.floor(Math.random() * candidates.length)];
    setFishedBottle(randomBot);
    setBottleAction("fish");
  };

  // Exit match room
  const resetGame = () => {
    setActiveGameMode(null);
    setGameState("setup");
    setMatchedUser(null);
    setGameMessages([]);
    setFilterOrientation("Cualquier persona");
    setFilterAgeRange("todos");
  };

  return (
    <div className="space-y-6" id="discover-panel">
      
      {/* 1. SETUP GAME CHOICES MENU */}
      {activeGameMode === null && (
        <div className="space-y-6" id="explore-front-menu">
          {/* User Suggestion Slider Header */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-slate-300">Descubre personas de la comunidad</h4>
            <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none" id="suggestions-profiles">
              {allUsers.filter(u => u.id !== currentUser.id).map(user => (
                <button
                  key={user.id}
                  onClick={() => onSelectUserForProfile(user)}
                  className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-center space-y-2 flex-shrink-0 w-24 hover:border-purple-500 transition-all"
                >
                  <img src={user.profilePic} alt={user.nickname} className="w-12 h-12 rounded-full mx-auto object-cover border-2 border-slate-800" />
                  <div>
                    <p className="text-xs font-bold truncate text-slate-200">{user.nickname}</p>
                    <span className="text-[9px] text-slate-500 font-mono">({user.age})</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Interactive channels grids */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-300">Canales de interacción instantánea</h4>
            
            <div className="grid grid-cols-2 gap-3" id="discover-games-grid">
              
              {/* CARD 1: CONOCE POR TEXTO */}
              <button
                onClick={() => setActiveGameMode("text")}
                className="p-4 bg-slate-900 hover:bg-slate-800/80 rounded-2xl text-left border border-slate-800 transition-all flex flex-col justify-between h-36 relative overflow-hidden group"
                id="btn-discover-text"
              >
                <div className="absolute top-[-10%] right-[-10%] w-16 h-16 rounded-full bg-emerald-500/10 blur-xl group-hover:bg-emerald-500/20" />
                <MessageSquare className="text-emerald-500" size={24} />
                <div>
                  <h5 className="font-extrabold text-sm text-white">Conoce por texto</h5>
                  <p className="text-[10px] text-emerald-400 font-bold uppercase mt-1">🗨️ Chat de 180s</p>
                </div>
              </button>

              {/* CARD 2: CONOCE POR AUDIO */}
              <button
                onClick={() => setActiveGameMode("audio")}
                className="p-4 bg-slate-900 hover:bg-slate-800/80 rounded-2xl text-left border border-slate-800 transition-all flex flex-col justify-between h-36 relative overflow-hidden group"
                id="btn-discover-audio"
              >
                <div className="absolute top-[-10%] right-[-10%] w-16 h-16 rounded-full bg-sky-500/10 blur-xl group-hover:bg-sky-500/20" />
                <Mic className="text-sky-400" size={24} />
                <div>
                  <h5 className="font-extrabold text-sm text-white">Conoce por audio</h5>
                  <p className="text-[10px] text-sky-400 font-bold uppercase mt-1">🎤 Llamada de Voz</p>
                </div>
              </button>

              {/* CARD 3: CONOCE POR VIDEO */}
              <button
                onClick={() => setActiveGameMode("video")}
                className="p-4 bg-slate-900 hover:bg-slate-800/80 rounded-2xl text-left border border-slate-800 transition-all flex flex-col justify-between h-36 relative overflow-hidden group"
                id="btn-discover-video"
              >
                <div className="absolute top-[-10%] right-[-10%] w-16 h-16 rounded-full bg-fuchsia-500/10 blur-xl group-hover:bg-fuchsia-500/20" />
                <Tv className="text-fuchsia-400" size={24} />
                <div>
                  <h5 className="font-extrabold text-sm text-white">Conoce por video</h5>
                  <p className="text-[10px] text-fuchsia-400 font-bold uppercase mt-1">📺 Video llamada</p>
                </div>
              </button>

              {/* CARD 4: CONOCE CON BOTELLA A LA DERIVA */}
              <button
                onClick={() => {
                  setActiveGameMode("bottle");
                  setBottleAction("choice");
                }}
                className="p-4 bg-slate-900 hover:bg-slate-800/80 rounded-2xl text-left border border-slate-800 transition-all flex flex-col justify-between h-36 relative overflow-hidden group"
                id="btn-discover-bottle"
              >
                <div className="absolute top-[-10%] right-[-10%] w-16 h-16 rounded-full bg-amber-500/10 blur-xl group-hover:bg-amber-500/20" />
                <Navigation className="text-amber-500 transform rotate-45" size={24} />
                <div>
                  <h5 className="font-extrabold text-sm text-white">Botellas a la deriva</h5>
                  <p className="text-[10px] text-amber-500 font-bold uppercase mt-1">🍾 Mensajes al Mar</p>
                </div>
              </button>

            </div>
          </div>
        </div>
      )}

      {/* 2. MATCH MAKING SETUP INTERFACES */}
      {activeGameMode !== null && activeGameMode !== "bottle" && gameState === "setup" && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-5"
          id="match-setup-panel"
        >
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h4 className="font-bold flex items-center gap-2">
              {activeGameMode === "text" && <MessageSquare className="text-emerald-500" size={18} />}
              {activeGameMode === "audio" && <Mic className="text-sky-400" size={18} />}
              {activeGameMode === "video" && <Tv className="text-fuchsia-400" size={18} />}
              <span>Configura tu emparejamiento</span>
            </h4>
            <button onClick={resetGame} className="text-slate-400 hover:text-white font-bold">✕</button>
          </div>

          {/* Orientation Filter */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400">¿Qué tipo de persona quieres conocer?</span>
            <select
              value={filterOrientation}
              onChange={(e) => setFilterOrientation(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
            >
              {orientations.map(or => (
                <option key={or} value={or}>{or}</option>
              ))}
            </select>
          </div>

          {/* Age Group Filter */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400">Rango de edad</span>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setFilterAgeRange("todos")}
                className={`p-2 rounded-lg text-xs font-bold border transition ${
                  filterAgeRange === "todos" ? "bg-purple-600 border-purple-500 text-white" : "bg-slate-950 border-slate-800 text-slate-400"
                }`}
              >
                Cualquiera
              </button>
              <button
                onClick={() => setFilterAgeRange("menor")}
                className={`p-2 rounded-lg text-xs font-bold border transition ${
                  filterAgeRange === "menor" ? "bg-purple-600 border-purple-500 text-white" : "bg-slate-950 border-slate-800 text-slate-400"
                }`}
              >
                Menor de Edad
              </button>
              <button
                onClick={() => setFilterAgeRange("adulto")}
                className={`p-2 rounded-lg text-xs font-bold border transition ${
                  filterAgeRange === "adulto" ? "bg-purple-600 border-purple-500 text-white" : "bg-slate-950 border-slate-800 text-slate-400"
                }`}
              >
                Mayor de Edad
              </button>
            </div>
          </div>

          {/* Video call options fallback filter */}
          {activeGameMode === "video" && (
            <div className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl">
              <div className="space-y-0.5">
                <span className="text-xs font-bold">Ocultar mi cámara</span>
                <p className="text-[10px] text-slate-500">Muestra tu perfil/avatar en vez de video.</p>
              </div>
              <input
                type="checkbox"
                checked={hideCameraInVideoCall}
                onChange={(e) => setHideCameraInVideoCall(e.target.checked)}
                className="w-4 h-4 text-purple-600 bg-slate-950 border-slate-800 rounded focus:ring-purple-500"
              />
            </div>
          )}

          <button
            onClick={handleStartSearching}
            className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl transition"
            id="btn-execute-matching"
          >
            Iniciar Búsqueda de Match ✨
          </button>
        </motion.div>
      )}

      {/* 3. UNDER AGE WARNINGS FOR CONNECTIONS */}
      {gameState === "warning" && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-900 border border-red-500/40 p-5 rounded-2xl space-y-4 text-center"
          id="minor-matching-warning"
        >
          <AlertTriangle className="mx-auto text-red-500 animate-bounce" size={40} />
          <h4 className="font-black text-red-400">¿Estás seguro de que quieres conocer a una persona mayor?</h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            Has seleccionado conocer a una persona mayor de edad (+18) siendo menor de edad. Por tu protección y seguridad digital, IMEA monitorea las conversaciones.
          </p>
          <p className="text-[11px] text-slate-500">
            Recuerda: en cualquier momento, si te sientes incómodo, acosado, o si te solicitan información privada/fotos corporales, puedes salirte inmediatamente de la sala o reportar al usuario para suspender su cuenta.
          </p>
          <div className="flex gap-2 pt-2">
            <button
              onClick={resetGame}
              className="flex-1 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-bold text-slate-400"
            >
              Cancelar
            </button>
            <button
              onClick={() => executeMatching()}
              className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 rounded-lg text-xs font-bold text-white"
            >
              Sí, estoy seguro
            </button>
          </div>
        </motion.div>
      )}

      {/* 4. SEARCHING SCREEN */}
      {gameState === "searching" && (
        <div className="py-16 text-center space-y-6 bg-slate-900/40 rounded-2xl border border-slate-800" id="searching-screen">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin" />
            <div className="absolute inset-2 rounded-full border-4 border-indigo-500/20 border-b-indigo-500 animate-[spin_1s_linear_infinite_reverse]" />
            <Smile className="absolute inset-0 m-auto text-purple-400 animate-pulse" size={24} />
          </div>
          <div className="space-y-1">
            <h4 className="font-extrabold text-sm text-white animate-pulse">Buscando el Match perfecto...</h4>
            <p className="text-xs text-slate-500">Conectando canales seguros de moderación biométrica IMEA.</p>
          </div>
        </div>
      )}

      {/* 5. MATCH ROOM (CHAT GRUPAL OR VOICE PANEL WITH 180S LIMIT) */}
      {gameState === "matched" && matchedUser && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col h-[480px]"
          id="match-room"
        >
          {/* Match Room Header */}
          <div className="p-3 border-b border-slate-800 bg-slate-950/50 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <img src={matchedUser.profilePic} alt={matchedUser.nickname} className="w-8 h-8 rounded-full object-cover border-2 border-purple-500/40" />
              <div>
                <h5 className="text-xs font-bold text-white">{matchedUser.nickname}</h5>
                <span className="text-[9px] text-fuchsia-400 font-mono font-bold uppercase">{matchedUser.orientation} • {matchedUser.age} años</span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-purple-950/40 border border-purple-900/60 px-2.5 py-1 rounded-lg text-purple-300 text-xs font-bold">
              <Timer size={14} className="animate-pulse" />
              <span>{Math.floor(timerSeconds / 60)}:{(timerSeconds % 60).toString().padStart(2, "0")}s</span>
            </div>
          </div>

          {/* Chat room content depending on mode */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3" id="match-content-area">
            
            {activeGameMode === "text" && (
              <>
                <div className="p-3 bg-slate-950 rounded-xl text-[10px] text-slate-500 leading-relaxed text-center">
                  💬 Sala de chat de texto activa por 180 segundos. Conversen respetuosamente. Al expirar, decidan si desean entablar amistad permanente.
                </div>
                {gameMessages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`p-3 rounded-xl text-xs max-w-[80%] ${
                      msg.sender === "user" ? "bg-purple-600 text-white rounded-tr-none" : "bg-slate-950 border border-slate-800 text-slate-300 rounded-tl-none"
                    }`}>
                      <p>{msg.text}</p>
                    </div>
                  </div>
                ))}
              </>
            )}

            {activeGameMode === "audio" && (
              <div className="h-full flex flex-col items-center justify-center space-y-4" id="audio-call-sim">
                <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-sky-500/10 border-2 border-sky-500/30">
                  <div className="absolute inset-[-10px] rounded-full border border-sky-500/20 animate-ping" />
                  <Mic size={32} className="text-sky-400" />
                </div>
                <div className="text-center space-y-1">
                  <h4 className="text-sm font-bold text-white">Llamada de voz de audio en curso...</h4>
                  <p className="text-xs text-slate-400">Señal de audio encriptada y monitoreada por IMEA.</p>
                </div>
                {/* Match Profile fully visible */}
                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800/80 w-full max-w-xs space-y-1 text-center">
                  <img src={matchedUser.profilePic} alt="pic" className="w-10 h-10 rounded-full mx-auto object-cover" />
                  <span className="text-xs font-bold text-white block">{matchedUser.nickname}</span>
                  <p className="text-[10px] text-slate-500">{matchedUser.bio}</p>
                </div>
              </div>
            )}

            {activeGameMode === "video" && (
              <div className="h-full grid grid-rows-2 gap-2" id="video-call-sim">
                {/* Peer webcam */}
                <div className="bg-slate-950 rounded-xl overflow-hidden relative border border-fuchsia-500/20">
                  <img src={matchedUser.profilePic} alt="Peer Cam" className="w-full h-full object-cover transform scale-x-[-1]" />
                  <span className="absolute bottom-2 left-2 bg-slate-900/80 px-2 py-0.5 rounded text-[10px] font-bold text-fuchsia-400 uppercase">Cámara de {matchedUser.nickname}</span>
                </div>

                {/* Self webcam (avatar fallback if hideCamera) */}
                <div className="bg-slate-950 rounded-xl overflow-hidden relative border border-slate-800">
                  {hideCameraInVideoCall ? (
                    <div className="w-full h-full flex flex-col items-center justify-center space-y-1">
                      <img src={currentUser.profilePic} alt="avatar" className="w-12 h-12 rounded-full object-cover" />
                      <span className="text-[10px] text-slate-500">Cámara oculta (modo avatar)</span>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500 font-mono text-[10px]">
                      [Cámara propia activa simulada]
                    </div>
                  )}
                  <span className="absolute bottom-2 left-2 bg-slate-900/80 px-2 py-0.5 rounded text-[10px] font-bold text-slate-400">Tú (Cámara)</span>
                </div>
              </div>
            )}

          </div>

          {/* Message input bar for text call */}
          {activeGameMode === "text" && (
            <form onSubmit={handleSendMatchMessage} className="p-3 bg-slate-950/80 border-t border-slate-800 flex gap-2">
              <input 
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Escribe algo amigable para charlar..."
                className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
              />
              <button type="submit" className="p-2.5 bg-purple-600 rounded-xl text-white">
                <Send size={14} />
              </button>
            </form>
          )}

          {/* Quick exit bar */}
          <div className="p-2 border-t border-slate-800 bg-slate-950/30 flex justify-end">
            <button 
              onClick={resetGame}
              className="px-3 py-1 bg-red-950/40 border border-red-500/30 hover:bg-red-900 rounded-lg text-[10px] font-bold text-red-400"
            >
              Salir de la llamada
            </button>
          </div>
        </motion.div>
      )}

      {/* 6. POST-MATCH DECISION STEP */}
      {gameState === "completed" && matchedUser && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-center space-y-4"
          id="post-match-decision"
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-fuchsia-600 to-indigo-600 p-1 mx-auto shadow-lg shadow-purple-900/30">
            <img src={matchedUser.profilePic} alt="pic" className="w-full h-full rounded-full object-cover" />
          </div>

          <div className="space-y-1">
            <h4 className="font-extrabold text-sm text-white">¿Te gustaría conservar el chat permanente con {matchedUser.nickname}?</h4>
            <p className="text-xs text-slate-400">Los 180 segundos han expirado. Decidan mutuamente si quieren seguir conversando.</p>
          </div>

          <div className="flex gap-2.5 pt-2">
            <button
              onClick={resetGame}
              className="flex-1 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-slate-400"
            >
              No, gracias (Salir)
            </button>
            <button
              onClick={() => {
                onStartDirectChat(matchedUser);
                alert("¡Match aceptado! Se ha creado una conversación permanente en la pestaña de Chats.");
                resetGame();
              }}
              className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl transition shadow-md shadow-purple-950/30"
              id="btn-accept-chat"
            >
              Sí, acepto el chat 👍
            </button>
          </div>
        </motion.div>
      )}

      {/* 7. DRIFT BOTTLE GAME BOARD SCREEN */}
      {activeGameMode === "bottle" && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4"
          id="drift-bottle-room"
        >
          {/* Header */}
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
              <Navigation className="text-amber-500 transform rotate-45" size={18} />
              <span>Mar de Botellas a la Deriva</span>
            </h4>
            <button onClick={resetGame} className="text-slate-400 hover:text-white font-bold">✕</button>
          </div>

          {bottleAction === "choice" && (
            <div className="space-y-4 text-center py-6">
              <span className="text-3xl animate-bounce block">🍾🌊📨</span>
              <p className="text-xs text-slate-300">
                Escribe un mensaje de botella para lanzarlo al mar, o recoge una botella enviada por otra persona al azar.
              </p>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setBottleAction("write")}
                  className="flex-1 py-3.5 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-bold rounded-xl transition"
                >
                  📨 Lanzar una Botella
                </button>
                <button
                  onClick={handleFishBottle}
                  className="flex-1 py-3.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl transition"
                  id="btn-fish-bottle"
                >
                  🎣 Pescar una Botella
                </button>
              </div>
            </div>
          )}

          {bottleAction === "write" && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-400">Tu mensaje secreto en la botella:</span>
                <textarea
                  placeholder="Hola, soy un alma libre y me encantaría hablar de..."
                  value={bottleMessage}
                  onChange={(e) => setBottleMessage(e.target.value)}
                  rows={4}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Targets select */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block mb-1">Destinatario (Orientación)</span>
                  <select 
                    value={filterOrientation}
                    onChange={(e) => setFilterOrientation(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  >
                    {orientations.map(or => (
                      <option key={or} value={or}>{or}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block mb-1">Edad</span>
                  <select 
                    value={filterAgeRange}
                    onChange={(e) => setFilterAgeRange(e.target.value as any)}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white"
                  >
                    <option value="todos">Cualquiera</option>
                    <option value="menor">Menor</option>
                    <option value="adulto">Adulto</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  onClick={() => setBottleAction("choice")}
                  className="flex-1 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-bold text-slate-400"
                >
                  Atrás
                </button>
                <button
                  disabled={!bottleMessage.trim()}
                  onClick={handleLaunchBottle}
                  className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-lg transition"
                >
                  Lanzar Botella 🍾
                </button>
              </div>
            </div>
          )}

          {bottleAction === "fish" && fishedBottle && (
            <div className="space-y-4 text-center">
              <span className="text-4xl animate-pulse block">🍾✨</span>
              <p className="text-xs text-slate-400">Has recogido una botella lanzada por:</p>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <img src={fishedBottle.sender.profilePic} alt="sender" className="w-8 h-8 rounded-full object-cover" />
                  <span className="font-bold text-xs text-white">{fishedBottle.sender.nickname}</span>
                  <span className="text-[10px] text-amber-400">({fishedBottle.sender.age} años)</span>
                </div>
                <p className="text-xs text-slate-300 italic">"{fishedBottle.text}"</p>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  onClick={() => setBottleAction("choice")}
                  className="flex-1 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-bold text-slate-400"
                >
                  Lanzar de vuelta al mar 🌊
                </button>
                <button
                  onClick={() => {
                    onStartDirectChat(fishedBottle.sender);
                    alert(`¡Botella aceptada! Se ha iniciado una conversación permanente con ${fishedBottle.sender.nickname}`);
                    resetGame();
                  }}
                  className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-lg transition"
                >
                  Responder Botella 📨
                </button>
              </div>
            </div>
          )}

        </motion.div>
      )}

    </div>
  );
}
