import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import API from "../services/api";
import PasswordInput from "../components/PasswordInput";

export default function ResetWithCode() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const initialEmail = useMemo(() => params.get("email") || "", [params]);

  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setMsg("");

    if (newPassword !== confirm) {
      setErr("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await API.post("/users/reset-password-with-code", {
        email,
        code,
        newPassword,
      });
      setMsg(res.data?.message || "Password reset ✅");
      setTimeout(() => navigate("/login"), 900);
    } catch (e2) {
      setErr(e2.response?.data?.error || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <h2>Reset Password</h2>

      <form className="auth-card" onSubmit={submit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="text"
          placeholder="6-digit code"
          value={code}
          required
          onChange={(e) => setCode(e.target.value)}
        />

        <PasswordInput
          name="newPassword"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="New password"
          autoComplete="new-password"
          required
        />

        <PasswordInput
          name="confirmPassword"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Confirm new password"
          autoComplete="new-password"
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Resetting..." : "Reset password"}
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