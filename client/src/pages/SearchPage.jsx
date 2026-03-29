import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { mapsApi } from "../services/mapsApi";

export default function SearchPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const initialQ = params.get("q") || "";
  const [q, setQ] = useState(initialQ);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const run = async () => {
      const clean = String(initialQ || "").trim();
      if (!clean) {
        setResults([]);
        setMsg("");
        return;
      }

      try {
        setLoading(true);
        setMsg("");

        const res = await mapsApi.searchRooms(clean);
        const baseList = res.data || [];

        const enriched = await Promise.all(
          baseList.map(async (room) => {
            try {
              const detailsRes = await mapsApi.roomDetails(room.roomCode);
              return {
                ...room,
                details: detailsRes.data,
              };
            } catch {
              return {
                ...room,
                details: null,
              };
            }
          }),
        );

        setResults(enriched);

        if (!enriched.length) {
          setMsg("No rooms found.");
        }
      } catch (e) {
        setMsg(e.response?.data?.error || "Search failed");
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [initialQ]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const clean = q.trim();

    if (!clean) {
      setParams({});
      setResults([]);
      setMsg("");
      return;
    }

    setParams({ q: clean });
  };

  return (
    <div className="authPage">
      <div className="authGlow" />
      <div className="authNoise" />

      <div className="authCard authCardEnter scheduleCard">
        <div className="scheduleTop">
          <div>
            <div className="authBadge">Search</div>
            <h2 className="scheduleTitle">Find a Room</h2>
            <p className="authSub">
              Search by room code and view room information.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="searchBarWrap">
          <div className="searchInputWrap">
            <Search size={18} className="searchInputIcon" />
            <input
              className="searchInput"
              type="text"
              placeholder="Search room code"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          <button className="authBtn authBtnEnter" type="submit">
            <span className="btnShine" />
            Search
          </button>
        </form>

        {loading && <p className="authMsg">Searching...</p>}
        {!!msg && <p className="authMsg">{msg}</p>}

        {!loading && results.length > 0 && (
          <div className="searchResultsGrid">
            {results.map((room) => {
              const details = room.details;
              const roomType = details?.room?.type || room.roomType || "other";
              const lectures = details?.lectures || [];
              const professors = details?.professors || [];

              return (
                <div
                  key={`${room.roomCode}-${room.floorId}`}
                  className="searchResultCard"
                >
                  <div className="searchResultTop">
                    <div>
                      <div className="searchResultCode">{room.roomCode}</div>
                      <div className="searchResultMeta">
                        {details?.location?.floorName ||
                          room.floorName ||
                          `Floor ${room.floorId}`}
                      </div>
                    </div>

                    <span className="navPill">{roomType}</span>
                  </div>

                  <div className="searchResultDetails">
                    <p>
                      <strong>Faculty:</strong>{" "}
                      {details?.room?.faculty || room.faculty || "-"}
                    </p>

                    {details?.location && (
                      <p>
                        <strong>Coordinates:</strong> (
                        {Math.round(details.location.x)},{" "}
                        {Math.round(details.location.y)})
                      </p>
                    )}
                  </div>

                  {(roomType === "lecture" || roomType === "lab") && (
                    <div className="roomInfoBlock">
                      <h4 className="roomInfoTitle">Lectures in this room</h4>

                      {lectures.length === 0 ? (
                        <p className="roomInfoEmpty">
                          No lecture data found for this room.
                        </p>
                      ) : (
                        <div className="roomInfoList">
                          {lectures.map((item, idx) => (
                            <div key={idx} className="roomInfoItem">
                              <div className="roomInfoMain">
                                {item.courseName || item.courseCode}
                              </div>
                              <div className="roomInfoSub">
                                {item.day} | {item.startTime} - {item.endTime}
                              </div>
                              <div className="roomInfoSub">
                                {item.instructor || "Unknown instructor"}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {roomType === "office" && (
                    <div className="roomInfoBlock">
                      <h4 className="roomInfoTitle">
                        Professors in this office
                      </h4>

                      {professors.length === 0 ? (
                        <p className="roomInfoEmpty">
                          No professor is assigned to this office yet.
                        </p>
                      ) : (
                        <div className="roomInfoList">
                          {professors.map((prof) => (
                            <div key={prof.id} className="roomInfoItem">
                              <div className="roomInfoMain">
                                {prof.username}
                              </div>
                              <div className="roomInfoSub">{prof.email}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="searchResultActions">
                    <button
                      className="authBtn authBtnSecondary"
                      type="button"
                      onClick={() => navigate(`/navigate/${room.roomCode}`)}
                    >
                      Open Map
                    </button>

                    <button
                      className="authBtn authBtnEnter"
                      type="button"
                      onClick={() =>
                        navigate(`/navigate/${room.roomCode}?autoRoute=1`)
                      }
                    >
                      <span className="btnShine" />
                      Navigate
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
