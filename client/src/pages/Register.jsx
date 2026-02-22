import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import PasswordInput from "../components/PasswordInput";

export default function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    roomId: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await API.post("/users/register", formData);
      setSuccess(res.data.message);
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto" }}>
      <h2>Register</h2>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "10px" }}>
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <PasswordInput
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Password"
          autoComplete="current-password"
          required
        />
        {formData.email.endsWith("@najah.edu") && (
          <input
            type="text"
            name="roomId"
            placeholder="Room (Professors only)"
            value={formData.roomId}
            onChange={handleChange}
          />
        )}

        <button type="submit">Register</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
    </div>
  );
}
