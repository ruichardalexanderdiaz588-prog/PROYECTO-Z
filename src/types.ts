export interface User {
  id: string;
  username: string; // @username
  nickname: string; // Display name
  email?: string;
  phone?: string;
  birthDate: string;
  age: number;
  orientation: string;
  isOrientationPublic: boolean;
  profilePic: string; // Avatar URL or base64 or custom code
  bio: string;
  isAdult: boolean;
  isParentMonitored: boolean;
  hobbies: string[];
  isHobbiesPublic: boolean;
  points: number;
  isSuspended: boolean;
  bannedMultiaccounts: boolean;
  unlockedSkins: string[];
  currentSkin?: string;
  followers: string[];
  following: string[];
  note?: UserNote;
}

export interface UserNote {
  text: string;
  backgroundColor: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorPic: string;
  authorAge: number;
  text: string;
  createdAt: string;
  isFiltered?: boolean;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorPic: string;
  authorAge: number;
  authorIsAdult: boolean;
  type: "image" | "video" | "text";
  url: string;
  caption: string;
  hashtags: string[];
  category: string;
  privacy: "public" | "friends" | "minors" | "majors" | "private";
  commentsEnabled: boolean;
  sharesEnabled: boolean;
  downloadsEnabled: boolean;
  likes: string[]; // User IDs who liked
  comments: Comment[];
  sharesCount: number;
  savesCount: number;
  viewsCount: number;
  isPinned?: boolean;
  isArchived?: boolean;
  createdAt: string;
  stats?: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
    saves: number;
    minorsViews: number;
    adultsViews: number;
    avgWatchTime: number; // in seconds
  };
}

export interface ClubMessage {
  id: string;
  clubId: string;
  senderId: string;
  senderName: string;
  senderPic: string;
  senderAge: number;
  type: "text" | "image" | "voice" | "sticker";
  content: string; // message text, image url, audio base64, sticker id
  duration?: number; // for audio
  reactions?: { [emoji: string]: string[] }; // emoji -> array of userIds
  createdAt: string;
}

export interface Club {
  id: string;
  name: string;
  description: string;
  coverImage: string;
  profileImage: string;
  tags: string[];
  is18Plus: boolean;
  privacy: "public" | "private";
  creatorId: string;
  admins: string[]; // List of user IDs
  members: string[]; // List of user IDs
  pendingRequests: string[]; // User IDs who requested to join
  chatMessages: ClubMessage[];
  // Permissions set by admin
  allowAllToMessage: boolean;
  allowMedia: boolean;
  allowStickers: boolean;
  allowVoiceNotes: boolean;
  allowVideos30s: boolean;
  bannedWords: string[];
  reports: { reporterId: string; reason: string; messageId?: string; createdAt: string }[];
  inviteLink: string;
}

export interface ChatRequest {
  id: string;
  senderId: string;
  senderName: string;
  senderPic: string;
  senderAge: number;
  senderBio: string;
  receiverId: string;
  receiverName: string;
  receiverPic: string;
  receiverAge: number;
  reason: "content" | "mental_health" | "chill" | "attention" | "like" | "just_talk";
  reasonText: string;
  status: "pending" | "accepted" | "rejected" | "expired" | "canceled";
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  type: "text" | "image" | "voice" | "sticker";
  duration?: number;
  createdAt: string;
}

export interface Chat {
  id: string;
  user1Id: string;
  user2Id: string;
  messages: ChatMessage[];
  isConfessed?: boolean; // triggers love emoji/hearts and relationship status if mutual
  relationshipPublished?: "public" | "private" | "none";
}

export interface History {
  id: string;
  authorId: string;
  authorName: string;
  authorPic: string;
  type: "image" | "video";
  url: string;
  text: string;
  textStyle: string; // e.g., 'sans', 'serif', 'mono', 'neon'
  textColor: string;
  createdAt: string; // Expires after 24h
}

export interface AppNotification {
  id: string;
  type: "system" | "like" | "comment" | "follow" | "chat_request" | "club_request" | "event";
  title: string;
  content: string;
  isRedDot: boolean;
  senderId?: string;
  senderName?: string;
  senderPic?: string;
  targetId?: string; // clubId, postId, etc.
  createdAt: string;
}

export interface Story {
  id: string;
  authorId: string;
  authorName: string;
  authorPic: string;
  mediaUrl: string;
  textOverlay: string;
  createdAt: string;
  viewsCount: number;
}

export interface Note {
  id: string;
  authorId: string;
  authorName: string;
  authorPic: string;
  text: string;
  bgColor: string;
  createdAt: string;
}

