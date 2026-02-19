import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { FaSignOutAlt, FaKey } from "react-icons/fa";
import { AuthContext } from "../context/auth.context";

export default function Profile() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  if (!user) {
    return (
      <h2 style={{ marginTop: "120px", textAlign: "center" }}>
        Not Authorized
      </h2>
    );
  }

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h2>Profile</h2>

        <p>
          <strong>Username:</strong> {user.username}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>Role:</strong> {user.role}
        </p>
        {user.room && (
          <p>
            <strong>Room:</strong> {user.room}
          </p>
        )}

        <button
          className="update-btn"
          onClick={() => navigate("/reset-password")}
        >
          <FaKey /> Reset Password
        </button>

        <button className="logout-btn" onClick={handleLogout}>
          <FaSignOutAlt /> Logout
        </button>
      </div>
    </div>
  );
}
