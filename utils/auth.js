import AsyncStorage from "@react-native-async-storage/async-storage";
import { testAccounts } from "../assets/testAccounts";

// Check Login Credentials
export async function login(email, password) {
  const user = testAccounts.find(
    (u) => u.email === email && u.password === password
  );
  if (!user) throw new Error("Invalid email or password");

  await AsyncStorage.setItem("currentUser", JSON.stringify(user));
  return user;
}

// Get Current User

export async function getCurrentUser() {
  const user = await AsyncStorage.getItem("currentUser");
  return user ? JSON.parse(user) : null;
}

// Logout

export async function logout() {
  await AsyncStorage.removeItem("currentUser");
}
