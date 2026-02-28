import { useEffect, useState } from "react";
import API from "../../services/api";

function normalizeKey(v) {
  return String(v || "")
    .trim()
    .toUpperCase();
}

function isCompleteFloorKey(key) {
  const k = normalizeKey(key);
  return (
    k === "G" ||
    k === "GF" ||
    /^B\d+$/.test(k) ||
    /^F\d+$/.test(k) ||
    /^\d+$/.test(k)
  );
}

function guessFloorName(key) {
  const k = normalizeKey(key);

  if (k === "GF" || k === "G") return "Ground Floor";
  if (/^B\d+$/.test(k)) return `Basement ${k.slice(1)}`;
  if (/^F\d+$/.test(k)) return `Floor ${k.slice(1)}`;
  if (/^\d+$/.test(k)) return `Floor ${k}`;

  return "";
}

function guessFloorImageUrl(key) {
  const k = normalizeKey(key);
  if (!isCompleteFloorKey(k)) return "";
  return `/maps/Eng${k}.jpg`;
}

export default function AdminFloors() {
  const [floors, setFloors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const [form, setForm] = useState({
    key: "",
    name: "",
    faculty: "Engineering",
    imageUrl: "",
    width: "1000",
    height: "800",
    _autoName: true,
    _autoImg: true,
  });

  const fetchFloors = async () => {
    try {
      setLoading(true);
      const res = await API.get("/maps/floors");
      setFloors(res.data || []);
    } catch (e) {
      setMsg(e.response?.data?.error || "Failed to load floors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFloors();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    try {
      await API.post("/maps/floors", {
        ...form,
        width: Number(form.width),
        height: Number(form.height),
      });

      setMsg("Floor added ✅");
      setForm({
        key: "",
        name: "",
        faculty: "Engineering",
        imageUrl: "",
        width: "1000",
        height: "800",
        _autoName: true,
        _autoImg: true,
      });

      fetchFloors();
    } catch (e) {
      setMsg(e.response?.data?.error || "Failed to create floor");
    }
  };

  return (
    <div className="users-page">
      <div className="users-card">
        <h1 className="users-title">Manage Floors</h1>

        <form onSubmit={handleSubmit} className="admin-form">
          <div className="admin-form-row">
            <input
              className="admin-input"
              placeholder="Floor Key (GF, B1, B2, 1...)"
              value={form.key}
              onChange={(e) => {
                const key = normalizeKey(e.target.value);

                setForm((p) => {
                  const complete = isCompleteFloorKey(key);

                  return {
                    ...p,
                    key,

                    name:
                      complete && p._autoName ? guessFloorName(key) : p.name,
                    imageUrl:
                      complete && p._autoImg
                        ? guessFloorImageUrl(key)
                        : p.imageUrl,
                  };
                });
              }}
            />

            <input
              className="admin-input"
              placeholder="Floor Name (Ground Floor)"
              value={form.name}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  name: e.target.value,
                  _autoName: false,
                }))
              }
            />

            <input
              className="admin-input"
              placeholder="Faculty (Engineering)"
              value={form.faculty}
              onChange={(e) => setForm({ ...form, faculty: e.target.value })}
            />

            <input
              className="admin-input"
              placeholder="Image URL (/maps/GF.jpg)"
              value={form.imageUrl}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  imageUrl: e.target.value,
                  _autoImg: false,
                }))
              }
            />

            <button className="action-btn">Add Floor</button>
          </div>

          {!!msg && (
            <p
              style={{
                marginTop: 12,
                color: msg.includes("✅") ? "#7CFFB2" : "#FF8C8C",
                fontWeight: 700,
              }}
            >
              {msg}
            </p>
          )}
        </form>

        {!loading && (
          <table className="users-table">
            <thead>
              <tr>
                <th>Key</th>
                <th>Name</th>
                <th>Faculty</th>
                <th>Image</th>
                <th>Size</th>
              </tr>
            </thead>
            <tbody>
              {floors.map((f) => (
                <tr key={f.id}>
                  <td>{f.key}</td>
                  <td>{f.name}</td>
                  <td>{f.faculty}</td>
                  <td>{f.imageUrl}</td>
                  <td>
                    {f.width} × {f.height}
                  </td>
                </tr>
              ))}
              {floors.length === 0 && (
                <tr>
                  <td colSpan={5}>No floors found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
