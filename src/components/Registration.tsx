import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { User } from "../types";
import { 
  Heart, AlertTriangle, ShieldCheck, CheckCircle2, UserCheck, Eye, EyeOff, 
  Sparkles, Camera, Image as ImageIcon, Smile, ArrowRight, ArrowLeft, HeartHandshake, HelpCircle 
} from "lucide-react";

interface RegistrationProps {
  onRegisterComplete: (user: User) => void;
  onLoginSuccess: (user: User) => void;
  allUsers: User[];
}

export default function Registration({ onRegisterComplete, onLoginSuccess, allUsers }: RegistrationProps) {
  // Navigation states
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [step, setStep] = useState(0); // 0: Welcome/Terms, 1: Nickname, 2: Username, 3: Goals, 4: Age/Cam, 5: Orientation, 6: Hobbies, 7: Avatar/Photo, 8: Final Anim

  // Form Fields State
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [nickname, setNickname] = useState("");
  const [usernameInput, setUsernameInput] = useState("");
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [birthDate, setBirthDate] = useState("");
  const [calculatedAge, setCalculatedAge] = useState<number | null>(null);
  const [adultMonitoringOption, setAdultMonitoringOption] = useState<"parent" | "aimea" | null>(null);
  const [orientation, setOrientation] = useState("");
  const [isOrientationPublic, setIsOrientationPublic] = useState(true);
  const [hobbies, setHobbies] = useState<string[]>([]);
  const [customHobby, setCustomHobby] = useState("");
  const [showCustomHobbyInput, setShowCustomHobbyInput] = useState(false);
  const [isHobbiesPublic, setIsHobbiesPublic] = useState(true);
  const [avatarOption, setAvatarOption] = useState<"gallery" | "avatar">("avatar");
  const [selectedAvatarPic, setSelectedAvatarPic] = useState("https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80");
  const [isPicVerified, setIsPicVerified] = useState(true);
  const [verifyingPic, setVerifyingPic] = useState(false);

  // Camera Verification State
  const [camCountdown, setCamCountdown] = useState<number | null>(null);
  const [isCamActive, setIsCamActive] = useState(false);
  const [camSuccess, setCamSuccess] = useState<boolean | null>(null);
  const [camErrorMsg, setCamErrorMsg] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Login inputs
  const [loginUsername, setLoginUsername] = useState("");

  // Empowering username message list
  const usernameMessages = [
    "¡Bonito nombre, de seguro algunas personas lo tienen les parecerá hermoso!",
    "¡Ese nombre tiene una energía increíble! Definitivamente destacarás.",
    "¡Estiloso y único! Te define perfectamente.",
    "¡Brillante! Un nombre digno de un alma libre.",
    "¡Nos encanta! Suena fresco y moderno."
  ];
  const [selectedUsernameMsg, setSelectedUsernameMsg] = useState("");

  useEffect(() => {
    setSelectedUsernameMsg(usernameMessages[Math.floor(Math.random() * usernameMessages.length)]);
  }, [step === 2]);

  // Handle Age calculation
  const handleDateChange = (dateStr: string) => {
    setBirthDate(dateStr);
    if (!dateStr) {
      setCalculatedAge(null);
      return;
    }
    const today = new Date();
    const birth = new Date(dateStr);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    setCalculatedAge(age);
  };

  // Simulated AI Verification of avatar or selected image
  const verifyImageSafety = () => {
    setVerifyingPic(true);
    setTimeout(() => {
      setVerifyingPic(false);
      setIsPicVerified(true);
    }, 1500);
  };

  // Launch simulated camera age confirmation
  const startCameraScan = async () => {
    setIsCamActive(true);
    setCamCountdown(10);
    setCamSuccess(null);
    setCamErrorMsg("");

    // Try to get real webcam stream if available (since metadata says requested camera permission)
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.log("No real camera available, using cool interactive visual simulation");
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isCamActive && camCountdown !== null && camCountdown > 0) {
      timer = setTimeout(() => setCamCountdown(camCountdown - 1), 1000);
    } else if (isCamActive && camCountdown === 0) {
      // Analyze facial age match simulation
      const ageIsAdult = (calculatedAge || 0) >= 18;
      // In a real device we scan. Here we simulate successful verification:
      setCamSuccess(true);
      // Clean up webcam stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
      setIsCamActive(false);
    }
    return () => clearTimeout(timer);
  }, [isCamActive, camCountdown]);

  // Orientation feedback messages
  const getOrientationMsg = (or: string) => {
    switch (or) {
      case "Gay pasivo":
      case "Gay activo":
      case "Gay versátil":
        return "¡Aquí eres libre de ser tú mismo y te rodearemos de orgullo y hermandad! 🌈";
      case "Lesbiana":
        return "¡Orgullo de ser quien eres, en un ambiente libre de odio y lleno de sororidad! 💕";
      case "Bisexual":
      case "Pansexual":
        return "¡Tu capacidad de amar sin barreras es hermosa y totalmente bienvenida aquí! ❤️‍🔥";
      case "Hombre trans":
      case "Mujer trans":
        return "¡Tu valentía, identidad y transición son respetadas y celebradas! Fuerza y amor trans. 🏳️‍⚧️";
      case "No binario":
      case "Queer":
        return "¡Más allá de las etiquetas tradicionales, brillas con luz propia en este universo! 🌌";
      default:
        return "¡Todas las identidades y orientaciones son amadas y respetadas aquí! Siente la libertad. 🕊️";
    }
  };

  const goalsList = [
    { id: "amistad", label: "Hacer amistades verdaderas 🤝" },
    { id: "relacion", label: "Buscar una relación sentimental 💖" },
    { id: "ayuda", label: "Apoyo emocional y desahogo 🫂" },
    { id: "videos", label: "Ver videos graciosos y memes 🎬" },
    { id: "creativos", label: "Mostrar mi arte y creatividad 🎨" },
    { id: "historias", label: "Leer y escribir historias reales 📖" }
  ];

  const orientationList = [
    "Hetero", "Gay pasivo", "Gay versátil", "Gay activo", "Lesbiana", 
    "Bisexual", "Pansexual", "Hombre trans", "Mujer trans", "Asexual", 
    "Intersexual", "No binario", "Queer"
  ];

  const standardHobbies = [
    "Crear historias", "Ver series y películas", "Regar plantas", "Escribir", "Leer",
    "Ayudar personas", "Trabajar", "Jugar al aire libre", "Estudiar", "Comer",
    "Hacer ejercicio", "Limpiar", "Escuchar Música", "Ver TikTok", "Redes sociales"
  ];

  const avatars = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80"
  ];

  // Submission handler
  const handleFinalizeRegister = () => {
    if (!nickname || !usernameInput || !birthDate) return;

    const finalAge = calculatedAge || 15;
    if (finalAge < 13) return; // Prevented by rules

    const isAdult = finalAge >= 18;

    const newUser: User = {
      id: "user_" + Date.now(),
      username: usernameInput.toLowerCase().replace(/\s+/g, "_"),
      nickname: nickname,
      birthDate: birthDate,
      age: finalAge,
      orientation: orientation || "Prefiero no decirlo",
      isOrientationPublic: isOrientationPublic,
      profilePic: selectedAvatarPic,
      bio: `¡Hola! Me acabo de unir a Z App. Me apasiona: ${hobbies.join(", ")}.`,
      isAdult: isAdult,
      isParentMonitored: adultMonitoringOption === "parent",
      hobbies: hobbies,
      isHobbiesPublic: isHobbiesPublic,
      points: 100, // starting points
      isSuspended: false,
      bannedMultiaccounts: false,
      unlockedSkins: ["standard"],
      followers: [],
      following: []
    };

    setStep(8); // trigger huge Z animation
    setTimeout(() => {
      onRegisterComplete(newUser);
    }, 4000);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUsername) return;

    // Search user by username
    const found = allUsers.find(
      u => u.username.toLowerCase() === loginUsername.toLowerCase().trim()
    );

    if (found) {
      onLoginSuccess(found);
    } else {
      // Simulate creating a user if none found
      const guestUser: User = {
        id: "user_guest",
        username: loginUsername.toLowerCase().replace(/\s+/g, "_"),
        nickname: loginUsername,
        birthDate: "2010-05-20",
        age: 16,
        orientation: "Bisexual",
        isOrientationPublic: true,
        profilePic: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        bio: "¡Genial de estar aquí! Usuario de prueba.",
        isAdult: false,
        isParentMonitored: false,
        hobbies: ["Escuchar Música", "Ver TikTok"],
        isHobbiesPublic: true,
        points: 200,
        isSuspended: false,
        bannedMultiaccounts: false,
        unlockedSkins: ["standard"],
        followers: [],
        following: []
      };
      onLoginSuccess(guestUser);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between items-center p-6 relative overflow-hidden" id="registration-container">
      {/* Background radial effects */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-indigo-900/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-fuchsia-900/20 blur-[120px] pointer-events-none" />

      {/* Header */}
      <div className="w-full max-w-md flex justify-between items-center pt-2 z-10" id="reg-header">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-fuchsia-600 via-purple-600 to-indigo-600 flex items-center justify-center font-black text-2xl tracking-tighter shadow-[0_0_20px_rgba(168,85,247,0.4)] animate-pulse">
            Z
          </div>
          <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 to-indigo-400">
            Generación Libre
          </span>
        </div>
        {step > 0 && step < 8 && (
          <button 
            onClick={() => setStep(step - 1)}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 transition text-slate-400 hover:text-white"
            id="btn-back"
          >
            <ArrowLeft size={18} />
          </button>
        )}
      </div>

      {/* Main Container */}
      <div className="w-full max-w-md flex-1 flex flex-col justify-center my-8 z-10" id="reg-main-card">
        <AnimatePresence mode="wait">
          
          {/* STEP 0: Welcome / Authentication Type Choice */}
          {step === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: opacity => 0, y: -20 }}
              className="space-y-6"
              key="step-0"
              id="step-welcome"
            >
              <div className="text-center space-y-2">
                <span className="px-3 py-1 bg-fuchsia-500/10 text-fuchsia-400 text-xs font-bold rounded-full tracking-wider border border-fuchsia-500/20 uppercase">
                  Libertad • Inclusión • Seguridad
                </span>
                <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
                  {isLoginMode ? "¡Hola de nuevo, alma libre!" : "Tu espacio, sin máscaras."}
                </h1>
                <p className="text-slate-400 text-sm">
                  {isLoginMode ? "Ingresa para conectar con tu gente de forma ultra segura." : "Una red para expresarte, hacer amigos reales, hablar de tus emociones y divertirte sin hate."}
                </p>
              </div>

              {isLoginMode ? (
                // LOGIN FORM
                <form onSubmit={handleLoginSubmit} className="space-y-4" id="login-form">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Nombre de Usuario o Apodo</label>
                    <input 
                      type="text" 
                      placeholder="Ej: alexis_pasivo" 
                      required
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl focus:border-purple-500 focus:outline-none transition-all placeholder:text-slate-600 text-white font-semibold"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-bold tracking-wide transition shadow-lg shadow-purple-900/30 active:scale-95 flex items-center justify-center gap-2"
                    id="btn-login-submit"
                  >
                    Entrar <UserCheck size={18} />
                  </button>

                  <div className="text-center">
                    <button 
                      type="button" 
                      onClick={() => setIsLoginMode(false)}
                      className="text-sm font-semibold text-fuchsia-400 hover:underline"
                    >
                      ¿No tienes cuenta? Regístrate aquí
                    </button>
                  </div>
                </form>
              ) : (
                // SIGN UP CHOICES
                <div className="space-y-4" id="signup-choices">
                  <div className="space-y-3">
                    <button 
                      onClick={() => {
                        if (acceptedTerms) setStep(1);
                        else alert("Por favor, acepta las políticas de privacidad y seguridad primero.");
                      }}
                      className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold border border-slate-800 hover:border-slate-700 transition flex items-center justify-center gap-3"
                    >
                      <svg className="w-5 h-5 text-red-500 fill-current" viewBox="0 0 24 24">
                        <path d="M12.24 10.285V13.4h6.86c-.277 1.56-1.602 4.585-6.86 4.585-4.54 0-8.24-3.765-8.24-8.4s3.7-8.4 8.24-8.4c2.58 0 4.307 1.095 5.298 2.045l2.465-2.37C18.435 1.21 15.62 0 12.24 0 5.58 0 0 5.37 0 12s5.58 12 12.24 12c6.96 0 11.57-4.83 11.57-11.79 0-.795-.085-1.4-.195-1.925H12.24z"/>
                      </svg>
                      Continuar con Google
                    </button>
                    <button 
                      onClick={() => {
                        if (acceptedTerms) setStep(1);
                        else alert("Por favor, acepta las políticas de privacidad y seguridad primero.");
                      }}
                      className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold border border-slate-800 hover:border-slate-700 transition flex items-center justify-center gap-3"
                    >
                      <svg className="w-5 h-5 text-blue-500 fill-current" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      Continuar con Facebook
                    </button>
                    <div className="flex items-center my-4">
                      <div className="flex-1 h-px bg-slate-900"></div>
                      <span className="px-3 text-slate-600 text-xs font-bold uppercase tracking-widest">O con tu correo</span>
                      <div className="flex-1 h-px bg-slate-900"></div>
                    </div>
                    <button 
                      onClick={() => {
                        if (acceptedTerms) setStep(1);
                        else alert("Por favor, acepta las políticas de privacidad y seguridad primero.");
                      }}
                      className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-bold tracking-wide transition shadow-lg shadow-purple-950/40 active:scale-[0.98]"
                      id="btn-register-email"
                    >
                      Registrarse con Email o Celular
                    </button>
                  </div>

                  <div className="text-center pt-2">
                    <button 
                      onClick={() => setIsLoginMode(true)}
                      className="text-sm font-semibold text-fuchsia-400 hover:underline"
                    >
                      ¿Ya tienes una cuenta? Iniciar Sesión
                    </button>
                  </div>
                </div>
              )}

              {/* POLICIES / PRIVACY CHECKBOX (WITH ANIMATED ✔) */}
              <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-900 space-y-3 z-10" id="terms-box">
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => setAcceptedTerms(!acceptedTerms)}
                    className={`flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                      acceptedTerms 
                        ? "bg-fuchsia-500 border-fuchsia-400 text-white shadow-[0_0_10px_rgba(244,63,94,0.3)]" 
                        : "border-slate-700 bg-slate-950 text-transparent hover:border-slate-500"
                    }`}
                    id="terms-checkbox"
                  >
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: acceptedTerms ? 1 : 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 20 }}
                    >
                      <CheckCircle2 size={16} className="fill-current text-white stroke-[3px]" />
                    </motion.span>
                  </button>
                  <p className="text-xs text-slate-400 leading-relaxed select-none">
                    Al continuar, declaro que tengo control de mis datos, acepto los{" "}
                    <span className="text-fuchsia-400 font-bold hover:underline cursor-pointer">Términos del Servicio</span> y las{" "}
                    <span className="text-indigo-400 font-bold hover:underline cursor-pointer">Políticas de Privacidad y Seguridad</span>.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 1: Conversational - What's your name? */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-6"
              key="step-1"
            >
              <div className="space-y-2">
                <h2 className="text-2xl font-extrabold text-fuchsia-400">
                  Hola, alma libre, primero lo primero...
                </h2>
                <h3 className="text-xl font-bold">
                  ¿Cómo te gustaría que te llamáramos?
                </h3>
                <p className="text-xs text-slate-400 leading-normal">
                  Necesitamos saberlo para cuando haya un evento, advertencia o algo, llamarte así. No es necesario poner tu verdadero nombre, puedes usar un apodo. 😉
                </p>
              </div>

              <div className="space-y-4">
                <input 
                  type="text" 
                  placeholder="Tu nombre o apodo cool..."
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full px-4 py-3.5 bg-slate-900 border border-slate-800 rounded-xl focus:border-purple-500 focus:outline-none text-white font-semibold placeholder:text-slate-600 text-lg"
                  id="input-nickname"
                />
                <button 
                  disabled={!nickname.trim()}
                  onClick={() => setStep(2)}
                  className="w-full py-4 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-lg"
                >
                  Siguiente paso <ArrowRight size={18} />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Conversational - Username */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-6"
              key="step-2"
            >
              <div className="space-y-2">
                <h2 className="text-2xl font-extrabold text-indigo-400">
                  ¡Excelente elección!
                </h2>
                <h3 className="text-xl font-bold">
                  ¿Cómo quieres tu nombre de usuario?
                </h3>
                <p className="text-xs text-slate-400 leading-normal">
                  Con este nombre único las demás personas te identificarán en toda la plataforma. ¡Ponle tu estilo!
                </p>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-slate-600 font-bold">@</span>
                  <input 
                    type="text" 
                    placeholder="ej_alexis_pasivo"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                    className="w-full pl-8 pr-4 py-3.5 bg-slate-900 border border-slate-800 rounded-xl focus:border-purple-500 focus:outline-none text-white font-semibold placeholder:text-slate-600 text-lg"
                    id="input-username"
                  />
                </div>

                {usernameInput && (
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="p-3.5 bg-indigo-950/40 rounded-xl border border-indigo-900/40 text-xs font-semibold text-indigo-300 italic flex items-center gap-2"
                  >
                    <Sparkles size={16} className="text-fuchsia-400 flex-shrink-0" />
                    <span>"{selectedUsernameMsg}"</span>
                  </motion.div>
                )}

                <button 
                  disabled={!usernameInput.trim()}
                  onClick={() => setStep(3)}
                  className="w-full py-4 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-lg"
                >
                  Continuar <ArrowRight size={18} />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Goals - What would you like to find? */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-6"
              key="step-3"
            >
              <div className="space-y-2">
                <h2 className="text-2xl font-extrabold text-fuchsia-400">
                  ¡Hola {nickname}! Let's customize...
                </h2>
                <h3 className="text-xl font-bold">
                  ¿Qué te gustaría encontrar en la app?
                </h3>
                <p className="text-xs text-slate-400">
                  Selecciona una o más opciones para conectarte con gente que busque lo mismo.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
                {goalsList.map((g) => {
                  const isSelected = selectedGoals.includes(g.id);
                  return (
                    <button
                      key={g.id}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedGoals(selectedGoals.filter(id => id !== g.id));
                        } else {
                          setSelectedGoals([...selectedGoals, g.id]);
                        }
                      }}
                      className={`w-full p-4 rounded-xl text-left font-semibold border text-sm transition-all flex items-center justify-between ${
                        isSelected 
                          ? "bg-purple-900/30 border-purple-500 text-purple-200 shadow-md" 
                          : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      <span>{g.label}</span>
                      {isSelected && <CheckCircle2 size={16} className="text-purple-400" />}
                    </button>
                  );
                })}
              </div>

              <button 
                disabled={selectedGoals.length === 0}
                onClick={() => setStep(4)}
                className="w-full py-4 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-lg"
              >
                Siguiente <ArrowRight size={18} />
              </button>
            </motion.div>
          )}

          {/* STEP 4: Age verification and facial recognition scanner */}
          {step === 4 && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-6"
              key="step-4"
            >
              <div className="space-y-2">
                <h2 className="text-2xl font-extrabold text-indigo-400">
                  Queremos protegerte
                </h2>
                <h3 className="text-xl font-bold">
                  ¿Qué edad tienes? 🎂
                </h3>
                <p className="text-xs text-slate-400">
                  Por seguridad calculamos tu edad exacta. Queremos recordarla para avisarle a tus amigos en tu cumpleaños, si tú lo deseas.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex gap-2 items-center">
                  <input 
                    type="date" 
                    onChange={(e) => handleDateChange(e.target.value)}
                    value={birthDate}
                    className="flex-1 px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl focus:border-purple-500 focus:outline-none text-white font-bold text-center"
                  />
                  {calculatedAge !== null && (
                    <div className={`text-2xl font-black px-4 py-2 rounded-xl border ${
                      calculatedAge < 18 ? "bg-red-900/20 border-red-500 text-red-400" : "bg-green-900/20 border-green-500 text-green-400"
                    }`}>
                      ({calculatedAge})
                    </div>
                  )}
                </div>

                {/* AGE EXCLUSIONS / WARNINGS */}
                {calculatedAge !== null && calculatedAge < 13 && (
                  <div className="p-4 bg-red-950/40 border border-red-500/50 rounded-xl text-center space-y-3">
                    <AlertTriangle className="mx-auto text-red-500" size={32} />
                    <p className="text-xs font-bold text-red-300">
                      Por tu seguridad, no puedes entrar a esta app. Debes tener al menos 13 años o más.
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Te sugerimos descargar nuestra futura app "Z-Mini" ultra mega segura para menores de 12 años, la cual requerirá consentimiento legal directo de tus padres. ¡Cerrando registro!
                    </p>
                    <button 
                      onClick={() => {
                        alert("Redirigiendo a Z-Mini App Store...");
                        window.location.reload();
                      }}
                      className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-xs font-bold transition"
                    >
                      Ir a Z-Mini
                    </button>
                  </div>
                )}

                {calculatedAge !== null && calculatedAge >= 13 && calculatedAge < 18 && (
                  <div className="space-y-4">
                    <div className="p-3.5 bg-amber-950/30 border border-amber-500/40 rounded-xl text-xs space-y-2 text-amber-200">
                      <div className="flex items-center gap-2 font-bold text-amber-400">
                        <AlertTriangle size={16} />
                        <span>¡Advertencia ⚠️! Eres menor de edad</span>
                      </div>
                      <p className="leading-relaxed text-[11px]">
                        Por tu seguridad te recomendamos que al terminar de crear tu cuenta, aceptes que tus padres o tutor legal observen tu cuenta.
                      </p>
                      
                      <div className="flex flex-col gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setAdultMonitoringOption("parent")}
                          className={`p-2.5 rounded-lg border text-left font-semibold text-xs transition-all ${
                            adultMonitoringOption === "parent" 
                              ? "bg-amber-500/20 border-amber-400 text-white" 
                              : "bg-slate-900/50 border-slate-800 text-slate-400 hover:bg-slate-900"
                          }`}
                        >
                          🟢 Seguir creando la cuenta (con monitoreo de tutor)
                        </button>
                        <button
                          type="button"
                          onClick={() => setAdultMonitoringOption("aimea")}
                          className={`p-2.5 rounded-lg border text-left font-semibold text-xs transition-all ${
                            adultMonitoringOption === "aimea" 
                              ? "bg-amber-500/20 border-amber-400 text-white" 
                              : "bg-slate-900/50 border-slate-800 text-slate-400 hover:bg-slate-900"
                          }`}
                        >
                          🔴 Seguir creándola sin adulto (Monitoreo de IA IMEA)
                        </button>
                      </div>
                    </div>

                    {adultMonitoringOption === "aimea" && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 bg-purple-950/20 border border-purple-500/30 rounded-xl text-[11px] leading-relaxed text-purple-300 space-y-2"
                      >
                        <p className="font-bold">🔐 Monitoreo de Seguridad de IA:</p>
                        <p>
                          ¡No te preocupes! Al salir de la app, la asistente AI monitoreará la cuenta por seguridad. Tus fotos, chats, audios y gustos no serán vistos por ninguna persona física ni siquiera el creador de la app.
                        </p>
                      </motion.div>
                    )}
                  </div>
                )}

                {/* CAMERA BIOMETRIC SCANNER (REQUIRED FOR BOTH) */}
                {calculatedAge !== null && calculatedAge >= 13 && (
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3 text-center">
                    <div className="flex items-center justify-center gap-2 text-indigo-400 font-bold text-sm">
                      <Camera size={18} />
                      <span>Confirmación de Edad Biométrica</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      {calculatedAge >= 18 
                        ? "Confirmaremos facialmente en 10 segundos tu adultez para permitir contenido +18." 
                        : "Escanearemos rápidamente para asegurar que tu edad coincide con la fecha declarada."}
                    </p>

                    {camCountdown === null && !camSuccess && (
                      <button
                        onClick={startCameraScan}
                        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition"
                      >
                        Iniciar Escaneo Facial (Cámara)
                      </button>
                    )}

                    {camCountdown !== null && (
                      <div className="space-y-2">
                        {/* Video feedback simulation */}
                        <div className="w-full h-44 bg-slate-950 rounded-lg relative overflow-hidden flex items-center justify-center border border-purple-500/30">
                          {stream ? (
                            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover transform scale-x-[-1]" />
                          ) : (
                            <div className="text-center space-y-2 text-slate-600">
                              <UserCheck size={40} className="mx-auto animate-bounce text-purple-500/70" />
                              <span className="text-[10px] uppercase tracking-widest font-mono">Simulando Video de Cámara</span>
                            </div>
                          )}
                          {/* Laser scanning line */}
                          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent animate-[scan_2s_infinite] shadow-[0_0_12px_#a855f7]" />
                          
                          <div className="absolute bottom-2 right-2 bg-slate-900/80 px-2 py-1 rounded text-xs font-mono text-purple-400">
                            PROCESANDO: {camCountdown}s
                          </div>
                        </div>
                        <p className="text-xs text-purple-400 font-medium">Analizando rasgos faciales en tiempo real...</p>
                      </div>
                    )}

                    {camSuccess && (
                      <div className="p-3 bg-green-950/30 border border-green-500/30 rounded-lg text-xs text-green-400 flex items-center justify-center gap-2">
                        <CheckCircle2 size={16} />
                        <span className="font-bold">¡Verificación Facial Correcta! Rostro validado.</span>
                      </div>
                    )}
                  </div>
                )}

                {/* SUBMIT STEP */}
                {calculatedAge !== null && calculatedAge >= 13 && (
                  <button 
                    disabled={!camSuccess || (calculatedAge < 18 && !adultMonitoringOption)}
                    onClick={() => setStep(5)}
                    className="w-full py-4 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-lg"
                  >
                    Confirmar Edad e Identidad <ArrowRight size={18} />
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* STEP 5: Sexual Orientation & Gender Identity (Inclusive) */}
          {step === 5 && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-5"
              key="step-5"
            >
              {/* Headings and background graphics description */}
              <div className="space-y-2">
                <h2 className="text-2xl font-extrabold text-fuchsia-400">
                  Aquí todos somos aceptados
                </h2>
                <h3 className="text-lg font-bold">
                  ¿Con cuál de estos te identificas? 🏳️‍🌈✨
                </h3>
                <p className="text-xs text-slate-400">
                  Z App es una zona libre de odio. Tu orientación nos ayuda a encontrarte gente afín. Puedes elegir mantenerla pública o privada.
                </p>
              </div>

              {/* Doubtful/Thinking people illustrative backdrop container */}
              <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-900 flex items-center gap-3">
                <div className="text-2xl">🤔💭🙋‍♀️🙋‍♂️</div>
                <p className="text-[11px] text-slate-400 leading-normal">
                  No importa de dónde vengas ni cómo ames. Queremos que te sientas cómodo. Elige libremente.
                </p>
              </div>

              {/* Grid of Orientations */}
              <div className="grid grid-cols-3 gap-1.5 max-h-[180px] overflow-y-auto pr-1">
                {orientationList.map((or) => (
                  <button
                    key={or}
                    onClick={() => setOrientation(or)}
                    className={`p-2.5 rounded-lg border text-xs font-bold text-center transition-all ${
                      orientation === or 
                        ? "bg-gradient-to-tr from-fuchsia-600 to-purple-600 border-fuchsia-400 text-white" 
                        : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    {or}
                  </button>
                ))}
                <button
                  onClick={() => setOrientation("Prefiero no decirlo")}
                  className={`col-span-3 p-2.5 rounded-lg border text-xs font-bold text-center transition-all ${
                    orientation === "Prefiero no decirlo" 
                      ? "bg-purple-900/40 border-purple-500 text-white" 
                      : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  Prefiero no decirlo
                </button>
              </div>

              {orientation && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3.5 bg-fuchsia-950/20 border border-fuchsia-500/30 rounded-xl text-xs font-semibold text-fuchsia-300 flex items-start gap-2.5"
                >
                  <Heart size={16} className="text-fuchsia-500 flex-shrink-0 mt-0.5" />
                  <p>{getOrientationMsg(orientation)}</p>
                </motion.div>
              )}

              {/* Privacy Toggle */}
              <div className="flex items-center justify-between p-3.5 bg-slate-900 rounded-xl border border-slate-800">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold">Mostrar orientación en perfil</span>
                  <p className="text-[10px] text-slate-500">Permite que otros usuarios la vean para conocerte mejor.</p>
                </div>
                <button
                  onClick={() => setIsOrientationPublic(!isOrientationPublic)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                    isOrientationPublic ? "bg-green-600/20 border border-green-500/50 text-green-300" : "bg-slate-800 text-slate-400 border border-slate-700"
                  }`}
                >
                  {isOrientationPublic ? (
                    <>
                      <Eye size={12} /> Público
                    </>
                  ) : (
                    <>
                      <EyeOff size={12} /> Privado
                    </>
                  )}
                </button>
              </div>

              <button 
                disabled={!orientation}
                onClick={() => setStep(6)}
                className="w-full py-4 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-lg"
              >
                Continuar <ArrowRight size={18} />
              </button>
            </motion.div>
          )}

          {/* STEP 6: Interests and Hobbies selection */}
          {step === 6 && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-6"
              key="step-6"
            >
              <div className="space-y-2">
                <h2 className="text-2xl font-extrabold text-indigo-400">
                  ¡Casi listos!
                </h2>
                <h3 className="text-xl font-bold">
                  ¿Qué tipo de cosas te gustan hacer? 🌿📖
                </h3>
                <p className="text-xs text-slate-400">
                  Selecciona tus hobbies para que otros usuarios con los mismos gustos busquen tu contenido fácilmente.
                </p>
              </div>

              {/* Hobbies Selection */}
              <div className="grid grid-cols-2 gap-2 max-h-[160px] overflow-y-auto pr-1">
                {standardHobbies.map((h) => {
                  const isSelected = hobbies.includes(h);
                  return (
                    <button
                      key={h}
                      onClick={() => {
                        if (isSelected) {
                          setHobbies(hobbies.filter(x => x !== h));
                        } else {
                          setHobbies([...hobbies, h]);
                        }
                      }}
                      className={`p-2.5 rounded-lg text-left text-xs font-semibold border transition-all ${
                        isSelected 
                          ? "bg-indigo-950/40 border-indigo-500 text-white" 
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800"
                      }`}
                    >
                      {h}
                    </button>
                  );
                })}
              </div>

              {/* Custom hobby writer option */}
              <div className="space-y-2">
                {!showCustomHobbyInput ? (
                  <button
                    onClick={() => setShowCustomHobbyInput(true)}
                    className="text-xs text-fuchsia-400 hover:underline font-bold"
                  >
                    ✍️ ¿No encuentras lo tuyo? Descríbelo tú mismo
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Escribe tu hobby..."
                      value={customHobby}
                      onChange={(e) => setCustomHobby(e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      onClick={() => {
                        if (customHobby.trim()) {
                          setHobbies([...hobbies, customHobby.trim()]);
                          setCustomHobby("");
                          setShowCustomHobbyInput(false);
                        }
                      }}
                      className="px-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-bold"
                    >
                      Añadir
                    </button>
                  </div>
                )}
              </div>

              {/* Privacy Choice */}
              <div className="flex items-center justify-between p-3.5 bg-slate-900 rounded-xl border border-slate-800">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold">Mantener hobbies públicos</span>
                  <p className="text-[10px] text-slate-500">Muestra tus gustos en tu perfil para encontrar amigos.</p>
                </div>
                <button
                  onClick={() => setIsHobbiesPublic(!isHobbiesPublic)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                    isHobbiesPublic ? "bg-green-600/20 border border-green-500/50 text-green-300" : "bg-slate-800 text-slate-400 border border-slate-700"
                  }`}
                >
                  {isHobbiesPublic ? <Eye size={12} /> : <EyeOff size={12} />}
                  {isHobbiesPublic ? "Público" : "Privado"}
                </button>
              </div>

              <button 
                disabled={hobbies.length === 0}
                onClick={() => setStep(7)}
                className="w-full py-4 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-lg"
              >
                Paso Final <ArrowRight size={18} />
              </button>
            </motion.div>
          )}

          {/* STEP 7: Profile Photo / Custom Avatar AI checked */}
          {step === 7 && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-6"
              key="step-7"
            >
              <div className="space-y-2">
                <h2 className="text-2xl font-extrabold text-fuchsia-400">
                  ¡La foto de portada!
                </h2>
                <h3 className="text-xl font-bold">
                  Sube tu foto de perfil 🖼️✨
                </h3>
                <p className="text-xs text-slate-400">
                  Crea tu personaje estilo "Z-avatar" o selecciona una foto de tu galería.
                </p>
              </div>

              {/* Warning rule */}
              <div className="p-3 bg-red-950/20 border border-red-500/30 rounded-xl text-[11px] leading-relaxed text-red-300">
                ⚠️ <span className="font-bold">Reglas de la app:</span> Por seguridad y moderación, no se permiten fotos semidesnudas, en paños menores, gore, drogas, violencia, etc. La foto será verificada automáticamente por el sistema antes de publicar (nadie más podrá ver esta verificación).
              </div>

              {/* Selector */}
              <div className="flex gap-2">
                <button
                  onClick={() => setAvatarOption("avatar")}
                  className={`flex-1 py-2.5 rounded-lg border text-xs font-bold transition-all ${
                    avatarOption === "avatar" ? "bg-purple-600 border-purple-500 text-white" : "bg-slate-900 border-slate-800 text-slate-400"
                  }`}
                >
                  Crear Z-Avatar
                </button>
                <button
                  onClick={() => setAvatarOption("gallery")}
                  className={`flex-1 py-2.5 rounded-lg border text-xs font-bold transition-all ${
                    avatarOption === "gallery" ? "bg-purple-600 border-purple-500 text-white" : "bg-slate-900 border-slate-800 text-slate-400"
                  }`}
                >
                  Subir de Galería
                </button>
              </div>

              {/* Avatar picker simulation */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full border-4 border-fuchsia-500 overflow-hidden shadow-xl bg-slate-900">
                    <img src={selectedAvatarPic} alt="Selected profile" className="w-full h-full object-cover" />
                  </div>
                  {verifyingPic && (
                    <div className="absolute inset-0 bg-slate-950/80 rounded-full flex items-center justify-center">
                      <span className="text-[10px] font-bold text-fuchsia-400 animate-pulse">VERIFICANDO...</span>
                    </div>
                  )}
                  {isPicVerified && !verifyingPic && (
                    <div className="absolute bottom-0 right-0 bg-green-500 text-white p-1 rounded-full border-2 border-slate-950">
                      <ShieldCheck size={16} />
                    </div>
                  )}
                </div>

                {avatarOption === "avatar" ? (
                  <div className="space-y-2 text-center w-full">
                    <span className="text-xs text-slate-400">Elige tu estilo preestablecido:</span>
                    <div className="flex justify-center gap-2">
                      {avatars.map((av, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setSelectedAvatarPic(av);
                            verifyImageSafety();
                          }}
                          className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all ${
                            selectedAvatarPic === av ? "border-fuchsia-500 scale-110" : "border-slate-800 hover:border-slate-600"
                          }`}
                        >
                          <img src={av} alt="Avatar opt" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="w-full">
                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-slate-800 border-dashed rounded-xl cursor-pointer bg-slate-900 hover:bg-slate-800/80 transition-all">
                      <div className="flex flex-col items-center justify-center pt-4 pb-4">
                        <ImageIcon size={24} className="text-slate-500 mb-2" />
                        <p className="text-xs text-slate-400 font-bold">Seleccionar archivo de tu dispositivo</p>
                        <p className="text-[9px] text-slate-600 mt-1">Soporta PNG, JPG, GIF</p>
                      </div>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const url = URL.createObjectURL(file);
                            setSelectedAvatarPic(url);
                            verifyImageSafety();
                          }
                        }}
                      />
                    </label>
                  </div>
                )}
              </div>

              <button 
                disabled={!isPicVerified || verifyingPic}
                onClick={handleFinalizeRegister}
                className="w-full py-4 bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-purple-900/30"
              >
                ¡Crear Mi Cuenta! ✨ <ArrowRight size={18} />
              </button>
            </motion.div>
          )}

          {/* STEP 8: HUGE Z CREATION SUCCESS ANIMATION */}
          {step === 8 && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center space-y-8 py-12 flex flex-col items-center justify-center"
              key="step-8"
            >
              {/* Massive nebulous Z container */}
              <div className="relative flex items-center justify-center w-48 h-48 rounded-full border-4 border-fuchsia-500/30 bg-purple-950/20 shadow-[0_0_50px_rgba(168,85,247,0.3)]" id="giant-z-frame">
                {/* Simulated spinning nebula border */}
                <div className="absolute inset-0 rounded-full border-t-4 border-b-4 border-fuchsia-500 animate-[spin_4s_linear_infinite]" />
                <div className="absolute inset-2 rounded-full border-r-4 border-l-4 border-indigo-500 animate-[spin_6s_linear_infinite]" />
                
                {/* The glowing Big Z */}
                <span className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-tr from-fuchsia-400 via-purple-500 to-indigo-400 select-none animate-[pulse_1.5s_infinite]">
                  Z
                </span>
              </div>

              <div className="space-y-2 animate-bounce">
                <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 to-indigo-400">
                  ¡GENIAL, TU CUENTA HA SIDO CREADA!
                </h1>
                <p className="text-slate-400 text-sm font-semibold max-w-xs mx-auto">
                  Bienvenido a la revolución social de la Generación Z. Redirigiéndote al feed principal...
                </p>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Footer Branding */}
      <div className="w-full text-center py-4 z-10" id="reg-footer">
        <p className="text-[10px] text-slate-600 font-mono tracking-widest uppercase">
          Z APP • SECURE WORKSPACE PLATFORM 2026
        </p>
      </div>
    </div>
  );
}
