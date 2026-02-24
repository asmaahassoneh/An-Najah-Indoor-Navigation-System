import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const sendCode = async (e) => {
    e.preventDefault();
    setErr("");
    setMsg("");
    setLoading(true);

    try {
      const res = await API.post("/users/forgot-password", { email });
      setMsg(res.data?.message || "If the email exists, a code has been sent.");
      setTimeout(
        () => navigate(`/reset-with-code?email=${encodeURIComponent(email)}`),
        600,
      );
    } catch (e2) {
      setErr(e2.response?.data?.error || "Failed to send code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <h2>Forgot Password</h2>

      <form className="auth-card" onSubmit={sendCode}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send code"}
        </button>

        <button type="button" className="secondary-btn" onClick={() => navigate("/login")}>
          Back to Login
        </button>

        {err && <p className="error-msg">{err}</p>}
        {msg && <p className="success-msg">{msg}</p>}
      </form>
    </div>
  );
}