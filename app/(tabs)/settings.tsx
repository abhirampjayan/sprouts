import UISafeAreaView from "@/components/common/UISafeAreaView";
import { useAuth } from "@clerk/expo";
import React from "react";
import { Pressable, Text } from "react-native";

const SettingsPage = () => {
  const { signOut } = useAuth();
  return (
    <UISafeAreaView>
      <Text>Home</Text>
      <Pressable onPress={() => signOut()}>
        <Text>Sign out</Text>
      </Pressable>
    </UISafeAreaView>
  );
};

export default SettingsPage;
