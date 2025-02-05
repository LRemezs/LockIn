import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Button, StyleSheet, Text, TextInput, View } from "react-native";
import { user$ } from "../../state/state"; // Import Legend-State global user state
import { supabase } from "../../state/supabaseClient";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    try {
      // Authenticate user with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error; // Stop if there's an error

      // Get the user profile from Supabase
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("name, email")
        .eq("id", data.user.id)
        .single();

      if (profileError) throw profileError;

      // 🔹 Store full user data, including `id`
      user$.set({
        id: data.user.id, // ✅ Now storing user ID!
        name: profile.name,
        email: profile.email,
        loggedIn: true,
      });

      console.log("🟢 User logged in:", user$.get()); // ✅ Debug log

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (error) {
      Alert.alert("Login Failed", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Log In</Text>
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
      <Button title="Log In" onPress={handleLogin} />
      <Button title="Sign Up" onPress={() => router.push("/signup")} />
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
