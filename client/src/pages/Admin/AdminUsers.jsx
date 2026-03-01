import { useCallback, useEffect, useState } from "react";
import API from "../../services/api";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    username: "",
    email: "",
    role: "",
    roomCode: "",
  });

  const fetchUsers = useCallback(async () => {
    try {
      setErr("");
      setLoading(true);
      const res = await API.get("/users");
      setUsers(res.data || []);
    } catch (e) {
      setErr(e.response?.data?.error || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await fetchUsers();
    })();
  }, [fetchUsers]);

  const startEdit = (user) => {
    setEditingId(user.id);
    setForm({
      username: user.username || "",
      email: user.email || "",
      role: user.role || "",
      roomCode: user.roomCode || "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ username: "", email: "", role: "", roomCode: "" });
  };

  const saveEdit = async (id) => {
    await API.put(`/users/id/${id}`, {
      username: form.username,
      email: form.email,
    });

    if (form.role === "professor") {
      await API.put(`/users/id/${id}/room`, {
        roomCode: form.roomCode,
      });
    }

    setEditingId(null);
    fetchUsers();
  };

  const deleteUser = async (id) => {
    await API.delete(`/users/id/${id}`);
    fetchUsers();
  };

  return (
    <div className="users-page">
      <div className="users-card">
        <h1 className="users-title">Users Management</h1>

        {loading && <p>Loading...</p>}
        {err && <p style={{ color: "red" }}>{err}</p>}

        {!loading && !err && (
          <table className="users-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Room</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {users.map((u) => {
                const isEditing = editingId === u.id;

                return (
                  <tr key={u.id}>
                    <td>
                      {isEditing ? (
                        <input
                          value={form.username}
                          onChange={(e) =>
                            setForm((p) => ({ ...p, username: e.target.value }))
                          }
                        />
                      ) : (
                        u.username
                      )}
                    </td>

                    <td>
                      {isEditing ? (
                        <input
                          value={form.email}
                          onChange={(e) =>
                            setForm((p) => ({ ...p, email: e.target.value }))
                          }
                        />
                      ) : (
                        u.email
                      )}
                    </td>

                    <td>
                      {isEditing ? (
                        <input
                          value={form.role}
                          onChange={(e) =>
                            setForm((p) => ({ ...p, role: e.target.value }))
                          }
                        />
                      ) : (
                        u.role
                      )}
                    </td>

                    <td>
                      {isEditing ? (
                        <input
                          value={form.roomCode}
                          onChange={(e) =>
                            setForm((p) => ({ ...p, roomCode: e.target.value }))
                          }
                          placeholder="111170"
                        />
                      ) : (
                        (u.roomCode ?? "-")
                      )}
                    </td>

                    <td>
                      {isEditing ? (
                        <>
                          <button onClick={() => saveEdit(u.id)}>Save</button>
                          <button onClick={cancelEdit}>Cancel</button>
                        </>
                      ) : (
                        <button
                          className="action-btn gbBtn gbBtnSoft"
                          onClick={() => startEdit(u)}
                        >
                          Edit
                        </button>
                      )}

                      <button
                        className="action-btn delete-btn gbBtnDanger"
                        onClick={() => deleteUser(u.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}

              {users.length === 0 && (
                <tr>
                  <td colSpan={6}>No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
