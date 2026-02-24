import { useCallback, useMemo, useState } from "react";
import { AuthContext } from "./auth.context";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");

  const login = useCallback((userData, jwt) => {
    setUser(userData);
    setToken(jwt);
  }, []);

  const logout = useCallback(async () => {
    setUser(null);
    setToken("");
  }, []);

  const value = useMemo(
    () => ({ user, token, login, logout }),
    [user, token, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
