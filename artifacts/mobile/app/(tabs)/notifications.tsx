import { Feather, Ionicons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { FlatList, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar } from "@/components/Avatar";
import { useSocial } from "@/context/SocialContext";
import { useColors } from "@/hooks/useColors";
import { Notification } from "@/types";

export default function NotificationsScreen() {
  const { notifications, getUserById, markAllNotificationsRead } = useSocial();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const headerTop = Platform.OS === "web" ? 67 : insets.top;

  useEffect(() => {
    const timer = setTimeout(() => markAllNotificationsRead(), 1000);
    return () => clearTimeout(timer);
  }, []);

  const renderIcon = (type: Notification["type"]) => {
    if (type === "like") return <Ionicons name="heart" size={16} color="#FF3B5C" />;
    if (type === "follow") return <Ionicons name="person-add" size={16} color="#3B82F6" />;
    return <Ionicons name="chatbubble" size={16} color="#10B981" />;
  };

  const renderText = (n: Notification) => {
    const user = getUserById(n.userId);
    const username = user?.username ?? "someone";
    if (n.type === "like") return `${username} liked your photo`;
    if (n.type === "follow") return `${username} started following you`;
    return `${username} commented on your photo`;
  };

  const unread = notifications.filter((n) => !n.read);
  const read = notifications.filter((n) => n.read);

  const sections = [
    ...(unread.length > 0 ? [{ type: "header" as const, label: "New" }, ...unread] : []),
    ...(read.length > 0 ? [{ type: "header" as const, label: "Earlier" }, ...read] : []),
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: headerTop, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Notifications</Text>
        <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Feather name="settings" size={22} color={colors.foreground} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={sections}
        keyExtractor={(item, i) => ("type" in item && item.type === "header" ? `h-${i}` : (item as Notification).id)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 84 + 34 : 100 }}
        renderItem={({ item }) => {
          if ("type" in item && item.type === "header") {
            return (
              <Text style={[styles.sectionHeader, { color: colors.mutedForeground }]}>
                {item.label}
              </Text>
            );
          }
          const n = item as Notification;
          const user = getUserById(n.userId);
          if (!user) return null;
          return (
            <TouchableOpacity
              style={[styles.item, { backgroundColor: n.read ? colors.background : colors.card }]}
              activeOpacity={0.7}
            >
              <View style={styles.avatarWrap}>
                <Avatar color={user.avatarColor} name={user.name} size={46} fontSize={16} />
                <View style={[styles.typeIcon, { backgroundColor: colors.background }]}>
                  {renderIcon(n.type)}
                </View>
              </View>
              <View style={styles.textWrap}>
                <Text style={[styles.notifText, { color: colors.foreground }]}>
                  {renderText(n)}
                </Text>
                <Text style={[styles.time, { color: colors.mutedForeground }]}>{n.createdAt}</Text>
              </View>
              {n.type === "follow" && (
                <TouchableOpacity style={[styles.followBtn, { backgroundColor: colors.primary }]}>
                  <Text style={styles.followBtnText}>Follow</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="bell" size={40} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No notifications yet</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  sectionHeader: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 6,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  avatarWrap: {
    position: "relative",
  },
  typeIcon: {
    position: "absolute",
    bottom: -2,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
  notifText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 20,
  },
  time: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
  },
  followBtn: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
  },
  followBtnText: {
    color: "#fff",
    fontFamily: "Inter_600SemiBold",
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
