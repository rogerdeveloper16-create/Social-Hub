import React from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Avatar } from "@/components/Avatar";
import { useSocial } from "@/context/SocialContext";
import { useColors } from "@/hooks/useColors";

export function StoryRow() {
  const { stories, users, getUserById, markStoryRead, currentUserId } = useSocial();
  const colors = useColors();

  const myStory = stories.find((s) => s.userId === currentUserId);
  const otherStories = stories.filter((s) => s.userId !== currentUserId);
  const orderedStories = myStory ? [myStory, ...otherStories] : otherStories;

  return (
    <FlatList
      horizontal
      data={orderedStories}
      keyExtractor={(s) => s.id}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      renderItem={({ item: story }) => {
        const user = getUserById(story.userId);
        if (!user) return null;
        const isMe = story.userId === currentUserId;
        const ringColor = story.seen ? colors.border : colors.primary;

        return (
          <TouchableOpacity
            style={styles.item}
            onPress={() => markStoryRead(story.id)}
            activeOpacity={0.8}
          >
            <View style={[styles.ring, { borderColor: ringColor }]}>
              <View style={styles.avatarWrap}>
                {isMe && (
                  <View style={[styles.addBadge, { backgroundColor: colors.primary }]}>
                    <Text style={styles.addBadgeText}>+</Text>
                  </View>
                )}
                <Avatar color={user.avatarColor} name={user.name} size={56} fontSize={18} />
              </View>
            </View>
            <Text style={[styles.label, { color: colors.mutedForeground }]} numberOfLines={1}>
              {isMe ? "Your story" : user.username}
            </Text>
          </TouchableOpacity>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 14,
  },
  item: {
    alignItems: "center",
    width: 70,
    gap: 5,
  },
  ring: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarWrap: {
    position: "relative",
  },
  addBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  addBadgeText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    lineHeight: 20,
  },
  label: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
});
