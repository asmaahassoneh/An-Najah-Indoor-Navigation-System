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
    <div className="authPage">
      <div className="authGlow" />
      <div className="authNoise" />

      <div className="authCard authCardEnter">
        <div className="authTop">
          <div className="authBadge">Confirm reset</div>
          <h2 className="authTitle">Reset Password</h2>
          <p className="authSub">Enter the code and choose a new password.</p>
        </div>

        <form className="authForm" onSubmit={submit}>
          <div className="field fieldEnter" style={{ animationDelay: "80ms" }}>
            <input
              className="authInput"
              type="email"
              placeholder="Email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
            />
            <span className="fieldGlow" />
          </div>

          <div className="field fieldEnter" style={{ animationDelay: "140ms" }}>
            <input
              className="authInput"
              type="text"
              placeholder="6-digit code"
              value={code}
              required
              onChange={(e) => setCode(e.target.value)}
              inputMode="numeric"
              maxLength={6}
            />
            <span className="fieldGlow" />
          </div>

          <div className="field fieldEnter" style={{ animationDelay: "200ms" }}>
            <div className="authPasswordWrap">
              <PasswordInput
                name="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password"
                autoComplete="new-password"
                required
              />
            </div>
            <span className="fieldGlow" />
          </div>

          <div className="field fieldEnter" style={{ animationDelay: "260ms" }}>
            <div className="authPasswordWrap">
              <PasswordInput
                name="confirmPassword"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Confirm new password"
                autoComplete="new-password"
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
            {loading ? "Resetting..." : "Reset password"}
          </button>

          <button
            type="button"
            className="authBtn authBtnSecondary"
            onClick={() => navigate("/login")}
          >
            Back to Login
          </button>

          {!!err && <p className="authMsg authErr">{err}</p>}
          {!!msg && <p className="authMsg authOk">{msg}</p>}
        </form>
      </div>
    </div>
  );
}
