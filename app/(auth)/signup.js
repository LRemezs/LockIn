import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Button, StyleSheet, Text, TextInput, View } from "react-native";

export default function SignupScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSignUp = async () => {
    try {
      // Fetch the existing test accounts
      const existingAccounts = JSON.parse(
        (await AsyncStorage.getItem("testAccounts")) || "[]"
      );

      // Check if email is already registered
      if (existingAccounts.some((account) => account.email === email)) {
        throw new Error("This email is already registered!");
      }

      // Add the new account to the list
      const newAccount = {
        email,
        password,
        firstName: "New",
        lastName: "User",
      };
      const updatedAccounts = [...existingAccounts, newAccount];
      await AsyncStorage.setItem(
        "testAccounts",
        JSON.stringify(updatedAccounts)
      );

      Alert.alert(
        "Sign Up Successful",
        "You can now log in with your new account!"
      );
      router.push("/login"); // Redirect to login
    } catch (error) {
      Alert.alert("Sign Up Failed", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Sign Up" onPress={handleSignUp} />
      <Button title="Back to Log In" onPress={() => router.push("/login")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
});
