import { User, Post, Club, ChatRequest, Chat, AppNotification } from "./types";

export const INITIAL_USERS: User[] = [
  {
    id: "user_alexis",
    username: "alexis_pasivo",
    nickname: "Alexis",
    email: "alexis@zapp.io",
    birthDate: "2012-09-08",
    age: 14,
    orientation: "Gay pasivo",
    isOrientationPublic: true,
    profilePic: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    bio: "Me encanta el arte digital, regar mis plantas 🌿 y escuchar indie pop. ¡Amigos por siempre!",
    isAdult: false,
    isParentMonitored: false,
    hobbies: ["Crear historias", "Regar plantas", "Leer", "Escuchar Musica"],
    isHobbiesPublic: true,
    points: 150,
    isSuspended: false,
    bannedMultiaccounts: false,
    unlockedSkins: ["standard", "nebulous_purple"],
    followers: ["user_sofia", "user_juan"],
    following: ["user_sofia"]
  },
  {
    id: "user_sofia",
    username: "sofi_art",
    nickname: "Sofía 🎨",
    email: "sofia@zapp.io",
    birthDate: "2010-04-15",
    age: 16,
    orientation: "Lesbiana",
    isOrientationPublic: true,
    profilePic: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    bio: "Solo una chica de 16 años tratando de plasmar el mundo en acuarelas. No hate, only love. ✨",
    isAdult: false,
    isParentMonitored: true,
    hobbies: ["Escribir", "Leer", "Ayudar personas", "Escuchar Musica"],
    isHobbiesPublic: true,
    points: 320,
    isSuspended: false,
    bannedMultiaccounts: false,
    unlockedSkins: ["standard", "cosmic_pink"],
    followers: ["user_alexis"],
    following: ["user_alexis"]
  },
  {
    id: "user_juan",
    username: "juan_fit",
    nickname: "Juan G.",
    email: "juan@zapp.io",
    birthDate: "2007-02-14",
    age: 19,
    orientation: "Gay activo",
    isOrientationPublic: true,
    profilePic: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
    bio: "Modelo amateur y apasionado por el ejercicio 🏋️‍♂️. 19 años. ¡La vida es corta, vívela libre!",
    isAdult: true,
    isParentMonitored: false,
    hobbies: ["Hacer ejercicio", "Ver series y películas", "Escuchar Musica"],
    isHobbiesPublic: true,
    points: 580,
    isSuspended: false,
    bannedMultiaccounts: false,
    unlockedSkins: ["standard", "neon_blue"],
    followers: ["user_alexis"],
    following: ["user_alexis"]
  },
  {
    id: "user_mika",
    username: "mika_nonbinary",
    nickname: "Mika 🌌",
    email: "mika@zapp.io",
    birthDate: "2006-11-20",
    age: 20,
    orientation: "No binario",
    isOrientationPublic: true,
    profilePic: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    bio: "No binario. Estudiante de astronomía. Amante del cosmos y los memes absurdos de TikTok. 🔭🛸",
    isAdult: true,
    isParentMonitored: false,
    hobbies: ["Estudiar", "Ver TikTok", "Redes sociales"],
    isHobbiesPublic: true,
    points: 400,
    isSuspended: false,
    bannedMultiaccounts: false,
    unlockedSkins: ["standard"],
    followers: [],
    following: []
  }
];

export const INITIAL_POSTS: Post[] = [
  {
    id: "post_1",
    authorId: "user_sofia",
    authorName: "Sofía 🎨",
    authorPic: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    authorAge: 16,
    authorIsAdult: false,
    type: "image",
    url: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&auto=format&fit=crop&q=80",
    caption: "¡Terminé mi primera pintura galáctica! 🪐🎨 Dedicada a todas las almas libres de la app. ¿Qué opinan? #arte #creatividad #space",
    hashtags: ["arte", "creatividad", "space"],
    category: "arte",
    privacy: "public",
    commentsEnabled: true,
    sharesEnabled: true,
    downloadsEnabled: true,
    likes: ["user_alexis", "user_juan"],
    comments: [
      {
        id: "c1",
        authorId: "user_alexis",
        authorName: "Alexis",
        authorPic: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
        authorAge: 14,
        text: "¡Te quedó increíble Sofi! Me encantan los tonos morados nebulosos 💜🛸",
        createdAt: "2026-07-01T20:15:00Z"
      }
    ],
    sharesCount: 3,
    savesCount: 12,
    viewsCount: 120,
    createdAt: "2026-07-01T18:30:00Z",
    stats: {
      views: 120,
      likes: 2,
      comments: 1,
      shares: 3,
      saves: 12,
      minorsViews: 85,
      adultsViews: 35,
      avgWatchTime: 14
    }
  },
  {
    id: "post_2",
    authorId: "user_juan",
    authorName: "Juan G.",
    authorPic: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
    authorAge: 19,
    authorIsAdult: true,
    type: "image",
    url: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80",
    caption: "Esfuerzo diario en el gym. Motivación al máximo. 💪 Ropa deportiva lista para el entreno. #deporte #motivacion #fitness #gym",
    hashtags: ["deporte", "motivacion", "fitness", "gym"],
    category: "vlog",
    privacy: "public",
    commentsEnabled: true,
    sharesEnabled: true,
    downloadsEnabled: true,
    likes: ["user_mika"],
    comments: [],
    sharesCount: 1,
    savesCount: 4,
    viewsCount: 48,
    createdAt: "2026-07-01T22:00:00Z",
    stats: {
      views: 48,
      likes: 1,
      comments: 0,
      shares: 1,
      saves: 4,
      minorsViews: 10,
      adultsViews: 38,
      avgWatchTime: 8
    }
  },
  {
    id: "post_3",
    authorId: "user_juan",
    authorName: "Juan G.",
    authorPic: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
    authorAge: 19,
    authorIsAdult: true,
    type: "image",
    url: "https://images.unsplash.com/photo-1500485035595-cbe6f645feb1?w=600&auto=format&fit=crop&q=80",
    caption: "Sesión fotográfica de modelaje artístico veraniego en la playa. Contenido estético +18. #model #estilo #verano",
    hashtags: ["model", "estilo", "verano"],
    category: "vlog",
    privacy: "majors", // Only for adults
    commentsEnabled: true,
    sharesEnabled: false,
    downloadsEnabled: false,
    likes: ["user_mika"],
    comments: [],
    sharesCount: 0,
    savesCount: 1,
    viewsCount: 15,
    createdAt: "2026-07-02T02:00:00Z",
    stats: {
      views: 15,
      likes: 1,
      comments: 0,
      shares: 0,
      saves: 1,
      minorsViews: 0, // Restricted!
      adultsViews: 15,
      avgWatchTime: 12
    }
  }
];

export const INITIAL_CLUBS: Club[] = [
  {
    id: "club_1",
    name: "Cinefilos Gen Z 🍿",
    description: "Club oficial para compartir, debatir y recomendar series, animes, doramas y películas favoritas de la generación. ¡Nada de toxicidad!",
    coverImage: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80",
    profileImage: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=150&auto=format&fit=crop&q=80",
    tags: ["series", "animes", "peliculas", "humor"],
    is18Plus: false,
    privacy: "public",
    creatorId: "user_sofia",
    admins: ["user_sofia"],
    members: ["user_sofia", "user_alexis", "user_juan"],
    pendingRequests: [],
    allowAllToMessage: true,
    allowMedia: true,
    allowStickers: true,
    allowVoiceNotes: true,
    allowVideos30s: true,
    bannedWords: ["tonto", "feo"],
    reports: [],
    inviteLink: "https://zapp.io/join/club_1",
    chatMessages: [
      {
        id: "msg_1",
        clubId: "club_1",
        senderId: "user_sofia",
        senderName: "Sofía 🎨",
        senderPic: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
        senderAge: 16,
        type: "text",
        content: "¡Hola a todos! Bienvenidos al club de cine y series. ¿Cuál es la última serie que vieron?",
        createdAt: "2026-07-02T01:10:00Z"
      },
      {
        id: "msg_2",
        clubId: "club_1",
        senderId: "user_alexis",
        senderName: "Alexis",
        senderPic: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
        senderAge: 14,
        type: "text",
        content: "¡Hola Sofi! Estoy viendo de nuevo Avatar: La Leyenda de Aang, es una obra maestra 🌊🔥🌪️🪨",
        createdAt: "2026-07-02T01:12:00Z"
      }
    ]
  },
  {
    id: "club_2",
    name: "Modelos & Fitness +18 💪",
    description: "Espacio exclusivo para adultos interesados en rutinas avanzadas de gimnasio, nutrición, modelaje y fotografía corporal estética de playa.",
    coverImage: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80",
    profileImage: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=150&auto=format&fit=crop&q=80",
    tags: ["ejercicio", "salud", "tecnología", "LGBT"],
    is18Plus: true,
    privacy: "private",
    creatorId: "user_juan",
    admins: ["user_juan"],
    members: ["user_juan", "user_mika"],
    pendingRequests: [],
    allowAllToMessage: true,
    allowMedia: true,
    allowStickers: true,
    allowVoiceNotes: true,
    allowVideos30s: true,
    bannedWords: [],
    reports: [],
    inviteLink: "https://zapp.io/join/club_2_secret",
    chatMessages: [
      {
        id: "msg_3",
        clubId: "club_2",
        senderId: "user_juan",
        senderName: "Juan G.",
        senderPic: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
        senderAge: 19,
        type: "text",
        content: "Bienvenidos al club fitness +18. Aquí podemos postear fotos de progresos físicos sin tabúes, pero con total respeto.",
        createdAt: "2026-07-02T04:20:00Z"
      }
    ]
  }
];

export const INITIAL_CHAT_REQUESTS: ChatRequest[] = [
  {
    id: "req_1",
    senderId: "user_juan",
    senderName: "Juan G.",
    senderPic: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
    senderAge: 19,
    senderBio: "Modelo amateur y apasionado por el ejercicio 🏋️‍♂️. 19 años.",
    receiverId: "user_alexis",
    receiverName: "Alexis",
    receiverPic: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    receiverAge: 14,
    reason: "content",
    reasonText: "Me gusta su contenido",
    status: "pending",
    createdAt: "2026-07-02T09:30:00Z"
  }
];

export const INITIAL_CHATS: Chat[] = [
  {
    id: "chat_sofia_alexis",
    user1Id: "user_sofia",
    user2Id: "user_alexis",
    messages: [
      {
        id: "m_c_1",
        senderId: "user_sofia",
        text: "¡Hola Alexis! ¿Cómo va todo hoy?",
        type: "text",
        createdAt: "2026-07-02T08:00:00Z"
      },
      {
        id: "m_c_2",
        senderId: "user_alexis",
        text: "¡Hola Sofi! Todo bien por aquí, regando mis suculentas 🌵 ¿Y tú?",
        type: "text",
        createdAt: "2026-07-02T08:05:00Z"
      }
    ]
  }
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: "notif_1",
    type: "chat_request",
    title: "Nueva solicitud de amistad/chat",
    content: "Juan G. te ha enviado una solicitud de chat. Es mayor de edad (19 años). Puedes revisar su perfil antes de decidir.",
    isRedDot: true,
    senderId: "user_juan",
    senderName: "Juan G.",
    senderPic: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
    targetId: "req_1",
    createdAt: "2026-07-02T09:30:00Z"
  },
  {
    id: "notif_2",
    type: "like",
    title: "¡Les gusta tu arte!",
    content: "A Alexis le ha gustado tu publicación sobre pintura galáctica.",
    isRedDot: false,
    senderId: "user_alexis",
    senderName: "Alexis",
    senderPic: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    targetId: "post_1",
    createdAt: "2026-07-01T20:16:00Z"
  },
  {
    id: "notif_3",
    type: "event",
    title: "🏆 ¡Gran Evento de Creadores!",
    content: "El creador ha lanzado el Evento de Popularidad Semanal. ¡Publica tu mejor contenido y consigue los votos de tus fans haciendo tareas!",
    isRedDot: true,
    createdAt: "2026-07-02T10:00:00Z"
  }
];
