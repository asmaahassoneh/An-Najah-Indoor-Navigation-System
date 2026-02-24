import { useContext, useEffect } from "react";
import { AuthContext } from "../context/auth.context";
import { useRouter } from "expo-router";

export default function ProtectedRoute({ children }) {
  const { user } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (!user) router.replace("/login");
  }, [user, router]);

  if (!user) return null;
  return children;
}
