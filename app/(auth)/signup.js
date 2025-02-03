import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Button, StyleSheet, Text, TextInput, View } from "react-native";
import { user$ } from "../../state/state"; // Import Legend-State global user state
import { supabase } from "../../state/supabaseClient";

export default function SignupScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSignUp = async () => {
    try {
      // Create user in Supabase authentication
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error; // If there's an error, stop here

      // Extract the user ID from Supabase
      const userId = data.user?.id;

      // Save user details in Supabase 'profiles' table
      const { error: dbError } = await supabase
        .from("profiles")
        .insert([{ id: userId, name, email }]);

      if (dbError) throw dbError;

      // Store user data locally using Legend-State
      user$.set({ name, email, loggedIn: true });

      Alert.alert("Sign Up Successful", "Your account has been created!");
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
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
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
