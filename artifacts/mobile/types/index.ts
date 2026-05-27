export interface User {
  id: string;
  username: string;
  name: string;
  bio: string;
  followers: number;
  following: number;
  postCount: number;
  avatarColor: string;
  isVerified: boolean;
  isFollowing: boolean;
}

export interface Comment {
  id: string;
  userId: string;
  text: string;
  createdAt: string;
}

export interface Post {
  id: string;
  userId: string;
  imageKey: "post1" | "post2" | "post3";
  caption: string;
  likes: number;
  comments: Comment[];
  createdAt: string;
  isLiked: boolean;
  isSaved: boolean;
}

export interface Story {
  id: string;
  userId: string;
  seen: boolean;
}

export type NotificationType = "like" | "follow" | "comment";

export interface Notification {
  id: string;
  type: NotificationType;
  userId: string;
  postId?: string;
  createdAt: string;
  read: boolean;
}
