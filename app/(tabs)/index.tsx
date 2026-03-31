import ListHeading from "@/components/common/ListHeading";
import UISafeAreaView from "@/components/common/UISafeAreaView";
import UpcomingCard from "@/components/Upcoming";
import {
  HOME_BALANCE,
  HOME_USER,
  UPCOMING_SUBSCRIPTIONS,
} from "@/constants/data";
import { icons } from "@/constants/icons";
import images from "@/constants/images";
import { formatCurrency } from "@/lib/util";
import dayjs from "dayjs";
import { FlatList, Image, Text, View } from "react-native";

const Home = () => {
  return (
    <UISafeAreaView>
      <View className="home-header">
        <View className="home-user">
          <Image source={images.avatar} className="home-avatar" />
          <Text className="home-user-name">{HOME_USER.name}</Text>
        </View>
        <View className="border border-gray-400 rounded-full p-2">
          <Image source={icons.add} className="home-add-icon" />
        </View>
      </View>
      <View className="home-balance-card">
        <Text className="home-balance-label">Balance</Text>
        <View className="home-balance-row">
          <Text className="home-balance-amount">
            {formatCurrency(HOME_BALANCE.amount)}
          </Text>
          <Text className="home-balance-date">
            {dayjs(HOME_BALANCE.nextRenewalDate).format("MM/DD")}
          </Text>
        </View>
      </View>
      <View>
        <ListHeading title="Upcoming" />
        <FlatList
          data={UPCOMING_SUBSCRIPTIONS}
          renderItem={({ item }) => <UpcomingCard {...item} />}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      </View>
      <View>
        <ListHeading title="All Subscriptions" />
      </View>
    </UISafeAreaView>
  );
};

export default Home;
