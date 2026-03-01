import "./styles/App.css";
import "./styles/navbar.css";
import "./styles/auth-animated.css";
import "./styles/admin.css";
import "./styles/schedule.css";
import "./styles/MapNavigate.css";

import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import ResetPassword from "./pages/ResetPassword";
import AdminRoute from "./routes/AdminRoute";
import ImportSchedule from "./pages/ImportSchedule";
import MySchedule from "./pages/MySchedule";
import ProtectedRoute from "./routes/ProtectedRoute";
import NotFound from "./pages/NotFound";
import ForgotPassword from "./pages/ForgotPassword";
import ResetWithCode from "./pages/ResetWithCode";
import AdminRooms from "./pages/Admin/AdminRooms";
import AdminUsers from "./pages/Admin/AdminUsers";
import AdminHome from "./pages/Admin/AdminHome";
import AdminFloors from "./pages/Admin/AdminFloors";
import MapNavigate from "./pages/MapNavigate";
import AdminGraphBuilder from "./pages/Admin/AdminGraphBuilder";

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
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-with-code" element={<ResetWithCode />} />

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminHome />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <AdminUsers />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/rooms"
          element={
            <AdminRoute>
              <AdminRooms />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/floors"
          element={
            <AdminRoute>
              <AdminFloors />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/graph"
          element={
            <AdminRoute>
              <AdminGraphBuilder />
            </AdminRoute>
          }
        />
        <Route
          path="/navigate/:roomCode"
          element={
            <ProtectedRoute>
              <MapNavigate />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}
