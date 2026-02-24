import { useContext, useEffect } from "react";
import { AuthContext } from "../context/auth.context";
import { useRouter } from "expo-router";

export default function AdminRoute({ children }) {
  const { user } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (!user) return router.replace("/login");
    if (user.role !== "admin") router.replace("/");
  }, [user, router]);

  if (!user || user.role !== "admin") return null;
  return children;
}
