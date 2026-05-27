import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Avatar } from "@/components/Avatar";
import { useSocial } from "@/context/SocialContext";
import { useColors } from "@/hooks/useColors";
import { Post } from "@/types";

const POST_IMAGES = {
  post1: require("@/assets/images/post1.png"),
  post2: require("@/assets/images/post2.png"),
  post3: require("@/assets/images/post3.png"),
};

const { width } = Dimensions.get("window");

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const { getUserById, toggleLike, toggleSave, addComment, currentUserId } = useSocial();
  const colors = useColors();
  const user = getUserById(post.userId);
  const currentUser = getUserById(currentUserId);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const heartScale = useRef(new Animated.Value(1)).current;

  if (!user) return null;

  const handleDoubleTap = () => {
    if (!post.isLiked) {
      toggleLike(post.id);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Animated.sequence([
      Animated.spring(heartScale, { toValue: 1.3, useNativeDriver: true }),
      Animated.spring(heartScale, { toValue: 1, useNativeDriver: true }),
    ]).start();
  };

  const handleLike = () => {
    toggleLike(post.id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSave = () => {
    toggleSave(post.id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleAddComment = () => {
    if (commentText.trim()) {
      addComment(post.id, commentText.trim());
      setCommentText("");
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Avatar color={user.avatarColor} name={user.name} size={36} fontSize={13} />
          <View>
            <View style={styles.usernameRow}>
              <Text style={[styles.username, { color: colors.foreground }]}>{user.username}</Text>
              {user.isVerified && (
                <Ionicons name="checkmark-circle" size={14} color={colors.primary} />
              )}
            </View>
            <Text style={[styles.time, { color: colors.mutedForeground }]}>{post.createdAt}</Text>
          </View>
        </View>
        <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Feather name="more-horizontal" size={20} color={colors.mutedForeground} />
        </TouchableOpacity>
      </View>

      <TouchableWithoutFeedback onPress={handleDoubleTap}>
        <View>
          <Image source={POST_IMAGES[post.imageKey]} style={styles.image} resizeMode="cover" />
        </View>
      </TouchableWithoutFeedback>

      <View style={styles.actions}>
        <View style={styles.actionsLeft}>
          <TouchableOpacity onPress={handleLike} activeOpacity={0.7} style={styles.actionBtn}>
            <Animated.View style={{ transform: [{ scale: heartScale }] }}>
              <Ionicons
                name={post.isLiked ? "heart" : "heart-outline"}
                size={26}
                color={post.isLiked ? "#FF3B5C" : colors.foreground}
              />
            </Animated.View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowComments(!showComments)}
            activeOpacity={0.7}
            style={styles.actionBtn}
          >
            <Ionicons name="chatbubble-outline" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.7} style={styles.actionBtn}>
            <Feather name="send" size={22} color={colors.foreground} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={handleSave} activeOpacity={0.7}>
          <Ionicons
            name={post.isSaved ? "bookmark" : "bookmark-outline"}
            size={24}
            color={colors.foreground}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.meta}>
        <Text style={[styles.likes, { color: colors.foreground }]}>
          {post.likes.toLocaleString()} likes
        </Text>
        {post.caption.length > 0 && (
          <Text style={[styles.caption, { color: colors.foreground }]}>
            <Text style={styles.captionUser}>{user.username} </Text>
            {post.caption}
          </Text>
        )}
        {post.comments.length > 0 && !showComments && (
          <TouchableOpacity onPress={() => setShowComments(true)}>
            <Text style={[styles.viewComments, { color: colors.mutedForeground }]}>
              View all {post.comments.length} comments
            </Text>
          </TouchableOpacity>
        )}
        {showComments &&
          post.comments.map((c) => {
            const cu = getUserById(c.userId);
            return (
              <Text key={c.id} style={[styles.comment, { color: colors.foreground }]}>
                <Text style={styles.captionUser}>{cu?.username ?? "user"} </Text>
                {c.text}
              </Text>
            );
          })}
      </View>

      {showComments && (
        <View style={[styles.commentInput, { borderTopColor: colors.border }]}>
          {currentUser && (
            <Avatar color={currentUser.avatarColor} name={currentUser.name} size={28} fontSize={10} />
          )}
          <TextInput
            style={[styles.input, { color: colors.foreground }]}
            placeholder="Add a comment..."
            placeholderTextColor={colors.mutedForeground}
            value={commentText}
            onChangeText={setCommentText}
            onSubmitEditing={handleAddComment}
            returnKeyType="send"
          />
          {commentText.length > 0 && (
            <TouchableOpacity onPress={handleAddComment}>
              <Text style={[styles.postBtn, { color: colors.primary }]}>Post</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  usernameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  username: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  time: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    marginTop: 1,
  },
  image: {
    width,
    height: width,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 6,
  },
  actionsLeft: {
    flexDirection: "row",
    gap: 16,
  },
  actionBtn: {
    padding: 2,
  },
  meta: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    gap: 4,
  },
  likes: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  caption: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 20,
  },
  captionUser: {
    fontFamily: "Inter_600SemiBold",
  },
  viewComments: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
  },
  comment: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 18,
  },
  commentInput: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  input: {
    flex: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
  },
  postBtn: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
});
