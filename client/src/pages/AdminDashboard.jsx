import { useEffect, useMemo, useState } from "react";
import API from "../services/api";

export default function AdminDashboard() {
  const [tab, setTab] = useState("users");

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState("");

  const [rooms, setRooms] = useState([]);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [roomsError, setRoomsError] = useState("");

  const [roomForm, setRoomForm] = useState({ code: "", type: "lecture" });
  const [roomMsg, setRoomMsg] = useState("");

  const [confirmBox, setConfirmBox] = useState({
    open: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  const openConfirm = ({ title, message, onConfirm }) => {
    setConfirmBox({ open: true, title, message, onConfirm });
  };

  const closeConfirm = () => {
    setConfirmBox({ open: false, title: "", message: "", onConfirm: null });
  };

  const headerStyle = useMemo(
    () => ({
      maxWidth: 1100,
      margin: "110px auto 0",
      padding: "0 16px",
    }),
    [],
  );

  const cardStyle = {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: 18,
    backdropFilter: "blur(10px)",
  };

  async function fetchUsers() {
    setUsersLoading(true);
    setUsersError("");
    try {
      const res = await API.get("/users");
      setUsers(res.data || []);
    } catch (err) {
      setUsersError(err.response?.data?.error || "Failed to load users");
    } finally {
      setUsersLoading(false);
    }
  }

  async function fetchRooms() {
    setRoomsLoading(true);
    setRoomsError("");
    try {
      const res = await API.get("/rooms");
      setRooms(res.data || []);
    } catch (err) {
      setRoomsError(err.response?.data?.error || "Failed to load rooms");
    } finally {
      setRoomsLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
    fetchRooms();
  }, []);

  const deleteUser = (id) => {
    openConfirm({
      title: "Delete user",
      message: "Are you sure you want to delete this user?",
      onConfirm: async () => {
        try {
          await API.delete(`/users/id/${id}`);
          setUsers((prev) => prev.filter((u) => u.id !== id));
        } catch (err) {
          alert(err.response?.data?.error || "Failed to delete user");
        } finally {
          closeConfirm();
        }
      },
    });
  };

  const deleteRoom = (id) => {
    openConfirm({
      title: "Delete room",
      message: "Are you sure you want to delete this room?",
      onConfirm: async () => {
        try {
          await API.delete(`/rooms/id/${id}`);
          setRooms((prev) => prev.filter((r) => r.id !== id));
        } catch (err) {
          alert(err.response?.data?.error || "Failed to delete room");
        } finally {
          closeConfirm();
        }
      },
    });
  };

  const createRoom = async (e) => {
    e.preventDefault();
    setRoomMsg("");
    try {
      const res = await API.post("/rooms", roomForm);
      setRoomMsg("Room Added ✅");
      const newRoom = res.data.room || res.data;
      await fetchRooms();
      setRoomForm({ code: "", type: "lecture" });
      return newRoom;
    } catch (err) {
      setRoomMsg(err.response?.data?.error || "Failed to Add room");
    }
  };

  return (
    <div style={headerStyle}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          alignItems: "center",
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>Admin Dashboard</h2>
          <p style={{ margin: "6px 0 0", opacity: 0.85 }}>
            Manage users and rooms
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => setTab("users")}
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.14)",
              background:
                tab === "users" ? "#8f5cff" : "rgba(255,255,255,0.06)",
              color: "white",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            Users
          </button>

          <button
            onClick={() => setTab("rooms")}
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.14)",
              background:
                tab === "rooms" ? "#8f5cff" : "rgba(255,255,255,0.06)",
              color: "white",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            Rooms
          </button>
        </div>
      </div>

      <div style={{ marginTop: 18, display: "grid", gap: 16 }}>
        {tab === "users" && (
          <div style={cardStyle}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
              }}
            >
              <h3 style={{ margin: 0 }}>All Users</h3>
              <button
                onClick={fetchUsers}
                style={{
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.14)",
                  background: "rgba(255,255,255,0.06)",
                  color: "white",
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                Refresh
              </button>
            </div>

            {usersLoading && <p style={{ marginTop: 10 }}>Loading...</p>}
            {usersError && (
              <p style={{ marginTop: 10, color: "#ff6b6b" }}>{usersError}</p>
            )}

            {!usersLoading && !usersError && (
              <div style={{ overflowX: "auto", marginTop: 12 }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    minWidth: 780,
                  }}
                >
                  <thead>
                    <tr style={{ textAlign: "left", opacity: 0.9 }}>
                      <th style={{ padding: "10px 8px" }}>ID</th>
                      <th style={{ padding: "10px 8px" }}>Username</th>
                      <th style={{ padding: "10px 8px" }}>Email</th>
                      <th style={{ padding: "10px 8px" }}>Role</th>
                      <th style={{ padding: "10px 8px" }}>RoomId</th>
                      <th style={{ padding: "10px 8px" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr
                        key={u.id}
                        style={{
                          borderTop: "1px solid rgba(255,255,255,0.08)",
                        }}
                      >
                        <td style={{ padding: "10px 8px" }}>{u.id}</td>
                        <td style={{ padding: "10px 8px" }}>{u.username}</td>
                        <td style={{ padding: "10px 8px" }}>{u.email}</td>
                        <td style={{ padding: "10px 8px" }}>{u.role}</td>
                        <td style={{ padding: "10px 8px" }}>
                          {u.roomId ?? "-"}
                        </td>
                        <td style={{ padding: "10px 8px" }}>
                          <button
                            onClick={() => deleteUser(u.id)}
                            style={{
                              padding: "8px 10px",
                              borderRadius: 10,
                              border: "1px solid rgba(255,255,255,0.14)",
                              background: "rgba(255, 107, 107, 0.18)",
                              color: "white",
                              cursor: "pointer",
                              fontWeight: 700,
                            }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan={6} style={{ padding: 12, opacity: 0.8 }}>
                          No users found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tab === "rooms" && (
          <div style={{ display: "grid", gap: 16 }}>
            <div style={cardStyle}>
              <h3 style={{ margin: 0, marginBottom: 10 }}>Add Room</h3>

              <form
                onSubmit={createRoom}
                style={{
                  display: "grid",
                  gap: 10,
                  gridTemplateColumns: "1fr 1fr auto",
                  alignItems: "end",
                }}
              >
                <div style={{ display: "grid", gap: 6 }}>
                  <label style={{ fontSize: 13, opacity: 0.9 }}>Code</label>
                  <input
                    value={roomForm.code}
                    onChange={(e) =>
                      setRoomForm((p) => ({ ...p, code: e.target.value }))
                    }
                    placeholder="e.g. 11GF170"
                    required
                    style={{
                      padding: "12px 14px",
                      borderRadius: 12,
                      border: "1px solid rgba(255,255,255,0.12)",
                      background: "rgba(255,255,255,0.06)",
                      color: "white",
                      outline: "none",
                    }}
                  />
                </div>

                <div style={{ display: "grid", gap: 6 }}>
                  <label style={{ fontSize: 13, opacity: 0.9 }}>Type</label>
                  <select
                    value={roomForm.type}
                    onChange={(e) =>
                      setRoomForm((p) => ({ ...p, type: e.target.value }))
                    }
                    style={{
                      padding: "12px 14px",
                      borderRadius: 12,
                      border: "1px solid rgba(255,255,255,0.12)",
                      background: "rgba(255,255,255,0.06)",
                      color: "white",
                      outline: "none",
                    }}
                  >
                    <option value="lecture">lecture</option>
                    <option value="lab">lab</option>
                    <option value="office">office</option>
                    <option value="bathroom">bathroom</option>
                    <option value="other">other</option>
                  </select>
                </div>

                <button
                  type="submit"
                  style={{
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: "none",
                    background: "#8f5cff",
                    color: "white",
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  Add
                </button>
              </form>

              {roomMsg && (
                <p
                  style={{
                    marginTop: 10,
                    color: roomMsg.includes("✅") ? "#7CFF8B" : "#ff6b6b",
                  }}
                >
                  {roomMsg}
                </p>
              )}
            </div>

            <div style={cardStyle}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <h3 style={{ margin: 0 }}>All Rooms</h3>
                <button
                  onClick={fetchRooms}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.14)",
                    background: "rgba(255,255,255,0.06)",
                    color: "white",
                    cursor: "pointer",
                    fontWeight: 700,
                  }}
                >
                  Refresh
                </button>
              </div>

              {roomsLoading && <p style={{ marginTop: 10 }}>Loading...</p>}
              {roomsError && (
                <p style={{ marginTop: 10, color: "#ff6b6b" }}>{roomsError}</p>
              )}

              {!roomsLoading && !roomsError && (
                <div style={{ overflowX: "auto", marginTop: 12 }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      minWidth: 780,
                    }}
                  >
                    <thead>
                      <tr style={{ textAlign: "left", opacity: 0.9 }}>
                        <th style={{ padding: "10px 8px" }}>ID</th>
                        <th style={{ padding: "10px 8px" }}>Code</th>
                        <th style={{ padding: "10px 8px" }}>Type</th>
                        <th style={{ padding: "10px 8px" }}>Floor</th>
                        <th style={{ padding: "10px 8px" }}>Faculty</th>
                        <th style={{ padding: "10px 8px" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rooms.map((r) => (
                        <tr
                          key={r.id}
                          style={{
                            borderTop: "1px solid rgba(255,255,255,0.08)",
                          }}
                        >
                          <td style={{ padding: "10px 8px" }}>{r.id}</td>
                          <td style={{ padding: "10px 8px" }}>{r.code}</td>
                          <td style={{ padding: "10px 8px" }}>{r.type}</td>
                          <td style={{ padding: "10px 8px" }}>
                            {r.floor ?? "-"}
                          </td>
                          <td style={{ padding: "10px 8px" }}>
                            {r.faculty ?? "-"}
                          </td>
                          <td style={{ padding: "10px 8px" }}>
                            <button
                              onClick={() => deleteRoom(r.id)}
                              style={{
                                padding: "8px 10px",
                                borderRadius: 10,
                                border: "1px solid rgba(255,255,255,0.14)",
                                background: "rgba(255, 107, 107, 0.18)",
                                color: "white",
                                cursor: "pointer",
                                fontWeight: 700,
                              }}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                      {rooms.length === 0 && (
                        <tr>
                          <td colSpan={6} style={{ padding: 12, opacity: 0.8 }}>
                            No rooms found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
        {confirmBox.open && (
          <div
            onClick={closeConfirm}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.55)",
              display: "grid",
              placeItems: "center",
              zIndex: 9999,
              padding: 16,
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "100%",
                maxWidth: 420,
                background: "rgba(20,20,30,0.95)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 16,
                padding: 16,
                backdropFilter: "blur(10px)",
              }}
            >
              <h3 style={{ margin: 0 }}>{confirmBox.title}</h3>
              <p style={{ margin: "10px 0 16px", opacity: 0.85 }}>
                {confirmBox.message}
              </p>

              <div
                style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}
              >
                <button
                  onClick={closeConfirm}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.14)",
                    background: "rgba(255,255,255,0.06)",
                    color: "white",
                    cursor: "pointer",
                    fontWeight: 700,
                  }}
                >
                  Cancel
                </button>

                <button
                  onClick={confirmBox.onConfirm}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 12,
                    border: "none",
                    background: "rgba(255, 107, 107, 0.9)",
                    color: "white",
                    cursor: "pointer",
                    fontWeight: 800,
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
