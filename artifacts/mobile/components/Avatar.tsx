import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface AvatarProps {
  color: string;
  name: string;
  size?: number;
  fontSize?: number;
}

export function Avatar({ color, name, size = 40, fontSize = 15 }: AvatarProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: color }]}>
      <Text style={[styles.initials, { fontSize }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: "center",
    justifyContent: "center",
  },
  initials: {
    color: "#ffffff",
    fontFamily: "Inter_600SemiBold",
  },
});
