import UISafeAreaView from "@/components/common/UISafeAreaView";
import { useSignUp } from "@clerk/expo";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function SignUp() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [localErrors, setLocalErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    form?: string;
  }>({});

  const isLoading = fetchStatus === "fetching";

  const validate = (): boolean => {
    const errs: typeof localErrors = {};
    if (!email.trim()) {
      errs.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = "Enter a valid email address";
    }
    if (!password) {
      errs.password = "Password is required";
    } else if (password.length < 8) {
      errs.password = "Password must be at least 8 characters";
    }
    if (!confirmPassword) {
      errs.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      errs.confirmPassword = "Passwords don't match";
    }
    setLocalErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSignUp = async () => {
    if (!validate() || !signUp) return;
    setLocalErrors({});

    try {
      const { error } = await signUp.password({
        emailAddress: email.trim(),
        password,
      });

      if (error) {
        setLocalErrors({ form: error.longMessage ?? error.message });
        return;
      }

      await signUp.verifications.sendEmailCode();

      router.push({
        pathname: "/(auth)/verify",
        params: { email: email.trim(), mode: "sign-up" },
      } as any);
    } catch (err: any) {
      setLocalErrors({
        form:
          err?.errors?.[0]?.longMessage ??
          "Something went wrong. Please try again.",
      });
    }
  };

  // Clerk reactive field errors (API-level, e.g. "email already taken")
  const emailError =
    localErrors.email ?? errors?.fields?.emailAddress?.message ?? null;
  const passwordError =
    localErrors.password ?? errors?.fields?.password?.message ?? null;
  const globalError = localErrors.form ?? errors?.global?.[0]?.message ?? null;

  return (
    <UISafeAreaView>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          className="auth-scroll"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="auth-content">
            {/* Brand */}
            <View className="auth-brand-block">
              <View className="auth-logo-wrap">
                <View className="auth-logo-mark">
                  <Text className="auth-logo-mark-text">S</Text>
                </View>
                <View>
                  <Text className="auth-wordmark">sprout</Text>
                  <Text className="auth-wordmark-sub">
                    subscription tracker
                  </Text>
                </View>
              </View>
              <Text className="auth-title">Create account</Text>
              <Text className="auth-subtitle">
                Take control of every subscription you pay for
              </Text>
            </View>

            {/* Form card */}
            <View className="auth-card">
              <View className="auth-form">
                {/* Global error banner */}
                {globalError ? (
                  <View className="rounded-2xl bg-destructive/10 px-4 py-3">
                    <Text className="auth-error">{globalError}</Text>
                  </View>
                ) : null}

                {/* Email */}
                <View className="auth-field">
                  <Text className="auth-label">Email</Text>
                  <TextInput
                    className={`auth-input${emailError ? " auth-input-error" : ""}`}
                    value={email}
                    onChangeText={(t) => {
                      setEmail(t);
                      if (localErrors.email)
                        setLocalErrors((e) => ({ ...e, email: undefined }));
                    }}
                    placeholder="you@example.com"
                    placeholderTextColor="rgba(0,0,0,0.3)"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="email"
                    returnKeyType="next"
                  />
                  {emailError ? (
                    <Text className="auth-error">{emailError}</Text>
                  ) : null}
                </View>

                {/* Password */}
                <View className="auth-field">
                  <Text className="auth-label">Password</Text>
                  <View>
                    <TextInput
                      className={`auth-input pr-16${passwordError ? " auth-input-error" : ""}`}
                      value={password}
                      onChangeText={(t) => {
                        setPassword(t);
                        if (localErrors.password)
                          setLocalErrors((e) => ({
                            ...e,
                            password: undefined,
                          }));
                      }}
                      placeholder="Min. 8 characters"
                      placeholderTextColor="rgba(0,0,0,0.3)"
                      secureTextEntry={!showPassword}
                      autoComplete="new-password"
                      returnKeyType="next"
                    />
                    <TouchableOpacity
                      className="absolute right-4 top-0 bottom-0 justify-center"
                      onPress={() => setShowPassword((s) => !s)}
                      hitSlop={8}
                    >
                      <Text className="text-sm font-sans-semibold text-accent">
                        {showPassword ? "Hide" : "Show"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {passwordError ? (
                    <Text className="auth-error">{passwordError}</Text>
                  ) : null}
                </View>

                {/* Confirm password */}
                <View className="auth-field">
                  <Text className="auth-label">Confirm password</Text>
                  <View>
                    <TextInput
                      className={`auth-input pr-16${localErrors.confirmPassword ? " auth-input-error" : ""}`}
                      value={confirmPassword}
                      onChangeText={(t) => {
                        setConfirmPassword(t);
                        if (localErrors.confirmPassword)
                          setLocalErrors((e) => ({
                            ...e,
                            confirmPassword: undefined,
                          }));
                      }}
                      placeholder="Re-enter your password"
                      placeholderTextColor="rgba(0,0,0,0.3)"
                      secureTextEntry={!showConfirm}
                      autoComplete="new-password"
                      returnKeyType="done"
                      onSubmitEditing={handleSignUp}
                    />
                    <TouchableOpacity
                      className="absolute right-4 top-0 bottom-0 justify-center"
                      onPress={() => setShowConfirm((s) => !s)}
                      hitSlop={8}
                    >
                      <Text className="text-sm font-sans-semibold text-accent">
                        {showConfirm ? "Hide" : "Show"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {localErrors.confirmPassword ? (
                    <Text className="auth-error">
                      {localErrors.confirmPassword}
                    </Text>
                  ) : null}
                </View>

                {/* Hint */}
                <Text className="auth-helper">
                  By creating an account you agree to our Terms of Service and
                  Privacy Policy.
                </Text>

                {/* Submit */}
                <TouchableOpacity
                  className={`auth-button${isLoading ? " auth-button-disabled" : ""}`}
                  onPress={handleSignUp}
                  disabled={isLoading}
                  activeOpacity={0.85}
                >
                  <Text className="auth-button-text">
                    {isLoading ? "Creating account…" : "Create account"}
                  </Text>
                </TouchableOpacity>

                {/* Required: Clerk bot-protection captcha anchor */}
                <View nativeID="clerk-captcha" />
              </View>
            </View>

            {/* Footer */}
            <View className="auth-link-row">
              <Text className="auth-link-copy">Already have an account?</Text>
              <Link href="/(auth)/sign-in" asChild>
                <TouchableOpacity hitSlop={8}>
                  <Text className="auth-link">Sign in</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </UISafeAreaView>
  );
}
