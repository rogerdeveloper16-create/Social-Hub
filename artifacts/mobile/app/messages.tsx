import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar } from "@/components/Avatar";
import { useSocial } from "@/context/SocialContext";
import { useColors } from "@/hooks/useColors";

interface Conversation {
  id: string;
  userId: string;
  lastMessage: string;
  time: string;
  unread: number;
}

const CONVERSATIONS: Conversation[] = [
  { id: "cv1", userId: "u1", lastMessage: "That shot came out amazing!", time: "2m", unread: 2 },
  { id: "cv2", userId: "u2", lastMessage: "Thanks for the like!", time: "15m", unread: 0 },
  { id: "cv3", userId: "u3", lastMessage: "Let's collab sometime", time: "1h", unread: 1 },
  { id: "cv4", userId: "u4", lastMessage: "Where was that taken?", time: "3h", unread: 0 },
  { id: "cv5", userId: "u5", lastMessage: "Love your aesthetic", time: "1d", unread: 0 },
];

interface Message {
  id: string;
  from: "me" | "them";
  text: string;
  time: string;
}

const THREAD_MESSAGES: Record<string, Message[]> = {
  cv1: [
    { id: "m1", from: "them", text: "Hey! Love your recent posts", time: "5m" },
    { id: "m2", from: "me", text: "Thank you so much!", time: "4m" },
    { id: "m3", from: "them", text: "That shot came out amazing!", time: "2m" },
  ],
  cv2: [
    { id: "m1", from: "them", text: "Thanks for the like!", time: "15m" },
  ],
  cv3: [
    { id: "m1", from: "them", text: "Love your urban photography", time: "2h" },
    { id: "m2", from: "me", text: "Thanks! Big fan of yours too", time: "1h" },
    { id: "m3", from: "them", text: "Let's collab sometime", time: "1h" },
  ],
  cv4: [
    { id: "m1", from: "them", text: "Where was that taken?", time: "3h" },
  ],
  cv5: [
    { id: "m1", from: "them", text: "Love your aesthetic", time: "1d" },
  ],
};

export default function MessagesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { getUserById } = useSocial();
  const [activeConv, setActiveConv] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>(THREAD_MESSAGES);
  const [input, setInput] = useState("");

  const headerTop = Platform.OS === "web" ? 67 : insets.top;

  const sendMessage = (convId: string) => {
    if (!input.trim()) return;
    const newMsg: Message = {
      id: Date.now().toString(),
      from: "me",
      text: input.trim(),
      time: "now",
    };
    setMessages((prev) => ({
      ...prev,
      [convId]: [...(prev[convId] ?? []), newMsg],
    }));
    setInput("");
  };

  if (activeConv) {
    const conv = CONVERSATIONS.find((c) => c.id === activeConv);
    const user = conv ? getUserById(conv.userId) : null;
    const thread = messages[activeConv] ?? [];

    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: headerTop, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => setActiveConv(null)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Feather name="arrow-left" size={24} color={colors.foreground} />
          </TouchableOpacity>
          {user && <Avatar color={user.avatarColor} name={user.name} size={34} fontSize={12} />}
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>{user?.username}</Text>
          <View style={{ flex: 1 }} />
          <Feather name="phone" size={22} color={colors.mutedForeground} />
          <Feather name="video" size={22} color={colors.mutedForeground} style={{ marginLeft: 16 }} />
        </View>

        <FlatList
          data={thread}
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 80 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={[styles.bubble, item.from === "me" ? styles.bubbleMe : styles.bubbleThem, { backgroundColor: item.from === "me" ? colors.primary : colors.card }]}>
              <Text style={[styles.bubbleText, { color: "#fff" }]}>{item.text}</Text>
              <Text style={[styles.bubbleTime, { color: "rgba(255,255,255,0.6)" }]}>{item.time}</Text>
            </View>
          )}
        />

        <View style={[styles.inputRow, { borderTopColor: colors.border, backgroundColor: colors.background, paddingBottom: Platform.OS === "ios" ? insets.bottom : 12 }]}>
          <TextInput
            style={[styles.msgInput, { color: colors.foreground, backgroundColor: colors.card, borderColor: colors.border }]}
            placeholder="Message..."
            placeholderTextColor={colors.mutedForeground}
            value={input}
            onChangeText={setInput}
            returnKeyType="send"
            onSubmitEditing={() => sendMessage(activeConv)}
          />
          <TouchableOpacity
            onPress={() => sendMessage(activeConv)}
            style={[styles.sendBtn, { backgroundColor: input.trim() ? colors.primary : colors.secondary }]}
          >
            <Feather name="send" size={18} color={input.trim() ? "#fff" : colors.mutedForeground} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: headerTop, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Messages</Text>
        <View style={{ flex: 1 }} />
        <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Feather name="edit" size={22} color={colors.foreground} />
        </TouchableOpacity>
      </View>

      <View style={[styles.searchWrap, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
        <Feather name="search" size={15} color={colors.mutedForeground} />
        <TextInput
          style={[styles.searchInput, { color: colors.foreground }]}
          placeholder="Search"
          placeholderTextColor={colors.mutedForeground}
        />
      </View>

      <FlatList
        data={CONVERSATIONS}
        keyExtractor={(c) => c.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        renderItem={({ item }) => {
          const user = getUserById(item.userId);
          if (!user) return null;
          return (
            <Pressable
              style={({ pressed }) => [styles.convRow, { backgroundColor: pressed ? colors.card : colors.background }]}
              onPress={() => setActiveConv(item.id)}
            >
              <View style={styles.avatarWrap}>
                <Avatar color={user.avatarColor} name={user.name} size={54} fontSize={18} />
                {item.unread > 0 && (
                  <View style={[styles.onlineDot, { backgroundColor: "#22C55E" }]} />
                )}
              </View>
              <View style={styles.convInfo}>
                <View style={styles.convTop}>
                  <Text style={[styles.convName, { color: colors.foreground, fontFamily: item.unread > 0 ? "Inter_600SemiBold" : "Inter_400Regular" }]}>
                    {user.username}
                  </Text>
                  <Text style={[styles.convTime, { color: colors.mutedForeground }]}>{item.time}</Text>
                </View>
                <View style={styles.convBottom}>
                  <Text style={[styles.convLast, { color: item.unread > 0 ? colors.foreground : colors.mutedForeground, fontFamily: item.unread > 0 ? "Inter_500Medium" : "Inter_400Regular" }]} numberOfLines={1}>
                    {item.lastMessage}
                  </Text>
                  {item.unread > 0 && (
                    <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
                      <Text style={styles.unreadText}>{item.unread}</Text>
                    </View>
                  )}
                </View>
              </View>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: { fontFamily: "Inter_700Bold", fontSize: 18 },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  searchInput: { flex: 1, fontFamily: "Inter_400Regular", fontSize: 15 },
  convRow: { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 16, paddingVertical: 12 },
  avatarWrap: { position: "relative" },
  onlineDot: { position: "absolute", bottom: 2, right: 2, width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: "#0d0d0d" },
  convInfo: { flex: 1 },
  convTop: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  convName: { fontSize: 15 },
  convTime: { fontFamily: "Inter_400Regular", fontSize: 12 },
  convBottom: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  convLast: { flex: 1, fontSize: 13, marginRight: 8 },
  unreadBadge: { minWidth: 20, height: 20, borderRadius: 10, alignItems: "center", justifyContent: "center", paddingHorizontal: 6 },
  unreadText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 11 },
  bubble: { maxWidth: "75%", borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10, gap: 4 },
  bubbleMe: { alignSelf: "flex-end", borderBottomRightRadius: 4 },
  bubbleThem: { alignSelf: "flex-start", borderBottomLeftRadius: 4 },
  bubbleText: { fontFamily: "Inter_400Regular", fontSize: 15, lineHeight: 21 },
  bubbleTime: { fontFamily: "Inter_400Regular", fontSize: 10, textAlign: "right" },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  msgInput: {
    flex: 1, borderWidth: 1, borderRadius: 24, paddingHorizontal: 16,
    paddingVertical: 10, fontFamily: "Inter_400Regular", fontSize: 15,
  },
  sendBtn: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
});
