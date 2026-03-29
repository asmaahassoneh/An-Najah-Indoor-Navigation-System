import { NavLink } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import { useEffect, useContext, useState } from "react";
import { AuthContext } from "../context/auth.context";
import { Mail, Search } from "lucide-react";
import { messagesApi } from "../services/messagesApi";
import ProfileSidebar from "./ProfileSidebar";
import "../styles/navbar.css";

export default function Navbar() {
  const { user } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    const fetchUnread = async () => {
      try {
        const res = await messagesApi.getInbox();
        const list = res.data || [];

        const count = list.filter(
          (m) => !m.readAt && m.senderId !== user.id,
        ).length;

        setUnreadCount(count);
      } catch (e) {
        console.error("Failed to fetch inbox", e);
      }
    };

    fetchUnread();

    const interval = setInterval(fetchUnread, 5000);
    return () => clearInterval(interval);
  }, [user]);

  return (
    <>
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo">Navigation System</div>

          <div className="links">
            <NavLink to="/">Home</NavLink>

            {user &&
              (user.role === "student" ||
                user.role === "professor" ||
                user.role === "guest") && (
                <>
                  <NavLink
                    to="/search"
                    className="navIcon"
                    title="Search rooms"
                  >
                    <Search size={20} />
                  </NavLink>
                </>
              )}

            {user && (user.role === "student" || user.role === "professor") && (
              <>
                <NavLink to="/my-schedule">My Schedule</NavLink>

                <NavLink to="/inbox" title="Inbox">
                  <div className="icon-link navIcon">
                    <div className="navIconWrapper">
                      <Mail size={20} />

                      {unreadCount > 0 && (
                        <span
                          className="navBadge"
                          style={{
                            background: "none",
                            borderRadius: 0,
                            border: "none",
                            boxshadow: "none",
                          }}
                        >
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </NavLink>
              </>
            )}

            {!user && <NavLink to="/register">Register</NavLink>}
            {!user && <NavLink to="/login">Login</NavLink>}
            {user?.role === "admin" && <NavLink to="/admin">Dashboard</NavLink>}

            {user && (
              <button
                type="button"
                className="icon-link profile-trigger"
                onClick={() => setSidebarOpen(true)}
                title="Profile"
              >
                <FaUserCircle />
              </button>
            )}
          </div>
        </div>
      </nav>

      <ProfileSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
    </>
  );
}
