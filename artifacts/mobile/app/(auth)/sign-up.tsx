import * as AuthSession from "expo-auth-session";
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
import { useSignUp, useSSO } from "@clerk/expo";

WebBrowser.maybeCompleteAuthSession();

export default function SignUpScreen() {
  const { signUp, errors, fetchStatus } = useSignUp();
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

  const handleSignUp = async () => {
    const { error } = await signUp.password({ emailAddress: email, password });
    if (error) return;
    if (!error) await signUp.verifications.sendEmailCode();
  };

  const handleVerify = async () => {
    await signUp.verifications.verifyEmailCode({ code });
    if (signUp.status === "complete") {
      await signUp.finalize({
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

  if (
    signUp.status === "missing_requirements" &&
    signUp.unverifiedFields.includes("email_address") &&
    signUp.missingFields.length === 0
  ) {
    return (
      <View style={[styles.container, { paddingTop: topPad + 40, paddingHorizontal: 28 }]}>
        <Text style={styles.logo}>Vibe</Text>
        <Text style={styles.title}>Check your email</Text>
        <Text style={styles.subtitle}>Enter the verification code sent to {email}</Text>
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
        <TouchableOpacity onPress={() => signUp.verifications.sendEmailCode()} style={styles.linkWrap}>
          <Text style={styles.linkText}>Resend code</Text>
        </TouchableOpacity>
        <View nativeID="clerk-captcha" />
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
        <Text style={styles.title}>Create account</Text>
        <Text style={styles.subtitle}>Join Vibe today</Text>

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
        {errors.fields.emailAddress && <Text style={styles.error}>{errors.fields.emailAddress.message}</Text>}

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Create a password"
          placeholderTextColor="#666"
          secureTextEntry
        />
        {errors.fields.password && <Text style={styles.error}>{errors.fields.password.message}</Text>}

        <Pressable
          style={[styles.btn, (!email || !password || fetchStatus === "fetching") && styles.btnDisabled]}
          onPress={handleSignUp}
          disabled={!email || !password || fetchStatus === "fetching"}
        >
          {fetchStatus === "fetching" ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Create account</Text>}
        </Pressable>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Link href="/(auth)/sign-in" asChild>
            <TouchableOpacity>
              <Text style={styles.footerLink}>Sign in</Text>
            </TouchableOpacity>
          </Link>
        </View>
        <View nativeID="clerk-captcha" />
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
  linkWrap: { alignItems: "center", paddingVertical: 10 },
  linkText: { fontFamily: "Inter_500Medium", fontSize: 14, color: "#FF3B5C" },
});
