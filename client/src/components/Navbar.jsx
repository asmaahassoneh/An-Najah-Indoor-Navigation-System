import { NavLink } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import { useContext } from "react";
import { AuthContext } from "../context/auth.context";
import "../styles/navbar.css";

export default function Navbar() {
  const { user } = useContext(AuthContext);

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="logo">User System</div>

        <div className="links">
          <NavLink to="/">Home</NavLink>

          {!user && <NavLink to="/register">Register</NavLink>}
          {!user && <NavLink to="/login">Login</NavLink>}

          {user && <span className="user-pill">{user.username}</span>}

          {user && (
            <NavLink to="/profile" className="icon-link">
              <FaUserCircle />
            </NavLink>
          )}
        </div>
      </div>
    </nav>
  );
}
