import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { AuthContext } from "../context/auth.context";
import PasswordInput from "../components/PasswordInput";

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

  if (!user) {
    return (
      <h2 style={{ marginTop: "120px", textAlign: "center" }}>
        Not Authorized
      </h2>
    );
  }

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

  return (
    <div
      style={{ maxWidth: "520px", margin: "120px auto 0", padding: "0 16px" }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "16px" }}>
        Reset Password
      </h2>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "grid",
          gap: "12px",
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.08)",
          padding: "22px",
          borderRadius: "16px",
          backdropFilter: "blur(10px)",
        }}
      >
        <PasswordInput
          name="oldPassword"
          label="Old Password"
          value={data.oldPassword}
          onChange={handleChange}
          autoComplete="current-password"
        />

        <PasswordInput
          name="newPassword"
          label="New Password"
          value={data.newPassword}
          onChange={handleChange}
          autoComplete="new-password"
        />

        <PasswordInput
          name="confirmPassword"
          label="Confirm New Password"
          value={data.confirmPassword}
          onChange={handleChange}
          autoComplete="new-password"
        />
        <button type="submit" disabled={loading} className="update-btn">
          {loading ? "Updating..." : "Update Password"}
        </button>

        <button
          type="button"
          className="icon-btn"
          onClick={() => navigate("/profile")}
        >
          Back to Profile
        </button>

        {error && <p className="error-msg">{error}</p>}
        {message && <p className="success-msg">{message}</p>}
      </form>
    </div>
  );
}
