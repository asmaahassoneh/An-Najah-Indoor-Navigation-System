import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { AuthContext } from "../context/auth.context";
import PasswordInput from "../components/PasswordInput";
import "../styles/reset-password.css";

export default function ResetPassword() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [data, setData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (data.newPassword !== data.confirmPassword) {
      setError("New password and confirm password do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await API.put(`/users/change-password/${user.id}`, {
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      });

      setMessage(res.data.message || "Password updated successfully");
      setData({ oldPassword: "", newPassword: "", confirmPassword: "" });

      setTimeout(() => navigate("/profile"), 1000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="authPage">
        <div className="authGlow" />
        <div className="authNoise" />

        <div className="authCard authCardEnter resetCard resetCardSmall">
          <div className="authTop">
            <div className="authBadge">Restricted</div>
            <h2 className="authTitle">Not Authorized</h2>
            <p className="authSub">Please login to continue.</p>
          </div>

          <button
            className="authBtn authBtnEnter"
            onClick={() => navigate("/login")}
          >
            <span className="btnShine" />
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="authPage">
      <div className="authGlow" />
      <div className="authNoise" />

      <div className="authCard authCardEnter resetCard">
        <div className="authTop resetTop">
          <div className="authBadge">Security</div>
          <h2 className="authTitle">Reset Password</h2>
        </div>

        <form className="authForm resetForm" onSubmit={handleSubmit}>
          <div className="resetGrid">
            <div className="resetField">
              <PasswordInput
                name="oldPassword"
                label="Old Password"
                value={data.oldPassword}
                onChange={handleChange}
                autoComplete="current-password"
                required
              />
            </div>

            <div className="resetField">
              <PasswordInput
                name="newPassword"
                label="New Password"
                value={data.newPassword}
                onChange={handleChange}
                autoComplete="new-password"
                required
              />
            </div>

            <div className="resetField resetFieldFull">
              <PasswordInput
                name="confirmPassword"
                label="Confirm New Password"
                value={data.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                required
              />
            </div>
          </div>

          {!!error && <p className="resetMsg resetErr">{error}</p>}
          {!!message && <p className="resetMsg resetOk">{message}</p>}

          <div className="resetActions">
            <button
              className="authBtn authBtnEnter resetMainBtn"
              type="submit"
              disabled={loading}
            >
              <span className="btnShine" />
              {loading ? "Updating..." : "Update Password"}
            </button>

            <button
              type="button"
              className="authBtn authBtnSecondary resetSecondaryBtn"
              onClick={() => navigate("/profile")}
            >
              Back to Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
