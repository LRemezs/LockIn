import { configureLegendState } from "@legendapp/state";
import { observablePersist } from "@legendapp/state/persist";
import { observablePersistAsyncStorage } from "@legendapp/state/persist-plugins/async-storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Ensure persistence is properly configured
configureLegendState({
  persist: observablePersist({
    plugin: observablePersistAsyncStorage(AsyncStorage),
  }),
});
