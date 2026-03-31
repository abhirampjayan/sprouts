import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface ListHeadingProps {
  title: string;
}
const ListHeading = ({ title }: ListHeadingProps) => {
  return (
    <View className="list-head">
      <Text className="list-title">{title}</Text>
interface ListHeadingProps {
  title: string;
  onViewAllPress?: () => void;
  viewAllLabel?: string;
}

const ListHeading = ({
  title,
  onViewAllPress,
  viewAllLabel = "View All",
}: ListHeadingProps) => {
  return (
    <View className="list-head">
      <Text className="list-title">{title}</Text>
      {onViewAllPress ? (
        <TouchableOpacity
          className="list-action"
          onPress={onViewAllPress}
          accessibilityRole="button"
        >
          <Text className="list-action-text">{viewAllLabel}</Text>
        </TouchableOpacity>
      ) : (
        <Text className="list-action-text">{viewAllLabel}</Text>
      )}
    </View>
  );
};
    </View>
  );
};

export default ListHeading;
