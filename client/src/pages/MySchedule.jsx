import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

export default function MySchedule() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await API.get("/schedule/me");
        setItems(res.data || []);
      } catch (e) {
        setErr(e.response?.data?.error || "Failed to load schedule");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div style={{ maxWidth: 1000, margin: "120px auto", padding: 16 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
        }}
      >
        <h2 style={{ margin: 0 }}>My Schedule</h2>
        <button onClick={() => navigate("/import-schedule")}>
          Import / Update
        </button>
      </div>

      {loading && <p>Loading...</p>}
      {err && <p style={{ color: "#ff6b6b" }}>{err}</p>}

      {!loading && !err && items.length === 0 && (
        <div style={{ marginTop: 16 }}>
          <p>No schedule yet.</p>
          <button onClick={() => navigate("/import-schedule")}>
            Import from Zajel
          </button>
        </div>
      )}

      {!!items.length && (
        <div style={{ marginTop: 16, overflowX: "auto" }}>
          <table
            style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}
          >
            <thead>
              <tr>
                <th>Day</th>
                <th>Time</th>
                <th>Course</th>
                <th>Room</th>
                <th>Instructor</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((x) => (
                <tr
                  key={x.id}
                  style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}
                >
                  <td>{x.day}</td>
                  <td>
                    {x.startTime} - {x.endTime}
                  </td>
                  <td>{x.courseName}</td>
                  <td>{x.roomCode}</td>
                  <td>{x.instructor}</td>
                  <td>
                    {/* later: navigate to map */}
                    <button onClick={() => alert(`Navigate to ${x.roomCode}`)}>
                      Navigate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
