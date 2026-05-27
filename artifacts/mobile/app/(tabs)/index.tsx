import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { FlatList, Platform, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PostCard } from "@/components/PostCard";
import { StoryRow } from "@/components/StoryRow";
import { useSocial } from "@/context/SocialContext";
import { useColors } from "@/hooks/useColors";
import { Post } from "@/types";

export default function HomeScreen() {
  const { posts } = useSocial();
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const headerTop = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />
      <View style={[styles.header, { paddingTop: headerTop, borderBottomColor: colors.border }]}>
        <Text style={[styles.logo, { color: colors.foreground }]}>Vibe</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Feather name="heart" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <TouchableOpacity
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            onPress={() => router.push("/messages")}
          >
            <Feather name="send" size={24} color={colors.foreground} />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList<Post>
        data={posts}
        keyExtractor={(p) => p.id}
        ListHeaderComponent={<StoryRow />}
        renderItem={({ item }) => <PostCard post={item} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 84 + 34 : 100 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  logo: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    letterSpacing: -1,
  },
  headerActions: {
    flexDirection: "row",
    gap: 18,
    paddingBottom: 2,
  },
});
