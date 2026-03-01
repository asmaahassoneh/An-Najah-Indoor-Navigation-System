import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Stage,
  Layer,
  Image as KonvaImage,
  Line,
  Circle,
  Text,
} from "react-konva";
import useImage from "use-image";
import { mapsApi } from "../services/mapsApi";

export default function MapNavigate() {
  const { roomCode } = useParams();

  const [floors, setFloors] = useState([]);
  const [floor, setFloor] = useState(null);
  const [graph, setGraph] = useState({ nodes: [], edges: [] });

  const [start, setStart] = useState({ x: 120, y: 120 });

  const [route, setRoute] = useState([]);
  const [msg, setMsg] = useState("");
  const [segments, setSegments] = useState([]);
  const [segIndex, setSegIndex] = useState(0);
  const [roomLoc, setRoomLoc] = useState(null);
  const [startRoom, setStartRoom] = useState("");
  const [startMode, setStartMode] = useState("click");

  const [img] = useImage(floor?.imageUrl || "");

  useEffect(() => {
    (async () => {
      try {
        setMsg("");
        setRoute([]);

        const floorsRes = await mapsApi.floors();
        const list = floorsRes.data || [];
        setFloors(list);

        if (!list.length) {
          setFloor(null);
          setGraph({ nodes: [], edges: [] });
          setMsg("No floors available");
          return;
        }

        const locRes = await mapsApi.roomLocation(roomCode);
        const loc = locRes.data;
        setRoomLoc(loc);

        const chosen =
          list.find((f) => Number(f.id) === Number(loc.floorId)) || null;
        if (!chosen) {
          setFloor(null);
          setGraph({ nodes: [], edges: [] });
          setMsg(
            `Room found, but its floorId=${loc.floorId} not in floors list`,
          );
          return;
        }

        setFloor(chosen);

        const g = await mapsApi.floorGraph(chosen.id);
        setGraph(g.data || { nodes: [], edges: [] });

        setMsg(`Loaded floor: ${chosen.name}`);
      } catch (e) {
        setFloor(null);
        setGraph({ nodes: [], edges: [] });
        setRoomLoc(null);
        setMsg(e.response?.data?.error || "Failed to load room/floor/graph");
      }
    })();
  }, [roomCode]);

  const setStartFromRoom = async () => {
    try {
      setMsg("");
      const res = await mapsApi.roomLocation(startRoom.trim());
      const loc = res.data;

      const f = floors.find((x) => Number(x.id) === Number(loc.floorId));
      if (f) {
        setFloor(f);
        const g = await mapsApi.floorGraph(f.id);
        setGraph(g.data || { nodes: [], edges: [] });
      }

      setStart({ x: Number(loc.x), y: Number(loc.y) });
      setRoute([]);
      setStartMode("room");
      setMsg(`Start set near room ${loc.roomCode} ✅`);
    } catch (e) {
      setMsg(e.response?.data?.error || "Could not find that room location");
    }
  };

  const requestRoute = async () => {
    if (!floor?.id) return;

    setMsg("");
    setRoute([]);
    setSegments([]);
    setSegIndex(0);

    try {
      const res = await mapsApi.routeMulti({
        fromFloorId: floor.id,
        fromX: start.x,
        fromY: start.y,
        toRoom: roomCode,
        prefer: "elevator",
      });

      const segs = res.data?.segments || [];
      if (!segs.length) {
        setMsg("No route found");
        return;
      }

      setSegments(segs);
      setSegIndex(0);

      const first = segs[0];
      setRoute((first.points || []).flatMap((p) => [p.x, p.y]));
      setMsg(first.instruction || "Route ready ✅");

      const f = floors.find((x) => Number(x.id) === Number(first.floorId));
      if (f) {
        setFloor(f);
        const g = await mapsApi.floorGraph(f.id);
        setGraph(g.data || { nodes: [], edges: [] });
      }
    } catch (e) {
      setMsg(e.response?.data?.error || "No route found");
    }
  };

  const stageW = floor?.width || 1000;
  const stageH = floor?.height || 800;

  return (
    <div className="navPage">
      <div className="navWrap">
        <div className="navCard">
          <div className="navHeader">
            <div className="navTitleRow">
              <span className="navBadge">Navigation</span>

              <div className="navPills">
                <span className="navPill">
                  Graph: {graph.nodes.length} nodes / {graph.edges.length} edges
                </span>
                {floor?.name && (
                  <span className="navPill">Loaded: {floor.name}</span>
                )}
              </div>
            </div>

            <h2 className="navTitle">
              Navigate to <span className="navTitleCode">{roomCode}</span>
            </h2>
            <p className="navSub">
              {startMode === "click"
                ? "Click on the map to set your start point, then press “Route”."
                : "Start is set from a room. You can switch back to click mode."}
            </p>

            <div className="navControls">
              <div className="navGroup">
                <label className="navLabel">Floor</label>

                <div className="selectWrap" style={{ width: "100%" }}>
                  <select
                    className="selectControl"
                    value={floor?.id || ""}
                    onChange={async (e) => {
                      const f = floors.find(
                        (x) => x.id === Number(e.target.value),
                      );
                      setFloor(f || null);
                      setRoute([]);
                      setMsg("");

                      if (f) {
                        try {
                          const g = await mapsApi.floorGraph(f.id);
                          setGraph(g.data || { nodes: [], edges: [] });
                        } catch {
                          setGraph({ nodes: [], edges: [] });
                          setMsg("Failed to load graph");
                        }
                      } else {
                        setGraph({ nodes: [], edges: [] });
                      }
                    }}
                  >
                    <option value="" disabled>
                      Select floor
                    </option>
                    {floors.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                  <span className="selectChevron">▾</span>
                </div>

                <div className="navMeta">
                  Start: ({Math.round(start.x)}, {Math.round(start.y)})
                </div>
              </div>

              <div className="navGroup">
                <label className="navLabel">Start point</label>

                <div className="navRow">
                  <input
                    className="navInput"
                    placeholder="Closest room (e.g. 111170)"
                    value={startRoom}
                    onChange={(e) => setStartRoom(e.target.value)}
                  />

                  <button
                    className="navBtn navBtnPrimary"
                    type="button"
                    onClick={setStartFromRoom}
                  >
                    <span className="btnShine" />
                    Set start
                  </button>

                  <button
                    className={`navBtn navBtnSoft ${startMode === "click" ? "navBtnActive" : ""}`}
                    type="button"
                    onClick={() => {
                      setStartMode("click");
                      setMsg("Click on map to set start point");
                    }}
                  >
                    Use click mode
                  </button>
                </div>
              </div>

              <div className="navGroup navGroupActions">
                <label className="navLabel">Route</label>

                <div className="navRow navRowEnd">
                  <button
                    className="navBtn navBtnPrimary navBtnBig"
                    type="button"
                    onClick={requestRoute}
                  >
                    <span className="btnShine" />
                    Route
                  </button>

                  {segments.length > 1 && (
                    <div className="navStepRow">
                      <button
                        className="navBtn navBtnSoft"
                        type="button"
                        disabled={segIndex <= 0}
                        onClick={async () => {
                          const i = segIndex - 1;
                          const seg = segments[i];
                          setSegIndex(i);

                          const f = floors.find(
                            (x) => Number(x.id) === Number(seg.floorId),
                          );
                          if (f) {
                            setFloor(f);
                            const g = await mapsApi.floorGraph(f.id);
                            setGraph(g.data || { nodes: [], edges: [] });
                          }

                          setRoute(
                            (seg.points || []).flatMap((p) => [p.x, p.y]),
                          );
                          setMsg(seg.instruction || "");
                        }}
                      >
                        Previous
                      </button>

                      <button
                        className="navBtn navBtnPrimary"
                        type="button"
                        disabled={segIndex >= segments.length - 1}
                        onClick={async () => {
                          const i = segIndex + 1;
                          const seg = segments[i];
                          setSegIndex(i);

                          const f = floors.find(
                            (x) => Number(x.id) === Number(seg.floorId),
                          );
                          if (f) {
                            setFloor(f);
                            const g = await mapsApi.floorGraph(f.id);
                            setGraph(g.data || { nodes: [], edges: [] });
                          }

                          setRoute(
                            (seg.points || []).flatMap((p) => [p.x, p.y]),
                          );
                          setMsg(seg.instruction || "");
                        }}
                      >
                        Next step
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {!!msg && <div className="navToast">{msg}</div>}
          </div>

          <div className="navCanvasWrap">
            <div className="navCanvasInner">
              <Stage
                width={stageW}
                height={stageH}
                onMouseDown={(e) => {
                  if (startMode !== "click") return;
                  const pos = e.target.getStage()?.getPointerPosition();
                  if (!pos) return;
                  setStart({ x: pos.x, y: pos.y });
                  setRoute([]);
                  setMsg("Start point updated");
                }}
              >
                <Layer>
                  <KonvaImage
                    image={img}
                    x={0}
                    y={0}
                    width={stageW}
                    height={stageH}
                  />

                  <Circle x={start.x} y={start.y} radius={8} />
                  <Text
                    x={start.x + 10}
                    y={start.y - 8}
                    text="Start"
                    fontSize={14}
                  />

                  {roomLoc &&
                    floor?.id &&
                    Number(roomLoc.floorId) === Number(floor.id) && (
                      <>
                        <Circle x={roomLoc.x} y={roomLoc.y} radius={8} />
                        <Text
                          x={roomLoc.x + 10}
                          y={roomLoc.y - 8}
                          text={`Room ${roomCode}`}
                          fontSize={14}
                        />
                      </>
                    )}

                  {route.length >= 4 && (
                    <Line
                      points={route}
                      stroke="red"
                      strokeWidth={6}
                      lineCap="round"
                      lineJoin="round"
                    />
                  )}
                </Layer>
              </Stage>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
