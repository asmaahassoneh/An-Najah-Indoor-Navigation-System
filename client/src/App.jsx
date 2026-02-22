import "./styles/App.css";
import "./styles/navbar.css";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import ResetPassword from "./pages/ResetPassword";
import AdminDashboard from "./pages/AdminDashboard";
import AdminRoute from "./routes/AdminRoute";
import ImportSchedule from "./pages/ImportSchedule";
import MySchedule from "./pages/MySchedule";
import ProtectedRoute from "./routes/ProtectedRoute";

export default function App() {
  return (
    <div>
      <Navbar />

      <Routes>
        <Route
          path="/my-schedule"
          element={
            <ProtectedRoute>
              <MySchedule />
            </ProtectedRoute>
          }
        />

        <Route
          path="/import-schedule"
          element={
            <ProtectedRoute>
              <ImportSchedule />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
      </Routes>
    </div>
  );
}
