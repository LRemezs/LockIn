import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export default function ProfileDashboard() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, padding: 16, justifyContent: "space-between" }}>
      {/* Profile Section */}
      <TouchableOpacity
        style={styles.box}
        onPress={() => router.push("/profile/info")}
      >
        <Text>👤 Profile Info</Text>
      </TouchableOpacity>

      {/* Challenge Toggle & Browse */}
      <View style={styles.row}>
        <TouchableOpacity
          style={styles.box}
          onPress={() => router.push("/profile/challenges")}
        >
          <Text>🔄 Challenge Toggle</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.box}
          onPress={() => router.push("/profile/browse")}
        >
          <Text>🔍 Browse Challenges</Text>
        </TouchableOpacity>
      </View>

      {/* Slideshow Section */}
      <TouchableOpacity
        style={styles.slideshow}
        onPress={() => router.push("/profile/achievementLogs")}
      >
        <Text>🎯 Recent Achievements →</Text>
      </TouchableOpacity>

      {/* Wall of Inspiration */}
      <TouchableOpacity
        style={[styles.box, { height: 200 }]}
        onPress={() => router.push("/profile/wall")}
      >
        <Text>🌟 Wall of Inspiration</Text>
        <Text style={styles.hint}>(Future Social Hub)</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = {
  box: {
    height: 80,
    margin: 10,
    borderRadius: 10,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  slideshow: {
    height: 50,
    marginVertical: 10,
    borderRadius: 10,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
  },
  hint: {
    fontSize: 10,
    color: "#666",
  },
};
