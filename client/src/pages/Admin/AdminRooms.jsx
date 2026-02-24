import { useCallback, useEffect, useState } from "react";
import API from "../../services/api";

export default function AdminRooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ code: "", type: "" });

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
    (async () => {
      await fetchRooms();
    })();

    return () => {};
  }, [fetchRooms]);

  const startEdit = (room) => {
    setEditingId(room.id);
    setForm({ code: room.code, type: room.type });
  };

  const saveEdit = async (id) => {
    await API.put(`/rooms/id/${id}`, form);
    setEditingId(null);
    fetchRooms();
  };

  const deleteRoom = async (id) => {
    await API.delete(`/rooms/id/${id}`);
    fetchRooms();
  };

  return (
    <div className="users-page">
      <div className="users-card">
        <h1 className="users-title">Rooms Management</h1>

        {loading && <p>Loading...</p>}
        {err && <p style={{ color: "red" }}>{err}</p>}

        {!loading && !err && (
          <table className="users-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Type</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {rooms.map((r) => (
                <tr key={r.id}>
                  <td>
                    {editingId === r.id ? (
                      <input
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
                    {editingId === r.id ? (
                      <input
                        value={form.type}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, type: e.target.value }))
                        }
                      />
                    ) : (
                      r.type
                    )}
                  </td>

                  <td>
                    {editingId === r.id ? (
                      <button onClick={() => saveEdit(r.id)}>Save</button>
                    ) : (
                      <button
                        className="action-btn"
                        onClick={() => startEdit(r)}
                      >
                        Edit
                      </button>
                    )}

                    <button
                      className="action-btn delete-btn"
                      onClick={() => deleteRoom(r.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}

              {rooms.length === 0 && (
                <tr>
                  <td colSpan={4}>No rooms found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
