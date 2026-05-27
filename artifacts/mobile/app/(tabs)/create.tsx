import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  Platform,
  ScrollView,
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

type ImageKey = Post["imageKey"];
const IMAGE_KEYS: ImageKey[] = ["post1", "post2", "post3"];

export default function CreateScreen() {
  const colors = useColors();
  const { addPost } = useSocial();
  const insets = useSafeAreaInsets();
  const [caption, setCaption] = useState("");
  const [selected, setSelected] = useState<ImageKey>("post1");
  const [posted, setPosted] = useState(false);

  const headerTop = Platform.OS === "web" ? 67 : insets.top;

  const handlePost = async () => {
    if (!caption.trim()) return;
    await addPost(caption.trim(), selected);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setPosted(true);
    setCaption("");
    setTimeout(() => {
      setPosted(false);
      router.replace("/(tabs)/");
    }, 1500);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: headerTop, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>New Post</Text>
        <TouchableOpacity
          onPress={handlePost}
          disabled={!caption.trim() || posted}
          style={[styles.shareBtn, { backgroundColor: caption.trim() ? colors.primary : colors.secondary }]}
        >
          <Text style={[styles.shareBtnText, { color: caption.trim() ? "#fff" : colors.mutedForeground }]}>
            {posted ? "Shared!" : "Share"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 84 + 34 : 100 }}>
        <View style={styles.pickSection}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Choose a photo</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.imagePicker}>
            {IMAGE_KEYS.map((key) => (
              <TouchableOpacity
                key={key}
                onPress={() => setSelected(key)}
                style={[styles.imageOption, { borderColor: selected === key ? colors.primary : "transparent", borderWidth: 3 }]}
                activeOpacity={0.8}
              >
                <Image source={POST_IMAGES[key]} style={styles.optionImage} resizeMode="cover" />
                {selected === key && (
                  <View style={[styles.checkOverlay, { backgroundColor: colors.primary }]}>
                    <Feather name="check" size={18} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={[styles.previewWrap, { borderColor: colors.border }]}>
          <Image source={POST_IMAGES[selected]} style={styles.preview} resizeMode="cover" />
        </View>

        <View style={styles.captionSection}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Caption</Text>
          <TextInput
            style={[styles.captionInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.secondary }]}
            placeholder="Write a caption..."
            placeholderTextColor={colors.mutedForeground}
            value={caption}
            onChangeText={setCaption}
            multiline
            maxLength={300}
          />
          <Text style={[styles.charCount, { color: colors.mutedForeground }]}>{caption.length}/300</Text>
        </View>

        <View style={[styles.optionsSection, { borderTopColor: colors.border }]}>
          {["Tag people", "Add location", "Advanced settings"].map((opt) => (
            <TouchableOpacity key={opt} style={[styles.option, { borderBottomColor: colors.border }]}>
              <Text style={[styles.optionText, { color: colors.foreground }]}>{opt}</Text>
              <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
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
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
  },
  shareBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  shareBtnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
  pickSection: {
    paddingTop: 20,
    paddingLeft: 16,
    gap: 10,
  },
  sectionLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  imagePicker: {
    paddingRight: 16,
    gap: 10,
  },
  imageOption: {
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  optionImage: {
    width: 90,
    height: 90,
  },
  checkOverlay: {
    position: "absolute",
    bottom: 6,
    right: 6,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  previewWrap: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
  },
  preview: {
    width: "100%",
    aspectRatio: 1,
  },
  captionSection: {
    padding: 16,
    gap: 8,
  },
  captionInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    minHeight: 90,
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    textAlignVertical: "top",
  },
  charCount: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    textAlign: "right",
  },
  optionsSection: {
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: 8,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  optionText: {
    fontFamily: "Inter_500Medium",
    fontSize: 15,
  },
});
