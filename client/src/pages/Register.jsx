import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import PasswordInput from "../components/PasswordInput";

export default function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    roomCode: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const showRoom = useMemo(
    () => formData.email.endsWith("@najah.edu"),
    [formData.email],
  );

  const handleChange = (e) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await API.post("/users/register", formData);
      setSuccess(res.data.message || "Registered ✅");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    }
  };

  return (
    <div className="authPage">
      <div className="authGlow" />
      <div className="authNoise" />

      <div className="authCard authCardEnter">
        <div className="authTop">
          <div className="authBadge">Create account</div>
          <h2 className="authTitle">Register</h2>
          <p className="authSub">
            Join in seconds — your role is detected from your email.
          </p>
        </div>

        <form className="authForm" onSubmit={handleSubmit}>
          <div className="authGrid2">
            <div
              className="field fieldEnter"
              style={{ animationDelay: "80ms" }}
            >
              <input
                className="authInput"
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                required
              />
              <span className="fieldGlow" />
            </div>

            <div
              className="field fieldEnter"
              style={{ animationDelay: "140ms" }}
            >
              <input
                className="authInput"
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <span className="fieldGlow" />
            </div>
          </div>

          <div className="field fieldEnter" style={{ animationDelay: "200ms" }}>
            {/* PasswordInput already has its own wrapper, we just animate the container */}
            <div className="authPasswordWrap">
              <PasswordInput
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                autoComplete="current-password"
                required
              />
            </div>
            <span className="fieldGlow" />
          </div>

          {showRoom && (
            <div
              className="field fieldEnter"
              style={{ animationDelay: "260ms" }}
            >
              <input
                className="authInput"
                type="text"
                name="roomCode"
                placeholder="Room (Professors only)"
                value={formData.roomCode}
                onChange={handleChange}
              />
              <span className="fieldGlow" />
            </div>
          )}

          <button className="authBtn authBtnEnter" type="submit">
            <span className="btnShine" />
            Register
          </button>

          {!!error && <p className="authMsg authErr">{error}</p>}
          {!!success && <p className="authMsg authOk">{success}</p>}
        </form>
      </div>
    </div>
  );
}
