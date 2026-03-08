import { NavLink } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import { useContext, useState } from "react";
import { AuthContext } from "../context/auth.context";
import { Mail } from "lucide-react";
import ProfileSidebar from "./ProfileSidebar";
import "../styles/navbar.css";

export default function Navbar() {
  const { user } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo">Navigation System</div>

          <div className="links">
            <NavLink to="/">Home</NavLink>

            {user && (user.role === "student" || user.role === "professor") && (
              <>
                <NavLink to="/my-schedule">My Schedule</NavLink>

                <NavLink to="/inbox" className="navIcon">
                  <Mail size={20} />
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
