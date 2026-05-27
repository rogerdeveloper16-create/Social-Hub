import { Feather } from "@expo/vector-icons";
import { useAuth, useUser } from "@clerk/expo";
import React, { useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
const COLS = 3;
const CELL = (width - 2) / COLS;

export default function ProfileScreen() {
  const { getUserById, getMyPosts, currentUserId } = useSocial();
  const { user: clerkUser } = useUser();
  const { signOut } = useAuth();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<"posts" | "saved">("posts");
  const headerTop = Platform.OS === "web" ? 67 : insets.top;

  const me = getUserById(currentUserId);
  const myPosts = getMyPosts();

  const displayName = clerkUser?.fullName ?? clerkUser?.firstName ?? me?.name ?? "You";
  const displayUsername = clerkUser?.username ?? (clerkUser?.primaryEmailAddress?.emailAddress?.split("@")[0]) ?? me?.username ?? "you";

  const stat = (val: number | undefined, label: string) => (
    <View style={styles.stat}>
      <Text style={[styles.statNum, { color: colors.foreground }]}>{(val ?? 0).toLocaleString()}</Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );

  const Header = () => (
    <View>
      <View style={[styles.topBar, { paddingTop: headerTop }]}>
        <Text style={[styles.username, { color: colors.foreground }]}>{displayUsername}</Text>
        <View style={styles.topBarActions}>
          <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Feather name="plus-square" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <TouchableOpacity
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            onPress={() => signOut()}
          >
            <Feather name="log-out" size={22} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.profileInfo}>
        <Avatar color={me?.avatarColor ?? "#FF3B5C"} name={displayName} size={80} fontSize={28} />
        <View style={styles.statsRow}>
          {stat(me?.postCount, "Posts")}
          {stat(me?.followers, "Followers")}
          {stat(me?.following, "Following")}
        </View>
      </View>

      <View style={styles.bioSection}>
        <Text style={[styles.name, { color: colors.foreground }]}>{displayName}</Text>
        <Text style={[styles.email, { color: colors.mutedForeground }]}>
          {clerkUser?.primaryEmailAddress?.emailAddress ?? ""}
        </Text>
        <Text style={[styles.bio, { color: colors.foreground }]}>{me?.bio}</Text>
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity style={[styles.editBtn, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
          <Text style={[styles.editBtnText, { color: colors.foreground }]}>Edit profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.editBtn, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
          <Text style={[styles.editBtnText, { color: colors.foreground }]}>Share profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
          <Feather name="user-plus" size={16} color={colors.foreground} />
        </TouchableOpacity>
      </View>

      <View style={[styles.tabs, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.tabBtn, { borderBottomColor: activeTab === "posts" ? colors.foreground : "transparent", borderBottomWidth: 2 }]}
          onPress={() => setActiveTab("posts")}
        >
          <Feather name="grid" size={22} color={activeTab === "posts" ? colors.foreground : colors.mutedForeground} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, { borderBottomColor: activeTab === "saved" ? colors.foreground : "transparent", borderBottomWidth: 2 }]}
          onPress={() => setActiveTab("saved")}
        >
          <Feather name="bookmark" size={22} color={activeTab === "saved" ? colors.foreground : colors.mutedForeground} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList<Post>
        data={myPosts}
        keyExtractor={(p) => p.id}
        numColumns={COLS}
        ListHeaderComponent={<Header />}
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
            <Feather name="camera" size={40} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Share your first photo</Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Your posts will appear here</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  username: { fontSize: 20, fontFamily: "Inter_700Bold" },
  topBarActions: { flexDirection: "row", gap: 16 },
  profileInfo: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 24,
  },
  statsRow: { flex: 1, flexDirection: "row", justifyContent: "space-around" },
  stat: { alignItems: "center", gap: 2 },
  statNum: { fontFamily: "Inter_700Bold", fontSize: 18 },
  statLabel: { fontFamily: "Inter_400Regular", fontSize: 13 },
  bioSection: { paddingHorizontal: 16, paddingBottom: 12, gap: 2 },
  name: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  email: { fontFamily: "Inter_400Regular", fontSize: 12 },
  bio: { fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 20 },
  buttons: { flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingBottom: 14 },
  editBtn: { flex: 1, paddingVertical: 8, borderRadius: 10, borderWidth: 1, alignItems: "center" },
  editBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  addBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  tabs: { flexDirection: "row", borderBottomWidth: StyleSheet.hairlineWidth },
  tabBtn: { flex: 1, alignItems: "center", paddingVertical: 12 },
  empty: { alignItems: "center", paddingTop: 40, gap: 8 },
  emptyTitle: { fontFamily: "Inter_600SemiBold", fontSize: 16 },
  emptyText: { fontFamily: "Inter_400Regular", fontSize: 14 },
});
