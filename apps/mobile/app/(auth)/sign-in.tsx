import { useSignIn, useSSO } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { colors } from "../../constants/Colors";

WebBrowser.maybeCompleteAuthSession();

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { startSSOFlow } = useSSO();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  React.useEffect(() => {
    if (Platform.OS !== "web") {
      void WebBrowser.warmUpAsync();
      return () => { void WebBrowser.coolDownAsync(); };
    }
  }, []);

  const onGoogleSignIn = useCallback(async () => {
    setGoogleLoading(true);
    setError("");
    try {
      const { createdSessionId, setActive: setActiveSession } =
        await startSSOFlow({
          strategy: "oauth_google",
          redirectUrl: "com.flocknerd.app://callback",
        });

      if (createdSessionId && setActiveSession) {
        await setActiveSession({ session: createdSessionId });
        router.replace("/(app)/(tabs)");
      }
    } catch (err: any) {
      console.error("Google sign in error:", JSON.stringify(err));
      setError(err.errors?.[0]?.longMessage || err.errors?.[0]?.message || "Google sign in failed");
    } finally {
      setGoogleLoading(false);
    }
  }, [startSSOFlow]);

  const onSignIn = async () => {
    if (!isLoaded) return;
    setLoading(true);
    setError("");

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.replace("/(app)/(tabs)");
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.inner}>
        <Text style={styles.title}>FlockNerd</Text>
        <Text style={styles.subtitle}>Sign in to your account</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.googleButton, googleLoading && styles.buttonDisabled]}
          onPress={onGoogleSignIn}
          disabled={googleLoading}
          accessibilityLabel="Continue with Google"
          accessibilityRole="button"
        >
          {googleLoading ? (
            <ActivityIndicator color={colors.gray[700]} />
          ) : (
            <View style={styles.googleButtonContent}>
              <Ionicons name="logo-google" size={20} color={colors.gray[700]} style={{ marginRight: 10 }} />
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={colors.gray[400]}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={colors.gray[400]}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={onSignIn}
          disabled={loading}
          accessibilityLabel="Sign in"
          accessibilityRole="button"
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.buttonText}>Sign In</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <Link href="/(auth)/sign-up" asChild>
            <TouchableOpacity hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} accessibilityLabel="Sign up" accessibilityRole="link">
              <Text style={styles.link}>Sign Up</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  inner: { flex: 1, justifyContent: "center", paddingHorizontal: 24 },
  title: { fontSize: 36, fontWeight: "bold", color: colors.primary, textAlign: "center", marginBottom: 8 },
  subtitle: { fontSize: 16, color: colors.gray[500], textAlign: "center", marginBottom: 32 },
  googleButton: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.gray[300], borderRadius: 12, padding: 16, alignItems: "center", justifyContent: "center" },
  googleButtonContent: { flexDirection: "row", alignItems: "center" },
  googleButtonText: { color: colors.gray[700], fontSize: 16, fontWeight: "600" },
  divider: { flexDirection: "row", alignItems: "center", marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.gray[200] },
  dividerText: { marginHorizontal: 12, color: colors.text.muted, fontSize: 14 },
  input: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.gray[200], borderRadius: 12, padding: 16, fontSize: 16, marginBottom: 12, color: colors.gray[900] },
  button: { backgroundColor: colors.primary, borderRadius: 12, padding: 16, alignItems: "center", marginTop: 8 },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: colors.white, fontSize: 16, fontWeight: "600" },
  error: { color: colors.accent1, textAlign: "center", marginBottom: 16 },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 24 },
  footerText: { color: colors.gray[500] },
  link: { color: colors.primary, fontWeight: "600" },
});
