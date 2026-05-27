import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSocial } from "@/context/SocialContext";
import { useColors } from "@/hooks/useColors";
import { Post } from "@/types";

const POST_IMAGES = {
  post1: require("@/assets/images/post1.png"),
  post2: require("@/assets/images/post2.png"),
  post3: require("@/assets/images/post3.png"),
};

const { width } = Dimensions.get("window");
const COLS = 3;
const CELL = (width - 2) / COLS;

const TAGS = ["Trending", "Art", "Travel", "Food", "Fashion", "Nature"];

export default function ExploreScreen() {
  const { posts, getUserById } = useSocial();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState("Trending");

  const headerTop = Platform.OS === "web" ? 67 : insets.top;

  const filtered = posts.filter((p) => {
    const user = getUserById(p.userId);
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.caption.toLowerCase().includes(q) ||
      user?.username.toLowerCase().includes(q) ||
      user?.name.toLowerCase().includes(q)
    );
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: headerTop }]}>
        <View style={[styles.searchBar, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search"
            placeholderTextColor={colors.mutedForeground}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={[styles.tags, { borderBottomColor: colors.border }]}>
        {TAGS.map((tag) => (
          <TouchableOpacity
            key={tag}
            onPress={() => setActiveTag(tag)}
            style={[
              styles.tag,
              {
                backgroundColor: activeTag === tag ? colors.primary : colors.secondary,
                borderColor: activeTag === tag ? colors.primary : colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.tagText,
                { color: activeTag === tag ? "#fff" : colors.mutedForeground },
              ]}
            >
              {tag}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList<Post>
        data={filtered}
        keyExtractor={(p) => p.id}
        numColumns={COLS}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 84 + 34 : 100 }}
        columnWrapperStyle={{ gap: 1 }}
        ItemSeparatorComponent={() => <View style={{ height: 1 }} />}
        renderItem={({ item }) => (
          <TouchableOpacity activeOpacity={0.85} style={{ width: CELL, height: CELL }}>
            <Image source={POST_IMAGES[item.imageKey]} style={{ width: CELL, height: CELL }} resizeMode="cover" />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="search" size={40} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No results found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 14,
    paddingBottom: 10,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 15,
  },
  tags: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 14,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexWrap: "wrap",
  },
  tag: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  tagText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    gap: 12,
  },
  emptyText: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
  },
});
