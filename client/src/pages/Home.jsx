import { useContext } from "react";
import { AuthContext } from "../context/auth.context";

export default function Home() {
  const { user } = useContext(AuthContext);

  return (
    <div className="home">
      <div className="home-content">
        {user ? (
          <>
            <h1>Welcome {user.username}</h1>
            <p>Role: {user.role}</p>
          </>
        ) : (
          <>
            <h1>Welcome to User System</h1>
            <p>Please login or register</p>
          </>
        )}
      </div>
    </div>
  );
}
