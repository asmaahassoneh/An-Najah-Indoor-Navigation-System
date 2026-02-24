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
    <div className="authPage">
      <div className="authGlow" />
      <div className="authNoise" />

      <div className="authCard authCardEnter">
        <div className="authTop">
          <div className="authBadge">Reset access</div>
          <h2 className="authTitle">Forgot Password</h2>
          <p className="authSub">Enter your email and we’ll send you a code.</p>
        </div>

        <form className="authForm" onSubmit={sendCode}>
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

          <button
            className="authBtn authBtnEnter"
            type="submit"
            disabled={loading}
          >
            <span className="btnShine" />
            {loading ? "Sending..." : "Send code"}
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
