import { useNavigate } from "react-router-dom";
import {
  X,
  Settings,
  LogOut,
  User,
  KeyRound,
  Mail,
  CalendarDays,
  LayoutDashboard,
} from "lucide-react";
import { useContext } from "react";
import { AuthContext } from "../context/auth.context";

export default function ProfileSidebar({ open, onClose }) {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const goTo = (path) => {
    navigate(path);
    onClose();
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
    onClose();
  };

  return (
    <>
      {open && <div className="sidebarOverlay" onClick={onClose}></div>}

      <div className={`profileSidebar ${open ? "open" : ""}`}>
        <div className="sidebarHeader">
          {user && <span className="user-pill">{user.username}</span>}

          <button className="closeBtn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="sidebarMenu">
          <button className="sidebarItem" onClick={() => goTo("/profile")}>
            <User size={18} />
            Profile
          </button>

          <button className="sidebarItem" onClick={() => goTo("/settings")}>
            <Settings size={18} />
            Settings
          </button>

          <button
            className="sidebarItem"
            onClick={() => goTo("/reset-password")}
          >
            <KeyRound size={18} />
            Reset Password
          </button>

          {(user?.role === "student" || user?.role === "professor") && (
            <>
              <button
                className="sidebarItem"
                onClick={() => goTo("/my-schedule")}
              >
                <CalendarDays size={18} />
                My Schedule
              </button>

              <button className="sidebarItem" onClick={() => goTo("/inbox")}>
                <Mail size={18} />
                Inbox
              </button>
            </>
          )}

          {user?.role === "admin" && (
            <button className="sidebarItem" onClick={() => goTo("/admin")}>
              <LayoutDashboard size={18} />
              Dashboard
            </button>
          )}
        </div>

        <div className="sidebarBottom">
          <button className="logoutBtn" onClick={handleLogout}>
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </>
  );
}
