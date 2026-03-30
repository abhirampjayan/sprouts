import { styled } from "nativewind";
import type { PropsWithChildren } from "react";
import { SafeAreaView as RnSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RnSafeAreaView);

const UISafeAreaView = (props: PropsWithChildren) => (
  <SafeAreaView className="flex-1 bg-background p-5">
    {props.children}
  </SafeAreaView>
);

export default UISafeAreaView;
