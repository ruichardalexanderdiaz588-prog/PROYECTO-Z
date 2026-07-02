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
  profilePic: string; // Avatar URL
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
  contentType: "image" | "video" | "text";
  mediaUrl: string;
  caption: string;
  tags: string[];
  category: string;
  privacy: "public" | "friends" | "minors" | "majors" | "private";
  allowComments: boolean;
  allowSharing: boolean;
  allowDownloads: boolean;
  likes: string[]; // User IDs
  stats: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
    saves: number;
    minorsViews?: number;
    adultsViews?: number;
    avgWatchTime?: number;
  };
  comments?: Comment[];
  isPinned?: boolean;
  isArchived?: boolean;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderPic: string;
  senderAge: number;
  type: "text" | "image" | "voice" | "sticker" | "video";
  content: string;
  clubId?: string;
  duration?: number;
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
  admins: string[];
  members: string[];
  pendingRequests: string[];
  chatMessages: ChatMessage[];
  allowAllToMessage: boolean;
  allowMedia: boolean;
  allowStickers: boolean;
  allowVoiceNotes: boolean;
  allowVideos30s: boolean;
  bannedWords: string[];
  reports?: any[];
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

export interface Chat {
  id: string;
  user1Id: string;
  user2Id: string;
  messages: ChatMessage[];
  isConfessed?: boolean;
  relationshipPublished?: "public" | "private" | "none";
}

export interface Story {
  id: string;
  authorId: string;
  authorName: string;
  authorPic: string;
  mediaUrl: string;
  textOverlay: string;
  createdAt: string;
  expiresAt: string;
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
  expiresAt: string;
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
  targetId?: string;
  createdAt: string;
}
