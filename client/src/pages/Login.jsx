import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { AuthContext } from "../context/auth.context";
import PasswordInput from "../components/PasswordInput";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await API.post("/users/login", formData);
      login(res.data.user, res.data.token);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="authPage">
      <div className="authGlow" />
      <div className="authNoise" />

      <div className="authCard authCardEnter">
        <div className="authTop">
          <div className="authBadge">Welcome back</div>
          <h2 className="authTitle">Login</h2>
          <p className="authSub">Access your account securely.</p>
        </div>

        <form className="authForm" onSubmit={handleSubmit}>
          <div className="field fieldEnter" style={{ animationDelay: "80ms" }}>
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

          <div className="field fieldEnter" style={{ animationDelay: "140ms" }}>
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

          <button
            className="authBtn authBtnEnter"
            type="submit"
            disabled={loading}
          >
            <span className="btnShine" />
            {loading ? "Logging in..." : "Login"}
          </button>

          <div className="authLinks">
            <button
              type="button"
              className="link-btn"
              onClick={() => navigate("/forgot-password")}
            >
              Forgot password?
            </button>
          </div>

          {!!error && <p className="authMsg authErr">{error}</p>}
        </form>
      </div>
    </div>
  );
}
