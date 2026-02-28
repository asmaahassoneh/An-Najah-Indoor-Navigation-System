import { useEffect, useMemo, useState } from "react";
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

function guessFloorKeyFromRoomCode(roomCode) {
  if (roomCode?.toUpperCase().startsWith("G")) return "G";
  return "G";
}

export default function MapNavigate() {
  const { roomCode } = useParams();

  const [floors, setFloors] = useState([]);
  const [floor, setFloor] = useState(null);

  const [graph, setGraph] = useState({ nodes: [], edges: [] });

  const [start, setStart] = useState({ x: 120, y: 120 });

  const [route, setRoute] = useState([]);
  const [msg, setMsg] = useState("");

  const [img] = useImage(floor?.imageUrl || "");

  const floorKey = useMemo(
    () => guessFloorKeyFromRoomCode(roomCode),
    [roomCode],
  );

  useEffect(() => {
    (async () => {
      try {
        const res = await mapsApi.floors();
        const list = res.data || [];
        setFloors(list);

        const chosen = list.find((f) => f.key === floorKey) || list[0] || null;
        setFloor(chosen || null);

        if (chosen) {
          const g = await mapsApi.floorGraph(chosen.id);
          setGraph(g.data || { nodes: [], edges: [] });
        }
      } catch (e) {
        setMsg(e.response?.data?.error || "Failed to load floors/graph");
      }
    })();
  }, [floorKey]);

  const requestRoute = async () => {
    if (!floor?.id) return;

    setMsg("");
    setRoute([]);
    try {
      const res = await mapsApi.routeToRoom({
        floorId: floor.id,
        fromX: start.x,
        fromY: start.y,
        toRoom: roomCode,
      });

      const pts = (res.data?.points || []).flatMap((p) => [p.x, p.y]);
      setRoute(pts);
      setMsg("Route ready ✅");
    } catch (e) {
      setMsg(e.response?.data?.error || "No route found");
    }
  };

  const stageW = floor?.width || 1200;
  const stageH = floor?.height || 800;

  return (
    <div className="authPage">
      <div className="authGlow" />
      <div className="authNoise" />

      <div
        className="authCard authCardEnter"
        style={{ width: "min(1200px, 96vw)" }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            alignItems: "center",
          }}
        >
          <div>
            <div className="authBadge">Navigation</div>
            <div
              style={{
                display: "flex",
                gap: 10,
                alignItems: "center",
                marginTop: 10,
              }}
            >
              <select
                value={floor?.id || ""}
                onChange={(e) => {
                  const f = floors.find((x) => x.id === Number(e.target.value));
                  setFloor(f || null);
                  setRoute([]);
                  setMsg("");
                }}
                className="authInput"
                style={{ maxWidth: 260 }}
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

              <div style={{ opacity: 0.8, fontSize: 14 }}>
                Graph: {graph.nodes.length} nodes / {graph.edges.length} edges
              </div>
            </div>
            <h2 className="authTitle" style={{ marginBottom: 4 }}>
              Navigate to {roomCode}
            </h2>
            <p className="authSub" style={{ margin: 0 }}>
              Click on the map to set your start point, then press “Route”.
            </p>
          </div>

          <button className="authBtn" type="button" onClick={requestRoute}>
            <span className="btnShine" />
            Route
          </button>
        </div>

        {!!msg && (
          <p className="authMsg" style={{ marginTop: 10 }}>
            {msg}
          </p>
        )}

        <div style={{ marginTop: 12, overflow: "auto", borderRadius: 14 }}>
          <Stage
            width={stageW}
            height={stageH}
            onMouseDown={(e) => {
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

              {route.length >= 4 && (
                <Line
                  points={route}
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
  );
}
