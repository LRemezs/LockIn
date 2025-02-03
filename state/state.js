import { observable } from "@legendapp/state";

// Store the user information (e.g., after login)
export const user$ = observable({
  name: "",
  email: "",
  loggedIn: false,
});

// Store app settings (e.g., theme preferences)
export const settings$ = observable({
  darkMode: false,
  notificationsEnabled: true,
});
