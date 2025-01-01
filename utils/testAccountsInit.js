import AsyncStorage from "@react-native-async-storage/async-storage";

export async function initializeTestAccounts() {
  const existingAccounts = await AsyncStorage.getItem("testAccounts");
  if (!existingAccounts) {
    await AsyncStorage.setItem(
      "testAccounts",
      JSON.stringify([
        {
          email: "test@test.com",
          password: "tester",
          firstName: "Test",
          lastName: "Subject",
        },
      ])
    );
  }
}
