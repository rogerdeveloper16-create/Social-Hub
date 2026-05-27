import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Comment, Notification, Post, Story, User } from "@/types";

const CURRENT_USER_ID = "me";

const INITIAL_USERS: User[] = [
  { id: "me", username: "you", name: "Your Name", bio: "Living my best life", followers: 842, following: 310, postCount: 12, avatarColor: "#FF3B5C", isVerified: false, isFollowing: false },
  { id: "u1", username: "alex.shot", name: "Alex Rivera", bio: "Photographer | Explorer", followers: 12400, following: 890, postCount: 287, avatarColor: "#7C3AED", isVerified: true, isFollowing: true },
  { id: "u2", username: "maya.life", name: "Maya Chen", bio: "Coffee, sunsets, travel", followers: 5800, following: 412, postCount: 94, avatarColor: "#059669", isVerified: false, isFollowing: true },
  { id: "u3", username: "neon.city", name: "Jordan Lee", bio: "Urban explorer", followers: 34200, following: 120, postCount: 403, avatarColor: "#0891B2", isVerified: true, isFollowing: false },
  { id: "u4", username: "sam.creates", name: "Sam Park", bio: "Art & design", followers: 9100, following: 560, postCount: 156, avatarColor: "#D97706", isVerified: false, isFollowing: true },
  { id: "u5", username: "luna.vibes", name: "Luna Torres", bio: "Good vibes only", followers: 2300, following: 890, postCount: 67, avatarColor: "#DB2777", isVerified: false, isFollowing: false },
];

const INITIAL_POSTS: Post[] = [
  { id: "p1", userId: "u1", imageKey: "post1", caption: "Golden hour magic cannot be replicated. Every sunset is a gift.", likes: 2847, comments: [{ id: "c1", userId: "u2", text: "Absolutely stunning!", createdAt: "2h" }, { id: "c2", userId: "u4", text: "The colors are unreal", createdAt: "1h" }], createdAt: "3h", isLiked: false, isSaved: false },
  { id: "p2", userId: "u3", imageKey: "post2", caption: "The city never sleeps and neither do I. Night walks forever.", likes: 5910, comments: [{ id: "c3", userId: "u1", text: "Which city is this?", createdAt: "5h" }], createdAt: "6h", isLiked: true, isSaved: true },
  { id: "p3", userId: "u2", imageKey: "post3", caption: "Morning rituals. This latte art took three tries.", likes: 1203, comments: [], createdAt: "8h", isLiked: false, isSaved: false },
  { id: "p4", userId: "u4", imageKey: "post1", caption: "New week, same golden light chasing.", likes: 876, comments: [{ id: "c4", userId: "u5", text: "You always find the best spots", createdAt: "12h" }], createdAt: "1d", isLiked: false, isSaved: false },
  { id: "p5", userId: "u5", imageKey: "post2", caption: "City at night hits different when it rains.", likes: 432, comments: [], createdAt: "1d", isLiked: true, isSaved: false },
  { id: "p6", userId: "u1", imageKey: "post3", caption: "Finding peace in the simple things.", likes: 3241, comments: [{ id: "c5", userId: "me", text: "Love this shot", createdAt: "2d" }], createdAt: "2d", isLiked: true, isSaved: true },
];

const INITIAL_STORIES: Story[] = [
  { id: "s1", userId: "u1", seen: false },
  { id: "s2", userId: "u2", seen: false },
  { id: "s3", userId: "u3", seen: true },
  { id: "s4", userId: "u4", seen: false },
  { id: "s5", userId: "u5", seen: true },
  { id: "s6", userId: "me", seen: true },
];

const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: "n1", type: "like", userId: "u1", postId: "p6", createdAt: "2m", read: false },
  { id: "n2", type: "follow", userId: "u3", createdAt: "15m", read: false },
  { id: "n3", type: "comment", userId: "u2", postId: "p6", createdAt: "1h", read: false },
  { id: "n4", type: "like", userId: "u4", postId: "p6", createdAt: "2h", read: true },
  { id: "n5", type: "follow", userId: "u5", createdAt: "3h", read: true },
  { id: "n6", type: "like", userId: "u1", postId: "p6", createdAt: "1d", read: true },
];

interface SocialContextType {
  currentUserId: string;
  users: User[];
  posts: Post[];
  stories: Story[];
  notifications: Notification[];
  getUserById: (id: string) => User | undefined;
  getMyPosts: () => Post[];
  toggleLike: (postId: string) => void;
  toggleSave: (postId: string) => void;
  toggleFollow: (userId: string) => void;
  markStoryRead: (storyId: string) => void;
  markAllNotificationsRead: () => void;
  addPost: (caption: string, imageKey: Post["imageKey"]) => void;
  addComment: (postId: string, text: string) => void;
  unreadNotificationsCount: number;
}

const SocialContext = createContext<SocialContextType | null>(null);

export function SocialProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [stories, setStories] = useState<Story[]>(INITIAL_STORIES);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem("social_posts");
        if (stored) {
          const parsed = JSON.parse(stored) as Post[];
          setPosts([...parsed, ...INITIAL_POSTS]);
        }
      } catch {}
    })();
  }, []);

  const getUserById = (id: string) => users.find((u) => u.id === id);

  const getMyPosts = () => posts.filter((p) => p.userId === CURRENT_USER_ID);

  const toggleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 }
          : p
      )
    );
  };

  const toggleSave = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, isSaved: !p.isSaved } : p))
    );
  };

  const toggleFollow = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, isFollowing: !u.isFollowing, followers: u.isFollowing ? u.followers - 1 : u.followers + 1 }
          : u
      )
    );
  };

  const markStoryRead = (storyId: string) => {
    setStories((prev) =>
      prev.map((s) => (s.id === storyId ? { ...s, seen: true } : s))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const addPost = async (caption: string, imageKey: Post["imageKey"]) => {
    const newPost: Post = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      userId: CURRENT_USER_ID,
      imageKey,
      caption,
      likes: 0,
      comments: [],
      createdAt: "now",
      isLiked: false,
      isSaved: false,
    };
    const updated = [newPost, ...posts.filter((p) => p.userId === CURRENT_USER_ID)];
    try {
      await AsyncStorage.setItem("social_posts", JSON.stringify(updated));
    } catch {}
    setPosts((prev) => [newPost, ...prev]);
    setUsers((prev) =>
      prev.map((u) => (u.id === CURRENT_USER_ID ? { ...u, postCount: u.postCount + 1 } : u))
    );
  };

  const addComment = (postId: string, text: string) => {
    const newComment: Comment = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      userId: CURRENT_USER_ID,
      text,
      createdAt: "now",
    };
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, comments: [...p.comments, newComment] } : p
      )
    );
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  return (
    <SocialContext.Provider
      value={{
        currentUserId: CURRENT_USER_ID,
        users,
        posts,
        stories,
        notifications,
        getUserById,
        getMyPosts,
        toggleLike,
        toggleSave,
        toggleFollow,
        markStoryRead,
        markAllNotificationsRead,
        addPost,
        addComment,
        unreadNotificationsCount,
      }}
    >
      {children}
    </SocialContext.Provider>
  );
}

export function useSocial() {
  const ctx = useContext(SocialContext);
  if (!ctx) throw new Error("useSocial must be used within SocialProvider");
  return ctx;
}
