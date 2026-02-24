import { useState } from "react";
import API from "../services/api";
import { parseZajelText } from "../utils/parseZajelSchedule";
import { useNavigate } from "react-router-dom";

export default function ImportSchedule() {
  const [raw, setRaw] = useState("");
  const [items, setItems] = useState([]);
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

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

  const isError = msg && !msg.includes("✅");

  return (
    <div className="authPage">
      <div className="authGlow" />
      <div className="authNoise" />

      <div className="authCard authCardEnter importCard">
        <div className="importTop">
          <div>
            <div className="authBadge">Import</div>
            <h2 className="importTitle">Import My Schedule</h2>
            <p className="authSub">
              Zajel → select timetable table → Copy → Paste here → Preview →
              Save
            </p>
          </div>

          <button
            className="authBtn authBtnSecondary importBackBtn"
            onClick={() => navigate("/my-schedule")}
          >
            Back
          </button>
        </div>

        <div className="field fieldEnter" style={{ animationDelay: "80ms" }}>
          <textarea
            className="importTextarea"
            rows={10}
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            placeholder="Paste from Zajel..."
          />
          <span className="fieldGlow" />
        </div>

        <div className="importActions">
          <button
            className="authBtn importActionBtn"
            type="button"
            onClick={preview}
          >
            <span className="btnShine" />
            Preview
          </button>

          <button
            className="authBtn importActionBtn"
            type="button"
            onClick={save}
            disabled={!items.length}
          >
            <span className="btnShine" />
            Save
          </button>
        </div>

        {!!msg && (
          <p className={`authMsg ${isError ? "authErr" : "authOk"}`}>{msg}</p>
        )}

        {!!items.length && (
          <div className="scheduleTableWrap" style={{ marginTop: 14 }}>
            <table className="scheduleTable">
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
                  <tr key={i}>
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
    </div>
  );
}
