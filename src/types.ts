export interface UserProfile {
  id: string;
  username: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  coverUrl?: string;
  bio?: string;
  skills: string[];
  education: {
    school: string;
    degree: string;
    year: string;
  }[];
  experience: {
    company: string;
    role: string;
    duration: string;
  }[];
  socialLinks: {
    github?: string;
    linkedin?: string;
    twitter?: string;
  };
  followers: string[]; // userIds
  following: string[]; // userIds
  registeredAt: string;
}

export type PostType = "text" | "image" | "video" | "file";

export interface Review {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  rating: number; // 1-5
  text: string;
  createdAt: string;
}

export interface Post {
  id: string;
  authorId: string;
  author: {
    username: string;
    avatarUrl: string;
    skills: string[];
  };
  content: string;
  type: PostType;
  mediaUrl?: string; // image/video url
  fileName?: string;
  fileSize?: string;
  likes: string[]; // list of userIds who liked
  dislikes: string[]; // list of userIds who disliked
  createdAt: string;
  averageRating: number;
  reviews: Review[];
  sharesCount: number;
}

export interface Comment {
  id: string;
  postId: string;
  parentId?: string; // For nested replies
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
  likes: string[]; // userIds
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  rating: number;
  reviewsCount: number;
  image: string;
  category: string;
  level: string;
  enrolledCount: number;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  fileType: "pdf" | "docx" | "zip";
  fileName: string;
  fileSize: string;
  authorName: string;
  category: string;
  downloadsCount: number;
  createdAt: string;
}

export interface LearningEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  latitude: number;
  longitude: number;
  creatorName: string;
  registeredUsers: string[]; // userIds
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: "comment" | "like" | "reply" | "follow" | "review";
  message: string;
  senderName: string;
  senderAvatar: string;
  read: boolean;
  createdAt: string;
}

export interface SessionState {
  user: UserProfile | null;
  otpCode?: string;
  tempUser?: any;
}
