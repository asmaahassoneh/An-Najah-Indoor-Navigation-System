import { useState } from "react";
import API from "../services/api";
import { parseZajelText } from "../utils/parseZajelSchedule";

export default function ImportSchedule() {
  const [raw, setRaw] = useState("");
  const [items, setItems] = useState([]);
  const [msg, setMsg] = useState("");

  const preview = () => {
    const parsed = parseZajelText(raw);
    setItems(parsed);
    setMsg(
      parsed.length ? "" : "No rows detected. Copy the table again from Zajel.",
    );
  };

  const save = async () => {
    setMsg("");
    try {
      await API.post("/schedule/import", { items });
      setMsg("Saved ✅");
    } catch (e) {
      setMsg(e.response?.data?.error || "Save failed");
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: "120px auto", padding: 16 }}>
      <h2>Import My Schedule</h2>
      <p style={{ opacity: 0.85 }}>
        Zajel → select timetable table → Copy → Paste here → Preview → Save
      </p>

      <textarea
        rows={10}
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        style={{ width: "100%", padding: 12, borderRadius: 12 }}
        placeholder="Paste from Zajel..."
      />

      <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
        <button onClick={preview}>Preview</button>
        <button onClick={save} disabled={!items.length}>
          Save
        </button>
      </div>

      {msg && <p style={{ marginTop: 10 }}>{msg}</p>}

      {!!items.length && (
        <div style={{ marginTop: 16, overflowX: "auto" }}>
          <table
            style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}
          >
            <thead>
              <tr>
                <th>Section</th>
                <th>Name</th>
                <th>Day</th>
                <th>Time</th>
                <th>Room</th>
                <th>Instructor</th>
              </tr>
            </thead>
            <tbody>
              {items.map((x, i) => (
                <tr
                  key={i}
                  style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}
                >
                  <td>{x.sectionCode}</td>
                  <td>{x.courseName}</td>
                  <td>{x.day}</td>
                  <td>
                    {x.startTime} - {x.endTime}
                  </td>
                  <td>{x.roomCode}</td>
                  <td>{x.instructor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
