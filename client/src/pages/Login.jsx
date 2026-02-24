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

      const user = res.data.user;
      const token = res.data.token;

      login(user, token);

      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{ maxWidth: "520px", margin: "120px auto 0", padding: "0 16px" }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Login</h2>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "grid",
          gap: "14px",
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.08)",
          padding: "22px",
          borderRadius: "16px",
          backdropFilter: "blur(10px)",
        }}
      >
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          style={{
            padding: "12px 14px",
            borderRadius: "12px",
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(255,255,255,0.06)",
            color: "white",
            outline: "none",
          }}
        />
        <PasswordInput
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Password"
          autoComplete="current-password"
          required
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: "6px",
            padding: "12px",
            borderRadius: "12px",
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
            background: "#8f5cff",
            color: "white",
            fontWeight: "700",
            transition: "0.25s ease",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <div className="auth-links">
          <button
            type="button"
            className="link-btn"
            onClick={() => navigate("/forgot-password")}
          >
            Forgot password?
          </button>
        </div>

        {error && (
          <p style={{ margin: 0, color: "#ff6b6b", textAlign: "center" }}>
            {error}
          </p>
        )}
      </form>
    </div>
  );
}
