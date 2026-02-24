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
    <div className="authPage">
      <div className="authGlow" />
      <div className="authNoise" />

      <div className="authCard authCardEnter scheduleCard">
        <div className="scheduleTop">
          <div>
            <div className="authBadge">Schedule</div>
            <h2 className="scheduleTitle">My Schedule</h2>
            <p className="authSub">Your imported timetable from Zajel.</p>
          </div>

          <button
            className="authBtn scheduleBtn"
            onClick={() => navigate("/import-schedule")}
          >
            <span className="btnShine" />
            Import / Update
          </button>
        </div>

        {loading && <p className="authMsg">Loading...</p>}
        {!!err && <p className="authMsg authErr">{err}</p>}

        {!loading && !err && items.length === 0 && (
          <div className="scheduleEmpty">
            <p className="authSub" style={{ textAlign: "center" }}>
              No schedule yet.
            </p>
            <button
              className="authBtn authBtnSecondary"
              onClick={() => navigate("/import-schedule")}
            >
              Import from Zajel
            </button>
          </div>
        )}

        {!!items.length && (
          <div className="scheduleTableWrap">
            <table className="scheduleTable">
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
                  <tr key={x.id}>
                    <td>{x.day}</td>
                    <td>
                      {x.startTime} - {x.endTime}
                    </td>
                    <td>{x.courseName}</td>
                    <td>{x.roomCode}</td>
                    <td>{x.instructor}</td>
                    <td className="scheduleActionCell">
                      <button
                        className="scheduleNavBtn"
                        onClick={() => alert(`Navigate to ${x.roomCode}`)}
                      >
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
    </div>
  );
}
