import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { User } from "../types";
import { 
  Sparkles, Camera, Image as ImageIcon, Smile, ArrowRight, ArrowLeft, HeartHandshake, HelpCircle, Shield, AlertTriangle, Heart, User as UserIcon 
} from "lucide-react";

import { 
  getFirebaseAuth, googleProvider 
} from "../lib/firebase";
import { 
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from "firebase/auth";
import { getSupabase } from "../lib/supabase";

interface RegistrationProps {
  onRegisterComplete: (user: User) => void;
  onLoginSuccess: (user: User) => void;
}

const ORIENTATIONS = [
  "Hetero", "Gay pasivo", "Gay versátil", "Gay activo", "Lesbiana", "Bisexual", 
  "Pansexual", "Hombre trans", "Mujer trans", "Asexual", "Intersexual", "No binario", "Queer"
];

const ORIENTATION_MESSAGES: Record<string, string> = {
  "Hetero": "¡Bienvenido! Aquí celebramos la diversidad y el respeto mutuo.",
  "Gay pasivo": "Tu autenticidad es tu fuerza. ¡Estamos felices de tenerte!",
  "Gay versátil": "Libertad y orgullo. Aquí puedes ser tú mismo sin juicios.",
  "Gay activo": "Eres valiente al mostrarte tal cual eres. ¡Bienvenido a la comunidad!",
  "Lesbiana": "Amor es amor. Celebramos tu identidad y tu camino.",
  "Bisexual": "La fluidez es parte de la belleza humana. ¡Bienvenido!",
  "Pansexual": "Tu capacidad de amar sin fronteras es inspiradora.",
  "Hombre trans": "Reconocemos tu transición y tu verdadera esencia con respeto.",
  "Mujer trans": "Tu identidad es válida y hermosa. ¡Z App es tu espacio seguro!",
  "Asexual": "La identidad asexual es una parte vital de nuestro espectro. ¡Bienvenido!",
  "Intersexual": "La diversidad biológica y de identidad nos hace más fuertes.",
  "No binario": "Más allá de las etiquetas, estamos aquí para escucharte.",
  "Queer": "Celebramos tu perspectiva única y tu libertad de ser."
};

export default function Registration({ onRegisterComplete, onLoginSuccess }: RegistrationProps) {
  // Navigation states
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0); 

  // Form Fields State
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [nickname, setNickname] = useState("");
  const [usernameInput, setUsernameInput] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [calculatedAge, setCalculatedAge] = useState<number | null>(null);
  const [orientation, setOrientation] = useState("");
  const [isOrientationPublic, setIsOrientationPublic] = useState(true);
  const [adultMonitoringOption, setAdultMonitoringOption] = useState<"parent" | "ai" | null>(null);
  const [hobbies, setHobbies] = useState<string[]>([]);
  const [isHobbiesPublic, setIsHobbiesPublic] = useState(true);
  const [bio, setBio] = useState("");
  const [profilePic, setProfilePic] = useState("https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80");
  
  // Auth states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginIdentifier, setLoginIdentifier] = useState(""); // Email or username
  const [loginPassword, setLoginPassword] = useState("");

  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraCountdown, setCameraCountdown] = useState(0);

  // STEP MESSAGES
  const WELCOME_MESSAGES = [
    "¡Bonito nombre, de seguro algunas personas les parecerá bonito!",
    "¡Qué nombre tan genial! Irradia mucha energía positiva.",
    "Un nombre digno de un alma libre. ¡Me encanta!",
    "¡Excelente elección! Ese nombre suena muy bien en NEXUS."
  ];
  const [randomWelcome, setRandomWelcome] = useState("");

  useEffect(() => {
    setRandomWelcome(WELCOME_MESSAGES[Math.floor(Math.random() * WELCOME_MESSAGES.length)]);
  }, [step]);

  // Age calculation
  useEffect(() => {
    if (birthDate) {
      const birth = new Date(birthDate);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      setCalculatedAge(age);
      
      if (age < 13 && age > 0) {
        alert("Por tu seguridad, no puedes entrar a esta app, debes tener al menos 13 años. Te sugerimos que uses YouTube Kids.");
        setBirthDate("");
        setCalculatedAge(null);
      }
    }
  }, [birthDate]);

  const startCameraVerification = () => {
    setCameraActive(true);
    setCameraCountdown(10);
    navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
      if (videoRef.current) videoRef.current.srcObject = stream;
    });

    const timer = setInterval(() => {
      setCameraCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setCameraActive(false);
          if (videoRef.current?.srcObject) {
            (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
          }
          setStep(step + 1);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleGoogleLogin = async () => {
    if (!acceptedTerms) {
      alert("Por favor, acepta los términos primero.");
      return;
    }
    setLoading(true);
    try {
      const result = await signInWithPopup(getFirebaseAuth(), googleProvider);
      const fbUser = result.user;

      const { data: existingUser } = await getSupabase()
        .from("users")
        .select("*")
        .eq("email", fbUser.email)
        .single();

      if (existingUser) {
        onLoginSuccess(existingUser as User);
      } else {
        // New user from Google -> Onboarding
        setNickname(fbUser.displayName || "");
        setEmail(fbUser.email || "");
        setStep(10); // Start the onboarding steps (Friendly nickname step)
      }
    } catch (error: any) {
      console.error("Error with Google Login:", error);
      alert("Hubo un error al iniciar sesión con Google.");
    } finally {
      setLoading(false);
    }
  };

  const handleFinalizeRegister = async () => {
    if (!nickname || !calculatedAge) return;

    const isAdult = (calculatedAge || 0) >= 18;
    const userData = {
      id: getFirebaseAuth().currentUser?.uid || "user_" + Date.now(),
      username: usernameInput || "user_" + Date.now(),
      nickname,
      email: getFirebaseAuth().currentUser?.email || "",
      birth_date: birthDate,
      age: calculatedAge,
      orientation,
      is_orientation_public: isOrientationPublic,
      profile_pic: profilePic,
      bio,
      is_adult: isAdult,
      is_parent_monitored: adultMonitoringOption === "parent",
      hobbies,
      is_hobbies_public: isHobbiesPublic,
      points: 100,
      is_suspended: false,
      banned_multiaccounts: false,
      unlocked_skins: ["standard"],
      followers: [],
      following: []
    };

    setStep(9); 
    
    try {
      const { error } = await getSupabase().from("users").upsert([userData]);
      if (error) throw error;
      
      const newUser: User = {
        id: userData.id,
        username: userData.username,
        nickname: userData.nickname,
        email: userData.email,
        birthDate: userData.birth_date,
        age: userData.age,
        orientation: userData.orientation,
        isOrientationPublic: userData.is_orientation_public,
        profilePic: userData.profile_pic,
        bio: userData.bio,
        isAdult: userData.is_adult,
        isParentMonitored: userData.is_parent_monitored,
        hobbies: userData.hobbies,
        isHobbiesPublic: userData.is_hobbies_public,
        points: userData.points,
        isSuspended: userData.is_suspended,
        bannedMultiaccounts: userData.banned_multiaccounts,
        unlockedSkins: userData.unlocked_skins,
        followers: userData.followers,
        following: userData.following
      };

      setTimeout(() => {
        onRegisterComplete(newUser);
      }, 3000);
    } catch (err) {
      console.error("Error saving to Supabase:", err);
      alert("Error al crear cuenta.");
      setStep(7);
    }
  };

  const handleEmailRegister = async () => {
    if (!email || !password) {
      alert("Por favor completa los campos.");
      return;
    }
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(getFirebaseAuth(), email, password);
      setStep(10); // Start onboarding
    } catch (error: any) {
      console.error("Error with Email Register:", error);
      alert("Error al crear cuenta: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!loginIdentifier || !loginPassword) return;
    setLoading(true);

    try {
      let emailToUse = loginIdentifier;
      if (!loginIdentifier.includes('@')) {
        const { data } = await getSupabase()
          .from("users")
          .select("email")
          .eq("username", loginIdentifier)
          .single();
        if (data?.email) {
          emailToUse = data.email;
        }
      }

      const result = await signInWithEmailAndPassword(getFirebaseAuth(), emailToUse, loginPassword);
      
      const { data: user } = await getSupabase()
        .from("users")
        .select("*")
        .eq("id", result.user.uid)
        .single();

      if (user) {
        onLoginSuccess(user as User);
      } else {
        alert("Usuario no encontrado en la base de datos de NEXUS.");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        alert("Login error:\nFirebase: Error (auth/invalid-credential).");
      } else if (err.code === "auth/unauthorized-domain") {
        alert("Error with Google Login:\nFirebase: Error (auth/unauthorized-domain).");
      } else {
        alert("Error al iniciar sesión: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 overflow-hidden relative font-sans">
      
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-teal-500/5 rounded-full blur-[150px]" />
      </div>

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="step0" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="w-full max-w-md space-y-8 text-center">
            <div className="space-y-2">
              <h1 className="text-6xl font-black text-white italic tracking-tighter">NEXUS</h1>
              <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">Red de Almas Libres</p>
            </div>
            
            <div className="bg-white/5 border border-white/10 p-8 rounded-[40px] space-y-6 backdrop-blur-xl">
              <button 
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 bg-white text-black p-5 rounded-[24px] font-black uppercase tracking-widest hover:bg-white/90 transition-all active:scale-95 shadow-xl shadow-white/5"
              >
                <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
                Continuar con Google
              </button>
              
              <div className="flex items-center gap-4 py-2">
                <div className="h-[1px] flex-1 bg-white/10" />
                <span className="text-white/20 text-[10px] font-black uppercase">o acceso manual</span>
                <div className="h-[1px] flex-1 bg-white/10" />
              </div>

              <div className="space-y-3">
                <input 
                  type="text" 
                  placeholder="USUARIO O EMAIL" 
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 p-5 rounded-[24px] text-white text-xs font-black placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-all uppercase tracking-widest"
                />
                <input 
                  type="password" 
                  placeholder="CONTRASEÑA" 
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 p-5 rounded-[24px] text-white text-xs font-black placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-all uppercase tracking-widest"
                />
                <button 
                  onClick={handleLoginSubmit}
                  className="w-full bg-white/10 border border-white/10 p-5 rounded-[24px] text-white text-xs font-black uppercase tracking-widest hover:bg-white/20 transition-all"
                >
                  Entrar a NEXUS
                </button>
              </div>
            </div>

            <div className="flex flex-col items-center gap-6">
              <button 
                onClick={() => setStep(11)}
                className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] hover:text-white transition-colors"
              >
                ¿Nuevo aquí? Iniciar Protocolo
              </button>
              
              <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/10">
                <button 
                  onClick={() => setAcceptedTerms(!acceptedTerms)}
                  className={`w-6 h-6 rounded-lg border-2 border-white/20 flex items-center justify-center transition-all ${acceptedTerms ? 'bg-white border-white' : ''}`}
                >
                  {acceptedTerms && <span className="text-black text-[10px] font-black">✔</span>}
                </button>
                <p className="text-[9px] text-white/30 font-bold leading-relaxed text-left uppercase tracking-tight">
                  Al aceptar, acepta los <span className="text-white/60">términos y políticas de privacidad</span> de NEXUS.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 11: MANUAL EMAIL REGISTER START */}
        {step === 11 && (
          <motion.div key="step11" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="w-full max-w-md space-y-8 text-center">
            <h2 className="text-4xl font-black text-white italic tracking-tighter">REGISTRO MANUAL</h2>
            <div className="space-y-4">
              <input 
                type="email" 
                placeholder="EMAIL" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 p-5 rounded-[24px] text-white text-xs font-black placeholder:text-white/20 focus:outline-none tracking-widest"
              />
              <input 
                type="password" 
                placeholder="CONTRASEÑA" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 p-5 rounded-[24px] text-white text-xs font-black placeholder:text-white/20 focus:outline-none tracking-widest"
              />
            </div>
            <div className="flex gap-4">
              <button onClick={() => setStep(0)} className="p-5 bg-white/5 text-white/40 rounded-[24px] border border-white/10"><ArrowLeft size={24} /></button>
              <button 
                disabled={!email || !password || loading}
                onClick={async () => {
                   setLoading(true);
                   try {
                     await createUserWithEmailAndPassword(getFirebaseAuth(), email, password);
                     setStep(10);
                   } catch (err: any) { alert(err.message); }
                   finally { setLoading(false); }
                }}
                className="flex-1 py-5 bg-white text-black rounded-[32px] font-black uppercase tracking-widest"
              >
                Continuar
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 10: NICKNAME */}
        {step === 10 && (
          <motion.div key="step10" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full max-w-md space-y-8 text-center px-6">
            <div className="space-y-4">
              <h2 className="text-4xl font-black text-white italic tracking-tighter leading-tight">
                Hola, alma libre, primero lo primero...... ¿Cómo te gustaría que te llamáramos?
              </h2>
              <p className="text-white/40 text-[11px] font-bold uppercase tracking-widest px-4">
                Necesitamos saberlo para cuando haya un evento o advertencia o algo, llamarte así, no es necesario poner tu verdadero nombre, puedes poner un apodo etc.
              </p>
            </div>
            
            <div className="space-y-6">
              <input 
                type="text" 
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Escribe tu apodo aquí..."
                className="w-full bg-white/5 border-b-2 border-white/10 p-6 text-white text-3xl font-black focus:border-white outline-none transition-all placeholder:text-white/10 uppercase"
              />
              <button 
                disabled={!nickname}
                onClick={() => setStep(12)}
                className="w-full py-6 bg-white text-black rounded-[32px] font-black uppercase tracking-[0.2em] disabled:opacity-20 transition-all"
              >
                Siguiente Paso
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 12: USERNAME */}
        {step === 12 && (
          <motion.div key="step12" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="w-full max-w-md space-y-8 text-center px-6">
            <div className="space-y-4">
              <h2 className="text-4xl font-black text-white italic tracking-tighter leading-tight">
                ¿Cómo quieres llamarte?
              </h2>
              <p className="text-white/40 text-[11px] font-bold uppercase tracking-widest px-4">
                Pon tu nombre de usuario aquí. Con ese nombre las demás personas te identificarán.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 font-black text-2xl">@</span>
                <input 
                  type="text" 
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value.toLowerCase().replace(/\s/g, ''))}
                  placeholder="usuario"
                  className="w-full bg-white/5 border border-white/10 p-6 pl-12 rounded-[32px] text-white text-2xl font-black focus:border-white outline-none transition-all placeholder:text-white/10"
                />
              </div>
              
              {usernameInput && (
                <p className="text-white/60 text-xs font-bold italic animate-pulse">
                  {randomWelcome}
                </p>
              )}

              <button 
                disabled={!usernameInput}
                onClick={() => setStep(13)}
                className="w-full py-6 bg-white text-black rounded-[32px] font-black uppercase tracking-[0.2em] disabled:opacity-20 transition-all"
              >
                Continuar
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 13: INTERESTS */}
        {step === 13 && (
          <motion.div key="step13" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="w-full max-w-md space-y-8 text-center">
            <div className="space-y-2">
              <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-tight">¿Qué te gustaría encontrar en la app?</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-3 px-4 h-[350px] overflow-y-auto no-scrollbar">
              {[
                "Crear historias", "Ver series y películas", "Regar plantas", "Escribir", "Leer", 
                "Ayudar personas", "Trabajar", "Jugar al aire libre", "Estudiar", "Comer", 
                "Hacer ejercicio", "Limpiar", "Escuchar Música", "Ver TikTok", "Relaciones", "Amistad"
              ].map(item => (
                <button
                  key={item}
                  onClick={() => {
                    if (hobbies.includes(item)) setHobbies(hobbies.filter(h => h !== item));
                    else setHobbies([...hobbies, item]);
                  }}
                  className={`p-4 rounded-[24px] text-[10px] font-black uppercase tracking-widest border transition-all ${
                    hobbies.includes(item) ? 'bg-white text-black border-white' : 'bg-white/5 text-white/40 border-white/10 hover:bg-white/10'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="px-4">
              <button 
                onClick={() => setStep(14)}
                className="w-full py-6 bg-white text-black rounded-[32px] font-black uppercase tracking-[0.2em] transition-all"
              >
                Siguiente
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 14: AGE */}
        {step === 14 && (
          <motion.div key="step14" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-md space-y-8 text-center px-6">
            <div className="space-y-4">
              <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">¿Qué edad tienes?</h2>
              <p className="text-white/40 text-[11px] font-bold uppercase tracking-widest px-4 leading-relaxed">
                Queremos saberlo para en un futuro avisarle a tus amigos o personas que es tu cumpleaños, si usted desea, claro.
              </p>
            </div>

            <div className="space-y-8">
              <div className="relative inline-block">
                <input 
                  type="date" 
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="bg-white/5 border border-white/10 p-8 rounded-[40px] text-white text-2xl font-black focus:border-white outline-none transition-all uppercase tracking-widest"
                />
                {calculatedAge !== null && (
                  <div className={`absolute -top-4 -right-4 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black border-4 ${calculatedAge < 18 ? 'bg-red-500 border-red-200 text-white animate-bounce' : 'bg-green-500 border-green-200 text-white'}`}>
                    ({calculatedAge})
                  </div>
                )}
              </div>

              {calculatedAge !== null && calculatedAge < 13 && (
                <div className="text-red-500 font-black uppercase text-sm animate-pulse">Por tu seguridad, no puedes entrar a esta app si eres menor de 13 años.</div>
              )}

              {calculatedAge !== null && calculatedAge >= 13 && calculatedAge < 18 && (
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-red-500/10 border border-red-500/20 p-8 rounded-[40px] space-y-6">
                  <div className="flex justify-center text-red-500">
                    <AlertTriangle size={48} />
                  </div>
                  <h3 className="text-red-500 font-black uppercase tracking-[0.2em] text-sm">¡Advertencia! Eres menor de edad</h3>
                  <p className="text-white/60 text-xs font-bold leading-relaxed px-4">
                    Por tu seguridad te recomiendo que al terminar de crear tu cuenta, aceptes que tus padres o tutor legal observen tu cuenta.
                  </p>
                  <div className="space-y-3">
                    <button 
                      onClick={() => { setAdultMonitoringOption("parent"); setStep(15); }}
                      className="w-full p-5 bg-white text-black rounded-[24px] font-black uppercase text-[10px] tracking-widest"
                    >
                      Seguir creando la cuenta con un Padre o tutor legal
                    </button>
                    <button 
                      onClick={() => { setAdultMonitoringOption("ai"); setStep(15); }}
                      className="w-full p-5 bg-white/5 border border-white/10 text-white/40 rounded-[24px] font-black uppercase text-[10px] tracking-widest"
                    >
                      Seguir creándola pero sin que un adulto la monitoree (IMEA actuará)
                    </button>
                  </div>
                </motion.div>
              )}

              {calculatedAge !== null && calculatedAge >= 18 && (
                <button 
                  onClick={() => setStep(15)}
                  className="w-full py-6 bg-white text-black rounded-[32px] font-black uppercase tracking-[0.2em] transition-all"
                >
                  Confirmar Edad
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* STEP 15: CAMERA VERIFICATION */}
        {step === 15 && (
          <motion.div key="step15" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-md space-y-8 text-center px-6">
            <div className="space-y-4">
              <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">VERIFICACIÓN FACIAL</h2>
              <p className="text-white/40 text-[11px] font-bold uppercase tracking-widest px-4 leading-relaxed">
                En 10 segundos se abrirá la cámara para confirmar que tu rostro coincide con la edad declarada.
              </p>
            </div>

            <div className="relative aspect-square w-full max-w-[300px] mx-auto overflow-hidden rounded-[60px] bg-white/5 border border-white/10">
              {cameraActive ? (
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover grayscale brightness-125" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/10">
                  <Camera size={64} />
                </div>
              )}
              {cameraCountdown > 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                  <span className="text-8xl font-black text-white italic animate-ping">{cameraCountdown}</span>
                </div>
              )}
            </div>

            {!cameraActive && cameraCountdown === 0 && (
              <button 
                onClick={startCameraVerification}
                className="w-full py-6 bg-white text-black rounded-[32px] font-black uppercase tracking-[0.2em] transition-all"
              >
                Sincronizar Rasgos
              </button>
            )}
          </motion.div>
        )}

        {/* STEP 16: ORIENTATION */}
        {step === 16 && (
          <motion.div key="step16" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="w-full max-w-md space-y-8 text-center">
            <div className="space-y-4">
              <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-tight px-6">
                Queremos un lugar cómodo y libre de odio para ti, ¿con cuál de éstos te identificas?
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-3 px-6 h-[350px] overflow-y-auto no-scrollbar">
              {ORIENTATIONS.map(opt => (
                <button
                  key={opt}
                  onClick={() => setOrientation(opt)}
                  className={`p-5 rounded-[32px] text-[10px] font-black uppercase tracking-widest border transition-all ${
                    orientation === opt ? 'bg-white text-black border-white scale-95 shadow-xl shadow-white/10' : 'bg-white/5 text-white/40 border-white/10 hover:bg-white/10'
                  }`}
                >
                  {opt}
                </button>
              ))}
              <button
                onClick={() => setOrientation("Prefiero no decirlo")}
                className={`p-5 rounded-[32px] text-[10px] font-black uppercase tracking-widest border transition-all col-span-2 ${
                  orientation === "Prefiero no decirlo" ? 'bg-white text-black border-white' : 'bg-white/5 text-white/40 border-white/10'
                }`}
              >
                Prefiero no decirlo
              </button>
            </div>

            <AnimatePresence>
              {orientation && orientation !== "Prefiero no decirlo" && (
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="px-8 py-4 bg-white/5 border-y border-white/10">
                  <p className="text-white font-bold text-xs italic">"{ORIENTATION_MESSAGES[orientation]}"</p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="px-6 flex items-center gap-4">
               <button 
                onClick={() => setIsOrientationPublic(!isOrientationPublic)}
                className={`flex-1 py-4 rounded-2xl border text-[9px] font-black uppercase tracking-widest transition-all ${isOrientationPublic ? 'bg-white/10 border-white/20 text-white' : 'bg-transparent border-white/10 text-white/30'}`}
              >
                {isOrientationPublic ? 'Público' : 'Privado'}
              </button>
              <button 
                disabled={!orientation}
                onClick={() => setStep(17)}
                className="flex-[2] py-6 bg-white text-black rounded-[32px] font-black uppercase tracking-[0.2em] disabled:opacity-20 transition-all"
              >
                Continuar
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 17: FINAL PHOTO & FINISH */}
        {step === 17 && (
          <motion.div key="step17" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-md space-y-8 text-center px-6">
            <div className="space-y-4">
              <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">FOTO DE PERFIL</h2>
              <p className="text-white/40 text-[11px] font-bold uppercase tracking-widest px-4">Puedes crear tu personaje estilo "Z-avatar" o usar tu cara real.</p>
            </div>

            <div className="relative mx-auto w-48 h-48 rounded-[60px] overflow-hidden border-4 border-white/20 bg-white/5 group transition-all">
              <img src={profilePic} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ImageIcon className="text-white" size={32} />
              </div>
              <input 
                type="file" 
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => setProfilePic(ev.target?.result as string);
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </div>

            <button 
              onClick={handleFinalizeRegister}
              className="w-full py-8 bg-white text-black rounded-[40px] font-black text-xl uppercase tracking-[0.3em] shadow-[0_20px_50px_rgba(255,255,255,0.2)] hover:scale-105 active:scale-95 transition-all"
            >
              Iniciar mi Realidad
            </button>
          </motion.div>
        )}

        {/* STEP 9: FINAL ANIMATION */}
        {step === 9 && (
          <motion.div key="step9" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black flex flex-col items-center justify-center z-[100]">
            <motion.div 
              initial={{ scale: 0.5, rotate: -20, opacity: 0 }}
              animate={{ 
                scale: [1, 1.2, 1], 
                rotate: [0, 5, -5, 0],
                opacity: 1
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-48 h-48 bg-gradient-to-br from-purple-500 to-pink-500 rounded-[60px] flex items-center justify-center shadow-[0_0_100px_rgba(168,85,247,0.5)] border-4 border-white/20"
            >
              <span className="text-white text-9xl font-black italic tracking-tighter">Z</span>
            </motion.div>
            <motion.h2 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-12 text-4xl font-black text-white tracking-tighter uppercase"
            >
              ¡GENIAL, TU CUENTA HA SIDO CREADA!
            </motion.h2>
            <p className="mt-4 text-white/40 font-black uppercase tracking-[0.4em] animate-pulse italic">NEXUS PROTOCOL READY</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
