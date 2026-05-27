import * as AuthSession from "expo-auth-session";
import * as Haptics from "expo-haptics";
import { Link, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSignIn, useSSO } from "@clerk/expo";

WebBrowser.maybeCompleteAuthSession();

export default function SignInScreen() {
  const { signIn, errors, fetchStatus } = useSignIn();
  const { startSSOFlow } = useSSO();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (Platform.OS !== "android") return;
    void WebBrowser.warmUpAsync();
    return () => { void WebBrowser.coolDownAsync(); };
  }, []);

  const handleSignIn = async () => {
    const { error } = await signIn.password({ emailAddress: email, password });
    if (error) return;
    if (signIn.status === "complete") {
      await signIn.finalize({
        navigate: ({ decorateUrl }) => {
          const url = decorateUrl("/");
          if (url.startsWith("http")) { window.location.href = url; }
          else { router.replace("/(tabs)/"); }
        },
      });
    } else if (signIn.status === "needs_client_trust") {
      await signIn.mfa.sendEmailCode();
    }
  };

  const handleVerify = async () => {
    await signIn.mfa.verifyEmailCode({ code });
    if (signIn.status === "complete") {
      await signIn.finalize({
        navigate: ({ decorateUrl }) => {
          const url = decorateUrl("/");
          if (url.startsWith("http")) { window.location.href = url; }
          else { router.replace("/(tabs)/"); }
        },
      });
    }
  };

  const handleGoogle = useCallback(async () => {
    setGoogleLoading(true);
    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: "oauth_google",
        redirectUrl: AuthSession.makeRedirectUri(),
      });
      if (createdSessionId) {
        await setActive!({
          session: createdSessionId,
          navigate: async ({ decorateUrl }) => {
            router.replace("/(tabs)/");
          },
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGoogleLoading(false);
    }
  }, []);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  if (signIn.status === "needs_client_trust") {
    return (
      <View style={[styles.container, { paddingTop: topPad }]}>
        <Text style={styles.title}>Check your email</Text>
        <Text style={styles.subtitle}>Enter the code we sent to {email}</Text>
        <TextInput
          style={styles.input}
          value={code}
          onChangeText={setCode}
          placeholder="6-digit code"
          placeholderTextColor="#666"
          keyboardType="numeric"
          autoFocus
        />
        {errors.fields.code && <Text style={styles.error}>{errors.fields.code.message}</Text>}
        <Pressable
          style={[styles.btn, fetchStatus === "fetching" && styles.btnDisabled]}
          onPress={handleVerify}
          disabled={fetchStatus === "fetching"}
        >
          {fetchStatus === "fetching" ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Verify</Text>}
        </Pressable>
        <TouchableOpacity onPress={() => signIn.mfa.sendEmailCode()} style={styles.link}>
          <Text style={styles.linkText}>Resend code</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => signIn.reset()} style={styles.link}>
          <Text style={styles.linkText}>Start over</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={[styles.inner, { paddingTop: topPad + 40 }]}>
        <Text style={styles.logo}>Vibe</Text>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>

        <TouchableOpacity
          style={[styles.googleBtn, googleLoading && styles.btnDisabled]}
          onPress={handleGoogle}
          disabled={googleLoading}
          activeOpacity={0.85}
        >
          {googleLoading ? (
            <ActivityIndicator color="#0a0a0a" />
          ) : (
            <>
              <Text style={styles.googleIcon}>G</Text>
              <Text style={styles.googleBtnText}>Continue with Google</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          placeholderTextColor="#666"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
        {errors.fields.identifier && <Text style={styles.error}>{errors.fields.identifier.message}</Text>}

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor="#666"
          secureTextEntry
        />
        {errors.fields.password && <Text style={styles.error}>{errors.fields.password.message}</Text>}

        <Pressable
          style={[styles.btn, (!email || !password || fetchStatus === "fetching") && styles.btnDisabled]}
          onPress={handleSignIn}
          disabled={!email || !password || fetchStatus === "fetching"}
        >
          {fetchStatus === "fetching" ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Sign in</Text>}
        </Pressable>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <Link href="/(auth)/sign-up" asChild>
            <TouchableOpacity>
              <Text style={styles.footerLink}>Sign up</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0d0d0d" },
  inner: { flex: 1, paddingHorizontal: 28 },
  logo: { fontFamily: "Inter_700Bold", fontSize: 32, color: "#FF3B5C", letterSpacing: -1, marginBottom: 24 },
  title: { fontFamily: "Inter_700Bold", fontSize: 28, color: "#fff", marginBottom: 6 },
  subtitle: { fontFamily: "Inter_400Regular", fontSize: 15, color: "#888", marginBottom: 32 },
  googleBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    backgroundColor: "#fff", borderRadius: 14, paddingVertical: 14, gap: 10, marginBottom: 24,
  },
  googleIcon: { fontFamily: "Inter_700Bold", fontSize: 18, color: "#4285F4" },
  googleBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: "#0a0a0a" },
  divider: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 24 },
  dividerLine: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: "#2a2a2a" },
  dividerText: { fontFamily: "Inter_400Regular", fontSize: 13, color: "#666" },
  label: { fontFamily: "Inter_500Medium", fontSize: 13, color: "#aaa", marginBottom: 8 },
  input: {
    backgroundColor: "#1a1a1a", borderWidth: 1, borderColor: "#2a2a2a", borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14, color: "#fff", fontFamily: "Inter_400Regular",
    fontSize: 15, marginBottom: 16,
  },
  btn: {
    backgroundColor: "#FF3B5C", borderRadius: 14, paddingVertical: 16,
    alignItems: "center", marginTop: 4, marginBottom: 24,
  },
  btnDisabled: { opacity: 0.45 },
  btnText: { fontFamily: "Inter_600SemiBold", fontSize: 16, color: "#fff" },
  error: { fontFamily: "Inter_400Regular", fontSize: 13, color: "#FF3B5C", marginTop: -10, marginBottom: 12 },
  footer: { flexDirection: "row", justifyContent: "center", alignItems: "center" },
  footerText: { fontFamily: "Inter_400Regular", fontSize: 14, color: "#888" },
  footerLink: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: "#FF3B5C" },
  link: { alignItems: "center", paddingVertical: 10 },
  linkText: { fontFamily: "Inter_500Medium", fontSize: 14, color: "#FF3B5C" },
});
