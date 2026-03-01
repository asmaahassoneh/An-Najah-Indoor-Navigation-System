import { useCallback, useEffect, useState } from "react";
import API from "../../services/api";

export default function AdminRooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [createForm, setCreateForm] = useState({ code: "", type: "lecture" });
  const [createMsg, setCreateMsg] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ code: "", type: "lecture" });

  const fetchRooms = useCallback(async () => {
    try {
      setErr("");
      setLoading(true);
      const res = await API.get("/rooms");
      setRooms(res.data || []);
    } catch (e) {
      setErr(e.response?.data?.error || "Failed to load rooms");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const createRoom = async (e) => {
    e.preventDefault();
    setCreateMsg("");
    setErr("");

    const code = createForm.code.trim();
    const type = createForm.type;

    if (!code) {
      setCreateMsg("Room code is required");
      return;
    }

    try {
      await API.post("/rooms", { code, type });
      setCreateMsg("Room added ✅");
      setCreateForm({ code: "", type: "lecture" });
      fetchRooms();
    } catch (e2) {
      setCreateMsg(e2.response?.data?.error || "Failed to create room");
    }
  };

  const startEdit = (room) => {
    setEditingId(room.id);
    setForm({ code: room.code, type: room.type });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ code: "", type: "lecture" });
  };

  const saveEdit = async (id) => {
    try {
      await API.put(`/rooms/id/${id}`, form);
      setEditingId(null);
      fetchRooms();
    } catch (e) {
      setErr(e.response?.data?.error || "Failed to update room");
    }
  };

  const deleteRoom = async (id) => {
    try {
      await API.delete(`/rooms/id/${id}`);
      fetchRooms();
    } catch (e) {
      setErr(e.response?.data?.error || "Failed to delete room");
    }
  };

  const isOk = createMsg.includes("✅");

  return (
    <div className="users-page">
      <div className="users-card">
        <h1 className="users-title">Rooms Management</h1>

        <form onSubmit={createRoom} className="admin-form">
          <div className="admin-form-row">
            <input
              className="admin-input"
              placeholder="Room code (e.g. 11GF180)"
              value={createForm.code}
              onChange={(e) =>
                setCreateForm((p) => ({ ...p, code: e.target.value }))
              }
            />

            <select
              className="admin-select"
              value={createForm.type}
              onChange={(e) =>
                setCreateForm((p) => ({ ...p, type: e.target.value }))
              }
            >
              <option value="lecture">lecture</option>
              <option value="lab">lab</option>
              <option value="office">office</option>
              <option value="bathroom">bathroom</option>
              <option value="other">other</option>
            </select>

            <button type="submit" className="action-btn">
              Add Room
            </button>
          </div>

          {!!createMsg && (
            <p
              className={`admin-msg ${isOk ? "admin-msg-ok" : "admin-msg-err"}`}
            >
              {createMsg}
            </p>
          )}
        </form>

        {loading && <p>Loading...</p>}
        {err && <p style={{ color: "red" }}>{err}</p>}

        {!loading && !err && (
          <table className="users-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Type</th>
                <th>Faculty</th>
                <th>Floor</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {rooms.map((r) => {
                const isEditing = editingId === r.id;

                return (
                  <tr key={r.id}>
                    <td>{r.faculty || "-"}</td>
                    <td>{r.floor || "-"}</td>
                    <td>
                      {isEditing ? (
                        <input
                          className="admin-input"
                          value={form.code}
                          onChange={(e) =>
                            setForm((p) => ({ ...p, code: e.target.value }))
                          }
                        />
                      ) : (
                        r.code
                      )}
                    </td>

                    <td>
                      {isEditing ? (
                        <select
                          className="admin-select"
                          value={form.type}
                          onChange={(e) =>
                            setForm((p) => ({ ...p, type: e.target.value }))
                          }
                        >
                          <option value="lecture">lecture</option>
                          <option value="lab">lab</option>
                          <option value="office">office</option>
                          <option value="bathroom">bathroom</option>
                          <option value="other">other</option>
                        </select>
                      ) : (
                        r.type
                      )}
                    </td>

                    <td>
                      {isEditing ? (
                        <div className="admin-actions">
                          <button
                            type="button"
                            className="action-btn"
                            onClick={() => saveEdit(r.id)}
                          >
                            Save
                          </button>

                          <button
                            type="button"
                            className="action-btn admin-btn-ghost"
                            onClick={cancelEdit}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="admin-actions">
                          <button
                            type="button"
                            className="action-btn gbBtn gbBtnSoft"
                            onClick={() => startEdit(r)}
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="action-btn delete-btn gbBtnDanger"
                            onClick={() => deleteRoom(r.id)}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}

              {rooms.length === 0 && (
                <tr>
                  <td colSpan={3}>No rooms found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
