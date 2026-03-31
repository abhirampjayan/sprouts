import { formatCurrency } from "@/lib/util";
import { Image, Text, View } from "react-native";

const UpcomingCard = ({
  icon,
  name,
  price,
  daysLeft,
}: UpcomingSubscription) => {
  return (
    <View className="upcoming-card">
      <View className="upcoming-row">
        <Image source={icon} className="upcoming-icon" />
        <View>
          <Text className="upcoming-price">{formatCurrency(price)}</Text>
          <Text className="upcoming-meta" numberOfLines={1}>
            {daysLeft > 1 ? `${daysLeft} days left` : `Last day`}
          </Text>
        </View>
      </View>
      <Text className="upcoming-name">{name}</Text>
    </View>
  );
};

export default UpcomingCard;
