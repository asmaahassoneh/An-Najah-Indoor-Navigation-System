import { useCallback, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthContext } from "./auth.context";

const KEY_USER = "auth_user";
const KEY_TOKEN = "auth_token";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");
  const [hydrating, setHydrating] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [u, t] = await Promise.all([
          AsyncStorage.getItem(KEY_USER),
          AsyncStorage.getItem(KEY_TOKEN),
        ]);

        setUser(u ? JSON.parse(u) : null);
        setToken(t || "");
      } catch {
        setUser(null);
        setToken("");
      } finally {
        setHydrating(false);
      }
    })();
  }, []);

  const login = useCallback(async (userData, jwt) => {
    setUser(userData);
    setToken(jwt);

    await Promise.all([
      AsyncStorage.setItem(KEY_USER, JSON.stringify(userData)),
      AsyncStorage.setItem(KEY_TOKEN, jwt),
    ]);
  }, []);

  const logout = useCallback(async () => {
    setUser(null);
    setToken("");

    await Promise.all([
      AsyncStorage.removeItem(KEY_USER),
      AsyncStorage.removeItem(KEY_TOKEN),
    ]);
  }, []);

  const value = useMemo(
    () => ({ user, token, login, logout, hydrating }),
    [user, token, login, logout, hydrating],
  );

  if (hydrating) return null;

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
