import { useContext } from "react";
import { Redirect } from "expo-router";
import { AuthContext } from "../context/auth.context";

export default function ProtectedRoute({ children }) {
  const { user, hydrating } = useContext(AuthContext);

  if (hydrating) return null;
  if (!user) return <Redirect href="/login" />;
  return children;
}
