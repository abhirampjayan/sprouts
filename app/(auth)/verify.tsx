import UISafeAreaView from "@/components/common/UISafeAreaView";
import { useSignIn, useSignUp } from "@clerk/expo";
import { type Href, useLocalSearchParams, useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

function OTPInput({
  value,
  onChange,
  hasError,
}: {
  value: string;
  onChange: (v: string) => void;
  hasError: boolean;
}) {
  const inputRef = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={() => inputRef.current?.focus()}
    >
      <View className="flex-row justify-between w-full">
        {Array.from({ length: 6 }).map((_, i) => {
          const char = value[i];
          const isActiveSlot = focused && i === Math.min(value.length, 5);
          const isFilled = !!char;
          return (
            <View
              key={i}
              className={[
                "otp-box",
                isFilled && !hasError ? "otp-box-filled" : "",
                isActiveSlot ? "otp-box-active" : "",
                hasError ? "otp-box-error" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {char ? (
                <Text className="otp-digit">{char}</Text>
              ) : isActiveSlot ? (
                <View className="otp-cursor" />
              ) : null}
            </View>
          );
        })}
      </View>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={(t) => onChange(t.replace(/[^0-9]/g, "").slice(0, 6))}
        keyboardType="number-pad"
        maxLength={6}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        caretHidden
        style={{ position: "absolute", opacity: 0, width: 1, height: 1 }}
      />
    </TouchableOpacity>
  );
}

export default function Verify() {
  const { email, mode } = useLocalSearchParams<{
    email: string;
    mode: "sign-up" | "sign-in";
  }>();
  const router = useRouter();

  const {
    signUp,
    errors: signUpErrors,
    fetchStatus: signUpFetchStatus,
  } = useSignUp();
  const {
    signIn,
    errors: signInErrors,
    fetchStatus: signInFetchStatus,
  } = useSignIn();

  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const isSignUp = mode !== "sign-in";
  const isLoading =
    (isSignUp ? signUpFetchStatus : signInFetchStatus) === "fetching";

  const handleVerify = async () => {
    if (code.length < 6) {
      setError("Enter the full 6-digit code");
      return;
    }
    setError(null);

    try {
      if (isSignUp) {
        if (!signUp) return;
        await signUp.verifications.verifyEmailCode({ code });
        if (signUp.status === "complete") {
          await signUp.finalize({
            navigate: ({ session, decorateUrl }) => {
              if (session?.currentTask) return;
              const url = decorateUrl("/");
              router.replace(url as Href);
            },
          });
        } else {
          setError("Verification incomplete. Please try again.");
        }
      } else {
        if (!signIn) return;
        await signIn.mfa.verifyEmailCode({ code });
        if (signIn.status === "complete") {
          await signIn.finalize({
            navigate: ({ session, decorateUrl }) => {
              if (session?.currentTask) return;
              const url = decorateUrl("/");
              router.replace(url as Href);
            },
          });
        } else {
          setError("Verification incomplete. Please try again.");
        }
      }
    } catch (err: any) {
      setError(
        err?.errors?.[0]?.longMessage ??
          "Invalid code. Please check and try again.",
      );
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError(null);
    setCode("");

    try {
      if (isSignUp && signUp) {
        await signUp.verifications.sendEmailCode();
      } else if (!isSignUp && signIn) {
        await signIn.mfa.sendEmailCode();
      }
      setResendCooldown(30);
      const interval = setInterval(() => {
        setResendCooldown((c) => {
          if (c <= 1) {
            clearInterval(interval);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    } catch (err: any) {
      setError(
        err?.errors?.[0]?.longMessage ?? "Failed to resend. Please try again.",
      );
    }
  };

  // Clerk reactive field error for the OTP code (e.g. "incorrect code")
  const activeErrors = isSignUp ? signUpErrors : signInErrors;
  const codeFieldError = activeErrors?.fields?.code?.message ?? null;
  const displayError = error ?? codeFieldError;

  const maskedEmail = email
    ? email.replace(/(.{2}).+(@.+)/, "$1•••$2")
    : "your email";

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
            {/* Back */}
            <TouchableOpacity
              onPress={() => router.back()}
              hitSlop={12}
              className="mb-2 self-start"
            >
              <Text className="text-sm font-sans-semibold text-accent">
                ← Back
              </Text>
            </TouchableOpacity>

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
              <Text className="auth-title">Check your inbox</Text>
              <Text className="auth-subtitle">
                We sent a 6-digit code to{"\n"}
                <Text className="font-sans-bold text-primary">
                  {maskedEmail}
                </Text>
              </Text>
            </View>

            {/* OTP card */}
            <View className="auth-card">
              <View className="auth-form">
                <View className="auth-field items-center">
                  <OTPInput
                    value={code}
                    onChange={(v) => {
                      setCode(v);
                      if (error) setError(null);
                    }}
                    hasError={!!displayError}
                  />
                  {displayError ? (
                    <Text className="auth-error mt-3 text-center">
                      {displayError}
                    </Text>
                  ) : null}
                </View>

                {/* Verify */}
                <TouchableOpacity
                  className={`auth-button${isLoading || code.length < 6 ? " auth-button-disabled" : ""}`}
                  onPress={handleVerify}
                  disabled={isLoading || code.length < 6}
                  activeOpacity={0.85}
                >
                  <Text className="auth-button-text">
                    {isLoading ? "Verifying…" : "Verify"}
                  </Text>
                </TouchableOpacity>

                {/* Resend */}
                <View className="auth-divider-row">
                  <View className="auth-divider-line" />
                  <Text className="auth-divider-text">or</Text>
                  <View className="auth-divider-line" />
                </View>

                <TouchableOpacity
                  className={`auth-secondary-button${resendCooldown > 0 ? " opacity-50" : ""}`}
                  onPress={handleResend}
                  disabled={resendCooldown > 0}
                  activeOpacity={0.8}
                >
                  <Text className="auth-secondary-button-text">
                    {resendCooldown > 0
                      ? `Resend in ${resendCooldown}s`
                      : "Resend code"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <Text className="auth-helper mt-5 text-center px-4">
              Didn't receive it? Check your spam folder or go back to try a
              different email address.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </UISafeAreaView>
  );
}
