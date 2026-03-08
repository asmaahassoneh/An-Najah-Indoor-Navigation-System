import { useCallback, useEffect, useState } from "react";
import API from "../../services/api";
import ConfirmDialog from "../../components/ConfirmDialog";

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

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

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
    fetchUsers();
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
    try {
      setErr("");

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
    } catch (e) {
      setErr(e.response?.data?.error || "Failed to update user");
    }
  };

  const requestDeleteUser = (user) => {
    setDeleteTarget(user);
  };

  const confirmDeleteUser = async () => {
    if (!deleteTarget) return;

    try {
      setDeleteLoading(true);
      setErr("");

      await API.delete(`/users/id/${deleteTarget.id}`);
      setDeleteTarget(null);
      fetchUsers();
    } catch (e) {
      setErr(e.response?.data?.error || "Failed to delete user");
    } finally {
      setDeleteLoading(false);
    }
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
                          className="admin-input usersInlineInput"
                          value={form.username}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              username: e.target.value,
                            }))
                          }
                        />
                      ) : (
                        u.username
                      )}
                    </td>

                    <td>
                      {isEditing ? (
                        <input
                          className="admin-input usersInlineInput"
                          value={form.email}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              email: e.target.value,
                            }))
                          }
                        />
                      ) : (
                        u.email
                      )}
                    </td>

                    <td>
                      {isEditing ? (
                        <input
                          className="admin-input usersInlineInput"
                          value={form.role}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              role: e.target.value,
                            }))
                          }
                        />
                      ) : (
                        u.role
                      )}
                    </td>

                    <td>
                      {isEditing ? (
                        <input
                          className="admin-input usersInlineInput"
                          value={form.roomCode}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              roomCode: e.target.value,
                            }))
                          }
                          placeholder="111170"
                        />
                      ) : (
                        (u.roomCode ?? "-")
                      )}
                    </td>

                    <td className="usersActionsCell">
                      {isEditing ? (
                        <div className="usersActionsRow">
                          <button
                            type="button"
                            className="usersActionBtn usersSaveBtn"
                            onClick={() => saveEdit(u.id)}
                          >
                            Save
                          </button>

                          <button
                            type="button"
                            className="usersActionBtn usersCancelBtn"
                            onClick={cancelEdit}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="usersActionsRow">
                          <button
                            type="button"
                            className="usersActionBtn usersEditBtn"
                            onClick={() => startEdit(u)}
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="usersActionBtn usersDeleteBtn"
                            onClick={() => requestDeleteUser(u)}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}

              {users.length === 0 && (
                <tr>
                  <td colSpan={5}>No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete User"
        message={
          deleteTarget
            ? `Are you sure you want to delete user "${deleteTarget.username}"?`
            : ""
        }
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDeleteUser}
        onCancel={() => {
          if (!deleteLoading) setDeleteTarget(null);
        }}
        loading={deleteLoading}
        danger
      />
    </div>
  );
}
