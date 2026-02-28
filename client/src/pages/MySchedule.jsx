import { useEffect, useMemo, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

const DAY_ORDER = ["سبت", "احد", "اثنين", "ثلاث", "اربعاء", "خميس", "جمعة"];

function getTodayArabicDay() {
  const d = new Date().getDay();
  const map = {
    0: "احد",
    1: "اثنين",
    2: "ثلاث",
    3: "اربعاء",
    4: "خميس",
    5: "جمعة",
    6: "سبت",
  };
  return map[d] || "احد";
}

function normalizeDay(day) {
  const x = String(day || "").trim();
  if (x === "أحد") return "احد";
  if (x === "إثنين") return "اثنين";
  if (x === "أربعاء") return "اربعاء";
  if (x === "الجمعة") return "جمعة";
  if (x === "ثلاثاء") return "ثلاث";
  return x;
}

function isOnlineRoom(roomCode) {
  const c = String(roomCode || "").trim();
  return c === "509999" || c.toUpperCase() === "ONLINE";
}

export default function MySchedule() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const navigate = useNavigate();

  const [selectedDay, setSelectedDay] = useState(getTodayArabicDay);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const res = await API.get("/schedule/me");
        const list = (res.data || []).map((x) => ({
          ...x,
          day: normalizeDay(x.day),
        }));
        setItems(list);
      } catch (e) {
        setErr(e.response?.data?.error || "Failed to load schedule");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const availableDays = useMemo(() => {
    const set = new Set(items.map((x) => normalizeDay(x.day)).filter(Boolean));
    return DAY_ORDER.filter((d) => set.has(d));
  }, [items]);

  useEffect(() => {
    if (!loading && !err && items.length) {
      const hasSelected = items.some(
        (x) => normalizeDay(x.day) === selectedDay,
      );
      if (!hasSelected && availableDays.length) {
        setSelectedDay(availableDays[0]);
      }
    }
  }, [loading, err, items, selectedDay, availableDays]);

  const filtered = useMemo(() => {
    return items
      .filter((x) => normalizeDay(x.day) === selectedDay)
      .sort((a, b) =>
        String(a.startTime || "").localeCompare(String(b.startTime || "")),
      );
  }, [items, selectedDay]);

  return (
    <div className="authPage">
      <div className="authGlow" />
      <div className="authNoise" />

      <div className="authCard authCardEnter scheduleCard">
        <div className="scheduleTop">
          <div>
            <div className="authBadge">Schedule</div>
            <h2 className="scheduleTitle">My Schedule</h2>
            <p className="authSub">
              Today: <b>{selectedDay}</b>
            </p>
          </div>

          <button
            className="authBtn scheduleBtn"
            onClick={() => navigate("/import-schedule")}
          >
            <span className="btnShine" />
            Import / Update
          </button>
        </div>

        {!!availableDays.length && (
          <div className="dayTabs">
            {availableDays.map((d) => (
              <button
                key={d}
                type="button"
                className={`dayTab ${d === selectedDay ? "active" : ""}`}
                onClick={() => setSelectedDay(d)}
              >
                {d}
              </button>
            ))}
          </div>
        )}

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

        {!loading && !err && items.length > 0 && filtered.length === 0 && (
          <p className="authMsg">No lectures on {selectedDay}.</p>
        )}

        {!!filtered.length && (
          <div className="scheduleTableWrap">
            <table className="scheduleTable">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Course</th>
                  <th>Room</th>
                  <th>Instructor</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((x) => {
                  const online = isOnlineRoom(x.roomCode);
                  return (
                    <tr key={x.id}>
                      <td>
                        {x.startTime} - {x.endTime}
                      </td>
                      <td>{x.courseName}</td>
                      <td>
                        {online ? (
                          <span className="onlineBadge">Online</span>
                        ) : (
                          x.roomCode
                        )}
                      </td>
                      <td>{x.instructor}</td>
                      <td className="scheduleActionCell">
                        {online ? (
                          <span className="muted">No navigation</span>
                        ) : (
                          <button
                            className="scheduleNavBtn"
                            onClick={() => navigate(`/navigate/${x.roomCode}`)}
                          >
                            Navigate
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
